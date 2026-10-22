import { brevoConfigured, sendBrevoEnquiry } from "@/lib/brevo";
import { enquirySchema } from "@/lib/contact";

export const runtime = "nodejs";
// Per-process protection. A shared limiter is required before a multi-instance launch.
const requests = new Map<string, { count: number; expires: number }>();
function json(data: object, status: number, headers: Record<string, string> = {}) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ message: "Request origin not allowed." }, 403);
  const now = Date.now();
  for (const [key, value] of requests) if (value.expires <= now) requests.delete(key);
  // Do not trust client-supplied forwarding headers. This global process bucket
  // cannot be bypassed by rotating a spoofed IP address.
  const key = "enquiries";
  const limit = requests.get(key);
  if (limit && limit.count >= 10) return json({ message: "Too many enquiries. Please try again shortly." }, 429, { "Retry-After": String(Math.ceil((limit.expires - now) / 1000)) });
  requests.set(key, { count: (limit?.count ?? 0) + 1, expires: limit?.expires ?? now + 60000 });
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ message: "Expected a JSON enquiry." }, 415);
  if (Number(request.headers.get("content-length") ?? 0) > 20000) return json({ message: "Enquiry is too large." }, 413);
  let raw: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ message: "An enquiry is required." }, 400);
    let bytes = 0;
    const parts: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 20000) { await reader.cancel(); return json({ message: "Enquiry is too large." }, 413); }
      parts.push(value);
    }
    raw = JSON.parse(Buffer.concat(parts).toString("utf8"));
  } catch { return json({ message: "Invalid enquiry data." }, 400); }
  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) return json({ message: "Please check your enquiry.", errors: parsed.error.flatten().fieldErrors }, 400);
  const deliveryUrl = process.env.CONTACT_DELIVERY_URL;
  const deliveryToken = process.env.CONTACT_DELIVERY_TOKEN;
  if (!deliveryUrl || !deliveryToken || !deliveryUrl.startsWith("https://")) {
    if (!brevoConfigured()) return json({ message: "Enquiries are not open through this form yet." }, 503);
    try {
      const { website: _honeypot, ...enquiry } = parsed.data;
      void _honeypot;
      await sendBrevoEnquiry(enquiry);
      return json({ accepted: true }, 200);
    } catch { return json({ message: "We couldn’t submit your enquiry. Please try again later." }, 502); }
  }
  try {
    const { website: _honeypot, ...enquiry } = parsed.data;
    void _honeypot;
    const response = await fetch(deliveryUrl, { method: "POST", redirect: "error", headers: { "Content-Type": "application/json", Authorization: `Bearer ${deliveryToken}` }, body: JSON.stringify(enquiry), signal: AbortSignal.timeout(10000) });
    // The owner-controlled adapter must acknowledge actual delivery, not just receipt.
    const receipt = await response.json();
    if (!response.ok || receipt.delivered !== true) return json({ message: "Delivery could not be confirmed. Please try again later." }, 502);
    return json({ delivered: true }, 200);
  } catch { return json({ message: "Delivery is temporarily unavailable. Please try again later." }, 502); }
}
