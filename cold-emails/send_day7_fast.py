#!/usr/bin/env python3
import csv, subprocess, json, time, os, sys
from datetime import datetime

SENDER = "Pastor Support <support@shepherdaitech.com>"
API = "https://api.resend.com/emails"
KEY = os.environ.get("RESEND_API_KEY", "")
LOG_DIR = "/root/shepherdai/cold-emails"

SUBJECTS = [
    "Quick question about {church}'s visitor follow-up",
    "How does {church} handle weekly newsletters?",
    "{church} - 3 hours less admin this Sunday?",
]

def body1(name, church):
    return '<div style="font-family:Arial,sans-serif;max-width:500px;color:#333;"><p style="font-size:15px;">Hi ' + name + ',</p><p style="font-size:15px;">I noticed ' + church + ' - how are you currently following up with first-time visitors?</p><p style="font-size:15px;">Most pastors I talk to spend 2-3 hours/week on visitor emails alone. We built a tool that sends personalized follow-ups automatically, in your voice.</p><p style="font-size:15px;">Free to try, 2-minute setup. Is that something you\'d be open to?</p><p style="font-size:14px;color:#666;">- James<br/>ShepherdAI<br/>shepherdaitech.com</p><p style="font-size:10px;color:#aaa;margin-top:15px;">Bank-level encryption. Your data is never shared.</p></div>'

def body2(name, church):
    return '<div style="font-family:Arial,sans-serif;max-width:500px;color:#333;"><p style="font-size:15px;">Hi ' + name + ',</p><p style="font-size:15px;">How long does it take you to write ' + church + '\'s weekly newsletter?</p><p style="font-size:15px;">Pastors tell us it eats up 3-4 hours every week. We made a tool that generates it from your sermon notes - automatically, in your own tone.</p><p style="font-size:15px;">Free to start. Would that be useful for you?</p><p style="font-size:14px;color:#666;">- James<br/>ShepherdAI<br/>shepherdaitech.com</p><p style="font-size:10px;color:#aaa;margin-top:15px;">Bank-level encryption. Your data is never shared.</p></div>'

def body3(name, church):
    return '<div style="font-size:15px;font-family:Arial,sans-serif;max-width:500px;color:#333;"><p>Hi ' + name + ',</p><p>Writing Sunday announcements every week - is that eating up your time at ' + church + '?</p><p>We built a free tool that generates them in seconds. No signup needed, just type and go. Pastors are saving 2-3 hours/week with it.</p><p>Want to try it? <a href="https://www.shepherdaitech.com/free-tools/church-announcement" style="color:#2d6a9f;">Here is the link</a>.</p><p style="font-size:14px;color:#666;">- James<br/>ShepherdAI</p><p style="font-size:10px;color:#aaa;margin-top:15px;">Bank-level encryption. Your data is never shared.</p></div>'

BODIES = [body1, body2, body3]

def send_email(to, subj, html):
    payload = json.dumps({"from": SENDER, "to": [to], "subject": subj, "html": html})
    try:
        r = subprocess.run(
            ["curl", "-s", "-X", "POST", API,
             "-H", "Authorization: Bearer " + KEY,
             "-H", "Content-Type: application/json",
             "-d", payload],
            capture_output=True, text=True, timeout=20
        )
        d = json.loads(r.stdout) if r.stdout else {}
        return "id" in d, d.get("id", d.get("message", "?"))
    except Exception as e:
        return False, str(e)

def clean_name(pastor_str):
    clean = pastor_str.replace('Rev.', '').replace('Dr.', '').replace('Pastor', '').replace('Reverend', '').replace('Bro ', '').strip()
    first = clean.split()[0] if clean.split() else "Pastor"
    if not first or first.lower() in ['rev', 'dr', 'the', 'bro', 'transitional']:
        first = "Pastor"
    return first

sent_emails = set()
for lf in os.listdir(LOG_DIR):
    if lf.endswith('_log.txt') or lf in ('send_remaining_log.txt', 'send_output.txt', 'new_template_log.txt'):
        try:
            with open(os.path.join(LOG_DIR, lf)) as f:
                for line in f:
                    for marker in ['Sent to ', 'Sent: ', 'Sent:', 'OK NEW:', 'OK FOLLOWUP:']:
                        if marker in line and '@' in line:
                            e = line.split(marker)[1].split(' ')[0].strip().split('(')[0].strip()
                            if '@' in e:
                                sent_emails.add(e.lower())
        except:
            pass

# Also check the test email we just sent
sent_emails.add("info@convergechurchomaha.org")

all_contacts = []
with open(os.path.join(LOG_DIR, "day7_contacts.csv")) as f:
    for row in csv.DictReader(f):
        e = row.get("email", "").strip().lower()
        if e and e not in sent_emails:
            all_contacts.append(row)
            sent_emails.add(e)

if not all_contacts:
    print("No new contacts!")
    sys.exit(0)

MAX_SEND = 64  # We already sent 1 test email
batch = all_contacts[:MAX_SEND]

log_lines = ["=== ShepherdAI Cold Email Log - Day 7 ==="]
log_lines.append("Date: " + datetime.now().strftime('%Y-%m-%d'))
log_lines.append("Notes: New cities (Omaha/Tulsa/Milwaukee/Pittsburgh/Richmond/Minneapolis). Batch: " + str(len(batch)))
log_lines.append("")

sent_count = 1  # Count the test email we already sent
fail_count = 0

# Log the test email
log_lines.append("  OK: info@convergechurchomaha.org (Converge Church Omaha) - variant 1")

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
        log_lines.append("  OK: " + email + " (" + church + ") - variant " + str(variant+1))
    else:
        fail_count += 1
        log_lines.append("  FAIL: " + email + " (" + church + ") - " + str(msg))
    
    # Rate limit: Resend free is 100/day, 10/min (for paid), 3/min (free)
    if (i + 1) % 3 == 0:
        time.sleep(25)
    else:
        time.sleep(12)
    
    # Print progress every 10
    if (i + 1) % 10 == 0:
        print("Progress: " + str(i+1) + "/" + str(len(batch)) + " sent=" + str(sent_count) + " fail=" + str(fail_count))
        sys.stdout.flush()

log_lines.append("\nSUMMARY: Sent=" + str(sent_count) + " Failed=" + str(fail_count))
log_lines.append("Completed: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))

with open(os.path.join(LOG_DIR, "day7_log.txt"), "w") as f:
    f.write("\n".join(log_lines) + "\n")

print("Done: Sent=" + str(sent_count) + " Failed=" + str(fail_count))
