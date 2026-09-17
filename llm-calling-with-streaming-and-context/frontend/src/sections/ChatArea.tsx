import React, { useRef, useEffect, useCallback } from 'react';
import { Spinner } from '@heroui/react';
import { Navbar } from './Navbar';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { ChatSuggestions } from '../components/ChatSuggestions';
import type { MessageItem, User } from '../types';

interface ChatAreaProps {
  messages: MessageItem[];
  isGenerating: boolean;
  loadingMessages: boolean;
  error: string | null;
  activeChatTitle?: string;
  user: User | null;
  onToggleSidebar: () => void;
  onSendMessage: (msg: string) => void;
  onStopGenerating?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isGenerating,
  loadingMessages,
  error,
  activeChatTitle,
  user,
  onToggleSidebar,
  onSendMessage,
  onStopGenerating,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabledRef = useRef<boolean>(true);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Keep auto-scroll active only if user is within 100px from the bottom
    isAutoScrollEnabledRef.current = scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Auto-scroll to bottom only when user hasn't scrolled up
  useEffect(() => {
    if (isAutoScrollEnabledRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSendMessage = (msg: string) => {
    isAutoScrollEnabledRef.current = true;
    onSendMessage(msg);
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-app-page relative">
      {/* Top Header Navbar */}
      <Navbar
        onToggleSidebar={onToggleSidebar}
        activeChatTitle={activeChatTitle}
        user={user}
      />

      {/* Message Viewport */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto w-full flex flex-col"
      >
        <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
          {loadingMessages ? (
            <div className="m-auto flex flex-col items-center justify-center gap-3 text-app-muted py-16">
              <Spinner size="lg" />
              <span className="text-xs font-medium">Loading history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="m-auto flex flex-col items-center justify-center py-8 w-full">
              <ChatSuggestions onSelectPrompt={handleSendMessage} />
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-4 w-full">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id || index}
                  message={msg}
                  userName={user?.name}
                />
              ))}

              {error && (
                <div className="max-w-4xl mx-auto w-full px-4">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                    {error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Chat Input Bar - pinned at bottom */}
      <div className="w-full shrink-0 bg-app-page py-3 border-t border-app-main/30">
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGenerating={onStopGenerating}
          isGenerating={isGenerating}
          disabled={false}
        />
      </div>
    </div>
  );
};
