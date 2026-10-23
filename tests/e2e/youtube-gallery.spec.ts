import { expect,test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";
import { mockYouTube } from "./youtube-fixture";
import { videoIds } from "../../src/config/videos";
for(const width of [1440,1024,768,390])test(`six-video layout at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await mockSpotify(page);await mockYouTube(page);await page.goto("/visuals");
 const buttons=page.locator(".youtube-thumbnail");await expect(buttons).toHaveCount(6);
 expect(await buttons.evaluateAll(nodes=>nodes.map(node=>node.getAttribute("data-video-id")))).toEqual([...videoIds]);
 const first=await buttons.nth(0).boundingBox(),second=await buttons.nth(1).boundingBox();
 expect(Math.abs(first!.width/first!.height-16/9)).toBeLessThan(.02);
 if(width>800)expect(Math.abs(first!.y-second!.y)).toBeLessThan(2);else expect(second!.y).toBeGreaterThan(first!.y+first!.height);
 await expect(page.locator(".youtube-stage iframe")).toHaveCount(0);expect(await page.locator('script[src="https://www.youtube.com/iframe_api"]').count()).toBe(0);
 for(let index=0;index<6;index++){const image=buttons.nth(index).locator("img");await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test("grayscale hover and keyboard focus reveal colour",async({page})=>{
 await mockSpotify(page);await mockYouTube(page);await page.goto("/visuals");const button=page.locator(".youtube-thumbnail").first(),image=button.locator("img");
 await expect(image).toHaveCSS("filter","grayscale(1)");await button.hover();await expect(image).toHaveCSS("filter","grayscale(0)");await page.mouse.move(0,0);await expect(image).toHaveCSS("filter","grayscale(1)");await button.focus();await expect(image).toHaveCSS("filter","grayscale(0)");
});
test("each exact video plays in one selected iframe; closing never resumes music",async({page})=>{
 await mockSpotify(page,true);await mockYouTube(page);await page.goto("/visuals");
 await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed","true");
 for(let index=0;index<6;index++){const trigger=page.locator(".youtube-thumbnail").nth(index);await trigger.scrollIntoViewIfNeeded();const scrollY=await page.evaluate(()=>window.scrollY);await trigger.click();await expect(page.locator(".youtube-stage iframe")).toHaveCount(1);await expect(page.locator(".youtube-stage iframe")).toHaveAttribute("src",new RegExp(videoIds[index]));await expect(page.locator(".youtube-stage iframe")).toHaveAttribute("allowfullscreen","");await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed","false");await page.getByRole("button",{name:"Close video"}).click();await expect(page.locator(".youtube-stage iframe")).toHaveCount(0);await expect(trigger).toBeFocused();expect(await page.evaluate(()=>window.scrollY)).toBe(scrollY);await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed","false");}
 await expect.poll(()=>page.evaluate(()=>(window as unknown as {__ytDestroys:number}).__ytDestroys)).toBe(6);
});
test("restricted videos display an explicit optional YouTube fallback",async({page})=>{
 await mockSpotify(page);await mockYouTube(page,101);await page.goto("/visuals");await page.locator(".youtube-thumbnail").first().click();await expect(page.getByRole("dialog").getByRole("alert")).toContainText("could not play here");await expect(page.getByRole("link",{name:"Watch on YouTube"})).toHaveAttribute("href",`https://www.youtube.com/watch?v=${videoIds[0]}`);await expect(page.locator(".youtube-stage iframe")).toHaveCount(0);
});
test("blocked API and missing thumbnails fail without unrelated images",async({page})=>{
 await mockSpotify(page);await mockYouTube(page);await page.route("https://i.ytimg.com/**",route=>route.abort());await page.route("https://www.youtube.com/iframe_api",route=>route.abort());await page.goto("/visuals");await expect(page.getByText("Thumbnail unavailable").first()).toBeVisible();await page.locator(".youtube-thumbnail").first().click();await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();await page.keyboard.press("Escape");await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("a stalled API shows recovery text instead of an endless loader",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await mockSpotify(page);await mockYouTube(page);await page.route("https://www.youtube.com/iframe_api",route=>route.fulfill({contentType:"application/javascript",body:"/* Simulated stalled provider initialization. */"}));await page.clock.install();await page.goto("/visuals");await page.locator(".youtube-thumbnail").first().click();await expect(page.getByRole("status",{name:""}).filter({hasText:"Loading video"})).toBeVisible();await page.clock.fastForward(21000);await expect(page.getByRole("dialog").getByRole("alert")).toContainText("could not play here");
});
