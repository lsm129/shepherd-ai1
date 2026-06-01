# ShepherdAI 功能测试报告
**日期**: 2026-06-01 01:45
**测试人**: 云雀 (自动化API测试 + 手动验证)

---

## 一、基础设施测试

### 1.1 Supabase 数据库连接 ✅
- 新项目URL: hsunvuixqesjcoohbrmp.supabase.co
- REST API: 正常响应
- 所有13张表均存在且可访问:
  - profiles ✅
  - church_settings ✅
  - referrals ✅
  - points_transactions ✅
  - points_redemptions ✅
  - chat_messages ✅ (空)
  - community_requests ✅ (空)
  - scheduled_emails ✅ (空)
  - generations ✅ (空)
  - newsletters ✅ (空)
  - feedback ✅ (空)
  - ai_habits ✅ (空)
  - church_community_posts ✅ (空)

### 1.2 缺失的表 ⚠️
- prayer_requests ❌ 不存在
- visitor_followups ❌ 不存在
- 这两个功能的前端页面引用了这些表，但数据库中未创建

### 1.3 邮件服务 (Resend) ✅
- Resend API: 正常工作
- 域名验证: shepherdaitech.com ✅ Verified
- 测试邮件发送: 成功 (message ID: 7f873247...)
- Supabase SMTP配置: 用户已在Dashboard配置 (smtp.resend.com:465)
- **注意**: 注册API调用超时，可能SMTP配置有误或Supabase邮件发送延迟

### 1.4 Supabase Auth配置 ✅
- 邮箱确认: 已开启
- MFA/TOTP: 已开启 (建议关闭，避免注册问题)
- Site URL: https://www.shepherdaitech.com ✅
- Redirect URLs: 
  - https://www.shepherdaitech.com/auth/callback ✅
  - https://www.shepherdaitech.com/** ✅

---

## 二、认证测试

### 2.1 牧师账号登录 ✅
- 邮箱: 464930272@qq.com
- 密码: Lsm1986129&lsm
- 登录: 成功
- 角色: pastor ✅
- 教会: ShepherdAI Demo Church ✅
- 邮箱确认: 2026-05-31T15:07:09 ✅
- Plan: pro (在profiles表中)

### 2.2 会众注册 ⚠️ 待验证
- 邮箱: 1498946135@qq.com
- API调用超时（可能是SMTP发送邮件耗时过长）
- 需要在网站前端实际测试注册流程

### 2.3 Auth Callback路由 ⚠️ 未部署
- /auth/callback 路由已编写但未部署到线上
- Vercel自动部署已断开（GitHub仓库重命名后）
- 需要手动触发Vercel重新部署

---

## 三、数据库数据验证

### 3.1 牧师主账号 ✅
| 字段 | 值 |
|------|---|
| ID | 01c6fa61-4ce7-4fc6-9151-03571d81da86 |
| Plan | pro ✅ |
| Church | ShepherdAI Demo Church ✅ |
| Pastor | Shuming Liang ✅ |
| Points Balance | 0 |
| Profile Completed | false |
| AI Tone | warm |

### 3.2 Church Settings ✅
- 教会设置已正确创建
- 宗派: Non-denominational
- 会众规模: 50-100
- 位置: Foshan, Guangdong 528000

### 3.3 推荐码 ✅
- 牧师推荐码: B8F83A26
- test用户推荐码: AFF4B9FD
- 两个推荐码状态均为pending（未被使用）

### 3.4 积分交易 ✅
- 当前无积分交易记录
- 注册积分、邀请码积分机制代码已更新但未部署

---

## 四、代码变更汇总 (本次会话)

### 4.1 已推送的代码变更
1. **commit 8964309** - 添加resend-config.ts (Resend API Key fallback)
2. **commit b832801** - 切换到Resend邮件、添加auth回调路由、积分从2000→50
3. **commit 4b103c2** - 空commit触发Vercel重建

### 4.2 关键文件变更
- `src/lib/resend.ts` - 重写，使用Resend替代Brevo
- `src/lib/resend-config.ts` - 新增，Resend API Key fallback
- `src/lib/supabase-config.ts` - 新增getSupabaseUrl/getSupabaseAnonKey导出
- `src/app/auth/callback/route.ts` - 新增，邮箱确认后发放注册积分
- `src/app/api/email/send/route.ts` - 从Brevo切换到Resend
- `src/app/api/email/newsletter/route.ts` - 从Brevo切换到Resend
- `src/app/register/page.tsx` - 积分2000→50、添加emailRedirectTo

---

## 五、关键问题与待解决项

### 🔴 必须解决 (阻塞上线)

1. **Vercel部署断开** - GitHub仓库重命名后，Vercel不再自动部署
   - 解决方案: 登录Vercel Dashboard → 项目Settings → Git → 重新连接GitHub仓库
   - 或者: 手动触发Redeploy

2. **Vercel环境变量** - 需要添加RESEND_API_KEY
   - 解决方案: Vercel Dashboard → Settings → Environment Variables
   - 添加: RESEND_API_KEY = re_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91
   - 代码中已有fallback，但最好也更新Vercel环境变量

3. **MFA/TOTP未关闭** - 新项目TOTP默认开启
   - 解决方案: Supabase Dashboard → Authentication → Multi-Factor → TOTP改为Disabled

### 🟡 应该解决 (影响用户体验)

4. **缺失的数据库表** - prayer_requests和visitor_followups未创建
   - 影响: 祈祷管理和访客跟进功能无法正常工作
   - 解决方案: 在Supabase SQL Editor中创建这两张表

5. **SMTP配置验证** - 注册API超时，需确认Supabase SMTP是否正常
   - 解决方案: 部署后在网站实际测试注册流程

6. **Brevo DNS记录清理** - 阿里云DNS中仍有Brevo的旧记录，可能影响邮件送达
   - 影响: 不影响功能，但建议清理避免DNS冲突

### 🟢 可以后续优化

7. **积分体系前端** - 用户看不到积分余额、积分历史
8. **后台管理系统** - 无平台级/牧师级管理面板
9. **Creem年付产品** - 仍在审核中
10. **Community Requests功能** - 数据库表已创建，功能未开发

---

## 六、明天操作清单 (用户需要做的)

1. **登录Vercel Dashboard** → https://vercel.com (GitHub登录)
2. **检查项目连接** → shepherd-ai1-ly6j → Settings → Git → 确认连接到 lsm129/shepherd-ai1
3. **添加环境变量** → Settings → Environment Variables:
   - 添加: RESEND_API_KEY = re_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91
   - 删除: BREVO_API_KEY (如果有)
4. **触发重新部署** → Deployments → 最新部署 → Redeploy
5. **关闭MFA** → Supabase Dashboard → Authentication → Multi-Factor → TOTP改为Disabled
6. **网站注册测试**:
   - 用1498946135@qq.com注册会众账号
   - 检查邮箱是否收到确认邮件
   - 点击确认链接后检查积分是否到账(应为100分)
7. **牧师账号功能测试**:
   - 用464930272@qq.com登录
   - 测试每个AI功能页面

---

## 七、测试结论

**当前状态**: 代码已就绪，但未部署到线上。核心基础设施(Supabase数据库、Resend邮件)工作正常，但Vercel部署断开是最大的阻塞问题。

**风险评估**: 中等 — 数据库和邮件服务正常，但部署断开意味着所有新代码(积分系统、Resend邮件、auth回调)都没有上线。

**建议**: 优先修复Vercel部署，然后进行完整的端到端功能测试。
