import { useState, useEffect, useRef } from "react";

/**
 * Centralized hook for tracking unsaved changes in CMS pages.
 * 
 * Solves the false-positive "unsaved changes" bug where saving/publishing
 * triggers state updates that the useEffect interprets as new changes.
 * 
 * Usage:
 *   const { hasChanges, markSaved, setReady } = useChangeTracking([formData, seoData]);
 *   // In fetch/load: call setReady() after initial data is loaded
 *   // In save/publish: call markSaved() instead of setHasChanges(false)
 */
export function useChangeTracking(dependencies: any[]) {
  const [hasChanges, setHasChanges] = useState(false);
  const initialDataLoaded = useRef(false);
  const justSaved = useRef(false);

  useEffect(() => {
    if (justSaved.current) {
      justSaved.current = false;
      return;
    }
    if (initialDataLoaded.current) {
      setHasChanges(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const markSaved = () => {
    justSaved.current = true;
    setHasChanges(false);
  };

  const setReady = () => {
    initialDataLoaded.current = true;
  };

  return { hasChanges, setHasChanges, markSaved, setReady };
}
