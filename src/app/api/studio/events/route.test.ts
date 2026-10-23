import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const fixture = vi.hoisted(() => ({ owner: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/studio/server", () => ({ studioOwner: fixture.owner }));
vi.mock("next/cache", () => ({ revalidatePath: fixture.revalidate }));
const event = { name: "Approved event", date: "2026-10-31", venue: "Approved venue", ticket_url: "", status: "draft" };
function request(body: unknown = event, origin = "https://northmob.example") { return new Request("https://northmob.example/api/studio/events", { method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify(body) }); }
beforeEach(() => vi.resetModules());
afterEach(() => vi.clearAllMocks());
describe("Studio event write boundary", () => {
  it("rejects cross-origin writes before authenticating", async () => { const { POST } = await import("./route"); expect((await POST(request(event, "https://attacker.example"))).status).toBe(403); expect(fixture.owner).not.toHaveBeenCalled(); });
  it("requires owner authorization independently of page guards", async () => { fixture.owner.mockResolvedValue(null); const { POST } = await import("./route"); expect((await POST(request())).status).toBe(401); });
  it("rejects invalid content before a database write", async () => { const from = vi.fn(); fixture.owner.mockResolvedValue({ user: { id: "owner" }, client: { from } }); const { POST } = await import("./route"); expect((await POST(request({ ...event, date: "2026-02-30" }))).status).toBe(400); expect(from).not.toHaveBeenCalled(); });
  it("saves only validated fields and invalidates the Live page after acknowledgement", async () => {
    const insert = vi.fn().mockReturnThis(), select = vi.fn().mockReturnThis(), maybeSingle = vi.fn().mockResolvedValue({ data: { id: "record", version: 1 }, error: null });
    fixture.owner.mockResolvedValue({ user: { id: "owner" }, client: { from: () => ({ insert, select, maybeSingle }) } });
    const { POST } = await import("./route"); expect((await POST(request())).status).toBe(200); expect(insert).toHaveBeenCalledWith({ ...event, ticket_url: null }); expect(fixture.revalidate).toHaveBeenCalledWith("/live");
  });
  it("returns a conflict without publishing or overwriting when the version is stale", async () => {
    const query = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
    fixture.owner.mockResolvedValue({ user: { id: "owner" }, client: { from: () => query } });
    const { POST } = await import("./route"); expect((await POST(request({ ...event, id: "00000000-0000-4000-8000-000000000001", version: 2 }))).status).toBe(409); expect(query.eq).toHaveBeenCalledWith("version", 2); expect(fixture.revalidate).not.toHaveBeenCalled();
  });
});
