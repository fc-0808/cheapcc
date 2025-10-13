import { Metadata } from 'next';
import FAQPageContent from '@/components/faq/FAQPageContent';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'CheapCC FAQ - Is CheapCC Legit? Adobe CC Discount Questions Answered',
  description: 'Find answers to common CheapCC questions. Is CheapCC legit? How does CheapCC work? Learn about our Adobe Creative Cloud discount service.',
  keywords: 'cheapcc faq, is cheapcc legit, cheapcc review, cheapcc questions, adobe cc discount faq, cheapcc support',
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
      "name": "Is CheapCC legit and safe to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, CheapCC is a legitimate service with over 10,000 satisfied customers and a 4.8/5 rating. We provide genuine Adobe Creative Cloud subscriptions with secure payment processing and reliable customer support. All accounts are authentic Adobe subscriptions with full functionality."
      }
    },
    {
      "@type": "Question",
      "name": "How does CheapCC offer Adobe CC at such low prices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CheapCC achieves significant savings through volume licensing agreements and strategic partnerships. This allows us to offer genuine Adobe Creative Cloud subscriptions at up to 83% off official Adobe pricing while maintaining the same authentic product quality and features."
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
        "text": "You will receive your Adobe account information within 24 hours after your payment is confirmed. The details will be sent to the email address you provided during checkout. Please check your inbox (including spam/junk folders) for the delivery email."
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
 