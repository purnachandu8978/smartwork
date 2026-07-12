import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
  setConnected,
  addMessage,
  setChatHistory,
  setTyping,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} from "../features/chatSlice";
import { addLiveNotification } from "../features/notificationSlice";
import { liveUpdateTask } from "../features/taskSlice";

export const useSocket = () => {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "/";
    const socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      dispatch(setConnected(true));
    });

    socket.on("disconnect", () => {
      dispatch(setConnected(false));
    });

    // Chat events
    socket.on("chat:message", (message) => {
      dispatch(addMessage({ room: message.room, message }));
    });

    socket.on("chat:history", (messages) => {
      if (messages.length > 0) {
        dispatch(setChatHistory({ room: messages[0].room, messages }));
      }
    });

    socket.on("chat:typing", (data) => {
      dispatch(setTyping(data));
    });

    socket.on("users:online", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("user:online", ({ userId }) => {
      dispatch(addOnlineUser(userId));
    });

    socket.on("user:offline", ({ userId }) => {
      dispatch(removeOnlineUser(userId));
    });

    // Task updates
    socket.on("task:updated", (task) => {
      dispatch(liveUpdateTask(task));
    });

    // Notification updates
    socket.on("notification:new", (notification) => {
      dispatch(addLiveNotification(notification));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, accessToken, dispatch]);

  return socketRef.current;
};

export default useSocket;
