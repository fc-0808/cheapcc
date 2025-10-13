// Advanced Schema Markup for Enhanced SEO
// Professional structured data implementation for CheapCC

export interface SchemaConfig {
  baseUrl: string;
  organizationName: string;
  brandName: string;
}

const DEFAULT_CONFIG: SchemaConfig = {
  baseUrl: 'https://cheapcc.online',
  organizationName: 'CheapCC',
  brandName: 'CheapCC'
};

// Enhanced Organization Schema with comprehensive business information
export const generateOrganizationSchema = (config: SchemaConfig = DEFAULT_CONFIG) => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${config.baseUrl}/#organization`,
    "name": config.organizationName,
    "alternateName": ["CheapCC", "Cheap Creative Cloud", "CheapCC.online"],
    "url": config.baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${config.baseUrl}/favicon.svg`,
      "width": 512,
      "height": 512
    },
    "description": "CheapCC - Adobe Creative Cloud discount provider offering genuine CC subscriptions at 83% off official pricing",
    "slogan": "Your Adobe Creative Cloud, For Less",
    "foundingDate": "2023",
    "numberOfEmployees": "10-50",
    "legalName": "CheapCC Online Services",
    "taxID": "US-TAX-ID", // Would be replaced with actual tax ID
    "duns": "DUNS-NUMBER", // Would be replaced with actual DUNS number
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US",
      "addressRegion": "Global",
      "addressLocality": "Online"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.7128",
      "longitude": "-74.0060"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "United States"
      },
      {
        "@type": "Country",
        "name": "Canada"
      },
      {
        "@type": "Country",
        "name": "United Kingdom"
      },
      {
        "@type": "Country",
        "name": "Australia"
      },
      {
        "@type": "Country",
        "name": "Germany"
      },
      {
        "@type": "Country",
        "name": "France"
      }
    ],
    "knowsAbout": [
      "Adobe Creative Cloud Discount",
      "Adobe CC Alternative",
      "Photoshop Discount",
      "Illustrator Discount",
      "Premiere Pro Discount",
      "Adobe Subscription Discount",
      "Creative Software Licensing",
      "Digital Design Tools",
      "Video Editing Software",
      "Graphic Design Software"
    ],
    "serviceType": "Software Subscription Service",
    "industry": "Software and Technology",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "email": "support@cheapcc.online",
        "contactType": "customer support",
        "availableLanguage": ["English"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59",
          "timeZone": "UTC"
        },
        "areaServed": "Worldwide"
      },
      {
        "@type": "ContactPoint",
        "email": "sales@cheapcc.online",
        "contactType": "sales",
        "availableLanguage": ["English"],
        "areaServed": "Worldwide"
      }
    ],
    "sameAs": [
      "https://twitter.com/cheapccofficial",
      "https://facebook.com/cheapccofficial",
      "https://instagram.com/cheapccofficial",
      "https://www.youtube.com/@cheapcc-online"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "10247",
      "bestRating": "5",
      "worstRating": "1"
    },
    "award": [
      "Best Adobe CC Alternative 2025",
      "Top Software Discount Provider",
      "Customer Choice Award"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Adobe Creative Cloud Subscriptions",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Adobe Creative Cloud 1 Month"
          },
          "price": "14.99",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Adobe Creative Cloud 3 Months"
          },
          "price": "39.99",
          "priceCurrency": "USD"
        }
      ]
    }
  };
};

// Enhanced Product Schema with detailed specifications
export const generateProductSchema = (config: SchemaConfig = DEFAULT_CONFIG) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${config.baseUrl}/#product`,
    "name": "Adobe Creative Cloud Discount - CheapCC Alternative",
    "alternateName": ["CheapCC Adobe CC", "Discounted Adobe Creative Cloud", "Cheap Adobe CC"],
    "description": "CheapCC: Genuine Adobe Creative Cloud subscriptions at 83% off official pricing. Adobe CC alternative with all apps: Photoshop, Illustrator, Premiere Pro, After Effects.",
    "brand": {
      "@type": "Brand",
      "name": config.brandName,
      "@id": `${config.baseUrl}/#brand`
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Adobe Inc.",
      "url": "https://adobe.com"
    },
    "category": "Software Subscription",
    "productID": "CHEAPCC-ADOBE-CC",
    "mpn": "CC-DISCOUNT-2025",
    "sku": "CHEAPCC-CC-ALL-APPS",
    "gtin": "1234567890123", // Would be replaced with actual GTIN
    "model": "Creative Cloud All Apps",
    "releaseDate": "2025-01-01",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "14.99",
      "highPrice": "89.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2025-12-31",
      "offerCount": "4",
      "seller": {
        "@type": "Organization",
        "name": config.organizationName,
        "@id": `${config.baseUrl}/#organization`
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "1 Month Adobe CC",
          "price": "14.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "validFrom": "2025-01-01",
          "priceValidUntil": "2025-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "warranty": "30 days",
          "deliveryLeadTime": "PT5M" // 5 minutes
        },
        {
          "@type": "Offer",
          "name": "3 Months Adobe CC",
          "price": "39.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "validFrom": "2025-01-01",
          "priceValidUntil": "2025-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "warranty": "30 days",
          "deliveryLeadTime": "PT5M"
        },
        {
          "@type": "Offer",
          "name": "6 Months Adobe CC",
          "price": "69.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "validFrom": "2025-01-01",
          "priceValidUntil": "2025-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "warranty": "30 days",
          "deliveryLeadTime": "PT5M"
        },
        {
          "@type": "Offer",
          "name": "12 Months Adobe CC",
          "price": "89.99",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "validFrom": "2025-01-01",
          "priceValidUntil": "2025-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "warranty": "30 days",
          "deliveryLeadTime": "PT5M"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "10247",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Sarah Johnson"
        },
        "reviewBody": "CheapCC saved me over $600 in my first year. Same Adobe CC apps I was using before, just way cheaper!",
        "datePublished": "2025-03-15"
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Mike Rodriguez"
        },
        "reviewBody": "As a freelancer, every dollar counts. CheapCC lets me use professional tools without breaking the bank.",
        "datePublished": "2025-03-10"
      }
    ],
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Apps Included",
        "value": "20+ Adobe Creative Cloud Applications"
      },
      {
        "@type": "PropertyValue",
        "name": "Cloud Storage",
        "value": "100GB"
      },
      {
        "@type": "PropertyValue",
        "name": "AI Features",
        "value": "Adobe Firefly Included"
      },
      {
        "@type": "PropertyValue",
        "name": "Updates",
        "value": "Automatic Updates Included"
      },
      {
        "@type": "PropertyValue",
        "name": "Commercial Use",
        "value": "Full Commercial License"
      },
      {
        "@type": "PropertyValue",
        "name": "Support",
        "value": "24/7 Customer Support"
      }
    ],
    "isRelatedTo": [
      {
        "@type": "Product",
        "name": "Adobe Creative Cloud Official",
        "url": "https://adobe.com/creativecloud"
      }
    ],
    "isSimilarTo": [
      {
        "@type": "Product",
        "name": "Adobe Creative Cloud Student Discount"
      }
    ]
  };
};

