import { mockYouTube } from "./youtube-fixture";
import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";
test.beforeEach(async ({ page }) => { await mockSpotify(page); });
test("Home introduces Visualz and Shop as dedicated chapters with working routes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".home-experience > section")).toHaveCount(5);
  await expect(page.locator(".home-visuals-scene").getByRole("heading", { name: "VISUALZ" })).toBeVisible();
  await page.locator(".home-visuals-scene").getByRole("link", { name: "Explore Visualz" }).click();
  await expect(page).toHaveURL(/visuals$/);
  await page.goto("/");
  await page.locator(".home-shop-scene").getByRole("link", { name: "Visit the shop" }).click();
  await expect(page).toHaveURL(/shop$/);
  await expect(page.locator(".merch-polaroid")).toHaveCount(13);
});
test("Visualz keeps six official videos and the existing photo archive", async ({page})=>{
 await mockYouTube(page);await page.goto("/visuals");
 await expect(page.locator(".youtube-thumbnail")).toHaveCount(6);
 await expect(page.getByRole("heading",{name:"Photo archive"})).toBeVisible();
});
test("selected YouTube video is destroyed on close and focus returns",async({page})=>{
 await mockYouTube(page);await page.goto("/visuals");const trigger=page.locator(".youtube-thumbnail").first();await trigger.click();
 await expect(page.locator(".video-dialog iframe")).toBeVisible();await expect(page.locator(".video-dialog iframe")).toHaveAttribute("src",/s3Y4eAtF8jw/);
 await page.keyboard.press("Escape");await expect(page.locator(".video-dialog iframe")).toHaveCount(0);await expect(trigger).toBeFocused();
 await expect.poll(()=>page.evaluate(()=>(window as unknown as {__ytDestroys:number}).__ytDestroys)).toBe(1);
});
test("Shop keeps the shared cinematic identity, real signup and an honest catalogue state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/shop");
  const logo = await page.locator(".brand").boundingBox();
  expect(Math.abs(logo!.x + logo!.width / 2 - 720)).toBeLessThan(2);
  await expect(page.getByRole("heading", { level: 1, name: /OBJECTS.*MERCHANDISE/ })).toBeVisible();
  await expect(page.locator(".newsletter-signup")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Open cart/ })).toBeVisible();
  await expect(page.locator(".shop-page")).toContainText("no real orders");
});
