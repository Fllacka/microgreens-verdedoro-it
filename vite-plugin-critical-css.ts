/**
 * Vite Plugin: Critical CSS Inlining
 * 
 * Uses Google's Critters library to automatically:
 * 1. Extract critical above-the-fold CSS
 * 2. Inline it into <style> tags in the HTML
 * 3. Lazy-load the remaining CSS asynchronously
 * 
 * This eliminates render-blocking CSS requests.
 */

import type { Plugin } from 'vite';

export function criticalCssPlugin(): Plugin {
  return {
    name: 'critical-css-plugin',
    apply: 'build',
    enforce: 'post',

    async transformIndexHtml(html: string) {
      try {
        // Dynamic import to avoid issues with ESM/CJS
        // @ts-ignore - critters types don't resolve via package.json exports
        const { default: Critters } = await import('critters');
        
        const critters = new Critters({
          // Inline critical CSS, lazy-load the rest
          preload: 'swap',
          // Don't remove the original CSS file (it gets lazy-loaded)
          pruneSource: false,
          // Reduce logging
          logLevel: 'warn',
        });

        const result = await critters.process(html);
        console.log('[Critical CSS] Successfully inlined critical CSS');
        return result;
      } catch (error) {
        console.error('[Critical CSS] Error processing HTML:', error);
        // Return original HTML if critters fails
        return html;
      }
    },
  };
}
