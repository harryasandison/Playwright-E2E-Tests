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

test('test that the bus timteables are outputting for the current day', async ({ page }) => {
  // Get the current day of the week and skip if it is a Sunday
  const day = new Date().getDay();
  test.skip(day === 0, 'Skipping on Sundays, no bus services');

  // Navigate to the bus timetables tab then display the list of journeys
  await page.getByRole('link', { name: 'BUS TIMETABLES', exact: true }).click();
  await page.getByRole('link', { name: 'DISPLAY JOURNEYS' }).click();

  // Check that the red ' No journeys...' text isn't appearing
  await expect(page.locator('p.red')).not.toBeVisible();

  // Count all the journeys on the screen and check the total is >0
  const journeys = page.locator('[id^="validJourney"]');
  expect(await journeys.count()).toBeGreaterThan(0);
});

/* 
NOTES: 
- These tests only check for services running Mon-Sat although, there are some services 
  that still run on a Sunday, like those to Sumburgh or North Isles.
- I noticed when you search anything on the site it shows not only the journeys from
  your selected service, but also the return journey times too. I don't think it will be an
  issue because it still checks for the 'No journeys...' pop-up everytime it runs, but if
  it does start failing for what seems like no reason it could possibly be that.
*/