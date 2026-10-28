import { test, expect } from "@playwright/test";

test.describe("THE NORTH MOB WORLD", () => {
  test("world route opens the engine without a blocked iframe", async ({ page }) => {
    await page.goto("/world");
    await expect(page).toHaveURL(/\/world-engine\/index\.html$/);
    await expect(page.getByRole("link", { name: "EXIT WORLD" })).toHaveAttribute("href", "/");
  });

  test("3D entry no longer asks for a character", async ({ page }) => {
    await page.goto("/world-engine/index.html");
    await expect(page.getByText("CHOOSE YOUR CHARACTER")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "TROPHY" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "EXIT WORLD" })).toBeVisible();
  });

  test("world shop displays products from the canonical merchandise catalogue", async ({ page }) => {
    await page.goto("/world/catalog");
    await expect(page.getByRole("heading", { name: "MOB SHOP" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mob Hoodie" })).toBeVisible();
    await expect(page.getByText("R599", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "VIEW IN OFFICIAL SHOP" }).first()).toHaveAttribute("href", "/shop");
  });

  test("museum and cinema routes load the published media interface", async ({ page }) => {
    await page.goto("/world/visualz?mode=museum");
    await expect(page.getByRole("heading", { name: "MOB MUSEUM" })).toBeVisible();
    await page.goto("/world/visualz?mode=cinema");
    await expect(page.getByRole("heading", { name: "VISUALS CINEMA" })).toBeVisible();
  });

  test("studio and live yard render published-content shells", async ({ page }) => {
    await page.goto("/world/studio");
    await expect(page.getByRole("heading", { name: "THE STUDIO" })).toBeVisible();
    await page.goto("/world/live");
    await expect(page.getByRole("heading", { name: "LIVE YARD" })).toBeVisible();
  });
});