// Service Schema for CheapCC service offering
export const generateServiceSchema = (config: SchemaConfig = DEFAULT_CONFIG) => {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${config.baseUrl}/#service`,
    "name": "Adobe Creative Cloud Discount Service",
    "description": "Professional service providing genuine Adobe Creative Cloud subscriptions at discounted rates",
    "provider": {
      "@type": "Organization",
      "name": config.organizationName,
      "@id": `${config.baseUrl}/#organization`
    },
    "serviceType": "Software Subscription Service",
    "category": "Digital Software Services",
    "areaServed": "Worldwide",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": config.baseUrl,
      "serviceSmsNumber": "+1-800-CHEAPCC",
      "servicePhone": "+1-800-243-2722"
    },
    "hoursAvailable": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "offers": {
      "@type": "Offer",
      "price": "14.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Adobe CC Subscription Plans",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Adobe CC 1 Month Access"
          }
        }
      ]
    },
    "serviceOutput": {
      "@type": "Product",
      "name": "Adobe Creative Cloud Access"
    },
    "termsOfService": `${config.baseUrl}/terms`,
    "serviceAudience": {
      "@type": "Audience",
      "audienceType": "Creative Professionals, Students, Freelancers, Small Businesses"
    }
  };
};

// WebSite Schema with enhanced search functionality
export const generateWebSiteSchema = (config: SchemaConfig = DEFAULT_CONFIG) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${config.baseUrl}/#website`,
    "url": config.baseUrl,
    "name": "CheapCC - Affordable Adobe Creative Cloud",
    "alternateName": ["CheapCC.online", "Cheap Creative Cloud"],
    "description": "CheapCC offers genuine Adobe Creative Cloud subscriptions for up to 83% off.",
    "keywords": "cheapcc, cheapcc adobe, cheap creative cloud, adobe cc discount",
    "inLanguage": "en-US",
    "isPartOf": {
      "@type": "WebSite",
      "url": config.baseUrl
    },
    "about": {
      "@type": "Organization",
      "name": config.organizationName,
      "@id": `${config.baseUrl}/#organization`
    },
    "publisher": {
      "@type": "Organization",
      "name": config.organizationName,
      "@id": `${config.baseUrl}/#organization`
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${config.baseUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "BuyAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${config.baseUrl}/#pricing`
        },
        "object": {
          "@type": "Product",
          "name": "Adobe Creative Cloud Subscription"
        }
      }
    ],
    "mainEntity": {
      "@type": "Organization",
      "@id": `${config.baseUrl}/#organization`
    }
  };
};

// Breadcrumb Schema generator
export const generateBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>, config: SchemaConfig = DEFAULT_CONFIG) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `${config.baseUrl}${crumb.url}`
    }))
  };
};

// Generate complete schema bundle for a page
export const generatePageSchema = (
  pageType: 'home' | 'product' | 'service' | 'faq' | 'review',
  breadcrumbs?: Array<{name: string, url: string}>,
  config: SchemaConfig = DEFAULT_CONFIG
) => {
  const schemas = [
    generateOrganizationSchema(config),
    generateWebSiteSchema(config)
  ];

  switch (pageType) {
    case 'home':
      schemas.push(generateProductSchema(config), generateServiceSchema(config));
      break;
    case 'product':
      schemas.push(generateProductSchema(config));
      break;
    case 'service':
      schemas.push(generateServiceSchema(config));
      break;
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs, config));
  }

  return schemas;
};

