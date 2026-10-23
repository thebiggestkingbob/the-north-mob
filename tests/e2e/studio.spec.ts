import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";
test("unconfigured Studio fails closed without exposing owner data or starting audio", async ({ page }) => {
  await mockSpotify(page, true);
  await page.goto("/studio/events");
  await expect(page).toHaveURL(/studio\/login$/);
  await expect(page.getByRole("heading", { name: "STUDIO", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Studio is not connected yet");
  await expect(page.locator(".header-sound,.spotify-mount iframe")).toHaveCount(0);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  const response = await page.request.post("/api/studio/events", { headers: { origin: "http://127.0.0.1:3000" }, data: { name: "Unauthorized", date: "2026-10-31", venue: "Test" } });
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
});
test("Studio rejects cross-origin session and event writes", async ({ request }) => {
  for (const endpoint of ["session", "events", "artists"]) {
    const response = await request.post(`/api/studio/${endpoint}`, { headers: { origin: "https://other.example" }, data: {} });
    expect(response.status()).toBe(403);
  }
});

test("artist management requires an owner session", async ({page,request})=>{
 await page.goto("/studio/artists");
 await expect(page).toHaveURL(/studio\/login$/);
 const response=await request.post("/api/studio/artists",{headers:{origin:"http://127.0.0.1:3000"},data:{name:"Unauthorized"}});
 expect(response.status()).toBe(401);
});
