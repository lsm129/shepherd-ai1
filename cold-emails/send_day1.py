#!/usr/bin/env python3
"""ShepherdAI Cold Email Batch Sender - Day 1"""

import csv
import json
import subprocess
import time
import re
import os

CSV_PATH = "/root/shepherdai/cold-emails/day1_contacts.csv"
LOG_PATH = "/root/shepherdai/cold-emails/day1_log.txt"
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = "ShepherdAI <support@shepherdaitech.com>"
SKIP_EMAIL = "bris9850@yahoo.com"
SECONDS_BETWEEN_EMAILS = 20
SECONDS_BETWEEN_BATCHES = 90
BATCH_SIZE = 5

SUBJECT_EVEN = "Your sermon \u2192 30 days of content (plus a free year for 10 churches)"
SUBJECT_ODD = "Save 10+ hours/week on church admin (free for founding churches)"

def extract_first_name(pastor_name):
    if not pastor_name or pastor_name.strip() == "":
        return "Pastor"
    name = pastor_name.strip()
    titles = ["Pastor", "Apostle", "Prophet", "Bishop", "Elder",
              "Reverend", "Rev", "Rev.", "Dr", "Dr.", "Minister"]
    words = name.split()
    non_title_words = []
    for w in words:
        if w.rstrip(".") not in [t.rstrip(".") for t in titles]:
            non_title_words.append(w)
    if not non_title_words:
        return "Pastor"
    first = non_title_words[0]
    if len(first) <= 3 and "." in first:
        if len(non_title_words) > 1:
            first = non_title_words[1]
        else:
            return "Pastor"
    return first

def build_html(first_name, church_name):
    html = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;">

<tr><td style="background:linear-gradient(135deg,#1e3a5f,#2d6a9f);padding:30px 40px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">&#128017; ShepherdAI</h1>
<p style="margin:5px 0 0;color:#b8d4f0;font-size:14px;">AI-Powered Church Management</p>
</td></tr>

<tr><td style="padding:30px 40px 10px;">
<p style="margin:0;font-size:16px;color:#333333;">Hi ''' + first_name + ''',</p>
</td></tr>

<tr><td style="padding:10px 40px;">
<p style="margin:0;font-size:15px;color:#555555;line-height:1.6;">
I know your week: <strong>Sunday's sermon, Monday's newsletter, Tuesday's visitor follow-ups, Wednesday's social media...</strong> The admin never stops.
</p>
</td></tr>

<tr><td style="padding:15px 40px 5px;">
<p style="margin:0;font-size:16px;color:#1e3a5f;font-weight:600;">
What if AI could handle all of it &mdash; in your voice, in seconds?
</p>
</td></tr>

<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f7ff;border-radius:8px;border-left:4px solid #2d6a9f;">
<tr><td style="padding:20px;">
<p style="margin:0 0 5px;font-size:15px;color:#1e3a5f;font-weight:700;">ShepherdAI is the first AI-powered church management platform built specifically for ministry:</p>
<ul style="margin:10px 0 0;padding-left:20px;color:#444444;font-size:14px;line-height:2;">
<li>Auto-generate weekly newsletters from your sermon notes</li>
<li>Send personalized visitor follow-up emails automatically</li>
<li>Turn one sermon into 30 days of social media posts</li>
<li>Create daily devotionals with your tone and style</li>
<li>Manage prayer requests and pastoral care in one place</li>
</ul>
</td></tr>
</table>
</td></tr>

<tr><td style="padding:15px 40px 5px;">
<p style="margin:0;font-size:15px;color:#555555;line-height:1.6;">
Other church software charges <strong>$200&ndash;$500/month</strong> with <strong>NO AI</strong>. ShepherdAI starts at just <strong>$19/month</strong>.
</p>
</td></tr>

<tr><td style="padding:15px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:8px;border:2px solid #4caf50;">
<tr><td style="padding:20px;text-align:center;">
<p style="margin:0;font-size:17px;color:#2e7d32;font-weight:700;">
&#127873; The first 10 churches get our Growth Plan ($79/month) completely FREE for one full year.
</p>
</td></tr>
</table>
</td></tr>

<tr><td style="padding:20px 40px;text-align:center;">
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr><td style="background:linear-gradient(135deg,#2d6a9f,#1e3a5f);border-radius:6px;">
<a href="https://www.shepherdaitech.com/founding-church" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;">
Claim Your Free Year &rarr;
</a>
</td></tr>
</table>
</td></tr>

<tr><td style="padding:15px 40px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9f9;border-radius:8px;border:1px solid #e0e0e0;">
<tr><td style="padding:15px 20px;text-align:center;">
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#666666;">&#128274; Your Data Is Safe With Us</p>
<p style="margin:0;font-size:12px;color:#888888;line-height:1.8;">
256-bit SSL encryption &mdash; the same standard banks use<br>
GDPR compliant &mdash; your data stays yours, always<br>
No credit card needed to sign up &mdash; zero risk<br>
We never sell, share, or misuse your information<br>
HTTPS secured and Google-verified website
</p>
</td></tr>
</table>
</td></tr>

