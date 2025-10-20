'use client';
import Script from 'next/script';
import { useMemo } from 'react';
import { PricingOption } from '@/utils/products';

interface PricingSchemaProps {
  pricingOptions: PricingOption[];
}

export default function PricingSchema({ pricingOptions }: PricingSchemaProps) {
  const productSchema = useMemo(() => {
    try {
      const filteredOptions = pricingOptions.filter(p => !p.adminOnly && p.id !== 'test-live' && p.id !== 'test-payment');
      if (filteredOptions.length === 0) {
        return null;
      }
      const prices = filteredOptions.map(p => p.price);
      const originalPrices = filteredOptions.map(p => p.originalPrice || p.price);
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Adobe Creative Cloud All Apps Subscription",
        "description": "Genuine Adobe Creative Cloud subscriptions at up to 75% off official pricing. Includes all Adobe apps: Photoshop, Illustrator, Premiere Pro, After Effects & more. Fast delivery.",
        "brand": { "@type": "Brand", "name": "Adobe" },
        "image": "https://cheapcc.online/og-image.svg",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "lowPrice": Math.min(...prices),
          "highPrice": Math.max(...prices),
          "offerCount": filteredOptions.length,
          "offers": filteredOptions.map(option => ({
            "@type": "Offer",
            "name": `Adobe Creative Cloud - ${option.duration}`,
            "price": option.price.toFixed(2),
            "priceCurrency": "USD",
            "description": option.description,
            "url": "https://cheapcc.online/#pricing",
            "availability": "https://schema.org/InStock",
            "seller": { "@type": "Organization", "name": "CheapCC" },
            "priceValidUntil": new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
            ...(option.originalPrice ? {
              "priceSpecification": {
                "@type": "PriceSpecification",
                "price": option.originalPrice.toFixed(2),
                "priceCurrency": "USD",
                "valueAddedTaxIncluded": "true"
              }
            } : {})
          }))
        }
      };
    } catch (error) {
      console.error('Error generating product schema:', error);
      return null;
    }
  }, [pricingOptions]);

  if (!productSchema) {
    return null;
  }

  return (
    <Script
      id="product-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
} 