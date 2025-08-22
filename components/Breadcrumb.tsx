'use client';
import Link from 'next/link';
import Script from 'next/script';

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  currentPage: string;
}

export default function Breadcrumb({ items, currentPage }: BreadcrumbProps) {
  const allItems = [
    { name: 'Home', href: '/' },
    ...items,
    { name: currentPage, href: '' }
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.href ? `https://cheapcc.online${item.href}` : undefined
    }))
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-baseline text-sm text-white/80">
            {allItems.map((item, index) => (
              <li key={index} className="flex items-baseline">
                {index > 0 && (
                  <svg
                    className="w-3 h-3 mx-1 text-white/60 flex-shrink-0 self-center"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-white/80 hover:text-white transition-colors duration-200 font-medium inline-block"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-white font-semibold inline-block" aria-current="page">
                    {item.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}

