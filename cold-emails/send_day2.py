#!/usr/bin/env python3
import csv
import subprocess
import json
import time
import os
from datetime import datetime

SENDER = "ShepherdAI <support@shepherdaitech.com>"
RESEND_API = "https://api.resend.com/emails"
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")
CSV_FILE = "/root/shepherdai/cold-emails/day2_contacts.csv"
LOG_FILE = "/root/shepherdai/cold-emails/day2_log.txt"

# Check Day 1 emails for duplicates
day1_emails = set()
d1_file = "/root/shepherdai/cold-emails/day1_contacts.csv"
if os.path.exists(d1_file):
    with open(d1_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            day1_emails.add(row['email'].strip().lower())

# Email templates
TEMPLATE_A_SUBJECT = "Your sermon → 30 days of content (plus a free year for 10 churches)"
TEMPLATE_A_HTML = """<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
<p>Hi Pastor {name},</p>
<p>I know your week: Sunday's sermon, Monday's newsletter, Tuesday's visitor follow-ups, Wednesday's social media... The admin never stops.</p>
<p>What if AI could handle all of it — in your voice, in seconds?</p>
<p><strong>ShepherdAI</strong> is the first AI-powered church management platform built specifically for ministry:</p>
<ul>
<li>Auto-generate weekly newsletters from your sermon notes</li>
<li>Send personalized visitor follow-up emails automatically</li>
<li>Turn one sermon into 30 days of social media posts</li>
<li>Create daily devotionals with your tone and style</li>
<li>Manage prayer requests and pastoral care in one place</li>
</ul>
<p>Other church software charges $200-$500/month with NO AI. ShepherdAI starts at just $19/month — and right now, we're offering something special:</p>
<p style="color:#15803d;font-size:18px;font-weight:bold;">The first 10 churches get our Growth Plan ($79/month) completely FREE for one full year.</p>
<p>Only a few spots remain. No credit card required.</p>
<p>👉 <a href="https://www.shepherdaitech.com/founding-church" style="color:#1e3a5f;font-weight:bold;">Claim your spot at shepherdaitech.com</a></p>
<p><strong>🔒 Your safety matters to us:</strong><br/>
• 256-bit SSL encryption — the same standard banks use<br/>
• GDPR compliant — your data stays yours, always<br/>
• No credit card needed to sign up — zero risk<br/>
• We never sell, share, or misuse your information<br/>
• Verify us: our site uses HTTPS and is verified by Vercel/Google</p>
<p>Ministry is your calling — let AI handle the admin.</p>
<p>Blessings,<br/>ShepherdAI Team<br/><a href="https://www.shepherdaitech.com">www.shepherdaitech.com</a></p>
</div>"""

TEMPLATE_B_SUBJECT = "Save 10+ hours/week on church admin (free for founding churches)"
TEMPLATE_B_HTML = """<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
<p>Pastor {name},</p>
<p>How much time do you spend each week writing newsletters, following up with visitors, and creating social content?</p>
<p>What if AI could do it all for you — automatically, in your own voice?</p>
<p><strong>ShepherdAI</strong> writes your newsletters, follows up with visitors, turns sermons into social posts, and generates daily devotionals. All powered by AI that learns your communication style.</p>
<p>Unlike other church software at $200-$500/month with zero AI features, ShepherdAI starts at just $19/month. And for a limited time:</p>
<p style="color:#15803d;font-size:18px;font-weight:bold;">10 churches get our full Growth Plan FREE for one entire year.</p> That's a $948 value — zero cost.</p>
<p>Only a few founding spots left. No credit card needed.</p>
<p>👉 <a href="https://www.shepherdaitech.com/founding-church" style="color:#1e3a5f;font-weight:bold;">Apply here: shepherdaitech.com/founding-church</a></p>
<p><strong>🔒 Safety guaranteed:</strong><br/>
• 256-bit bank-level encryption on all data<br/>
• GDPR compliant — we respect your privacy<br/>
• No credit card required — no hidden charges, ever<br/>
• Your church data is never sold or shared with third parties<br/>
• HTTPS secured and Google-verified website</p>
<p>Let AI handle the admin so you can focus on ministry.</p>
<p>Blessings,<br/>ShepherdAI Team<br/><a href="https://www.shepherdaitech.com">www.shepherdaitech.com</a></p>
</div>"""

def send_email(to_email, subject, html_body):
    payload = {
        "from": SENDER,
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }
    cmd = [
        "curl", "-s", "-X", "POST", RESEND_API,
        "-H", f"Authorization: Bearer {RESEND_KEY}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload)
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        resp = json.loads(result.stdout) if result.stdout else {}
        if "id" in resp:
            return True, resp["id"]
        else:
            error_msg = resp.get("message", result.stderr or "Unknown error")
            return False, error_msg
    except Exception as e:
        return False, str(e)

def main():
    # Read contacts
    contacts = []
    with open(CSV_FILE, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            contacts.append(row)

    log_lines = []
    log_lines.append(f"ShepherdAI Cold Email Log - Day 2")
    log_lines.append(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log_lines.append("=" * 60)

    sent_count = 0
    fail_count = 0
    skip_count = 0

    for i, contact in enumerate(contacts):
        email = contact['email'].strip()
        church = contact['church_name']
        pastor = contact['pastor_name'].strip()
        city = contact['city']

        # Skip duplicates from Day 1
        if email.lower() in day1_emails:
            log_lines.append(f"⏭️ Skipped (Day 1 duplicate): {email} ({church})")
            skip_count += 1
            continue

        # Determine pastor name for template
        if pastor and pastor.lower() not in ['pastor', 'rev.', '']:
            first_name = pastor.split()[-1] if pastor else "Pastor"
            # Use first name only for friendlier tone
            name_parts = pastor.replace('Rev.', '').replace('Dr.', '').replace('Pastor', '').strip().split()
            first_name = name_parts[0] if name_parts else "Pastor"
        else:
            first_name = "Pastor"

        # Alternate templates
        if i % 2 == 0:
            subject = TEMPLATE_A_SUBJECT
            html = TEMPLATE_A_HTML.replace("{name}", first_name)
        else:
            subject = TEMPLATE_B_SUBJECT
            html = TEMPLATE_B_HTML.replace("{name}", first_name)

        success, msg = send_email(email, subject, html)
        
        if success:
            sent_count += 1
            log_lines.append(f"✅ Sent to {email} ({church}) - ID: {msg}")
        else:
            fail_count += 1
            log_lines.append(f"❌ Failed: {email} ({church}) - {msg}")

        # Rate limiting: pause between emails
        if (i + 1) % 5 == 0:
            log_lines.append(f"--- Batch pause after {i+1} emails (90s) ---")
            print(f"Batch pause after {i+1} emails...")
            time.sleep(90)
        else:
            time.sleep(20)  # 20s between individual emails

        # Print progress
        print(f"[{i+1}/{len(contacts)}] {email}: {'OK' if success else 'FAIL'}")

    # Summary
    log_lines.append("")
    log_lines.append("=" * 60)
    log_lines.append("SUMMARY")
    log_lines.append("=" * 60)
    log_lines.append(f"Total contacts: {len(contacts)}")
    log_lines.append(f"Sent:   {sent_count}")
    log_lines.append(f"Failed: {fail_count}")
    log_lines.append(f"Skipped: {skip_count}")
    log_lines.append(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Write log
    with open(LOG_FILE, 'w') as f:
        f.write('\n'.join(log_lines))

    print(f"\n=== SUMMARY ===")
    print(f"Sent: {sent_count}, Failed: {fail_count}, Skipped: {skip_count}")

if __name__ == "__main__":
    main()
