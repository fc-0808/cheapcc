'use client';

import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import type { Post } from '@/lib/blog';

interface ClientBlogProps {
  posts: Omit<Post, 'contentHtml' | 'wordCount' | 'readingTime'>[];
}

export default function ClientBlog({ posts }: ClientBlogProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [particles, setParticles] = useState<Array<{top: number, left: number, size: number, delay: number}>>([]);
  
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
  }, []);
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
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
    <main className="min-h-screen py-20 relative overflow-hidden bg-[#0f111a]">
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

      {/* Background glow effect */}
      <motion.div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[70vh] bg-[radial-gradient(ellipse_at_center,_rgba(255,_51,_102,_0.15),_transparent_70%)] pointer-events-none"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.header 
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1 
            ref={titleRef}
            className="text-4xl sm:text-5xl font-bold text-white mb-4 relative inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <motion.span 
              className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              style={{ backgroundSize: "200% 100%" }}
            >
              Adobe Creative Cloud
            </motion.span>{' '}
            <motion.span
              animate={{ 
                y: [0, -5, 0],
                x: [0, 2, 0]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-white"
            >
              Blog
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-white/70 max-w-2xl mx-auto text-lg mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.4, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            Discover tips, tutorials, and insights about Adobe Creative Cloud apps, along with exclusive discount offers.
          </motion.p>
          
          <motion.div
            className="flex justify-center space-x-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.6, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <Link 
              href="/blog"
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-300"
            >
              All Articles
            </Link>
            <Link 
              href="/compare"
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all duration-300"
            >
              Software Comparisons
            </Link>
          </motion.div>
        </motion.header>
        
        {posts.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.svg 
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.4,
                type: "spring", 
                stiffness: 100 
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </motion.svg>
            <motion.h2 
              className="text-xl font-semibold text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.6 
              }}
            >
              No blog posts yet - check back soon!
            </motion.h2>
            <motion.p 
              className="text-gray-300 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.7 
              }}
            >
              We're working on some exciting content for you.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.8 
              }}
            >
              <Link 
                href="/" 
                prefetch={false} 
                className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white rounded-lg font-medium shadow-lg hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                Return to Home
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {posts.map((post, index) => (
              <motion.article 
                key={post.slug} 
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)"
                }}
                className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-lg hover:shadow-pink-500/10 transition-all duration-300"
              >
                <Link href={`/blog/${post.slug}`} prefetch={false} className="block h-full group">
                  {post.featuredImage && (
                    <div className="relative h-52 w-full overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        priority={index === 0} 
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.7)] opacity-70"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="text-sm text-gray-300 font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        {format(new Date(post.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#ff3366] transition-colors duration-300">
                      {post.title}
                    </h2>
                    <p className="text-gray-300 mb-5 line-clamp-3">{post.excerpt}</p>
                    <div className="text-[#ff3366] font-medium flex items-center group-hover:text-[#ff5c85] mt-auto">
                      Read more 
                      <motion.svg 
                        className="w-4 h-4 ml-1"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut" 
                        }}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </motion.svg>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* Software Comparisons Section */}
        <motion.div
          className="mt-16 bg-gradient-to-r from-purple-900/30 to-fuchsia-900/30 rounded-2xl overflow-hidden border border-white/10 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold text-purple-200 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <span className="mr-2">⚖️</span>
              DETAILED COMPARISONS
            </motion.div>
            <motion.h2 
              className="text-3xl font-bold text-white mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Adobe Creative Cloud Software Comparisons
            </motion.h2>
            <motion.p 
              className="text-white/70 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              Detailed side-by-side comparisons of Adobe products with popular alternatives to help you make informed decisions.
            </motion.p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:shadow-lg hover:shadow-fuchsia-500/10 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link href="/compare/photoshop-vs-affinity-photo" className="block group">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-400 transition-colors">
                    Photoshop vs Affinity Photo
                  </h3>
                  <p className="text-white/70 mb-4">
                    Compare features, pricing, and performance between Adobe Photoshop and Affinity Photo to find the best photo editing solution for your needs.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Features, Pricing, UI & more</span>
                    <span className="text-fuchsia-400 font-medium flex items-center text-sm">
                      Read Comparison
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:shadow-lg hover:shadow-fuchsia-500/10 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <Link href="/compare/premiere-pro-vs-davinci-resolve" className="block group">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-400 transition-colors">
                    Premiere Pro vs DaVinci Resolve
                  </h3>
                  <p className="text-white/70 mb-4">
                    A detailed comparison of Adobe Premiere Pro and DaVinci Resolve, covering editing capabilities, color grading, pricing models, and professional workflows.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Editing, Color Grading, Performance</span>
                    <span className="text-fuchsia-400 font-medium flex items-center text-sm">
                      Read Comparison
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
          
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <Link 
              href="/compare" 
              className="inline-flex items-center px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-all duration-300"
            >
              View All Comparisons
              <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>

        {posts.length > 0 && (
          <motion.div 
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.6, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="inline-block"
            >
              <Link 
                href="/#pricing" 
                prefetch={false} 
                className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-red-500 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group border border-white/10"
              >
                <span className="relative z-10">Get Adobe CC at a Discount</span>
                <motion.svg 
                  className="w-5 h-5 ml-2 relative z-10"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut"
                  }}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </motion.svg>
                <span className="absolute inset-0 bg-gradient-to-r from-[#ff4f7b] to-[#ff3366] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
} 