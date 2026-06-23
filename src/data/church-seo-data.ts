// Programmatic SEO data — city × denomination pages
// Each page targets "churches in {city} {denomination}" search queries

export const denominations = [
  { slug: 'baptist', label: 'Baptist', color: '#1e3a5f' },
  { slug: 'methodist', label: 'Methodist (UMC)', color: '#dc2626' },
  { slug: 'lutheran', label: 'Lutheran', color: '#7c3aed' },
  { slug: 'presbyterian', label: 'Presbyterian', color: '#2563eb' },
  { slug: 'pentecostal', label: 'Pentecostal', color: '#f59e0b' },
  { slug: 'catholic', label: 'Catholic', color: '#16a34a' },
  { slug: 'non-denominational', label: 'Non-Denominational', color: '#0891b2' },
  { slug: 'anglican', label: 'Anglican/Episcopal', color: '#db2777' },
  { slug: 'orthodox', label: 'Eastern Orthodox', color: '#9333ea' },
  { slug: 'adventist', label: 'Seventh-day Adventist', color: '#ea580c' },
  { slug: 'reformed', label: 'Reformed', color: '#475569' },
  { slug: 'nazarene', label: 'Church of the Nazarene', color: '#0d9488' },
  { slug: 'assembly-of-god', label: 'Assemblies of God', color: '#b45309' },
] as const;

export interface ChurchCity {
  city: string;
  state: string;
  stateFull: string;
  population: string;
  knownChurches: string[];
}

