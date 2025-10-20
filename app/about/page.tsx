"use client";

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const resources = [
    {
      title: 'Adobe Creative Cloud Solutions',
      description: 'Explore our comprehensive range of Adobe Creative Cloud offerings, from quick access to flexible email-activation options.',
      href: '/adobe-creative-cloud',
      icon: 'fas fa-palette',
      color: 'from-purple-500 to-pink-500',
      features: ['All Creative Cloud options', 'Detailed comparisons', 'Feature breakdowns']
    },
    {
      title: 'Adobe Acrobat Pro Solutions',
      description: 'Discover our Adobe Acrobat Pro offerings designed for professional PDF editing and document management.',
      href: '/adobe-acrobat-pro',
      icon: 'fas fa-file-pdf',
      color: 'from-red-500 to-orange-500',
      features: ['Professional PDF tools', 'Document management', 'Advanced security']
    },
    {
      title: 'Compare Options',
      description: 'Use our comprehensive comparison tool to find the perfect Adobe solution for your needs.',
      href: '/compare',
      icon: 'fas fa-balance-scale',
      color: 'from-yellow-500 to-orange-500',
      features: ['Side-by-side comparisons', 'Feature analysis', 'Pricing breakdowns']
    },
    {
      title: 'Pricing Calculator',
      description: 'Calculate your potential savings with our interactive pricing calculator tool.',
      href: '/adobe-pricing-calculator',
      icon: 'fas fa-calculator',
      color: 'from-indigo-500 to-blue-500',
      features: ['Savings calculations', 'Cost comparisons', 'ROI analysis']
    },
    {
      title: 'Adobe Alternatives',
      description: 'Explore alternative software options to Adobe Creative Cloud and find the best fit for your workflow.',
      href: '/adobe-alternatives',
      icon: 'fas fa-th-large',
      color: 'from-green-500 to-teal-500',
      features: ['Alternative software', 'Feature comparisons', 'Migration guides']
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb Navigation */}
        <div className="relative z-20 pt-6 pb-4 mt-20">
          <Breadcrumb
            items={[]}
            currentPage="About"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
            About CheapCC
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-gray-300 leading-relaxed">
            Your comprehensive resource for Adobe Creative Cloud solutions, tools, and alternatives. 
            Explore our collection of informational pages, comparison tools, and calculators to make informed decisions about your creative software needs.
          </p>
        </motion.div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <Link
                href={resource.href}
                className="block h-full p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex flex-col h-full">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${resource.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${resource.icon} text-2xl text-white`}></i>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-6 flex-grow leading-relaxed">
                    {resource.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-purple-400 mb-2">Key Features:</div>
                    <ul className="space-y-1">
                      {resource.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-gray-400 flex items-center">
                          <i className="fas fa-check text-green-400 mr-2 text-xs"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-6 flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                    <span className="text-sm font-medium">Explore Now</span>
                    <i className="fas fa-arrow-right ml-2 text-xs group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Why Choose CheapCC?
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              We provide comprehensive resources and tools to help you make informed decisions about Adobe Creative Cloud. 
              From detailed comparisons to pricing calculators, we equip you with everything you need to find the perfect solution for your creative workflow.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-line text-purple-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-white mb-2">Comprehensive Analysis</h3>
                <p className="text-sm text-gray-400">Detailed comparisons and feature breakdowns</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calculator text-pink-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-white mb-2">Smart Tools</h3>
                <p className="text-sm text-gray-400">Interactive calculators and comparison tools</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lightbulb text-blue-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-white mb-2">Expert Insights</h3>
                <p className="text-sm text-gray-400">Professional recommendations and alternatives</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default AboutPage;
