import { useState, useCallback } from 'react';
import { UserProgress } from '../types';

const STORAGE_KEY = 'finlit_progress';

function load(): UserProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { completedModules: [], quizScores: {}, toolsUsed: [] };
  } catch {
    return { completedModules: [], quizScores: {}, toolsUsed: [] };
  }
}

function save(p: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(load);

  const completeModule = useCallback((moduleId: string) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        completedModules: prev.completedModules.includes(moduleId)
          ? prev.completedModules
          : [...prev.completedModules, moduleId],
      };
      save(next);
      return next;
    });
  }, []);

  const saveQuizScore = useCallback((moduleId: string, score: number) => {
    setProgress((prev) => {
      const next = { ...prev, quizScores: { ...prev.quizScores, [moduleId]: score } };
      save(next);
      return next;
    });
  }, []);

  const recordToolUse = useCallback((tool: string) => {
    setProgress((prev) => {
      const next = {
        ...prev,
        toolsUsed: prev.toolsUsed.includes(tool) ? prev.toolsUsed : [...prev.toolsUsed, tool],
      };
      save(next);
      return next;
    });
  }, []);

  return { progress, completeModule, saveQuizScore, recordToolUse };
}
