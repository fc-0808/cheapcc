import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ComparisonData, determineValueWinner } from '@/lib/comparisons';
import PriceComparisonTable from './PriceComparisonTable';
import FeatureComparisonGrid from './FeatureComparisonGrid';

interface ComparisonPageTemplateProps {
  comparison: ComparisonData;
}

export default function ComparisonPageTemplate({ comparison }: ComparisonPageTemplateProps) {
  const {
    title,
    adobeProduct,
    alternativeProduct,
    summary,
    introduction,
    features,
    interfaceComparison,
    ecosystem,
    professionalUsage,
    conclusion,
    faqs
  } = comparison;

  const overallWinner = determineValueWinner(
    adobeProduct.pricing,
    adobeProduct.cheapCCPricing!,
    alternativeProduct.pricing,
    features
  );

  return (
    <div className="max-w-4xl mx-auto text-white">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">{title}</h1>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row items-center mb-4">
            <div className="flex-1 text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-xl font-semibold mb-2 text-white">Quick Comparison Summary</h2>
              <p className="text-white/80">{summary}</p>
            </div>
            <div className="flex justify-center md:justify-end space-x-8">
              {adobeProduct.imageUrl && (
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2 p-1">
                    <Image 
                      src={adobeProduct.imageUrl} 
                      alt={adobeProduct.name} 
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{adobeProduct.name}</span>
                </div>
              )}
              {alternativeProduct.imageUrl && (
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2 p-1">
                    <Image 
                      src={alternativeProduct.imageUrl} 
                      alt={alternativeProduct.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{alternativeProduct.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium text-white/70">Best Overall Value:</span>
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-pink-500/20 text-pink-300">
                {overallWinner === 'cheapcc' 
                  ? `${adobeProduct.name} via CheapCC` 
                  : overallWinner === 'adobe' 
                    ? adobeProduct.name 
                    : alternativeProduct.name
                }
              </span>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Get Adobe CC at Discount
            </Link>
          </div>
        </div>
        
        {/* Table of Contents */}
        <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-3 text-white">Contents</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <li>
              <a href="#introduction" className="text-pink-400 hover:text-pink-300 hover:underline">Introduction</a>
            </li>
            <li>
              <a href="#price-comparison" className="text-pink-400 hover:text-pink-300 hover:underline">Price Comparison</a>
            </li>
            <li>
              <a href="#feature-comparison" className="text-pink-400 hover:text-pink-300 hover:underline">Feature Comparison</a>
            </li>
            <li>
              <a href="#interface-comparison" className="text-pink-400 hover:text-pink-300 hover:underline">UI & Learning Curve</a>
            </li>
            <li>
              <a href="#ecosystem" className="text-pink-400 hover:text-pink-300 hover:underline">Ecosystem & Integration</a>
            </li>
            <li>
              <a href="#professional-usage" className="text-pink-400 hover:text-pink-300 hover:underline">Professional Usage</a>
            </li>
            <li>
              <a href="#conclusion" className="text-pink-400 hover:text-pink-300 hover:underline">Conclusion</a>
            </li>
            <li>
              <a href="#faqs" className="text-pink-400 hover:text-pink-300 hover:underline">FAQs</a>
            </li>
          </ul>
        </div>
      </header>

      {/* Introduction */}
      <section id="introduction" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Introduction</h2>
        <div className="prose prose-invert max-w-none text-white/80">
          <div dangerouslySetInnerHTML={{ __html: introduction }} />
        </div>
      </section>

      {/* Price Comparison */}
      <section id="price-comparison" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Price Comparison</h2>
        <PriceComparisonTable 
          adobeProduct={adobeProduct.name}
          alternativeProduct={alternativeProduct.name}
          adobePricing={adobeProduct.pricing}
          cheapCCPricing={adobeProduct.cheapCCPricing!}
          alternativePricing={alternativeProduct.pricing}
        />
      </section>

      {/* Feature Comparison */}
      <section id="feature-comparison" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Feature Comparison</h2>
        <FeatureComparisonGrid 
          adobeProduct={adobeProduct.name}
          alternativeProduct={alternativeProduct.name}
          features={features}
        />
      </section>

      {/* Interface Comparison */}
      <section id="interface-comparison" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">UI & Learning Curve</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-white">{adobeProduct.name} Interface</h3>
            {interfaceComparison.adobeUiScreenshot && (
              <div className="mb-4 relative h-60 w-full p-4">
                <Image 
                  src={interfaceComparison.adobeUiScreenshot}
                  alt={`${adobeProduct.name} Interface`}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            )}
            <p className="mb-4 text-white/80">{interfaceComparison.adobeDescription}</p>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 text-white/80">Learning Curve:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= interfaceComparison.learningCurveAdobe ? 'text-yellow-400' : 'text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-white/60">
                  ({interfaceComparison.learningCurveAdobe}/5)
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3 text-white">{alternativeProduct.name} Interface</h3>
            {interfaceComparison.alternativeUiScreenshot && (
              <div className="mb-4 relative h-60 w-full p-4">
                <Image 
                  src={interfaceComparison.alternativeUiScreenshot}
                  alt={`${alternativeProduct.name} Interface`}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            )}
            <p className="mb-4 text-white/80">{interfaceComparison.alternativeDescription}</p>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2 text-white/80">Learning Curve:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= interfaceComparison.learningCurveAlternative ? 'text-yellow-400' : 'text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-white/60">
                  ({interfaceComparison.learningCurveAlternative}/5)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Ecosystem & Integration</h2>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">Plugin Availability</h3>
              <div className="mb-4">
                <h4 className="font-medium mb-1 text-white">{adobeProduct.name}</h4>
                <p className="text-white/80">{ecosystem.adobePlugins}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-white">{alternativeProduct.name}</h4>
                <p className="text-white/80">{ecosystem.alternativePlugins}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">File Compatibility</h3>
              <p className="text-white/80">{ecosystem.fileCompatibility}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-white">Industry Standard Status</h3>
            <p className="text-white/80">{ecosystem.industryStandard}</p>
          </div>
        </div>
      </section>

      {/* Professional Usage */}
      <section id="professional-usage" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Professional Usage</h2>
        
        {/* Professional Quotes */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white">What Professionals Say</h3>
          <div className="grid grid-cols-1 gap-4">
            {professionalUsage.quotes.map((quote, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  quote.preference === 'adobe' 
                    ? 'border-blue-500/30 bg-blue-500/10' 
                    : quote.preference === 'alternative'
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <p className="italic mb-2 text-white/90">"{quote.text}"</p>
                <p className="text-sm text-white/70">
                  — {quote.author}{quote.company ? `, ${quote.company}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Real World Usage */}
        <div className="mb-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Real-World Applications</h3>
          <p className="text-white/80">{professionalUsage.realWorldUsage}</p>
        </div>
        
        {/* Job Market Demand */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-white">Job Market Demand</h3>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-white">{adobeProduct.name}</span>
              <span className="text-white">{professionalUsage.jobMarketDemand.adobe}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${professionalUsage.jobMarketDemand.adobe}%` }}
              ></div>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-white">{alternativeProduct.name}</span>
              <span className="text-white">{professionalUsage.jobMarketDemand.alternative}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${professionalUsage.jobMarketDemand.alternative}%` }}
              ></div>
            </div>
          </div>
          <p className="text-white/80">{professionalUsage.jobMarketDemand.description}</p>
        </div>
      </section>

      {/* Conclusion */}
      <section id="conclusion" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Conclusion</h2>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
          <div className="prose prose-invert max-w-none text-white/80">
            <div dangerouslySetInnerHTML={{ __html: conclusion }} />
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Get Adobe CC at Discount
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">{faq.question}</h3>
              <div className="prose prose-invert max-w-none text-white/80">
                <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Back to Comparisons */}
      <div className="text-center mb-8">
        <Link
          href="/compare"
          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/30"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          View All Comparisons
        </Link>
      </div>
    </div>
  );
} 