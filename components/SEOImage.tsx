'use client';
import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface SEOImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  responsiveSize?: 'small' | 'medium' | 'large' | 'full';
}

/**
 * SEOImage - An optimized image component with loading state, fallback, and improved accessibility
 * 
 * @param {string} src - Image source
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} alt - Required accessible alt text
 * @param {string} fallbackSrc - Optional fallback image if main image fails to load
 * @param {string} responsiveSize - Predefined size configurations for different use cases
 */
export default function SEOImage({ 
  src, 
  alt, 
  width, 
  height, 
  fallbackSrc = '/blog-images/placeholder.jpg',
  priority = false, 
  className = '', 
  quality = 80,
  responsiveSize = 'medium',
  sizes,
  ...props 
}: SEOImageProps) {
  const [imgSrc, setImgSrc] = useState<string | StaticImport>(src);
  const [isLoading, setIsLoading] = useState(!priority);
  
  // Define responsive sizes based on common use cases with improved values for different breakpoints
  const sizeConfigs = {
    small: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
    medium: '(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw',
    large: '(max-width: 768px) 100vw, (max-width: 1280px) 85vw, 75vw',
    full: '100vw'
  };
  
  // Use provided sizes or fall back to predefined size configuration
  const imgSizes = sizes || sizeConfigs[responsiveSize];

  // Handle image load failures by switching to fallback image
  const handleError = () => {
    console.warn(`Image failed to load: ${imgSrc}. Using fallback image.`);
    setImgSrc(fallbackSrc);
  };

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Generate placeholder blur data (dark blue background)
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyMDIwM2MiLz48L3N2Zz4=';

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md overflow-hidden"
          aria-hidden="true"
          style={{ 
            width: typeof width === 'number' ? width : '100%', 
            height: typeof height === 'number' ? height : '100%' 
          }}
        />
      )}
      <Image
        src={imgSrc}
        alt={alt} // Alt text is required for accessibility
        width={width}
        height={height}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onError={handleError}
        onLoad={handleLoad}
        quality={quality}
        sizes={imgSizes}
        placeholder={priority ? undefined : "blur"}
        blurDataURL={blurDataURL}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 rounded-md ${className}`}
        {...props}
      />
    </div>
  );
} 