import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  games: {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    status: 'active' | 'maintenance';
    rewards: {
      daily: string;
      weekly: string;
      monthly: string;
    };
  }[];
  userProgress: {
    [gameId: string]: {
      level: number;
      experience: number;
      lastPlayed: string;
      achievements: string[];
    };
  };
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  games: [],
  userProgress: {},
  loading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGames: (state, action: PayloadAction<GameState['games']>) => {
      state.games = action.payload;
    },
    updateUserProgress: (state, action: PayloadAction<{
      gameId: string;
      progress: GameState['userProgress'][string];
    }>) => {
      state.userProgress[action.payload.gameId] = action.payload.progress;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setGames, updateUserProgress, setLoading, setError } = gameSlice.actions;
export default gameSlice.reducer; 