'use client';

import { useState } from 'react';
import { getCountrySelectorData } from '@/utils/internationalization';
import { useInternationalization } from '@/contexts/InternationalizationContext';

interface CountrySelectorProps {
  className?: string;
  showPricing?: boolean;
}

export default function CountrySelector({ className = '', showPricing = true }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedCountry, localizedContent, setCountry, isLoading } = useInternationalization();
  const countries = getCountrySelectorData();

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode);
    setIsOpen(false);
  };

  const selectedCountryData = countries.find(c => c.code === selectedCountry) || countries[0];

  return (
    <div className={`relative ${className}`}>
      {/* Country Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
        aria-label="Select Country"
      >
        <img 
          src={selectedCountryData.flag} 
          alt={`${selectedCountryData.name} flag`}
          className="w-5 h-4 object-cover rounded-sm"
        />
        <span className="font-medium">{selectedCountryData.code}</span>
        {showPricing && (
          <span className="text-sm text-white/80">
            {selectedCountryData.samplePrice}
          </span>
        )}
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-sm transition-transform`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-3 text-center">
              Select Your Country
            </h3>
            
            {/* Country List */}
            <div className="space-y-1">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedCountry === country.code
                      ? 'bg-blue-500/30 border border-blue-500/50'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <img 
                    src={country.flag} 
                    alt={`${country.name} flag`}
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{country.name}</div>
                    {showPricing && (
                      <div className="text-white/70 text-sm">
                        CheapCC: {country.samplePrice}
                      </div>
                    )}
                  </div>
                  <div className="text-white/60 text-sm">
                    {country.currencySymbol}
                  </div>
                </button>
              ))}
            </div>

            {/* VAT Notice */}
            {localizedContent.vatNotice && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <div className="text-yellow-400 text-sm text-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  {localizedContent.vatNotice}
                </div>
              </div>
            )}

            {/* Pricing Comparison */}
            {showPricing && (
              <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg">
                <h4 className="text-white font-semibold mb-2 text-center">
                  Your Savings in {localizedContent.currency}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>Adobe Official:</span>
                    <span className="line-through">{localizedContent.comparisonPrice.adobe}</span>
                  </div>
                  <div className="flex justify-between text-green-400 font-semibold">
                    <span>CheapCC:</span>
                    <span>{localizedContent.comparisonPrice.cheapcc}</span>
                  </div>
                  <div className="flex justify-between text-blue-400 font-bold border-t border-white/20 pt-2">
                    <span>You Save:</span>
                    <span>{localizedContent.comparisonPrice.savings}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

