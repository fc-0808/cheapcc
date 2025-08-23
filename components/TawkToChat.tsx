'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Extend the Window interface to include Tawk_API
declare global {
  interface Window {
    Tawk_API?: {
      onLoad?: () => void;
      onStatusChange?: (status: string) => void;
      onOfflineFormSubmit?: () => void;
      onChatMaximized?: () => void;
      onChatMinimized?: () => void;
      onChatHidden?: () => void;
      onChatStarted?: () => void;
      onChatEnded?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      setAttributes?: (attributes: Record<string, any>, callback?: () => void) => void;
      // Error handling properties
      onError?: (error: any) => void;
    };
    Tawk_LoadStart?: Date;
    // Add flag to track if Tawk.to loaded successfully
    Tawk_LoadedSuccessfully?: boolean;
  }
}

interface TawkToChatProps {
  /** Tawk.to Property ID */
  propertyId?: string;
  /** Tawk.to Widget ID */
  widgetId?: string;
  /** Custom loading strategy */
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
  /** Whether to show the widget on mobile devices */
  showOnMobile?: boolean;
  /** Custom attributes to set when chat loads */
  customAttributes?: Record<string, any>;
  /** Callback when chat is loaded */
  onLoad?: () => void;
  /** Callback when chat status changes */
  onStatusChange?: (status: string) => void;
  /** Color scheme configuration */
  colorScheme?: 'primary' | 'gradient' | 'accent' | 'dark' | 'vibrant' | 'custom';
  /** Custom colors (only used when colorScheme is 'custom') */
  customColors?: {
    header?: string;
    headerText?: string;
    agentMessage?: string;
    agentText?: string;
    userMessage?: string;
    userText?: string;
  };
  /** Whether to respect dashboard visibility settings (true) or force widget to show (false) */
  respectDashboardSettings?: boolean;
}

