import { describe, expect, it } from "vitest";
import { enquirySchema } from "./contact";
const valid = { name: "Test Visitor", email: "visitor@example.com", type: "Bookings", message: "Please share booking availability.", consent: true, website: "" };
describe("enquiry validation", () => {
  it("accepts a legitimate enquiry and trims text", () => { expect(enquirySchema.parse({ ...valid, name: "  Test Visitor  " }).name).toBe("Test Visitor"); });
  it.each([{ email: "invalid" }, { consent: false }, { website: "spam.example" }, { message: "short" }, { type: "unknown" }, { message: "a".repeat(5001) }])("rejects unsafe or incomplete submissions: %j", (override) => { expect(enquirySchema.safeParse({ ...valid, ...override }).success).toBe(false); });
});
