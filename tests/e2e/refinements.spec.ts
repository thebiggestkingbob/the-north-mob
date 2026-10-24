import { expect,test } from "@playwright/test";
import {mockSpotify} from "./spotify-fixture";
import {mockYouTube} from "./youtube-fixture";
import {pages} from "../../src/config/pages";
const publicPages=pages.map(page=>page.path);
for(const width of [1440,1200,1024,834,768,430,390])test(`shared navigation, footer and content clearance at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:"reduce"});await mockSpotify(page,true);await mockYouTube(page);
 for(const path of publicPages){
  await page.goto(path);await expect(page.locator(".site-header .header-sound")).toBeVisible();await expect(page.locator(".desktop-nav")).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),path).toBe(true);
  await expect(page.locator(".newsletter-signup")).toHaveCount(1);await expect(page.locator(".newsletter-signup")).not.toBeVisible();
  const footer=page.locator(".refined-footer");await footer.locator("summary").click();await expect(footer.getByRole("form",{name:"Get North Mob updates"})).toBeVisible();
  const links=footer.getByRole("navigation",{name:"Footer navigation"}).getByRole("link");await expect(links).toHaveCount(9);
  expect(await links.allTextContents()).toEqual(["Music","The Mob","Visualz","Shop","Live","Business As Usual","Instagram","Spotify","YouTube"]);
  const email=footer.getByRole("textbox",{name:"Email"});await email.scrollIntoViewIfNeeded();
  const target=await email.boundingBox(),player=await page.locator(".header-sound").boundingBox();expect(target!.y).toBeGreaterThanOrEqual(player!.y+player!.height);
  expect(await links.evaluateAll(nodes=>nodes.every(node=>!/[↗→←↓↑]/.test(node.textContent??"")))).toBe(true);
  await footer.locator("summary").click();await expect(email).not.toBeVisible();
 }
});
test("footer navigation retains a single soundtrack engine across all chapters",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await mockSpotify(page,true);await mockYouTube(page);await page.goto("/");await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed","true");await page.locator(".footer-disclosure summary").click();
 for(const chapter of pages.slice(1)){
  await page.getByRole("navigation",{name:"Footer navigation"}).getByRole("link",{name:chapter.name,exact:true}).click();await expect(page).toHaveURL(new RegExp(`${chapter.path}$`));await expect.poll(()=>page.evaluate(()=>(window as unknown as {__spotifyCreates:number}).__spotifyCreates)).toBe(1);await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed","true");
 }
});
test("cleanup preserves the H4B album and photo collection",async({page})=>{
 await mockSpotify(page);await mockYouTube(page);await page.goto("/music");await expect(page.getByText("More from the collective",{exact:true})).toHaveCount(0);await expect(page.locator(".catalogue-row")).toHaveCount(11);await expect(page.locator(".h4b-features figure")).toHaveCount(6);await expect(page.getByText(/HERE 4 BUSINESS introduces TRAPCARDI/)).toBeVisible();
 await page.goto("/visuals");await expect(page.getByRole("searchbox")).toHaveCount(0);await expect(page.locator(".archive-photo")).toHaveCount(9);await expect(page.locator(".youtube-thumbnail")).toHaveCount(6);await expect(page.locator('a[href*="instagram.com/reel"]')).toHaveCount(0);
 await page.locator(".youtube-thumbnail").nth(4).click();await expect(page.locator(".youtube-stage iframe")).toHaveAttribute("src",/on_eg9HLysA/);
});
test("Business fields and event information remain clear of the audio dock",async({page})=>{
 await page.setViewportSize({width:390,height:844});await mockSpotify(page,true);await page.goto("/business");
 for(const label of ["Name","Email","Message"]){const field=page.locator(".contact-form").getByLabel(label,{exact:true});await field.scrollIntoViewIfNeeded();await field.focus();const box=await field.boundingBox(),header=await page.locator(".site-header").boundingBox();expect(box!.y).toBeGreaterThanOrEqual(header!.y+header!.height);await expect(field).toHaveCSS("border-bottom-width","0px");}
 await page.goto("/live");for(const row of await page.locator(".event-list li").all()){await row.scrollIntoViewIfNeeded();const box=await row.boundingBox(),header=await page.locator(".site-header").boundingBox();expect(box!.y).toBeGreaterThanOrEqual(header!.y+header!.height);}
});

test("capture refinement review views",async({page})=>{
 await mockSpotify(page,true);await mockYouTube(page);await page.emulateMedia({reducedMotion:"reduce"});
 for(const width of [1440,1024,768,430,390]){
  await page.setViewportSize({width,height:1000});
  for(const path of ["/live","/business","/shop"]){await page.goto(path);await expect(page.locator(".site-header .header-sound")).toBeVisible();if(path==="/live")await page.locator(".live-dates").first().scrollIntoViewIfNeeded();if(path==="/business")await page.locator(".contact-form").scrollIntoViewIfNeeded();await page.screenshot({path:`work/screenshots/refined-${width}-${path.slice(1)}.png`});}
  await page.locator(".footer-disclosure summary").click();await page.locator("#newsletter-email").scrollIntoViewIfNeeded();await expect(page.locator("#newsletter-email")).toBeInViewport();await page.screenshot({path:`work/screenshots/refined-${width}-footer.png`});
 }
});
test("native Spotify recovery controls reserve header space above signup",async({page})=>{
 await page.setViewportSize({width:390,height:844});await mockSpotify(page,false);await page.route("https://open.spotify.com/embed/iframe-api/v1",route=>route.abort());await page.goto("/music");await page.locator(".sound-transport").click();await expect(page.locator(".native-playback.is-needed")).toBeVisible();await page.locator(".footer-disclosure summary").click();const email=page.locator("#newsletter-email");await email.scrollIntoViewIfNeeded();await email.focus();const target=await email.boundingBox(),header=await page.locator(".site-header").boundingBox(),native=await page.locator(".native-playback.is-needed").boundingBox();expect(native!.y+native!.height).toBeLessThanOrEqual(header!.y+header!.height);expect(target!.y).toBeGreaterThanOrEqual(header!.y+header!.height);await expect(page.locator(".sound-transport")).toHaveAttribute("aria-pressed","false");
});
