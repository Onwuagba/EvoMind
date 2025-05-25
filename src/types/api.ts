export interface APIResponse<T> {
  data: T;
  error?: string;
  status: 'success' | 'error';
}

export interface JournalAnalysis {
  emotionalPatterns: string[];
  triggerIdentification: string[];
  copingSuggestions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendedExercises: string[];
}

export interface TherapistResponse {
  id: string;
  name: string;
  specialties: string[];
  availability: string[];
  rating: number;
}