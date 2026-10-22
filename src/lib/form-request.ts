// A global per-process bucket is deliberately independent of spoofable client IPs.
// Multi-instance deployments should also enforce a shared/provider-level limit.
const buckets = new Map<string, { count: number; expires: number }>();
export function allowRequest(key: string, maximum = 10) {
  const now = Date.now();
  for (const [name, value] of buckets) if (value.expires <= now) buckets.delete(name);
  const current = buckets.get(key);
  if (current && current.count >= maximum) return false;
  buckets.set(key, { count: (current?.count ?? 0) + 1, expires: current?.expires ?? now + 60000 });
  return true;
}
export async function readSmallJson(request: Request, maximum = 4096): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new Error("Expected JSON");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = []; let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maximum) { await reader.cancel(); throw new Error("Body too large"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
