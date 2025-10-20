"use client";

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { motion } from 'framer-motion';

const AdobeAcrobatProPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-900 via-black to-orange-900 text-white relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb Navigation - Fixed at top with proper z-index and pushed below header */}
        <div className="relative z-20 pt-6 pb-4 mt-20 hidden md:block">
          <Breadcrumb
            items={[]}
            currentPage="Adobe Acrobat Pro"
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold text-center mt-16 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-600 drop-shadow-lg"
        >
          Adobe Acrobat Pro Solutions
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xl text-center max-w-3xl mx-auto mb-12 text-gray-300"
        >
          Discover our offerings for Adobe Acrobat Pro, designed for professional PDF editing and document management.
          Get the tools you need for advanced PDF workflows at unbeatable prices.
        </motion.p>

        <div className="grid grid-cols-1 gap-8 max-w-3xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-gray-700 hover:border-red-500 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mr-4">
                <i className="fas fa-file-pdf text-white text-xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-red-400">Redemption Codes</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Get official Adobe Acrobat Pro redemption codes to activate directly on redeem.adobe.com. 
              Secure and straightforward access to advanced PDF tools for professional document management.
            </p>
            <div className="space-y-2 mb-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <i className="fas fa-check text-green-400"></i>
                <span>Professional PDF Tools</span>
              </div>
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
                <span>Quick Redemption</span>
              </div>
            </div>
            <Link href="/adobe-acrobat-pro-redemption-codes" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 transition-all duration-300 shadow-lg">
              Learn More <span className="ml-2">&rarr;</span>
            </Link>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">PDF Tools</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Adobe Acrobat Pro provides everything you need for professional PDF editing, document management, and collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: "fas fa-edit",
                title: "PDF Editing",
                description: "Edit text, images, and layouts directly in PDF files with professional precision and accuracy."
              },
              {
                icon: "fas fa-signature",
                title: "Digital Signatures",
                description: "Create, manage, and apply digital signatures for secure document authentication and approval workflows."
              },
              {
                icon: "fas fa-comments",
                title: "Comments & Review",
                description: "Collaborate with team members using comments, annotations, and review tools for seamless document workflows."
              },
              {
                icon: "fas fa-shield-alt",
                title: "Security & Protection",
                description: "Protect sensitive documents with password encryption, redaction tools, and access control features."
              },
              {
                icon: "fas fa-file-export",
                title: "Format Conversion",
                description: "Convert PDFs to and from various formats including Word, Excel, PowerPoint, and more."
              },
              {
                icon: "fas fa-search",
                title: "Advanced Search",
                description: "Search within PDFs, across multiple documents, and use OCR to make scanned documents searchable."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                  <i className={`${feature.icon} text-white text-lg`}></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-2xl p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Professional PDF Tools?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who trust CheapCC for their Adobe Acrobat Pro needs. 
              Get official redemption codes with maximum flexibility and professional features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/adobe-acrobat-pro-redemption-codes"
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-red-500/25"
              >
                Get Acrobat Pro Code
              </Link>
              <Link
                href="/compare"
                className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                Compare Options
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
};

export default AdobeAcrobatProPage;
