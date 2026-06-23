// Church profile and denomination-aware AI prompt system

export interface ChurchProfile {
  church_name: string;
  pastor_name: string;
  denomination: string;
  congregation_size: string;
  worship_style: string;
  preferred_tone: string;
  ai_tone: string;
  default_signoff: string;
  email_signature: string;
  website: string;
  address: string;
}

export const DENOMINATIONS = [
  { value: 'baptist', label: 'Baptist' },
  { value: 'methodist', label: 'Methodist (UMC)' },
  { value: 'lutheran', label: 'Lutheran (ELCA/Missouri Synod)' },
  { value: 'presbyterian', label: 'Presbyterian (PCA/PCUSA)' },
  { value: 'pentecostal', label: 'Pentecostal/Assemblies of God' },
  { value: 'catholic', label: 'Roman Catholic' },
  { value: 'anglican', label: 'Anglican/Episcopal' },
  { value: 'non-denominational', label: 'Non-Denominational' },
  { value: 'orthodox', label: 'Eastern Orthodox' },
  { value: 'adventist', label: 'Seventh-day Adventist' },
  { value: 'reformed', label: 'Reformed (CRC/RCA)' },
  { value: 'nazarene', label: 'Church of the Nazarene' },
  { value: 'other', label: 'Other' },
] as const;

export const CONGREGATION_SIZES = [
  { value: 'small', label: 'Small (under 50)' },
  { value: 'medium', label: 'Medium (50-200)' },
  { value: 'large', label: 'Large (200-500)' },
  { value: 'mega', label: 'Mega (500+)' },
] as const;

export const WORSHIP_STYLES = [
  { value: 'traditional', label: 'Traditional (hymns, liturgy)' },
  { value: 'contemporary', label: 'Contemporary (modern worship band)' },
  { value: 'blended', label: 'Blended (mix of traditional and contemporary)' },
  { value: 'charismatic', label: 'Charismatic (Spirit-led, spontaneous)' },
  { value: 'high-church', label: 'High Church (formal liturgy, sacraments)' },
] as const;

// Denomination-specific guidance for AI prompts
export function getDenominationContext(denomination: string): string {
  const contexts: Record<string, string> = {
    'baptist': 'Baptist tradition emphasizes believer\'s baptism, biblical authority, and personal faith. Use direct biblical references. Sermons are typically expository. Community outreach and evangelism are key values.',
    'methodist': 'Methodist tradition values social justice, grace, and methodical spiritual disciplines. Use inclusive language. Reference John Wesley\'s teachings when relevant. Emphasize personal and social holiness.',
    'lutheran': 'Lutheran tradition centers on grace alone, faith alone, scripture alone. Use liturgical language where appropriate. Reference the Book of Concord and Luther\'s catechisms. Emphasize God\'s grace and forgiveness.',
    'presbyterian': 'Presbyterian tradition values reformed theology, covenant community, and ordered ministry. Use thoughtful, intellectual tone. Reference reformed confessions. Emphasize God\'s sovereignty and covenant faithfulness.',
    'pentecostal': 'Pentecostal tradition emphasizes the Holy Spirit\'s active work, spiritual gifts, and vibrant worship. Use Spirit-empowered language. Encourage faith-filled, expectant tone. Emphasize prayer, healing, and spiritual gifts.',
    'catholic': 'Catholic tradition emphasizes sacraments, saints, liturgical seasons, and the Magisterium. Use reverent, liturgical language. Reference Church Fathers, Vatican documents, and saint quotes. Observe liturgical calendar (Advent, Lent, etc.). Emphasize Eucharist, Mary, and communion of saints.',
    'anglican': 'Anglican tradition values the via media (middle way), Book of Common Prayer, and sacramental worship. Use elegant, reverent language. Reference Anglican tradition and prayer book. Emphasize both scripture and tradition.',
    'non-denominational': 'Non-denominational churches focus on biblical teaching and contemporary relevance. Use accessible, relatable language. Emphasize personal relationship with Jesus and practical application.',
    'orthodox': 'Eastern Orthodox tradition emphasizes theosis (divinization), Holy Tradition, icons, and the liturgy. Use rich, mystical language. Reference Church Fathers and the Philokalia. Emphasize transformation through prayer and sacraments.',
    'adventist': 'Seventh-day Adventist tradition emphasizes the Sabbath (Saturday worship), health ministry, and end-time prophecy. Reference Ellen G. White\'s writings. Emphasize second coming, health, and Sabbath rest.',
    'reformed': 'Reformed tradition emphasizes God\'s sovereignty, covenant theology, and cultural engagement. Use thoughtful, systematic language. Reference Heidelberg Catechism and reformed confessions.',
    'nazarene': 'Nazarene tradition emphasizes entire sanctification, holiness living, and compassionate ministry. Use warm, encouraging language. Emphasize holy living and social compassion.',
    'other': 'Use warm, biblically-grounded language that is inclusive and accessible. Focus on God\'s love, grace, and practical faith application.',
  };
  return contexts[denomination] || contexts['other'];
}

