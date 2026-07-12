import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarCollapsed: false,
    theme: localStorage.getItem("theme") || "light",
    globalSearch: "",
    searchOpen: false,
    activeModal: null,
    modalData: null,
    notifications: [],
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebarCollapsed: (state, action) => { state.sidebarCollapsed = action.payload; },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
      document.documentElement.classList.toggle("dark", state.theme === "dark");
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
      document.documentElement.classList.toggle("dark", action.payload === "dark");
    },
    setGlobalSearch: (state, action) => { state.globalSearch = action.payload; },
    setSearchOpen: (state, action) => { state.searchOpen = action.payload; },
    openModal: (state, action) => {
      state.activeModal = action.payload.name;
      state.modalData = action.payload.data || null;
    },
    closeModal: (state) => { state.activeModal = null; state.modalData = null; },
  },
});

export const { toggleSidebar, setSidebarCollapsed, toggleTheme, setTheme, setGlobalSearch, setSearchOpen, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
