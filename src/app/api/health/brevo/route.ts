import { brevoConfigured, checkBrevoConnection } from "@/lib/brevo";
import { allowRequest } from "@/lib/form-request";
export const runtime = "nodejs";
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  if (!allowRequest("brevo-health", 3)) return Response.json({ message: "Try again shortly." }, { status: 429, headers });
  if (!brevoConfigured()) return Response.json({ configured: false, connected: false }, { status: 503, headers });
  try {
    const connected = await checkBrevoConnection();
    return Response.json({ configured: true, connected }, { status: connected ? 200 : 502, headers });
  } catch { return Response.json({ configured: true, connected: false }, { status: 502, headers }); }
}
