import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  stats: {
    totalStaked: string;
    totalRewards: string;
    activeFarms: number;
    completedQuests: number;
    gamesPlayed: number;
  };
  recentActivity: {
    id: string;
    type: 'stake' | 'unstake' | 'reward' | 'quest' | 'game';
    amount?: string;
    timestamp: string;
    status: 'success' | 'pending' | 'failed';
  }[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalStaked: '0',
    totalRewards: '0',
    activeFarms: 0,
    completedQuests: 0,
    gamesPlayed: 0,
  },
  recentActivity: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DashboardState['stats']>) => {
      state.stats = action.payload;
    },
    addActivity: (state, action: PayloadAction<DashboardState['recentActivity'][0]>) => {
      state.recentActivity.unshift(action.payload);
      // Giữ tối đa 50 hoạt động gần nhất
      if (state.recentActivity.length > 50) {
        state.recentActivity.pop();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setStats, addActivity, setLoading, setError } = dashboardSlice.actions;
export default dashboardSlice.reducer; 