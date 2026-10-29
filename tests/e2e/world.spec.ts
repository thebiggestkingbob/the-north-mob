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

  test("Three.js is served from the same origin", async ({ request }) => {
    const response = await request.get("/world-engine/three.module.js");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toMatch(/javascript/);
    const source = await response.text();
    expect(source).toContain("WebGLRenderer");
  });

  test("walk-through interiors do not navigate to separate pages", async ({ request }) => {
    const engine = await (await request.get("/world-engine/index.html")).text();
    const rooms = await (await request.get("/world-engine/interiors.js")).text();
    expect(engine).not.toContain("window.location.assign");
    expect(engine).toContain("function frame()");
    expect(engine).toContain("frame();");
    expect(engine.trimEnd().endsWith("</html>")).toBeTruthy();
    expect(engine).toContain("arrowup");
    expect(engine).toContain("arrowleft");
    expect(rooms).toContain("function blocked");
    expect(rooms).toContain("function inside");
    expect(rooms).toContain("Wall gallery");
    expect(rooms).toContain("texture.image.width/image.height");
    expect(engine).toContain("interiors.cameraSolids()");
    expect(engine).toContain("HERE 4 BUSINESS");
    expect(engine).toContain("musicToggle");
    expect(engine).toContain("function toggleCar()");
    expect(engine).toContain("carSpeed+throttle*dt*27,-18,45");
    expect(engine).toContain("interiors.floorHeight(x,z)");
    expect(rooms).toContain("UPSTAIRS · MOB COLLECTION");
    expect(engine).toContain("function carBlocked(");
    expect(engine).toContain("function resetCar()");
    expect(engine).toContain("RESET CAR");
    expect(engine).toContain("Slide along the wall");
    expect(engine).toContain("The neighborhood has a deliberately designed, finite perimeter");
    expect(engine).toContain("Road ends: broad paved turning pads");
    expect(engine).toContain("if(collided&&throttle<0)");
    expect(engine).toContain("const lx=dx*Math.cos(carYaw)");
    expect(engine).toContain("EXIT CAR");
    expect(engine).toContain("addEventListener(\'blur\'");
    expect(rooms).toContain("const balconyFront=stairStart-stairs*.72+.4");
    expect(engine).toContain("carFootprint(nx,nz,.35)");
    expect(engine).toContain("const travel=carSpeed*dt,steps=");
    expect(engine).toContain("for(const side of [1,-1])");
    expect(rooms).toContain("function floorHeight(x,z,current=0)");
    expect(engine).not.toContain("const pathStart=");
  });


  test("3D runtime moves the avatar, exposes state and respects map bounds", async ({ page }) => {
    await page.goto("/world-engine/index.html");
    await page.waitForFunction(() => typeof (window as any).__northMobWorldState === "function", { timeout: 20000 });
    const before = await page.evaluate(() => (window as any).__northMobWorldState());
    expect(before.ready).toBe(true);
    expect(before.driving).toBe(false);
    await page.keyboard.down("w");
    await page.waitForTimeout(500);
    await page.keyboard.up("w");
    const after = await page.evaluate(() => (window as any).__northMobWorldState());
    expect(after.z).toBeLessThan(before.z);
    expect(Math.abs(after.x)).toBeLessThan(46);
    expect(Math.abs(after.z)).toBeLessThan(48);
  });

  test("mobile interaction controls are accessible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/world-engine/index.html");
    await expect(page.getByRole("button", { name: "VIEW" })).toBeVisible();
    await expect(page.getByRole("button", { name: "INTERACT" })).toBeVisible();
    await expect(page.locator("[data-key=w]")).toBeVisible();
    await expect(page.locator("[data-key=a]")).toBeVisible();
  });

  test("3D interiors are served locally and exhibits have published data", async ({ request }) => {
    const module = await request.get("/world-engine/interiors.js");
    expect(module.ok()).toBeTruthy();
    const source = await module.text();
    expect(source).toContain("createInteriors");
    expect(source).toContain("Walk-through buildings");
    const response = await request.get("/api/world/exhibits");
    expect(response.ok()).toBeTruthy();
    const exhibits = await response.json();
    for (const key of ["shop", "studio", "cinema", "museum", "live"]) {
      expect(Array.isArray(exhibits[key])).toBeTruthy();
    }
    expect(exhibits.shop.length).toBeGreaterThan(0);
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

test("studio uses physical equipment and published album artwork", async ({ request }) => {
  const response = await request.get("/world-engine/interiors.js");
  expect(response.ok()).toBeTruthy();
  const source = await response.text();
  expect(source).toContain("function studioAtmosphere(site)");
  expect(source).toContain("VOCAL BOOTH");
  expect(source).toContain("const album=(content.album||[])[0]");
  expect(source).toContain("if(id==='studio')studioAtmosphere(site)");
});

test("studio offers real album and individual track interaction points", async ({ request }) => {
  const response = await request.get("/world-engine/interiors.js");
  expect(response.ok()).toBeTruthy();
  const source = await response.text();
  expect(source).toContain("E · LISTEN TO THE ALBUM");
  expect(source).toContain("const tracks=(content.studio||[]).filter");
  expect(source).toContain("exhibits.push({item:track");
  expect(source).toContain("if(id==='museum'||id==='cinema')");
});

test("VISUALS CINEMA has a physical screen, seats and published video selectors", async ({ request }) => {
  const response = await request.get("/world-engine/interiors.js");
  expect(response.ok()).toBeTruthy();
  const source = await response.text();
  expect(source).toContain("function cinemaAtmosphere(site)");
  expect(source).toContain("const videos=(content.cinema||[]).filter(v=>v.videoId)");
  expect(source).toContain("exhibits.push({item:video");
  expect(source).toContain("if(id==='cinema')cinemaAtmosphere(site)");
});

test("MOB MUSEUM mounts published archive photos on walls", async ({ request }) => {
  const response = await request.get("/world-engine/interiors.js");
  expect(response.ok()).toBeTruthy();
  const source = await response.text();
  expect(source).toContain("function museumAtmosphere(site)");
  expect(source).toContain("const photos=(content.museum||[]).filter(p=>p.image)");
  expect(source).toContain("new THREE.SpotLight(");
  expect(source).toContain("if(id==='museum')museumAtmosphere(site)");
});

test("LIVE YARD has stage geometry and only published event ticket boards", async ({ request }) => {
  const response = await request.get("/world-engine/interiors.js");
  expect(response.ok()).toBeTruthy();
  const source = await response.text();
  expect(source).toContain("function liveAtmosphere(site)");
  expect(source).toContain("const events=(content.live||[])");
  expect(source).toContain("exhibits.push({item:event");
  expect(source).toContain("if(id==='live')liveAtmosphere(site)");
});
