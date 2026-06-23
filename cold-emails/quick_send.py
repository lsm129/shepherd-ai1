#!/usr/bin/env python3
"""Cron cold email sender with VS table. Sends to new city contacts."""
import csv, subprocess, json, time, os, sys
from datetime import datetime

SENDER = "ShepherdAI <support@shepherdaitech.com>"
API = "https://api.resend.com/emails"
KEY = os.environ.get("RESEND_API_KEY", "")
LOG = "/root/shepherdai/cold-emails/cron_log.txt"

with open("/root/shepherdai/cold-emails/vs_table.html") as f:
    VS_TABLE = f.read()

# Load already-sent emails from all previous logs
sent_emails = set()
for lf in ["/root/shepherdai/cold-emails/day1_log.txt", "/root/shepherdai/cold-emails/day2_log.txt"]:
    if os.path.exists(lf):
        with open(lf) as f:
            for line in f:
                if "Sent to " in line:
                    e = line.split("Sent to ")[1].split(" ")[0].strip()
                    if e: sent_emails.add(e.lower())

SUBJ_A = "Your sermon \u2192 30 days of content (plus a free year for 10 churches)"
SUBJ_B = "Save 10+ hours/week on church admin (free for founding churches)"

def html_a(name):
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#fff;border-radius:8px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f);padding:30px 40px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">&#128017; ShepherdAI</h1>
<p style="margin:5px 0 0;color:#b8d4f0;font-size:14px;">AI-Powered Church Management</p></td></tr>
<tr><td style="padding:30px 40px 10px;"><p style="margin:0;font-size:16px;color:#333;">Hi Pastor {name},</p></td></tr>
<tr><td style="padding:10px 40px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">I know your week: Sunday sermon, Monday newsletter, Tuesday visitor follow-ups, Wednesday social media... The admin never stops.</p></td></tr>
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:16px;color:#1e3a5f;font-weight:600;">What if AI could handle all of it &mdash; in your voice, in seconds?</p></td></tr>
<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7ff;border-radius:8px;border-left:4px solid #2d6a9f;"><tr><td style="padding:20px;">
<p style="margin:0 0 5px;font-size:15px;color:#1e3a5f;font-weight:700;">ShepherdAI is the first AI-powered church management platform built specifically for ministry:</p>
<ul style="margin:10px 0 0;padding-left:20px;color:#444;font-size:14px;line-height:2;">
<li>Auto-generate weekly newsletters from your sermon notes</li>
<li>Send personalized visitor follow-up emails automatically</li>
<li>Turn one sermon into 30 days of social media posts</li>
<li>Create daily devotionals with your tone and style</li>
<li>Manage prayer requests and pastoral care in one place</li>
</ul></td></tr></table></td></tr>
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:15px;color:#1e3a5f;font-weight:600;">See how we compare:</p></td></tr>
<tr><td style="padding:5px 40px;">{VS_TABLE}</td></tr>
<tr><td style="padding:10px 40px 5px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">Other church software charges <strong>$200&ndash;$500/month</strong> with <strong>NO AI</strong>. ShepherdAI starts at just <strong>$19/month</strong>.</p></td></tr>
<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:8px;border:2px solid #4caf50;"><tr><td style="padding:20px;text-align:center;">
<p style="margin:0;font-size:17px;color:#2e7d32;font-weight:700;">&#127873; The first 10 churches get our Growth Plan ($79/month) completely FREE for one full year.</p>
</td></tr></table></td></tr>
<tr><td style="padding:20px 40px;text-align:center;"><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#2d6a9f,#1e3a5f);border-radius:6px;">
<a href="https://www.shepherdaitech.com/founding-church" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-size:16px;font-weight:700;">Claim Your Free Year &rarr;</a>
</td></tr></table></td></tr>
<tr><td style="padding:15px 40px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;"><tr><td style="padding:15px 20px;text-align:center;">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#666;">&#128274; Your Data Is Safe With Us</p>
<p style="margin:0;font-size:12px;color:#888;line-height:1.8;">256-bit SSL encryption &mdash; the same standard banks use<br/>GDPR compliant &mdash; your data stays yours, always<br/>No credit card needed to sign up &mdash; zero risk<br/>We never sell, share, or misuse your information<br/>HTTPS secured and Google-verified website</p>
</td></tr></table></td></tr>
<tr><td style="padding:0 40px 30px;"><p style="margin:0;font-size:15px;color:#333;">Blessings,</p>
<p style="margin:5px 0 0;font-size:15px;color:#1e3a5f;font-weight:600;">ShepherdAI Team</p>
<p style="margin:3px 0 0;"><a href="https://www.shepherdaitech.com" style="color:#2d6a9f;font-size:13px;text-decoration:none;">www.shepherdaitech.com</a></p></td></tr>
</table></td></tr></table></body></html>'''

def html_b(name):
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#fff;border-radius:8px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f);padding:30px 40px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">&#128017; ShepherdAI</h1>
<p style="margin:5px 0 0;color:#b8d4f0;font-size:14px;">AI-Powered Church Management</p></td></tr>
<tr><td style="padding:30px 40px 10px;"><p style="margin:0;font-size:16px;color:#333;">Pastor {name},</p></td></tr>
<tr><td style="padding:10px 40px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">How much time do you spend each week writing newsletters, following up with visitors, and creating social content?</p></td></tr>
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:16px;color:#1e3a5f;font-weight:600;">What if AI could do it all for you &mdash; automatically, in your own voice?</p></td></tr>
<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7ff;border-radius:8px;border-left:4px solid #2d6a9f;"><tr><td style="padding:20px;">
<p style="margin:0 0 5px;font-size:15px;color:#1e3a5f;font-weight:700;">ShepherdAI writes your newsletters, follows up with visitors, turns sermons into social posts, and generates daily devotionals. All powered by AI that learns your communication style.</p>
</td></tr></table></td></tr>
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:15px;color:#1e3a5f;font-weight:600;">See how we compare:</p></td></tr>
<tr><td style="padding:5px 40px;">{VS_TABLE}</td></tr>
<tr><td style="padding:10px 40px 5px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">Unlike other church software at <strong>$200&ndash;$500/month</strong> with zero AI features, ShepherdAI starts at just <strong>$19/month</strong>.</p></td></tr>
<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:8px;border:2px solid #4caf50;"><tr><td style="padding:20px;text-align:center;">
<p style="margin:0;font-size:17px;color:#2e7d32;font-weight:700;">&#127873; 10 churches get our full Growth Plan FREE for one entire year.</p>
<p style="margin:5px 0 0;font-size:14px;color:#2e7d32;">That's a $948 value &mdash; zero cost.</p>
</td></tr></table></td></tr>
<tr><td style="padding:20px 40px;text-align:center;"><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#2d6a9f,#1e3a5f);border-radius:6px;">
<a href="https://www.shepherdaitech.com/founding-church" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-size:16px;font-weight:700;">Apply Here &rarr;</a>
</td></tr></table></td></tr>
<tr><td style="padding:15px 40px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;"><tr><td style="padding:15px 20px;text-align:center;">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#666;">&#128274; Your Data Is Safe With Us</p>
<p style="margin:0;font-size:12px;color:#888;line-height:1.8;">256-bit bank-level encryption on all data<br/>GDPR compliant &mdash; we respect your privacy<br/>No credit card required &mdash; no hidden charges, ever<br/>Your church data is never sold or shared with third parties<br/>HTTPS secured and Google-verified website</p>
</td></tr></table></td></tr>
<tr><td style="padding:0 40px 30px;"><p style="margin:0;font-size:15px;color:#333;">Let AI handle the admin so you can focus on ministry.</p>
<p style="margin:10px 0 0;font-size:15px;color:#333;">Blessings,</p>
<p style="margin:5px 0 0;font-size:15px;color:#1e3a5f;font-weight:600;">ShepherdAI Team</p>
<p style="margin:3px 0 0;"><a href="https://www.shepherdaitech.com" style="color:#2d6a9f;font-size:13px;text-decoration:none;">www.shepherdaitech.com</a></p></td></tr>
</table></td></tr></table></body></html>'''

