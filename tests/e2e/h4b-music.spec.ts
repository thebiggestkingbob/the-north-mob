import { expect, test } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";
const names=["Focalistic","Young Stunna","Blxckie","Loatinover Pounds","LaCabra","Lowfeye"];
for(const width of [1440,834,390]){
 test(`H4B editorial content and original cards fit ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await mockSpotify(page,true);await page.goto("/music");
  await expect(page.locator(".release-photo img")).toHaveCount(1);
  await expect(page.locator(".header-sound").getByRole("button",{name:"Pause soundtrack",exact:true})).toBeVisible();
  await expect(page.getByRole("heading",{name:"A SOUND FROM PITORI. BUILT FOR EVERYWHERE."})).toBeVisible();
  await expect(page.getByText("Reported first-month streams",{exact:true})).toBeVisible();
  await expect(page.locator(".h4b-milestones dd")).toHaveText(["6M+","11","2026"]);
  const rail=page.getByRole("region",{name:"H4B featured artist photographs"});await rail.scrollIntoViewIfNeeded();
  await expect(rail.locator("figcaption")).toHaveText(names);
  for(const name of names){const img=rail.getByAltText(`${name} — supplied H4B featured artist card`);await img.scrollIntoViewIfNeeded();await expect(img).toBeVisible();await expect.poll(()=>img.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  if(width<1000){expect(await rail.evaluate(node=>node.scrollWidth>node.clientWidth)).toBe(true);await rail.focus();await rail.evaluate(node=>{node.scrollLeft=0;});await page.keyboard.press("ArrowRight");await expect.poll(()=>rail.evaluate(node=>node.scrollLeft)).toBeGreaterThan(0);}
  else{expect(await rail.evaluate(node=>node.scrollWidth<=node.clientWidth)).toBe(true);}
  await expect(page.locator(".music-lower .song-list").first().locator(".catalogue-row")).toHaveCount(11);
  await page.locator(".music-lower").scrollIntoViewIfNeeded();
  await expect(page.locator(".music-lower")).toHaveCSS("opacity","1");
  await page.evaluate(async()=>{await document.fonts.ready;document.querySelector(".h4b-feature-rail")!.scrollLeft=0;(document.activeElement as HTMLElement)?.blur();window.scrollTo(0,0);});
  await expect.poll(()=>page.locator(".transition-veil").evaluate(node=>node.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await page.screenshot({path:`work/screenshots/h4b-music-${width}.png`,fullPage:true});
 });
}
