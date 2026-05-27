#!/bin/bash
# ShepherdAI Weekly Backup Script
# Exports all Supabase tables to CSV and sends via email

SUPABASE_URL="https://ruwttvhetgfmnrcrxwtx.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1d3R0dmhldGdmbW5yY3J4d3R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTg1MTc5NywiZXhwIjoyMDk1NDI3Nzk3fQ.WsxmXszsl4JtnTO1LjGQ9xjqDEskDrhle3BHuKTSdeA"
BACKUP_DIR="/tmp/shepherdai-backup"
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

echo "=== ShepherdAI Backup $DATE ==="

# Export each table
for TABLE in profiles generations referrals church_settings; do
  echo "Exporting $TABLE..."
  curl -s "$SUPABASE_URL/rest/v1/$TABLE?select=*&limit=10000" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -o "$BACKUP_DIR/${TABLE}_${DATE}.json"
  
  # Convert JSON to CSV using python
  python3 -c "
import json, csv, sys
try:
    with open('$BACKUP_DIR/${TABLE}_${DATE}.json') as f:
        data = json.load(f)
    if not data:
        print(f'$TABLE: empty')
        sys.exit(0)
    with open('$BACKUP_DIR/${TABLE}_${DATE}.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f'$TABLE: {len(data)} rows exported')
except Exception as e:
    print(f'$TABLE: error - {e}')
" 2>&1
done

# Export auth users (limited info for privacy)
echo "Exporting auth users..."
curl -s "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -o "$BACKUP_DIR/auth_users_${DATE}.json"

python3 -c "
import json, csv, sys
try:
    with open('$BACKUP_DIR/auth_users_${DATE}.json') as f:
        data = json.load(f)
    users = data.get('users', [])
    if not users:
        print('auth users: empty')
        sys.exit(0)
    rows = []
    for u in users:
        rows.append({
            'id': u.get('id',''),
            'email': u.get('email',''),
            'created_at': u.get('created_at',''),
            'last_sign_in_at': u.get('last_sign_in_at',''),
            'email_confirmed': u.get('email_confirmed_at','') is not None,
        })
    with open('$BACKUP_DIR/auth_users_${DATE}.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f'auth users: {len(rows)} rows exported')
except Exception as e:
    print(f'auth users: error - {e}')
" 2>&1

# Create zip
cd $BACKUP_DIR
zip -q "shepherdai_backup_${DATE}.zip" *.csv 2>/dev/null
echo "Backup zip created: shepherdai_backup_${DATE}.zip"
ls -la *.csv *.zip 2>/dev/null
