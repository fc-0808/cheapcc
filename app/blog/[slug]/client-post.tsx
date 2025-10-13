'use client';

import Link from 'next/link';
import Script from 'next/script';
import { format } from 'date-fns';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import type { Post } from '@/lib/blog';
import ComparisonTable from '@/components/blog/ComparisonTable';
import SEOImage from '@/components/SEOImage';
import SEOInternalLinks from '@/components/SEOInternalLinks';

interface ClientPostProps {
  postData: Post;
}

export default function ClientPost({ postData }: ClientPostProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [particles, setParticles] = useState<Array<{top: number, left: number, size: number, delay: number}>>([]);
  
  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start start", "end end"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, 50]);
  const headerOpacity = useTransform(scrollYProgress, [0.05, 0.1], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0.05, 0.1], [20, 0]);
  
  // Generate particles for background effect - fewer particles for elegance
  useEffect(() => {
    setParticles(
      Array.from({ length: 10 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.5, // Smaller particles for subtlety
        delay: Math.random() * 2,
      }))
    );
    
    setFormattedDate(format(new Date(postData.date), 'MMMM d, yyyy'));
  }, [postData.date]);

  // Create ArticleLD JSON schema for the blog post
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": postData.title,
    "description": postData.excerpt,
    "image": postData.featuredImage || "https://cheapcc.online/og-image.svg",
    "author": { "@type": "Organization", "name": "CheapCC" },
    "publisher": {
      "@type": "Organization", "name": "CheapCC",
      "logo": { "@type": "ImageObject", "url": "https://cheapcc.online/favicon.svg" }
    },
    "datePublished": postData.date,
    "dateModified": postData.date,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://cheapcc.online/blog/${postData.slug}` }
  };
  
  // Create BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://cheapcc.online"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://cheapcc.online/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": postData.title,
        "item": `https://cheapcc.online/blog/${postData.slug}`
      }
    ]
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ComparisonTable htmlContent={postData.contentHtml} />
      
      {/* Fixed header that appears on scroll */}
      <motion.header
        className="fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-[#0c0c16]/95 to-[#171630]/95 backdrop-blur-md py-2 px-4 border-b border-white/10 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        style={{ opacity: headerOpacity, y: headerY }}
      >
        <div className="container mx-auto flex items-center justify-between">
          <Link 
            href="/blog" 
            prefetch={false} 
            className="inline-flex items-center text-white/70 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Blog
          </Link>
          <div className="text-white/90 font-medium text-sm truncate max-w-[60%]">
            {postData.title}
          </div>
        </div>
      </motion.header>
      
      <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#12131e] to-[#1a1b2e]" ref={articleRef}>
        {/* Background particles */}
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-white opacity-20 pointer-events-none"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.3)`,
            }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
              scale: [0.8, 1.2, 0.8],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Hero section with featured image */}
        {postData.featuredImage ? (
          <motion.div 
            className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden"
            style={{ opacity, scale, y }}
          >
            {/* Enhanced gradient overlay with texture for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#08081a]/50 via-[#08081a]/30 to-[#08081a] z-10"></div>
            
            {/* Abstract shapes for visual interest */}
            <div className="absolute inset-0 z-10 opacity-10">
              <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-pink-500/30 blur-3xl"></div>
              <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
            </div>
            
            {/* Subtle noise texture overlay */}
            <div 
              className="absolute inset-0 z-10 opacity-[0.03] mix-blend-overlay"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px'
              }}
            ></div>
            
            {/* Featured image as background with low opacity duplicate for depth effect */}
            <SEOImage
              src={postData.featuredImage}
              alt={postData.title}
              priority
              fill
              className="object-cover z-0"
              responsiveSize="full"
              quality={90}
            />
            
            {/* Decorative image duplication for depth effect */}
            <div className="absolute inset-0 opacity-30 transform scale-105 blur-md z-0">
              <SEOImage
                src={postData.featuredImage}
                alt={`${postData.title} - Background blur effect`}
                fill
                className="object-cover"
                responsiveSize="full"
                quality={50}
              />
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-20">
              <motion.div 
                className="max-w-4xl w-full text-center space-y-4"
                variants={fadeInVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Redesigned elegant date badge with glass morphism */}
                <motion.div 
                  className="inline-flex items-center px-5 py-2 rounded-full 
                             bg-white/10 backdrop-blur-md border border-white/20 shadow-xl
                             text-sm font-medium mb-6"
                  whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#ff3366]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <time dateTime={postData.date} className="font-serif italic text-white">{formattedDate}</time>
                    
                    {postData.readingTime && (
                      <>
                        <span className="mx-2 text-pink-300 text-lg">•</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-[#ff3366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-white">{postData.readingTime} min read</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
                
                {/* Enhanced title styling with better visual effects */}
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  style={{ 
                    textShadow: "0 4px 20px rgba(0,0,0,0.7)",
                    letterSpacing: "-0.02em",
                    background: "linear-gradient(to right, #ffffff, #f5f5f5)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "transparent"
                  }}
                >
                  {postData.title}
                </motion.h1>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className="relative overflow-hidden mb-10 p-10 rounded-xl bg-gradient-to-br from-[#1a1a3a] via-[#24243e] to-[#202040]">
            {/* Background gradient and effect for fallback title */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a3a] via-[#24243e] to-[#202040] z-0"></div>
            
            {/* Abstract shapes for visual interest */}
            <div className="absolute inset-0 z-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-pink-500/30 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl"></div>
            </div>
            
            {/* Diagonal pattern overlay */}
            <div 
              className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }}
            ></div>

            <div className="relative z-10">
              <motion.div 
                className="mb-4 flex justify-center"
                variants={itemVariants}
              >
                {/* Elegant date badge */}
                <motion.div 
                  className="inline-flex items-center px-5 py-2 rounded-full 
                            bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
                            text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-4 h-4 text-[#ff3366] mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <time dateTime={postData.date} className="font-serif italic text-white">{formattedDate}</time>
                  
                  {postData.readingTime && (
                    <>
                      <span className="mx-2 text-pink-300 text-lg">•</span>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-[#ff3366] mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-white">{postData.readingTime} min read</span>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight text-center"
                style={{ 
                  letterSpacing: "-0.02em",
                  background: "linear-gradient(to right, #ffffff, #f5f5f5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)"
                }}
              >
                {postData.title}
              </motion.h1>
            </div>
          </div>
        )}

        {/* Article breadcrumbs */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <motion.nav
            className="max-w-4xl mx-auto flex items-center text-sm text-white/60 mb-6"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Link href="/" className="hover:text-white/90 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white/90 transition-colors">Blog</Link>
            <span className="mx-2">/</span>
            <span className="truncate max-w-[50%] text-white/90">{postData.title}</span>
          </motion.nav>
        </div>

        {/* Main article content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <motion.article 
            className="max-w-4xl mx-auto rounded-xl overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl overflow-hidden"
              variants={itemVariants}
            >
              <div className="p-6 md:p-10">
                {/* Article content with enhanced styling */}
                <motion.div 
                  className="prose prose-lg prose-dark max-w-none"
                  variants={itemVariants}
                  dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
                />
                
                {/* Enhanced sharing options */}
                <motion.div 
                  className="mt-12 pt-6 border-t border-white/10"
                  variants={itemVariants}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-white/80 font-medium">Share this article</div>
                    <div className="flex items-center space-x-4">
                      <motion.a 
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(postData.title)}&url=${encodeURIComponent(`https://cheapcc.online/blog/${postData.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#1DA1F2] text-white/70 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </motion.a>
                      <motion.a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://cheapcc.online/blog/${postData.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#4267B2] text-white/70 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </motion.a>
                      <motion.a 
                        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://cheapcc.online/blog/${postData.slug}`)}&title=${encodeURIComponent(postData.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-[#0077b5] text-white/70 hover:text-white transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </motion.a>
                    </div>
                  </div>
                </motion.div>
                
                {/* Pricing CTA Section with improved design */}
                <motion.div 
                  className="mt-12 pt-8"
                  variants={itemVariants}
                >
                  <motion.div 
                    className="bg-gradient-to-br from-[#0f111a]/80 via-[#131626]/80 to-[#15162a]/80 rounded-xl p-8 border border-white/10 shadow-lg relative overflow-hidden backdrop-blur-lg"
                    whileHover={{ scale: 1.01, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Elegant decorative elements */}
                    <motion.div 
                      className="absolute -top-10 -right-10 w-40 h-40 bg-[#ff3366]/10 rounded-full blur-3xl"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#7e22ce]/10 rounded-full blur-3xl"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
                      <div>
                        <motion.span 
                          className="inline-block px-3 py-1 bg-gradient-to-r from-[#ff3366]/20 to-[#ff6b8b]/20 text-[#ff3366] text-xs font-semibold rounded-full mb-3 border border-[#ff3366]/20"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          EXCLUSIVE OFFER
                        </motion.span>
                        <motion.h3 
                          className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          Ready to save on Adobe Creative Cloud?
                        </motion.h3>
                        <motion.p 
                          className="text-white/70 mb-4 sm:mb-0 max-w-md text-base leading-relaxed"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          Get the complete Adobe suite with all premium features for up to <span className="font-semibold text-white">75% off</span> official prices
                        </motion.p>
                      </div>
                      <div className="flex-shrink-0">
                        <motion.div
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <Link 
                            href="/#pricing" 
                            prefetch={false}
                            className="inline-flex items-center px-6 py-4 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg border border-white/10 relative overflow-hidden group"
                          >
                            <span className="relative z-10">View Pricing Plans</span>
                            <motion.svg 
                              className="w-5 h-5 ml-2 relative z-10" 
                              animate={{ x: [0, 4, 0] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "loop",
                                ease: "easeInOut"
                              }}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </motion.svg>
                            <span className="absolute inset-0 bg-gradient-to-r from-[#ff4f7b] to-[#ff3366] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </Link>
                        </motion.div>
                        <div className="mt-3 text-center text-xs text-white/50">No credit card required to view plans</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.article>
          
          {/* "Back to blog" button below article */}
          <motion.div
            className="max-w-4xl mx-auto mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link 
              href="/blog" 
              prefetch={false} 
              className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm group"
            >
              <svg className="w-5 h-5 mr-2 transform transition-transform duration-200 group-hover:-translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to all articles
            </Link>
          </motion.div>
          
          {/* Related Articles & Internal Links */}
          <motion.div 
            className="mt-16 pt-12 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Continue <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Learning</span>
              </h3>
              <p className="text-white/80 max-w-2xl mx-auto">
                Explore more guides, comparisons, and tools to master Adobe Creative Cloud
              </p>
            </div>
            <SEOInternalLinks 
              currentPage={`/blog/${postData.slug}`}
              maxLinks={6}
              layout="grid"
              showDescription={true}
              className="max-w-4xl mx-auto"
            />
          </motion.div>
        </div>
      </main>
    </>
  );
} 