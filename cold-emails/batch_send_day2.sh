#!/bin/bash
LOG="/root/shepherdai/cold-emails/day2_log.txt"
CSV="/root/shepherdai/cold-emails/day2_contacts.csv"
API="https://api.resend.com/emails"
KEY="re_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91"
FROM="ShepherdAI <support@shepherdaitech.com>"

SENT=0
FAIL=0
SKIP=0
COUNT=0

TEMPLATE_A='Your sermon → 30 days of content (plus a free year for 10 churches)'
TEMPLATE_B='Save 10+ hours/week on church admin (free for founding churches)'

echo "ShepherdAI Cold Email Log - Day 2" > "$LOG"
echo "Started: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG"
echo "============================================================" >> "$LOG"

# Read CSV, skip header
tail -n +2 "$CSV" | while IFS=',' read -r church pastor email city source; do
  COUNT=$((COUNT+1))
  
  # Clean up
  church=$(echo "$church" | tr -d '"' | xargs)
  pastor=$(echo "$pastor" | tr -d '"' | xargs)
  email=$(echo "$email" | tr -d '"' | xargs | tr '[:upper:]' '[:lower:]')
  city=$(echo "$city" | tr -d '"' | xargs)
  
  # Skip if already sent in Day 1
  if grep -qi "^${email}$" /tmp/day1_emails.txt 2>/dev/null; then
    echo "⏭️ Skipped (Day 1): $email ($church)" >> "$LOG"
    continue
  fi

  # Determine first name
  if echo "$pastor" | grep -qiE "^(pastor|rev\.?|dr\.?)$"; then
    FIRST="Pastor"
  else
    # Remove titles, get first name
    CLEAN=$(echo "$pastor" | sed 's/^Rev\.\s*//i; s/^Dr\.\s*//i; s/^Pastor\s*//i' | xargs)
    FIRST=$(echo "$CLEAN" | awk '{print $1}')
    [ -z "$FIRST" ] && FIRST="Pastor"
  fi

  # Alternate templates
  if [ $((COUNT % 2)) -eq 0 ]; then
    SUBJECT="$TEMPLATE_A"
    BODY="<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;\"><p>Hi Pastor ${FIRST},</p><p>I know your week: Sunday sermon, Monday newsletter, Tuesday visitor follow-ups, Wednesday social media... The admin never stops.</p><p>What if AI could handle all of it — in your voice, in seconds?</p><p><strong>ShepherdAI</strong> is the first AI-powered church management platform built specifically for ministry:</p><ul><li>Auto-generate weekly newsletters from your sermon notes</li><li>Send personalized visitor follow-up emails automatically</li><li>Turn one sermon into 30 days of social media posts</li><li>Create daily devotionals with your tone and style</li><li>Manage prayer requests and pastoral care in one place</li></ul><p>Other church software charges \$200-\$500/month with NO AI. ShepherdAI starts at just \$19/month — and right now:</p><p style=\"color:#15803d;font-size:18px;font-weight:bold;\">The first 10 churches get our Growth Plan (\$79/month) completely FREE for one full year.</p><p>Only a few spots remain. No credit card required.</p><p>👉 <a href=\"https://www.shepherdaitech.com/founding-church\" style=\"color:#1e3a5f;font-weight:bold;\">Claim your spot at shepherdaitech.com</a></p><p><strong>🔒 Your safety matters:</strong><br/>• 256-bit SSL encryption<br/>• GDPR compliant<br/>• No credit card needed<br/>• We never sell or share your information</p><p>Ministry is your calling — let AI handle the admin.</p><p>Blessings,<br/>ShepherdAI Team<br/><a href=\"https://www.shepherdaitech.com\">www.shepherdaitech.com</a></p></div>"
  else
    SUBJECT="$TEMPLATE_B"
    BODY="<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;\"><p>Pastor ${FIRST},</p><p>How much time do you spend each week writing newsletters, following up with visitors, and creating social content?</p><p>What if AI could do it all for you — automatically, in your own voice?</p><p><strong>ShepherdAI</strong> writes your newsletters, follows up with visitors, turns sermons into social posts, and generates daily devotionals. All powered by AI that learns your communication style.</p><p>Unlike other church software at \$200-\$500/month with zero AI features, ShepherdAI starts at just \$19/month. And for a limited time:</p><p style=\"color:#15803d;font-size:18px;font-weight:bold;\">10 churches get our full Growth Plan FREE for one entire year.</p> That is a \$948 value — zero cost.</p><p>Only a few founding spots left. No credit card needed.</p><p>👉 <a href=\"https://www.shepherdaitech.com/founding-church\" style=\"color:#1e3a5f;font-weight:bold;\">Apply here: shepherdaitech.com/founding-church</a></p><p><strong>🔒 Safety guaranteed:</strong><br/>• 256-bit bank-level encryption on all data<br/>• GDPR compliant — we respect your privacy<br/>• No credit card required — no hidden charges, ever<br/>• Your church data is never sold or shared with third parties<br/>• HTTPS secured and Google-verified website</p><p>Let AI handle the admin so you can focus on ministry.</p><p>Blessings,<br/>ShepherdAI Team<br/><a href=\"https://www.shepherdaitech.com\">www.shepherdaitech.com</a></p></div>"
  fi

  # Send email
  RESPONSE=$(curl -s -X POST "$API" \
    -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" \
    -d "{\"from\":\"$FROM\",\"to\":[\"$email\"],\"subject\":\"$SUBJECT\",\"html\":$(echo "$BODY" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')}" \
    --max-time 15 2>&1)

  if echo "$RESPONSE" | grep -q '"id"'; then
    EID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('id',''))" 2>/dev/null)
    echo "✅ Sent to $email ($church) - ID: $EID" >> "$LOG"
    SENT=$((SENT+1))
  else
    ERRMSG=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.loads(sys.stdin.read()); print(d.get('message',d.get('error',{}).get('message','Unknown')))" 2>/dev/null || echo "$RESPONSE")
    echo "❌ Failed: $email ($church) - $ERRMSG" >> "$LOG"
    FAIL=$((FAIL+1))
  fi

  echo "[$COUNT/70] $email: $(echo $RESPONSE | head -c 50)"

  # Rate limiting
  if [ $((COUNT % 5)) -eq 0 ]; then
    echo "--- Batch $((COUNT/5)) pause (60s) ---" >> "$LOG"
    sleep 60
  else
    sleep 15
  fi
done

echo "" >> "$LOG"
echo "============================================================" >> "$LOG"
echo "SUMMARY" >> "$LOG"
echo "============================================================" >> "$LOG"
echo "Sent:   $SENT" >> "$LOG"
echo "Failed: $FAIL" >> "$LOG"
echo "Skipped: $SKIP" >> "$LOG"
echo "Completed: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG"
