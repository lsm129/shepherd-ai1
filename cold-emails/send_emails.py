import csv
import json
import subprocess
import time
import sys

# Read template
with open('/tmp/cold_email_template.txt', 'r') as f:
    template_a = f.read()
with open('/tmp/cold_email_template_2.txt', 'r') as f:
    template_b = f.read()

# Read contacts
contacts = []
with open('/root/shepherdai/cold-emails/day1_contacts.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        contacts.append(row)

print(f"Loaded {len(contacts)} contacts")

sent = 0
failed = 0
log_lines = []

for i, contact in enumerate(contacts):
    name = contact['pastor_name'] if contact['pastor_name'] else 'Pastor'
    # Extract first name for personalization
    first_name = name.split()[-1] if name != 'Pastor' else 'Pastor'
    
    # Alternate between templates
    if i % 2 == 0:
        template = template_a
        subject = "Your sermon → 30 days of content (plus a free year for 10 churches)"
    else:
        template = template_b
        subject = "Save 10+ hours/week on church admin (free for founding churches)"
    
    # Replace {name} in template
    body = template.replace('{name}', first_name)
    
    # Convert plain text to HTML with proper formatting
    html_body = body.replace('\n', '<br/>\n')
    # Make URLs clickable
    html_body = html_body.replace('https://www.shepherdaitech.com/founding-church', '<a href="https://www.shepherdaitech.com/founding-church">https://www.shepherdaitech.com/founding-church</a>')
    html_body = html_body.replace('https://www.shepherdaitech.com', '<a href="https://www.shepherdaitech.com">https://www.shepherdaitech.com</a>')
    
    # Build email payload
    payload = {
        "from": "ShepherdAI <support@shepherdaitech.com>",
        "to": [contact['email']],
        "subject": subject,
        "html": html_body
    }
    
    # Send via Resend API
    try:
        result = subprocess.run(
            ['curl', '-s', '-X', 'POST', 'https://api.resend.com/emails',
             '-H', 'Authorization: Bearer " + os.environ.get("RESEND_API_KEY", "") + "',
             '-H', 'Content-Type: application/json',
             '-d', json.dumps(payload)],
            capture_output=True, text=True, timeout=30
        )
        response = result.stdout
        if '"id"' in response:
            sent += 1
            log_line = f"✅ Sent to {contact['email']} ({contact['church_name']}) - {subject[:50]}..."
            print(log_line)
            log_lines.append(log_line)
        else:
            failed += 1
            log_line = f"❌ Failed: {contact['email']} - {response[:200]}"
            print(log_line)
            log_lines.append(log_line)
    except Exception as e:
        failed += 1
        log_line = f"❌ Error: {contact['email']} - {str(e)[:100]}"
        print(log_line)
        log_lines.append(log_line)
    
    # Rate limiting: wait between emails
    if (i + 1) % 5 == 0:
        print(f"--- Batch {(i+1)//5} done. Waiting 90 seconds... ---")
        time.sleep(90)
    else:
        time.sleep(15)

# Save log
with open('/root/shepherdai/cold-emails/day1_log.txt', 'w') as f:
    f.write(f"Day 1 Cold Email Report\n")
    f.write(f"Total contacts: {len(contacts)}\n")
    f.write(f"Sent: {sent}\n")
    f.write(f"Failed: {failed}\n\n")
    for line in log_lines:
        f.write(line + '\n')

print(f"\n===== DAY 1 COMPLETE =====")
print(f"Sent: {sent} | Failed: {failed} | Total: {len(contacts)}")
