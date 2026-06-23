#!/usr/bin/env python3
"""Rewrite both day1 and day2 email scripts with VS comparison table added."""

# ============================================================
# Day 1 script (send_batch.py replacement)
# ============================================================
day1_script = r'''#!/usr/bin/env python3
"""Send a batch of cold emails with VS table. Usage: python3 send_batch.py START_IDX"""
import csv, json, subprocess, sys, time

CSV_PATH = "/root/shepherdai/cold-emails/day1_contacts.csv"
LOG_PATH = "/root/shepherdai/cold-emails/day1_log.txt"
API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM = "ShepherdAI <support@shepherdaitech.com>"
SKIP = "bris9850@yahoo.com"

SUBJ_EVEN = "Your sermon → 30 days of content (plus a free year for 10 churches)"
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

VS_TABLE = '''
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:8px;border:1px solid #e0e0e0;margin:15px 0;">
<thead>
<tr style="background:#1e3a5f;color:#fff;">
<th style="padding:10px 8px;text-align:left;font-size:13px;">Feature</th>
<th style="padding:10px 8px;text-align:center;font-size:13px;background:#2d5a8e;">ShepherdAI<br/><span style="font-size:11px;font-weight:400;">$19-79/mo</span></th>
<th style="padding:10px 8px;text-align:center;font-size:13px;">Major App A<br/><span style="font-size:11px;font-weight:400;">$72/mo</span></th>
<th style="padding:10px 8px;text-align:center;font-size:13px;">Major App B<br/><span style="font-size:11px;font-weight:400;">$49+/mo</span></th>
<th style="padding:10px 8px;text-align:center;font-size:13px;">Major App C<br/><span style="font-size:11px;font-weight:400;">$0-279/mo</span></th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px;font-size:12px;font-weight:600;color:#1e3a5f;" colspan="5">AI &amp; Automation</td></tr>
<tr style="border-bottom:1px solid #f1f5f9;">
<td style="padding:7px 8px;font-size:12px;">AI Content Generation</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ Unlimited</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
<td style="padding:7px 8px;font-size:12px;">Sermon → Social Media</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ 1-click</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;">
<td style="padding:7px 8px;font-size:12px;">Personalized Visitor Emails</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ 6/visitor</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">Manual</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">Manual</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
<td style="padding:7px 8px;font-size:12px;">AI Learns Your Style</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ Pro+</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;">
<td style="padding:7px 8px;font-size:12px;">Daily Devotional + Email</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ + Daily email</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px;font-size:12px;font-weight:600;color:#1e3a5f;" colspan="5">Value &amp; Pricing</td></tr>
<tr style="border-bottom:1px solid #f1f5f9;">
<td style="padding:7px 8px;font-size:12px;">Starting Price</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:13px;">$0</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$72/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$49/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$0-279/mo</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
<td style="padding:7px 8px;font-size:12px;">Full Features</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:13px;">$79/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$72/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$99+/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$279/mo</td>
</tr>
</tbody>
</table>
'''

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
<tr><td style="padding:10px 40px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">I know your week: <strong>Sunday's sermon, Monday's newsletter, Tuesday's visitor follow-ups, Wednesday's social media...</strong> The admin never stops.</p></td></tr>
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

def send(to, subj, html):
    payload = {"from": FROM, "to": [to], "subject": subj, "html": html}
    with open("/tmp/sa_payload.json","w") as f: json.dump(payload, f, ensure_ascii=False)
    r = subprocess.run(["curl","-s","-X","POST","https://api.resend.com/emails",
        "-H","Authorization: Bearer "+API_KEY,"-H","Content-Type: application/json",
        "-d","@/tmp/sa_payload.json"], capture_output=True, text=True, timeout=30)
    if '"id"' in r.stdout: return True, r.stdout
    try:
        msg = json.loads(r.stdout).get("message", r.stdout[:150])
    except: msg = r.stdout[:150] or "Unknown"
    return False, msg

def valid_email(e):
    return e and "@" in e and "." in e.split("@")[1]

with open(CSV_PATH) as f:
    contacts = list(csv.DictReader(f))

start = int(sys.argv[1]) if len(sys.argv) > 1 else 1
end = int(sys.argv[2]) if len(sys.argv) > 2 else len(contacts)

sent = 0; failed = 0
for i in range(start-1, min(end, len(contacts))):
    c = contacts[i]
    row = i + 1
    email = c["email"].strip()
    church = c["church_name"].strip()
    name = c.get("pastor_name","").strip()

    if email.lower() == SKIP.lower():
        print(f"[R{row}] SKIP already sent: {email}")
        continue
    if not valid_email(email):
        print(f"[R{row}] INVALID email: {email}")
        with open(LOG_PATH,"a") as f: f.write(f"Failed: {email} ({church}) - Invalid email\n")
        failed += 1
        continue

    fn = extract_first(name)
    subj = SUBJ_EVEN if row % 2 == 0 else SUBJ_ODD
    html = build_html(fn)
    ok, resp = send(email, subj, html)
    tag = "Sent" if ok else "Failed"
    print(f"[R{row}] {tag}: {email} ({church}) - Hi {fn}")
    with open(LOG_PATH,"a") as f:
        if ok: f.write(f"Sent to {email} ({church})\n")
        else: f.write(f"Failed: {email} ({church}) - {resp}\n")
    if ok: sent += 1
    else: failed += 1

print(f"\nBatch done: Sent={sent} Failed={failed}")
'''

