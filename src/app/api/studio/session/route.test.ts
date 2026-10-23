import { afterEach, beforeEach, expect, it, vi } from "vitest";
const fixture = vi.hoisted(() => ({ client: vi.fn(), owner: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/studio/server", () => ({ studioClient: fixture.client, studioOwner: fixture.owner }));
const request = (origin = "https://northmob.example") => new Request("https://northmob.example/api/studio/session", { method: "POST", headers: { origin, "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ email: "owner@example.com", password: "fixture-only-password" }) });
beforeEach(() => {
  vi.resetModules();
  fixture.client.mockResolvedValue({ auth: { signInWithPassword: fixture.signIn, signOut: fixture.signOut } });
  fixture.signIn.mockResolvedValue({ error: null }); fixture.signOut.mockResolvedValue({ error: null });
});
afterEach(() => vi.clearAllMocks());
it("rejects cross-origin login before touching credentials", async () => { const { POST } = await import("./route"); expect((await POST(request("https://attacker.example"))).status).toBe(403); expect(fixture.client).not.toHaveBeenCalled(); });
it("returns unavailable without pretending a login succeeded when unconfigured", async () => { fixture.client.mockResolvedValue(null); const { POST } = await import("./route"); expect((await POST(request())).status).toBe(503); });
it("clears a signed-in non-owner session and uses a neutral failure redirect", async () => { fixture.owner.mockResolvedValue(null); const { POST } = await import("./route"); const response = await POST(request()); expect(response.headers.get("location")).toBe("https://northmob.example/studio/login?error=credentials"); expect(fixture.signOut).toHaveBeenCalled(); });
it("redirects only a verified owner to Studio after password authentication", async () => { fixture.owner.mockResolvedValue({ user: { id: "owner" } }); const { POST } = await import("./route"); const response = await POST(request()); expect(response.status).toBe(303); expect(response.headers.get("location")).toBe("https://northmob.example/studio"); });
