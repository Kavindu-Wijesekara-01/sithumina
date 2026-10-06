import { chromium } from "playwright-core";

async function verify() {
  console.log("Launching Chrome browser for UX and console audit...");
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: "chrome" });
  } catch {
    browser = await chromium.launch({ headless: true, channel: "msedge" });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  // 1. Audit Home Page & Live Map
  console.log("Auditing Home Page http://localhost:3000/ ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const liveBadgeText = await page.locator("#live-map").innerText();
  console.log("Live Map container rendered successfully!", liveBadgeText.slice(0, 30));
  await page.screenshot({ path: "public/audit/home-live-map-sync.png" });

  // 2. Audit Manage / Admin Dashboard
  console.log("Auditing Admin Dashboard http://localhost:3000/manage ...");
  await page.goto("http://localhost:3000/manage", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: "public/audit/manage-fleet-tab.png" });

  // Click on Registered Drivers tab
  const driversTab = page.locator("button:has-text('Registered Drivers')");
  if (await driversTab.count() > 0) {
    await driversTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "public/audit/manage-registered-drivers-tab.png" });
    console.log("Registered Drivers tab opened and screenshot captured.");
  }

  await browser.close();

  console.log("--- AUDIT RESULTS ---");
  console.log("Console Errors:", consoleErrors.length);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((e) => console.log(" - Error:", e));
  }
  console.log("Page Errors:", pageErrors.length);
  if (pageErrors.length > 0) {
    pageErrors.forEach((e) => console.log(" - Error:", e));
  }

  if (consoleErrors.length === 0 && pageErrors.length === 0) {
    console.log("AUDIT PASSED: 0 console errors, 0 page errors!");
  }
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
