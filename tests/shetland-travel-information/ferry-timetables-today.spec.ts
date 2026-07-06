import { test, expect } from '@playwright/test';

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('https://travel.shetland.org', { waitUntil: 'networkidle' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

test('test that the ferry timetables are outputting for the current day', async ({ page }) => {
  // Navigate to the ferry timetables, then click display journeys
  await page.getByRole('link', { name: 'FERRY TIMETABLES', exact: true }).click();
  await page.getByRole('link', { name: 'DISPLAY JOURNEYS' }).click();

  // Check that the red 'No journeys...' pop-up isn't appearing
  await expect(page.locator('p.red')).not.toBeVisible();

  // Locate and count all the journeys and check the total is >0
  const journeys = page.locator('ul.times li');
  //console.log(await journeys.allTextContents())
  // debug line ^
  expect(await journeys.count()).toBeGreaterThan(0);
});

/* 
NOTES: 
- Most ferry services, e.g. Yell, Unst, Fetlar, Whalsay, Bressay, all have services Mon-Sun. 
  But services like Papa Stour, Foula, Skerries, Fair Isle, don't run every day of the week.

- Tests are based around the Mon-Sun services, and check that for any day of the week the 
  ferries are displaying journeys after a search.
*/