import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import Composer from "../components/Composer";
import EmptyState from "../components/EmptyState";
import { useChat } from "../context/ChatContext";

export default function Chat() {
  const { activeChatId, messagesList, sending, error } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasChat = activeChatId || messagesList.length > 0 || sending;

  return (
    <div className="chat">
      <div
        className={`chat__backdrop ${sidebarOpen ? "chat__backdrop--on" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`chat__sidebar-wrap ${sidebarOpen ? "chat__sidebar-wrap--open" : ""}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <main className="chat__main">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />
        {hasChat ? (
          <MessageList />
        ) : (
          <div className="chat__empty-wrap">
            {error && <div className="msg-error mono">⚠ {error}</div>}
            <EmptyState />
          </div>
        )}
        <Composer />
      </main>
    </div>
  );
}