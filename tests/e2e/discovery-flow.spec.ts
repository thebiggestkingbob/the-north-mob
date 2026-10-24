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
    const dialog = page.getByRole("dialog", { name: "H4B featured artists" });
    await expect(dialog).toBeVisible();
    const focalistic=dialog.getByRole("article",{name:"Focalistic",exact:true});
    await expect(focalistic).toContainText("gerr , ten");
    await expect(focalistic).toContainText("camp , chair");
    await focalistic.getByRole("button",{name:/Pause camp , chair/}).click();
    await focalistic.getByRole("button",{name:/Play camp , chair/}).click();
    await expect(focalistic.getByRole("button",{name:/Pause camp , chair/})).toBeVisible();
    await dialog.getByRole("button",{name:"Next artist →",exact:true}).click();
    await expect(dialog.getByRole("article",{name:"Young Stunna",exact:true})).toBeInViewport();
    expect(await dialog.evaluate(node => node.scrollHeight >= node.clientHeight)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(artist).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
