import { studioClient, studioOwner } from "@/lib/studio/server";
import { allowRequest, boundedText, privateJson, requestOrigin, sameOrigin } from "@/lib/studio/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ message: "Request origin not allowed." }, 403);
  if (!allowRequest("studio-login", 10)) return privateJson({ message: "Please wait before trying again." }, 429);
  if (!request.headers.get("content-type")?.includes("application/x-www-form-urlencoded")) return privateJson({ message: "Invalid form." }, 415);
  const client = await studioClient();
  if (!client) return privateJson({ message: "Studio is not connected yet." }, 503);
  let form: URLSearchParams;
  try { form = new URLSearchParams(await boundedText(request, 4096)); } catch { return privateJson({ message: "Invalid form." }, 400); }
  const email = form.get("email")?.trim() ?? "", password = form.get("password") ?? "";
  if (!email || email.length > 254 || !password || password.length > 1024) return Response.redirect(new URL("/studio/login?error=credentials", requestOrigin(request)), 303);
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error || !await studioOwner()) {
    await client.auth.signOut();
    return Response.redirect(new URL("/studio/login?error=credentials", requestOrigin(request)), 303);
  }
  return Response.redirect(new URL("/studio", requestOrigin(request)), 303);
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return privateJson({ message: "Request origin not allowed." }, 403);
  const client = await studioClient();
  if (!client) return privateJson({ message: "Studio is not connected yet." }, 503);
  const { error } = await client.auth.signOut({ scope: "local" });
  return error ? privateJson({ message: "Could not sign out. Please retry." }, 502) : privateJson({ signedOut: true });
}
