'use client';
import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface SEOImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
}

/**
 * SEOImage - An optimized image component with loading state, fallback, and improved accessibility
 * 
 * @param {string} src - Image source
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} alt - Required accessible alt text
 * @param {string} fallbackSrc - Optional fallback image if main image fails to load
 */
export default function SEOImage({ 
  src, 
  alt, 
  width, 
  height, 
  fallbackSrc = '/image-placeholder.jpg',
  priority = false, 
  className = '', 
  ...props 
}: SEOImageProps) {
  const [imgSrc, setImgSrc] = useState<string | StaticImport>(src);
  const [isLoading, setIsLoading] = useState(!priority);

  // Handle image load failures by switching to fallback image
  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
          style={{ width, height }}
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
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
        {...props}
      />
    </div>
  );
} 