<tr><td style="padding:0 40px 30px;">
<p style="margin:0;font-size:15px;color:#333333;">Blessings,</p>
<p style="margin:5px 0 0;font-size:15px;color:#1e3a5f;font-weight:600;">ShepherdAI Team</p>
<p style="margin:3px 0 0;"><a href="https://www.shepherdaitech.com" style="color:#2d6a9f;font-size:13px;text-decoration:none;">www.shepherdaitech.com</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>'''
    return html

def send_email(to_email, subject, html_body):
    payload = {
        "from": FROM_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }
    tmp_file = "/tmp/shepherdai_email_payload.json"
    with open(tmp_file, "w") as f:
        json.dump(payload, f, ensure_ascii=False)
    cmd = [
        "curl", "-s", "-X", "POST",
        "https://api.resend.com/emails",
        "-H", "Authorization: Bearer " + RESEND_API_KEY,
        "-H", "Content-Type: application/json",
        "-d", "@" + tmp_file
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        response = result.stdout
        if result.returncode == 0 and '"id"' in response:
            return True, response
        else:
            try:
                error_data = json.loads(response)
                error_msg = error_data.get("message", response[:200])
            except:
                error_msg = response[:200] if response else "Unknown error"
            return False, error_msg
    except subprocess.TimeoutExpired:
        return False, "Request timed out"
    except Exception as e:
        return False, str(e)

def is_valid_email(email):
    if not email or "@" not in email:
        return False
    parts = email.split("@")
    if len(parts) != 2:
        return False
    domain = parts[1]
    if "." not in domain:
        return False
    return True

def main():
    contacts = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            contacts.append(row)
    
    print("Total contacts in CSV:", len(contacts))
    
    with open(LOG_PATH, "w") as f:
        f.write("ShepherdAI Cold Email Log - Day 1\n")
        f.write("Started: " + time.strftime('%Y-%m-%d %H:%M:%S') + "\n")
        f.write("Total contacts: " + str(len(contacts)) + "\n")
        f.write("=" * 60 + "\n\n")
    
    sent_count = 0
    fail_count = 0
    skip_count = 0
    batch_counter = 0
    
    for idx, contact in enumerate(contacts):
        row_num = idx + 1
        email = contact["email"].strip()
        church = contact["church_name"].strip()
        pastor_name = contact.get("pastor_name", "").strip()
        
        if email.lower() == SKIP_EMAIL.lower():
            print("[Row " + str(row_num) + "] SKIP (already sent): " + email)
            skip_count += 1
            with open(LOG_PATH, "a") as f:
                f.write("Skipped (already sent): " + email + " (" + church + ")\n")
            continue
        
        if not is_valid_email(email):
            print("[Row " + str(row_num) + "] SKIP (invalid email): " + email)
            fail_count += 1
            with open(LOG_PATH, "a") as f:
                f.write("Failed: " + email + " (" + church + ") - Invalid email format\n")
            continue
        
        first_name = extract_first_name(pastor_name)
        
        if row_num % 2 == 0:
            subject = SUBJECT_EVEN
        else:
            subject = SUBJECT_ODD
        
        html = build_html(first_name, church)
        
        print("[Row " + str(row_num) + "] Sending to " + email + " (" + church + ") - Hi " + first_name)
        success, response = send_email(email, subject, html)
        
        if success:
            sent_count += 1
            print("  Sent successfully")
            with open(LOG_PATH, "a") as f:
                f.write("Sent to " + email + " (" + church + ")\n")
        else:
            fail_count += 1
            print("  Failed: " + str(response))
            with open(LOG_PATH, "a") as f:
                f.write("Failed: " + email + " (" + church + ") - " + str(response) + "\n")
        
        batch_counter += 1
        
        # Check if more valid emails remain
        has_more_valid = False
        for future_contact in contacts[idx+1:]:
            future_email = future_contact["email"].strip()
            if future_email.lower() != SKIP_EMAIL.lower() and is_valid_email(future_email):
                has_more_valid = True
                break
        
        if not has_more_valid:
            break
        
        if batch_counter >= BATCH_SIZE:
            print("\n--- Batch of " + str(BATCH_SIZE) + " complete. Resting " + str(SECONDS_BETWEEN_BATCHES) + "s... ---\n")
            time.sleep(SECONDS_BETWEEN_BATCHES)
            batch_counter = 0
        else:
            print("  Waiting " + str(SECONDS_BETWEEN_EMAILS) + "s...\n")
            time.sleep(SECONDS_BETWEEN_EMAILS)
    
    summary = "\n" + "=" * 60 + "\nSUMMARY\n" + "=" * 60 + "\n"
    summary += "Sent:   " + str(sent_count) + "\n"
    summary += "Failed: " + str(fail_count) + "\n"
    summary += "Skipped: " + str(skip_count) + " (already sent)\n"
    summary += "Total in CSV: " + str(len(contacts)) + "\n"
    summary += "Attempted: " + str(sent_count + fail_count) + "\n"
    summary += "Completed: " + time.strftime('%Y-%m-%d %H:%M:%S') + "\n"
    
    print(summary)
    with open(LOG_PATH, "a") as f:
        f.write(summary)

if __name__ == "__main__":
    main()
