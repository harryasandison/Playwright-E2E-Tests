import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://www.lerwick-harbour.co.uk' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/today', { waitUntil: 'domcontentloaded' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

test('webcams are visible and loading on the today page', async ({ page }) => {
  // Verify that the first webcam is visible and click on it
  const webcam1 = page.locator('#player_webcam1_html5_api');
  await expect(webcam1).toBeVisible();
  await webcam1.click();

  // Verify that the second webcam is visible and click on it
  const webcam2 = page.locator('#player_webcam2_html5_api');
  await expect(webcam1).toBeVisible();
  await webcam1.click();
});

/*
NOTES:
- I forgot to paste the cookie handling snippet from other tests, but this works just fine 
  without it at the moment. If it does break though, after an update to the site that 
  could potentially be the issue?

- I wasn't sure what happpens on the page when the webcams go down. For the cruise list, 
  there was that pop-up that would appear if they were down. It would maybe be worth 
  adding another assertion that the pop-up (if there is one), is not visible on the
  screen. That might be adding unecessary complexity for little gain though, it already
  works as is.
*/