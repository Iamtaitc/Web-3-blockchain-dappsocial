import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import farmReducer from './slices/farmSlice';
import gameReducer from './slices/gameSlice';
import questReducer from './slices/questSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    farm: farmReducer,
    game: gameReducer,
    quest: questReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 