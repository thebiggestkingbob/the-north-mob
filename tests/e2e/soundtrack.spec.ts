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
  await expect(page.frameLocator(".spotify-mount > iframe").getByTitle("THE NORTH MOB Spotify native player")).toBeVisible();
  await expect(page.locator(".spotify-mount > iframe")).toHaveCount(1);
  await expect(page.locator(".site-header").getByRole("button", { name: "Play soundtrack", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Reconnect Spotify", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.locator(".sound-panel iframe")).toHaveCount(0);
});

test("Home ripple refracts the photograph, is absent elsewhere and respects reduced motion", async ({ page }) => {
  await mockSpotify(page, false); await page.goto("/");
  await expect(page.getByRole("button", { name: /motion/i })).toHaveCount(0);
  await expect(page.locator(".hero-photo img")).toHaveAttribute("alt", "THE NORTH MOB photographed together in Pretoria");
  await expect(page.locator(".home-logo-heading")).toHaveCount(0);
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


test("slow startup and repeated play clicks keep one player and wait for readiness", async ({ page }) => {
  await mockSpotify(page, true, -1); await page.goto("/");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyCreates: number }).__spotifyCreates)).toBe(1);
  for (let i = 0; i < 4; i++) await page.locator(".sound-transport").click();
  await page.evaluate(() => (window as unknown as { __spotifyReleaseReady: () => void }).__spotifyReleaseReady());
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true", { timeout: 8000 });
  const counts = await page.evaluate(() => {
    const state = window as unknown as { __spotifyCreates: number; __spotifyPrematurePlays: number };
    return [state.__spotifyCreates, state.__spotifyPrematurePlays];
  });
  expect(counts).toEqual([1, 0]);
});

test("vendor eval is isolated and the main app keeps its production CSP", async ({ page }) => {
  await mockSpotify(page, true); const response = await page.goto("/");
  expect(response!.headers()["content-security-policy"]).not.toContain("unsafe-eval");
  const bridge = await page.request.get("/spotify-player?uri=spotify:track:0qmPvb3cGQpSN5chcx6djF");
  expect(bridge.headers()["content-security-policy"]).toContain("unsafe-eval");
  expect(bridge.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyEvalWorks: boolean }).__spotifyEvalWorks)).toBe(true);
  expect((await page.request.get("/spotify-player?uri=invalid")).status()).toBe(400);
});

test("blocked autoplay exposes native controls and manual activation recovers", async ({ page }) => {
  await mockSpotify(page, false); await page.goto("/");
  await expect(page.locator(".sound-panel")).toBeVisible({ timeout: 8000 });
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => { (window as unknown as { __spotifyAllowed: boolean }).__spotifyAllowed = true; });
  await page.locator(".sound-transport").click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
});

test("rapid track selection plays only the final track after its controller is ready", async ({ page }) => {
  await mockSpotify(page, true, 600); await page.goto("/music");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Maatla Thata/ }).click();
  await page.getByRole("button", { name: /Camp Chair/ }).click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => (window as unknown as { __spotifyUri: string }).__spotifyUri)).toBe("spotify:track:0qmPvb3cGQpSN5chcx6djF");
  expect(await page.evaluate(() => (window as unknown as { __spotifyPrematurePlays: number }).__spotifyPrematurePlays)).toBe(0);
});


test("off then on reconnects, and native pause and resume stay consistent", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Show Spotify player" }).click();
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await page.locator(".sound-transport").click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyCreates: number }).__spotifyCreates)).toBe(2);
  await page.locator(".sound-transport").click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyPauses: number }).__spotifyPauses)).toBeGreaterThan(0);
  await page.evaluate(() => (window as unknown as { __spotifyNativePlay: () => void }).__spotifyNativePlay());
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
});

test("messages from another window cannot forge Spotify playback", async ({ page }) => {
  await mockSpotify(page, false); await page.goto("/");
  await page.evaluate(() => window.postMessage({ channel: "northmob:spotify:v1", type: "playback_started", uri: "spotify:track:0qmPvb3cGQpSN5chcx6djF", data: {} }, location.origin));
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
});


test("pausing the initial autoplay player keeps native resume available", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.locator(".sound-transport").click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".spotify-mount > iframe")).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyPauses: number }).__spotifyPauses)).toBeGreaterThan(0);
  await page.evaluate(() => (window as unknown as { __spotifyNativePlay: () => void }).__spotifyNativePlay());
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => (window as unknown as { __spotifyCreates: number }).__spotifyCreates)).toBe(1);
});
