import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";
for (const width of [1440, 390]) {
  test(`chapter links and artist discovery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockSpotify(page, true);
    await page.goto("/");
    await expect(page.locator("#home-statement")).toHaveText("THEMOB");
    const collective = page.getByRole("link", { name: "Explore THE MOB", exact: true });
    await expect(collective).toHaveAttribute("href", "/the-mob");
    await expect(page.locator(".home-artist-names span")).toHaveCount(4);
    await expect(page.locator(".home-visuals-scene .home-section-link")).toHaveAttribute("href", "/visuals");
    await collective.click();
    await expect(page).toHaveURL(/\/the-mob$/);
    await expect(page.locator("main > section").first()).toHaveClass("collective-story");
    await expect(page.locator(".artist-info p")).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Continue exploring" }).getByRole("link", { name: "Explore the Shop" })).toHaveAttribute("href", "/shop");
    await page.goto("/music");
    const artist = page.getByRole("button", { name: "Explore Focalistic on H4B" });
    await artist.click();
    const dialog = page.getByRole("dialog", { name: "Focalistic" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("gerr , ten");
    await expect(dialog).toContainText("camp , chair");
    await dialog.getByRole("link", { name: "Visuals" }).scrollIntoViewIfNeeded();
    await expect(dialog.getByRole("link", { name: "Visuals" })).toBeVisible();
    expect(await dialog.evaluate(node => node.scrollHeight >= node.clientHeight)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(artist).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
