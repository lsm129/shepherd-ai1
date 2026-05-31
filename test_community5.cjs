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
    // Login
    console.log('=== Step 1: Login ===');
    await page.goto('https://www.shepherdaitech.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.click('input[type="email"]', { clickCount: 3 });
    await page.type('input[type="email"]', '1498946135@qq.com', { delay: 30 });
    
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.click('input[type="password"]', { clickCount: 3 });
    await page.type('input[type="password"]', 'Test123456!', { delay: 30 });
    
    // Click Sign In using evaluate
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === 'Sign In') { btn.click(); return; }
      }
    });
    
    // Wait for page change
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));
    
    const currentUrl = page.url();
    console.log('URL after login:', currentUrl);
    
    const isLoggedIn = !currentUrl.includes('/login');
    console.log('Is logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      const errText = await page.evaluate(() => {
        const el = document.querySelector('[style*="color: red"], [style*="color:#dc2626"], .error');
        return el?.textContent || 'no error element found';
      });
      console.log('Error text:', errText);
    }
    
    // Navigate to community
    console.log('\n=== Step 2: Community ===');
    await page.goto('https://www.shepherdaitech.com/community', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 8000));
    
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'empty');
    console.log('Page content:', bodyText);
    
    const hasNav = await page.evaluate(() => !!document.querySelector('nav'));
    console.log('Has nav bar:', hasNav);
    
    const hasError = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('Something went wrong') || text.includes('Navigation Error');
    });
    console.log('Has error boundary:', hasError);
    
    await page.screenshot({ path: '/tmp/community_loggedin.png', fullPage: true });
    
  } catch(e) {
    console.error('Test error:', e.message);
  }
  
  console.log('\n=== Console Errors ===');
  consoleMsgs.filter(m => m.includes('[error]')).forEach(m => console.log(m));
  
  console.log('\n=== Page Errors ===');
  pageErrors.forEach(e => console.log(e));
  
  await browser.close();
})();
