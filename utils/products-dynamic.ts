// utils/products-dynamic.ts

import { PricingOption } from './products';

// Cache for products to avoid repeated API calls
let productsCache: PricingOption[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface ProductApiResponse {
  products: PricingOption[];
  count: number;
}

/**
 * Fetch products from the database via API
 */
export async function fetchProductsFromDatabase(): Promise<PricingOption[]> {
  try {
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable caching for this request to ensure fresh data
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data: ProductApiResponse = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products from database:', error);
    throw error;
  }
}

/**
 * Get products with caching
 */
export async function getProducts(): Promise<PricingOption[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }

  try {
    // Fetch fresh data from database
    productsCache = await fetchProductsFromDatabase();
    cacheTimestamp = now;
    return productsCache;
  } catch (error) {
    console.error('Failed to fetch products, returning cached data if available:', error);
    
    // Return cached data even if expired, as fallback
    if (productsCache) {
      return productsCache;
    }
    
    // If no cache available, throw error
    throw new Error('Unable to fetch products and no cached data available');
  }
}

/**
 * Get a specific product by price ID
 */
export async function getProductByPriceId(priceId: string): Promise<PricingOption | null> {
  const products = await getProducts();
  return products.find(product => product.id === priceId) || null;
}

/**
 * Get products filtered by activation type
 */
export async function getProductsByActivationType(activationType: 'pre-activated' | 'self-activation'): Promise<PricingOption[]> {
  const products = await getProducts();
  return products.filter(product => product.activationType === activationType);
}

/**
 * Get products filtered by product type
 */
export async function getProductsByType(productType: 'subscription' | 'redemption_code'): Promise<PricingOption[]> {
  const products = await getProducts();
  return products.filter(product => product.productType === productType);
}

/**
 * Clear the products cache (useful for testing or forcing refresh)
 */
export function clearProductsCache(): void {
  productsCache = null;
  cacheTimestamp = 0;
}

/**
 * Check if products cache is valid
 */
export function isProductsCacheValid(): boolean {
  const now = Date.now();
  return productsCache !== null && (now - cacheTimestamp) < CACHE_DURATION;
}
