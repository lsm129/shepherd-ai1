import csv

# Read the existing CSV
rows = []
with open('/root/shepherdai/cold-emails/day3_contacts.csv', 'r') as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    for row in reader:
        rows.append(row)

# Check which emails failed (quota)
failed_emails = {'centerbaptistomaha@gmail.com', 'dawsonumc@sbglobal.net', '4information@fbcnt.org'}

# Write updated CSV with date_sent column
fieldnames_new = fieldnames + ['date_sent'] if 'date_sent' not in fieldnames else fieldnames
with open('/root/shepherdai/cold-emails/day3_contacts.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames_new)
    writer.writeheader()
    for row in rows:
        email = row['email'].strip().lower()
        if email in {e.lower() for e in failed_emails}:
            row['date_sent'] = 'QUOTA_EXCEEDED'
        else:
            row['date_sent'] = '2026-06-07'
        writer.writerow(row)

print(f"Updated {len(rows)} rows")
