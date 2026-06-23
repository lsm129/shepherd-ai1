#!/usr/bin/env python3
"""Send remaining cold emails. Priority: Day4 > Day5 > Day2.
Stops gracefully on quota hit. Run after UTC midnight when quota resets."""
import csv, subprocess, json, time, os, sys, re
from datetime import datetime

SENDER = "ShepherdAI <support@shepherdaitech.com>"
API = "https://api.resend.com/emails"
KEY = os.environ.get("RESEND_API_KEY", "")
BASE = "/root/shepherdai/cold-emails"

with open(f"{BASE}/vs_table.html") as f:
    VS_TABLE = f.read()

# Collect all already-sent emails from every log file
sent_emails = set()
log_files = [f for f in os.listdir(BASE) if f.endswith("_log.txt")]
for lf in log_files:
    with open(f"{BASE}/{lf}") as f:
        for line in f:
            l = line.strip()
            emails = re.findall(r'[\w.+-]+@[\w.-]+\.\w+', l)
            if l.startswith("✅") or (l.startswith("Sent:") and "Failed" not in l):
                for e in emails:
                    sent_emails.add(e.lower())

print(f"Already sent from all logs: {len(sent_emails)}")

SUBJ_A = "Your sermon → 30 days of content (plus a free year for 10 churches)"
SUBJ_B = "Save 10+ hours/week on church admin (free for founding churches)"

def html_a(name):
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#fff;border-radius:8px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f);padding:30px 40px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">&#128017; ShepherdAI</h1><p style="margin:5px 0 0;color:#b8d4f0;font-size:14px;">AI-Powered Church Management</p></td></tr><tr><td style="padding:30px 40px 10px;"><p style="margin:0;font-size:16px;color:#333;">Hi Pastor {name},</p></td></tr><tr><td style="padding:10px 40px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">I know your week: Sunday sermon, Monday newsletter, Tuesday visitor follow-ups, Wednesday social media... The admin never stops.</p></td></tr><tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:16px;color:#1e3a5f;font-weight:600;">What if AI could handle all of it &mdash; in your voice, in seconds?</p></td></tr><tr><td style="padding:15px 40px;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7ff;border-radius:8px;border-left:4px solid #2d6a9f;"><tr><td style="padding:20px;"><p style="margin:0 0 5px;font-size:15px;color:#1e3a5f;font-weight:700;">ShepherdAI is the first AI-powered church management platform built specifically for ministry:</p><ul style="margin:10px 0 0;padding-left:20px;color:#444;font-size:14px;line-height:2;"><li>Auto-generate weekly newsletters from your sermon notes</li><li>Send personalized visitor follow-up emails automatically</li><li>Turn one sermon into 30 days of social media posts</li><li>Create daily devotionals with your tone and style</li><li>Manage prayer requests and pastoral care in one place</li></ul></td></tr></table></td></tr><tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:15px;color:#1e3a5f;font-weight:600;">See how we compare:</p></td></tr><tr><td style="padding:5px 40px;">{VS_TABLE}</td></tr><tr><td style="padding:10px 40px 5px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">Other church software charges <strong>$200&ndash;$500/month</strong> with <strong>NO AI</strong>. ShepherdAI starts at just <strong>$19/month</strong>.</p></td></tr><tr><td style="padding:15px 40px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:8px;border:2px solid #4caf50;"><tr><td style="padding:20px;text-align:center;"><p style="margin:0;font-size:17px;color:#2e7d32;font-weight:700;">&#127873; The first 10 churches get our Growth Plan ($79/month) completely FREE for one full year.</p></td></tr></table></td></tr><tr><td style="padding:20px 40px;text-align:center;"><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#2d6a9f,#1e3a5f);border-radius:6px;"><a href="https://www.shepherdaitech.com/founding-church" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-size:16px;font-weight:700;">Claim Your Free Year &rarr;</a></td></tr></table></td></tr><tr><td style="padding:15px 40px 30px;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;"><tr><td style="padding:15px 20px;text-align:center;"><p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#666;">&#128274; Your Data Is Safe With Us</p><p style="margin:0;font-size:12px;color:#888;line-height:1.8;">256-bit SSL encryption &mdash; the same standard banks use<br/>GDPR compliant &mdash; your data stays yours, always<br/>No credit card needed to sign up &mdash; zero risk<br/>We never sell, share, or misuse your information<br/>HTTPS secured and Google-verified website</p></td></tr></table></td></tr><tr><td style="padding:0 40px 30px;"><p style="margin:0;font-size:15px;color:#333;">Blessings,</p><p style="margin:5px 0 0;font-size:15px;color:#1e3a5f;font-weight:600;">ShepherdAI Team</p><p style="margin:3px 0 0;"><a href="https://www.shepherdaitech.com" style="color:#2d6a9f;font-size:13px;text-decoration:none;">www.shepherdaitech.com</a></p></td></tr></table></td></tr></table></body></html>'''

