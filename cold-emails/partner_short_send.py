#!/usr/bin/env python3
"""New short partner cold email sender - focuses on annual earnings."""
import subprocess, json, time, os, sys
from datetime import datetime

SENDER = "ShepherdAI Partners <support@shepherdaitech.com>"
API = "https://api.resend.com/emails"
KEY = os.environ.get("RESEND_API_KEY", "")
LOG_DIR = "/root/shepherdai/cold-emails"

SUBJECTS = {
    "av": "Earn $2,800-5,600/year recommending church management tools",
    "consulting": "Your church clients could earn you $2,800+/year",
    "convention": "Earn $2,800-5,600/year connecting your churches with admin tools",
}

def load_template(ttype):
    path = f"{LOG_DIR}/partner_short_{ttype}.html"
    with open(path) as f:
        return f.read()

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

# Load already-sent partner emails
sent_emails = set()
for lf in os.listdir(LOG_DIR):
    if 'partner' in lf and lf.endswith('_log.txt'):
        try:
            with open(f"{LOG_DIR}/{lf}") as f:
                for line in f:
                    if '@' in line and ('OK' in line or 'Sent' in line or '✅' in line):
                        parts = line.strip().split()
                        for p in parts:
                            if '@' in p:
                                e = p.strip('(),').lower()
                                sent_emails.add(e)
        except:
            pass

# Also check partner_contacts.txt for already sent
if os.path.exists(f"{LOG_DIR}/partner_short_sent.txt"):
    with open(f"{LOG_DIR}/partner_short_sent.txt") as f:
        for line in f:
            if '@' in line:
                sent_emails.add(line.strip().split()[-1].lower())

# New partner contacts to reach (search results will be added by cron)
# For now, search for new partners
log_lines = [f"\n[{datetime.now():%Y-%m-%d %H:%M}] === Partner short template send ==="]
sent_count = fail_count = 0

# Read any pending partner contacts
contacts = []
if os.path.exists(f"{LOG_DIR}/partner_pending.txt"):
    with open(f"{LOG_DIR}/partner_pending.txt") as f:
        for line in f:
            line = line.strip()
            if '|' in line:
                parts = line.split('|')
                if len(parts) >= 3:
                    contacts.append({
                        'email': parts[0].strip().lower(),
                        'type': parts[1].strip(),
                        'name': parts[2].strip()
                    })

for c in contacts:
    email = c['email']
    if email in sent_emails:
        continue
    
    ttype = c.get('type', 'convention')
    name = c.get('name', 'there')
    
    template = load_template(ttype).replace('{name}', name)
    subj = SUBJECTS.get(ttype, SUBJECTS['convention'])
    
    ok, msg = send_email(email, subj, template)
    if ok:
        sent_count += 1
        log_lines.append(f"  OK: {email} ({ttype})")
        # Record as sent
        with open(f"{LOG_DIR}/partner_short_sent.txt", "a") as f:
            f.write(f"{datetime.now():%Y-%m-%d} {email}\n")
    else:
        fail_count += 1
        log_lines.append(f"  FAIL: {email} ({ttype}) - {msg}")
    
    time.sleep(10)

if not contacts:
    log_lines.append("  No pending contacts. Need to search first.")

log_lines.append(f"SUMMARY: Sent={sent_count} Failed={fail_count}")
with open(f"{LOG_DIR}/partner_short_log.txt", "a") as f:
    f.write("\n".join(log_lines) + "\n")

print(f"Sent: {sent_count}, Failed: {fail_count}")
