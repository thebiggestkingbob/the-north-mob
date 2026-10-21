import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";

test("tries autoplay but waits for confirmed playback before showing sound on", async ({ page }) => {
  await mockSpotify(page, false); await page.goto("/");
  await expect(page.locator(".spotify-mount iframe")).toBeVisible();
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
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.locator(".sound-dock")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".sound-dock")).toHaveCount(0);
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
  await expect(page.getByTitle("THE NORTH MOB Spotify fallback player")).toBeVisible();
  await expect(page.locator(".site-header").getByRole("button", { name: "Play soundtrack", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.locator(".sound-dock iframe")).toHaveCount(0);
});

test("ambient motion can be paused and stays off for reduced-motion visitors", async ({ page }) => {
  await mockSpotify(page, false); await page.goto("/");
  const before = await page.locator(".ring-breathe").evaluate(element => getComputedStyle(element).transform);
  await page.waitForTimeout(300);
  expect(await page.locator(".ring-breathe").evaluate(element => getComputedStyle(element).transform)).not.toBe(before);
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  const paused = await page.locator(".ring-breathe").evaluate(element => getComputedStyle(element).transform);
  await page.waitForTimeout(300);
  expect(await page.locator(".ring-breathe").evaluate(element => getComputedStyle(element).transform)).toBe(paused);
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.reload();
  await expect(page.getByRole("button", { name: "Pause motion", exact: true })).not.toBeVisible();
  expect(await page.locator(".ring-breathe").evaluate(element => getComputedStyle(element).transform)).toBe("none");
});
