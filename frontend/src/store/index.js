import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import taskReducer from "../features/taskSlice";
import projectReducer from "../features/projectSlice";
import notificationReducer from "../features/notificationSlice";
import uiReducer from "../features/uiSlice";
import chatReducer from "../features/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    projects: projectReducer,
    notifications: notificationReducer,
    ui: uiReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setUser"],
      },
    }),
});

export default store;
