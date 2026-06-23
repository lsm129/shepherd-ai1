import json
import subprocess
import time
from datetime import datetime

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = "ShepherdAI <support@shepherdaitech.com>"

# Template paths
AV_TEMPLATE = "/root/shepherdai/cold-emails/partner_email_av.html"
CONSULTING_TEMPLATE = "/root/shepherdai/cold-emails/partner_email_consulting.html"
CONVENTION_TEMPLATE = "/root/shepherdai/cold-emails/partner_email_convention.html"

# VS table
VS_TABLE = "/root/shepherdai/cold-emails/vs_table.html"

def load_template(path):
    with open(path, 'r') as f:
        return f.read()

def send_email(to_email, subject, html_body):
    payload = {
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }
    cmd = [
        'curl', '-s', '-X', 'POST',
        'https://api.resend.com/emails',
        '-H', f'Authorization: Bearer {RESEND_API_KEY}',
        '-H', 'Content-Type: application/json',
        '-d', json.dumps(payload)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return result.stdout, result.returncode

# Day 9 contacts
contacts = [
    {
        "email": "info@audiovideoelectronics.com",
        "company": "Audio Video Electronics (AVE)",
        "type": "av",
        "first_name": "Team",
        "state": "MN",
        "note": "750+ projects, church AV specialist since 1999, Minneapolis"
    },
    {
        "email": "jason@productionstudio29.com",
        "company": "Production Studio 29",
        "type": "av",
        "first_name": "Jason",
        "state": "WI",
        "note": "Church AVL integration, Madison WI, 15+ years"
    },
    {
        "email": "lancec@nwbaptist.org",
        "company": "Northwest Baptist Convention",
        "type": "convention",
        "first_name": "Lance",
        "state": "WA",
        "convention_name": "Northwest Baptist Convention",
        "church_count": "400",
        "note": "Lance Caddel, Executive Director, serves WA & OR"
    },
    {
        "email": "office@azmn.org",
        "company": "Arizona Mission Network",
        "type": "convention",
        "first_name": "Monty",
        "state": "AZ",
        "convention_name": "Arizona Mission Network",
        "church_count": "400",
        "note": "Monty Patton, Executive Director, ~400+ churches"
    },
    {
        "email": "info@bcnm.org",
        "company": "Baptist Convention of New Mexico",
        "type": "convention",
        "first_name": "Steve",
        "state": "NM",
        "convention_name": "Baptist Convention of New Mexico",
        "church_count": "300",
        "note": "Steve Ballew, Executive Director, ~300+ churches"
    },
]

# Load templates
av_tpl = load_template(AV_TEMPLATE)
consulting_tpl = load_template(CONSULTING_TEMPLATE)
convention_tpl = load_template(CONVENTION_TEMPLATE)

log_lines = []
log_lines.append(f"Partner Cold Email - Day 9 (2026-06-14)")
log_lines.append("=" * 60)

sent = 0
failed = 0

for i, c in enumerate(contacts):
    email = c["email"]
    ctype = c["type"]
    
    if ctype == "av":
        html = av_tpl.replace("{FIRST_NAME}", c["first_name"]) \
                     .replace("{COMPANY}", c["company"]) \
                     .replace("{STATE}", c["state"])
        subject = f"Partnership opportunity for {c['company']} — earn recurring revenue with ShepherdAI"
    elif ctype == "consulting":
        html = consulting_tpl.replace("{FIRST_NAME}", c["first_name"]) \
                             .replace("{COMPANY}", c["company"]) \
                             .replace("{STATE}", c["state"])
        subject = f"ShepherdAI + {c['company']} — a natural partnership for church consulting"
    elif ctype == "convention":
        html = convention_tpl.replace("{FIRST_NAME}", c["first_name"]) \
                             .replace("{CONVENTION}", c.get("convention_name", c["company"])) \
                             .replace("{CHURCH_COUNT}", c.get("church_count", "300")) \
                             .replace("{STATE}", c["state"])
        subject = f"Supporting {c.get('church_count','300')}+ churches in {c['state']} — ShepherdAI partnership"
    
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] Sending to {email} ({ctype})...")
    
    stdout, rc = send_email(email, subject, html)
    print(f"  Response: {stdout[:200]}")
    
    if rc == 0 and '"id"' in stdout:
        log_lines.append(f"[{ts}] ✅ SENT to {email} | {c['company']} | {ctype} | {c['state']}")
        sent += 1
    else:
        log_lines.append(f"[{ts}] ❌ FAILED to {email} | {c['company']} | {ctype} | {c['state']} | {stdout[:100]}")
        failed += 1
    
    # Wait 60 seconds between sends (except last)
    if i < len(contacts) - 1:
        print("  Waiting 60 seconds...")
        time.sleep(60)

log_lines.append("=" * 60)
log_lines.append(f"Total: {len(contacts)} | Sent: {sent} | Failed: {failed}")

# Write log
log_path = "/root/shepherdai/cold-emails/partner_day9_log.txt"
with open(log_path, 'w') as f:
    f.write('\n'.join(log_lines))

print(f"\nDone! Log saved to {log_path}")
print(f"Sent: {sent}, Failed: {failed}")
