import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
beforeEach(() => { vi.resetModules(); vi.stubEnv("BREVO_API_KEY", "fixture-only-key"); vi.stubEnv("BREVO_LIST_ID", ""); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("Brevo subscriber integration", () => {
  it("creates a dedicated list and adds a consented address without altering blacklist flags", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({}, { status: 404 }))
      .mockResolvedValueOnce(Response.json({ lists: [{ id: 2, name: "Unrelated list" }] }))
      .mockResolvedValueOnce(Response.json({ id: 7 }, { status: 201 }))
      .mockResolvedValueOnce(Response.json({ id: 20 }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const { subscribeWithBrevo } = await import("./brevo");
    await subscribeWithBrevo("visitor@example.com");
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ name: "THE NORTH MOB — Website", folderId: 1 });
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ email: "visitor@example.com", listIds: [7], updateEnabled: true });
    expect(fetchMock.mock.calls[3][1].headers["api-key"]).toBe("fixture-only-key");
  });
  it("reuses the North Mob list and supports an existing contact", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ emailBlacklisted: false }))
      .mockResolvedValueOnce(Response.json({ lists: [{ id: 7, name: "THE NORTH MOB — Website" }] }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const { subscribeWithBrevo } = await import("./brevo");
    await expect(subscribeWithBrevo("visitor@example.com")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
  it("does not modify a suppressed address", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ emailBlacklisted: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { subscribeWithBrevo } = await import("./brevo");
    await subscribeWithBrevo("visitor@example.com");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("propagates a provider rejection without declaring a subscription", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({}, { status: 401 })));
    const { subscribeWithBrevo } = await import("./brevo");
    await expect(subscribeWithBrevo("visitor@example.com")).rejects.toThrow();
  });
});
