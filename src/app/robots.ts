import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/settings', '/dashboard', '/member/', '/points-center'],
    },
    sitemap: 'https://www.shepherdaitech.com/sitemap.xml',
  };
}
