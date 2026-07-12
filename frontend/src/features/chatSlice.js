import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    activeRoom: "general",
    rooms: ["general", "engineering", "design", "random"],
    messages: {}, // { roomId: [messages] }
    typingUsers: {}, // { roomId: [{ userId, userName }] }
    onlineUsers: [],
    isConnected: false,
  },
  reducers: {
    setActiveRoom: (state, action) => {
      state.activeRoom = action.payload;
    },
    addMessage: (state, action) => {
      const { room, message } = action.payload;
      if (!state.messages[room]) state.messages[room] = [];
      // Avoid duplicates
      const exists = state.messages[room].find((m) => m._id === message._id);
      if (!exists) state.messages[room].push(message);
    },
    setChatHistory: (state, action) => {
      const { room, messages } = action.payload;
      state.messages[room] = messages;
    },
    setTyping: (state, action) => {
      const { room, userId, userName, isTyping } = action.payload;
      if (!state.typingUsers[room]) state.typingUsers[room] = [];
      if (isTyping) {
        const exists = state.typingUsers[room].find((u) => u.userId === userId);
        if (!exists) state.typingUsers[room].push({ userId, userName });
      } else {
        state.typingUsers[room] = state.typingUsers[room].filter((u) => u.userId !== userId);
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    addRoom: (state, action) => {
      if (!state.rooms.includes(action.payload)) {
        state.rooms.push(action.payload);
      }
    },
  },
});

export const {
  setActiveRoom,
  addMessage,
  setChatHistory,
  setTyping,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setConnected,
  addRoom,
} = chatSlice.actions;
export default chatSlice.reducer;
