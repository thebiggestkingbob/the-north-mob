export function privateJson(data: unknown, status = 200) { return Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } }); }
export function requestOrigin(request: Request) {
  const url = new URL(request.url);
  // Next's proxy can normalize the internal URL to localhost. Host remains the
  // routed request authority; do not trust client-supplied x-forwarded-host.
  const host = request.headers.get("host");
  if (host) {
    url.host = host;
    if (url.host !== host.toLowerCase()) throw new Error("Invalid request host");
  }
  return url.origin;
}
export function sameOrigin(request: Request) {
  try { return request.headers.get("origin") === requestOrigin(request); } catch { return false; }
}
// Local/process limit only. Replace with shared enforcement before public launch.
const buckets = new Map<string, { count: number; expires: number }>();
export function allowRequest(key: string, maximum: number) {
  const now = Date.now();
  for (const [key, value] of buckets) if (value.expires <= now) buckets.delete(key);
  const value = buckets.get(key);
  if (value && value.count >= maximum) return false;
  buckets.set(key, { count: (value?.count ?? 0) + 1, expires: value?.expires ?? now + 60000 });
  return true;
}
export async function boundedText(request: Request, maximum: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const parts: Uint8Array[] = []; let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maximum) { await reader.cancel(); throw new Error("Body too large"); }
    parts.push(value);
  }
  return Buffer.concat(parts).toString("utf8");
}
