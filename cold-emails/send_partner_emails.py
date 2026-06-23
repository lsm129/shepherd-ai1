#!/usr/bin/env python3
"""Send partner cold emails via Resend API"""
import json, time, re, requests

RESEND_API = os.environ.get("RESEND_API_KEY", "")
FROM = "ShepherdAI Partners <hello@shepherdaitech.com>"

# Template files
TEMPLATES = {
    "AV": "/root/shepherdai/cold-emails/partner_email_av.html",
    "Consulting": "/root/shepherdai/cold-emails/partner_email_consulting.html",
    "Convention": "/root/shepherdai/cold-emails/partner_email_convention.html",
}

# Contact list: email|first_name|company|state|type|church_count
CONTACTS = [
    # AV suppliers
    ("steven@protechserv.com", "Steven", "Pro-Tech Services", "FL", "AV", ""),
    ("dwood@ciavl.com", "Doug", "CIAVL", "NC", "AV", ""),
    ("info@avlx.com", "Chris", "AVLX", "TN", "AV", ""),
    # Consulting firms
    ("ajmathieu@malphursgroup.com", "A.J.", "The Malphurs Group", "TX", "Consulting", ""),
    ("help@theunstuckgroup.com", "Tony", "The Unstuck Group", "GA", "Consulting", ""),
    ("nickhonerkamp@kingdomconsultingteam.org", "Nick", "Kingdom Consulting Team", "NC", "Consulting", ""),
    ("info@edgechurchconsulting.com", "Mark", "Edge Church Consulting", "TX", "Consulting", ""),
    ("info@impactstewardship.com", "Team", "Impact Stewardship", "TN", "Consulting", ""),
    ("theconsultants@tccg.business", "Team", "TCCG", "FL", "Consulting", ""),
    # Convention leaders
    ("tgobebo.rep@gabaptist.org", "Tom", "Georgia Baptist", "GA", "Convention", "3500"),
    ("mmarshall@gabaptist.org", "Mark", "Georgia Baptist", "GA", "Convention", "3500"),
    ("pdunn@gabaptist.org", "PJ", "Georgia Baptist", "GA", "Convention", "3500"),
    ("asantos@ncbaptist.org", "Antonio", "NC Baptist", "NC", "Convention", "2900"),
    ("dcrouch@tnbaptist.org", "Daryl", "Tennessee Baptist", "TN", "Convention", "2800"),
    ("sholt@tnbaptist.org", "Steve", "Tennessee Baptist", "TN", "Convention", "2800"),
    ("sparker@mbcb.org", "Shawn", "Mississippi Baptist", "MS", "Convention", "2082"),
    ("cmccord@mbcb.org", "Chad", "Mississippi Baptist", "MS", "Convention", "2082"),
    ("sjackson@mbcb.org", "Steve", "Mississippi Baptist", "MS", "Convention", "2082"),
    ("clarmoyeux@absc.org", "Chris", "Arkansas Baptist", "AR", "Convention", "1500"),
    ("mbrown@absc.org", "Marcus", "Arkansas Baptist", "AR", "Convention", "1500"),
    ("Revitalize@absc.org", "Team", "Arkansas Baptist", "AR", "Convention", "1500"),
    ("info@flbaptist.org", "Team", "Florida Baptist", "FL", "Convention", "2100"),
]

sent = 0
failed = 0

for email, first_name, company, state, ptype, church_count in CONTACTS:
    # Load template
    with open(TEMPLATES[ptype], 'r') as f:
        body = f.read()
    
    # Replace placeholders
    body = body.replace("{FIRST_NAME}", first_name)
    body = body.replace("{COMPANY}", company)
    body = body.replace("{STATE}", state)
    body = body.replace("{CONVENTION}", company)
    body = body.replace("{CHURCH_COUNT}", church_count)
    
    # Subject line
    if ptype == "Convention":
        subject = f"ShepherdAI Partnership - Supporting {church_count}+ Churches in {state}"
    elif ptype == "AV":
        subject = f"ShepherdAI Partner Program - Revenue Opportunity for {company}"
    else:
        subject = f"ShepherdAI Partner Program - Add Value to Your Church Consulting"
    
    # Send via Resend
    payload = {
        "from": FROM,
        "to": [email],
        "subject": subject,
        "html": body,
    }
    
    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=30,
        )
        data = resp.json()
        if "id" in data:
            print(f"✅ {email} ({ptype}) - sent")
            sent += 1
        else:
            print(f"❌ {email} ({ptype}) - failed: {data}")
            failed += 1
    except Exception as e:
        print(f"❌ {email} ({ptype}) - error: {e}")
        failed += 1
    
    # Rate limit: 2s between emails
    time.sleep(2)

print(f"\n===== 完成 =====")
print(f"成功: {sent}")
print(f"失败: {failed}")
