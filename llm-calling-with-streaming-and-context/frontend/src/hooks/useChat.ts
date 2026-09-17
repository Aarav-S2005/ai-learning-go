import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChatItem, MessageItem } from '../types';
import { fetchChats, fetchChatDetails, createChat, streamChatMessage } from '../services/api';

export function useChat(isAuthenticated: boolean) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeChatIdRef = useRef<string | null>(activeChatId);
  activeChatIdRef.current = activeChatId;

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadChats = useCallback(async () => {
    if (!isAuthenticated) {
      setChats([]);
      setActiveChatId(null);
      setMessages([]);
      return;
    }
    setLoadingChats(true);
    try {
      const chatList = await fetchChats();
      setChats(chatList);
      if (chatList.length > 0 && !activeChatIdRef.current) {
        selectChat(chatList[0].id);
      }
    } catch {
      // Ignored if user has no chats yet
    } finally {
      setLoadingChats(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const selectChat = async (chatID: string) => {
    if (isGenerating) {
      stopGenerating();
    }
    setActiveChatId(chatID);
    setLoadingMessages(true);
    setError(null);
    try {
      const details = await fetchChatDetails(chatID);
      setMessages(details.messages || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoadingMessages(false);
    }
  };

  const startNewChat = async (title: string) => {
    const trimmedTitle = title ? title.trim() : '';
    if (!trimmedTitle) {
      return null;
    }

    if (isGenerating) {
      stopGenerating();
    }

    setError(null);
    try {
      const newChat = await createChat(trimmedTitle);
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      setMessages([]);
      return newChat;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
      return null;
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      updated[lastIdx] = {
        ...updated[lastIdx],
        isStreaming: false,
      };
      return updated;
    });
    setIsGenerating(false);
  };

  const sendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || isGenerating) return;

    let currentChatId = activeChatId;

    if (!currentChatId) {
      const title = userPrompt.length > 28 ? userPrompt.slice(0, 28) + '...' : userPrompt;
      const created = await startNewChat(title);
      if (!created) return;
      currentChatId = created.id;
    }

    const newMessage: MessageItem = {
      user_chat: userPrompt,
      llm_response: '',
      created_at: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsGenerating(true);
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    await streamChatMessage({
      chatID: currentChatId,
      message: userPrompt,
      signal: controller.signal,
      onChunk: (chunk: string) => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            llm_response: updated[lastIdx].llm_response + chunk,
            isStreaming: true,
          };
          return updated;
        });
      },
      onComplete: () => {
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            isStreaming: false,
          };
          return updated;
        });
        setIsGenerating(false);
        abortControllerRef.current = null;
        loadChats();
      },
      onError: (errText: string) => {
        setError(errText);
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            llm_response: updated[lastIdx].llm_response || `[Error: ${errText}]`,
            isStreaming: false,
          };
          return updated;
        });
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
    });
  };

  return {
    chats,
    activeChatId,
    messages,
    isGenerating,
    loadingChats,
    loadingMessages,
    error,
    selectChat,
    startNewChat,
    stopGenerating,
    sendMessage,
    loadChats,
  };
}
