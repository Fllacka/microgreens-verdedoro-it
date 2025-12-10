/**
 * SEO Utilities for Verde D'Oro
 * Generates structured data (JSON-LD) for various page types
 */

const SITE_URL = "https://verdedoro.it";
const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Verde D'Oro Microgreens",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 400,
    height: 100,
  },
  description: "Microgreens freschi e nutrienti coltivati nel cuore dell'Emilia-Romagna",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Reggio Emilia",
    addressRegion: "Emilia-Romagna",
    addressCountry: "IT",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "verdedoro.microgreens@gmail.com",
  },
  sameAs: [
    // Add social media URLs when available
  ],
};

/**
 * Generate Organization schema for the website
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    ...ORGANIZATION,
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "Verde D'Oro Microgreens",
    description: "Microgreens freschi e nutrienti coltivati a Reggio Emilia",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "it-IT",
  };
}

/**
 * Generate LocalBusiness schema for the homepage
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: "Verde D'Oro Microgreens",
    image: `${SITE_URL}/og-image.jpg`,
    url: SITE_URL,
    telephone: "", // Add when available
    email: "verdedoro.microgreens@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Reggio Emilia",
      addressRegion: "Emilia-Romagna",
      addressCountry: "IT",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 44.6983,
      longitude: 10.6312,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    priceRange: "€€",
    servesCuisine: "Microgreens, Prodotti Biologici",
  };
}

/**
 * Generate Product schema for product pages
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  slug: string;
  image?: string;
  rating?: number;
  category?: string;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/microgreens/${product.slug}#product`,
    name: product.name,
    description: product.description,
    url: `${SITE_URL}/microgreens/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Verde D'Oro",
    },
    manufacturer: {
      "@id": `${SITE_URL}/#organization`,
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      seller: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
  };

  if (product.image) {
    schema.image = product.image;
  }

  if (product.rating && product.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      bestRating: 5,
      worstRating: 1,
      ratingCount: 1,
    };
  }

  if (product.category) {
    schema.category = product.category;
  }

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  category?: string;
  author?: string;
  wordCount?: number;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/blog/${article.slug}#article`,
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}/blog/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    inLanguage: "it-IT",
    author: {
      "@type": "Organization",
      name: article.author || "Verde D'Oro",
      url: SITE_URL,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${article.slug}`,
    },
  };

  if (article.image) {
    schema.image = {
      "@type": "ImageObject",
      url: article.image,
    };
  }

  if (article.category) {
    schema.articleSection = article.category;
  }

  if (article.wordCount) {
    schema.wordCount = article.wordCount;
  }

  return schema;
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Combine multiple schemas into a single graph
 */
export function combineSchemas(...schemas: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.map((schema) => {
      // Remove @context from individual schemas when combining
      const { "@context": _, ...rest } = schema;
      return rest;
    }),
  };
}