export const cities: ChurchCity[] = [
  { city: 'houston', state: 'tx', stateFull: 'Texas', population: '2,300,000', knownChurches: ['Lakewood Church', 'Second Baptist Church', 'Houston\'s First Baptist'] },
  { city: 'dallas', state: 'tx', stateFull: 'Texas', population: '1,300,000', knownChurches: ['First Baptist Dallas', 'Highland Park UMC', 'Prestonwood Baptist'] },
  { city: 'austin', state: 'tx', stateFull: 'Texas', population: '960,000', knownChurches: ['Austin Stone', 'Gateway Church Austin', 'Hyde Park Baptist'] },
  { city: 'san-antonio', state: 'tx', stateFull: 'Texas', population: '1,470,000', knownChurches: ['Cornerstone Church', 'Community Bible Church', 'Oak Hills Church'] },
  { city: 'new-york', state: 'ny', stateFull: 'New York', population: '8,300,000', knownChurches: ['Brooklyn Tabernacle', 'Times Square Church', 'Redeemer Presbyterian'] },
  { city: 'los-angeles', state: 'ca', stateFull: 'California', population: '3,800,000', knownChurches: ['Angelus Temple', 'Mosaic Church', 'Bel Air Presbyterian'] },
  { city: 'chicago', state: 'il', stateFull: 'Illinois', population: '2,700,000', knownChurches: ['Willow Creek', 'Harvest Bible Chapel', 'Moody Church'] },
  { city: 'phoenix', state: 'az', stateFull: 'Arizona', population: '1,660,000', knownChurches: ['Christ\'s Church of the Valley', 'Dream City Church', 'Phoenix First Assembly'] },
  { city: 'philadelphia', state: 'pa', stateFull: 'Pennsylvania', population: '1,560,000', knownChurches: ['Enon Tabernacle Baptist', 'Tenth Presbyterian', 'Christ Church Philadelphia'] },
  { city: 'san-diego', state: 'ca', stateFull: 'California', population: '1,380,000', knownChurches: ['The Rock Church', 'Shadow Mountain', 'Skyline Church'] },
  { city: 'san-francisco', state: 'ca', stateFull: 'California', population: '808,000', knownChurches: ['Glide Memorial', 'City Church SF', 'Reality SF'] },
  { city: 'seattle', state: 'wa', stateFull: 'Washington', population: '755,000', knownChurches: ['Mars Hill', 'University Presbyterian', 'Quest Church'] },
  { city: 'denver', state: 'co', stateFull: 'Colorado', population: '716,000', knownChurches: ['Flatirons Community Church', 'Denver Community Church', 'New Denver Church'] },
  { city: 'nashville', state: 'tn', stateFull: 'Tennessee', population: '690,000', knownChurches: ['The Belonging Co.', 'Cross Point Church', 'Christ Church Nashville'] },
  { city: 'atlanta', state: 'ga', stateFull: 'Georgia', population: '510,000', knownChurches: ['Passion City Church', 'North Point Community Church', 'Buckhead Church'] },
  { city: 'miami', state: 'fl', stateFull: 'Florida', population: '450,000', knownChurches: ['Vous Church', 'Flamingo Road Church', 'Christ Fellowship Miami'] },
  { city: 'orlando', state: 'fl', stateFull: 'Florida', population: '320,000', knownChurches: ['First Baptist Orlando', 'Summit Church', 'Discovery Church'] },
  { city: 'charlotte', state: 'nc', stateFull: 'North Carolina', population: '911,000', knownChurches: ['Elevation Church', 'Forest Hill Church', 'Carmel Baptist'] },
  { city: 'indianapolis', state: 'in', stateFull: 'Indiana', population: '880,000', knownChurches: ['Traders Point Christian Church', 'College Park Church', 'Northview Church'] },
  { city: 'columbus', state: 'oh', stateFull: 'Ohio', population: '910,000', knownChurches: ['Rock City Church', 'Vista Community Church', 'Grace Polaris'] },
  { city: 'jacksonville', state: 'fl', stateFull: 'Florida', population: '990,000', knownChurches: ['First Baptist Jacksonville', 'Bethel Church', 'Celebration Church'] },
  { city: 'boston', state: 'ma', stateFull: 'Massachusetts', population: '654,000', knownChurches: ['Park Street Church', 'Trinity Church Boston', 'Grace Community Church'] },
  { city: 'detroit', state: 'mi', stateFull: 'Michigan', population: '633,000', knownChurches: ['Greater Grace Temple', 'Second Ebenezer', 'Historic Little Rock Baptist'] },
  { city: 'portland', state: 'or', stateFull: 'Oregon', population: '635,000', knownChurches: ['Bridgetown Church', 'Solid Rock Church', 'Imago Dei Community'] },
  { city: 'las-vegas', state: 'nv', stateFull: 'Nevada', population: '660,000', knownChurches: ['Central Church', 'Hope Church Vegas', 'Canyon Ridge Christian'] },
  { city: 'memphis', state: 'tn', stateFull: 'Tennessee', population: '618,000', knownChurches: ['Bellevue Baptist', 'Christ Church Memphis', 'Hope Church Memphis'] },
  { city: 'louisville', state: 'ky', stateFull: 'Kentucky', population: '623,000', knownChurches: ['Southeast Christian', 'Sojourn Church', 'Northeast Christian'] },
  { city: 'baltimore', state: 'md', stateFull: 'Maryland', population: '565,000', knownChurches: ['Greater Grace World Outreach', 'New Psalmist Baptist', 'Grace City Church'] },
  { city: 'milwaukee', state: 'wi', stateFull: 'Wisconsin', population: '561,000', knownChurches: ['Elmbrook Church', 'Spring Creek Church', 'Eastbrook Church'] },
  { city: 'albuquerque', state: 'nm', stateFull: 'New Mexico', population: '560,000', knownChurches: ['Calvary Church Albuquerque', 'Sagebrush Church', 'Legacy Church'] },
  { city: 'tucson', state: 'az', stateFull: 'Arizona', population: '547,000', knownChurches: ['Victory Worship Center', 'Pantano Christian', 'Calvary Tucson'] },
  { city: 'fresno', state: 'ca', stateFull: 'California', population: '545,000', knownChurches: ['The Well Community Church', 'Northpark Community Church', 'Peoples Church'] },
  { city: 'sacramento', state: 'ca', stateFull: 'California', population: '528,000', knownChurches: ['Bayside Church', 'Capital Christian', 'Adventure Church'] },
  { city: 'kansas-city', state: 'mo', stateFull: 'Missouri', population: '510,000', knownChurches: ['Church of the Resurrection', 'IHOPKC', 'Abundant Life'] },
  { city: 'oklahoma-city', state: 'ok', stateFull: 'Oklahoma', population: '702,000', knownChurches: ['Life.Church', 'Crossings Community Church', 'People\'s Church OKC'] },
  { city: 'raleigh', state: 'nc', stateFull: 'North Carolina', population: '482,000', knownChurches: ['Hope Community Church', 'Summit Church', 'Vintage Church'] },
  { city: 'omaha', state: 'ne', stateFull: 'Nebraska', population: '484,000', knownChurches: ['Brookside Church', 'Christ Community Church', 'King of Kings'] },
  { city: 'colorado-springs', state: 'co', stateFull: 'Colorado', population: '489,000', knownChurches: ['New Life Church', 'Focus on the Family', 'Woodmen Valley Chapel'] },
  { city: 'minneapolis', state: 'mn', stateFull: 'Minnesota', population: '425,000', knownChurches: ['Eagle Brook Church', 'Wooddale Church', 'Bethlehem Baptist'] },
  { city: 'tampa', state: 'fl', stateFull: 'Florida', population: '403,000', knownChurches: ['Idlewild Baptist', 'The Crossing Church', 'Grace Family Church'] },
  { city: 'st-louis', state: 'mo', stateFull: 'Missouri', population: '281,000', knownChurches: ['The Crossing', 'Greentree Community Church', 'Pathfinder Church'] },
  { city: 'pittsburgh', state: 'pa', stateFull: 'Pennsylvania', population: '303,000', knownChurches: ['Orchard Hill Church', 'North Way Christian Community', 'Allegheny Center Alliance'] },
  { city: 'cincinnati', state: 'oh', stateFull: 'Ohio', population: '311,000', knownChurches: ['Crossroads Church', 'Vineyard Cincinnati', 'Horizon Community Church'] },
  { city: 'virginia-beach', state: 'va', stateFull: 'Virginia', population: '456,000', knownChurches: ['Spring Branch Church', 'Wave Church', 'New Life Church VA'] },
  { city: 'washington', state: 'dc', stateFull: 'Washington DC', population: '679,000', knownChurches: ['National Community Church', 'The District Church', 'McLean Bible Church'] },
  { city: 'salt-lake-city', state: 'ut', stateFull: 'Utah', population: '210,000', knownChurches: ['K2 The Church', 'Southeast Christian Church', 'The Rock Church SLC'] },
  { city: 'boise', state: 'id', stateFull: 'Idaho', population: '236,000', knownChurches: ['Calvary Boise', 'Boise Bible College', 'Ten Mile Christian'] },
  { city: 'birmingham', state: 'al', stateFull: 'Alabama', population: '196,000', knownChurches: ['Church of the Highlands', 'Dawson Memorial Baptist', 'Briarwood Presbyterian'] },
  { city: 'des-moines', state: 'ia', stateFull: 'Iowa', population: '210,000', knownChurches: ['Lutheran Church of Hope', 'Walnut Creek Church', 'New Hope Church'] },
  { city: 'richmond', state: 'va', stateFull: 'Virginia', population: '229,000', knownChurches: ['Passion Community Church', 'Movement Church', 'Area 10 Faith Community'] },
];

// SEO metadata helpers
export function getChurchPageMeta(city: ChurchCity, denom: typeof denominations[number]) {
  const cityDisplay = city.city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const label = denom.label;
  return {
    title: `${label} Churches in ${cityDisplay}, ${city.stateFull} — ShepherdAI Church Finder`,
    description: `Find ${label} churches in ${cityDisplay}, ${city.stateFull}. Connect with worship services, pastors, and faith communities. Free church finder powered by ShepherdAI.`,
  };
}

export function getChurchContent(city: ChurchCity, denom: typeof denominations[number]) {
  const cityDisplay = city.city.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    heading: `${denom.label} Churches in ${cityDisplay}, ${city.stateFull}`,
    intro: `Looking for ${denom.label} churches in ${cityDisplay}? Whether you're new to the area, searching for a new church home, or visiting ${city.stateFull}, we can help you find a welcoming ${denom.label} congregation. ShepherdAI helps churches connect with visitors, manage follow-ups, and create community.`,
    nearbyCities: cities.filter(c => c.state === city.state && c.city !== city.city).slice(0, 4),
    cityInfo: city,
  };
}
