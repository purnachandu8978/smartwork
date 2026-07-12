import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../lib/axios";

export const fetchProjects = createAsyncThunk("projects/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/projects", { params });
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createProject = createAsyncThunk("projects/create", async (data, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/projects", data);
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProject = createAsyncThunk("projects/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const deleteProject = createAsyncThunk("projects/delete", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/projects/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const projectSlice = createSlice({
  name: "projects",
  initialState: {
    projects: [],
    currentProject: null,
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setCurrentProject: (state, action) => { state.currentProject = action.payload; },
    clearCurrentProject: (state) => { state.currentProject = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.data || action.payload;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(createProject.fulfilled, (state, action) => { state.projects.unshift(action.payload); })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.projects.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.projects[idx] = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setCurrentProject, clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
