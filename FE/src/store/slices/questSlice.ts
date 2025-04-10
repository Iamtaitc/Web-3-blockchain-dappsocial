import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Quest {
  id: number;
  icon: "twitter" | "youtube" | "discord" | "telegram";
  title: string;
  description: string;
  reward: string;
  status: "available" | "completed" | "locked";
  url: string;
  category: "daily" | "weekly" | "special";
}

interface QuestState {
  quests: Quest[];
  completedQuests: number[];
  activeCategory: "daily" | "weekly" | "special";
  loading: boolean;
  error: string | null;
}

const initialState: QuestState = {
  quests: [],
  completedQuests: [],
  activeCategory: "daily",
  loading: false,
  error: null,
};

const questSlice = createSlice({
  name: 'quest',
  initialState,
  reducers: {
    setQuests: (state, action: PayloadAction<Quest[]>) => {
      state.quests = action.payload;
    },
    setActiveCategory: (state, action: PayloadAction<QuestState['activeCategory']>) => {
      state.activeCategory = action.payload;
    },
    completeQuest: (state, action: PayloadAction<number>) => {
      const quest = state.quests.find(q => q.id === action.payload);
      if (quest) {
        quest.status = "completed";
        state.completedQuests.push(action.payload);
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

export const { setQuests, setActiveCategory, completeQuest, setLoading, setError } = questSlice.actions;
export default questSlice.reducer; 