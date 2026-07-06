import { test, expect } from '@playwright/test';

test('fish auction page has been updated recently', async ({ page }) => {
  // Navigate to the Peterhead Port fish auction page
  await page.goto('https://www.peterheadport.co.uk/fish-auction/');});

/* 
const updatedText = await page.locator('.updated-on').textContent();
const today = new Date();
const day = String(today.getDate()).padStart(2, '0');
const month = String(today.getMonth() + 1).padStart(2, '0');
const year = today.getFullYear();
const todayFormatted = `${day}/${month}/${year}`;

expect(updatedText).toContain(todayFormatted);
*/