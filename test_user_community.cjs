const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', error => { pageErrors.push(error.message); });

  try {
    // Step 1: Login
    console.log('=== Step 1: Login with user account ===');
    await page.goto('https://www.shepherdaitech.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.click('input[type="email"]', { clickCount: 3 });
    await page.type('input[type="email"]', '4649302727@qq.com', { delay: 30 });
    
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.click('input[type="password"]', { clickCount: 3 });
    await page.type('input[type="password"]', 'lsm1986129&lsm', { delay: 30 });
    
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === 'Sign In') { btn.click(); return; }
      }
    });
    
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));
    
    const loginUrl = page.url();
    console.log('URL after login:', loginUrl);
    const isLoggedIn = !loginUrl.includes('/login');
    console.log('Is logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      const errText = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || '');
      console.log('Login page text:', errText);
      await browser.close();
      return;
    }
    
    // Step 2: Dashboard check
    const dashText = await page.evaluate(() => document.body?.innerText?.substring(0, 200) || '');
    console.log('Dashboard preview:', dashText.substring(0, 150));
    
    // Step 3: Community
    console.log('\n=== Step 2: Navigate to Community ===');
    await page.goto('https://www.shepherdaitech.com/community', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 8000));
    
    const hasNav = await page.evaluate(() => !!document.querySelector('nav'));
    const hasError = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('Something went wrong') || text.includes('Navigation Error');
    });
    const bodyPreview = await page.evaluate(() => document.body?.innerText?.substring(0, 400) || '');
    
    console.log('Has nav bar:', hasNav);
    console.log('Has error boundary:', hasError);
    console.log('Page preview:', bodyPreview);
    
    // Step 4: Navigate back to Dashboard to verify no crash
    console.log('\n=== Step 3: Back to Dashboard ===');
    await page.goto('https://www.shepherdaitech.com/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
    
    const dashNav = await page.evaluate(() => !!document.querySelector('nav'));
    const dashError = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('Something went wrong') || text.includes('Navigation Error');
    });
    console.log('Dashboard has nav:', dashNav);
    console.log('Dashboard has error:', dashError);
    
    // Step 5: Navigate to Settings
    console.log('\n=== Step 4: Settings ===');
    await page.goto('https://www.shepherdaitech.com/settings', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000));
    
    const settingsNav = await page.evaluate(() => !!document.querySelector('nav'));
    const settingsError = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('Something went wrong') || text.includes('Navigation Error');
    });
    console.log('Settings has nav:', settingsNav);
    console.log('Settings has error:', settingsError);
    
    await page.screenshot({ path: '/tmp/community_user_test.png', fullPage: true });
    console.log('Screenshot saved');
    
  } catch(e) {
    console.error('Test error:', e.message);
  }
  
  console.log('\n=== Page JS Errors ===');
  pageErrors.forEach(e => console.log(e));
  
  await browser.close();
})();
