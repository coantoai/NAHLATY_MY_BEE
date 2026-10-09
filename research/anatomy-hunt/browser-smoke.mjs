import {chromium} from "playwright";
import fs from "node:fs/promises";
const out="research/anatomy-hunt/out";
await fs.mkdir(out,{recursive:true});
const report={runAt:new Date().toISOString(),repo:"slorksmo/Human-Atlas",checks:[],errors:[],visuals:[]};
let browser;
try {
  browser=await chromium.launch({headless:true,args:["--disable-dev-shm-usage","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
  const ctx=await browser.newContext({viewport:{width:1365,height:860},deviceScaleFactor:1});
  const page=await ctx.newPage();
  page.on("pageerror",e=>report.errors.push(String(e).slice(0,400)));
  await page.goto("http://127.0.0.1:8877",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForSelector("canvas",{timeout:120000});
  await page.waitForFunction(()=>document.querySelector(".identity-meta")?.textContent?.includes("2,234"),{timeout:120000});
  report.checks.push({name:"male catalog and WebGL canvas",pass:true});
  await page.waitForTimeout(3500);
  await page.screenshot({path:out+"/atlas-male.png",animations:"disabled"});
  report.visuals.push("atlas-male.png");
  const before=await page.locator("canvas").screenshot();
  const slider=page.getByRole("slider").first();
  await slider.focus();
  await slider.press("End");
  await page.waitForTimeout(2200);
  await page.screenshot({path:out+"/atlas-male-exploded.png",animations:"disabled"});
  report.visuals.push("atlas-male-exploded.png");
  const val=await page.locator(".explode-control output").innerText();
  report.checks.push({name:"exploded anatomy UI",pass:val.includes("100"),output:val});
  await page.getByRole("button",{name:"Language"}).click();
  await page.waitForTimeout(1300);
  const ar=await page.evaluate(()=>({lang:document.documentElement.lang,dir:document.documentElement.dir,heading:document.querySelector("h1")?.innerText}));
  report.checks.push({name:"Arabic RTL",pass:ar.lang==="ar"&&ar.dir==="rtl",result:ar});
  await page.screenshot({path:out+"/atlas-arabic.png",animations:"disabled"});
  report.visuals.push("atlas-arabic.png");
  // Return to English and exercise the reference-body selector
  await page.getByRole("button",{name:"اللغة"}).click();
  await page.getByRole("combobox",{name:"Reference body"}).click();
  await page.getByRole("option",{name:/female/i}).click();
  await page.waitForFunction(()=>document.querySelector(".identity-meta")?.textContent?.includes("1,220"),{timeout:120000});
  await page.waitForTimeout(4500);
  await page.screenshot({path:out+"/atlas-female.png",animations:"disabled"});
  report.visuals.push("atlas-female.png");
  report.checks.push({name:"female catalog and 3D",pass:!!(await page.locator("canvas").count())});
  report.browserErrors=report.errors.length;
  await ctx.close();

  const site=await browser.newPage({viewport:{width:1365,height:860}});
  try{
    await site.goto("https://simularium.allencell.org/",{waitUntil:"domcontentloaded",timeout:35000});
    await site.waitForTimeout(9000);
    const state=await site.evaluate(()=>({title:document.title,canvas:document.querySelectorAll("canvas").length,bodyLength:document.body.innerText.length}));
    await site.screenshot({path:out+"/simularium-live.png",animations:"disabled"});
    report.simularium={reachable:true,...state};
  }catch(e){report.simularium={reachable:false,error:String(e).slice(0,400)};}
  await site.close();
}catch(e){report.fatal=String(e);}
finally{if(browser)await browser.close();await fs.writeFile(out+"/browser-report.json",JSON.stringify(report,null,2)+"\n");console.log(JSON.stringify(report,null,2));}
