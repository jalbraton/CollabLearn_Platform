import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { test } from '@playwright/test';

describe('E2E Tests - Authentication', () => {
  test.describe('Login Flow', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('h1')).toContainText('Sign In');
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.goto('/login');
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@123');
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('text=Welcome back')).toBeVisible();
    });
  });

  test.describe('Registration Flow', () => {
    test('should display registration page', async ({ page }) => {
      await page.goto('/register');
      await expect(page.locator('h1')).toContainText('Create Account');
    });

    test('should register new user', async ({ page }) => {
      await page.goto('/register');
      
      await page.fill('input[name="name"]', 'Test User');
      await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'Test@123456');
      await page.click('button[type="submit"]');

      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });
  });
});

describe('E2E Tests - Workspaces', () => {
  test.describe('Workspace Creation', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should create new workspace', async ({ page }) => {
      await page.goto('/workspaces/new');
      
      await page.fill('input[name="name"]', `Test Workspace ${Date.now()}`);
      await page.fill('textarea[name="description"]', 'Test description');
      await page.click('input[value="PUBLIC"]');
      await page.click('button[type="submit"]');

      // Should redirect to workspace
      await expect(page).toHaveURL(/\/workspaces\/[a-zA-Z0-9-]+/);
    });

    test('should display workspace list', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should show workspaces
      await expect(page.locator('text=My Workspaces')).toBeVisible();
    });
  });

  test.describe('Page Editor', () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to workspace
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');
    });

    test('should create and edit page', async ({ page }) => {
      // Navigate to first workspace
      await page.click('a[href*="/workspaces/"]');
      
      // Create new page
      await page.click('button:has-text("New Page")');
      await page.fill('input[placeholder*="page title"]', 'Test Page');
      
      // Should open editor
      await expect(page.locator('.ProseMirror')).toBeVisible();
      
      // Type in editor
      await page.locator('.ProseMirror').fill('Test content');
      
      // Wait for auto-save
      await page.waitForTimeout(2000);
      
      // Reload and verify content persisted
      await page.reload();
      await expect(page.locator('.ProseMirror')).toContainText('Test content');
    });
  });
});

describe('E2E Tests - Collaboration', () => {
  test.describe('Comments', () => {
    test('should add and display comments', async ({ page }) => {
      // Login and navigate to page
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@123');
      await page.click('button[type="submit"]');
      
      // Navigate to a page with comments
      await page.goto('/workspaces/test-workspace/pages/test-page');
      
      // Open comments panel
      await page.click('button:has-text("Comments")');
      
      // Add comment
      await page.fill('textarea[placeholder*="comment"]', 'Test comment');
      await page.click('button:has-text("Post")');
      
      // Verify comment appears
      await expect(page.locator('text=Test comment')).toBeVisible();
    });
  });

  test.describe('Real-time Updates', () => {
    test('should show active users', async ({ page, context }) => {
      // Login first user
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@123');
      await page.click('button[type="submit"]');
      
      // Navigate to page
      await page.goto('/workspaces/test-workspace/pages/test-page');
      
      // Open second browser context (simulating second user)
      const page2 = await context.newPage();
      await page2.goto('/login');
      await page2.fill('input[name="email"]', 'test2@example.com');
      await page2.fill('input[name="password"]', 'Test@123');
      await page2.click('button[type="submit"]');
      await page2.goto('/workspaces/test-workspace/pages/test-page');
      
      // First page should show 2 active users
      await expect(page.locator('text=2 usuarios activos')).toBeVisible();
    });
  });
});
