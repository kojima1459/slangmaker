/**
 * AdBanner Component - Adsterra Iframe Banner
 * 300x250 Iframe Sync Ad
 */
import { useEffect, useRef } from 'react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className = '' }: AdBannerProps) {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Only load once
    if (scriptLoaded.current || !adContainerRef.current) return;
    scriptLoaded.current = true;

    // Set Adsterra options on window
    (window as any).atOptions = {
      'key': '2d59ff146d272b4426d1316065ec0ac1',
      'format': 'iframe',
      'height': 250,
      'width': 300,
      'params': {}
    };

    // Create and append the ad script
    const script = document.createElement('script');
    script.src = 'https://www.highperformanceformat.com/2d59ff146d272b4426d1316065ec0ac1/invoke.js';
    script.async = true;
    
    adContainerRef.current.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (adContainerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={adContainerRef}
      className={`flex justify-center items-center my-4 ${className}`}
      style={{ minHeight: '250px', minWidth: '300px' }}
    />
  );
}
