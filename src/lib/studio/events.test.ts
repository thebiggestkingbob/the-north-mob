import { describe, expect, it } from "vitest";
import { eventSchema } from "./events";
const event = { name: "Approved event", date: "2026-10-31", venue: "Approved venue", ticket_url: "", status: "draft" };
describe("Studio event validation", () => {
  it("accepts unknown performance times and ticket URLs without inventing details", () => { expect(eventSchema.parse(event)).toEqual(event); });
  it.each([{ date: "2026-02-30" }, { date: "invalid" }, { ticket_url: "javascript:alert(1)" }, { ticket_url: "http://unverified.example" }, { status: "other" }, { name: "" }, { injected: "field" }, { id: "00000000-0000-4000-8000-000000000001" }])("rejects unsafe or incomplete edits: %j", override => { expect(eventSchema.safeParse({ ...event, ...override }).success).toBe(false); });
  it("requires a known version for an existing record", () => { expect(eventSchema.safeParse({ ...event, id: "00000000-0000-4000-8000-000000000001", version: 2 }).success).toBe(true); });
});
