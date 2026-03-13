import { useEffect, useRef, useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAutosaveOptions<T> {
  data: T;
  onSave: () => Promise<void>;
  interval?: number; // in milliseconds
  enabled?: boolean;
}

export function useAutosave<T>({ data, onSave, interval = 30000, enabled = true }: UseAutosaveOptions<T>) {
  const { toast } = useToast();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const previousDataRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasChanges = useCallback(() => {
    const currentData = JSON.stringify(data);
    return currentData !== previousDataRef.current;
  }, [data]);

  const performSave = useCallback(async () => {
    if (!hasChanges() || isSaving) return;

    setIsSaving(true);
    try {
      await onSave();
      previousDataRef.current = JSON.stringify(data);
      setLastSaved(new Date());
      toast({
        title: "Salvato automaticamente",
        description: "Le modifiche sono state salvate",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Errore salvataggio automatico",
        description: "Impossibile salvare le modifiche",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [data, hasChanges, isSaving, onSave, toast]);

  // Set initial data reference
  useEffect(() => {
    if (!previousDataRef.current) {
      previousDataRef.current = JSON.stringify(data);
    }
  }, [data]);

  // Setup autosave interval
  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(() => {
      if (hasChanges()) {
        performSave();
      }
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, interval, hasChanges, performSave]);

  // Save on unmount if there are changes
  useEffect(() => {
    return () => {
      if (hasChanges() && enabled) {
        performSave();
      }
    };
  }, []);

  return {
    lastSaved,
    isSaving,
    hasUnsavedChanges: hasChanges(),
    forceSave: performSave,
  };
}
