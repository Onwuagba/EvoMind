import { useCallback } from 'react';
import { analyzeJournal, analyzeTraumaPattern } from '@/services/api';

export const useAIAnalysis = () => {
  const analyzeEntry = useCallback(async (entry: string) => {
    try {
      return await analyzeJournal(entry);
    } catch (error) {
      console.error('Error analyzing journal entry:', error);
      return null;
    }
  }, []);

  const analyzeTrauma = useCallback(async (event: TraumaEvent) => {
    try {
      return await analyzeTraumaPattern(event);
    } catch (error) {
      console.error('Error analyzing trauma pattern:', error);
      return null;
    }
  }, []);

  return {
    analyzeEntry,
    analyzeTrauma,
  };
};