def html_b(name):
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#fff;border-radius:8px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f);padding:30px 40px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">&#128017; ShepherdAI</h1><p style="margin:5px 0 0;color:#b8d4f0;font-size:14px;">AI-Powered Church Management</p></td></tr><tr><td style="padding:30px 40px 10px;"><p style="margin:0;font-size:16px;color:#333;">Pastor {name},</p></td></tr><tr><td style="padding:10px 40px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">How much time do you spend each week writing newsletters, following up with visitors, and creating social content?</p></td></tr><tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:16px;color:#1e3a5f;font-weight:600;">What if AI could do it all for you &mdash; automatically, in your own voice?</p></td></tr><tr><td style="padding:15px 40px;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8e1;border-radius:8px;border-left:4px solid #ff9800;"><tr><td style="padding:20px;"><p style="margin:0 0 5px;font-size:15px;color:#e65100;font-weight:700;">ShepherdAI saves your church 10+ hours every week:</p><ul style="margin:10px 0 0;padding-left:20px;color:#444;font-size:14px;line-height:2;"><li>Sermon notes &rarr; weekly newsletter (done in 30 seconds)</li><li>Visitor info &rarr; personalized follow-up (sent automatically)</li><li>One sermon &rarr; 30 days of social posts (scheduled for you)</li><li>Prayer requests &rarr; organized and tracked (never missed)</li><li>Weekly bulletin &rarr; generated from your calendar (ready to print)</li></ul></td></tr></table></td></tr><tr><td style="padding:15px 40px 5px;"><p style="margin:0;font-size:15px;color:#1e3a5f;font-weight:600;">See how we compare:</p></td></tr><tr><td style="padding:5px 40px;">{VS_TABLE}</td></tr><tr><td style="padding:10px 40px 5px;"><p style="margin:0;font-size:15px;color:#555;line-height:1.6;">Other tools cost <strong>$200&ndash;$500/month</strong> and still need manual work. ShepherdAI is <strong>$19/month</strong> with AI doing the heavy lifting.</p></td></tr><tr><td style="padding:15px 40px;"><table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:8px;border:2px solid #4caf50;"><tr><td style="padding:20px;text-align:center;"><p style="margin:0;font-size:17px;color:#2e7d32;font-weight:700;">&#127873; 10 churches get our full Growth Plan FREE for one entire year.</p><p style="margin:5px 0 0;font-size:14px;color:#2e7d32;">That&#39;s a $948 value &mdash; zero cost.</p></td></tr></table></td></tr><tr><td style="padding:20px 40px;text-align:center;"><table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background:linear-gradient(135deg,#2d6a9f,#1e3a5f);border-radius:6px;"><a href="https://www.shepherdaitech.com/founding-church" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-size:16px;font-weight:700;">Apply Here &rarr;</a></td></tr></table></td></tr><tr><td style="padding:15px 40px 30px;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;"><tr><td style="padding:15px 20px;text-align:center;"><p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#666;">&#128274; Your Data Is Safe With Us</p><p style="margin:0;font-size:12px;color:#888;line-height:1.8;">256-bit bank-level encryption on all data<br/>GDPR compliant &mdash; we respect your privacy<br/>No credit card required &mdash; no hidden charges, ever<br/>Your church data is never sold or shared with third parties<br/>HTTPS secured and Google-verified website</p></td></tr></table></td></tr><tr><td style="padding:0 40px 30px;"><p style="margin:0;font-size:15px;color:#333;">Let AI handle the admin so you can focus on ministry.</p><p style="margin:10px 0 0;font-size:15px;color:#333;">Blessings,</p><p style="margin:5px 0 0;font-size:15px;color:#1e3a5f;font-weight:600;">ShepherdAI Team</p><p style="margin:3px 0 0;"><a href="https://www.shepherdaitech.com" style="color:#2d6a9f;font-size:13px;text-decoration:none;">www.shepherdaitech.com</a></p></td></tr></table></td></tr></table></body></html>'''

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
        msg = d.get("message", "")
        if "quota" in msg.lower() or "daily" in msg.lower():
            return False, "QUOTA_HIT"
        return "id" in d, d.get("id", msg or "?")
    except Exception as e:
        return False, str(e)

