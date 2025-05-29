import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';

interface AuthState {
    user: any | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
    refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
    isLoading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/v1/auth/login/', credentials);

            // Save tokens to localStorage
            localStorage.setItem('accessToken', response.data.data.access);
            localStorage.setItem('refreshToken', response.data.data.refresh);
            localStorage.setItem('firstName', response.data.data.first_name);

            return {
                accessToken: response.data.data.access,
                refreshToken: response.data.data.refresh,
                firstName: response.data.data.first_name
            };
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || 'Login failed';
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
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;