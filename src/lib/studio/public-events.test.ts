import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const fixture = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: fixture.create }));
import { publishedEvents } from "./public-events";
beforeEach(() => { vi.stubEnv("SUPABASE_URL", "https://fixture.supabase.co"); vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "fixture-publishable"); });
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
function result(data: unknown, error: unknown = null) {
  const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnValueOnce(null) };
  const order = vi.fn().mockReturnValueOnce({ order: vi.fn().mockResolvedValue({ data, error }) });
  fixture.create.mockReturnValue({ from: () => ({ ...query, order }) });
  return query;
}
it("does not resurrect archived static gigs when a configured database is unavailable", async () => { result(null, new Error("unavailable")); expect(await publishedEvents()).toEqual({ events: [], unavailable: true }); });
it("respects an intentionally empty published catalogue", async () => { result([]); expect(await publishedEvents()).toEqual({ events: [], unavailable: false }); });
it("projects only the fields needed by Live and requests published events", async () => { const query = result([{ name: "Approved event", date: "2026-10-31", venue: "Approved venue", ticket_url: null }]); expect(await publishedEvents()).toEqual({ events: [{ name: "Approved event", date: "2026-10-31", venue: "Approved venue" }], unavailable: false }); expect(query.eq).toHaveBeenCalledWith("status", "published"); });
