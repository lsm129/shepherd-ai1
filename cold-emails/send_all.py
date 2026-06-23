#!/usr/bin/env python3
"""Send all cold emails with proper tracking and timing."""
import csv, json, subprocess, sys, time, os

CSV_PATH = "/root/shepherdai/cold-emails/day1_contacts.csv"
LOG_PATH = "/root/shepherdai/cold-emails/day1_log.txt"
API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM = "ShepherdAI <support@shepherdaitech.com>"
SKIP = "bris9850@yahoo.com"
DELAY = 3  # seconds between emails (shortened for batch processing)

SUBJ_EVEN = "Your sermon \u2192 30 days of content (plus a free year for 10 churches)"
SUBJ_ODD = "Save 10+ hours/week on church admin (free for founding churches)"

def extract_first(name):
    if not name or not name.strip(): return "Pastor"
    titles = ["Pastor","Apostle","Prophet","Bishop","Elder","Reverend","Rev","Rev.","Dr","Dr.","Minister"]
    words = [w for w in name.strip().split() if w.rstrip(".") not in [t.rstrip(".") for t in titles]]
    if not words: return "Pastor"
    first = words[0]
    if len(first) <= 3 and "." in first and len(words) > 1:
        first = words[1]
    return first

def build_html(fn):
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#fff;border-radius:8px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f);padding:30px 40px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">&#128017; ShepherdAI</h1>
<p style="margin:5px 0 0;color:#b8d4f0;font-size:14px;">AI-Powered Church Management</p></td></tr>
<tr><td style="padding:30px 40px 10px;"><p style="margin:0;font-size:16px;color:#333;">Hi {fn},</p></td></tr>
<tr><td style="padding:10px 40px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">I know your week: <strong>Sunday&#39;s sermon, Monday&#39;s newsletter, Tuesday&#39;s visitor follow-ups, Wednesday&#39;s social media...</strong> The admin never stops.</p></td></tr>
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:16px;color:#1e3a5f;font-weight:600;">What if AI could handle all of it &mdash; in your voice, in seconds?</p></td></tr>
<tr><td style="padding:15px 40px;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7ff;border-radius:8px;border-left:4px solid #2d6a9f;"><tr><td style="padding:20px;">
<p style="margin:0 0 5px;font-size:15px;color:#1e3a5f;font-weight:700;">ShepherdAI is the first AI-powered church management platform built specifically for ministry:</p>
<ul style="margin:10px 0 0;padding-left:20px;color:#444;font-size:14px;line-height:2;">
<li>Auto-generate weekly newsletters from your sermon notes</li>
<li>Send personalized visitor follow-up emails automatically</li>
<li>Turn one sermon into 30 days of social media posts</li>
<li>Create daily devotionals with your tone and style</li>
<li>Manage prayer requests and pastoral care in one place</li>
</ul></td></tr></table></td></tr>
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">Other church software charges <strong>$200&ndash;$500/month</strong> with <strong>NO AI</strong>. ShepherdAI starts at just <strong>$19/month</strong>.</p></td></tr>
<tr><td style="padding:15px 40px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:8px;border:2px solid #4caf50;"><tr><td style="padding:20px;text-align:center;">
<p style="margin:0;font-size:17px;color:#2e7d32;font-weight:700;">&#127873; The first 10 churches get our Growth Plan ($79/month) completely FREE for one full year.</p>
</td></tr></table></td></tr>
<tr><td style="padding:20px 40px;text-align:center;"><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#2d6a9f,#1e3a5f);border-radius:6px;">
<a href="https://www.shepherdaitech.com/founding-church" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-size:16px;font-weight:700;">Claim Your Free Year &rarr;</a>
</td></tr></table></td></tr>
<tr><td style="padding:15px 40px 30px;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;"><tr><td style="padding:15px 20px;text-align:center;">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#666;">&#128274; Your Data Is Safe With Us</p>
<p style="margin:0;font-size:12px;color:#888;line-height:1.8;">256-bit SSL encryption &mdash; the same standard banks use<br>GDPR compliant &mdash; your data stays yours, always<br>No credit card needed to sign up &mdash; zero risk<br>We never sell, share, or misuse your information<br>HTTPS secured and Google-verified website</p>
</td></tr></table></td></tr>
<tr><td style="padding:0 40px 30px;"><p style="margin:0;font-size:15px;color:#333;">Blessings,</p>
<p style="margin:5px 0 0;font-size:15px;color:#1e3a5f;font-weight:600;">ShepherdAI Team</p>
<p style="margin:3px 0 0;"><a href="https://www.shepherdaitech.com" style="color:#2d6a9f;font-size:13px;text-decoration:none;">www.shepherdaitech.com</a></p></td></tr>
</table></td></tr></table></body></html>'''

def send(to, subj, html):
    payload = {"from": FROM, "to": [to], "subject": subj, "html": html}
    tmp = "/tmp/sa_payload.json"
    with open(tmp,"w") as f: json.dump(payload, f, ensure_ascii=False)
    r = subprocess.run(["curl","-s","-X","POST","https://api.resend.com/emails",
        "-H","Authorization: Bearer "+API_KEY,"-H","Content-Type: application/json",
        "-d","@"+tmp], capture_output=True, text=True, timeout=30)
    if '"id"' in r.stdout: return True, r.stdout
    try: msg = json.loads(r.stdout).get("message", r.stdout[:150])
    except: msg = r.stdout[:150] or "Unknown"
    return False, msg

def valid_email(e):
    return e and "@" in e and "." in e.split("@")[1]

def get_sent_emails():
    """Read log to find already-sent emails."""
    sent = set()
    if os.path.exists(LOG_PATH):
        with open(LOG_PATH) as f:
            for line in f:
                if "Sent to " in line:
                    # Extract email from "Sent to email@domain.com (Church)"
                    parts = line.split("Sent to ")
                    if len(parts) > 1:
                        email = parts[1].split(" ")[0].strip()
                        sent.add(email.lower())
    return sent

# Load contacts
with open(CSV_PATH) as f:
    contacts = list(csv.DictReader(f))

already_sent = get_sent_emails()
print(f"Already sent emails found in log: {len(already_sent)}")
print(f"Total contacts: {len(contacts)}")

# Filter to contacts that need sending
to_send = []
for i, c in enumerate(contacts):
    email = c["email"].strip()
    if email.lower() == SKIP.lower():
        continue
    if not valid_email(email):
        continue
    if email.lower() in already_sent:
        print(f"  Already sent: {email}")
        continue
    to_send.append((i+1, c))

print(f"Emails to send: {len(to_send)}")

sent_count = 0
fail_count = 0

for idx, (row, c) in enumerate(to_send):
    email = c["email"].strip()
    church = c["church_name"].strip()
    name = c.get("pastor_name","").strip()
    fn = extract_first(name)
    subj = SUBJ_EVEN if row % 2 == 0 else SUBJ_ODD
    html = build_html(fn)
    
    ok, resp = send(email, subj, html)
    
    with open(LOG_PATH, "a") as f:
        if ok:
            sent_count += 1
            f.write(f"Sent to {email} ({church})\n")
            print(f"[R{row}] Sent: {email} - Hi {fn}")
        else:
            fail_count += 1
            f.write(f"Failed: {email} ({church}) - {resp}\n")
            print(f"[R{row}] FAILED: {email} - {resp}")
    
    # Delay between emails (not after the last one)
    if idx < len(to_send) - 1:
        time.sleep(DELAY)

# Write summary
summary = f"\n{'='*60}\nSent: {sent_count} | Failed: {fail_count} | Total: {sent_count+fail_count}\nCompleted: {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
with open(LOG_PATH, "a") as f: f.write(summary)
print(summary)
