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
    // Login
    console.log('=== Login ===');
    await page.goto('https://www.shepherdaitech.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.click('input[type="email"]', { clickCount: 3 });
    await page.type('input[type="email"]', '464930272@qq.com', { delay: 30 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.click('input[type="password"]', { clickCount: 3 });
    await page.type('input[type="password"]', 'lsm1986129&lsm', { delay: 30 });
    await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) { if (btn.textContent.trim() === 'Sign In') { btn.click(); return; } }
    });
    await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));
    console.log('Logged in, URL:', page.url());
    
    // Test each page
    const pages = [
      { name: 'Dashboard', url: 'https://www.shepherdaitech.com/dashboard' },
      { name: 'Community', url: 'https://www.shepherdaitech.com/community' },
      { name: 'Settings', url: 'https://www.shepherdaitech.com/settings' },
      { name: 'Home', url: 'https://www.shepherdaitech.com/' },
    ];
    
    for (const p of pages) {
      console.log('\n=== ' + p.name + ' ===');
      await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 5000));
      
      const result = await page.evaluate(() => {
        const nav = document.querySelector('nav');
        const text = document.body?.innerText || '';
        const hasError = text.includes('Something went wrong') || text.includes('Navigation Error');
        return {
          url: window.location.href,
          hasNav: !!nav,
          navItems: nav ? nav.innerText.substring(0, 100) : 'none',
          hasError,
          preview: text.substring(0, 150)
        };
      });
      
      console.log('  Nav: ' + (result.hasNav ? 'YES' : 'NO'));
      if (result.hasNav) console.log('  Nav items: ' + result.navItems);
      console.log('  Error: ' + (result.hasError ? 'YES' : 'NO'));
      console.log('  Preview: ' + result.preview + '...');
    }
    
    // Navigation stress test
    console.log('\n=== Nav stress test ===');
    for (let i = 0; i < 3; i++) {
      await page.goto('https://www.shepherdaitech.com/dashboard', { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      await page.goto('https://www.shepherdaitech.com/community', { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
      const hasError = await page.evaluate(() => {
        const text = document.body?.innerText || '';
        return text.includes('Something went wrong') || text.includes('Navigation Error');
      });
      console.log('  Round ' + (i+1) + ': ' + (hasError ? 'CRASH' : 'OK'));
    }
    
  } catch(e) {
    console.error('Test error:', e.message);
  }
  
  console.log('\n=== Page JS Errors ===');
  pageErrors.forEach(e => console.log('  ' + e));
  
  await browser.close();
})();
