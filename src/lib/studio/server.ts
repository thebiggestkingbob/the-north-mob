import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { studioConfig } from "./config";
export async function studioClient() {
  const config = studioConfig();
  if (!config) return null;
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    cookies: {
      getAll: () => store.getAll(),
      setAll: items => { try { items.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Server Components are read-only; the Studio proxy refreshes cookies. */ } },
    },
  });
}
export async function studioOwner() {
  const client = await studioClient();
  if (!client) return null;
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || !data.user.email_confirmed_at) return null;
  // Membership is checked from the database on every operation, not user metadata.
  const { data: membership, error: denied } = await client.from("staff_members").select("user_id").eq("user_id", data.user.id).eq("role", "owner").eq("active", true).maybeSingle();
  return !denied && membership ? { client, user: data.user } : null;
}
