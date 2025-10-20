'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductCategory, categorizeProducts, calculateProductPrice, calculateSavingsPercentage, formatProductDuration, getRedemptionInstructions } from '@/utils/products-v2';
import { useInternationalization } from '@/contexts/InternationalizationContext';

interface ProductCatalogProps {
  onProductSelect: (product: Product) => void;
  selectedProductId?: string;
  className?: string;
}

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
  category: ProductCategory;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isSelected, onSelect, category }) => {
  const price = calculateProductPrice(product);
  const { formatLocalPrice } = useInternationalization();
  const savingsPercentage = calculateSavingsPercentage(product);
  const isRedemptionCode = product.product_type === 'redemption_code';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className={`
        relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'border-fuchsia-500 bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 shadow-lg shadow-fuchsia-500/25' 
          : 'border-white/10 bg-[rgba(17,17,40,0.8)] hover:border-white/20 hover:bg-[rgba(17,17,40,0.9)]'
        }
        backdrop-blur-sm
      `}
      onClick={onSelect}
    >
      {/* Product Type Badge */}
      <div className="absolute -top-3 left-4">
        <div className={`
          px-3 py-1 rounded-full text-xs font-medium
          ${isRedemptionCode 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
          }
        `}>
          {isRedemptionCode ? 'Redemption Code' : 'Subscription'}
        </div>
      </div>

      {/* Savings Badge */}
      {savingsPercentage > 0 && (
        <div className="absolute -top-3 right-4">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            {savingsPercentage}% OFF
          </div>
        </div>
      )}

      {/* Product Icon */}
      <div className="flex items-center mb-4">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center mr-4
          ${product.adobe_product_line === 'creative_cloud' 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
            : 'bg-gradient-to-br from-red-500 to-orange-500'
          }
        `}>
          <i className={`${category.icon} text-white text-xl`}></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {formatProductDuration(product.duration_months)}
          </h3>
          <p className="text-sm text-gray-400">
            {product.adobe_product_line === 'creative_cloud' ? 'Creative Cloud' : 'Acrobat Pro'}
          </p>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-pink-500">
            {formatLocalPrice(price)}
          </span>
          {product.original_price && (
            <span className="text-sm text-gray-500 line-through">
              {formatLocalPrice(product.original_price)}
            </span>
          )}
        </div>
        
        {isRedemptionCode && (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <i className="fas fa-ticket-alt"></i>
            <span>Digital Code Delivery</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-4 line-clamp-2">
        {product.description}
      </p>

      {/* Features */}
      <div className="space-y-2 mb-4">
        {isRedemptionCode ? (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <i className="fas fa-globe text-emerald-400"></i>
              <span>Redeem at redeem.adobe.com</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <i className="fas fa-clock text-blue-400"></i>
              <span>Fast delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <i className="fas fa-shield-alt text-green-400"></i>
              <span>Official Adobe codes</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <i className="fas fa-user-cog text-blue-400"></i>
              <span>Account setup included</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <i className="fas fa-headset text-purple-400"></i>
              <span>24/7 support</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <i className="fas fa-bolt text-yellow-400"></i>
              <span>Quick activation</span>
            </div>
          </>
        )}
      </div>

      {/* Selection Indicator */}
      <div className={`
        absolute bottom-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
        ${isSelected 
          ? 'border-fuchsia-500 bg-fuchsia-500' 
          : 'border-white/30'
        }
      `}>
        {isSelected && (
          <motion.i 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fas fa-check text-white text-xs"
          />
        )}
      </div>
    </motion.div>
  );
};

const CategorySection: React.FC<{
  category: ProductCategory;
  selectedProductId?: string;
  onProductSelect: (product: Product) => void;
}> = ({ category, selectedProductId, onProductSelect }) => {
  if (category.products.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
          <i className={`${category.icon} text-white`}></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{category.name}</h2>
          <p className="text-sm text-gray-400">{category.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            category={category}
            isSelected={selectedProductId === product.id}
            onSelect={() => onProductSelect(product)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default function ProductCatalog({ onProductSelect, selectedProductId, className = "" }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      setCategories(categorizeProducts(products));
    }
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products?active=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Loading products...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">
            <i className="fas fa-exclamation-triangle text-2xl"></i>
          </div>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Adobe Products</h1>
        <p className="text-gray-400">
          Choose from our selection of Adobe Creative Cloud and Acrobat Pro products
        </p>
      </div>

      <AnimatePresence>
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            selectedProductId={selectedProductId}
            onProductSelect={onProductSelect}
          />
        ))}
      </AnimatePresence>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <i className="fas fa-box-open text-4xl"></i>
          </div>
          <p className="text-white">No products available at the moment.</p>
        </div>
      )}
    </div>
  );
}
