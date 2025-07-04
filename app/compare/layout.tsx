import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: {
    default: 'Software Comparisons | CheapCC',
    template: '%s | CheapCC Comparisons'
  },
  description: 'Compare Adobe Creative Cloud tools with popular alternatives for price, features, and performance.',
}

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen overflow-hidden">
      <section className="max-w-7xl mx-auto px-4 pt-24 pb-8 md:pb-12">
        {children}
      </section>
    </div>
  )
} 