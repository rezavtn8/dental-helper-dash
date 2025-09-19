import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface AutoSaveOptions {
  delay?: number;
  onSave: (data: any) => Promise<boolean>;
  enabled?: boolean;
}

export const useAutoSave = <T,>(data: T, options: AutoSaveOptions) => {
  const { delay = 2000, onSave, enabled = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>();
  const isInitialMount = useRef(true);

  const saveData = useCallback(async (dataToSave: T) => {
    try {
      const success = await onSave(dataToSave);
      if (success) {
        lastSavedRef.current = JSON.stringify(dataToSave);
        toast.success('Progress saved automatically', { 
          duration: 2000,
          position: 'bottom-right' 
        });
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Failed to auto-save progress');
    }
  }, [onSave]);

  const debouncedSave = useCallback((dataToSave: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveData(dataToSave);
    }, delay);
  }, [saveData, delay]);

  useEffect(() => {
    if (!enabled || isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const currentDataString = JSON.stringify(data);
    
    // Only save if data has actually changed
    if (currentDataString !== lastSavedRef.current) {
      debouncedSave(data);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debouncedSave, enabled]);

  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData(data);
  }, [data, saveData]);

  return { forceSave };
};