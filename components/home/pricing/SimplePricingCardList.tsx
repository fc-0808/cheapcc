'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { PricingOption, getPriceForActivationType } from '@/utils/products';
import { isRedemptionCode, getAdobeProductLine } from '@/utils/pricing-utils';
import { useInternationalization } from '@/contexts/InternationalizationContext';

interface SimplePricingCardListProps {
  pricingOptions: PricingOption[];
  selectedPrice: string;
  onSelectPrice: (priceId: string) => void;
  selectedActivationType?: 'pre-activated' | 'email-activation';
}

// Re-usable Card Component
const PricingCard = ({ option, selectedPrice, hoveredCardId, onSelectPrice, setHoveredCardId }: {
  option: PricingOption;
  selectedPrice: string;
  hoveredCardId: string | null;
  onSelectPrice: (priceId: string) => void;
  setHoveredCardId: (id: string | null) => void;
}) => {
  const { formatLocalPrice } = useInternationalization();
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 70, damping: 15, mass: 1 } }
  };

  return (
    <motion.div
      key={option.id}
      className="relative mt-4 pt-4 overflow-visible"
      onMouseEnter={() => setHoveredCardId(option.id)}
      onMouseLeave={() => setHoveredCardId(null)}
      variants={cardVariants}
    >
      <motion.div
        data-id={option.id}
        className={`w-[220px] min-h-[420px] rounded-xl p-6 flex-shrink-0 flex flex-col cursor-pointer scroll-snap-align-start relative ${
          selectedPrice === option.id
            ? 'bg-gradient-to-br from-[rgba(217,70,239,0.25)] to-[rgba(225,29,72,0.25)] border border-[rgba(226,51,102,0.5)] card-highlight'
            : 'bg-[rgba(30,30,50,0.45)] border border-[rgba(255,255,255,0.12)]'
        }`}
        onClick={() => onSelectPrice(option.id)}
        animate={{
          y: hoveredCardId === option.id ? -4 : 0,
          boxShadow: hoveredCardId === option.id ? "0 8px 20px rgba(0, 0, 0, 0.15)" : "none",
          zIndex: hoveredCardId === option.id ? 5 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {isRedemptionCode(option) && (
            <div className="absolute top-0 left-0 z-10" style={{ transform: "translate(-4px, -4px)" }}>
                <div className={`px-3 py-1.5 text-white text-xs font-bold rounded-tl-lg rounded-br-lg shadow-lg ${getAdobeProductLine(option) === 'acrobat_pro' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
                    {getAdobeProductLine(option) === 'acrobat_pro' ? 'ACROBAT CODE' : 'CC CODE'}
                </div>
            </div>
        )}
        <div className="text-gray-200 text-base font-medium mb-3 text-center">{option.duration}</div>
        <div className="text-center mb-4 relative">
          {option.originalPrice && <div className="text-gray-400 text-sm line-through opacity-80 mb-1">{formatLocalPrice(option.originalPrice)}</div>}
          <div className="text-3xl font-bold text-white">{formatLocalPrice(getPriceForActivationType(option))}</div>
          {option.originalPrice && (
            <div className="absolute -right-2 -top-1 transform rotate-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
                {Math.round((1 - getPriceForActivationType(option) / option.originalPrice) * 100)}% OFF
              </div>
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="text-gray-300 text-sm space-y-3 mb-8">
            {isRedemptionCode(option) ? (
              <>
                <div className="flex items-center"><i className="fas fa-ticket-alt w-5 text-center mr-3"></i><span>Digital Code Delivery</span></div>
                <div className="flex items-center"><i className="fas fa-globe w-5 text-center mr-3"></i><span>Redeem on Adobe.com</span></div>
                {getAdobeProductLine(option) === 'creative_cloud' && <div className="flex items-center"><i className="fas fa-check w-5 text-center mr-3"></i><span>All Adobe Apps</span></div>}
              </>
            ) : (
              <>
                <div className="flex items-center"><i className="fas fa-check w-5 text-center mr-3"></i><span>All Adobe Apps</span></div>
                <div className="flex items-center"><i className="fas fa-robot w-5 text-center mr-3"></i><span>All AI features</span></div>
              </>
            )}
            {!(isRedemptionCode(option) && getAdobeProductLine(option) === 'acrobat_pro') && <div className="flex items-center"><i className="fas fa-cloud w-5 text-center mr-3"></i><span>100GB Cloud</span></div>}
          </div>
        </div>
        <motion.button
            className={`w-full py-2.5 rounded-md font-semibold transition-all duration-300 ${ selectedPrice === option.id ? 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-600 text-white' : hoveredCardId === option.id ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' : 'bg-white/10 text-white'}`}
            onClick={(e) => { e.stopPropagation(); onSelectPrice(option.id); }}
        >
            {selectedPrice === option.id ? 'Selected' : 'Select'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Re-usable Card Scroller Component
const CardScroller = ({ options, selectedPrice, hoveredCardId, onSelectPrice, setHoveredCardId }: {
  options: PricingOption[];
  selectedPrice: string;
  hoveredCardId: string | null;
  onSelectPrice: (id: string) => void;
  setHoveredCardId: (id: string | null) => void;
}) => (
  <div
    className="flex overflow-x-auto gap-6 md:gap-8 justify-start lg:justify-center pt-4 pb-8 px-4 sm:px-8 md:px-12 lg:px-16 scroll-smooth hide-scrollbar mx-auto"
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x proximity' }}
  >
    <div className="w-16 sm:w-24 md:w-36 lg:w-48 xl:w-64 flex-shrink-0"></div>
    {options.map((option) => (
      <PricingCard
        key={option.id}
        option={option}
        selectedPrice={selectedPrice}
        hoveredCardId={hoveredCardId}
        onSelectPrice={onSelectPrice}
        setHoveredCardId={setHoveredCardId}
      />
    ))}
    <div className="w-16 sm:w-24 md:w-36 lg:w-48 xl:w-64 flex-shrink-0"></div>
  </div>
);

export default function SimplePricingCardList({ pricingOptions, selectedPrice, onSelectPrice, selectedActivationType = 'pre-activated' }: SimplePricingCardListProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px 0px -100px 0px", amount: 0.2 });
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const subscriptionOptions = pricingOptions.filter(
    (p: PricingOption) => p.productType !== 'redemption_code' && p.activationType === selectedActivationType
  );
  const ccCodeOptions = pricingOptions.filter(
    (p: PricingOption) => p.productType === 'redemption_code' && p.adobeProductLine === 'creative_cloud'
  );
  const acrobatCodeOptions = pricingOptions.filter(
    (p: PricingOption) => p.productType === 'redemption_code' && p.adobeProductLine === 'acrobat_pro'
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  return (
    <div className="w-full max-w-full" ref={sectionRef}>
      <motion.div
        key={selectedActivationType}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* === RENDER SUBSCRIPTIONS (only if they exist) === */}
        {subscriptionOptions.length > 0 && (
          <CardScroller options={subscriptionOptions} selectedPrice={selectedPrice} hoveredCardId={hoveredCardId} onSelectPrice={onSelectPrice} setHoveredCardId={setHoveredCardId} />
        )}

        {/* === RENDER CREATIVE CLOUD CODES (only if they exist) === */}
        {ccCodeOptions.length > 0 && (
          <CardScroller options={ccCodeOptions} selectedPrice={selectedPrice} hoveredCardId={hoveredCardId} onSelectPrice={onSelectPrice} setHoveredCardId={setHoveredCardId} />
        )}

        {/* === RENDER ACROBAT PRO CODES (only if they exist) === */}
        {acrobatCodeOptions.length > 0 && (
          <CardScroller options={acrobatCodeOptions} selectedPrice={selectedPrice} hoveredCardId={hoveredCardId} onSelectPrice={onSelectPrice} setHoveredCardId={setHoveredCardId} />
        )}
      </motion.div>
    </div>
  );
}