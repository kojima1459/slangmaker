/**
 * Adsterra Ad Banner Component
 * 300x250 Medium Rectangle format
 */
import { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className = '' }: AdBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current || !adContainerRef.current) return;
    
    // Set atOptions before loading the script
    (window as any).atOptions = {
      'key': '2d59ff146d272b4426d1316065ec0ac1',
      'format': 'iframe',
      'height': 250,
      'width': 300,
      'params': {}
    };

    // Create and append the script
    const script = document.createElement('script');
    script.src = 'https://www.highperformanceformat.com/2d59ff146d272b4426d1316065ec0ac1/invoke.js';
    script.async = true;
    
    adContainerRef.current.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      // Cleanup is tricky with ads, leaving as is
    };
  }, []);

  return (
    <div 
      ref={adContainerRef}
      className={`flex justify-center items-center my-4 ${className}`}
      style={{ minHeight: '250px', minWidth: '300px' }}
    >
      {/* Ad will be injected here by the script */}
    </div>
  );
}
