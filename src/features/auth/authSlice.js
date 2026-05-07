import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginRequest, getMeRequest, logoutRequest, createUserRequest, getUsersRequest } from './authAPI';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await loginRequest(credentials);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await getMeRequest();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutRequest();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

export const createUser = createAsyncThunk('auth/createUser', async (userData, { rejectWithValue }) => {
  try {
    const res = await createUserRequest(userData);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create user');
  }
});

export const fetchUsers = createAsyncThunk('auth/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await getUsersRequest();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    users: [],
    usersLoading: false,
    isAuthenticated: false,
    loading: false,
    bootstrapping: true,
    error: null,
    createUserLoading: false,
    createUserError: null,
    createUserSuccess: false,
  },
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearCreateUserState(state) {
      state.createUserError = null;
      state.createUserSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMe.pending, (state) => {
        state.bootstrapping = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.bootstrapping = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.bootstrapping = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.users = [];
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        // Even if API fails, clear local state
        state.user = null;
        state.users = [];
        state.isAuthenticated = false;
      })
      .addCase(createUser.pending, (state) => {
        state.createUserLoading = true;
        state.createUserError = null;
        state.createUserSuccess = false;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createUserLoading = false;
        state.createUserSuccess = true;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserLoading = false;
        state.createUserError = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.usersLoading = false;
      });
  },
});

export const { clearAuthError, clearCreateUserState } = authSlice.actions;
export default authSlice.reducer;
