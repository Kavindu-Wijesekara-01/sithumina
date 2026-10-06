import { chromium } from "playwright-core";

async function run() {
  const browser = await chromium.launch({ headless: true, channel: "msedge" });

  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    isMobile: true,
  });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await pageMobile.waitForTimeout(1000);

  const headerMobile = pageMobile.locator("header").first();
  await headerMobile.screenshot({ path: "public/audit/navbar-mobile-with-top-logo.png" });
  console.log("Mobile navbar screenshot saved: public/audit/navbar-mobile-with-top-logo.png");

  await pageMobile.screenshot({
    path: "public/audit/page-mobile-top.png",
    clip: { x: 0, y: 0, width: 390, height: 420 },
  });
  console.log("Page mobile top screenshot saved: public/audit/page-mobile-top.png");

  await browser.close();
  console.log("Mobile tests finished!");
}

run().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
