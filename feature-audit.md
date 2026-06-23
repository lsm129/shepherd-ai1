# ShepherdAI 功能重叠分析

## 新建的三个 G2 页面
1. /donation-management — 捐赠管理
2. /membership-management — 成员管理  
3. /for-churches — 面向宗教组织

## 现有相关页面

### 与 donations 相关的
- /church-accounting — 教会记账
- /church-reports — 教会报表
- /church-reports-ai — AI 报表

### 与 membership 相关的
- /member/profile — 会众资料 + AI牧养计划
- /member/dashboard — 会众仪表盘
- /church-community — 教会社区页

### 与 for-churches 相关的
- /about — 关于我们（有教会故事）
- /features — 功能总览
- /founding-church — 创始教会计划
- /find-church — 找教会

## 重叠判断

### 1. Donation Management ↔ church-accounting / church-reports
- church-accounting: 手动录入收支 (实际功能页)
- church-reports: 报表展示
- donation-management: 展示页 (新建，给G2看的)
- **结论**: donation-management 是展示页，church-accounting 是功能页。两者互补不冲突。

### 2. Membership Management ↔ member/profile / member/dashboard
- member/profile: 会众个人资料+AI牧养计划
- member/dashboard: 会众仪表盘+积分
- membership-management: 展示页 (新建，给G2看的)
- **结论**: 展示页概括了这些功能，不冲突。

### 3. For Churches ↔ about / features / founding-church
- about: 品牌故事
- features: 功能列表
- founding-church: 创始教会计划
- for-churches: 展示页 (新建，给G2看的)
- **结论**: for-churches 最全面，about/founding-church 各有侧重。
