#!/usr/bin/env python3
"""Send cold emails for Day 3 - ShepherdAI Founding Church Campaign"""
import csv
import json
import time
import subprocess
import sys
from datetime import datetime

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = "ShepherdAI <support@shepherdaitech.com>"
CSV_PATH = "/root/shepherdai/cold-emails/day3_contacts.csv"
LOG_PATH = "/root/shepherdai/cold-emails/day3_log.txt"

# Email Template A: Sermon → Content focus
TEMPLATE_A_SUBJECT = "Your sermon → 30 days of content (plus a free year for 10 churches)"
TEMPLATE_A_HTML = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #8B1538, #D4A84B); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
<h1 style="color: white; margin: 0; font-size: 24px;">⛪ ShepherdAI</h1>
<p style="color: #f0e6d2; margin: 5px 0 0 0; font-size: 14px;">AI-Powered Church Management</p>
</div>
<div style="padding: 30px; background: #fff; border: 1px solid #e0e0e0;">
<p style="font-size: 16px;">Hi {name},</p>
<p style="font-size: 15px;">What if <strong>one sermon</strong> could feed your congregation for 30 days?</p>
<p style="font-size: 15px;">With ShepherdAI, your sermon becomes:</p>
<ul style="font-size: 15px;">
<li>📝 <strong>Daily devotionals</strong> for your members</li>
<li>🙏 <strong>Prayer guides</strong> based on your teaching</li>
<li>📱 <strong>Social media posts</strong> — ready to share</li>
<li>📧 <strong>Newsletter content</strong> — written in your voice</li>
</ul>
<p style="font-size: 15px;">Pastors using ShepherdAI save <strong>10+ hours per week</strong> on admin and content — and get that time back for ministry.</p>
<div style="background: #FFF8E1; border-left: 4px solid #D4A84B; padding: 15px; margin: 20px 0;">
<p style="margin: 0; font-size: 16px;"><strong>🎉 FREE for 1 Year — Only 10 spots!</strong></p>
<p style="margin: 5px 0 0 0; font-size: 14px;">As a Founding Church, you get full Pro access ($39/month value) at zero cost. No credit card needed.</p>
</div>
<div style="text-align: center; margin: 25px 0;">
<a href="https://www.shepherdaitech.com/founding-church" style="background: linear-gradient(135deg, #8B1538, #D4A84B); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Claim Your Free Year →</a>
</div>
<p style="font-size: 13px; color: #888; text-align: center; margin-top: 20px;">🔒 256-bit encrypted | GDPR compliant | No credit card needed</p>
</div>
<div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
<p style="margin: 0;">ShepherdAI · <a href="https://www.shepherdaitech.com" style="color: #8B1538;">shepherdaitech.com</a></p>
<p style="margin: 5px 0 0 0;">You're receiving this because we work with small churches. <a href="mailto:support@shepherdaitech.com?subject=Unsubscribe" style="color: #888;">Unsubscribe</a></p>
</div>
</body>
</html>"""

# Email Template B: Save time on admin focus
TEMPLATE_B_SUBJECT = "Save 10+ hours/week on church admin (free for founding churches)"
TEMPLATE_B_HTML = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #8B1538, #D4A84B); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
<h1 style="color: white; margin: 0; font-size: 24px;">⛪ ShepherdAI</h1>
<p style="color: #f0e6d2; margin: 5px 0 0 0; font-size: 14px;">AI-Powered Church Management</p>
</div>
<div style="padding: 30px; background: #fff; border: 1px solid #e0e0e0;">
<p style="font-size: 16px;">Hi {name},</p>
<p style="font-size: 15px;">How much of your week disappears into admin tasks?</p>
<p style="font-size: 15px;">Visitor follow-ups. Event planning. Member tracking. Newsletter writing. Prayer list updates...</p>
<p style="font-size: 15px;"><strong>ShepherdAI handles all of it — automatically.</strong></p>
<ul style="font-size: 15px;">
<li>✅ <strong>Visitor follow-up</strong> — automated emails that feel personal</li>
<li>✅ <strong>Member directory</strong> — always up to date</li>
<li>✅ <strong>Sermon → content</strong> — devos, prayers, social posts from your message</li>
<li>✅ <strong>Prayer wall</strong> — your congregation stays connected</li>
<li>✅ <strong>Ministry health check</strong> — 6-dimension diagnostic, free</li>
</ul>
<div style="background: #FFF8E1; border-left: 4px solid #D4A84B; padding: 15px; margin: 20px 0;">
<p style="margin: 0; font-size: 16px;"><strong>🎉 Founding Church Program — FREE 1 Year!</strong></p>
<p style="margin: 5px 0 0 0; font-size: 14px;">We're looking for 10 small churches to be our founding partners. Full Pro access at no cost. No credit card required.</p>
</div>
<div style="text-align: center; margin: 25px 0;">
<a href="https://www.shepherdaitech.com/founding-church" style="background: linear-gradient(135deg, #8B1538, #D4A84B); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Get Free Pro Access →</a>
</div>
<p style="font-size: 13px; color: #888; text-align: center; margin-top: 20px;">🔒 256-bit encrypted | GDPR compliant | No credit card needed</p>
</div>
<div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
<p style="margin: 0;">ShepherdAI · <a href="https://www.shepherdaitech.com" style="color: #8B1538;">shepherdaitech.com</a></p>
<p style="margin: 5px 0 0 0;">You're receiving this because we work with small churches. <a href="mailto:support@shepherdaitech.com?subject=Unsubscribe" style="color: #888;">Unsubscribe</a></p>
</div>
</body>
</html>"""

