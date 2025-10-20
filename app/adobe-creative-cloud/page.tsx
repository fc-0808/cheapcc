"use client";

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';

const AdobeCreativeCloudPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb Navigation - Fixed at top with proper z-index and pushed below header */}
        <div className="relative z-20 pt-6 pb-4 mt-20 hidden md:block">
          <Breadcrumb
            items={[]}
            currentPage="Adobe Creative Cloud"
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold text-center mt-16 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg"
        >
          Adobe Creative Cloud Solutions
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl text-center max-w-3xl mx-auto mb-12 text-gray-300"
        >
          Explore our range of Adobe Creative Cloud offerings, tailored to your needs.
          From quick access to flexible email-activation and official redemption codes, we have you covered.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-gray-700 hover:border-purple-500 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                <i className="fas fa-bolt text-white text-xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-purple-400">Pre-activated Accounts</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Get quick access to Adobe Creative Cloud with accounts that are ready to use. No setup, no hassle – just pure creativity from the moment you log in.
            </p>
            <div className="space-y-2 mb-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Quick Access</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Pre-configured</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Time Saving</span>
              </div>
            </div>
            <Link href="/pre-activated-adobe-creative-cloud" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg">
              Learn More <span className="ml-2">&rarr;</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-gray-700 hover:border-blue-500 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-4">
                <i className="fas fa-user-cog text-white text-xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-blue-400">Email-activated Subscriptions</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Activate Adobe Creative Cloud on your existing Adobe ID. Enjoy maximum savings and full control over your subscription with a simple activation process.
            </p>
            <div className="space-y-2 mb-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Your Adobe ID</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Maximum Savings</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Full Control</span>
              </div>
            </div>
            <Link href="/email-activated-adobe-creative-cloud" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 shadow-lg">
              Learn More <span className="ml-2">&rarr;</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-gray-700 hover:border-emerald-500 transition-all duration-300 md:col-span-2"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mr-4">
                <i className="fas fa-gift text-white text-xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-emerald-400">Redemption Codes</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Receive official Adobe Creative Cloud redemption codes to activate directly on redeem.adobe.com. Secure and straightforward access to the full suite.
            </p>
            <div className="space-y-2 mb-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Official Adobe Codes</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Your Adobe Account</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Immediate Redemption</span>
              </div>
            </div>
            <Link href="/adobe-creative-cloud-redemption-codes" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-lg">
              Learn More <span className="ml-2">&rarr;</span>
            </Link>
          </motion.div>
        </div>

        {/* Comparison Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Choose the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Right Option</span> for You
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Each option is designed for different needs and preferences. Compare features to find your perfect fit.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4 text-white font-semibold">Features</th>
                    <th className="pb-4 text-purple-400 font-semibold">Pre-activated</th>
                    <th className="pb-4 text-blue-400 font-semibold">Email-activated</th>
                    <th className="pb-4 text-emerald-400 font-semibold">Redemption Codes</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  <tr className="border-b border-white/5">
                    <td className="py-3 text-gray-300">Setup Time</td>
                    <td className="py-3 text-green-400">Immediate</td>
                    <td className="py-3 text-yellow-400">5-10 minutes</td>
                    <td className="py-3 text-yellow-400">5-10 minutes</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 text-gray-300">Your Adobe ID</td>
                    <td className="py-3 text-red-400">No</td>
                    <td className="py-3 text-green-400">Yes</td>
                    <td className="py-3 text-green-400">Yes</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 text-gray-300">Savings</td>
                    <td className="py-3 text-yellow-400">High</td>
                    <td className="py-3 text-green-400">Maximum</td>
                    <td className="py-3 text-green-400">Maximum</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 text-gray-300">Control Level</td>
                    <td className="py-3 text-yellow-400">Limited</td>
                    <td className="py-3 text-green-400">Full</td>
                    <td className="py-3 text-green-400">Full</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-gray-300">Best For</td>
                    <td className="py-3 text-gray-300">Quick start</td>
                    <td className="py-3 text-gray-300">Existing users</td>
                    <td className="py-3 text-gray-300">Flexibility</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default AdobeCreativeCloudPage;
