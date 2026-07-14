import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run sequentially to avoid database lock/concurrency overlap in E2E flows
  timeout: 60000, // 60s per test to accommodate real Supabase Storage I/O
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    headless: true,
    actionTimeout: 15000, // 15s per action
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  webServer: [
    {
      command: 'dotnet run --project ../../backend/API/Villa7.API.csproj --launch-profile http',
      url: 'http://localhost:5258/api/health',
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      cwd: '../../frontend',
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ],
});

