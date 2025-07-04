import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { allComparisons } from '@/lib/comparison-data';

export const metadata: Metadata = {
  title: 'Adobe Creative Cloud Software Comparisons',
  description: 'Compare Adobe Creative Cloud software with popular alternatives. Find detailed analyses of features, pricing, and user experience.'
};

export default function ComparisonsIndexPage() {
  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">Adobe Creative Cloud Software Comparisons</h1>
        <p className="text-xl text-white/70 mb-8">
          Comprehensive comparisons between Adobe products and their alternatives to help you make informed decisions.
        </p>
        
        <div className="bg-blue-900/30 p-6 rounded-lg mb-10 border border-white/10">
          <h2 className="text-xl font-semibold mb-2 text-white">Why Our Comparisons Matter</h2>
          <p className="mb-4 text-white/80">
            At CheapCC, we offer unbiased, in-depth comparisons to help you navigate the complex landscape of creative software. Whether you're considering Adobe Creative Cloud or exploring alternatives, our detailed analyses cover pricing, features, user experience, and professional workflows.
          </p>
          <p className="text-white/80">
            <strong className="text-white">Plus:</strong> Learn how CheapCC's discounted Adobe licenses can change the value equation in your decision-making process.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {allComparisons.map((comparison) => (
            <div key={comparison.slug} className="bg-white/5 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border border-white/10">
              {comparison.adobeProduct.imageUrl && (
                <div className="relative h-48 w-full p-4">
                  <Image
                    src={comparison.adobeProduct.imageUrl}
                    alt={comparison.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 text-white">{comparison.title}</h2>
                <p className="text-white/70 mb-4 line-clamp-3">
                  {comparison.summary}
                </p>
                <Link 
                  href={`/compare/${comparison.slug}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Read Comparison
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-white/5 backdrop-blur-sm p-8 rounded-lg border border-white/10">
          <h2 className="text-2xl font-bold mb-4 text-white">Looking for More Comparisons?</h2>
          <p className="mb-6 text-white/80">We're continuously expanding our comparison library. Here are some upcoming comparisons:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2 text-white/80">
            <li>Adobe Illustrator vs. Figma</li>
            <li>Adobe Creative Cloud vs. Affinity Suite</li>
            <li>Adobe InDesign vs. QuarkXPress</li>
            <li>Adobe After Effects vs. Motion</li>
          </ul>
          <p className="text-white/80">
            Want to see a specific comparison? <a href="#" className="text-pink-400 hover:text-pink-300 hover:underline">Let us know</a> and we'll prioritize it.
          </p>
        </div>
      </div>
    </div>
  );
} 