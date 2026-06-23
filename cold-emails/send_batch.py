#!/usr/bin/env python3
"""Send a batch of cold emails with VS table. Usage: python3 send_batch.py START_IDX"""
import csv, json, subprocess, sys, time

CSV_PATH = "/root/shepherdai/cold-emails/day1_contacts.csv"
LOG_PATH = "/root/shepherdai/cold-emails/day1_log.txt"
API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM = "ShepherdAI <support@shepherdaitech.com>"
SKIP = "bris9850@yahoo.com"

SUBJ_EVEN = "Your sermon \u2192 30 days of content (plus a free year for 10 churches)"
SUBJ_ODD = "Save 10+ hours/week on church admin (free for founding churches)"

with open("/root/shepherdai/cold-emails/vs_table.html") as f:
    VS_TABLE = f.read()

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
