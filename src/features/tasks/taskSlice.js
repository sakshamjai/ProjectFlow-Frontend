import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchTasksRequest,
  fetchTasksByProjectRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
  fetchDashboardRequest,
} from './taskAPI';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchTasksRequest();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const fetchTasksByProject = createAsyncThunk('tasks/fetchByProject', async (projectId, { rejectWithValue }) => {
  try {
    const res = await fetchTasksByProjectRequest(projectId);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project tasks');
  }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await createTaskRequest(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await updateTaskRequest(id, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteTaskRequest(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

export const fetchDashboard = createAsyncThunk('tasks/dashboard', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchDashboardRequest();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard data');
  }
});

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    projectTasks: [],
    dashboard: null,
    loading: false,
    projectTasksLoading: false,
    dashboardLoading: false,
    error: null,
    mutating: false,
    mutationError: null,
  },
  reducers: {
    clearTaskError(state) {
      state.error = null;
      state.mutationError = null;
    },
    clearProjectTasks(state) {
      state.projectTasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTasksByProject.pending, (state) => {
        state.projectTasksLoading = true;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.projectTasksLoading = false;
        state.projectTasks = action.payload;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.projectTasksLoading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.mutating = true;
        state.mutationError = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.mutating = false;
        state.list.unshift(action.payload);
        state.projectTasks.unshift(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutating = false;
        state.mutationError = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.mutating = true;
        state.mutationError = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.mutating = false;
        const idx = state.list.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        const pIdx = state.projectTasks.findIndex((t) => t._id === action.payload._id);
        if (pIdx !== -1) state.projectTasks[pIdx] = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutating = false;
        state.mutationError = action.payload;
      })
      .addCase(deleteTask.pending, (state) => {
        state.mutating = true;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.mutating = false;
        state.list = state.list.filter((t) => t._id !== action.payload);
        state.projectTasks = state.projectTasks.filter((t) => t._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.mutating = false;
        state.mutationError = action.payload;
      })
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboardLoading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTaskError, clearProjectTasks } = taskSlice.actions;
export default taskSlice.reducer;
