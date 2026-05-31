const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-setuid-sandbox']
  });
  
  // Try the original email (464930272@qq.com, without the extra 7)
  for (const email of ['464930272@qq.com', '4649302727@qq.com']) {
    const page = await browser.newPage();
    try {
      await page.goto('https://www.shepherdaitech.com/login', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      await page.click('input[type="email"]', { clickCount: 3 });
      await page.type('input[type="email"]', email, { delay: 30 });
      
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
      
      const url = page.url();
      console.log(`${email} -> URL: ${url} -> ${url.includes('/login') ? 'FAILED' : 'SUCCESS'}`);
    } catch(e) {
      console.log(`${email} -> Error: ${e.message}`);
    }
    await page.close();
  }
  
  await browser.close();
})();
