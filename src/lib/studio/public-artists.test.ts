import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const fixture = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: fixture.create }));
import { publishedArtists } from "./public-artists";
beforeEach(() => { vi.stubEnv("SUPABASE_URL", "https://fixture.supabase.co"); vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "fixture-publishable"); });
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
function result(data: unknown, error: unknown = null) {
  const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockReturnValueOnce(null) };
  const order = vi.fn().mockReturnValueOnce({ order: vi.fn().mockResolvedValue({ data, error }) });
  fixture.create.mockReturnValue({ from: () => ({ ...query, order }) });
  return query;
}
it("does not resurrect archived static profiles when a configured database is unavailable", async () => { result(null, new Error("unavailable")); expect(await publishedArtists()).toEqual({ artists: [], unavailable: true }); });
it("respects an intentionally empty published catalogue", async () => { result([]); expect(await publishedArtists()).toEqual({ artists: [], unavailable: false }); });
it("retains all four approved profiles before database configuration", async()=>{vi.stubEnv("SUPABASE_URL","");const result=await publishedArtists();expect(result.artists).toHaveLength(4);expect(result.unavailable).toBe(false);});
it("upgrades supplied legacy portrait paths but preserves Studio-selected alternatives",async()=>{
 result([{slug:"trophy",name:"Trophy",portrait:"/assets/artists/trophy.webp",position:"43% 65%"},{slug:"majoricey",name:"MajorIcey",portrait:"/assets/another-approved.webp",position:"30% 60%"}]);
 const data=await publishedArtists();expect(data.artists[0].portrait).toBe("/assets/artists/trophy-2026.webp");expect(data.artists[0].position).toBe("50% 50%");expect(data.artists[1].portrait).toBe("/assets/another-approved.webp");
});
