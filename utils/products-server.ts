// utils/products-server.ts
// Server-only utility for fetching pricing options directly from database

import { createServiceClient } from './supabase/supabase-server';
import type { PricingOption } from './products';

/**
 * Server-side function to fetch pricing options directly from database
 * This file should only be imported server-side using dynamic imports
 */
export async function fetchPricingOptionsFromDatabase(): Promise<PricingOption[]> {
  const supabase = await createServiceClient();

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('duration_months', { ascending: true });

    if (error) {
      console.error('Error fetching products from DB:', error);
      throw new Error('Failed to fetch products from database');
    }

    const pricingOptions: PricingOption[] = products.map((product: any) => {
      let activationType: 'pre-activated' | 'email-activation' | 'redemption-required' = 'pre-activated';
      if (product.name.includes('(Email Activation)')) {
        activationType = 'email-activation';
      } else if (product.product_type === 'redemption_code') {
        activationType = 'redemption-required'; // Redemption codes require redemption
      }

      return {
        id: product.id, // Use product UUID as the ID
        name: product.name.replace(' (Self-Activation)', '').replace(' Code', ''),
        duration: `${product.duration_months} ${product.duration_months === 1 ? 'month' : 'months'}`,
        price: parseFloat(product.base_price),
        originalPrice: parseFloat(product.original_price || '0'),
        description: product.description,
        activationType: activationType,
        productType: product.product_type,
        adobeProductLine: product.adobe_product_line,
        productId: product.id,
        durationMonths: product.duration_months,
      };
    });

    return pricingOptions;
  } catch (error) {
    console.error('Unexpected error in fetchPricingOptionsFromDatabase:', error);
    throw error;
  }
}
