import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";

test("tries autoplay but waits for confirmed playback before showing sound on", async ({ page }) => {
  await mockSpotify(page, false); await page.goto("/");
  await expect(page.locator(".spotify-mount iframe")).toHaveCount(1);
  await expect(page.locator(".native-playback")).not.toBeVisible();
  const logo = await page.locator(".brand").boundingBox();
  const player = await page.locator(".header-sound").boundingBox();
  expect(player!.y).toBeGreaterThan(logo!.y + logo!.height);
  expect(player!.width).toBeLessThanOrEqual(360);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyPlays: number }).__spotifyPlays)).toBeGreaterThan(0);
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".header-sound .sound-transport")).toHaveAttribute("aria-pressed", "false");
});

test("one confirmed Spotify player persists through navigation and plays selected tracks in-page", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".header-sound").getByRole("button", { name: "Pause soundtrack", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.locator(".desktop-nav").getByRole("link", { name: "Music", exact: true }).click();
  await expect(page).toHaveURL(/music$/);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyCreates: number }).__spotifyCreates)).toBe(1);
  await page.getByRole("button", { name: /maatla , thata/ }).click();
  await expect(page).toHaveURL(/music$/);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyUri: string }).__spotifyUri)).toBe("spotify:track:3HdLERcMc38Yq5UDnCFGf3");
  await page.getByRole("button", { name: /camp , chair/ }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyUri: string }).__spotifyUri)).toBe("spotify:track:0qmPvb3cGQpSN5chcx6djF");
  await expect(page.locator(".spotify-mount iframe")).toHaveCount(1);
});

test("sound off unloads the player and respects that choice on reload", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".header-sound").getByRole("button", { name: "Pause soundtrack", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.locator(".spotify-mount iframe")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".spotify-mount iframe")).toHaveCount(0);
  await expect(page.locator(".header-sound .sound-transport")).toHaveAttribute("aria-pressed", "false");
});

test("opening a film pauses the background soundtrack", async ({ page }) => {
  await mockSpotify(page, true); await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({ body: "Video test fixture" }));
  await page.goto("/visuals"); await expect(page.locator(".header-sound").getByRole("button", { name: "Pause soundtrack", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Play official THE NORTH MOB film" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyPauses: number }).__spotifyPauses)).toBeGreaterThan(0);
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
});

test("blocked Spotify script leaves an in-site native fallback without claiming playback", async ({ page }) => {
  await mockSpotify(page, false);
  await page.route("https://open.spotify.com/embed/iframe-api/v1", route => route.abort());
  await page.goto("/");
  await page.locator(".sound-transport").click();
  await expect(page.frameLocator(".spotify-mount > iframe").getByTitle("THE NORTH MOB Spotify native player")).toBeVisible();
  await expect(page.locator(".spotify-mount > iframe")).toHaveCount(1);
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Reconnect", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await expect(page.locator(".native-playback iframe")).toHaveCount(0);
});

test("water effects are absent and other Home motion remains", async ({ page }) => {
  await mockSpotify(page); await page.goto("/");
  await expect(page.locator(".home-film-poster")).toBeVisible();
  await expect(page.locator(".home-film-poster")).toHaveAttribute("src", /hero-film-poster/);
  await expect(page.locator(".home-film-poster")).toHaveCSS("object-fit", "cover");
  await expect(page.locator("canvas,.water-ripple")).toHaveCount(0);
  await expect(page.locator(".home-rings")).toHaveCount(0);
  await expect(page.locator(".cinema-film")).toHaveJSProperty("muted", true);
  await expect(page.locator(".home-film-background")).toHaveCSS("position", "absolute");
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

test("compact queue has no dropdown and exposes previous and next", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".sound-expand,[aria-expanded][aria-controls=spotify-panel]")).toHaveCount(0);
  await page.getByRole("button", { name: "Next track", exact: true }).click();
  await expect(page.locator(".track-meta")).toContainText("maatla , thata");
  await page.getByRole("button", { name: "Previous track", exact: true }).click();
  await expect(page.locator(".track-meta")).toContainText("camp , chair");
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
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-label", "Enable Sound", { timeout: 8000 });
  await page.locator(".sound-transport").click();
  await expect(page.locator(".native-playback")).toBeVisible();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => { (window as unknown as { __spotifyAllowed: boolean }).__spotifyAllowed = true; });
  await page.locator(".sound-transport").click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
});

test("rapid track selection plays only the final track after its controller is ready", async ({ page }) => {
  await mockSpotify(page, true, 600); await page.goto("/music");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /maatla , thata/ }).click();
  await page.getByRole("button", { name: /camp , chair/ }).click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => (window as unknown as { __spotifyUri: string }).__spotifyUri)).toBe("spotify:track:0qmPvb3cGQpSN5chcx6djF");
  expect(await page.evaluate(() => (window as unknown as { __spotifyPrematurePlays: number }).__spotifyPrematurePlays)).toBe(0);
});


