import { z } from "zod";
import { brevoConfigured, subscribeWithBrevo } from "@/lib/brevo";
import { allowRequest, readSmallJson } from "@/lib/form-request";
export const runtime = "nodejs";
const schema = z.object({ email: z.email().max(254), consent: z.literal(true), website: z.string().max(0).optional().default("") });
const json = (data: object, status: number) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ message: "Request origin not allowed." }, 403);
  if (!allowRequest("newsletter")) return json({ message: "Please wait a minute before trying again." }, 429);
  let raw;
  try { raw = await readSmallJson(request); } catch { return json({ message: "Please check your signup details." }, 400); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ message: "Enter a valid email and agree to receive updates." }, 400);
  if (!brevoConfigured()) return json({ message: "Signup is temporarily unavailable. Please try again later." }, 503);
  try {
    await subscribeWithBrevo(parsed.data.email);
    return json({ accepted: true, message: "Thanks—your request has been received. You can unsubscribe in any update." }, 200);
  } catch { return json({ message: "We couldn’t complete your signup. Please try again later." }, 502); }
}
