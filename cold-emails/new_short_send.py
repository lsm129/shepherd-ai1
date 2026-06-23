#!/usr/bin/env python3
"""New short cold email template - personal, single pain point, light CTA.
Also sends follow-ups to previously contacted pastors."""
import csv, subprocess, json, time, os, sys
from datetime import datetime

SENDER = "Pastor Support <support@shepherdaitech.com>"
API = "https://api.resend.com/emails"
KEY = os.environ.get("RESEND_API_KEY", "")
if not KEY:
    print("ERROR: RESEND_API_KEY environment variable not set!")
    sys.exit(1)
LOG_DIR = "/root/shepherdai/cold-emails"

# Track new-short-template sent contacts (separate from old template)
NEW_SHORT_SENT_FILE = f"{LOG_DIR}/new_short_sent.txt"

SUBJECTS = [
    "Quick question about {church}'s visitor follow-up",
    "How does {church} handle weekly newsletters?",
    "{church} - 3 hours less admin this Sunday?",
]

def body1(name, church):
    return f"""<div style="font-family:Arial,sans-serif;max-width:500px;color:#333;">
<p style="font-size:15px;">Hi {name},</p>
<p style="font-size:15px;">I noticed {church} - how are you currently following up with first-time visitors?</p>
<p style="font-size:15px;">Most pastors I talk to spend 2-3 hours/week on visitor emails alone. We built a tool that sends personalized follow-ups automatically, in your voice.</p>
<p style="font-size:15px;">Free to try, 2-minute setup. Is that something you'd be open to?</p>
<p style="font-size:14px;color:#666;">- James<br/>ShepherdAI<br/>shepherdaitech.com</p>
<p style="font-size:10px;color:#aaa;margin-top:15px;">Bank-level encryption. Your data is never shared.</p>
</div>"""

def body2(name, church):
    return f"""<div style="font-family:Arial,sans-serif;max-width:500px;color:#333;">
<p style="font-size:15px;">Hi {name},</p>
<p style="font-size:15px;">How long does it take you to write {church}'s weekly newsletter?</p>
<p style="font-size:15px;">Pastors tell us it eats up 3-4 hours every week. We made a tool that generates it from your sermon notes - automatically, in your own tone.</p>
<p style="font-size:15px;">Free to start. Would that be useful for you?</p>
<p style="font-size:14px;color:#666;">- James<br/>ShepherdAI<br/>shepherdaitech.com</p>
<p style="font-size:10px;color:#aaa;margin-top:15px;">Bank-level encryption. Your data is never shared.</p>
</div>"""

def body3(name, church):
    return f"""<div style="font-size:15px;font-family:Arial,sans-serif;max-width:500px;color:#333;">
<p>Hi {name},</p>
<p>Writing Sunday announcements every week - is that eating up your time at {church}?</p>
<p>We built a free tool that generates them in seconds. No signup needed, just type and go. Pastors are saving 2-3 hours/week with it.</p>
<p>Want to try it? <a href="https://www.shepherdaitech.com/free-tools/church-announcement" style="color:#2d6a9f;">Here is the link</a>.</p>
<p style="font-size:14px;color:#666;">- James<br/>ShepherdAI</p>
<p style="font-size:10px;color:#aaa;margin-top:15px;">Bank-level encryption. Your data is never shared.</p>
</div>"""

BODIES = [body1, body2, body3]

def followup_html(name, church):
    return f"""<div style="font-family:Arial,sans-serif;max-width:500px;color:#333;">
<p style="font-size:15px;">Hi {name},</p>
<p style="font-size:15px;">I reached out last week about {church} - just wanted to circle back with a quick question:</p>
<p style="font-size:15px;">What is the one admin task that takes up the most of your week?</p>
<p style="font-size:15px;">We built ShepherdAI to handle exactly those - visitor follow-ups, newsletters, announcements - automatically. Free to start.</p>
<p style="font-size:15px;">Even a "not right now" helps me understand what pastors need. Mind hitting reply?</p>
<p style="font-size:14px;color:#666;">- James<br/>ShepherdAI</p>
<p style="font-size:10px;color:#aaa;margin-top:15px;">Bank-level encryption. Your data is never shared.</p>
</div>"""

def send_email(to, subj, html):
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
        return "id" in d, d.get("id", d.get("message", "?"))
    except Exception as e:
        return False, str(e)

def clean_name(pastor_str):
    clean = pastor_str.replace('Rev.', '').replace('Dr.', '').replace('Pastor', '').replace('Reverend', '').strip()
    first = clean.split()[0] if clean.split() else "Pastor"
    if not first or first.lower() in ['rev', 'dr', 'the']:
        first = "Pastor"
    return first

# Load already-sent emails from old template
sent_emails = set()
for lf in os.listdir(LOG_DIR):
    if lf.endswith('_log.txt') or lf == 'send_remaining_log.txt' or lf == 'send_output.txt':
        try:
            with open(f"{LOG_DIR}/{lf}") as f:
                for line in f:
                    for marker in ['Sent to ', 'Sent: ', 'Sent:']:
                        if marker in line and '@' in line:
                            e = line.split(marker)[1].split(' ')[0].strip().split('(')[0].strip()
                            if '@' in e:
                                sent_emails.add(e.lower())
        except:
            pass

