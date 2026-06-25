import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)' });
  await page.goto('http://localhost:8080/#/explorer');
  await page.waitForTimeout(3000);
  await page.click('button:has-text("Apartments")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/mnt/documents/explorer-filters-mobile-v2.png', fullPage: false });
  await browser.close();
  console.log('Mobile screenshot saved');
})();
