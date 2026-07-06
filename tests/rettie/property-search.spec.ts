import { test, expect } from '@playwright/test';

test.use({ baseURL: 'https://www.rettie.co.uk' });

// This section runs before each test in this folder, ensuring that we start from the same page and handle any cookie consent pop-ups
test.beforeEach(async ({ page }) => {
  await page.goto('/property-sale', { waitUntil: 'domcontentloaded' });
  const allowAll = page.getByRole('button', { name: /Accept all/i }); // The name might have to be changed here depending on the site
  await allowAll.waitFor({ timeout: 5000 }).catch(() => {});
  if (await allowAll.isVisible()) {
    await allowAll.click();
  }
});

/* ------------------------------------------------------------------------------------------------- */

test('default search with no filters returns results', async ({ page }) => {
    // Locate the search button and click it
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Locate and count the listings
    const listings = page.getByText(/\d+(-\d+)?\s*Bedroom/i).filter({ hasNotText: /properties/i });
    await listings.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await listings.count() 

    // Expect there to be listings appearing on the page
    expect(count).toBeGreaterThan(0)
})

/* ------------------------------------------------------------------------------------------------- */

// Filter by a type of property (house), and check if the results match
test('filtering by property type returns results', async ({ page }) => {
    // Pick house as the type of property and then search
    await page.getByRole('button', { name: 'Type Caret-down' }).click();
    await page.getByText('House', { exact: true }).click();
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Make sure the test is only picking property listing cards
    const propertyTypes = page.getByText(/\d+(-\d+)?\s*Bedroom/i).filter({ hasNotText: /properties/i });
    await propertyTypes.first().waitFor({ state: 'visible', timeout: 10000 });
    // Count the results on the page, and expect that to be greater than 0
    const count = await propertyTypes.count()
    expect(count).toBeGreaterThan(0);

    // Extract text for the listing
    const propertyTexts = await propertyTypes.allTextContents();
    // console.log(await propertyTypes.allTextContents()) 

    // For all properties on the page, make sure they contain 'house'
    for (const property of propertyTexts) {
        expect(property.toLowerCase()).toContain('house')
    }
});

/* ------------------------------------------------------------------------------------------------- */

test('filtering by number of bedrooms returns results', async ({ page }) => {
    // Set the number of bedrooms and search
    await page.getByLabel('Bedrooms').selectOption('2');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    const bedrooms = page.getByText(/\d+(-\d+)?\s*Bedroom/i).filter({ hasNotText: /properties/i });
    await bedrooms.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await bedrooms.count()
    expect(count).toBeGreaterThan(0);

    const bedroomTexts = await bedrooms.allTextContents();

    for (const text of bedroomTexts) {
        const numbers = text.match(/\d+/g)?.map(Number) ?? [];
        expect(numbers).toContain(2);
    }
});

/* ------------------------------------------------------------------------------------------------- */

test('filtering by minimum price returns results', async ({ page }) => {
    // Set the minimum price filter and search properties
    await page.getByLabel('Min Price').selectOption('500000');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Count the number of search results and verify that it is greater than 0
    const prices = page.locator('[class^="property-price-"]');
    await prices.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await prices.count()
    expect(count).toBeGreaterThan(0);   

    // Extract price values from the search results
    const priceTexts = await prices.allTextContents();
    const priceValues = priceTexts.map(text => parseInt(text.replace(/[^0-9]/g, ''), 10));
    
    // For each price value, check that it is greater than or equal to the minimum price
    for (const price of priceValues) {
        expect(price).toBeGreaterThanOrEqual(500000);
    }
});

/* ------------------------------------------------------------------------------------------------- */

test('filtering by maximum price returns results', async ({ page }) => {
    // Set the maximum price filter and search properties
    await page.getByLabel('Max Price').selectOption('1000000');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Verify that the search results contain properties with prices less than or equal to the specified maximum price
    const prices = page.locator('[class^="property-price-"]');
    await prices.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await prices.count()
    expect(count).toBeGreaterThan(0);

    // Extract price values from the search results
    const priceTexts = await prices.allTextContents();  
    const priceValues = priceTexts.map(text => parseInt(text.replace(/[^0-9]/g, ''), 10));

    // For each price value, check that it is less than or equal to the maximum price
    for (const price of priceValues) {
        expect(price).toBeLessThanOrEqual(1000000);
    }
});

/* ------------------------------------------------------------------------------------------------- */

test('filtering by ranged price returns results', async ({ page }) => {
    // Set both price filters within a range and search properties
    await page.getByLabel('Min Price').selectOption('500000');
    await page.getByLabel('Max Price').selectOption('1500000');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Verify that the search results contain properties within the specified price range
    const prices = page.locator('[class^="property-price-"]');
    await prices.first().waitFor({ state: 'visible', timeout: 10000 });
    const count = await prices.count()
    expect(count).toBeGreaterThan(0);

    // Extract price values from the search results
    const priceTexts = await prices.allTextContents();  
    const priceValues = priceTexts.map(text => parseInt(text.replace(/[^0-9]/g, ''), 10));

    // For each price value, check that it is within the price range
    for (const price of priceValues) {
        expect(price).toBeGreaterThanOrEqual(500000);
        expect(price).toBeLessThanOrEqual(1500000);
    }
});

/* ------------------------------------------------------------------------------------------------- */

test('filtering by location returns results', async ({ page }) => {
    await page.getByPlaceholder('Search location, postcode, property name or street').fill('Edinburgh');
    await page.getByRole('button', { name: 'Edinburgh, City Of Edinburgh' }).click();
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    const listings = page.getByText(/\d+(-\d+)?\s*Bedroom/i).filter({ hasNotText: /properties/i });
    await listings.first().waitFor({ state: 'visible', timeout: 10000 });
    expect(await listings.count()).toBeGreaterThan(0);
});

/*
NOTES:
- You'll see in some of the tests I had to parse the strings to find what part of the 
  listing I wanted. Sometimes without strict parsing, the agent will pick all the 
  things you're targetting + more. 
  In my case, because it was counting/storing things that weren't just listings, if the 
  search functionality function did stop working then the tests would still pass as expected.
  It doesn't happen often, but it's worth knowing anyway.

*/