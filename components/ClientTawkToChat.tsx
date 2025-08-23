'use client';

import dynamic from 'next/dynamic';

// Dynamically import TawkToChat with SSR disabled
const TawkToChat = dynamic(() => import('./TawkToChat'), {
  ssr: false,
  loading: () => null,
});

interface ClientTawkToChatProps {
  propertyId?: string;
  widgetId?: string;
  strategy?: 'afterInteractive' | 'lazyOnload' | 'beforeInteractive';
  showOnMobile?: boolean;
  colorScheme?: 'primary' | 'gradient' | 'accent' | 'dark' | 'vibrant' | 'custom';
  customAttributes?: Record<string, any>;
  respectDashboardSettings?: boolean;
}

export default function ClientTawkToChat({
  propertyId = '68a94038a4fc79192a7cfb10',
  widgetId = '1j3ai5nkj',
  strategy = 'afterInteractive',
  showOnMobile = true,
  colorScheme = 'primary',
  customAttributes = {
    website: 'CheapCC',
    source: 'website'
  },
  respectDashboardSettings = true
}: ClientTawkToChatProps) {
  return (
    <TawkToChat 
      propertyId={propertyId}
      widgetId={widgetId}
      strategy={strategy}
      showOnMobile={showOnMobile}
      colorScheme={colorScheme}
      customAttributes={customAttributes}
      respectDashboardSettings={respectDashboardSettings}
    />
  );
}
