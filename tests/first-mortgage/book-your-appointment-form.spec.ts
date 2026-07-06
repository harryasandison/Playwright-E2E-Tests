import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://www.firstmortgage.co.uk' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/book/', { waitUntil: 'domcontentloaded' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

test('book your appointment form is visible and functional', async ({ page }) => {
  // Find the location entry box and fill it out
  const postcodeInput = page.getByRole('searchbox', { name: 'Start typing your postcode,' });
  await expect(postcodeInput).toBeVisible();
  await postcodeInput.fill('Edinburgh');
  // Choose the Edinburgh option that appears in the dropdown
  await page.getByRole('link', { name: 'Edinburgh, City of Edinburgh' }).click();

  // Find the dropdown and pick a branch
  await expect(page.getByLabel('Select a First Mortgage Branch')).toBeVisible();
  await page.getByLabel('Select a First Mortgage Branch').selectOption('Edinburgh Leith');

  // Find the first name text box and fill it in
  const firstName = page.getByRole('textbox', { name: 'First Name' });
  await expect(firstName).toBeVisible();
  await firstName.fill('Joe');

  // Find the second name text box and fill it in
  const lastName = page.getByRole('textbox', { name: 'Last Name' });
  await expect(lastName).toBeVisible();
  await lastName.fill('Bloggs');

  // Find the email address text box and fill it in
  const emailAddress =  page.getByRole('textbox', { name: 'Email Address' });
  await expect(emailAddress).toBeVisible();
  await emailAddress.fill('test@example.com');

  // Find the contact number text box and fill it in
  const contactNo = page.getByRole('textbox', { name: 'Contact Number' });
  await expect(contactNo).toBeVisible();
  await contactNo.fill('01234 567890');

  // Find the message text box and fill it in
  const textBox = page.getByRole('textbox', { name : 'Message' });
  await expect(textBox).toBeVisible();
  await textBox.fill('This is a test run.');
  
  // Check whether the 'I am a first-time buyer' option for advice is visible
  await page.waitForSelector('text=I am a first-time buyer', { state: 'visible' });

  // Check whether the Cloudflare popup is displaying on the screen
  await expect(page.locator('.cf-turnstile')).toBeVisible();

  // Find the submit button and check if it is enabled
  const submitButton = page.getByRole('button', { name: /submit/i });
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toBeEnabled();
});

/* 
NOTES:
- For this test I can't actually submit the form without sending a real request to the
  owners of the site. There may be a way to simulate it with Playwright but I haven't
  been able to work that out as of yet.

- Another thing that isn't possible with Playwright is handling the Cloudflare 
  verification before submission. So even if you could find a way to simulate submitting
  the form, the agent would always fail on that part since it would flag it as not 
  human.

- Besides all of that, this test just checks if elements are visible on the page
  before going through the process of filling the form.
*/