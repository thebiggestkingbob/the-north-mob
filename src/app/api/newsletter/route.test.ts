import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const valid = { email: "visitor@example.com", consent: true, website: "" };
const request = (data: unknown = valid, origin = "http://localhost") => new Request("http://localhost/api/newsletter", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(data) });
beforeEach(() => { vi.resetModules(); vi.stubEnv("BREVO_API_KEY", ""); vi.stubEnv("BREVO_LIST_ID", "7"); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe("newsletter consent and provider boundary", () => {
  it.each([{ email: "invalid" }, { consent: false }, { website: "spam" }])("rejects invalid consent or data %j before contacting Brevo", async change => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");
    expect((await POST(request({ ...valid, ...change }))).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects cross-origin submissions", async () => {
    const { POST } = await import("./route");
    expect((await POST(request(valid, "https://other.example"))).status).toBe(403);
  });
  it("reports unavailable when the key is absent", async () => {
    const { POST } = await import("./route");
    expect((await POST(request())).status).toBe(503);
  });
  it("returns accepted only after successful Brevo acknowledgement", async () => {
    vi.stubEnv("BREVO_API_KEY", "fixture-only-key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json({}, { status: 404 })).mockResolvedValueOnce(Response.json({ id: 1 }, { status: 201 })));
    const { POST } = await import("./route");
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect((await response.json()).accepted).toBe(true);
  });
  it("limits oversized bodies and repeated requests", async () => {
    const { POST } = await import("./route");
    expect((await POST(request({ ...valid, website: "x".repeat(5000) }))).status).toBe(400);
    for (let i = 0; i < 9; i++) await POST(request());
    expect((await POST(request())).status).toBe(429);
  });
});
