import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://www.orkneyharbours.com' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/dashboard', { waitUntil: 'networkidle' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

/*
NOTES:
- Not sure where to start with this one yet, the Basecamp post suggested there would likely
  be some template code tweaks needed. So I've laid off it for now.
*/