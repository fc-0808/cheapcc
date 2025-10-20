"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';

const ComparePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<'creative-cloud' | 'acrobat-pro'>('creative-cloud');

  const creativeCloudOptions = [
    {
      id: 'pre-activated',
      name: 'Pre-activated Accounts',
      description: 'Quick access with ready-to-use accounts',
      href: '/pre-activated-adobe-creative-cloud',
      color: 'from-purple-500 to-pink-500',
      icon: 'fas fa-bolt',
      features: [
        'Quick Access',
        'Pre-configured Setup',
        'No Adobe ID Required',
        'Time Saving',
        'Ready to Use'
      ],
      pros: [
        'Fastest setup time',
        'No technical knowledge needed',
        'Quick productivity'
      ],
      cons: [
        'Limited account control',
        'Cannot use existing Adobe ID',
        'Less flexibility'
      ],
      bestFor: 'Quick start, beginners, quick needs'
    },
    {
      id: 'email-activation',
      name: 'Email-activated Subscriptions',
      description: 'Use your own Adobe ID with maximum savings',
      href: '/email-activated-adobe-creative-cloud',
      color: 'from-blue-500 to-cyan-500',
      icon: 'fas fa-user-cog',
      features: [
        'Your Adobe ID',
        'Maximum Savings',
        'Full Control',
        'Email Activation',
        'Account Management'
      ],
      pros: [
        'Highest savings potential',
        'Full account control',
        'Use existing Adobe ID',
        'Complete flexibility'
      ],
      cons: [
        'Requires setup time',
        'Need existing Adobe ID',
        'Manual activation process'
      ],
      bestFor: 'Existing Adobe users, maximum savings, full control'
    },
    {
      id: 'redemption-codes',
      name: 'Redemption Codes',
      description: 'Official Adobe codes for redeem.adobe.com',
      href: '/adobe-creative-cloud-redemption-codes',
      color: 'from-emerald-500 to-teal-500',
      icon: 'fas fa-gift',
      features: [
        'Official Adobe Codes',
        'Your Adobe Account',
        'Quick Redemption',
        'Maximum Flexibility',
        'Gift-like Experience'
      ],
      pros: [
        'Official Adobe codes',
        'Use your Adobe ID',
        'Gift to others',
        'Maximum flexibility',
        'No third-party accounts'
      ],
      cons: [
        'Requires Adobe ID',
        'Manual redemption process',
        'Slightly longer setup'
      ],
      bestFor: 'Flexibility seekers, gift purchases, official codes preference'
    }
  ];

  const acrobatProOptions = [
    {
      id: 'acrobat-codes',
      name: 'Acrobat Pro Redemption Codes',
      description: 'Official Adobe Acrobat Pro codes for professional PDF tools',
      href: '/adobe-acrobat-pro-redemption-codes',
      color: 'from-red-500 to-orange-500',
      icon: 'fas fa-file-pdf',
      features: [
        'Professional PDF Tools',
        'Official Adobe Codes',
        'Your Adobe Account',
        'Quick Redemption',
        'Document Management'
      ],
      pros: [
        'Complete PDF toolkit',
        'Professional features',
        'Official Adobe codes',
        'Use your Adobe ID',
        'Advanced security'
      ],
      cons: [
        'PDF-focused only',
        'Requires Adobe ID',
        'Manual redemption'
      ],
      bestFor: 'PDF professionals, document management, business users'
    }
  ];

  const currentOptions = selectedCategory === 'creative-cloud' ? creativeCloudOptions : acrobatProOptions;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
        
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 mt-20 hidden md:block">
        {/* Breadcrumb Navigation - Fixed at top with proper z-index and pushed below header */}
        <Breadcrumb
          items={[]}
          currentPage="Compare Options"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-8 mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 drop-shadow-lg">
            Compare Adobe Solutions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Find the perfect Adobe solution for your needs. Compare features, benefits, and pricing across all our offerings.
          </p>
        </motion.div>

        {/* Category Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2">
            <button
              onClick={() => setSelectedCategory('creative-cloud')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === 'creative-cloud'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Creative Cloud
            </button>
            <button
              onClick={() => setSelectedCategory('acrobat-pro')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === 'acrobat-pro'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Acrobat Pro
            </button>
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-7xl mx-auto"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-white font-semibold text-left">Features</th>
                  {currentOptions.map((option, index) => (
                    <th key={index} className="pb-4 font-semibold text-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center mb-2`}>
                          <i className={`${option.icon} text-white text-lg`}></i>
                        </div>
                        <span className="text-sm">{option.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="space-y-4">
                <tr className="border-b border-white/5">
                  <td className="py-3 text-gray-300 font-medium">Setup Time</td>
                  {currentOptions.map((option, index) => (
                    <td key={index} className="py-3 text-center">
                      {option.id === 'pre-activated' && <span className="text-green-400 font-semibold">Immediate</span>}
                      {option.id === 'email-activation' && <span className="text-yellow-400">5-10 min</span>}
                      {option.id === 'redemption-codes' && <span className="text-yellow-400">5-10 min</span>}
                      {option.id === 'acrobat-codes' && <span className="text-yellow-400">5-10 min</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-gray-300 font-medium">Your Adobe ID</td>
                  {currentOptions.map((option, index) => (
                    <td key={index} className="py-3 text-center">
                      {option.id === 'pre-activated' && <span className="text-red-400">No</span>}
                      {option.id === 'email-activation' && <span className="text-green-400">Yes</span>}
                      {option.id === 'redemption-codes' && <span className="text-green-400">Yes</span>}
                      {option.id === 'acrobat-codes' && <span className="text-green-400">Yes</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-gray-300 font-medium">Savings Level</td>
                  {currentOptions.map((option, index) => (
                    <td key={index} className="py-3 text-center">
                      {option.id === 'pre-activated' && <span className="text-yellow-400">High</span>}
                      {option.id === 'email-activation' && <span className="text-green-400">Maximum</span>}
                      {option.id === 'redemption-codes' && <span className="text-green-400">Maximum</span>}
                      {option.id === 'acrobat-codes' && <span className="text-green-400">Maximum</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-gray-300 font-medium">Control Level</td>
                  {currentOptions.map((option, index) => (
                    <td key={index} className="py-3 text-center">
                      {option.id === 'pre-activated' && <span className="text-yellow-400">Limited</span>}
                      {option.id === 'email-activation' && <span className="text-green-400">Full</span>}
                      {option.id === 'redemption-codes' && <span className="text-green-400">Full</span>}
                      {option.id === 'acrobat-codes' && <span className="text-green-400">Full</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 text-gray-300 font-medium">Flexibility</td>
                  {currentOptions.map((option, index) => (
                    <td key={index} className="py-3 text-center">
                      {option.id === 'pre-activated' && <span className="text-yellow-400">Low</span>}
                      {option.id === 'email-activation' && <span className="text-green-400">High</span>}
                      {option.id === 'redemption-codes' && <span className="text-green-400">Maximum</span>}
                      {option.id === 'acrobat-codes' && <span className="text-green-400">Maximum</span>}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 text-gray-300 font-medium">Best For</td>
                  {currentOptions.map((option, index) => (
                    <td key={index} className="py-3 text-center text-sm text-gray-300">
                      {option.bestFor}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Detailed Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Detailed <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">Comparison</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {currentOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                    <i className={`${option.icon} text-white text-2xl`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{option.name}</h3>
                  <p className="text-gray-300 text-sm">{option.description}</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <i className="fas fa-check text-green-400"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-green-400 font-semibold mb-2">Pros:</h4>
                    <ul className="space-y-1">
                      {option.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-gray-300">• {pro}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-red-400 font-semibold mb-2">Cons:</h4>
                    <ul className="space-y-1">
                      {option.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-gray-300">• {con}</li>
                      ))}
                    </ul>
              </div>
            </div>

                <Link
                  href={option.href}
                  className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r ${option.color} hover:opacity-90 transition-all duration-300 shadow-lg`}
                >
                  Learn More <span className="ml-2">&rarr;</span>
                </Link>
              </motion.div>
          ))}
        </div>
        </motion.div>

        {/* Recommendation Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-emerald-900/30 rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Need Help <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">Choosing</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Still not sure which option is right for you? Our team is here to help you find the perfect Adobe solution for your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-emerald-600 transition-all duration-300 shadow-lg"
              >
                Get Expert Advice
              </Link>
              <Link
                href="/faq"
                className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                View FAQ
              </Link>
        </div>
      </div>
        </motion.section>
    </div>
    </main>
  );
};

export default ComparePage;