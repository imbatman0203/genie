import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { chats as chatsApi, messages as messagesApi, models as modelsApi } from "../api/client";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

const LS_MODEL_KEY = "genie.selectedModel";

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messagesList, setMessagesList] = useState([]);

  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem(LS_MODEL_KEY) || ""
  );

  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // ---- Load models once ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await modelsApi.list();
        if (cancelled) return;
        const list = res.models || [];
        setAvailableModels(list);
        // If no model chosen yet (or the stored one is invalid), pick a sensible default
        if (list.length) {
          const stored = localStorage.getItem(LS_MODEL_KEY);
          const isValid = stored && list.some((m) => m.id === stored);
          if (!isValid) {
            const PREFERRED = [
              "openai/gpt-4o-mini",
              "openai/gpt-4o",
              "google/gemini-flash-1.5",
              "google/gemini-2.0-flash-001",
              "anthropic/claude-3.5-sonnet",
              "meta-llama/llama-3.1-8b-instruct",
              "meta-llama/llama-3.3-70b-instruct",
              "deepseek/deepseek-chat",
            ];
            const preferred =
              PREFERRED.map((id) => list.find((m) => m.id === id)).find(Boolean) ||
              list.find((m) => m.id.includes("gpt-4o-mini")) ||
              list.find((m) => m.id.includes("gpt-4o")) ||
              list[0];
            setSelectedModel(preferred.id);
            localStorage.setItem(LS_MODEL_KEY, preferred.id);
          }
        }
      } catch (err) {
        console.warn("Could not load models:", err?.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- Persist model choice ----
  useEffect(() => {
    if (selectedModel) localStorage.setItem(LS_MODEL_KEY, selectedModel);
  }, [selectedModel]);

  // ---- Load recent chats ----
  const loadChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      const res = await chatsApi.recent();
      setChatList(res.chats || []);
    } catch (err) {
      setError(err?.message || "Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      setChatList([]);
      setActiveChatId(null);
      setMessagesList([]);
    }
  }, [user, loadChats]);

  // ---- Select a chat → load messages ----
  const selectChat = useCallback(async (chatId) => {
    setActiveChatId(chatId);
    setMessagesList([]);
    if (!chatId) return;
    setLoadingMessages(true);
    try {
      const res = await messagesApi.list(chatId);
      setMessagesList(res.msg || []);
    } catch (err) {
      setError(err?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ---- New chat (unsaved until first message) ----
  const startNewChat = useCallback(() => {
    setActiveChatId(null);
    setMessagesList([]);
    setError("");
  }, []);

  // ---- Send a message ----
  const sendMessage = useCallback(async (content) => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setError("");
    setSending(true);

    const tempUserMsg = {
      _id: `temp-user-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    // Optimistic append
    setMessagesList((prev) => [...prev, tempUserMsg]);

    try {
      const body = activeChatId
        ? { content: trimmed }
        : { content: trimmed, model: selectedModel };

      const res = await messagesApi.send(activeChatId, body);

      // Replace optimistic user message with the real one + add assistant message
      setMessagesList((prev) => {
        const withoutTemp = prev.filter((m) => m._id !== tempUserMsg._id);
        return [
          ...withoutTemp,
          res.userMessage,
          res.assistantMessage,
        ];
      });

      // If this was a new chat, adopt the returned chatId and refresh the sidebar
      if (!activeChatId) {
        setActiveChatId(res.chatId);
      }
      loadChats();
    } catch (err) {
      // Roll back optimistic message on failure
      setMessagesList((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
      setError(err?.message || "Failed to send message");
      throw err;
    } finally {
      setSending(false);
    }
  }, [activeChatId, selectedModel, sending, loadChats]);

  // ---- Delete a chat ----
  const deleteChat = useCallback(async (chatId) => {
    try {
      await chatsApi.remove(chatId);
      setChatList((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessagesList([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to delete chat");
    }
  }, [activeChatId]);

  const value = {
    chatList,
    activeChatId,
    messagesList,
    availableModels,
    selectedModel,
    setSelectedModel,
    loadingChats,
    loadingMessages,
    sending,
    error,
    setError,
    selectChat,
    startNewChat,
    sendMessage,
    deleteChat,
    reloadChats: loadChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}