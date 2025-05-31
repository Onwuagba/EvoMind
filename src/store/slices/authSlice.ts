import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface AuthState {
    user: {
        id: string;
        email: string;
        firstName: string;
        onboardingComplete: boolean;
    } | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('accessToken'), // Check if token exists on init
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login/', credentials, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 'error') {
                return rejectWithValue(response.data.error.message);
            }

            localStorage.setItem('accessToken', response.data.data.access);
            localStorage.setItem('refreshToken', response.data.data.refresh);

            return {
                accessToken: response.data.data.access,
                refreshToken: response.data.data.refresh,
                user: response.data.data.user,
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || 'An error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

export const signup = createAsyncThunk(
    'auth/signup',
    async (userData: { email: string; password: string; firstName: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signup/', userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 'error') {
                return rejectWithValue(response.data.error.message);
            }

            localStorage.setItem('accessToken', response.data.data.access);
            localStorage.setItem('refreshToken', response.data.data.refresh);

            return {
                accessToken: response.data.data.access,
                refreshToken: response.data.data.refresh,
                user: {
                    ...response.data.data.user,
                    onboardingComplete: false // New users need onboarding
                },
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || 'An error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

export const updateOnboardingStatus = createAsyncThunk(
    'auth/updateOnboarding',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.patch('/user/onboarding/', 
                { onboardingComplete: true },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                }
            );

            if (response.data.status === 'error') {
                return rejectWithValue(response.data.error.message);
            }

            return response.data.data.user;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || 'An error occurred';
            return rejectWithValue(errorMessage);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        clearError: (state) => {
            state.error = null;
        },
        completeOnboarding: (state) => {
            if (state.user) {
                state.user.onboardingComplete = true;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Signup cases
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update onboarding cases
            .addCase(updateOnboardingStatus.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.onboardingComplete = true;
                }
            });
    },
});

export const { logout, clearError, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;