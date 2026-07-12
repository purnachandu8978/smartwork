import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Send, Hash, Users, Sparkles, Smile, MessageSquare, AlertCircle } from "lucide-react";
import { setActiveRoom, addMessage } from "../../features/chatSlice";
import { useSocket } from "../../hooks/useSocket";

const ChatPage = () => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeRoom, rooms, messages, onlineUsers, isConnected } = useSelector((state) => state.chat);

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[activeRoom]]);

  // Join room on activeRoom changes
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit("chat:join", activeRoom);
    }
    return () => {
      if (socket && isConnected) {
        socket.emit("chat:leave", activeRoom);
      }
    };
  }, [activeRoom, socket, isConnected]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket || !isConnected) return;

    socket.emit("chat:message", {
      room: activeRoom,
      content: inputText,
      type: "text",
    });

    setInputText("");
  };

  const getInitials = (sender) => {
    if (!sender) return "U";
    return `${sender.firstName?.[0] || ""}${sender.lastName?.[0] || ""}`.toUpperCase();
  };

  const activeMessages = messages[activeRoom] || [];

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-fade-in">
      {/* Rooms/Channels Sidebar */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-800/40">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Team Chat</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Communicate with your team</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Channels
          </div>
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => dispatch(setActiveRoom(room))}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeRoom === room
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-700"
              }`}
            >
              <Hash className="w-4 h-4 flex-shrink-0" />
              <span>{room}</span>
            </button>
          ))}
        </div>

        {/* Connection status footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {onlineUsers.length} online
          </span>
        </div>
      </div>

      {/* Chat Pane */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-gray-400" />
            <h2 className="font-bold text-gray-900 dark:text-white text-base capitalize">{activeRoom}</h2>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-gray-500">
              <MessageSquare className="w-8 h-8 text-gray-400" />
              <p className="text-sm font-medium">No messages yet in #{activeRoom}</p>
              <p className="text-xs text-gray-400">Send the first message to start the conversation.</p>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
              return (
                <div key={msg._id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                  {/* Sender Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-750 text-gray-800 dark:text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {msg.sender?.avatar ? (
                      <img src={msg.sender.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      getInitials(msg.sender)
                    )}
                  </div>

                  <div className={`space-y-1 max-w-[70%] ${isMe ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 justify-end flex-row-reverse">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {msg.sender?.firstName ? `${msg.sender.firstName} ${msg.sender.lastName}` : "User"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2 text-sm rounded-2xl inline-block ${
                        isMe
                          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-tr-none"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message #${activeRoom}`}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white"
          />
          <button
            type="submit"
            className="p-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