# Build queue: Day4 first (most urgent), then Day5, then Day2
queue = []
seen = set()
for day_num in [4, 5, 2]:
    csv_path = f"{BASE}/day{day_num}_contacts.csv"
    if not os.path.exists(csv_path):
        continue
    with open(csv_path) as f:
        for row in csv.DictReader(f):
            e = row.get("email", "").strip().lower()
            if e and e not in sent_emails and e not in seen:
                row["day_tag"] = f"DAY{day_num}"
                queue.append(row)
                seen.add(e)

print(f"Send queue: {len(queue)} emails (Day4={sum(1 for c in queue if c['day_tag']=='DAY4')}, Day5={sum(1 for c in queue if c['day_tag']=='DAY5')}, Day2={sum(1 for c in queue if c['day_tag']=='DAY2')})")
if not queue:
    print("Nothing to send!")
    sys.exit(0)

# Send with rate limiting
log_path = f"{BASE}/send_remaining_log.txt"
sent_count = 0
fail_count = 0
quota_hit = False
start = datetime.now()
log_lines = [f"\n=== Send Remaining - {start:%Y-%m-%d %H:%M:%S} ===",
             f"Queue: {len(queue)} (Day4={sum(1 for c in queue if c['day_tag']=='DAY4')}, Day5={sum(1 for c in queue if c['day_tag']=='DAY5')}, Day2={sum(1 for c in queue if c['day_tag']=='DAY2')})"]

for i, c in enumerate(queue):
    if quota_hit:
        log_lines.append(f"  Skipped: {c['email']} ({c.get('church_name','')}) [{c['day_tag']}] - quota hit")
        continue

    email = c["email"].strip().lower()
    church = c.get("church_name", "").strip()
    pastor = c.get("pastor_name", "").strip()
    tag = c["day_tag"]

    clean = pastor.replace('Rev.', '').replace('Dr.', '').replace('Pastor', '').strip()
    first = clean.split()[0] if clean.split() else "Pastor"
    if not first or first.lower() in ['rev', 'dr']:
        first = "Pastor"

    if i % 2 == 0:
        ok, msg = send(email, SUBJ_A, html_a(first))
    else:
        ok, msg = send(email, SUBJ_B, html_b(first))

    if ok:
        sent_count += 1
        log_lines.append(f"  Sent: {email} ({church}) [{tag}] - {msg}")
    else:
        if msg == "QUOTA_HIT":
            quota_hit = True
            fail_count += 1
            log_lines.append(f"  Failed: {email} ({church}) [{tag}] - QUOTA HIT")
            continue
        fail_count += 1
        log_lines.append(f"  Failed: {email} ({church}) [{tag}] - {msg}")

    # Progress report every 5
    if (i + 1) % 5 == 0:
        print(f"  Progress: {i+1}/{len(queue)} sent={sent_count} fail={fail_count}")

    # Rate limiting: 12s between emails, 60s every 5
    if (i + 1) % 5 == 0 and i < len(queue) - 1 and not quota_hit:
        time.sleep(60)
    elif not quota_hit:
        time.sleep(12)

end = datetime.now()
log_lines.append(f"\nSUMMARY: Queued={len(queue)} Sent={sent_count} Failed={fail_count} QuotaHit={quota_hit}")
log_lines.append(f"Completed: {end:%Y-%m-%d %H:%M:%S}")

with open(log_path, "a") as f:
    f.write("\n".join(log_lines) + "\n")

print(f"\nDone: Sent={sent_count} Failed={fail_count} QuotaHit={quota_hit}")
