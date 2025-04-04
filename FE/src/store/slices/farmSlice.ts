import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FarmState {
  farms: {
    id: string;
    name: string;
    apy: number;
    totalStaked: string;
    userStaked: string;
    rewards: number;
    status: 'active' | 'inactive';
  }[];
  selectedFarm: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: FarmState = {
  farms: [],
  selectedFarm: null,
  loading: false,
  error: null,
};

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    setFarms: (state, action: PayloadAction<FarmState['farms']>) => {
      state.farms = action.payload;
    },
    setSelectedFarm: (state, action: PayloadAction<string>) => {
      state.selectedFarm = action.payload;
    },
    updateFarmStake: (state, action: PayloadAction<{ farmId: string; amount: string }>) => {
      const farm = state.farms.find(f => f.id === action.payload.farmId);
      if (farm) {
        farm.userStaked = action.payload.amount;
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

export const { setFarms, setSelectedFarm, updateFarmStake, setLoading, setError } = farmSlice.actions;
export default farmSlice.reducer; 