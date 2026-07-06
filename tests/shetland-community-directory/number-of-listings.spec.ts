import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://www.shetlandcommunitydirectory.co.uk' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/listings', { waitUntil: 'networkidle' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

test('listings search returns results within expected range', async ({ page }) => {
  const filterButton = page.getByRole('radio', { name: 'Include national services active in Shetland' });
  await filterButton.check();
  await page.getByRole('button', {name : 'Search'}).click();
  
  const resultText = await page.locator('.uk-text-lead').filter({ hasText: /results/i }).textContent() ?? ''; 
  const match = resultText.match(/(\d+)\s+results/i);
  expect(match).not.toBeNull();
  const count = parseInt(match![1], 10);
    
  expect(count).toBeGreaterThan(100);
  expect(count).toBeLessThan(2000);
});

/*
NOTES:
- I wasn't 100% sure what sort of range would be an expected one. At the time of this note, there are
  only 339 results for Shetland with no filter and then 1450 with Shetland + National. 

- I left it between 100 - 2000 just now, but that can be changed if need be. The only thing I 
  filtered by was changing it so the search included national services too. If we need to check
  more of the search functionality it can be changed, but those work for now.
*/