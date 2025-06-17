import { Metadata } from 'next';
import FAQPageContent from '@/components/faq/FAQPageContent';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'FAQ - Your Questions Answered about Cheap Adobe CC',
  description: 'Find answers to common questions about our cheap Adobe Creative Cloud subscriptions. Learn about legitimacy, payment methods, account delivery, and more.',
  keywords: 'cheap adobe creative cloud faq, adobe cc discount questions, is cheapcc legit, adobe subscription support',
  alternates: {
    canonical: '/faq'
  },
};

// FAQs for structured data
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are these genuine Adobe Creative Cloud subscriptions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, absolutely. You will receive genuine Adobe Creative Cloud accounts with full access to all Creative Cloud applications and services. The subscriptions include regular updates, cloud storage, and all the features you would get from purchasing directly from Adobe, but at a much lower price."
      }
    },
    {
      "@type": "Question",
      "name": "How does cheapcc.online offer such low prices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "As an alternative to cheapcc.net, we specialize in offering Adobe Creative Cloud subscriptions at significantly reduced prices. We achieve these savings through volume licensing agreements and strategic partnerships that allow us to pass the savings onto you. This is why we can offer up to 75% off compared to Adobe's official pricing while providing the same authentic product."
      }
    },
    {
      "@type": "Question",
      "name": "Which Adobe apps are included in the subscription?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our subscriptions include the complete Adobe Creative Cloud suite with all apps, including Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Lightroom, Dreamweaver, and many more. You'll have access to the same apps and services as with an official Adobe Creative Cloud All Apps subscription."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly will I receive my Adobe account details?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In most cases, you will receive your Adobe account information immediately after your payment is confirmed. The details will be sent to the email address you provided during checkout. Occasionally, during periods of high demand, delivery may take up to 24 hours, but this is rare."
      }
    },
    {
      "@type": "Question",
      "name": "What payment methods do you accept?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We currently accept payments through PayPal, which allows you to pay using your PayPal balance, linked bank account, or credit/debit card. This ensures your payment information is secure and protected."
      }
    },
    {
      "@type": "Question",
      "name": "What is your refund policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer a 7-day money-back guarantee if you are unable to access the Adobe Creative Cloud services with the credentials provided. If you encounter any issues, please contact our support team at support@cheapcc.online with your order details, and we'll assist you promptly."
      }
    }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://cheapcc.online"
  },{
    "@type": "ListItem",
    "position": 2,
    "name": "FAQ",
    "item": "https://cheapcc.online/faq"
  }]
};

export default function FAQPage() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FAQPageContent />
    </>
  );
}
 