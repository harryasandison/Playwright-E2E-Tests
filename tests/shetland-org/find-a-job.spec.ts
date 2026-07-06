import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://www.shetland.org' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/life/work/find-a-job', { waitUntil: 'networkidle' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

test('test that both NHS and SIC job listings are visible', async ({ page }) => {
  // Check that both NHS and SIC job listings are present on the page, using the alt text to identify them
  await page.getByAltText('Shetland Islands Council').first().scrollIntoViewIfNeeded();
  await expect(page.getByAltText('Shetland Islands Council').first()).toBeVisible({ timeout: 10000 });
  await page.getByAltText('NHS Shetland').first().scrollIntoViewIfNeeded();
  await expect(page.getByAltText('NHS Shetland').first()).toBeVisible({ timeout: 10000 });
});

/*  NOTES:
    - The first() function selects the first instance of the element you're looking for. Here it just means
      it doesn't go through and check every listing, just until it finds what it's looking for. This works, but
      maybe if we wanted a firmer check we could count a few more (e.g. 3) then assert that they found more.

    - This was the first page I had to use scrollIntoViewIfNeeded(). I used the logos as locators to distinguish
      between a NHS or SIC listing, but because those images were on lazy loading they had to be scrolled into view
      to be found. Another thing that tripped me up worth knowing.
    */