def send_email(to_email, pastor_name, template_idx):
    """Send email via Resend API"""
    if template_idx % 2 == 0:
        subject = TEMPLATE_A_SUBJECT
        html = TEMPLATE_A_HTML
    else:
        subject = TEMPLATE_B_SUBJECT
        html = TEMPLATE_B_HTML
    
    # Replace name placeholder
    name = pastor_name if pastor_name and pastor_name != "Pastor" else "Pastor"
    html = html.replace("{name}", name)
    
    payload = {
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html
    }
    
    cmd = [
        "curl", "-s", "-X", "POST", "https://api.resend.com/emails",
        "-H", f"Authorization: Bearer {RESEND_API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        response = result.stdout
        resp_data = json.loads(response) if response else {}
        
        if "id" in resp_data:
            return True, resp_data["id"]
        elif "error" in resp_data:
            err_msg = resp_data.get("error", {}).get("message", str(resp_data))
            return False, err_msg
        else:
            return False, response[:200]
    except Exception as e:
        return False, str(e)

def main():
    # Read contacts
    contacts = []
    with open(CSV_PATH, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            contacts.append(row)
    
    print(f"Loaded {len(contacts)} contacts")
    
    # Open log
    log_file = open(LOG_PATH, 'w')
    log_file.write(f"ShepherdAI Cold Email Log - Day 3\n")
    log_file.write(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} CST\n")
    log_file.write("=" * 60 + "\n\n")
    
    sent = 0
    failed = 0
    batch_count = 0
    
    for i, contact in enumerate(contacts):
        email = contact['email'].strip()
        pastor = contact['pastor_name'].strip()
        church = contact['church_name'].strip()
        
        # Alternating template
        template_idx = i
        
        success, msg = send_email(email, pastor, template_idx)
        
        if success:
            sent += 1
            log_msg = f"✅ Sent to {email} ({church}) - ID: {msg}"
            print(log_msg)
            log_file.write(log_msg + "\n")
        else:
            failed += 1
            log_msg = f"❌ Failed: {email} ({church}) - {msg}"
            print(log_msg)
            log_file.write(log_msg + "\n")
        
        # Batch control: 5 emails then pause 90 seconds
        if (i + 1) % 5 == 0 and i < len(contacts) - 1:
            batch_count += 1
            pause_msg = f"\n--- Batch {batch_count} pause (90s) ---"
            print(pause_msg)
            log_file.write(pause_msg + "\n")
            time.sleep(90)
        elif i < len(contacts) - 1:
            # 15 second delay between individual emails
            time.sleep(15)
    
    # Summary
    summary = f"""
{"=" * 60}
SUMMARY
{"=" * 60}
Total contacts: {len(contacts)}
Sent:   {sent}
Failed: {failed}
Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} CST
"""
    print(summary)
    log_file.write(summary)
    log_file.close()

if __name__ == "__main__":
    main()
