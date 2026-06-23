const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  try {
    // First sign up as congregant
    await page.goto('https://www.shepherdaitech.com/register');
    await page.waitForTimeout(3000);
    
    // Check if already on register page
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      // Fill register form
      const timestamp = Date.now();
      await page.fill('input[type="email"]', `test_congregant_${timestamp}@test.com`);
      await page.fill('input[type="password"]', 'Lsm1986129&lsm');
      
      // Select congregant role if available
      const roleSelect = await page.$('select');
      if (roleSelect) {
        await roleSelect.selectOption('congregant');
      }
      
      // Look for role radio buttons
      const congregantRadio = await page.$('input[value="congregant"]');
      if (congregantRadio) {
        await congregantRadio.click();
      }
      
      await page.screenshot({ path: '/tmp/register_page.png' });
      console.log('Register page screenshot saved');
    }
    
    // Try logging in with the existing test account
    await page.goto('https://www.shepherdaitech.com/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', '1498946135@qq.com');
    await page.fill('input[type="password"]', 'Lsm1986129&lsm');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(6000);
    
    console.log('URL after login attempt:', page.url());
    await page.screenshot({ path: '/tmp/login_result.png' });
    
    // Check for error message
    const errorEl = await page.$('text=Invalid login credentials');
    if (errorEl) {
      console.log('Login failed - invalid credentials');
    }
    
    // Check if redirected to member dashboard
    if (page.url().includes('member/dashboard')) {
      console.log('Logged in as congregant, on member dashboard');
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/tmp/member_dash_full.png', fullPage: true });
      
      // Scroll to devotional
      const devotional = await page.$('#devotional');
      if (devotional) {
        await devotional.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/tmp/devotional_section.png' });
        console.log('Devotional section visible');
        
        // Click Hope topic
        const allButtons = await page.$$('#devotional button');
        console.log('Buttons in devotional:', allButtons.length);
        for (const btn of allButtons) {
          const text = await btn.textContent();
          console.log(' - Button:', text?.trim());
        }
        
        // Find and click Hope
        for (const btn of allButtons) {
          const text = await btn.textContent();
          if (text?.trim() === 'Hope') {
            await btn.click();
            await page.waitForTimeout(500);
            console.log('Clicked Hope');
            break;
          }
        }
        
        // Click Generate
        const genBtn = await page.$('button:has-text("Generate")');
        if (genBtn) {
          await genBtn.click();
          console.log('Clicked Generate, waiting 20s...');
          await page.waitForTimeout(20000);
          await page.screenshot({ path: '/tmp/devotional_generated.png' });
          
          const content = await page.$('#devotional');
          if (content) {
            const text = await content.textContent();
            console.log('Generated content (first 500):', text?.substring(0, 500));
          }
        }
      }
    } else if (page.url().includes('dashboard')) {
      console.log('Redirected to pastor dashboard (user is pastor)');
    } else {
      console.log('Still on login page or unknown URL');
    }
  } catch (e) {
    console.error('Error:', e.message);
    await page.screenshot({ path: '/tmp/test_error.png' });
  } finally {
    await browser.close();
  }
})();
