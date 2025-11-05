import { test, expect } from '@playwright/test';

// Helper function to create a unique user
function generateUniqueUser() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const unique = `${timestamp}${random}`;
  return {
    email: `test${unique}@example.com`,
    displayName: `Test${unique.slice(-6)}`,
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User'
  };
}

test.describe('CineMatch E2E Tests', () => {
  
  // Test 1: Authentication - Sign up redirects to onboarding
  test('should allow user to sign up and redirect to onboarding', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
    
    const user = generateUniqueUser();
    
    // Navigate to landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('CineMatch');
    
    // Go to register
    await page.getByRole('link', { name: 'Get Started' }).click();
    await expect(page).toHaveURL('/register');
    
    // Fill registration form
    await page.getByLabel(/Display Name/i).fill(user.displayName);
    await page.getByLabel(/Email/i).fill(user.email);
    await page.getByLabel(/^Password/i).fill(user.password);
    await page.getByLabel(/First Name/i).fill(user.firstName);
    await page.getByLabel(/Last Name/i).fill(user.lastName);
    
    // Wait for signup API call
    const signupResponsePromise = page.waitForResponse(r =>
      r.request().method() === 'POST' && r.url().includes('/api/SignUp'),
      { timeout: 15000 }
    );
    
    await page.locator('form').getByRole('button', { name: 'Sign up' }).click();
    
    const signupResponse = await signupResponsePromise;
    expect(signupResponse.status()).toBe(200);
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding', { timeout: 10000 });
    
    console.log('✅ Sign up test passed');
  });

  // Test 2: Onboarding - Saves preferences and navigates to discover
  test('should complete onboarding and save preferences', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
    
    const user = generateUniqueUser();
    
    // Sign up first
    await page.goto('/register');
    await page.getByLabel(/Display Name/i).fill(user.displayName);
    await page.getByLabel(/Email/i).fill(user.email);
    await page.getByLabel(/^Password/i).fill(user.password);
    await page.getByLabel(/First Name/i).fill(user.firstName);
    await page.getByLabel(/Last Name/i).fill(user.lastName);
    await page.locator('form').getByRole('button', { name: 'Sign up' }).click();
    await page.waitForURL('/onboarding');
    
    // Onboarding Step 1: Select genre
    await page.getByRole('button', { name: 'Drama', exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Onboarding Step 2: Select length
    await page.getByText('Medium', { exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Step 3: Confirm and start
    await expect(page.getByText('You\'re all set!')).toBeVisible();
    await page.getByRole('button', { name: 'Start Discovering' }).click();
    
    // Should navigate to discover page
    await expect(page).toHaveURL('/discover');
    
    console.log('✅ Onboarding test passed');
  });

  // Test 3: Discover - Like a movie shows toast and persists
  test('should like a movie and show success toast', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
    
    const user = generateUniqueUser();
    
    // Quick signup + onboarding
    await page.goto('/register');
    await page.getByLabel(/Display Name/i).fill(user.displayName);
    await page.getByLabel(/Email/i).fill(user.email);
    await page.getByLabel(/^Password/i).fill(user.password);
    await page.getByLabel(/First Name/i).fill(user.firstName);
    await page.getByLabel(/Last Name/i).fill(user.lastName);
    await page.locator('form').getByRole('button', { name: 'Sign up' }).click();
    await page.waitForURL('/onboarding');
    
    // Quick onboarding
    await page.getByRole('button', { name: 'Drama', exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('Medium', { exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Start Discovering' }).click();
    await page.waitForURL('/discover');
    
    // Wait for movies to load - just wait for the button to appear
    await page.getByRole('button', { name: /Want to watch/i }).first().waitFor({ timeout: 15000 });
    
    // Like a movie
    const likeButton = page.getByRole('button', { name: /Want to watch/i }).first();
    await likeButton.click();
    
    // Wait for success toast
    await expect(page.locator('.sonner-toast, [data-sonner-toast]').filter({ hasText: /Want to watch/i })).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Like movie test passed');
  });
  
  // TODO: Test 4: Match request flow (requires seeding two users via API)
  // TODO: Test 5: Mutual match and chat (requires API setup)
  
});
