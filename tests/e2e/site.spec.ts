import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";
test.beforeEach(async ({ page }) => { await mockSpotify(page); });
const routes = [["/", "THE NORTH MOB"], ["/music", "HERE 4 BUSINESS"], ["/the-mob", "THE MOB"], ["/visuals", "VISUALS"], ["/live", "LIVE"], ["/business", "BUSINESS IS PERSONAL"]];
for (const width of [320, 375, 768, 1024, 1440, 1920]) {
  test(`six pages fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const [route, heading] of routes) {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect((await page.getByRole("heading", { level: 1 }).innerText()).replace(/\s/g, "")).toBe(heading.replace(/\s/g, ""));
      await page.waitForTimeout(100);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBeTruthy();
      expect(await page.locator("img").evaluateAll(images => images.every(image => image instanceof HTMLImageElement && (!image.complete || image.naturalWidth > 0))), route).toBeTruthy();
    }
    expect(errors).toEqual([]);
  });
}
test("Home has twelve rings and no featured video", async ({ page }) => { await page.goto("/"); await expect(page.locator(".home-rings circle")).toHaveCount(12); await expect(page.locator("iframe[src*=youtube],video")).toHaveCount(0); });
test("navigation transitions preserve browser back and focus", async ({ page }) => { await page.goto("/"); await page.getByRole("link", { name: /Explore the Mob/ }).click(); await expect(page).toHaveURL(/the-mob$/); await expect(page.getByRole("heading", { level: 1 })).toBeFocused(); await page.goBack(); await expect(page).toHaveURL("/"); await expect(page.getByRole("heading", { level: 1 })).toBeVisible(); });
test("artist profile supports Escape, back and forward", async ({ page }) => { await page.goto("/the-mob"); const trigger = page.getByRole("button", { name: "Open Trophy profile" }); await trigger.click(); await expect(page.getByRole("dialog")).toBeVisible(); await expect(page).toHaveURL(/artist=trophy/); await page.keyboard.press("Escape"); await expect(page.getByRole("dialog")).not.toBeVisible(); await expect(trigger).toBeFocused(); await page.goForward(); await expect(page.getByRole("dialog")).toBeVisible(); await page.goBack(); await expect(page.getByRole("dialog")).not.toBeVisible(); });
test("video opens in-page and unmounts on Escape", async ({ page }) => { await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({ body: "Provider placeholder for interaction test" })); await page.goto("/visuals"); const trigger = page.getByRole("button", { name: "Play official THE NORTH MOB film" }); await trigger.click(); await expect(page.getByRole("dialog")).toBeVisible(); await expect(page.locator(".video-dialog iframe")).toHaveAttribute("src", /youtube-nocookie.com\/embed\/on_eg9HLysA/); await page.keyboard.press("Tab"); await page.keyboard.press("Escape"); await expect(page.locator(".video-dialog iframe")).toHaveCount(0); await expect(trigger).toBeFocused(); });
test("mobile menu is keyboard accessible", async ({ page }) => { await page.setViewportSize({ width: 375, height: 812 }); await page.goto("/"); const trigger = page.getByRole("button", { name: "Open navigation" }); await trigger.click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.keyboard.press("Escape"); await expect(trigger).toBeFocused(); await trigger.click(); await page.getByRole("navigation", { name: "Expanded navigation" }).getByRole("link", { name: /Music/ }).click(); await expect(page).toHaveURL(/music$/); await expect(page.getByRole("dialog")).not.toBeVisible(); });
test("reduced motion retains content and navigation", async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/"); await page.getByRole("link", { name: /Explore the Mob/ }).click(); await expect(page).toHaveURL(/the-mob$/); await expect(page.getByRole("button", { name: "Open Trophy profile" })).toBeVisible(); });
test("unconfigured form never claims delivery", async ({ page }) => { await page.goto("/business"); await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled(); await expect(page.getByText("Enquiries are not open through this form yet.", { exact: false })).toBeVisible(); const response = await page.request.post("/api/enquiry", { data: { name: "Browser Test", email: "test@example.com", type: "Bookings", message: "A test enquiry for availability.", consent: true, website: "" } }); expect(response.status()).toBe(503); expect(await response.json()).not.toHaveProperty("delivered", true); });
test("capture desktop and mobile previews", async ({ page }) => { await page.emulateMedia({ reducedMotion: "reduce" }); for (const width of [1440, 375]) { await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 }); for (const [route] of routes) { await page.goto(route); await page.screenshot({ path: `work/screenshots/${width}-${route === "/" ? "home" : route.slice(1)}.png`, fullPage: true }); } } });

test("October gigs retain every announcement and distinguish past from upcoming", async ({ page }) => {
  await page.goto("/live");
  const rows = page.locator(".event-list li");
  await expect(rows).toHaveCount(7);
  const expected = [
    ["2026-10-02", "H4B Pop Up", "Ga-Rankuwa, Zone 4"],
    ["2026-10-03", "Homecoming", "Pretoria Botanical Gardens"],
    ["2026-10-03", "Mr Bully Tour", "Orange Farm"],
    ["2026-10-03", "Splash Party", "Mimakau Community Hall"],
    ["2026-10-10", "Back to the City Festival", "Mary Fitzgerald Square"],
    ["2026-10-31", "Young Durag Mansion Party", "Winchester Hills"],
    ["2026-10-31", "Tazer Bouy Bday Celebration", "Shalas Cafe"],
  ];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
  for (const [index, [date, name, venue]] of expected.entries()) {
    const row = rows.nth(index);
    await expect(row.locator("time")).toHaveAttribute("datetime", date);
    await expect(row).toContainText(name);
    await expect(row).toContainText(venue);
    await expect(row).toContainText(date < today ? "Past event" : "Upcoming gig");
  }
  await expect(rows.locator("a")).toHaveCount(0);
  await expect(page.getByText("More dates to be added.")).toBeVisible();
});

test("Business form blends into the page and retains accessible controls", async ({ page }) => {
  await page.goto("/business");
  const form = page.locator(".contact-form");
  await expect(form).toHaveCSS("border-top-width", "0px");
  await expect(form).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const name = page.getByRole("textbox", { name: "Name", exact: true });
  await name.focus();
  await page.keyboard.press("Tab");
  const email = page.getByRole("textbox", { name: "Email", exact: true });
  await expect(email).toBeFocused();
  await expect(email).toHaveCSS("outline-style", "solid");
  await email.fill("invalid-email");
  expect(await email.evaluate((input: HTMLInputElement) => input.validity.typeMismatch)).toBeTruthy();
  await expect(page.getByRole("combobox", { name: "Enquiry type" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message", exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox")).toBeVisible();
});
