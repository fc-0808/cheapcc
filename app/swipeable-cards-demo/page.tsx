'use client';

import React from 'react';
import SwipeableCardExample from '../../components/SwipeableCardExample';

export default function SwipeableCardsDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Swipeable Cards Demo</h1>
          <p className="text-gray-600">
            View this page on a mobile device or use device emulation in your browser's developer tools to experience the swipe functionality.
          </p>
        </div>
        
        <SwipeableCardExample />
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">About This Demo</h2>
          <p className="text-gray-600 text-sm mb-4">
            This demo showcases a mobile-optimized card interface with swipe gestures. On mobile devices, you can:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
            <li>Swipe left to reveal action buttons</li>
            <li>Swipe right on the Premium card to reveal the favorite option</li>
            <li>Tap on action buttons to trigger their functions</li>
            <li>Tap elsewhere to dismiss actions</li>
          </ul>
          <p className="mt-4 text-xs text-gray-500 italic">
            Note: Touch gestures are only enabled on mobile devices to preserve normal desktop interactions.
          </p>
        </div>
      </div>
    </div>
  );
} 