# *** FIX: Load new-short-template sent contacts ***
new_short_sent = set()
if os.path.exists(NEW_SHORT_SENT_FILE):
    with open(NEW_SHORT_SENT_FILE) as f:
        for line in f:
            e = line.strip().split()[-1] if line.strip() else ""
            if '@' in e:
                new_short_sent.add(e.lower())
sent_emails.update(new_short_sent)

# Load follow-up already sent
followup_sent = set()
followup_log = f"{LOG_DIR}/followup_log.txt"
if os.path.exists(followup_log):
    with open(followup_log) as f:
        for line in f:
            parts = line.strip().split()
            if parts:
                e = parts[-1]
                if '@' in e:
                    followup_sent.add(e.lower())

# Load all contacts
all_contacts = []
seen = set()
csv_files = sorted([f for f in os.listdir(LOG_DIR) if f.startswith("day") and f.endswith("_contacts.csv")])
for cf in csv_files:
    with open(f"{LOG_DIR}/{cf}") as f:
        for row in csv.DictReader(f):
            e = row.get("email", "").strip().lower()
            if e and e not in seen:
                seen.add(e)
                all_contacts.append(row)

new_contacts = [c for c in all_contacts if c["email"].strip().lower() not in sent_emails]
followup_contacts = [c for c in all_contacts if c["email"].strip().lower() in sent_emails and c["email"].strip().lower() not in followup_sent]

mode = sys.argv[1] if len(sys.argv) > 1 else "both"

log_lines = [f"\n[{datetime.now():%Y-%m-%d %H:%M}] === New short template (mode={mode}) ==="]
sent_count = fail_count = 0
total_today = 0
MAX_DAILY = 100
new_sent_today = []  # track new contacts sent today

# Send new contacts first
if mode in ("both", "new") and new_contacts and total_today < MAX_DAILY:
    batch = new_contacts[:min(80, MAX_DAILY - total_today)]
    log_lines.append(f"--- NEW contacts: {len(batch)} ---")
    for i, c in enumerate(batch):
        email = c["email"].strip().lower()
        church = c.get("church_name", "").strip() or "your church"
        pastor = c.get("pastor_name", "").strip()
        first = clean_name(pastor)
        
        variant = i % 3
        subj = SUBJECTS[variant].format(church=church)
        html = BODIES[variant](first, church)
        
        ok, msg = send_email(email, subj, html)
        if ok:
            sent_count += 1
            new_sent_today.append(email)
            log_lines.append(f"  OK NEW: {email} ({church}) - variant {variant+1}")
        else:
            fail_count += 1
            log_lines.append(f"  FAIL NEW: {email} ({church}) - {msg}")
        
        total_today += 1
        time.sleep(10)

# Send follow-ups to previously contacted
followup_sent_today = []
if mode in ("both", "followup") and followup_contacts and total_today < MAX_DAILY:
    batch = followup_contacts[:min(20, MAX_DAILY - total_today)]
    log_lines.append(f"--- FOLLOW-UP contacts: {len(batch)} ---")
    for c in batch:
        email = c["email"].strip().lower()
        church = c.get("church_name", "").strip() or "your church"
        pastor = c.get("pastor_name", "").strip()
        first = clean_name(pastor)
        
        subj = f"Quick question about {church}'s admin"
        html = followup_html(first, church)
        
        ok, msg = send_email(email, subj, html)
        if ok:
            sent_count += 1
            followup_sent.add(email)
            followup_sent_today.append(email)
            log_lines.append(f"  OK FOLLOWUP: {email} ({church})")
        else:
            fail_count += 1
            log_lines.append(f"  FAIL FOLLOWUP: {email} ({church}) - {msg}")
        
        total_today += 1
        time.sleep(10)

log_lines.append(f"SUMMARY: Sent={sent_count} Failed={fail_count} Total_today={total_today}")
log_lines.append(f"New remaining: {max(0, len(new_contacts)-len(new_sent_today))}")
log_lines.append(f"Followup remaining: {max(0, len(followup_contacts)-len(followup_sent_today))}")

with open(f"{LOG_DIR}/new_template_log.txt", "a") as f:
    f.write("\n".join(log_lines) + "\n")

# *** FIX: Save new-short sent contacts (only new ones from today) ***
with open(NEW_SHORT_SENT_FILE, "a") as f:
    now_str = f"{datetime.now():%Y-%m-%d}"
    for e in new_sent_today:
        f.write(f"{now_str} {e}\n")

# Save follow-up sent list (only new ones from today)
with open(followup_log, "a") as f:
    now_str = f"{datetime.now():%Y-%m-%d}"
    for e in followup_sent_today:
        f.write(f"{now_str} {e}\n")

print(f"Sent: {sent_count}, Failed: {fail_count}, Today: {total_today}")
