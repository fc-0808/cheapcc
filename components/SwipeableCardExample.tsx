'use client';

import React, { useState } from 'react';
import SwipeableCard from './SwipeableCard';

type Item = {
  id: string;
  title: string;
  description: string;
  date?: string;
};

const SwipeableCardExample: React.FC = () => {
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      title: 'Adobe Photoshop CC',
      description: 'Edit and compose images, create website layouts, UI designs',
      date: 'Active until Dec 2023',
    },
    {
      id: '2',
      title: 'Adobe Illustrator CC',
      description: 'Vector graphics and illustration software used by designers',
      date: 'Active until Feb 2024',
    },
    {
      id: '3',
      title: 'Adobe Premiere Pro',
      description: 'Video editing software for film, TV, and web',
      date: 'Active until Jan 2024',
    },
  ]);

  // Delete an item
  const handleDelete = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Edit an item
  const handleEdit = (id: string) => {
    // In a real app, you might open an edit modal or navigate to an edit page
    console.log(`Edit item ${id}`);
  };

  // Archive an item
  const handleArchive = (id: string) => {
    console.log(`Archive item ${id}`);
    // Example implementation:
    // setItems((prevItems) =>
    //   prevItems.map((item) =>
    //     item.id === id ? { ...item, status: 'archived' } : item
    //   )
    // );
  };

  // Favorite an item
  const handleFavorite = (id: string) => {
    console.log(`Favorite item ${id}`);
    // Example implementation:
    // setItems((prevItems) =>
    //   prevItems.map((item) =>
    //     item.id === id ? { ...item, favorite: !item.favorite } : item
    //   )
    // );
  };

  const handleSwipeStateChange = (id: string, isOpen: boolean, direction: 'left' | 'right' | null) => {
    // You could use this to track which cards are open
    console.log(`Card ${id} is ${isOpen ? 'open' : 'closed'} in ${direction} direction`);
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Subscriptions</h2>
      
      {/* Card with right actions only */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 text-gray-500">SWIPE LEFT FOR OPTIONS</h3>
        <div className="space-y-3">
          {items.map((item) => (
            <SwipeableCard
              key={item.id}
              className="rounded-lg shadow-sm"
              rightActions={[
                {
                  icon: 'fa-edit',
                  label: 'Edit',
                  color: '#3b82f6',
                  onAction: () => handleEdit(item.id),
                },
                {
                  icon: 'fa-trash',
                  label: 'Delete',
                  color: '#ef4444',
                  onAction: () => handleDelete(item.id),
                },
              ]}
              onSwipeStateChange={(isOpen, direction) =>
                handleSwipeStateChange(item.id, isOpen, direction)
              }
            >
              <div className="bg-white p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                {item.date && (
                  <div className="mt-2 text-xs text-green-600 font-medium">{item.date}</div>
                )}
              </div>
            </SwipeableCard>
          ))}
        </div>
      </div>
      
      {/* Card with left and right actions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 text-gray-500">SWIPE LEFT OR RIGHT</h3>
        <SwipeableCard
          className="rounded-lg shadow-sm"
          rightActions={[
            {
              icon: 'fa-archive',
              label: 'Archive',
              color: '#8b5cf6',
              onAction: () => handleArchive('special'),
            },
            {
              icon: 'fa-trash',
              label: 'Delete',
              color: '#ef4444',
              onAction: () => handleDelete('special'),
            },
          ]}
          leftActions={[
            {
              icon: 'fa-star',
              label: 'Favorite',
              color: '#f59e0b',
              onAction: () => handleFavorite('special'),
            }
          ]}
        >
          <div className="bg-white p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800">Adobe Creative Suite</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Premium</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Full access to all Adobe CC applications</p>
            <div className="mt-2 text-xs text-green-600 font-medium">Active until Mar 2024</div>
          </div>
        </SwipeableCard>
      </div>

      {/* Instructions for mobile usage */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4 text-sm text-gray-600 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">How to use:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Swipe cards left to reveal edit/delete actions</li>
          <li>Swipe the premium card right to favorite it</li>
          <li>Actions are only visible on mobile screens</li>
          <li>Tap anywhere else to dismiss actions</li>
        </ul>
      </div>
    </div>
  );
};

export default SwipeableCardExample; 