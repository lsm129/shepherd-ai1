import requests
import time
import json
from datetime import datetime

API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM = "ShepherdAI <support@shepherdaitech.com>"
BASE = "/root/shepherdai/cold-emails"

# New contacts for Day 6 - rotating to KY, SC, AL
contacts = [
    # Convention contacts
    {
        "email": "steve.rice@kybaptist.org",
        "first_name": "Steve",
        "company": "Kentucky Baptist Convention",
        "type": "convention",
        "state": "KY",
        "convention": "Kentucky Baptist Convention",
        "church_count": "2400",
        "title": "Team Leader Church Consulting & Revitalization",
    },
    {
        "email": "briansaxon@scbaptist.org",
        "first_name": "Brian",
        "company": "South Carolina Baptist Convention",
        "type": "convention",
        "state": "SC",
        "convention": "South Carolina Baptist Convention",
        "church_count": "2200",
        "title": "Team Leader - Shepherd Team",
    },
    {
        "email": "rbarnhart@alsbom.org",
        "first_name": "Rick",
        "company": "Alabama Baptist Convention",
        "type": "convention",
        "state": "AL",
        "convention": "Alabama Baptist Convention",
        "church_count": "3200",
        "title": "Director Associational Missions & Church Planting",
    },
    # Consulting contacts
    {
        "email": "markt@pinnlead.com",
        "first_name": "Mark",
        "company": "Pinnacle Leadership Associates",
        "type": "consulting",
        "state": "SC",
        "title": "Mark Tidsworth Founder",
    },
    {
        "email": "info@chrchlth.com",
        "first_name": "Church Health",
        "company": "Church Health Ministries",
        "type": "consulting",
        "state": "TX",
        "title": "Crisis Church Consulting 501c3",
    },
]

subjects = {
    "av": "Partnership Opportunity: ShepherdAI × {COMPANY} — Referral Revenue for Your AV Clients",
    "consulting": "Partnership Opportunity: ShepherdAI × {COMPANY} — Add Recurring Revenue to Your Consulting",
    "convention": "Partnership Opportunity: ShepherdAI × {CONVENTION} — Supporting {CHURCH_COUNT}+ Churches Across {STATE}",
}

def load_template(template_type):
    files = {
        "av": f"{BASE}/partner_email_av.html",
        "consulting": f"{BASE}/partner_email_consulting.html",
        "convention": f"{BASE}/partner_email_convention.html",
    }
    with open(files[template_type], "r") as f:
        return f.read()

def replace_placeholders(html, contact):
    html = html.replace("{FIRST_NAME}", contact["first_name"])
    html = html.replace("{COMPANY}", contact["company"])
    html = html.replace("{STATE}", contact["state"])
    html = html.replace("{CONVENTION}", contact.get("convention", contact["company"]))
    html = html.replace("{CHURCH_COUNT}", contact.get("church_count", ""))
    return html

def send_email(to_email, subject, html_body):
    payload = {
        "from": FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_body,
    }
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    resp = requests.post("https://api.resend.com/emails", json=payload, headers=headers)
    return resp.status_code, resp.text

log_lines = []
success_count = 0
fail_count = 0

for i, contact in enumerate(contacts):
    t = contact["type"]
    template = load_template(t)
    html = replace_placeholders(template, contact)
    
    subject = subjects[t].replace("{COMPANY}", contact["company"]) \
                         .replace("{CONVENTION}", contact.get("convention", contact["company"])) \
                         .replace("{CHURCH_COUNT}", contact.get("church_count", "")) \
                         .replace("{STATE}", contact["state"])
    
    status, body = send_email(contact["email"], subject, html)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if status == 200:
        success_count += 1
        log_lines.append(f"[{timestamp}] ✅ SENT to {contact['email']} | {contact['company']} | {t} | {contact['state']}")
    else:
        fail_count += 1
        log_lines.append(f"[{timestamp}] ❌ FAILED ({status}) to {contact['email']} | {contact['company']} | {t} | {body[:100]}")
    
    # Interval between emails (1 min)
    if i < len(contacts) - 1:
        print(f"Waiting 60s before next email...")
        time.sleep(60)

# Write log
log_content = f"Partner Cold Email - Day 6 ({datetime.now().strftime('%Y-%m-%d')})\n{'='*60}\n"
log_content += f"Total: {len(contacts)} | Sent: {success_count} | Failed: {fail_count}\n{'='*60}\n\n"
log_content += "\n".join(log_lines)

with open(f"{BASE}/partner_day6_log.txt", "w") as f:
    f.write(log_content)

# Append to partner_contacts.txt
new_contacts_lines = [
    f"\n# Day 6 - {datetime.now().strftime('%Y-%m-%d')}",
]
for c in contacts:
    line = f"{c['email']}|{c['company']}|{c['type'].capitalize()}|{c['state']}|{c['title']}"
    new_contacts_lines.append(line)

with open(f"{BASE}/partner_contacts.txt", "a") as f:
    f.write("\n".join(new_contacts_lines))

print(log_content)
