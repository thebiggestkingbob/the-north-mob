import { expect, it } from "vitest";
import { sameOrigin, requestOrigin } from "./http";
it("accepts the routed Host when Next normalizes the internal URL", () => {
  const request = new Request("http://localhost:3000/api/studio/events", { headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" } });
  expect(sameOrigin(request)).toBe(true);
  expect(requestOrigin(request)).toBe("http://127.0.0.1:3000");
});
it("does not trust x-forwarded-host to bypass same-origin validation", () => {
  const request = new Request("https://northmob.example/api/studio/events", { headers: { host: "northmob.example", origin: "https://attacker.example", "x-forwarded-host": "attacker.example" } });
  expect(sameOrigin(request)).toBe(false);
});
it("rejects an invalid host authority", () => {
  const request = new Request("https://northmob.example/api/studio/events", { headers: { host: "attacker.example/path", origin: "https://attacker.example" } });
  expect(sameOrigin(request)).toBe(false);
});
