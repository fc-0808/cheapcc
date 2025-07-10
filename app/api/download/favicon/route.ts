import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'png';
    const size = parseInt(searchParams.get('size') || '32', 10);
    
    console.log(`Favicon request: format=${format}, size=${size}`);
    
    // Get the favicon from public directory
    let faviconPath;
    
    if (format === 'svg') {
      faviconPath = path.join(process.cwd(), 'public', 'favicon.svg');
      console.log(`Looking for SVG at: ${faviconPath}`);
      if (fs.existsSync(faviconPath)) {
        const svgBuffer = fs.readFileSync(faviconPath);
        console.log('SVG found, returning it');
        return new NextResponse(svgBuffer, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Content-Disposition': `attachment; filename=favicon.svg`
          }
        });
      } else {
        console.log('SVG file not found');
      }
    }
    
    // For PNG/JPG, first try to use favicon.svg
    let sourceIconPath = path.join(process.cwd(), 'public', 'favicon.svg');
    console.log(`Trying primary source: ${sourceIconPath}`);
    
    // If SVG doesn't exist, try to use PNG alternatives
    if (!fs.existsSync(sourceIconPath)) {
      console.log('Primary source not found, trying alternatives');
      const alternatives = [
        path.join(process.cwd(), 'public', 'favicon-32x32.png'),
        path.join(process.cwd(), 'public', 'favicon-16x16.png'),
        path.join(process.cwd(), 'public', 'apple-touch-icon.png'),
        path.join(process.cwd(), 'public', 'android-chrome-192x192.png')
      ];
      
      for (const alt of alternatives) {
        console.log(`Checking alternative: ${alt}`);
        if (fs.existsSync(alt)) {
          sourceIconPath = alt;
          console.log(`Using alternative source: ${sourceIconPath}`);
          break;
        }
      }
      
      if (!fs.existsSync(sourceIconPath)) {
        console.log('No favicon source found');
        return new NextResponse('Favicon not found', { status: 404 });
      }
    }

    try {
      // Read the source icon
      console.log(`Reading source icon: ${sourceIconPath}`);
      const iconBuffer = fs.readFileSync(sourceIconPath);
      
      // Process with sharp
      console.log('Processing with sharp');
      let processedIcon = sharp(iconBuffer).resize(size, size);
      
      // Convert to requested format
      if (format === 'jpg' || format === 'jpeg') {
        console.log('Converting to JPEG');
        processedIcon = processedIcon.jpeg({ quality: 90 });
        const buffer = await processedIcon.toBuffer();
        console.log('JPEG conversion complete, returning response');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Disposition': `attachment; filename=favicon-${size}x${size}.jpg`,
            'Cache-Control': 'no-cache'
          }
        });
      } else {
        // Default to PNG
        console.log('Converting to PNG');
        processedIcon = processedIcon.png();
        const buffer = await processedIcon.toBuffer();
        console.log('PNG conversion complete, returning response');
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': `attachment; filename=favicon-${size}x${size}.png`,
            'Cache-Control': 'no-cache'
          }
        });
      }
    } catch (error) {
      console.error('Error processing favicon with sharp:', error);
      return new NextResponse(`Error processing favicon with sharp: ${error.message}`, { status: 500 });
    }
  } catch (error) {
    console.error('General error in favicon API:', error);
    return new NextResponse(`Error in favicon API: ${error.message}`, { status: 500 });
  }
} 