with open("/root/shepherdai/cold-emails/send_batch.py", "w") as f:
    f.write(day1_script)

# ============================================================
# Day 2 script (send_all_day2.py replacement)
# ============================================================
day2_script = r'''#!/usr/bin/env python3
import csv, subprocess, json, time, os
from datetime import datetime

SENDER = "ShepherdAI <support@shepherdaitech.com>"
RESEND_API = "https://api.resend.com/emails"
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")
CSV_FILE = "/root/shepherdai/cold-emails/day2_contacts.csv"
LOG_FILE = "/root/shepherdai/cold-emails/day2_log.txt"

day1_emails = set()
d1f = "/root/shepherdai/cold-emails/day1_contacts.csv"
if os.path.exists(d1f):
    with open(d1f) as f:
        for row in csv.DictReader(f):
            day1_emails.add(row['email'].strip().lower())

SUBJ_A = "Your sermon → 30 days of content (plus a free year for 10 churches)"
SUBJ_B = "Save 10+ hours/week on church admin (free for founding churches)"

VS_TABLE = '''
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:8px;border:1px solid #e0e0e0;margin:15px 0;">
<thead>
<tr style="background:#1e3a5f;color:#fff;">
<th style="padding:10px 8px;text-align:left;font-size:13px;">Feature</th>
<th style="padding:10px 8px;text-align:center;font-size:13px;background:#2d5a8e;">ShepherdAI<br/><span style="font-size:11px;font-weight:400;">$19-79/mo</span></th>
<th style="padding:10px 8px;text-align:center;font-size:13px;">Major App A<br/><span style="font-size:11px;font-weight:400;">$72/mo</span></th>
<th style="padding:10px 8px;text-align:center;font-size:13px;">Major App B<br/><span style="font-size:11px;font-weight:400;">$49+/mo</span></th>
<th style="padding:10px 8px;text-align:center;font-size:13px;">Major App C<br/><span style="font-size:11px;font-weight:400;">$0-279/mo</span></th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px;font-size:12px;font-weight:600;color:#1e3a5f;" colspan="5">AI &amp; Automation</td></tr>
<tr style="border-bottom:1px solid #f1f5f9;">
<td style="padding:7px 8px;font-size:12px;">AI Content Generation</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ Unlimited</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
<td style="padding:7px 8px;font-size:12px;">Sermon → Social Media</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ 1-click</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;">
<td style="padding:7px 8px;font-size:12px;">Personalized Visitor Emails</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ 6/visitor</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">Manual</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">Manual</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
<td style="padding:7px 8px;font-size:12px;">AI Learns Your Style</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ Pro+</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;">
<td style="padding:7px 8px;font-size:12px;">Daily Devotional + Email</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:12px;">✓ + Daily email</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
<td style="padding:7px 8px;text-align:center;color:#999;font-size:12px;">✗</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px;font-size:12px;font-weight:600;color:#1e3a5f;" colspan="5">Value &amp; Pricing</td></tr>
<tr style="border-bottom:1px solid #f1f5f9;">
<td style="padding:7px 8px;font-size:12px;">Starting Price</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:13px;">$0</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$72/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$49/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$0-279/mo</td>
</tr>
<tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
<td style="padding:7px 8px;font-size:12px;">Full Features</td>
<td style="padding:7px 8px;text-align:center;background:#f0fdf4;font-weight:700;color:#15803d;font-size:13px;">$79/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$72/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$99+/mo</td>
<td style="padding:7px 8px;text-align:center;color:#b91c1c;font-weight:600;font-size:12px;">$279/mo</td>
</tr>
</tbody>
</table>
'''

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
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:16px;color:#1e3a5f;font-weight:600;">What if AI could handle all of it — in your voice, in seconds?</p></td></tr>
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
<tr><td style="padding:10px 40px 5px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">Other church software charges <strong>$200–$500/month</strong> with <strong>NO AI</strong>. ShepherdAI starts at just <strong>$19/month</strong>.</p></td></tr>
<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:8px;border:2px solid #4caf50;"><tr><td style="padding:20px;text-align:center;">
<p style="margin:0;font-size:17px;color:#2e7d32;font-weight:700;">🎁 The first 10 churches get our Growth Plan ($79/month) completely FREE for one full year.</p>
</td></tr></table></td></tr>
<tr><td style="padding:20px 40px;text-align:center;"><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#2d6a9f,#1e3a5f);border-radius:6px;">
<a href="https://www.shepherdaitech.com/founding-church" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-size:16px;font-weight:700;">Claim Your Free Year →</a>
</td></tr></table></td></tr>
<tr><td style="padding:15px 40px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;"><tr><td style="padding:15px 20px;text-align:center;">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#666;">🔒 Your Data Is Safe With Us</p>
<p style="margin:0;font-size:12px;color:#888;line-height:1.8;">256-bit SSL encryption — the same standard banks use<br/>GDPR compliant — your data stays yours, always<br/>No credit card needed to sign up — zero risk<br/>We never sell, share, or misuse your information<br/>HTTPS secured and Google-verified website</p>
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
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:16px;color:#1e3a5f;font-weight:600;">What if AI could do it all for you — automatically, in your own voice?</p></td></tr>
<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7ff;border-radius:8px;border-left:4px solid #2d6a9f;"><tr><td style="padding:20px;">
<p style="margin:0 0 5px;font-size:15px;color:#1e3a5f;font-weight:700;">ShepherdAI writes your newsletters, follows up with visitors, turns sermons into social posts, and generates daily devotionals. All powered by AI that learns your communication style.</p>
</td></tr></table></td></tr>
<tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:15px;color:#1e3a5f;font-weight:600;">See how we compare:</p></td></tr>
<tr><td style="padding:5px 40px;">{VS_TABLE}</td></tr>
<tr><td style="padding:10px 40px 5px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">Unlike other church software at <strong>$200–$500/month</strong> with zero AI features, ShepherdAI starts at just <strong>$19/month</strong>.</p></td></tr>
<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:8px;border:2px solid #4caf50;"><tr><td style="padding:20px;text-align:center;">
<p style="margin:0;font-size:17px;color:#2e7d32;font-weight:700;">🎁 10 churches get our full Growth Plan FREE for one entire year.</p>
<p style="margin:5px 0 0;font-size:14px;color:#2e7d32;">That's a $948 value — zero cost.</p>
</td></tr></table></td></tr>
<tr><td style="padding:20px 40px;text-align:center;"><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#2d6a9f,#1e3a5f);border-radius:6px;">
<a href="https://www.shepherdaitech.com/founding-church" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-size:16px;font-weight:700;">Apply Here →</a>
</td></tr></table></td></tr>
<tr><td style="padding:15px 40px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;"><tr><td style="padding:15px 20px;text-align:center;">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#666;">🔒 Your Data Is Safe With Us</p>
<p style="margin:0;font-size:12px;color:#888;line-height:1.8;">256-bit bank-level encryption on all data<br/>GDPR compliant — we respect your privacy<br/>No credit card required — no hidden charges, ever<br/>Your church data is never sold or shared with third parties<br/>HTTPS secured and Google-verified website</p>
</td></tr></table></td></tr>
<tr><td style="padding:0 40px 30px;"><p style="margin:0;font-size:15px;color:#333;">Let AI handle the admin so you can focus on ministry.</p>
<p style="margin:10px 0 0;font-size:15px;color:#333;">Blessings,</p>
<p style="margin:5px 0 0;font-size:15px;color:#1e3a5f;font-weight:600;">ShepherdAI Team</p>
<p style="margin:3px 0 0;"><a href="https://www.shepherdaitech.com" style="color:#2d6a9f;font-size:13px;text-decoration:none;">www.shepherdaitech.com</a></p></td></tr>
</table></td></tr></table></body></html>'''

