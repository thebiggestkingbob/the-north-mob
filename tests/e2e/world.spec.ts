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
