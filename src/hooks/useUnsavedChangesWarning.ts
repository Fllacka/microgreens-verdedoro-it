import { useEffect, useCallback } from "react";
import { useBlocker } from "react-router-dom";

interface UseUnsavedChangesWarningOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

export function useUnsavedChangesWarning({
  hasUnsavedChanges,
  message = "Hai modifiche non salvate. Sei sicuro di voler uscire?",
}: UseUnsavedChangesWarningOptions) {
  // Handle browser navigation (refresh, close tab, external links)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  // Handle React Router navigation
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
      [hasUnsavedChanges]
    )
  );

  return {
    blocker,
    isBlocked: blocker.state === "blocked",
    proceed: blocker.proceed,
    reset: blocker.reset,
  };
}
