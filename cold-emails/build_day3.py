import csv
import os

# Load existing emails to avoid duplicates
existing = set()
for f in ['day1_contacts.csv', 'day2_contacts.csv']:
    path = f'/root/shepherdai/cold-emails/{f}'
    if os.path.exists(path):
        with open(path, 'r') as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                existing.add(row['email'].strip().lower())

# New contacts for Day 3 - small Protestant churches only
new_contacts = [
    # Columbus OH area
    ("Union Grove Baptist Church", "Rev. Derrick K. Holmes", "revholmes@uniongrovebaptist.org", "Columbus", "uniongrovebaptist.org"),
    ("This Rock Baptist Church", "Pastor Aaron Cowgill", "savesomeministries@gmail.com", "Columbus", "thisrockbaptist.org"),
    ("Trinity Baptist Church Columbus", "Rev. Victor M. Davis", "trinity@trinity-baptist.com", "Columbus", "trinity-baptist.com"),
    ("North Columbus Baptist Church", "Pastor Daniel Wolvin", "pastor@northcolumbusbaptist.org", "Columbus", "northcolumbusbaptist.org"),
    ("Old Paths Baptist Church", "Pastor Jason D. LaPat", "jasonlapat@yahoo.com", "Columbus", "wayoflife.org"),
    ("Bible Baptist Church Grove City", "Pastor Stan Slabaugh", "bcgrovecity@yahoo.com", "Columbus area", "wayoflife.org"),
    ("Calvary Baptist Church Bucyrus", "Pastor Ken Lance", "pastorlance@hotmail.com", "Bucyrus OH", "wayoflife.org"),
    ("Bible Baptist Temple Campbell", "Pastor Matthew Ferguson", "pastorferguson@gmail.com", "Campbell OH", "wayoflife.org"),
    ("Open Door Baptist Church", "Pastor Bob Butterfield", "Info@WelcomeToOpenDoor.com", "Canton OH", "wayoflife.org"),
    ("Cleveland Baptist Church", "Pastor Kevin Folger", "pastor@clevelandbaptist.org", "Cleveland OH", "wayoflife.org"),
    ("Heritage Baptist Church", "Pastor Gil Morrow", "heritagebapt@verizon.net", "Englewood OH", "wayoflife.org"),
    ("Fremont Baptist Temple", "Pastor Gary Click", "pastorclick@fremontbaptisttemple.com", "Fremont OH", "wayoflife.org"),
    ("Grace Baptist Church Marietta", "Pastor Ralph E. Hayes", "gracebaptist5@gmail.com", "Marietta OH", "wayoflife.org"),
    
    # Detroit MI area
    ("Calvary Detroit UMC", "Pastor", "bettytedwhitely@aol.com", "Detroit", "nearestchurches.com"),
    ("Cass Community UMC", "Pastor", "ccumcac@aol.com", "Detroit", "nearestchurches.com"),
    ("Conant Avenue UMC", "Pastor", "conantave@sbcglobal.net", "Detroit", "nearestchurches.com"),
    ("El Buen Pastor UMC", "Pastor", "ElBuenPastorUMC@gmail.com", "Detroit", "nearestchurches.com"),
    ("Ford Memorial UMC", "Pastor", "fordmemorialumc@yahoo.com", "Detroit", "nearestchurches.com"),
    ("Metropolitan UMC Detroit", "Pastor", "serving@metroumc.org", "Detroit", "nearestchurches.com"),
    ("Peoples UMC Detroit", "Pastor", "cartergrimmett@sbcglobal.net", "Detroit", "nearestchurches.com"),
    ("Scott Memorial UMC", "Pastor", "scottumc@yahoo.com", "Detroit", "nearestchurches.com"),
    ("Second Grace UMC", "Pastor", "secondgrac@aol.com", "Detroit", "nearestchurches.com"),
    ("St Paul UMC Detroit", "Pastor", "StPaulUMCdet@aol.com", "Detroit", "nearestchurches.com"),
    ("Grosse Pointe UMC", "Rev. David Eardley", "reveardley@gpumc.org", "Grosse Pointe MI", "gpumc.org"),
    
    # Minneapolis MN area
    ("Hennepin Avenue UMC", "Pastor Elizabeth Macaulay", "elizabeth@haumc.org", "Minneapolis", "haumc.org"),
    ("Good Samaritan UMC", "Rev. Max Richter", "max@good.org", "Minneapolis area", "good.org"),
    ("Breakthrough MN", "Pastor Scott Brekke", "scott@breakthroughmn.org", "Minneapolis", "minneapolismn.gov"),
    ("Southeast Christian MN", "Pastor Brett Miller", "brett@southeastchristianmn.org", "Minneapolis", "minneapolismn.gov"),
    ("Rev. Charles Graham", "Rev. Charles Graham", "revcgraham@gmail.com", "Minneapolis", "minneapolismn.gov"),
    ("Pastor Dave Larson", "Pastor Dave Larson", "pastordavelarson@gmail.com", "Minneapolis", "minneapolismn.gov"),
    
    # Richmond VA area
    ("Anointed New Life Baptist Church", "Pastor", "ANOINTEDNEWLIFE@COMCAST.NET", "Richmond", "nearestchurches.com"),
    ("Christian Tabernacle Baptist Church", "Pastor", "ctbeast@aol.com", "Richmond", "nearestchurches.com"),
    ("Exaltation Church", "Pastor", "info@exaltationchurch.com", "Richmond", "nearestchurches.com"),
    ("Ebenezer Baptist Church Richmond", "Rev. Kevin L. Jones", "office@ebenezerrva.org", "Richmond", "ebenezerrva.org"),
    ("Huguenot Road Baptist Church", "Dr. Robert E. Lee IV", "info@hrbcrichmond.org", "Richmond", "hrbcrichmond.org"),
    
    # Cincinnati OH
    ("Friendship Baptist Church", "Pastor Keith Wells", "kwells@ourfbc.com", "Cincinnati", "ourfbc.com"),
    ("Mission Baptist Church Cincinnati", "Dr. Bill Rains", "pastorbillrains@zoomtown.com", "Cincinnati", "missionbaptistcincinnati.org"),
    
    # Milwaukee WI
    ("Bethesda Baptist Church", "Pastor Robert Sims", "rsims3452@aol.com", "Milwaukee", "netministries.org"),
    ("Upper Room Missionary Baptist Church", "Pastor Willie Brooks", "willie0558@att.net", "Milwaukee", "netministries.org"),
    ("Progressive Baptist Church Milwaukee", "Pastor", "progressivebaptist@sbcglobal.net", "Milwaukee", "progressivebaptistmilwaukee.com"),
    
    # Buffalo NY
    ("Metropolitan UMC Buffalo", "Pastor Angela Stewart", "metroumchurch@hotmail.com", "Buffalo", "unyumc.org"),
    ("First UMC Buffalo", "Pastor", "FirstChurch@firstumcbuffalo.org", "Buffalo", "firstumcbuffalo.org"),
    ("Cornerstone Community Church", "Pastor", "office@CornerstoneOnCapen.com", "Buffalo", "cornerstoneoncapen.com"),
    
    # Little Rock AR
    ("Freedom Fellowship", "Pastor", "pastor@freedomfellowship-ar.com", "Little Rock", "nearestchurches.com"),
    ("Freedom Worship Center", "Pastor", "jdyson63@hotmail.com", "Little Rock", "nearestchurches.com"),
    ("Grace Connection Church", "Pastor", "wanda@graceconnectionchurch.com", "Little Rock", "nearestchurches.com"),
    ("Little Rock Christian Center", "Pastor", "tauanna@yahoo.com", "Little Rock", "nearestchurches.com"),
    ("Little Rock Church", "Pastor", "mail@littlerockchurch.org", "Little Rock", "nearestchurches.com"),
    ("Mosaic Church Central AR", "Pastor", "mosaicchurchnet@aol.com", "Little Rock", "nearestchurches.com"),
    ("Zoe Bible Church", "Pastor Iverson C. Jackson", "zoe1997@att.net", "Little Rock", "zoebiblechurch.org"),
    
    # Mobile AL
    ("Stone Street Baptist Church", "Pastor", "Pastor@stonestreetbc.org", "Mobile", "stonestreetbc.org"),
    ("Cross Culture Church Mobile", "Pastor Rovy Lopez", "info@crossculture.net", "Mobile", "mobilebaptists.org"),
    ("Apostles Fellowship", "Pastor", "steve@apostlesfellowship.org", "Mobile", "nearestchurches.com"),
    ("Vietnamese Obedience Baptist Church", "Pastor", "vobcmobile@gmail.com", "Mobile", "mobilebaptists.org"),
    ("Semmes First Baptist Church", "Pastor", "semmesfirstbaptistchurch@gmail.com", "Mobile area", "mobilebaptists.org"),
    
    # St. Louis MO
    ("Jacob's Well St. Louis", "Pastor David Corson", "jacobswellstl@yahoo.com", "St. Louis", "selc.lcms.org"),
    
    # Des Moines IA
    ("Grace Fellowship Des Moines", "Pastor Shawn Barr", "shawnbarr099@gmail.com", "Des Moines", "iowabaptistfellowship.org"),
    ("Albia Baptist Church", "Pastor", "abttemple@yahoo.com", "Albia IA", "iowabaptistfellowship.org"),
    ("Bible Baptist Church Ottumwa", "Pastor Ed Matthews", "biblebaptistott@yahoo.com", "Ottumwa IA", "iowabaptistfellowship.org"),
    ("Bible Community Baptist", "Pastor Robert Pate", "RobPate@msn.com", "Central City IA", "iowabaptistfellowship.org"),
    ("Faith Baptist Church Ottumwa", "Pastor Phil Griffith", "pastor@faith1.org", "Ottumwa IA", "iowabaptistfellowship.org"),
    ("Heartland Baptist Church", "Pastor Randy Abell", "heartlandbaptist@churchames.org", "Ames IA", "iowabaptistfellowship.org"),
    ("Hillcrest Baptist Church", "Pastor Dave McIntosh", "hillcrestpastor@machlink.com", "Muscatine IA", "iowabaptistfellowship.org"),
    ("Mark Baptist Church", "Pastor", "MarkBaptistChurchIA@gmail.com", "Bloomfield IA", "iowabaptistfellowship.org"),
    
    # Omaha NE
    ("Midwestern Baptist Church", "Pastor", "mbc@midwesternbaptistchurch.org", "Omaha", "midwesternbaptistchurch.org"),
    ("Bethel Missionary Baptist Church", "Rev. Dr. Lorenzo S. Fincher", "zofinche@yahoo.com", "Omaha", "netministries.org"),
    ("First Baptist Church Omaha", "Pastor Andrew Mahoney", "office@omahafbc.org", "Omaha", "omahafbc.org"),
    ("Center Baptist Church Omaha", "Pastor", "centerbaptistomaha@gmail.com", "Omaha", "centerbaptist.org"),
    
    # Wichita KS
    ("Dawson United Methodist", "Rev. Jose Flores", "dawsonumc@sbglobal.net", "Wichita", "classcreator.com"),
    
    # Tulsa OK
    ("First Baptist Church North Tulsa", "Pastor", "4information@fbcnt.org", "Tulsa", "fbcnt.org"),
    ("Community Baptist Church Tulsa", "Rev. Sharon Ball", "Pastor", "Tulsa", "abcbc.org"),  # no email found, skip
]

# Filter out duplicates and invalid entries
filtered = []
seen = set()
for church, pastor, email, city, source in new_contacts:
    email_lower = email.strip().lower()
    if email_lower in existing or email_lower in seen:
        continue
    if '@' not in email:
        continue
    seen.add(email_lower)
    filtered.append((church, pastor, email, city, source))

print(f"Total new contacts after dedup: {len(filtered)}")

# Save to CSV
outpath = '/root/shepherdai/cold-emails/day3_contacts.csv'
with open(outpath, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['church_name', 'pastor_name', 'email', 'city', 'source_url'])
    for row in filtered:
        writer.writerow(row)

print(f"Saved {len(filtered)} contacts to {outpath}")
