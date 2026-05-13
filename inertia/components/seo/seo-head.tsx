import { Head } from '@inertiajs/react'

interface SeoHeadProps {
  title: string
  description: string
  keywords?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
  structuredData?: object | object[]
}

const BASE_URL = 'https://anuaapp.com.br'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

export function SeoHead({
  title,
  description,
  keywords,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  structuredData,
}: SeoHeadProps) {
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL
  const fullTitle = `${title} | Anuá - Sistema de Gestão Escolar`

  const schemas = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : []

  return (
    <Head title={title}>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />

      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Anuá" />
      <meta property="og:locale" content="pt_BR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta name="author" content="Anuá" />
      <meta name="application-name" content="Anuá" />
      <meta name="apple-mobile-web-app-title" content="Anuá" />
      <meta name="theme-color" content="#9333ea" />

      {schemas.map((schema, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  )
}

// Helper functions to generate structured data objects (not components)
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Anuá',
    'url': 'https://anuaapp.com.br',
    'logo': 'https://anuaapp.com.br/logo.png',
    'description': 'Sistema de gestão escolar completo com inteligência artificial',
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'availableLanguage': 'Portuguese',
    },
    'sameAs': [],
  }
}

export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Anuá',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'description':
      'Sistema de gestão escolar completo com IA integrada. Matrículas, pedagógico, financeiro, gamificação e muito mais.',
    'offers': {
      '@type': 'Offer',
      'price': '18.90',
      'priceCurrency': 'BRL',
      'priceSpecification': {
        '@type': 'UnitPriceSpecification',
        'price': '18.90',
        'priceCurrency': 'BRL',
        'unitText': 'aluno/mês',
      },
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'ratingCount': '150',
    },
    'featureList': [
      'Gestão de matrículas online',
      'Controle pedagógico completo',
      'Financeiro integrado',
      'Sistema de gamificação',
      'Inteligência Artificial',
      'Cantina digital',
      'Comunicação multi-canal',
    ],
  }
}

export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  }
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `https://anuaapp.com.br${item.url}`,
    })),
  }
}