def send(to_email, subject, html):
    payload = json.dumps({"from": SENDER, "to": [to_email], "subject": subject, "html": html})
    cmd = ["curl", "-s", "-X", "POST", RESEND_API, "-H", f"Authorization: Bearer {RESEND_KEY}", "-H", "Content-Type: application/json", "-d", payload]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        d = json.loads(r.stdout) if r.stdout else {}
        return "id" in d, d.get("id", d.get("message", "Unknown error"))
    except Exception as e:
        return False, str(e)

contacts = []
with open(CSV_FILE) as f:
    for row in csv.DictReader(f):
        contacts.append(row)

log = [f"ShepherdAI Cold Email Log - Day 2", f"Started: {datetime.now():%Y-%m-%d %H:%M:%S}", "=" * 60]
sent = fail = skip = 0

for i, c in enumerate(contacts):
    email = c['email'].strip().lower()
    church = c['church_name'].strip()
    pastor = c['pastor_name'].strip()
    
    if email in day1_emails:
        log.append(f"⏭ Skipped (Day 1): {email} ({church})")
        skip += 1
        continue

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
        log.append(f"✅ Sent to {email} ({church}) - {msg}")
    else:
        fail += 1
        log.append(f"❌ Failed: {email} ({church}) - {msg}")
    
    print(f"[{i+1}/70] {email}: {'OK' if ok else 'FAIL'}")
    
    if (i + 1) % 5 == 0 and i < len(contacts) - 1:
        log.append(f"--- Batch pause after {i+1} ---")
        time.sleep(60)
    else:
        time.sleep(12)

log += ["", "=" * 60, "SUMMARY", "=" * 60, f"Sent: {sent}", f"Failed: {fail}", f"Skipped: {skip}", f"Completed: {datetime.now():%Y-%m-%d %H:%M:%S}"]
with open(LOG_FILE, 'w') as f:
    f.write('\n'.join(log))
print(f"\nSent: {sent}, Failed: {fail}, Skipped: {skip}")
'''

with open("/root/shepherdai/cold-emails/send_all_day2.py", "w") as f:
    f.write(day2_script)

print("Done: Both templates updated with VS table")
