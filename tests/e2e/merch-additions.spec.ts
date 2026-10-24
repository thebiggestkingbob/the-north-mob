import { expect,test } from "@playwright/test";
import { money } from "../../src/config/merch";
for(const width of [1440,390])test(`new merchandise prices, views and local pre-orders at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:"reduce"});await page.addInitScript(()=>sessionStorage.setItem('northmob:sound','off'));await page.goto('/shop');
 await expect(page.locator('.merch-collection-count')).toHaveText('18 objects / collection');
 for(const [name,price,images] of [['Mob Cap',24900,1],['Mob String Bucket Hat',39900,1],['H4B Worksuit',109900,4]] as const){
  const card=page.getByRole('button',{name:`View ${name}`,exact:true});await card.click();const dialog=page.getByRole('dialog');await expect(dialog.locator('.merch-detail-price')).toHaveText(money(price));await expect(dialog.locator('.merch-large-image')).toHaveCSS('object-fit','contain');
  await expect(dialog.getByRole('button',{name:'Add to cart',exact:true})).toHaveCount(0);await dialog.getByRole('button',{name:'Pre-order',exact:true}).click();await expect(dialog.getByRole('status')).toContainText('No payment or order has been sent');
  if(images===4){await expect(dialog.locator('.merch-edition')).toHaveText('Limited Edition');await expect(dialog.locator('.merch-thumbnails button')).toHaveCount(4);await dialog.getByRole('button',{name:'View 4 of H4B Worksuit',exact:true}).click();await expect(dialog.locator('.merch-large-image')).toHaveAttribute('src',/15\.3/);}
  await page.keyboard.press('Escape');
 }
 await page.reload();await page.getByRole('button',{name:'Open saved items, 3 items',exact:true}).click();await expect(page.getByRole('dialog').locator('.merch-preorders .button').filter({hasText:/Mob Cap|Mob String Bucket Hat|H4B Worksuit/})).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
