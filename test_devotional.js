const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  try {
    // Login as congregant
    await page.goto('https://www.shepherdaitech.com/login');
    await page.waitForTimeout(3000);
    
    await page.fill('input[type="email"]', '1498946135@qq.com');
    await page.fill('input[type="password"]', 'Lsm1986129&lsm');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(6000);
    
    console.log('After login URL:', page.url());
    await page.screenshot({ path: '/tmp/member_dash_1.png', fullPage: true });
    
    // Scroll to devotional section
    const devotionalSection = await page.$('#devotional');
    if (devotionalSection) {
      console.log('Found devotional section');
      await devotionalSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/member_dash_dev.png' });
      
      // Click Hope topic
      const hopeBtn = await page.$('#devotional button:has-text("Hope")');
      if (hopeBtn) {
        await hopeBtn.click();
        await page.waitForTimeout(500);
        console.log('Clicked Hope topic');
      }
      
      // Click Generate
      const genBtn = await page.$('#devotional button:has-text("Generate Devotional")');
      if (genBtn) {
        await genBtn.click();
        console.log('Clicked Generate, waiting...');
        await page.waitForTimeout(20000);
        await page.screenshot({ path: '/tmp/member_dash_gen.png', fullPage: false });
        console.log('Generated screenshot saved');
        
        const content = await page.$('#devotional');
        if (content) {
          const text = await content.textContent();
          console.log('Devotional content (first 300):', text.substring(0, 300));
        }
      }
    } else {
      console.log('No devotional section found');
      const body = await page.textContent('body');
      console.log('Page content (first 500):', body.substring(0, 500));
    }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: '/tmp/member_dash_err.png' });
  } finally {
    await browser.close();
  }
})();
