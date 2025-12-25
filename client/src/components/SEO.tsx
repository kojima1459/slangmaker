import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: Record<string, any>;
}

export function SEO({ 
  title = 'AIスラングメーカー - 言葉を遊びに変えるAIツール',
  description = '文章を関西弁、ギャル語、武士語などに一瞬で変換。AIが文脈を理解して面白い言い回しを生成します。登録不要、完全無料で楽しめます。',
  image = 'https://slangmaker-11c54.web.app/og-image.png', // 後でデフォルト画像を作成・配置する必要があります
  path = '/',
  type = 'website',
  structuredData
}: SEOProps) {
  const siteUrl = 'https://slangmaker.sexinator.com'; // カスタムドメイン
  const fullUrl = `${siteUrl}${path}`;
  const fullTitle = title.includes('AIスラングメーカー') ? title : `${title} | AIスラングメーカー`;

  const jsonLd = structuredData || {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AIスラングメーカー",
    "url": siteUrl,
    "description": description,
    "applicationCategory": "EntertainmentApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="AIスラングメーカー" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}
