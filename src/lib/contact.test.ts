import { describe, expect, it } from "vitest";
import { enquirySchema } from "./contact";
const valid = { name: "Test Visitor", email: "visitor@example.com", type: "Bookings", message: "Please share booking availability.", consent: true, website: "" };
describe("enquiry validation", () => {
  it("accepts a legitimate enquiry and trims text", () => { expect(enquirySchema.parse({ ...valid, name: "  Test Visitor  " }).name).toBe("Test Visitor"); });
  it.each([{ email: "invalid" }, { consent: false }, { website: "spam.example" }, { message: "short" }, { type: "unknown" }, { message: "a".repeat(5001) }])("rejects unsafe or incomplete submissions: %j", (override) => { expect(enquirySchema.safeParse({ ...valid, ...override }).success).toBe(false); });
});

it("retains optional booking details while rejecting oversized and invalid dates", () => {
  const details = { eventDate: "2026-10-31", location: "Pretoria", budget: "To be discussed" };
  expect(enquirySchema.parse({ ...valid, ...details })).toMatchObject(details);
  expect(enquirySchema.safeParse({ ...valid, eventDate: "invalid" }).success).toBe(false);
  expect(enquirySchema.safeParse({ ...valid, location: "a".repeat(201) }).success).toBe(false);
});
