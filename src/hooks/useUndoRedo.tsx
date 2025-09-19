import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export const useUndoRedo = <T,>(initialState: T, maxHistorySize = 50) => {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const isUpdating = useRef(false);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const updateState = useCallback((newState: T, addToHistory = true) => {
    if (isUpdating.current) return;
    
    setState(currentState => {
      if (!addToHistory) {
        return {
          ...currentState,
          present: newState
        };
      }

      const newPast = [...currentState.past, currentState.present];
      
      // Limit history size
      if (newPast.length > maxHistorySize) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newState,
        future: []
      };
    });
  }, [maxHistorySize]);

  const undo = useCallback(() => {
    if (!canUndo) return;

    isUpdating.current = true;
    setState(currentState => {
      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future]
      };
    });
    
    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
  }, [canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;

    isUpdating.current = true;
    setState(currentState => {
      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture
      };
    });

    setTimeout(() => {
      isUpdating.current = false;
    }, 0);
  }, [canRedo]);

  const resetHistory = useCallback(() => {
    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: []
    }));
  }, []);

  return {
    state: state.present,
    updateState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory
  };
};