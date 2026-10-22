import { afterEach, beforeEach, expect, it, vi } from "vitest";
beforeEach(() => { vi.resetModules(); vi.stubEnv("BREVO_API_KEY", ""); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it("reports missing credentials without contacting Brevo", async () => {
  const { GET } = await import("./route");
  expect(await (await GET()).json()).toEqual({ configured: false, connected: false });
});
it("verifies credentials without exposing account data or sending mail", async () => {
  vi.stubEnv("BREVO_API_KEY", "fixture-only-key");
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ email: "private@example.com", plan: [] }));
  vi.stubGlobal("fetch", fetchMock);
  const { GET } = await import("./route");
  expect(await (await GET()).json()).toEqual({ configured: true, connected: true });
  expect(fetchMock.mock.calls[0][0]).toBe("https://api.brevo.com/v3/account");
  expect(fetchMock.mock.calls[0][1].method).toBe("GET");
});
