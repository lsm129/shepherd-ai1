#!/usr/bin/env python3
import csv, json, subprocess, time, sys
from datetime import datetime

API_KEY = os.environ.get("RESEND_API_KEY", "")
FROM = "ShepherdAI <support@shepherdaitech.com>"
CSV_PATH = "/root/shepherdai/cold-emails/day3_contacts.csv"
LOG_PATH = "/root/shepherdai/cold-emails/day3_log.txt"

SUBJECT_A = "Your sermon → 30 days of content (plus a free year for 10 churches)"
SUBJECT_B = "Save 10+ hours/week on church admin (free for founding churches)"

HTML_A = '''<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;"><div style="background:linear-gradient(135deg,#8B1538,#D4A84B);padding:30px;border-radius:10px 10px 0 0;text-align:center;"><h1 style="color:white;margin:0;font-size:24px;">⛪ ShepherdAI</h1><p style="color:#f0e6d2;margin:5px 0 0 0;font-size:14px;">AI-Powered Church Management</p></div><div style="padding:30px;background:#fff;border:1px solid #e0e0e0;"><p style="font-size:16px;">Hi {name},</p><p style="font-size:15px;">What if <strong>one sermon</strong> could feed your congregation for 30 days?</p><p style="font-size:15px;">With ShepherdAI, your sermon becomes:</p><ul style="font-size:15px;"><li>📝 <strong>Daily devotionals</strong> for your members</li><li>🙏 <strong>Prayer guides</strong> based on your teaching</li><li>📱 <strong>Social media posts</strong> — ready to share</li><li>📧 <strong>Newsletter content</strong> — written in your voice</li></ul><p style="font-size:15px;">Pastors using ShepherdAI save <strong>10+ hours per week</strong> on admin and content — and get that time back for ministry.</p><div style="background:#FFF8E1;border-left:4px solid #D4A84B;padding:15px;margin:20px 0;"><p style="margin:0;font-size:16px;"><strong>🎉 FREE for 1 Year — Only 10 spots!</strong></p><p style="margin:5px 0 0 0;font-size:14px;">As a Founding Church, you get full Pro access ($39/month value) at zero cost. No credit card needed.</p></div><div style="text-align:center;margin:25px 0;"><a href="https://www.shepherdaitech.com/founding-church" style="background:linear-gradient(135deg,#8B1538,#D4A84B);color:white;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">Claim Your Free Year →</a></div><p style="font-size:13px;color:#888;text-align:center;margin-top:20px;">🔒 256-bit encrypted | GDPR compliant | No credit card needed</p></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;border-radius:0 0 10px 10px;"><p style="margin:0;">ShepherdAI · <a href="https://www.shepherdaitech.com" style="color:#8B1538;">shepherdaitech.com</a></p><p style="margin:5px 0 0 0;">You're receiving this because we work with small churches. <a href="mailto:support@shepherdaitech.com?subject=Unsubscribe" style="color:#888;">Unsubscribe</a></p></div></body></html>'''

HTML_B = '''<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;"><div style="background:linear-gradient(135deg,#8B1538,#D4A84B);padding:30px;border-radius:10px 10px 0 0;text-align:center;"><h1 style="color:white;margin:0;font-size:24px;">⛪ ShepherdAI</h1><p style="color:#f0e6d2;margin:5px 0 0 0;font-size:14px;">AI-Powered Church Management</p></div><div style="padding:30px;background:#fff;border:1px solid #e0e0e0;"><p style="font-size:16px;">Hi {name},</p><p style="font-size:15px;">How much of your week disappears into admin tasks?</p><p style="font-size:15px;">Visitor follow-ups. Event planning. Member tracking. Newsletter writing. Prayer list updates...</p><p style="font-size:15px;"><strong>ShepherdAI handles all of it — automatically.</strong></p><ul style="font-size:15px;"><li>✅ <strong>Visitor follow-up</strong> — automated emails that feel personal</li><li>✅ <strong>Member directory</strong> — always up to date</li><li>✅ <strong>Sermon → content</strong> — devos, prayers, social posts from your message</li><li>✅ <strong>Prayer wall</strong> — your congregation stays connected</li><li>✅ <strong>Ministry health check</strong> — 6-dimension diagnostic, free</li></ul><div style="background:#FFF8E1;border-left:4px solid #D4A84B;padding:15px;margin:20px 0;"><p style="margin:0;font-size:16px;"><strong>🎉 Founding Church Program — FREE 1 Year!</strong></p><p style="margin:5px 0 0 0;font-size:14px;">We're looking for 10 small churches to be our founding partners. Full Pro access at no cost. No credit card required.</p></div><div style="text-align:center;margin:25px 0;"><a href="https://www.shepherdaitech.com/founding-church" style="background:linear-gradient(135deg,#8B1538,#D4A84B);color:white;padding:14px 30px;text-decoration:none;border-radius:6px;font-size:16px;font-weight:bold;display:inline-block;">Get Free Pro Access →</a></div><p style="font-size:13px;color:#888;text-align:center;margin-top:20px;">🔒 256-bit encrypted | GDPR compliant | No credit card needed</p></div><div style="background:#f5f5f5;padding:15px;text-align:center;font-size:12px;color:#888;border-radius:0 0 10px 10px;"><p style="margin:0;">ShepherdAI · <a href="https://www.shepherdaitech.com" style="color:#8B1538;">shepherdaitech.com</a></p><p style="margin:5px 0 0 0;">You're receiving this because we work with small churches. <a href="mailto:support@shepherdaitech.com?subject=Unsubscribe" style="color:#888;">Unsubscribe</a></p></div></body></html>'''

def send(to, name, idx):
    subj = SUBJECT_A if idx % 2 == 0 else SUBJECT_B
    html = (HTML_A if idx % 2 == 0 else HTML_B).replace("{name}", name if name and name != "Pastor" else "Pastor")
    payload = json.dumps({"from": FROM, "to": [to], "subject": subj, "html": html})
    try:
        r = subprocess.run(["curl","-s","-X","POST","https://api.resend.com/emails",
            "-H",f"Authorization: Bearer {API_KEY}",
            "-H","Content-Type: application/json",
            "-d", payload], capture_output=True, text=True, timeout=30)
        d = json.loads(r.stdout) if r.stdout else {}
        if "id" in d: return True, d["id"]
        if "error" in d: return False, d.get("error",{}).get("message",str(d))[:100]
        return False, r.stdout[:100]
    except Exception as e:
        return False, str(e)[:100]

# Read contacts
contacts = []
with open(CSV_PATH) as f:
    for row in csv.DictReader(f):
        contacts.append(row)

# Determine start index from command line (for resuming)
start_idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
end_idx = min(start_idx + 10, len(contacts))  # Process 10 at a time

sent = 0
failed = 0
results = []

for i in range(start_idx, end_idx):
    c = contacts[i]
    ok, msg = send(c['email'].strip(), c['pastor_name'].strip(), i)
    if ok:
        sent += 1
        results.append(f"✅ {c['email']} ({c['church_name']}) - {msg}")
    else:
        failed += 1
        results.append(f"❌ {c['email']} ({c['church_name']}) - {msg}")
    if i < end_idx - 1:
        time.sleep(8)  # 8 seconds between emails

# Write batch results
with open(LOG_PATH, 'a') as f:
    f.write(f"\n--- Batch starting at index {start_idx} ---\n")
    f.write(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    for r in results:
        f.write(r + "\n")
    f.write(f"Batch: Sent={sent}, Failed={failed}\n")

print(f"Batch {start_idx}-{end_idx}: Sent={sent}, Failed={failed}")
