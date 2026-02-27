/**
 * SEO Utilities for Verde D'Oro
 * Generates structured data (JSON-LD) for various page types
 */

const SITE_URL = "https://microgreens.verdedoro.it";
const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Verde D'Oro Microgreens",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.webp`,
    width: 400,
    height: 156,
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
    email: "microgreens.verdedoro@gmail.com",
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
    email: "microgreens.verdedoro@gmail.com",
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
 * Strip HTML tags from text (for structured data)
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Generate Product schema for product pages
 * Now supports price tiers with AggregateOffer
 */
export function generateProductSchema(product: {
  name: string;
  description: string;
  slug: string;
  image?: string;
  rating?: number;
  category?: string;
  priceTiers?: Array<{ weight: number; price: number }>;
}) {
  // Format product name with "Microgreens di" prefix
  const productName = `Microgreens di ${product.name}`;

  // Format category with hierarchy
  const productCategory = product.category ? `Microgreens / ${product.category}` : "Microgreens";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/microgreens/${product.slug}#product`,
    name: productName,
    description: product.description,
    url: `${SITE_URL}/microgreens/${product.slug}`,
    category: productCategory,
    brand: {
      "@type": "Brand",
      name: "Verde D'Oro",
    },
    manufacturer: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  // Generate AggregateOffer when price tiers exist
  const validTiers = (product.priceTiers || []).filter((t) => t.price > 0);
  if (validTiers.length > 0) {
    const prices = validTiers.map((t) => t.price);
    schema.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: validTiers.length,
      availability: "https://schema.org/InStock",
      seller: {
        "@id": `${SITE_URL}/#organization`,
      },
    };
  } else {
    schema.offers = {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "EUR",
      seller: {
        "@id": `${SITE_URL}/#organization`,
      },
    };
  }

  // Ensure image is an ImageObject with absolute URL
  if (product.image) {
    const imageUrl = product.image.startsWith("http") ? product.image : `${SITE_URL}${product.image}`;
    schema.image = {
      "@type": "ImageObject",
      url: imageUrl,
    };
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

  return schema;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
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
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
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
