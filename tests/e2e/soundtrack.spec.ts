import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";

test("tries autoplay but waits for confirmed playback before showing sound on", async ({ page }) => {
  await mockSpotify(page, false); await page.goto("/");
  await expect(page.locator(".spotify-mount iframe")).toHaveCount(1);
  await expect(page.locator(".sound-panel")).not.toBeVisible();
  const logo = await page.locator(".brand").boundingBox();
  const player = await page.locator(".header-sound").boundingBox();
  expect(player!.x).toBeGreaterThan(logo!.x + logo!.width);
  expect(player!.x - logo!.x - logo!.width).toBeLessThan(40);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyPlays: number }).__spotifyPlays)).toBeGreaterThan(0);
  await expect(page.locator(".site-header").getByRole("button", { name: "Play soundtrack", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Enter with sound" })).toBeVisible();
});

test("one confirmed Spotify player persists through navigation and plays selected tracks in-page", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".site-header").getByRole("button", { name: "Pause soundtrack", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.locator(".desktop-nav").getByRole("link", { name: "Music", exact: true }).click();
  await expect(page).toHaveURL(/music$/);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyCreates: number }).__spotifyCreates)).toBe(1);
  await page.getByRole("button", { name: /Maatla Thata/ }).click();
  await expect(page).toHaveURL(/music$/);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyUri: string }).__spotifyUri)).toBe("spotify:track:3HdLERcMc38Yq5UDnCFGf3");
  await page.getByRole("button", { name: /Camp Chair/ }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyUri: string }).__spotifyUri)).toBe("spotify:track:0qmPvb3cGQpSN5chcx6djF");
  await expect(page.locator(".spotify-mount iframe")).toHaveCount(1);
});

test("sound off unloads the player and respects that choice on reload", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".site-header").getByRole("button", { name: "Pause soundtrack", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show Spotify player" }).click();
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.locator(".spotify-mount iframe")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".spotify-mount iframe")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enter with sound" })).toBeVisible();
});

test("opening a film pauses the background soundtrack", async ({ page }) => {
  await mockSpotify(page, true); await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({ body: "Video test fixture" }));
  await page.goto("/visuals"); await expect(page.locator(".site-header").getByRole("button", { name: "Pause soundtrack", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Play official THE NORTH MOB film" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyPauses: number }).__spotifyPauses)).toBeGreaterThan(0);
  await expect(page.locator(".site-header").getByRole("button", { name: "Play soundtrack", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("blocked Spotify script leaves an in-site native fallback without claiming playback", async ({ page }) => {
  await mockSpotify(page, false);
  await page.route("https://open.spotify.com/embed/iframe-api/v1", route => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Show Spotify player" }).click();
  await expect(page.getByTitle("THE NORTH MOB Spotify fallback player")).toBeVisible();
  await expect(page.locator(".spotify-mount")).not.toBeVisible();
  await expect(page.locator(".site-header").getByRole("button", { name: "Play soundtrack", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Reconnect Spotify", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.locator(".sound-panel iframe")).toHaveCount(0);
});

test("Home ripple animates the full logo, is absent elsewhere and respects reduced motion", async ({ page }) => {
  await mockSpotify(page, false); await page.goto("/");
  await expect(page.getByRole("button", { name: /motion/i })).toHaveCount(0);
  await expect(page.locator(".home-logo-heading img")).toHaveAttribute("src", "/assets/official-logo-transparent.png");
  await expect(page.locator(".hero-photo")).toHaveCount(0);
  await expect(page.locator(".water-ripple")).toHaveCount(1);
  await expect(page.locator(".water-ripple")).toHaveAttribute("data-ready", "true");
  await page.mouse.move(1000, 500);
  await expect(page.locator(".water-ripple")).toHaveAttribute("data-ready", "true");
  await page.locator(".desktop-nav").getByRole("link", { name: "Music", exact: true }).click();
  await expect(page).toHaveURL(/music$/);
  await expect(page.locator(".water-ripple")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/");
  await expect(page.locator(".water-ripple")).not.toHaveAttribute("data-ready", "true");
  await expect(page.locator(".water-ripple")).not.toBeVisible();
  expect(await page.locator(".ring-breathe").evaluate(element => getComputedStyle(element).transform)).toBe("none");
});

test("the full brand wipe stays visible before revealing the next page", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  const started = Date.now();
  await page.getByRole("link", { name: /Explore the Mob/ }).click();
  await expect(page).toHaveURL(/the-mob$/);
  expect(Date.now() - started).toBeGreaterThan(800);
  const veil = page.locator(".transition-veil");
  await expect(veil).toHaveCSS("pointer-events", "auto");
  await expect(veil).toHaveCSS("pointer-events", "none", { timeout: 4000 });
});

test("the header dropdown closes with Escape and returns focus", async ({ page }) => {
  await mockSpotify(page); await page.goto("/");
  const button = page.getByRole("button", { name: "Show Spotify player" });
  await button.click(); await expect(button).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(button).toBeFocused(); await expect(button).toHaveAttribute("aria-expanded", "false");
});
