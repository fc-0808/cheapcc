'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import Script from 'next/script';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import type { Post } from '@/lib/blog';
import ComparisonTable from '@/components/blog/ComparisonTable';

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
  
  // Generate particles for background effect
  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 3 + 1,
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
    "image": postData.featuredImage || "https://cheapcc.online/og-image.jpg",
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
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
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
      <main className="min-h-screen relative overflow-hidden bg-[#0f111a]" ref={articleRef}>
        {/* Background particles */}
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full bg-white opacity-40 pointer-events-none"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.5)`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Hero section with featured image */}
        {postData.featuredImage && (
          <motion.div 
            className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden"
            style={{ opacity, scale, y }}
          >
            <Image
              src={postData.featuredImage}
              alt={postData.title}
              priority
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f111a]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#0f111a]/80"></div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
              <motion.div 
                className="max-w-4xl w-full text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div 
                  className="inline-block px-3 py-1 rounded-full bg-[#ff3366]/20 text-[#ff3366] text-sm font-medium mb-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <time dateTime={postData.date}>{formattedDate}</time>
                  {postData.readingTime && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{postData.readingTime} min read</span>
                    </>
                  )}
                </motion.div>
                
                <motion.h1 
                  className="text-3xl md:text-5xl font-bold text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  style={{ textShadow: "0 4px 15px rgba(0,0,0,0.3)" }}
                >
                  {postData.title}
                </motion.h1>
              </motion.div>
            </div>
          </motion.div>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.article 
            className="max-w-4xl mx-auto bg-white/5 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-white/10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="p-6 sm:p-8" variants={itemVariants}>
              <motion.div variants={itemVariants}>
                <Link 
                  href="/blog" 
                  prefetch={false} 
                  className="inline-flex items-center text-[#ff3366] hover:text-[#ff5c85] mb-6 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Blog
                </Link>
              </motion.div>

              {!postData.featuredImage && (
                <motion.div variants={itemVariants} className="mb-4 text-white/60 text-sm font-medium">
                  <time dateTime={postData.date}>{formattedDate}</time>
                  {postData.readingTime && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{postData.readingTime} min read</span>
                    </>
                  )}
                </motion.div>
              )}
              
              {!postData.featuredImage && (
                <motion.h1 
                  variants={itemVariants}
                  className="text-3xl sm:text-4xl font-bold text-white mb-6"
                >
                  {postData.title}
                </motion.h1>
              )}

              <motion.div 
                className="prose prose-lg prose-dark max-w-none"
                variants={itemVariants}
                dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
              />
              
              {/* Pricing CTA Section */}
              <motion.div 
                className="mt-12 pt-8 border-t border-white/10"
                variants={itemVariants}
              >
                <motion.div 
                  className="bg-gradient-to-br from-[#0f111a]/60 via-[#131626]/60 to-[#15162a]/60 rounded-xl p-8 border border-white/5 shadow-lg relative overflow-hidden backdrop-blur-sm"
                  whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Decorative elements */}
                  <motion.div 
                    className="absolute -top-10 -right-10 w-40 h-40 bg-[#ff3366]/10 rounded-full blur-3xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
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
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                      <motion.span 
                        className="inline-block px-3 py-1 bg-[#ff3366]/15 text-[#ff3366] text-xs font-semibold rounded-full mb-3"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        EXCLUSIVE OFFER
                      </motion.span>
                      <motion.h3 
                        className="text-2xl font-bold text-white mb-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        Ready to save on Adobe Creative Cloud?
                      </motion.h3>
                      <motion.p 
                        className="text-white/70 mb-4 sm:mb-0 max-w-md"
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
                          className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg border border-white/10 relative overflow-hidden group"
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
            </motion.div>
          </motion.article>
        </div>
      </main>
    </>
  );
} 