// Build a comprehensive AI context from church profile
export function buildChurchContext(profile: ChurchProfile | null): string {
  if (!profile) return 'Use warm, professional, biblically-grounded language suitable for a Christian church.';
  
  const parts: string[] = [];
  
  if (profile.church_name) parts.push(`Church name: ${profile.church_name}`);
  if (profile.pastor_name) parts.push(`Pastor: ${profile.pastor_name}`);
  if (profile.denomination) parts.push(getDenominationContext(profile.denomination));
  if (profile.congregation_size) {
    const sizeMap: Record<string, string> = {
      'small': 'a small congregation (under 50 members) - use intimate, personal tone',
      'medium': 'a medium-sized congregation (50-200 members) - balance personal warmth with structured content',
      'large': 'a large congregation (200-500 members) - use polished, organized content',
      'mega': 'a mega church (500+ members) - use professional, high-quality content with broad appeal',
    };
    parts.push(sizeMap[profile.congregation_size] || '');
  }
  if (profile.worship_style) {
    const styleMap: Record<string, string> = {
      'traditional': 'Traditional worship style - use formal language, reference hymns and classical liturgy',
      'contemporary': 'Contemporary worship style - use modern, conversational language, reference modern worship songs',
      'blended': 'Blended worship style - mix traditional reverence with contemporary accessibility',
      'charismatic': 'Charismatic worship style - use Spirit-led, expressive language with emphasis on prayer and faith',
      'high-church': 'High church worship style - use formal, liturgical language with emphasis on sacraments and tradition',
    };
    parts.push(styleMap[profile.worship_style] || '');
  }
  if (profile.ai_tone) parts.push(`Preferred AI tone: ${profile.ai_tone}`);
  if (profile.default_signoff) parts.push(`Default sign-off: ${profile.default_signoff}`);
  
  return parts.join('. ') || 'Use warm, professional, biblically-grounded language suitable for a Christian church.';
}

// Get current liturgical season (useful for Catholic/Anglican/Lutheran)
export function getLiturgicalSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Simplified liturgical calendar
  if (month === 12 && day >= 1 && day <= 24) return 'Advent';
  if (month === 12 && day >= 25) return 'Christmas';
  if (month >= 1 && month <= 2) return 'Epiphany/Ordinary Time';
  if (month === 2 || (month === 3 && day <= 13)) return 'Lent (approximately)';
  if (month === 3 || (month === 4 && day <= 10)) return 'Easter (approximately)';
  if (month >= 4 && month <= 5) return 'Easter/Ordinary Time';
  if (month >= 6 && month <= 8) return 'Ordinary Time';
  if (month >= 9 && month <= 11) return 'Ordinary Time';
  return 'Ordinary Time';
}
