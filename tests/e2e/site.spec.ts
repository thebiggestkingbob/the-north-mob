import { expect, test } from "@playwright/test";
const routes = [["/", "THE NORTH MOB"], ["/music", "HERE 4 BUSINESS"], ["/the-mob", "THE MOB"], ["/visuals", "VISUALS"], ["/live", "LIVE"], ["/business", "BUSINESS IS PERSONAL"]];
for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`six pages fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const [route, heading] of routes) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      expect((await page.locator("h1").innerText()).replace(/\s/g, "")).toBe(heading.replace(/\s/g, ""));
      await page.waitForTimeout(100);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBeTruthy();
      expect(await page.locator("img").evaluateAll(images => images.every(image => image instanceof HTMLImageElement && (!image.complete || image.naturalWidth > 0))), route).toBeTruthy();
    }
    expect(errors).toEqual([]);
  });
}
test("Home has twelve rings and no media iframe", async ({ page }) => { await page.goto("/"); await expect(page.locator(".home-rings circle")).toHaveCount(12); await expect(page.locator("iframe,video")).toHaveCount(0); });
test("navigation transitions preserve browser back and focus", async ({ page }) => { await page.goto("/"); await page.getByRole("link", { name: /Explore the Mob/ }).click(); await expect(page).toHaveURL(/the-mob$/); await expect(page.locator("h1")).toBeFocused(); await page.goBack(); await expect(page).toHaveURL("/"); await expect(page.locator("h1")).toBeVisible(); });
test("artist profile supports Escape, back and forward", async ({ page }) => { await page.goto("/the-mob"); const trigger = page.getByRole("button", { name: "Open Trophy profile" }); await trigger.click(); await expect(page.getByRole("dialog")).toBeVisible(); await expect(page).toHaveURL(/artist=trophy/); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).not.toBeVisible(); await expect(trigger).toBeFocused(); await page.goForward(); await expect(page.getByRole("dialog")).toBeVisible(); await page.goBack(); await expect(page.getByRole("dialog")).not.toBeVisible(); });
test("video opens in-page and unmounts on Escape", async ({ page }) => { await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({ body: "Provider placeholder for interaction test" })); await page.goto("/visuals"); const trigger = page.getByRole("button", { name: "Play official THE NORTH MOB film" }); await trigger.click(); await expect(page.getByRole("dialog")).toBeVisible(); await expect(page.locator("iframe")).toHaveAttribute("src", /youtube-nocookie.com\/embed\/on_eg9HLysA/); await page.keyboard.press("Tab"); await page.keyboard.press("Escape"); await expect(page.locator("iframe")).toHaveCount(0); await expect(trigger).toBeFocused(); });
test("mobile menu is keyboard accessible", async ({ page }) => { await page.setViewportSize({ width: 375, height: 812 }); await page.goto("/"); const trigger = page.getByRole("button", { name: "Open navigation" }); await trigger.click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape"); await expect(trigger).toBeFocused(); await trigger.click(); await page.getByRole("navigation", { name: "Expanded navigation" }).getByRole("link", { name: /Music/ }).click(); await expect(page).toHaveURL(/music$/); await expect(page.getByRole("dialog")).not.toBeVisible(); });
test("reduced motion retains content and navigation", async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/"); await page.getByRole("link", { name: /Explore the Mob/ }).click(); await expect(page).toHaveURL(/the-mob$/); await expect(page.getByRole("button", { name: "Open Trophy profile" })).toBeVisible(); });
test("unconfigured form never claims delivery", async ({ page }) => { await page.goto("/business"); await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled(); await expect(page.getByText("Enquiries are not open through this form yet.", { exact: false })).toBeVisible(); const response = await page.request.post("/api/enquiry", { data: { name: "Browser Test", email: "test@example.com", type: "Bookings", message: "A test enquiry for availability.", consent: true, website: "" } }); expect(response.status()).toBe(503); expect(await response.json()).not.toHaveProperty("delivered", true); });
test("capture desktop and mobile previews", async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); for (const width of [1440, 375]) { await page.setViewportSize({ width, height: 1000 }); for (const [route] of routes) { await page.goto(route); await page.screenshot({ path: `work/screenshots/${width}-${route === "/" ? "home" : route.slice(1)}.png`, fullPage: true }); } } });
