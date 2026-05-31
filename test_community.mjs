import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Collect console messages
  const consoleMsgs = [];
  page.on('console', msg => {
    consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Collect page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    // First go to login page and log in
    console.log('=== Step 1: Login ===');
    await page.goto('https://www.shepherdaitech.com/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Fill login form
    await page.fill('input[type="email"]', '464930272@qq.com');
    await page.fill('input[type="password"]', 'Test123456!');
    
    // Click login button
    await page.click('button:has-text("Log In")');
    await page.waitForTimeout(5000);
    
    console.log('Current URL after login:', page.url());
    
    // Now navigate to community
    console.log('=== Step 2: Navigate to Community ===');
    await page.goto('https://www.shepherdaitech.com/community', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    console.log('Current URL after community:', page.url());
    
    // Get page content snapshot
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'empty');
    console.log('Page content preview:', bodyText);
    
  } catch(e) {
    console.error('Test error:', e.message);
  }
  
  console.log('\n=== Console Messages ===');
  consoleMsgs.forEach(m => console.log(m));
  
  console.log('\n=== Page Errors ===');
  pageErrors.forEach(e => console.log(e));
  
  await browser.close();
})();
