// Pricing utility functions
// NOTE: This file has been consolidated. All functions moved to utils/products.ts
// This file is kept for backward compatibility but will be removed in future versions.

// Re-export functions from products.ts to maintain compatibility
export { 
  isRedemptionCode, 
  getAdobeProductLine, 
  getProductType, 
  getRedemptionInstructions 
} from './products';
