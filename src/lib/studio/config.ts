export function studioConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try { if (new URL(url).protocol !== "https:" && !(process.env.NODE_ENV !== "production" && /^http:\/\/127\.0\.0\.1:\d+$/.test(url))) return null; } catch { return null; }
  return { url, key };
}
