/**
 * Vite Plugin: Hero Image Preload Injection
 * 
 * This plugin fetches the current Hero image URL from the CMS during build
 * and injects a <link rel="preload"> tag into index.html for optimal LCP.
 * 
 * Benefits:
 * - Eliminates request chain (HTML → JS → API → Image)
 * - Browser starts downloading hero image immediately
 * - Critical for achieving LCP < 2.5s
 */

import type { Plugin } from 'vite';
import { getHeroImageUrl, getOptimizedHeroUrl } from './scripts/fetch-hero-url';

export function heroPreloadPlugin(): Plugin {
  return {
    name: 'hero-preload-plugin',
    
    // Only run during build (not dev server)
    apply: 'build',
    
    async transformIndexHtml(html: string) {
      try {
        console.log('[Hero Preload] Fetching hero image URL...');
        
        const heroUrl = await getHeroImageUrl();
        
        if (!heroUrl) {
          console.log('[Hero Preload] No hero URL found, skipping preload injection');
          return html;
        }

        const optimizedUrl = getOptimizedHeroUrl(heroUrl);
        console.log('[Hero Preload] Injecting preload for:', optimizedUrl);

        // Create preload tag with high priority
        const preloadTag = `
    <!-- Hero Image Preload (injected by vite-plugin-hero-preload) -->
    <link 
      rel="preload" 
      as="image" 
      href="${optimizedUrl}" 
      fetchpriority="high"
    >`;

        // Inject before </head>
        return html.replace('</head>', `${preloadTag}\n  </head>`);
      } catch (error) {
        console.error('[Hero Preload] Error during preload injection:', error);
        return html;
      }
    },
  };
}
