import subprocess
import json
import time
from datetime import datetime

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM = "ShepherdAI <support@shepherdaitech.com>"

# Today's contacts - Day 7 (2026-06-10)
contacts = [
    {
        "email": "hello@summitintegrated.com",
        "first_name": "there",  # No specific name found, generic
        "company": "Summit Integrated",
        "state": "CO",
        "type": "av",
        "subject": "Partnership: ShepherdAI for your church AV clients",
        "notes": "Church-only AVL integrator, Colorado-based, nationwide"
    },
    {
        "email": "info@worshipres.com",
        "first_name": "there",
        "company": "Worship Resources",
        "state": "OH",
        "type": "av",
        "subject": "Partner with ShepherdAI — church management for your AV clients",
        "notes": "Cincinnati/Dayton church sound & lighting specialist"
    },
    {
        "email": "gregg@convergenceus.org",
        "first_name": "Gregg",
        "company": "Convergence",
        "state": "National",
        "type": "consulting",
        "subject": "ShepherdAI + Convergence — help churches after consulting ends",
        "notes": "Director of Coaching & Contracted Services, denominational consulting"
    },
    {
        "email": "wfowler@mobaptist.org",
        "first_name": "Wes",
        "company": "Missouri Baptist Convention",
        "state": "MO",
        "type": "convention",
        "subject": "ShepherdAI partnership for Missouri Baptist churches",
        "notes": "Executive Director, ~1800 churches"
    },
    {
        "email": "nclark@scbi.org",
        "first_name": "Nick",
        "company": "State Convention of Baptists in Indiana",
        "state": "IN",
        "type": "convention",
        "subject": "Partnership: ShepherdAI for Indiana Baptist churches",
        "notes": "Executive Director, ~1000 churches"
    }
]

def load_template(template_type):
    template_file = f"/root/shepherdai/cold-emails/partner_email_{template_type}.html"
    with open(template_file, 'r') as f:
        return f.read()

def fill_template(template, contact):
    html = template
    html = html.replace("{FIRST_NAME}", contact["first_name"])
    html = html.replace("{COMPANY}", contact["company"])
    html = html.replace("{STATE}", contact["state"])
    # Convention-specific replacements
    if contact["type"] == "convention":
        html = html.replace("{CONVENTION}", contact["company"])
        # Estimate church count based on state
        church_counts = {
            "MO": "1800",
            "IN": "1000"
        }
        html = html.replace("{CHURCH_COUNT}", church_counts.get(contact["state"], "1000"))
    return html

def send_email(to_email, subject, html_body):
    payload = {
        "from": FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }
    
    cmd = [
        "curl", "-s", "-X", "POST",
        "https://api.resend.com/emails",
        "-H", f"Authorization: Bearer {RESEND_API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", json.dumps(payload)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return result.stdout

# Main execution
log_lines = []
log_lines.append(f"Partner Cold Email - Day 7 (2026-06-10)")
log_lines.append("=" * 60)

sent = 0
failed = 0

for i, contact in enumerate(contacts):
    template = load_template(contact["type"])
    html_body = fill_template(template, contact)
    
    print(f"[{i+1}/{len(contacts)}] Sending to {contact['email']} ({contact['type']})...")
    
    result = send_email(contact["email"], contact["subject"], html_body)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    if '"id"' in result:
        status = "✅ SENT"
        sent += 1
        print(f"  ✅ Success: {contact['email']}")
    else:
        status = "❌ FAILED"
        failed += 1
        print(f"  ❌ Failed: {contact['email']} - {result[:200]}")
    
    log_lines.append(f"[{timestamp}] {status} to {contact['email']} | {contact['company']} | {contact['type']} | {contact['state']}")
    
    # Wait 60 seconds between emails (1 minute interval as required)
    if i < len(contacts) - 1:
        print(f"  Waiting 60 seconds before next email...")
        time.sleep(60)

log_lines.append("=" * 60)
log_lines.append(f"Total: {len(contacts)} | Sent: {sent} | Failed: {failed}")

# Write log
log_content = "\n".join(log_lines)
with open("/root/shepherdai/cold-emails/partner_day7_log.txt", "w") as f:
    f.write(log_content + "\n")

print(f"\n{'='*60}")
print(f"Day 7 Complete: {sent} sent, {failed} failed out of {len(contacts)}")
print(f"Log saved to partner_day7_log.txt")