def send(to, subj, html):
    p = json.dumps({"from": SENDER, "to": [to], "subject": subj, "html": html})
    try:
        r = subprocess.run(["curl","-s","-X","POST",API,"-H",f"Authorization: Bearer {KEY}","-H","Content-Type: application/json","-d",p], capture_output=True, text=True, timeout=20)
        d = json.loads(r.stdout) if r.stdout else {}
        return "id" in d, d.get("id", d.get("message","?"))
    except Exception as e:
        return False, str(e)

# Find all contact CSVs that haven't been sent yet
csv_files = sorted([f for f in os.listdir("/root/shepherdai/cold-emails/") if f.startswith("day") and f.endswith("_contacts.csv")])

all_contacts = []
for cf in csv_files:
    with open(f"/root/shepherdai/cold-emails/{cf}") as f:
        for row in csv.DictReader(f):
            e = row.get("email","").strip().lower()
            if e and e not in sent_emails:
                all_contacts.append(row)
                sent_emails.add(e)  # dedupe within batch too

if not all_contacts:
    print(f"[{datetime.now():%Y-%m-%d %H:%M}] No new contacts to send to.")
    sys.exit(0)

# Limit to 40 per cron run
batch = all_contacts[:40]
log_lines = [f"[{datetime.now():%Y-%m-%d %H:%M}] Starting cron send: {len(batch)} contacts"]
sent = fail = skip = 0

for i, c in enumerate(batch):
    email = c["email"].strip().lower()
    church = c.get("church_name","").strip()
    pastor = c.get("pastor_name","").strip()
    
    clean = pastor.replace('Rev.', '').replace('Dr.', '').replace('Pastor', '').strip()
    first = clean.split()[0] if clean.split() else "Pastor"
    if not first or first.lower() in ['rev', 'dr']:
        first = "Pastor"

    if i % 2 == 0:
        ok, msg = send(email, SUBJ_A, html_a(first))
    else:
        ok, msg = send(email, SUBJ_B, html_b(first))
    
    if ok:
        sent += 1
        log_lines.append(f"  Sent: {email} ({church})")
    else:
        fail += 1
        log_lines.append(f"  Failed: {email} ({church}) - {msg}")
    
    if (i + 1) % 5 == 0 and i < len(batch) - 1:
        time.sleep(60)
    else:
        time.sleep(12)

log_lines.append(f"Done: Sent={sent} Failed={fail}")
with open(LOG, "a") as f:
    f.write("\n".join(log_lines) + "\n")
print(f"Sent: {sent}, Failed: {fail}")
