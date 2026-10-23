import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { studioConfig } from "@/lib/studio/config";
export async function proxy(request: NextRequest) {
  const config = studioConfig();
  let response = NextResponse.next({ request });
  if (config) {
    const client = createServerClient(config.url, config.key, {
      cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: items => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    // This verifies/refreshes authentication; each page and API separately authorizes ownership.
    await client.auth.getUser();
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = { matcher: ["/studio/:path*", "/api/studio/:path*"] };
