import { chromium } from "playwright-core";
import fs from "fs";

async function run() {
  console.log("Starting Chrome browser audit for number board...");
  const browser = await chromium.launch({ headless: true, channel: "chrome" });

  if (!fs.existsSync("public/audit")) {
    fs.mkdirSync("public/audit", { recursive: true });
  }

  // --- 1. MOBILE TEST (390 x 844) ---
  console.log("1. Testing Mobile Viewport (390x844)...");
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    isMobile: true,
  });
  const pageM = await mobileCtx.newPage();
  await pageM.goto("http://localhost:3000", { waitUntil: "networkidle" });

  // Wait for counter animation to finish (duration is 1.4s, wait 1.8s)
  await pageM.waitForTimeout(1800);

  // Take screenshot of mobile top region with stats board + buttons
  await pageM.screenshot({
    path: "public/audit/mobile-number-board-animated.png",
    clip: { x: 0, y: 0, width: 390, height: 480 },
  });
  console.log("Saved: public/audit/mobile-number-board-animated.png");

  // Verify mobile text values
  const mobileText = await pageM.locator("section[role='region'], section").allInnerTexts();
  console.log("Mobile section texts:", mobileText);

  // Test Sinhala language switch on mobile
  console.log("Switching to Sinhala language...");
  const langBtn = pageM.locator("button:has-text('සිං'), button:has-text('EN')").first();
  if (await langBtn.isVisible()) {
    await langBtn.click();
    await pageM.waitForTimeout(500);
    await pageM.screenshot({
      path: "public/audit/mobile-number-board-sinhala.png",
      clip: { x: 0, y: 0, width: 390, height: 480 },
    });
    console.log("Saved: public/audit/mobile-number-board-sinhala.png");
  }

  // Test scrolling down and back up
  console.log("Testing scroll interaction...");
  await pageM.evaluate(() => window.scrollTo(0, 1000));
  await pageM.waitForTimeout(600);
  await pageM.evaluate(() => window.scrollTo(0, 0));
  await pageM.waitForTimeout(1800);

  await pageM.screenshot({
    path: "public/audit/mobile-after-scroll.png",
    clip: { x: 0, y: 0, width: 390, height: 480 },
  });
  console.log("Saved: public/audit/mobile-after-scroll.png");

  await mobileCtx.close();

  // --- 2. DESKTOP TEST (1440 x 900) ---
  console.log("2. Testing Desktop Viewport (1440x900)...");
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const pageD = await desktopCtx.newPage();
  await pageD.goto("http://localhost:3000", { waitUntil: "networkidle" });

  await pageD.waitForTimeout(1800);

  await pageD.screenshot({
    path: "public/audit/desktop-number-board-animated.png",
    clip: { x: 0, y: 0, width: 1440, height: 520 },
  });
  console.log("Saved: public/audit/desktop-number-board-animated.png");

  // Switch to Sinhala on desktop
  const desktopLangBtn = pageD.locator("button:has-text('සිං')").first();
  if (await desktopLangBtn.isVisible()) {
    await desktopLangBtn.click();
    await pageD.waitForTimeout(500);
    await pageD.screenshot({
      path: "public/audit/desktop-number-board-sinhala.png",
      clip: { x: 0, y: 0, width: 1440, height: 520 },
    });
    console.log("Saved: public/audit/desktop-number-board-sinhala.png");
  }

  await desktopCtx.close();
  await browser.close();
  console.log("Browser test completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
