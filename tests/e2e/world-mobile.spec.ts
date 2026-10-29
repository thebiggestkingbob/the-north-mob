import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test("mobile world starts and touch controls move the player", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/world-engine/index.html");
  await page.waitForFunction(() => typeof (window as any).__northMobWorldState === "function", { timeout: 30000 });
  const before = await page.evaluate(() => (window as any).__northMobWorldState());
  expect(before.ready).toBe(true);
  const up = page.locator("[data-key=w]");
  await expect(up).toBeVisible();
  await up.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "touch", isPrimary: true });
  await page.waitForTimeout(850);
  await up.dispatchEvent("pointerup", { pointerId: 1, pointerType: "touch", isPrimary: true });
  const after = await page.evaluate(() => (window as any).__northMobWorldState());
  expect(after.z).toBeLessThan(before.z);
  expect(page.url()).toContain("/world-engine/index.html");
  expect(errors).toEqual([]);
});

test("mobile interactions retain in-world navigation and low-cost rendering", async ({ page, request }) => {
  await page.goto("/world-engine/index.html");
  await page.waitForFunction(() => typeof (window as any).__northMobWorldState === "function", { timeout: 30000 });
  await expect(page.getByRole("button", { name: "VIEW" })).toBeVisible();
  await expect(page.locator("#interact")).toBeVisible();
  const source = await (await request.get("/world-engine/index.html")).text();
  expect(source).toContain("renderer.shadowMap.enabled=!mobileWorld");
  expect(source).toContain("const exhibit=interiors.near(x,z,elevation);if(exhibit)return exhibit");
  expect(source).not.toContain("OPEN OFFICIAL LINK");
});
