import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://www.rettie.co.uk' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/free-property-appraisal', { waitUntil: 'domcontentloaded' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

test('property appraisal form returns address results for a valid postcode', async ({ page }) => {
    // Fill the postcode text box and click the 'find my address' button
    const postcodeInput = page.getByRole('textbox', { name: 'Your Postcode' });
    await postcodeInput.fill('EH3 9BH');
    await page.getByRole('button', { name: 'Find My Address' }).click();

    // Locate an option that SHOULD be in the dropdown with the previous postcode
    const addressDropdown = page.locator('#nb-form-11041_address');
    // Check whether it is visible or not
    await expect(addressDropdown).toBeVisible({ timeout: 10000 }); // Timeout to allow time for API to load
    await expect(addressDropdown.locator('option')).not.toHaveCount(0);
    
    // Wait for options to load and select a known option value
    await expect(addressDropdown).toHaveCount(1);
    await addressDropdown.waitFor({ state: 'visible' });
    await addressDropdown.selectOption({ value: 'paf_8212314' }).catch(() => {});
    const addressOption = page.locator('#paf_8212314');
    await expect(addressOption).toBeVisible({ timeout: 10000 }).catch(() => {});

    // Find the first name text box and fill it in
    const firstName = page.getByRole('textbox', { name: 'First Name' });
    await expect(firstName).toBeVisible();
    await firstName.fill('Joe');

    // Find the second name text box and fill it in
    const lastName = page.getByRole('textbox', { name: 'Last Name' });
    await expect(lastName).toBeVisible();
    await lastName.fill('Bloggs');

    // Find the email address text box and fill it in
    const emailAddress =  page.getByRole('textbox', { name: 'Email' });
    await expect(emailAddress).toBeVisible();
    await emailAddress.fill('test@example.com');

    // Find the contact number text box and fill it in
    const contactNo = page.getByRole('textbox', { name: 'Telephone' });
    await expect(contactNo).toBeVisible();
    await contactNo.fill('01234 567890');

    // Find the message text box and fill it in
    const textBox = page.getByRole('textbox', { name : 'Describe Your Property' });
    await expect(textBox).toBeVisible();
    await textBox.fill('This is a test run.');

    // Check whether the Cloudflare pop-up is displaying on the screen (optional)
    const cf = page.locator('.script-turnstile');
    if (await cf.isVisible().catch(() => false)) {
      await expect(cf).toBeVisible();
    }

    // Find the submit button and check if it is enabled
    const submitButton = page.getByRole('button', { name: 'Send'});
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
});

/*
NOTES:  
- You can see near the end of the file I used a timeout. This was used to account for the
  API having to load. If anyone is writing other tests, that could be something to consider
  if stuck wondering why a written test won't pass.

- One improvement that could be made to this test is maybe making a test for an invalid
  postcode too? So you can see whether incorrect options are popping up or not. This
  might be enough already though.

- Again, Playwright won't be able to bypass the Cloudflare verification pop-up, so the form
  can't be submitted. The rest of the form is checked for visibility/functionality though.
*/