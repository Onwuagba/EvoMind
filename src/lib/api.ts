import { api } from './axios';

export type DashboardResponse = {
    status: 'success';
    data: {
        user: {
            firstName: string;
            onboardingComplete: boolean;
        };
        todayMood: number | null;
        streak: {
            count: number;
            achievement: string | null;
            description: string | null;
            nextMilestone: number | null;
        };
        weeklyTrend: Array<{
            day: string;
            mood: number | null;
        }>;
        stats: {
            journalCount: number;
            moodCheckIns: number;
        };
    };
};

export const getDashboardData = async (): Promise<DashboardResponse> => {
    const response = await api.get('/users/dashboard/');
    return response.data;
};

export const saveMoodEntry = async (mood: number): Promise<void> => {
    await api.post('/mood/', { mood });
};

export const createJournalEntry = async (data: {
    content: string;
    mood_score?: number;
}) => {
    const response = await api.post('/journals/', data);
    return response.data;
};

export const analyzeJournalEntry = async (content: string) => {
    const response = await api.post('/analysis/journal/', { content });
    return response.data;
};