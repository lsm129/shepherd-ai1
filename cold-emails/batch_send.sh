#!/bin/bash
LOG="/root/shepherdai/cold-emails/day1_log.txt"
echo "Day 1 Cold Email Send - $(date)" > $LOG
SENT=0
FAILED=0

# Read CSV and send (skip header)
tail -n +2 /root/shepherdai/cold-emails/day1_contacts.csv | while IFS=',' read -r church pastor email city source; do
  # Skip empty lines
  [ -z "$email" ] && continue
  
  # Already sent first one
  if [ "$email" = "bris9850@yahoo.com" ]; then
    echo "SKIP (already sent): $email" >> $LOG
    continue
  fi

  # Get first name from pastor field
  FIRSTNAME=$(echo "$pastor" | awk '{print $NF}')
  [ "$FIRSTNAME" = "Pastor" ] || [ -z "$FIRSTNAME" ] && FIRSTNAME="Pastor"
  
  # Alternate subject
  LINE_NUM=$(grep -n "$email" /root/shepherdai/cold-emails/day1_contacts.csv | head -1 | cut -d: -f1)
  LINE_NUM=$((LINE_NUM - 1))  # subtract header
  
  if [ $((LINE_NUM % 2)) -eq 0 ]; then
    SUBJECT="Your sermon → 30 days of content (plus a free year for 10 churches)"
  else
    SUBJECT="Save 10+ hours/week on church admin (free for founding churches)"
  fi

  # Build HTML body
  HTML="<html><body style='font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;'>"
  HTML+="<p>Hi $FIRSTNAME,</p>"
  HTML+="<p>I know your week: Sunday's sermon, Monday's newsletter, Tuesday's visitor follow-ups, Wednesday's social media... The admin never stops.</p>"
  HTML+="<p>What if AI could handle all of it — in your voice, in seconds?</p>"
  HTML+="<p><strong>ShepherdAI</strong> is the first AI-powered church management platform built specifically for ministry:</p>"
  HTML+="<ul>"
  HTML+="<li>Auto-generate weekly newsletters from your sermon notes</li>"
  HTML+="<li>Send personalized visitor follow-up emails automatically</li>"
  HTML+="<li>Turn one sermon into 30 days of social media posts</li>"
  HTML+="<li>Create daily devotionals with your tone and style</li>"
  HTML+="<li>Manage prayer requests and pastoral care in one place</li>"
  HTML+="</ul>"
  HTML+="<p>Other church software charges \$200-\$500/month with NO AI. ShepherdAI starts at just \$19/month — and right now:</p>"
  HTML+="<p style='background:#f0fdf4;border-left:4px solid #15803d;padding:12px 16px;margin:16px 0;'><strong style='color:#15803d;font-size:18px;'>The first 10 churches get our Growth Plan (\$79/month) completely FREE for one full year.</strong></p>"
  HTML+="<p>Only a few spots remain. No credit card required.</p>"
  HTML+="<p style='text-align:center;margin:20px 0;'><a href='https://www.shepherdaitech.com/founding-church' style='background:#1e3a5f;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;'>👉 Claim Your Free Spot</a></p>"
  HTML+="<div style='background:#f8f9fa;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0;'>"
  HTML+="<p style='margin:0 0 8px;font-weight:bold;'>🔒 Your safety matters to us:</p>"
  HTML+="<ul style='margin:0;padding-left:20px;'>"
  HTML+="<li>256-bit SSL encryption — the same standard banks use</li>"
  HTML+="<li>GDPR compliant — your data stays yours, always</li>"
  HTML+="<li>No credit card needed to sign up — zero risk</li>"
  HTML+="<li>We never sell, share, or misuse your information</li>"
  HTML+="<li>HTTPS secured and Google-verified website</li>"
  HTML+="</ul></div>"
  HTML+="<p>Ministry is your calling — let AI handle the admin.</p>"
  HTML+="<p>Blessings,<br/><strong>ShepherdAI Team</strong><br/><a href='https://www.shepherdaitech.com'>www.shepherdaitech.com</a></p>"
  HTML+="</body></html>"
  
  # Send via Resend
  RESPONSE=$(curl -s -X POST 'https://api.resend.com/emails' \
    -H 'Authorization: Bearer re_6HuefXJV_iaP8YXYhRFLs9RBLvTkjjX91' \
    -H 'Content-Type: application/json' \
    -d "$(jq -n --arg from "ShepherdAI <support@shepherdaitech.com>" \
              --arg to "$email" \
              --arg subject "$SUBJECT" \
              --arg html "$HTML" \
              '{from: $from, to: [$to], subject: $subject, html: $html}')")
  
  if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ Sent to $email ($church)" >> $LOG
    SENT=$((SENT+1))
  else
    echo "❌ Failed: $email - $RESPONSE" >> $LOG
    FAILED=$((FAILED+1))
  fi
  
  # Rate limit: wait 20 seconds between emails, 90 seconds every 5
  COUNT=$((COUNT+1))
  if [ $((COUNT % 5)) -eq 0 ]; then
    sleep 90
  else
    sleep 20
  fi
done

echo "" >> $LOG
echo "===== DAY 1 COMPLETE =====" >> $LOG
echo "Sent: $SENT | Failed: $FAILED" >> $LOG
echo "Finished at: $(date)" >> $LOG
