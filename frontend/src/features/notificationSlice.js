import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../lib/axios";

export const fetchNotifications = createAsyncThunk("notifications/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/notifications?limit=30");
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markNotificationRead = createAsyncThunk("notifications/markRead", async (id, { rejectWithValue }) => {
  try {
    await apiClient.patch(`/notifications/${id}/read`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const markAllRead = createAsyncThunk("notifications/markAllRead", async (_, { rejectWithValue }) => {
  try {
    await apiClient.patch("/notifications/mark-all-read");
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    addLiveNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const n = state.notifications.find((n) => n._id === action.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const { addLiveNotification, decrementUnread } = notificationSlice.actions;
export default notificationSlice.reducer;
