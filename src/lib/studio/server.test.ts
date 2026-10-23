import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const fixture = vi.hoisted(() => ({ getUser: vi.fn(), create: vi.fn(), cookies: vi.fn(), from: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: fixture.create }));
vi.mock("next/headers", () => ({ cookies: fixture.cookies }));
beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "https://northmob-fixture.supabase.co");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "fixture-only-publishable");
  fixture.cookies.mockResolvedValue({ getAll: () => [], set: vi.fn() });
  fixture.create.mockReturnValue({ auth: { getUser: fixture.getUser }, from: fixture.from });
});
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("Studio owner authorization", () => {
  it("fails closed when configuration is absent", async () => {
    vi.stubEnv("SUPABASE_URL", ""); const { studioOwner } = await import("./server");
    expect(await studioOwner()).toBeNull(); expect(fixture.getUser).not.toHaveBeenCalled();
  });
  it("rejects invalid sessions before querying membership", async () => {
    fixture.getUser.mockResolvedValue({ data: { user: null }, error: new Error("invalid") });
    const { studioOwner } = await import("./server"); expect(await studioOwner()).toBeNull(); expect(fixture.from).not.toHaveBeenCalled();
  });
  it("rejects an unverified email before membership lookup", async () => {
    fixture.getUser.mockResolvedValue({ data: { user: { id: "owner", email_confirmed_at: null } }, error: null });
    const { studioOwner } = await import("./server"); expect(await studioOwner()).toBeNull(); expect(fixture.from).not.toHaveBeenCalled();
  });
  it("never grants access from user-editable owner metadata", async () => {
    fixture.getUser.mockResolvedValue({ data: { user: { id: "visitor", email_confirmed_at: "2026-10-23", user_metadata: { role: "owner" } } }, error: null });
    const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
    fixture.from.mockReturnValue(query);
    const { studioOwner } = await import("./server"); expect(await studioOwner()).toBeNull(); expect(query.eq).toHaveBeenCalledWith("active", true); expect(query.eq).toHaveBeenCalledWith("user_id", "visitor");
  });
  it("requires verified email and active owner membership on every operation", async () => {
    fixture.getUser.mockResolvedValue({ data: { user: { id: "owner", email_confirmed_at: "2026-10-23" } }, error: null });
    const lookup = vi.fn().mockResolvedValueOnce({ data: { user_id: "owner" }, error: null }).mockResolvedValueOnce({ data: null, error: null });
    fixture.from.mockReturnValue({ select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: lookup });
    const { studioOwner } = await import("./server"); expect((await studioOwner())?.user.id).toBe("owner"); expect(await studioOwner()).toBeNull();
  });
});
