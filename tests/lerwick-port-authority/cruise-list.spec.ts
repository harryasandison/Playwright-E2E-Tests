import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://www.lerwick-harbour.co.uk' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/sectors/cruise/2026', { waitUntil: 'networkidle' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

test('test that the cruise list is currently available', async ({ page }) => {
  // Check whether the error pop-up is displaying
   await expect(page.getByText(/Our Cruise List is currently unavailable/i)).not.toBeVisible();

   // Count the cruises displayed on screen and check if that is greater than 0
   const cruiseItems = page.locator('[class^="uk-card-body"]');
   expect(await cruiseItems.count()).toBeGreaterThan(0);
});

/*
NOTES:
- Don't think there is anything notable to add here. All this test does is first, check
  whether the text for the pop-up is appearing. Next it'll check if the cruise cards are
  displaying. If both pass then the test passes too.
*/