import { test, expect } from "@playwright/test";
import { mockSpotify } from "./spotify-fixture";
for(const width of [1440,390]){
 test(`full-screen viewers, pre-orders and booking links at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:850});await page.emulateMedia({reducedMotion:"reduce"});await mockSpotify(page,true);
  await page.goto('/shop');await page.getByRole('button',{name:'View Mob Socks',exact:true}).click();
  let dialog=page.getByRole('dialog');expect((await dialog.boundingBox())!.width).toBeGreaterThan(width*.98);
  await dialog.getByRole('button',{name:'Add to wishlist',exact:true}).click();await dialog.getByRole('button',{name:'Pre-order',exact:true}).click();await expect(dialog.getByRole('status')).toContainText('No payment or order has been sent');
  await page.keyboard.press('Escape');await page.reload();await page.getByRole('button',{name:'Open wishlist, 1 items',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('Pre-order selections');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'View Lineup Tee',exact:true}).click();dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'Enlarge product photograph'}).click();await expect(dialog.locator('.merch-product-copy')).not.toBeVisible();await dialog.evaluate(n=>{n.scrollTop=n.scrollHeight;});await expect(dialog.getByRole("button",{name:"Next product →",exact:true})).toBeInViewport();await expect(dialog.locator('.merch-large-image')).toHaveCSS('object-fit','contain');await page.keyboard.press('ArrowRight');await expect(dialog.getByRole('heading',{name:'Portrait Tank',exact:true})).toBeVisible();await page.keyboard.press('Escape');
  for(const path of ['/the-mob','/music','/visuals']){await page.goto(path);await expect(page.getByRole('navigation',{name:'Continue exploring'}).getByRole('link',{name:'Book the Mob'})).toHaveAttribute('href','/business');await expect(page.locator('.footer-wordmark')).toHaveCount(0);}
  await page.goto('/the-mob');await expect(page.locator('.artist-card img').first()).toHaveAttribute('src',/trophy-2026/);const trigger=page.getByRole('button',{name:'Open Trophy profile',exact:true});await trigger.click();dialog=page.getByRole('dialog');expect((await dialog.boundingBox())!.width).toBeGreaterThan(width*.98);await dialog.getByRole('button',{name:'Next artist →',exact:true}).click();await expect(dialog.getByRole('heading',{name:'Orieblxckmaestro',exact:true})).toBeVisible();await dialog.evaluate(n=>{n.scrollTop=n.scrollHeight;});await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
 });
}
