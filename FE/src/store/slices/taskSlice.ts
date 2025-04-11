import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import taskService, { Task, UserTasks } from '../../services/taskService';

interface TaskState {
  tasks: {
    daily: Task[];
    weekly: Task[];
    special: Task[];
  };
  completedCount: number;
  totalTasks: number;
  loading: boolean;
  error: string | null;
  points: number;
  tokens: number;
  checkInStatus: {
    checkedIn: boolean;
    streak: number;
  };
}

const initialState: TaskState = {
  tasks: {
    daily: [],
    weekly: [],
    special: [],
  },
  completedCount: 0,
  totalTasks: 0,
  loading: false,
  error: null,
  points: 0,
  tokens: 0,
  checkInStatus: {
    checkedIn: false,
    streak: 0,
  },
};

// Async thunks
export const fetchUserTasks = createAsyncThunk(
  'task/fetchUserTasks',
  async (address: string) => {
    const response = await taskService.getUserTasks(address);
    return response.data;
  }
);

export const completeTask = createAsyncThunk(
  'task/completeTask',
  async ({ user, taskId }: { user: string; taskId: string }) => {
    const response = await taskService.completeTask(user, taskId);
    return response.data;
  }
);

export const checkIn = createAsyncThunk(
  'task/checkIn',
  async (address: string) => {
    const response = await taskService.checkIn(address);
    return response.data;
  }
);

export const fetchUserPoints = createAsyncThunk(
  'task/fetchUserPoints',
  async (address: string) => {
    const response = await taskService.getUserPoints(address);
    return response.data;
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Tasks
      .addCase(fetchUserTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action: PayloadAction<UserTasks>) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.completedCount = action.payload.completedCount;
        state.totalTasks = action.payload.totalTasks;
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy nhiệm vụ';
      })
      // Complete Task
      .addCase(completeTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        state.loading = false;
        state.points += action.payload.pointsEarned;
        state.tokens += action.payload.tokensEarned;
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi hoàn thành nhiệm vụ';
      })
      // Check In
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.loading = false;
        state.checkInStatus = {
          checkedIn: true,
          streak: action.payload.streak,
        };
        state.points += action.payload.pointsEarned;
        state.tokens += action.payload.tokensEarned;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi check-in';
      })
      // Fetch User Points
      .addCase(fetchUserPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPoints.fulfilled, (state, action) => {
        state.loading = false;
        state.points = action.payload.points;
        state.tokens = action.payload.tokens;
      })
      .addCase(fetchUserPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Lỗi khi lấy điểm';
      });
  },
});

export const { setLoading, setError } = taskSlice.actions;
export default taskSlice.reducer; 