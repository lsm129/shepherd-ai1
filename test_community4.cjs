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
    console.log('=== Step 1: Login with test account ===');
    await page.goto('https://www.shepherdaitech.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.click('input[type="email"]', { clickCount: 3 });
    await page.type('input[type="email"]', '1498946135@qq.com', { delay: 30 });
    
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.click('input[type="password"]', { clickCount: 3 });
    await page.type('input[type="password"]', 'Test123456!', { delay: 30 });
    
    // Click Sign In
    const signInBtn = await page.$('button:has-text("Sign In")');
    if (signInBtn) {
      await signInBtn.click();
    } else {
      // Fallback: click the button with specific text
      await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.textContent.includes('Sign In')) { btn.click(); break; }
        }
      });
    }
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('Current URL after login:', page.url());
    
    const isLoggedIn = await page.evaluate(() => !window.location.pathname.includes('/login'));
    console.log('Is logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      const pageText = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || 'empty');
      console.log('Login page text:', pageText);
    } else {
      // Verify we can see dashboard content
      const dashText = await page.evaluate(() => document.body?.innerText?.substring(0, 200) || 'empty');
      console.log('Dashboard text preview:', dashText);
    }
    
    // Navigate to community
    console.log('\n=== Step 2: Navigate to Community ===');
    await page.goto('https://www.shepherdaitech.com/community', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 8000));  // Wait longer for hydration
    
    console.log('Current URL:', page.url());
    
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || 'empty');
    console.log('Page content preview:', bodyText);
    
    const hasError = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      return text.includes('Something went wrong') || text.includes('Navigation Error');
    });
    console.log('Has error:', hasError);
    
    const hasNav = await page.evaluate(() => !!document.querySelector('nav'));
    console.log('Has nav bar:', hasNav);
    
    // Check what's actually in the DOM
    const navCheck = await page.evaluate(() => {
      const navEl = document.querySelector('nav');
      const allDivs = document.querySelectorAll('div');
      const shepherdAiText = document.body?.innerHTML?.includes('ShepherdAI') || false;
      return {
        navExists: !!navEl,
        navText: navEl?.innerText?.substring(0, 100) || 'none',
        divCount: allDivs.length,
        hasShepherdText: shepherdAiText,
        bodyHTMLLength: document.body?.innerHTML?.length || 0
      };
    });
    console.log('DOM check:', JSON.stringify(navCheck, null, 2));
    
    await page.screenshot({ path: '/tmp/community_loggedin.png', fullPage: true });
    console.log('Screenshot saved');
    
  } catch(e) {
    console.error('Test error:', e.message);
  }
  
  console.log('\n=== Console Messages (errors + warns) ===');
  consoleMsgs.filter(m => m.includes('[error]') || m.includes('[warn]')).forEach(m => console.log(m));
  
  console.log('\n=== Page Errors ===');
  pageErrors.forEach(e => console.log(e));
  
  await browser.close();
})();
