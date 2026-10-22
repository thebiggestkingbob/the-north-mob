import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";
test.beforeEach(async ({ page }) => { await mockSpotify(page); });
test("signup requires consent and submits only to the same-origin API", async ({ page }) => {
  const requests: unknown[] = [];
  await page.route("**/api/newsletter", route => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({ json: { accepted: true, message: "Your request has been received." } });
  });
  await page.goto("/music");
  const form = page.getByRole("form", { name: "Get North Mob updates" });
  await form.getByRole("textbox", { name: "Email" }).fill("visitor@example.com");
  await form.getByRole("button", { name: "Join the mailing list" }).click();
  expect(requests).toHaveLength(0);
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Join the mailing list" }).click();
  await expect(form.getByRole("status")).toHaveText("Your request has been received.");
  expect(requests).toEqual([{ email: "visitor@example.com", consent: true, website: "" }]);
  await expect(form.getByRole("textbox", { name: "Email" })).toBeEmpty();
});
test("a provider failure preserves signup details and never reports success", async ({ page }) => {
  await page.route("**/api/newsletter", route => route.fulfill({ status: 502, json: { message: "We couldn’t complete your signup. Please try again later." } }));
  await page.goto("/live");
  const form = page.getByRole("form", { name: "Get North Mob updates" });
  await form.getByRole("textbox", { name: "Email" }).fill("visitor@example.com");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Join the mailing list" }).click();
  await expect(form.getByRole("status")).toContainText("couldn’t complete");
  await expect(form.getByRole("textbox", { name: "Email" })).toHaveValue("visitor@example.com");
  await expect(form.getByRole("checkbox")).toBeChecked();
});
