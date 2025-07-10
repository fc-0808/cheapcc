'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

export default function FaviconViewer() {
  const [selectedSize, setSelectedSize] = useState<number>(32);
  const [selectedFormat, setSelectedFormat] = useState<string>('png');
  const [status, setStatus] = useState<string>('');
  const availableSizes = [16, 32, 64, 128, 256];
  const availableFormats = ['png', 'jpg', 'svg'];
  
  const downloadUrl = `/api/download/favicon?format=${selectedFormat}&size=${selectedSize}`;
  const previewUrl = `/api/download/favicon?format=${selectedFormat}&size=${selectedSize}`;

  const handleDownload = useCallback(async () => {
    try {
      setStatus('Starting download...');
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `favicon-${selectedSize}x${selectedSize}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setStatus(`Download complete: favicon-${selectedSize}x${selectedSize}.${selectedFormat}`);
    } catch (error) {
      console.error('Download failed:', error);
      setStatus(`Download failed: ${error.message}`);
    }
  }, [downloadUrl, selectedFormat, selectedSize]);

  const handleDirectLinkDownload = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>, url: string, filename: string) => {
    e.preventDefault();
    
    try {
      setStatus(`Starting download: ${filename}...`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      
      setStatus(`Download complete: ${filename}`);
    } catch (error) {
      console.error('Download failed:', error);
      setStatus(`Download failed: ${error.message}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Favicon Viewer & Downloader</h1>
        
        <div className="mb-10 text-center">
          <div className="mb-4">
            <div className="bg-gray-100 p-8 rounded-lg mb-4 flex items-center justify-center">
              {/* Preview area */}
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Favicon Preview"
                  width={selectedSize > 64 ? 64 : selectedSize}
                  height={selectedSize > 64 ? 64 : selectedSize}
                  className="mx-auto"
                  style={{
                    width: selectedSize > 64 ? 64 : selectedSize,
                    height: selectedSize > 64 ? 64 : selectedSize
                  }}
                />
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {selectedSize}x{selectedSize} {selectedFormat.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Size selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 rounded ${
                      selectedSize === size
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Format selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Format</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {availableFormats.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-3 py-2 rounded uppercase ${
                      selectedFormat === format
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } transition-colors`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Download Favicon
            </button>
            
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              View in New Tab
            </a>
          </div>
          
          {status && (
            <div className="mt-4 p-3 bg-gray-50 text-sm rounded-md">
              {status}
            </div>
          )}
        </div>
        
        <div className="mt-8 border-t pt-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Direct Download Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium mb-1">PNG Format</div>
              <a 
                href="/api/download/favicon?format=png&size=32" 
                className="text-blue-500 hover:underline"
                onClick={(e) => handleDirectLinkDownload(e, "/api/download/favicon?format=png&size=32", "favicon-32x32.png")}
              >
                32x32 PNG
              </a>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium mb-1">JPG Format</div>
              <a 
                href="/api/download/favicon?format=jpg&size=32" 
                className="text-blue-500 hover:underline"
                onClick={(e) => handleDirectLinkDownload(e, "/api/download/favicon?format=jpg&size=32", "favicon-32x32.jpg")}
              >
                32x32 JPG
              </a>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="font-medium mb-1">SVG Format</div>
              <a 
                href="/api/download/favicon?format=svg" 
                className="text-blue-500 hover:underline"
                onClick={(e) => handleDirectLinkDownload(e, "/api/download/favicon?format=svg", "favicon.svg")}
              >
                Original SVG
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-xl font-semibold mb-4 text-center">Alternative Download Options</h2>
          <div className="text-center">
            <p className="mb-4">
              If the downloads above aren't working, try these direct favicon links:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
              <a 
                href="/favicon-16x16.png" 
                download="favicon-16x16.png"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                16x16 PNG (Direct)
              </a>
              <a 
                href="/favicon-32x32.png" 
                download="favicon-32x32.png"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                32x32 PNG (Direct)
              </a>
              <a 
                href="/favicon.svg" 
                download="favicon.svg"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                SVG (Direct)
              </a>
              <a 
                href="/favicon-direct.html" 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                All Direct Downloads
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 