const TawkToChat: React.FC<TawkToChatProps> = ({
  propertyId = '68a94038a4fc79192a7cfb10',
  widgetId = '1j3ai5nkj',
  strategy = 'afterInteractive', // Changed from lazyOnload to load earlier
  showOnMobile = true,
  customAttributes,
  onLoad,
  onStatusChange,
  colorScheme = 'primary',
  customColors,
  respectDashboardSettings = true,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Predefined color schemes based on CheapCC brand
  const colorSchemes = {
    primary: {
      header: '#2c2d5a',
      headerText: '#ffffff',
      agentMessage: '#ff3366',
      agentText: '#ffffff',
      userMessage: '#33347b',
      userText: '#ffffff',
    },
    gradient: {
      header: '#1a1a2e',
      headerText: '#ffffff',
      agentMessage: '#d946ef',
      agentText: '#ffffff',
      userMessage: '#484a9e',
      userText: '#ffffff',
    },
    accent: {
      header: '#ff3366',
      headerText: '#ffffff',
      agentMessage: '#33347b',
      agentText: '#ffffff',
      userMessage: '#ff6b8b',
      userText: '#ffffff',
    },
    dark: {
      header: '#111827',
      headerText: '#ffffff',
      agentMessage: '#374151',
      agentText: '#ffffff',
      userMessage: '#ff3366',
      userText: '#ffffff',
    },
    vibrant: {
      header: '#e11d48',
      headerText: '#ffffff',
      agentMessage: '#2c2d5a',
      agentText: '#ffffff',
      userMessage: '#10b981',
      userText: '#ffffff',
    },
  };

  // Get the active color scheme
  const activeColors = colorScheme === 'custom' ? customColors : colorSchemes[colorScheme];

  // Function to apply color scheme via CSS injection
  const applyColorScheme = () => {
    if (!activeColors) return;

    const styleId = 'tawk-custom-colors';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const css = `
      /* Tawk.to Custom Color Scheme */
      #tawkchat-container .tawk-chatbox-header {
        background-color: ${activeColors.header} !important;
        color: ${activeColors.headerText} !important;
      }
      
      #tawkchat-container .tawk-chatbox-header .tawk-chatbox-title {
        color: ${activeColors.headerText} !important;
      }
      
      #tawkchat-container .tawk-message-agent .tawk-message-wrapper {
        background-color: ${activeColors.agentMessage} !important;
        color: ${activeColors.agentText} !important;
      }
      
      #tawkchat-container .tawk-message-visitor .tawk-message-wrapper {
        background-color: ${activeColors.userMessage} !important;
        color: ${activeColors.userText} !important;
      }
      
      #tawkchat-container .tawk-button-primary {
        background-color: ${activeColors.agentMessage} !important;
        color: ${activeColors.agentText} !important;
        border-color: ${activeColors.agentMessage} !important;
      }
      
      #tawkchat-container .tawk-button-primary:hover {
        background-color: ${activeColors.userMessage} !important;
        border-color: ${activeColors.userMessage} !important;
      }
      
      /* Widget bubble colors */
      #tawkchat-minified-container {
        background-color: ${activeColors.header} !important;
      }
      
      #tawkchat-minified-container .tawk-minified-button {
        background-color: ${activeColors.header} !important;
        color: ${activeColors.headerText} !important;
      }
    `;

    styleElement.innerHTML = css;
  };

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Set up Tawk_API callbacks when component mounts (only on client side)
    if (isClient && typeof window !== 'undefined') {
      try {
        // Initialize Tawk_API with error protection
        window.Tawk_API = window.Tawk_API || {};
        
                 // Set up onLoad callback with minimal interference
         window.Tawk_API.onLoad = () => {
           try {
             setIsLoaded(true);
             window.Tawk_LoadedSuccessfully = true;
             
             // Set custom attributes if provided
             if (customAttributes && window.Tawk_API?.setAttributes) {
               try {
                 window.Tawk_API.setAttributes(customAttributes);
               } catch (attrError) {
                 console.warn('Error setting Tawk.to attributes:', attrError);
               }
             }
             
             // Handle mobile visibility - only hide if explicitly requested
             if (isMobile && !showOnMobile && window.Tawk_API?.hideWidget) {
               try {
                 window.Tawk_API.hideWidget();
               } catch (hideError) {
                 console.warn('Error hiding Tawk.to widget:', hideError);
               }
             }
            
            // Apply color scheme if available
            if (activeColors) {
              try {
                applyColorScheme();
              } catch (styleError) {
                console.warn('Error applying Tawk.to color scheme:', styleError);
              }
            }

            // Call custom onLoad callback
            if (onLoad) {
              try {
                onLoad();
              } catch (callbackError) {
                console.warn('Error in Tawk.to onLoad callback:', callbackError);
              }
            }
            
          } catch (loadError) {
            console.error('Error in Tawk.to onLoad handler:', loadError);
            setHasError(true);
          }
        };
        
                 // Set up onStatusChange callback with error handling
         window.Tawk_API.onStatusChange = (status: string) => {
           try {
             if (onStatusChange) {
               onStatusChange(status);
             }
           } catch (statusError) {
             console.warn('Error in Tawk.to onStatusChange:', statusError);
           }
         };

        // Set up error handler
        window.Tawk_API.onError = (error: any) => {
          console.error('Tawk.to internal error:', error);
          setHasError(true);
        };
        
        // Initialize Tawk_LoadStart
        window.Tawk_LoadStart = new Date();
        
      } catch (initError) {
        console.error('Error initializing Tawk.to:', initError);
        setHasError(true);
      }
    }
  }, [customAttributes, showOnMobile, isMobile, onLoad, onStatusChange, isClient, activeColors]);

  // Don't render on mobile if showOnMobile is false (only check after client-side hydration)
  if (isClient && isMobile && !showOnMobile) {
    return null;
  }

  const tawkScript = `
    try {
      // Initialize Tawk_API and set start time
      var Tawk_API = Tawk_API || {};
      var Tawk_LoadStart = new Date();
      
      // Initialize Tawk_API without forcing visibility
      // Removed explicit showWidget initialization to respect dashboard settings
      
      // Initializing Tawk.to widget (reduced logging to respect dashboard settings)
      
      // Add global error handler for Tawk.to
      window.addEventListener('error', function(event) {
        if (event.filename && event.filename.includes('tawk.to')) {
          console.warn('Tawk.to script error caught:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno
          });
          // Don't prevent other error handlers
          return false;
        }
      });
      
      // Load Tawk.to script
      (function(){
        var s1 = document.createElement("script");
        var s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/${propertyId}/${widgetId}';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', 'anonymous');
        
        // Add error handler to script element
        s1.onerror = function(error) {
          console.error('Failed to load Tawk.to script:', error);
          window.Tawk_LoadedSuccessfully = false;
        };
        
        s1.onload = function() {
          window.Tawk_LoadedSuccessfully = true;
        };
        
        if (s0 && s0.parentNode) {
          s0.parentNode.insertBefore(s1, s0);
        } else {
          document.head.appendChild(s1);
        }
      })();
      
      // Respect dashboard settings - only set basic attributes
      setTimeout(function() {
        if (window.Tawk_API && typeof window.Tawk_API.setAttributes === 'function') {
          try {
            window.Tawk_API.setAttributes({
              name: 'CheapCC User',
              email: '',
              hash: ''
            });
          } catch (e) {
            console.warn('Could not set Tawk.to attributes:', e);
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error initializing Tawk.to script:', error);
      window.Tawk_LoadedSuccessfully = false;
    }
  `;

  // Don't render anything on server side or if not client
  if (!isClient) {
    return null;
  }

  // Show error state or fallback if needed
  if (hasError) {
    console.warn('Tawk.to chat widget encountered an error and is disabled');
    return null; // Gracefully degrade - no chat widget but page still works
  }

  return (
    <>
      <Script
        id="tawk-to-chat"
        strategy={strategy}
        dangerouslySetInnerHTML={{
          __html: tawkScript,
        }}
        onLoad={() => {
          console.log('Tawk.to script loaded successfully');
          // Set a timeout to check if Tawk.to actually initialized
          setTimeout(() => {
            if (!window.Tawk_LoadedSuccessfully && typeof window.Tawk_API === 'undefined') {
              console.warn('Tawk.to failed to initialize properly');
              setHasError(true);
            } else {
              // Additional debugging - check if widget container exists
              const tawkContainer = document.querySelector('#tawkchat-container, #tawkchat-minified-container, [id*="tawk"]');
              console.log('Tawk.to DOM elements found:', {
                containers: tawkContainer ? 'Found' : 'Not found',
                API: typeof window.Tawk_API,
                LoadedSuccessfully: window.Tawk_LoadedSuccessfully
              });
              
              // Check if any Tawk.to elements exist in DOM
              const allTawkElements = document.querySelectorAll('[id*="tawk"], [class*="tawk"]');
              console.log('All Tawk.to elements in DOM:', allTawkElements.length);
              
              if (allTawkElements.length === 0) {
                console.warn('No Tawk.to DOM elements found - widget may not be visible');
              }
            }
          }, 5000); // Give Tawk.to 5 seconds to initialize
        }}
        onError={(error) => {
          console.error('Error loading Tawk.to script:', error);
          setHasError(true);
        }}
      />
      
      {/* Preconnect to Tawk.to domains for better performance */}
      <link rel="preconnect" href="https://embed.tawk.to" />
      <link rel="dns-prefetch" href="https://tawk.to" />
      <link rel="dns-prefetch" href="https://va.tawk.to" />
      
      {/* Add error boundary style for any Tawk.to errors */}
      <style jsx>{`
        /* Hide Tawk.to widget if it causes layout issues */
        #tawkchat-container.error {
          display: none !important;
        }
      `}</style>
      
      {/* Removed debug monitoring to avoid interference with widget behavior */}
    </>
  );
};

export default TawkToChat;
