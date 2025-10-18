import { test, expect } from '@playwright/test';

test.describe('CineMatch E2E', () => {
  test('complete user flow with mocked data', async ({ page }) => {
    // Start at landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('CineMatch');
    
    // Click sign up
    await page.getByRole('link', { name: 'Get Started' }).click();
    await expect(page).toHaveURL('/register');
    
    // Fill registration form
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign up' }).click();
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding');
    
    // Step 1: Select genre
    await page.getByRole('button', { name: 'Drama' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Step 2: Select length
    await page.getByText('Medium').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Step 3: Confirm and start
    await expect(page.getByText('You\'re all set!')).toBeVisible();
    await page.getByRole('button', { name: 'Start Discovering' }).click();
    
    // Should be on discover page
    await expect(page).toHaveURL('/discover');
    await expect(page.getByText('Pick movies you\'d watch tonight')).toBeVisible();
    
    // Like at least one movie
    const likeButtons = page.getByRole('button', { name: /Like/i });
    await likeButtons.first().click();
    
    // Wait for toast
    await expect(page.getByText(/Liked/i)).toBeVisible();
    
    console.log('✅ E2E test passed: User can sign up, complete onboarding, and interact with movie deck');
  });
});
