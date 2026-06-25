import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8080/#/explorer');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/mnt/documents/explorer-filters-v2.png', fullPage: false });
  await browser.close();
  console.log('Default screenshot saved');
})();
