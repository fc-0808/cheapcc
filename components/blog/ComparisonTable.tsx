'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { generateTableSchema, generateComparisonTableSchema } from '@/lib/schemas';

interface ComparisonTableProps {
  htmlContent: string;
}

// Helper to extract star ratings from strings like "★★★★☆" or "★★★☆☆"
const extractRating = (stars: string): number => {
  if (!stars) return 0;
  const fullStarCount = (stars.match(/★/g) || []).length;
  return fullStarCount;
};

// Helper to parse HTML table into structured data
const parseTableForStructuredData = (tableHtml: string) => {
  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = tableHtml;
  const table = tempDiv.querySelector('table');
  
  if (!table) return null;
  
  // Get caption/title from previous h3 element
  let caption = '';
  let prevElement = table.previousElementSibling;
  while (prevElement) {
    if (prevElement.tagName === 'H3' || prevElement.tagName === 'H2') {
      caption = prevElement.textContent || '';
      break;
    }
    prevElement = prevElement.previousElementSibling;
  }
  
  // Extract headers
  const headers: string[] = [];
  const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
  if (!headerRow) return null;
  
  headerRow.querySelectorAll('th').forEach((th) => {
    headers.push(th.textContent?.trim() || '');
  });

  // If no th elements found, use the first row td elements as headers
  if (headers.length === 0) {
    headerRow.querySelectorAll('td').forEach((td) => {
      headers.push(td.textContent?.trim() || '');
    });
  }
  
  // Extract rows
  const rows: string[][] = [];
  const bodyRows = table.querySelectorAll('tbody tr') || table.querySelectorAll('tr');
  
  // Skip the first row if it contains headers
  const startIndex = headers.length === 0 ? 0 : 1;
  
  for (let i = startIndex; i < bodyRows.length; i++) {
    const row = bodyRows[i];
    const cells: string[] = [];
    row.querySelectorAll('td').forEach((td) => {
      cells.push(td.textContent?.trim() || '');
    });
    rows.push(cells);
  }
  
  // Generate table schema
  if (headers.length > 0 && rows.length > 0) {
    return generateTableSchema(caption, headers, rows);
  }
  
  return null;
};

// Helper to parse feature comparison tables that use star ratings
const parseFeatureComparisonTable = (tableHtml: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = tableHtml;
  const table = tempDiv.querySelector('table');
  
  if (!table) return null;
  
  // Get caption/title from previous h3 element
  let caption = '';
  let prevElement = table.previousElementSibling;
  while (prevElement) {
    if (prevElement.tagName === 'H3' || prevElement.tagName === 'H2') {
      caption = prevElement.textContent || '';
      break;
    }
    prevElement = prevElement.previousElementSibling;
  }
  
  // Extract headers (product names)
  const headers: string[] = [];
  const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
  if (!headerRow) return null;
  
  headerRow.querySelectorAll('th').forEach((th, index) => {
    if (index > 0) { // Skip the first header which is usually "Feature"
      headers.push(th.textContent?.trim() || '');
    }
  });
  
  // Extract features and ratings
  const features: Record<string, {rating: number, description?: string}[]> = {};
  const bodyRows = table.querySelectorAll('tbody tr') || table.querySelectorAll('tr');
  
  // Skip the header row
  for (let i = 1; i < bodyRows.length; i++) {
    const row = bodyRows[i];
    const cells = row.querySelectorAll('td');
    
    if (cells.length > 0) {
      const featureName = cells[0].textContent?.trim() || '';
      // Skip category winner rows
      if (featureName.toLowerCase().includes('winner')) continue;
      
      features[featureName] = [];
      
      // Start from index 1 to skip the feature name column
      for (let j = 1; j < cells.length; j++) {
        const cell = cells[j];
        const ratingText = cell.textContent?.trim() || '';
        
        // Check if it's a star rating
        if (ratingText.includes('★')) {
          features[featureName].push({
            rating: extractRating(ratingText),
          });
        } else if (ratingText.includes('Not available')) {
          features[featureName].push({
            rating: 0,
            description: 'Not available'
          });
        } else {
          // If it's not a star rating, just use the text
          features[featureName].push({
            rating: 0,
            description: ratingText
          });
        }
      }
    }
  }
  
  // Generate comparison table schema if we have headers and features
  if (headers.length > 0 && Object.keys(features).length > 0) {
    return generateComparisonTableSchema(caption, headers, features);
  }
  
  return null;
};

export default function ComparisonTable({ htmlContent }: ComparisonTableProps) {
  const [tableSchemas, setTableSchemas] = useState<any[]>([]);
  
  useEffect(() => {
    // Wait for the DOM to be fully rendered
    const timer = setTimeout(() => {
      // Find all tables in the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const tables = doc.querySelectorAll('table');
      
      const schemas: any[] = [];
      
      tables.forEach((table, index) => {
        const tableHtml = table.outerHTML;
        
        // Try to parse as a feature comparison table first
        const featureSchema = parseFeatureComparisonTable(tableHtml);
        if (featureSchema) {
          schemas.push(featureSchema);
        } else {
          // Fall back to standard table schema
          const tableSchema = parseTableForStructuredData(tableHtml);
          if (tableSchema) {
            schemas.push(tableSchema);
          }
        }
      });
      
      setTableSchemas(schemas);
    }, 500); // Give the page time to render
    
    return () => clearTimeout(timer);
  }, [htmlContent]);
  
  return (
    <>
      {tableSchemas.map((schema, index) => (
        <Script
          key={`table-schema-${index}`}
          id={`table-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
} 