export interface ComparisonFeature {
  name: string;
  description: string;
  adobeRating: number;
  alternativeRating: number;
  winner: 'adobe' | 'alternative' | 'tie';
  notes?: string;
}

export interface PricePoint {
  monthly: number;
  annual: number;
  oneTime?: number;
  subscription: boolean;
}

export interface ComparisonData {
  slug: string;
  title: string;
  metaDescription: string;
  adobeProduct: {
    name: string;
    description: string;
    pricing: PricePoint;
    cheapCCPricing?: PricePoint;
    imageUrl?: string;
  };
  alternativeProduct: {
    name: string;
    description: string;
    pricing: PricePoint;
    imageUrl?: string;
  };
  summary: string;
  introduction: string;
  features: ComparisonFeature[];
  interfaceComparison: {
    adobeDescription: string;
    alternativeDescription: string;
    learningCurveAdobe: number;
    learningCurveAlternative: number;
    adobeUiScreenshot?: string;
    alternativeUiScreenshot?: string;
  };
  ecosystem: {
    adobePlugins: string;
    alternativePlugins: string;
    fileCompatibility: string;
    industryStandard: string;
  };
  professionalUsage: {
    quotes: Array<{
      text: string;
      author: string;
      company?: string;
      preference: 'adobe' | 'alternative' | 'neutral';
    }>;
    realWorldUsage: string;
    jobMarketDemand: {
      adobe: number;
      alternative: number;
      description: string;
    };
  };
  conclusion: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

// Helper function to calculate yearly savings
export function calculateYearlySavings(adobePrice: PricePoint, cheapCCPrice?: PricePoint, alternativePrice?: PricePoint): {
  cheapCCSavings: number;
  alternativeSavings: number;
} {
  const adobeYearly = adobePrice.subscription ? adobePrice.annual : adobePrice.oneTime || 0;
  const cheapCCYearly = cheapCCPrice?.subscription ? cheapCCPrice.annual : cheapCCPrice?.oneTime || 0;
  const alternativeYearly = alternativePrice?.subscription ? alternativePrice.annual : alternativePrice?.oneTime || 0;
  
  return {
    cheapCCSavings: adobeYearly - cheapCCYearly,
    alternativeSavings: adobeYearly - alternativeYearly,
  };
}

// Helper function to determine overall value winner
export function determineValueWinner(
  adobePrice: PricePoint, 
  cheapCCPrice: PricePoint, 
  alternativePrice: PricePoint,
  features: ComparisonFeature[]
): 'adobe' | 'cheapcc' | 'alternative' {
  // Count feature wins
  const featureWins = features.reduce(
    (acc, feature) => {
      acc[feature.winner] += 1;
      return acc;
    },
    { adobe: 0, alternative: 0, tie: 0 }
  );
  
  // Calculate price differences
  const { cheapCCSavings, alternativeSavings } = calculateYearlySavings(adobePrice, cheapCCPrice, alternativePrice);
  
  // Simple algorithm: if alternative wins more features and is cheaper, it wins
  // If adobe wins more features but cheapCC offers significant savings, cheapCC wins
  // Otherwise adobe wins
  
  if (featureWins.alternative > featureWins.adobe && alternativeSavings > 0) {
    return 'alternative';
  } else if (featureWins.adobe >= featureWins.alternative && cheapCCSavings > alternativeSavings) {
    return 'cheapcc';
  } else if (featureWins.adobe > featureWins.alternative) {
    return 'adobe';
  } else {
    return 'alternative';
  }
} 