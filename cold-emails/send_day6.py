#!/usr/bin/env python3
"""Day 6 cold email: Retry failed + send new. Uses VS table + Resend API."""
import csv, json, time, os, re, subprocess
from datetime import datetime

SENDER = "ShepherdAI <support@shepherdaitech.com>"
API = "https://api.resend.com/emails"
KEY = os.environ.get("RESEND_API_KEY", "")
LOG_DIR = "/root/shepherdai/cold-emails"
LOG = f"{LOG_DIR}/day6_log.txt"
MAX_SEND = 60  # Reserve ~5 for partner emails already sent today

with open(f"{LOG_DIR}/vs_table.html") as f:
    VS_TABLE = f.read()

# Parse all existing logs to find already-sent emails
sent_emails = set()
log_files = [f for f in os.listdir(LOG_DIR) if f.endswith("_log.txt") or f.endswith(".log")]

for lf in log_files:
    path = os.path.join(LOG_DIR, lf)
    try:
        with open(path) as f:
            for line in f:
                m = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
                if m and ('Sent' in line or '✅' in line):
                    email = m.group(0).lower()
                    if 'failed' not in line.lower() and 'skip' not in line.lower():
                        sent_emails.add(email)
    except:
        pass

print(f"Already sent: {len(sent_emails)} emails")

# Read all CSVs for unsent contacts
all_contacts = []
csv_files = sorted([f for f in os.listdir(LOG_DIR) if f.startswith("day") and f.endswith("_contacts.csv")])
seen = set()

for cf in csv_files:
    path = os.path.join(LOG_DIR, cf)
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row.get("email", "").strip().lower()
            if email and email not in sent_emails and email not in seen:
                all_contacts.append(row)
                seen.add(email)

print(f"Unsent contacts available: {len(all_contacts)}")

# Email templates
SUBJ_A = "Your sermon → 30 days of content (plus a free year for 10 churches)"
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
<p style="margin:5px 0 0;font-size:14px;color:#2e7d32;">That&#39;s a $948 value &mdash; zero cost.</p>
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
    payload = json.dumps({"from": SENDER, "to": [to], "subject": subj, "html": html})
    try:
        r = subprocess.run(
            ["curl", "-s", "-X", "POST", API,
             "-H", f"Authorization: Bearer {KEY}",
             "-H", "Content-Type: application/json",
             "-d", payload],
            capture_output=True, text=True, timeout=20
        )
        d = json.loads(r.stdout) if r.stdout else {}
        if "id" in d:
            return True, d["id"]
        # Check for rate limit
        if d.get("statusCode") == 429 or "rate" in str(d).lower():
            return False, "QUOTA_HIT"
        return False, d.get("message", str(d))
    except Exception as e:
        return False, str(e)

# Prioritize: Day2/Day3 quota-failed first, then Day4, then Day5
def priority_key(row):
    email = row.get("email", "").strip().lower()
    # These were the specific Day2/Day3 quota-failed emails from memory
    day2_retry = ["c.west58@att.net", "pastor@alamocity.org", "greaterfaithgfm@gmail.com",
                  "info@reclaimsanantonio.com", "pastord1984@gmail.com", "pastor@memorialmbc.org",
                  "leonardfrench462@yahoo.com", "lordshand@gmail.com", "prchr1b@aol.com",
                  "theofficefbc@gmail.com", "alan.redditt@smbclouisville.org", "sbcc1349@yahoo.com",
                  "vumc@villagemethodist.org", "secretary@wesleyokc.org", "pastorstevensmith@gmail.com",
                  "global@nokcmethodist.church"]
    day3_retry = ["info@newlifebf.org", "connect@ridgetopchurch.org", "angelhouse@austinbaptistchapel.com",
                  "ebenezer@ebc3austin.org", "info@actsaustin.org", "info@hpbc.org"]
    
    # Check which CSV the contact came from
    if email in [e.lower() for e in day2_retry] or email in [e.lower() for e in day3_retry]:
        return 0  # Highest priority
    return 1

all_contacts.sort(key=priority_key)

# Take batch up to MAX_SEND
batch = all_contacts[:MAX_SEND]
log_lines = [f"=== ShepherdAI Cold Email Log - Day 6 ===", f"Date: {datetime.now():%Y-%m-%d}", f"Notes: Retry failed + new sends. Batch size: {len(batch)}", ""]

sent_count = fail_count = skip_count = 0
quota_hit = False

for i, c in enumerate(batch):
    if quota_hit:
        skip_count += 1
        continue
    
    email = c["email"].strip().lower()
    church = c.get("church_name", "").strip()
    pastor = c.get("pastor_name", "").strip()
    city = c.get("city", "").strip()
    
    clean = pastor.replace('Rev.', '').replace('Dr.', '').replace('Pastor', '').strip()
    first = clean.split()[0] if clean.split() else "Pastor"
    if not first or first.lower() in ['rev', 'dr']:
        first = "Pastor"
    
    if i % 2 == 0:
        subj, html = SUBJ_A, html_a(first)
    else:
        subj, html = SUBJ_B, html_b(first)
    
    ok, msg = send(email, subj, html)
    
    if ok:
        sent_count += 1
        log_lines.append(f"  ✅ Sent: {email} ({church}) - {msg}")
    elif msg == "QUOTA_HIT":
        quota_hit = True
        fail_count += 1
        log_lines.append(f"  ❌ Quota hit: {email} ({church})")
    else:
        fail_count += 1
        log_lines.append(f"  ❌ Failed: {email} ({church}) - {msg}")
    
    # Rate limiting: pause every 5 emails
    if (i + 1) % 5 == 0 and i < len(batch) - 1 and not quota_hit:
        log_lines.append(f"  --- Batch {i//5 + 1} pause (60s) ---")
        time.sleep(60)
    elif not quota_hit:
        time.sleep(12)

remaining = len(batch) - sent_count - fail_count - skip_count
log_lines.append(f"\nSUMMARY: Sent={sent_count} Failed={fail_count} Skipped={skip_count} Remaining={remaining}")
log_lines.append(f"Completed: {datetime.now():%Y-%m-%d %H:%M:%S}")

with open(LOG, "w") as f:
    f.write("\n".join(log_lines) + "\n")

print(f"\nDay 6 Results: Sent={sent_count} Failed={fail_count} Skipped={skip_count}")
