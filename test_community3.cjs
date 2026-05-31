const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const consoleMsgs = [];
  page.on('console', msg => {
    consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    console.log('=== Step 1: Login with proper form interaction ===');
    await page.goto('https://www.shepherdaitech.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    // Type credentials more carefully
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.click('input[type="email"]', { clickCount: 3 });
    await page.type('input[type="email"]', '464930272@qq.com', { delay: 50 });
    
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.click('input[type="password"]', { clickCount: 3 });
    await page.type('input[type="password"]', 'Test123456!', { delay: 50 });
    
    // Find and click the login button - look for specific text
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      console.log('Button found:', text.trim());
      if (text.includes('Log In') || text.includes('Sign In')) {
        await btn.click();
        break;
      }
    }
    
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('Current URL after login:', page.url());
    
    // Check if we're logged in by looking for dashboard indicators
    const isLoggedIn = await page.evaluate(() => {
      return !window.location.pathname.includes('/login');
    });
    console.log('Is logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      // Try to get the login error
      const pageText = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || 'empty');
      console.log('Login page text:', pageText);
    }
    
    // Now navigate to community
    console.log('\n=== Step 2: Navigate to Community ===');
    await page.goto('https://www.shepherdaitech.com/community', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('Current URL:', page.url());
    
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 800) || 'empty');
    console.log('Page content preview:', bodyText);
    
    const hasError = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('Something went wrong') || text.includes('Navigation Error') || text.includes('error');
    });
    console.log('Has error on page:', hasError);
    
    const hasNav = await page.evaluate(() => !!document.querySelector('nav'));
    console.log('Has nav bar:', hasNav);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/community_test2.png', fullPage: true });
    console.log('Screenshot saved');
    
  } catch(e) {
    console.error('Test error:', e.message);
  }
  
  console.log('\n=== Console Messages (errors only) ===');
  consoleMsgs.filter(m => m.includes('[error]')).forEach(m => console.log(m));
  
  console.log('\n=== Page Errors ===');
  pageErrors.forEach(e => console.log(e));
  
  await browser.close();
})();
