import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  try {
    await page.goto('https://example.com');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    expect(title).toBe('Example Domain');
  } catch (error) {
    console.error('Test error:', error);
    throw error;
  }
});