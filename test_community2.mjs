import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
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
    await page.goto('https://www.shepherdaitech.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Fill login form
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.type('464930272@qq.com');
      await passwordInput.type('Test123456!');
      
      // Click login button
      const loginBtn = await page.$('button[type="submit"]') || await page.$('button');
      if (loginBtn) {
        await loginBtn.click();
        await page.waitForTimeout(5000);
      }
    } else {
      console.log('Could not find login form inputs');
    }
    
    console.log('Current URL after login:', page.url());
    
    // Now navigate to community
    console.log('=== Step 2: Navigate to Community ===');
    await page.goto('https://www.shepherdaitech.com/community', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    console.log('Current URL after community:', page.url());
    
    // Get page content snapshot
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 800) || 'empty');
    console.log('Page content preview:', bodyText);
    
    // Check if error boundary is showing
    const hasError = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('Something went wrong') || text.includes('Error') || text.includes('error');
    });
    console.log('Has error on page:', hasError);
    
    // Check if nav is present
    const hasNav = await page.evaluate(() => !!document.querySelector('nav'));
    console.log('Has nav bar:', hasNav);
    
  } catch(e) {
    console.error('Test error:', e.message);
  }
  
  console.log('\n=== Console Messages (last 30) ===');
  consoleMsgs.slice(-30).forEach(m => console.log(m));
  
  console.log('\n=== Page Errors ===');
  pageErrors.forEach(e => console.log(e));
  
  await browser.close();
})();
