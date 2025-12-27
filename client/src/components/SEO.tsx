import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: Record<string, any>;
}

export function SEO({
  title,
  description,
  image = 'https://slangmaker.sexinator.com/ogp-image.png',
  path = '/',
  type = 'website',
  structuredData
}: SEOProps) {
  const { t, i18n } = useTranslation();

  const siteUrl = 'https://slangmaker.sexinator.com'; // Primary custom domain
  const fullUrl = `${siteUrl}${path}`;

  // Use localized defaults if title/description not provided
  const seoTitle = title || t('appTitle');
  const seoDescription = description || t('appDescription');

  const fullTitle = seoTitle.includes('AIスラングメーカー') || seoTitle.includes('AI Slang Maker')
    ? seoTitle
    : `${seoTitle} | ${t('appTitle')}`;

  const jsonLd = structuredData || {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": t('appTitle'),
    "url": siteUrl,
    "description": seoDescription,
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  };

  const languages = ['ja', 'en', 'zh'];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={fullUrl} />

      {/* hreflang for international SEO */}
      {languages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hreflang={lang}
          href={`${siteUrl}${path === '/' ? '' : path}?lng=${lang}`}
        />
      ))}
      <link rel="alternate" hreflang="x-default" href={`${siteUrl}${path}`} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={t('appTitle')} />
      <meta property="og:locale" content={i18n.language === 'ja' ? 'ja_JP' : i18n.language === 'zh' ? 'zh_CN' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}
