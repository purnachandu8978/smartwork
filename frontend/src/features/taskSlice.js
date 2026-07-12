import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../lib/axios";

export const fetchTasks = createAsyncThunk("tasks/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/tasks", { params });
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch tasks");
  }
});

export const fetchKanbanBoard = createAsyncThunk("tasks/fetchKanban", async (projectId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/tasks/kanban", { params: { projectId } });
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createTask = createAsyncThunk("tasks/create", async (data, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/tasks", data);
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create task");
  }
});

export const updateTask = createAsyncThunk("tasks/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update task");
  }
});

export const deleteTask = createAsyncThunk("tasks/delete", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/tasks/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete task");
  }
});

export const updateTaskOrder = createAsyncThunk("tasks/updateOrder", async ({ id, status, order }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/tasks/${id}/order`, { status, order });
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    kanban: { backlog: [], todo: [], in_progress: [], review: [], testing: [], done: [] },
    currentTask: null,
    pagination: null,
    isLoading: false,
    error: null,
    filters: { status: null, priority: null, assignee: null, search: "" },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: null, priority: null, assignee: null, search: "" };
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    // Live update from socket
    liveUpdateTask: (state, action) => {
      const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.tasks[idx] = action.payload;
      // Update kanban
      Object.keys(state.kanban).forEach((col) => {
        const kanbanIdx = state.kanban[col].findIndex((t) => t._id === action.payload._id);
        if (kanbanIdx !== -1) state.kanban[col][kanbanIdx] = action.payload;
      });
    },
    moveKanbanTask: (state, action) => {
      const { taskId, fromStatus, toStatus, newOrder } = action.payload;
      const fromCol = state.kanban[fromStatus];
      const taskIdx = fromCol.findIndex((t) => t._id === taskId);
      if (taskIdx !== -1) {
        const [task] = fromCol.splice(taskIdx, 1);
        task.status = toStatus;
        state.kanban[toStatus].splice(newOrder, 0, task);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchKanbanBoard.fulfilled, (state, action) => {
        state.kanban = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
        const status = action.payload.status;
        if (state.kanban[status]) state.kanban[status].unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
        Object.keys(state.kanban).forEach((col) => {
          state.kanban[col] = state.kanban[col].filter((t) => t._id !== action.payload);
        });
      });
  },
});

export const { setFilters, clearFilters, setCurrentTask, liveUpdateTask, moveKanbanTask } = taskSlice.actions;
export default taskSlice.reducer;
