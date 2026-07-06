import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://emec.nbcom.co.uk' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/our-work/live-data/wave-data', { waitUntil: 'networkidle' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

test('live wave data displays up to date results', async ({ page }) => { 
  // Locate using just the 'Update:' portion of the text
  const updatedText = page.getByText(/Updated: \d{4}-\d{2}-\d{2}/);
  await expect(updatedText).toBeVisible();

  // Extract date portion and add to the array
  const text = await updatedText.textContent();
  const match = text?.match(/Updated: (\d{4}-\d{2}-\d{2})/);
  expect(match).not.toBeNull();

    // Compare just the date portion, not time
  const updatedDate = new Date(match![1]);
  const today = new Date();
  expect(updatedDate.toDateString()).toBe(today.toDateString());
});

/*
NOTES:
- On the EMEC site it appears the wave data updates everyday at 10:00. This is fine, 
  but with the way this test is built at the moment the GitHub actions runner would
  flag this as a fail.
- Since the agent runs in the early morning before 10, the dates might not match at
  the time. I could change it so that it can pass if it is one day behind as well?
  Not sure what the best practice would be here.
*/