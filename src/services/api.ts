interface TraumaEvent {
  date: string;
  description: string;
  intensity: number;
  triggers?: string[];
}

interface AIAnalysis {
  emotionalPatterns: string[];
  triggerIdentification: string[];
  copingSuggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendedExercises: string[];
}

export const analyzeJournal = async (entry: string): Promise<AIAnalysis> => {
  const response = await fetch('/api/journal/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ entry }),
  });
  
  return response.json();
};

export const getTherapists = async () => {
  const response = await fetch('/api/therapists');
  return response.json();
};

export const analyzeTraumaPattern = async (event: TraumaEvent) => {
  const response = await fetch('/api/trauma/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  
  return response.json();
};