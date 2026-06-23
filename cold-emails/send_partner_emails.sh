#!/bin/bash
# 合作伙伴冷邮件发送脚本
RESEND_API="re_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91"
FROM="ShepherdAI Partners <hello@shepherdaitech.com>"
APPLY_URL="https://www.shepherdaitech.com/partner/apply"

# 联系人列表
declare -a CONTACTS=(
  # AV供应商
  "steven@protechserv.com|Steven|Pro-Tech Services|FL|AV"
  "dwood@ciavl.com|Doug|CIAVL|NC|AV"
  "info@avlx.com|Chris|AVLX|TN|AV"
  # 咨询公司
  "ajmathieu@malphursgroup.com|A.J.|The Malphurs Group|TX|Consulting"
  "help@theunstuckgroup.com|Tony|The Unstuck Group|GA|Consulting"
  "nickhonerkamp@kingdomconsultingteam.org|Nick|Kingdom Consulting Team|NC|Consulting"
  "info@edgechurchconsulting.com|Mark|Edge Church Consulting|TX|Consulting"
  "info@impactstewardship.com|Team|Impact Stewardship|TN|Consulting"
  "theconsultants@tccg.business|Team|TCCG|FL|Consulting"
  # Convention干事
  "tgobebo.rep@gabaptist.org|Tom|Georgia Baptist|GA|Convention|3500"
  "mmarshall@gabaptist.org|Mark|Georgia Baptist|GA|Convention|3500"
  "pdunn@gabaptist.org|PJ|Georgia Baptist|GA|Convention|3500"
  "asantos@ncbaptist.org|Antonio|NC Baptist|NC|Convention|2900"
  "dcrouch@tnbaptist.org|Daryl|Tennessee Baptist|TN|Convention|2800"
  "sholt@tnbaptist.org|Steve|Tennessee Baptist|TN|Convention|2800"
  "sparker@mbcb.org|Shawn|Mississippi Baptist|MS|Convention|2082"
  "cmccord@mbcb.org|Chad|Mississippi Baptist|MS|Convention|2082"
  "sjackson@mbcb.org|Steve|Mississippi Baptist|MS|Convention|2082"
  "clarmoyeux@absc.org|Chris|Arkansas Baptist|AR|Convention|1500"
  "mbrown@absc.org|Marcus|Arkansas Baptist|AR|Convention|1500"
  "Revitalize@absc.org|Team|Arkansas Baptist|AR|Convention|1500"
  "info@flbaptist.org|Team|Florida Baptist|FL|Convention|2100"
)

SENT=0
FAILED=0

for contact in "${CONTACTS[@]}"; do
  IFS='|' read -r EMAIL FIRST_NAME COMPANY STATE TYPE CHURCH_COUNT <<< "$contact"
  
  # 选择模板
  case "$TYPE" in
    AV) TEMPLATE="/root/shepherdai/cold-emails/partner_email_av.html" ;;
    Consulting) TEMPLATE="/root/shepherdai/cold-emails/partner_email_consulting.html" ;;
    Convention) TEMPLATE="/root/shepherdai/cold-emails/partner_email_convention.html" ;;
  esac

  # 生成邮件内容
  BODY=$(cat "$TEMPLATE" | \
    sed "s/{FIRST_NAME}/$FIRST_NAME/g" | \
    sed "s/{COMPANY}/$COMPANY/g" | \
    sed "s/{STATE}/$STATE/g" | \
    sed "s/{CONVENTION}/$COMPANY/g" | \
    sed "s/{CHURCH_COUNT}/${CHURCH_COUNT:-}/g")

  # 发送
  RESPONSE=$(curl -s -X POST "https://api.resend.com/emails" \
    -H "Authorization: Bearer $RESEND_API" \
    -H "Content-Type: application/json" \
    -d "$(python3 -c "
import json, sys
body = '''$BODY'''
# Escape for JSON
body_json = json.dumps(body)
subject = 'ShepherdAI Partner Program - Revenue Opportunity for $COMPANY'
print(json.dumps({
    'from': '$FROM',
    'to': ['$EMAIL'],
    'subject': subject,
    'html': body
}))
")")
  
  # 检查结果
  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ $EMAIL ($TYPE) - sent"
    SENT=$((SENT + 1))
  else
    echo "❌ $EMAIL ($TYPE) - failed: $RESPONSE"
    FAILED=$((FAILED + 1))
  fi
  
  # 间隔2秒避免rate limit
  sleep 2
done

echo ""
echo "===== 完成 ====="
echo "成功: $SENT"
echo "失败: $FAILED"
