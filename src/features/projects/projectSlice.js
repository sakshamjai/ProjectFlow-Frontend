import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchProjectsRequest,
  fetchProjectByIdRequest,
  createProjectRequest,
  updateProjectRequest,
  deleteProjectRequest,
} from './projectAPI';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await fetchProjectsRequest();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
  }
});

export const fetchProjectById = createAsyncThunk('projects/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await fetchProjectByIdRequest(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch project');
  }
});

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try {
    const res = await createProjectRequest(data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create project');
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await updateProjectRequest(id, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update project');
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteProjectRequest(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    selected: null,
    loading: false,
    selectedLoading: false,
    error: null,
    mutating: false,
    mutationError: null,
  },
  reducers: {
    clearProjectError(state) {
      state.error = null;
      state.mutationError = null;
    },
    clearSelectedProject(state) {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.selectedLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.error = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.mutating = true;
        state.mutationError = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.mutating = false;
        state.list.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.mutating = false;
        state.mutationError = action.payload;
      })
      .addCase(updateProject.pending, (state) => {
        state.mutating = true;
        state.mutationError = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.mutating = false;
        const idx = state.list.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected?._id === action.payload._id) state.selected = action.payload;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.mutating = false;
        state.mutationError = action.payload;
      })
      .addCase(deleteProject.pending, (state) => {
        state.mutating = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.mutating = false;
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.mutating = false;
        state.mutationError = action.payload;
      });
  },
});

export const { clearProjectError, clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
