// utils/products-supabase.ts
// Simple Supabase direct fetch system

import { createClient } from '@/utils/supabase/supabase-client';

export interface PricingOption {
  id: string;
  name: string;
  originalName: string;
  duration: string;
  price: number;
  originalPrice?: number;
  description: string;
  activationType: 'pre-activated' | 'self-activation' | 'redemption-required';
  productType: 'subscription' | 'redemption_code';
  adobeProductLine: 'creative_cloud' | 'acrobat_pro';
  productId: string;
  durationMonths: number;
}

// Cache for pricing options
let pricingCache: PricingOption[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch pricing options directly from Supabase
 */
export async function fetchPricingOptionsFromSupabase(): Promise<PricingOption[]> {
  try {
    console.log('Fetching pricing options from Supabase...');
    const supabase = createClient();
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, duration_months, base_price, original_price, product_type, adobe_product_line')
      .eq('is_active', true)
      .order('adobe_product_line', { ascending: true })
      .order('product_type', { ascending: true })
      .order('duration_months', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    if (!products || products.length === 0) {
      console.warn('No products found in database');
      return [];
    }

    // Transform database products into frontend format
    const pricingOptions: PricingOption[] = products.map((product: any) => {
      // Generate price ID based on product properties
      let priceId: string;
      
      if (product.product_type === 'redemption_code') {
        if (product.adobe_product_line === 'acrobat_pro') {
          priceId = `acrobat-code-${product.duration_months}m`;
        } else {
          priceId = `cc-code-${product.duration_months}m`;
        }
      } else {
        // For subscriptions, check if it's self-activation based on name
        const isSelfActivation = product.name.includes('(Email Activation)');
        priceId = isSelfActivation ? `${product.duration_months}m-self` : `${product.duration_months}m`;
      }

      // Generate duration string
      const durationString = product.duration_months === 1 ? '1 month' : `${product.duration_months} months`;

      return {
        id: priceId,
        name: product.name.replace('Adobe Creative Cloud - ', '').replace('Adobe Acrobat Pro - ', ''),
        originalName: product.name,
        duration: durationString,
        price: parseFloat(product.base_price),
        originalPrice: parseFloat(product.original_price || '0'),
        description: product.description,
        activationType: product.product_type === 'redemption_code' ? 'redemption-required' : 
                       (product.name.includes('(Email Activation)') ? 'self-activation' : 'pre-activated'),
        productType: product.product_type,
        adobeProductLine: product.adobe_product_line,
        productId: product.id,
        durationMonths: product.duration_months
      };
    });

    console.log('Successfully fetched pricing options from Supabase:', pricingOptions.length, 'options');
    return pricingOptions;
    
  } catch (error) {
    console.error('Failed to fetch pricing options from Supabase:', error);
    throw error;
  }
}

/**
 * Get pricing options with caching
 */
export async function getPricingOptions(): Promise<PricingOption[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (pricingCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Returning cached pricing options');
    return pricingCache;
  }

  try {
    // Fetch fresh data from Supabase
    pricingCache = await fetchPricingOptionsFromSupabase();
    cacheTimestamp = now;
    return pricingCache;
  } catch (error) {
    console.error('Failed to fetch pricing options:', error);
    
    // Return cached data even if expired, as fallback
    if (pricingCache) {
      console.log('Using expired cache due to fetch error');
      return pricingCache;
    }
    
    // If no cache available, return empty array
    console.warn('No cached data available, returning empty array');
    return [];
  }
}

/**
 * Get a specific pricing option by ID
 */
export async function getPricingOptionById(id: string): Promise<PricingOption | null> {
  const options = await getPricingOptions();
  return options.find(option => option.id === id) || null;
}

/**
 * Clear the pricing cache
 */
export function clearPricingCache(): void {
  pricingCache = null;
  cacheTimestamp = 0;
}

// Utility functions
export function getPriceForActivationType(option: PricingOption | null | undefined): number {
  if (!option) return 0;
  return option.price;
}

export function isRedemptionCode(option: PricingOption | null | undefined): boolean {
  if (!option) return false;
  return option.productType === 'redemption_code';
}

export function getProductType(option: PricingOption | null | undefined): string {
  if (!option) return 'creative_cloud';
  return option.productType;
}

export function getAdobeProductLine(option: PricingOption | null | undefined): string {
  if (!option) return 'creative_cloud';
  return option.adobeProductLine;
}

export function isSelfActivationSubscription(option: PricingOption | null | undefined): boolean {
  if (!option) return false;
  return option.productType === 'subscription' && option.activationType === 'self-activation';
}

export async function getActivationFee(priceId: string): Promise<number> {
  // Calculate activation fee based on the difference between email activation and pre-activated prices
  const emailActivationOption = await getPricingOptionById(priceId);
  if (!emailActivationOption || emailActivationOption.activationType !== 'self-activation') {
    return 0;
  }

  // Find the corresponding pre-activated option
  const baseId = priceId.replace('-self', ''); // Convert '1m-self' to '1m'
  const preActivatedOption = await getPricingOptionById(baseId);
  
  if (!preActivatedOption || preActivatedOption.activationType !== 'pre-activated') {
    return 0;
  }

  // Calculate the difference
  const activationFee = emailActivationOption.price - preActivatedOption.price;
  return Math.max(0, activationFee); // Ensure non-negative
}

export async function getPlanDuration(order: any): Promise<string> {
  const option = await getPricingOptionById(order.priceId);
  if (!option) return 'Unknown';
  return option.duration;
}

export async function getStandardPlanDescription(order: any): Promise<string> {
  const option = await getPricingOptionById(order.priceId);
  if (!option) return 'Unknown Plan';
  return option.description;
}

export async function calculateSavings(order: any): Promise<number> {
  const option = await getPricingOptionById(order.priceId);
  if (!option || !option.originalPrice) return 0;
  return option.originalPrice - option.price;
}

export async function calculateExpiryDate(order: any): Promise<Date | null> {
  const option = await getPricingOptionById(order.priceId);
  if (!option) return null;
  
  const now = new Date();
  const expiryDate = new Date(now.getTime() + (option.durationMonths * 30 * 24 * 60 * 60 * 1000));
  return expiryDate;
}

export async function isActiveSubscription(order: any): Promise<boolean> {
  const option = await getPricingOptionById(order.priceId);
  if (!option) return false;
  return option.productType === 'subscription';
}

export function getRedemptionInstructions(option: PricingOption | null | undefined): string {
  if (!option) return '';
  if (option.productType === 'redemption_code') {
    return 'Redeem at redeem.adobe.com';
  }
  return '';
}

export function getActivationTypeForProduct(option: PricingOption | null | undefined, requestedType?: string): string {
  if (!option) return 'pre-activated';
  
  // For redemption codes, always return redemption-required
  if (option.productType === 'redemption_code') {
    return 'redemption-required';
  }
  
  // For subscriptions, use the option's activation type or the requested type
  return option.activationType || requestedType || 'pre-activated';
}

export function getProductIdFromPriceId(priceId: string): string | null {
  return PRICE_ID_TO_PRODUCT_ID_MAP[priceId] || null;
}

export function getStatusForProduct(option: PricingOption | null | undefined): string {
  if (!option) return 'ACTIVE';
  
  // For subscriptions, status is typically ACTIVE
  if (option.productType === 'subscription') {
    return 'ACTIVE';
  }
  
  // For redemption codes, status is COMPLETED (since they need to be redeemed)
  return 'COMPLETED';
}

// Type definition for order-like objects
export interface OrderLike {
  priceId: string;
  [key: string]: any;
}

// Price ID to Product ID mapping
export const PRICE_ID_TO_PRODUCT_ID_MAP: Record<string, string> = {
  '1m': '347bbb04-3f39-4a49-8ab6-cc2518673c65',
  '3m': '101ec822-4d33-4504-b932-568b82c48f25',
  '6m': 'ce3c3c59-499a-44e1-851e-98edfe95944e',
  '12m': '21056281-4310-4a4a-bea0-0b7bcea420f0',
  '1m-self': '0850d34b-630a-4c6e-ab2f-c3b0b2ffb940',
  '3m-self': 'edffec5c-d6b5-4bf6-8f05-304bef3ca26f',
  '6m-self': '51d85540-844e-44a0-b7c2-a3746165e525',
  '12m-self': 'b2f439b5-e679-4348-9eef-4d03fdd9e32b',
  'cc-code-1m': 'c1cfed9d-565d-49d2-a740-b40300a01c99',
  'cc-code-3m': '2d762c8b-6d0e-4e8e-9f8c-7b2979736030',
  'cc-code-6m': 'd54971fe-f8c8-485d-a905-fa74b550d6b1',
  'cc-code-12m': '7ea7daad-d68f-4d99-879f-9b1500005b93',
  'acrobat-code-1m': '7b0d0979-8ecc-4c7d-b488-eea4c7e8d9bb',
  'acrobat-code-3m': '5a44151e-fe50-4379-b540-b8e6dddac078',
  'acrobat-code-6m': '3cac15fe-0539-4015-91e0-a521c2518d72',
  'acrobat-code-12m': 'a0f98489-9143-4527-a78b-f9eddb02bf97'
};
