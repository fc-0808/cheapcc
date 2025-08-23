'use client';

import React, { useState } from 'react';

interface ColorScheme {
  name: string;
  description: string;
  colors: {
    header: string;
    headerText: string;
    agentMessage: string;
    agentText: string;
    userMessage: string;
    userText: string;
  };
  recommended?: boolean;
}

const colorSchemes: ColorScheme[] = [
  {
    name: 'Primary Brand',
    description: 'Perfect match with your main brand colors and dark theme',
    recommended: true,
    colors: {
      header: '#2c2d5a',
      headerText: '#ffffff',
      agentMessage: '#ff3366',
      agentText: '#ffffff',
      userMessage: '#33347b',
      userText: '#ffffff',
    },
  },
  {
    name: 'Gradient Harmony',
    description: 'Incorporates your purple-to-pink gradient aesthetic',
    colors: {
      header: '#1a1a2e',
      headerText: '#ffffff',
      agentMessage: '#d946ef',
      agentText: '#ffffff',
      userMessage: '#484a9e',
      userText: '#ffffff',
    },
  },
  {
    name: 'Accent Focus',
    description: 'Emphasizes your vibrant accent colors',
    colors: {
      header: '#ff3366',
      headerText: '#ffffff',
      agentMessage: '#33347b',
      agentText: '#ffffff',
      userMessage: '#ff6b8b',
      userText: '#ffffff',
    },
  },
  {
    name: 'Dark Professional',
    description: 'Elegant dark theme matching your website\'s sophisticated look',
    colors: {
      header: '#111827',
      headerText: '#ffffff',
      agentMessage: '#374151',
      agentText: '#ffffff',
      userMessage: '#ff3366',
      userText: '#ffffff',
    },
  },
  {
    name: 'Vibrant Modern',
    description: 'Bold and energetic, perfect for engaging users',
    colors: {
      header: '#e11d48',
      headerText: '#ffffff',
      agentMessage: '#2c2d5a',
      agentText: '#ffffff',
      userMessage: '#10b981',
      userText: '#ffffff',
    },
  },
];

const ColorSwatch: React.FC<{ color: string; label: string; textColor?: string }> = ({ 
  color, 
  label, 
  textColor = '#ffffff' 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border border-gray-200"
        style={{ backgroundColor: color }}
        onClick={copyToClipboard}
        title={`Click to copy ${color}`}
      >
        <div 
          className="w-full h-full flex items-center justify-center rounded-lg text-xs font-medium"
          style={{ color: textColor }}
        >
          {copied ? '✓' : 'Aa'}
        </div>
      </div>
      <div className="mt-2 text-xs font-medium text-gray-700">{label}</div>
      <div className="text-xs text-gray-500 font-mono">{color}</div>
    </div>
  );
};

const ChatPreview: React.FC<{ scheme: ColorScheme }> = ({ scheme }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 max-w-xs">
      {/* Chat Header */}
      <div 
        className="rounded-t-lg p-3 text-center font-medium text-sm"
        style={{ 
          backgroundColor: scheme.colors.header,
          color: scheme.colors.headerText 
        }}
      >
        CheapCC Support
      </div>
      
      {/* Chat Messages */}
      <div className="bg-white p-3 space-y-3">
        {/* Agent Message */}
        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div 
            className="rounded-lg p-2 text-xs max-w-[70%]"
            style={{ 
              backgroundColor: scheme.colors.agentMessage,
              color: scheme.colors.agentText 
            }}
          >
            Hi! How can I help you with Adobe CC today?
          </div>
        </div>
        
        {/* User Message */}
        <div className="flex items-start space-x-2 justify-end">
          <div 
            className="rounded-lg p-2 text-xs max-w-[70%]"
            style={{ 
              backgroundColor: scheme.colors.userMessage,
              color: scheme.colors.userText 
            }}
          >
            I need help with pricing
          </div>
          <div className="w-6 h-6 rounded-full bg-blue-300 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
};

const TawkColorPalette: React.FC = () => {
  const [selectedScheme, setSelectedScheme] = useState(0);

  const copyAllColors = async (scheme: ColorScheme) => {
    const colorText = `Tawk.to Colors for ${scheme.name}:
Header: ${scheme.colors.header}
Header Text: ${scheme.colors.headerText}
Agent Message: ${scheme.colors.agentMessage}
Agent Text: ${scheme.colors.agentText}
User Message: ${scheme.colors.userMessage}
User Text: ${scheme.colors.userText}`;

    try {
      await navigator.clipboard.writeText(colorText);
      alert('All colors copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy colors:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tawk.to Color Schemes for CheapCC
        </h1>
        <p className="text-gray-600">
          Professional color palettes designed to match your brand
        </p>
      </div>

      <div className="grid gap-8">
        {colorSchemes.map((scheme, index) => (
          <div 
            key={scheme.name}
            className={`border rounded-xl p-6 transition-all duration-200 ${
              selectedScheme === index 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Scheme Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {scheme.name}
                  </h3>
                  {scheme.recommended && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{scheme.description}</p>
                
                {/* Color Swatches */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                  <ColorSwatch 
                    color={scheme.colors.header} 
                    label="Header"
                    textColor={scheme.colors.headerText}
                  />
                  <ColorSwatch 
                    color={scheme.colors.headerText} 
                    label="Header Text"
                    textColor={scheme.colors.header}
                  />
                  <ColorSwatch 
                    color={scheme.colors.agentMessage} 
                    label="Agent Msg"
                    textColor={scheme.colors.agentText}
                  />
                  <ColorSwatch 
                    color={scheme.colors.agentText} 
                    label="Agent Text"
                    textColor={scheme.colors.agentMessage}
                  />
                  <ColorSwatch 
                    color={scheme.colors.userMessage} 
                    label="User Msg"
                    textColor={scheme.colors.userText}
                  />
                  <ColorSwatch 
                    color={scheme.colors.userText} 
                    label="User Text"
                    textColor={scheme.colors.userMessage}
                  />
                </div>

                <button
                  onClick={() => copyAllColors(scheme)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Copy All Colors
                </button>
              </div>

              {/* Chat Preview */}
              <div className="lg:w-80">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                <ChatPreview scheme={scheme} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Implementation Guide */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How to Apply These Colors
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Method 1: Tawk.to Dashboard</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Log into your Tawk.to dashboard</li>
              <li>Go to Administration → Chat Widget</li>
              <li>Navigate to Widget Appearance</li>
              <li>Under Widget Colors, input the hex values</li>
              <li>Save and publish your changes</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Method 2: CSS Override</h4>
            <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono">
              {`/* Apply in custom CSS */
.chat-header {
  background-color: #2c2d5a !important;
  color: #ffffff !important;
}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TawkColorPalette;
