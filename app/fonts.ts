import { Inter, Roboto_Mono } from 'next/font/google';

// Define your fonts
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

// For code blocks and monospaced content
export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
  preload: true,
  fallback: ['monospace'],
});

// Create a utility function to get all font variables
export function getFontVariables() {
  return [inter.variable, robotoMono.variable].join(' ');
} 