const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  try {
    await page.goto('https://www.shepherdaitech.com/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', '1498946135@qq.com');
    await page.fill('input[type="password"]', 'Lsm1986129&lsm');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);
    
    console.log('URL:', page.url());
    
    // Wait for page to fully load
    await page.waitForTimeout(5000);
    
    // Take full page screenshot
    await page.screenshot({ path: '/tmp/mdash_full.png', fullPage: true });
    console.log('Full page screenshot saved');
    
    // Find devotional section
    const devotional = await page.$('#devotional');
    if (devotional) {
      await devotional.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/tmp/mdash_dev.png' });
      
      // Check all buttons on the page
      const allButtons = await page.$$('button');
      console.log('Total buttons on page:', allButtons.length);
      for (const btn of allButtons) {
        const text = await btn.textContent();
        const visible = await btn.isVisible();
        console.log(`  Button: "${text?.trim()}" visible=${visible}`);
      }
      
      // Check for topic buttons specifically (inside the devotional section)
      const topicBtns = await devotional.$$('button');
      console.log('Devotional section buttons:', topicBtns.length);
      for (const btn of topicBtns) {
        const text = await btn.textContent();
        console.log(`  Dev btn: "${text?.trim()}"`);
      }
      
      // Try clicking the Generate Devotional button
      const genBtn = await page.$('button:has-text("Generate")');
      if (genBtn) {
        const visible = await genBtn.isVisible();
        console.log('Generate button visible:', visible);
        if (visible) {
          await genBtn.click();
          console.log('Clicked Generate, waiting 20s...');
          await page.waitForTimeout(20000);
          await page.screenshot({ path: '/tmp/mdash_generated.png' });
          
          const content = await page.$('#devotional');
          if (content) {
            const text = await content.textContent();
            console.log('Generated (first 400):', text?.substring(0, 400));
          }
        }
      } else {
        console.log('Generate button not found');
        
        // Check the devotional section HTML
        const html = await devotional.evaluate(el => el.innerHTML);
        console.log('Devotional HTML (first 1000):', html.substring(0, 1000));
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: '/tmp/mdash_err.png' });
  } finally {
    await browser.close();
  }
})();