test("off then on reconnects, and native pause and resume stay consistent", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
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


test("confirmed track completion advances once and ordinary pause does not", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => (window as unknown as { __spotifyUpdate: (data: unknown) => void }).__spotifyUpdate({ position: 190000, duration: 190000, isPaused: true, isBuffering: false }));
  await expect(page.locator(".track-meta")).toContainText("maatla , thata");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.locator(".sound-transport").click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".track-meta")).toContainText("maatla , thata");
});

test("Music shows all eleven album tracks and explicit supported fallbacks", async ({ page }) => {
  await mockSpotify(page); await page.goto("/music");
  await expect(page.locator(".music-lower > div:first-child .catalogue-row")).toHaveCount(11);
  await expect(page.locator(".spotify-block .catalogue-row")).toHaveCount(2);
  await expect(page.locator(".release-photo img")).toHaveAttribute("src", /h4b-album-cover/);
  await expect(page.getByRole("link", { name: /peke , fosholo/ })).toHaveAttribute("href", /open.spotify.com/);
  await expect(page.locator(".spotify-mount > iframe")).toHaveAttribute("height", "80");
  await expect(page.locator(".spotify-mount > iframe")).toHaveCount(1);
});

test("reload restores a known track and its playback position", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await page.getByRole("button", { name: "Next track" }).click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => (window as unknown as { __spotifyUpdate: (data: unknown) => void }).__spotifyUpdate({ position: 45000, duration: 159000, isPaused: false, isBuffering: false }));
  await page.reload();
  await expect(page.locator(".track-meta")).toContainText("maatla , thata");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifySeek: number }).__spotifySeek)).toBe(45);
});

test("verified ID enrichment enables a direct action without duplicating catalogue rows", async ({ page }) => {
  await mockSpotify(page, true);
  const { allTracks, album } = await import("../../src/config/catalogue");
  const fixtureUri = `spotify:track:${"A".repeat(22)}`;
  await page.route("**/api/catalogue", route => route.fulfill({ json: { album, tracks: allTracks.map(track => track.id === "h4b-1" ? { ...track, uri: fixtureUri } : track) } }));
  await page.goto("/music");
  const track = page.getByRole("button", { name: /peke , fosholo/ });
  await expect(track).not.toContainText("Choose this track");
  await track.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifyUri: string }).__spotifyUri)).toBe(fixtureUri);
  await expect(page.locator(".music-lower > div:first-child .catalogue-row")).toHaveCount(11);
});

test("local featured artwork is sharp and has no Spotify navigation", async ({ page }) => {
  await mockSpotify(page);
  await page.goto("/music");
  const artwork = page.locator(".release-photo img");
  await expect(artwork).toHaveCount(1);
  await expect(artwork).toBeVisible();
  await expect(artwork).toHaveAttribute("src", /h4b-album-cover/);
  await expect.poll(() => artwork.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(".release-photo a, .release-photo button")).toHaveCount(0);
  await artwork.click();
  await expect(page).toHaveURL(/\/music$/);
  await expect(page.locator(".catalogue-row")).toHaveCount(13);
});

test("mobile transport has readable status and full touch targets", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await mockSpotify(page, false); await page.goto("/");
  await expect(page.locator(".track-meta [role=status]")).toHaveText("Tap to enable sound", { timeout: 8000 });
  for (const control of ["Previous track", "Enable Sound", "Next track", "Turn sound off"]) {
    const bounds = await page.getByRole("button", { name: control, exact: true }).first().boundingBox();
    expect(bounds?.width).toBeGreaterThanOrEqual(44);
    expect(bounds?.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("off and on restores the current position without reloading the page", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => (window as unknown as { __spotifyUpdate: (data: unknown) => void }).__spotifyUpdate({ position: 45000, duration: 190000, isPaused: false, isBuffering: false }));
  await page.getByRole("button", { name: "Turn sound off" }).click();
  await page.locator(".sound-transport").click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifySeek: number }).__spotifySeek)).toBe(45);
});

test("stalled playback offers manual recovery instead of staying in starting state", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => (window as unknown as { __spotifyUpdate: (data: unknown) => void }).__spotifyUpdate({ position: 1000, duration: 190000, isPaused: false, isBuffering: true }));
  await expect(page.locator(".track-meta [role=status]")).toHaveText("Starting…");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-label", "Enable Sound", { timeout: 10000 });
  await page.locator(".sound-transport").click();
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
});

test("mini-player progress reflects Spotify events and seeks through the controller", async ({ page }) => {
  await mockSpotify(page, true); await page.goto("/");
  await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => (window as unknown as { __spotifyUpdate: (data: unknown) => void }).__spotifyUpdate({ position: 45000, duration: 190000, isPaused: false, isBuffering: false }));
  await expect(page.getByRole("slider", { name: "Track position" })).toHaveValue("45");
  await expect(page.locator(".sound-progress")).toContainText("0:45");
  await page.getByRole("slider", { name: "Track position" }).fill("60");
  await expect.poll(() => page.evaluate(() => (window as unknown as { __spotifySeek: number }).__spotifySeek)).toBe(60);
});
