import React, { useState } from 'react';
import { Card, Button } from '@heroui/react';
import { Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import type { MessageItem } from '../types';

interface ChatMessageProps {
  message: MessageItem;
  userName?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, userName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.llm_response) return;
    navigator.clipboard.writeText(message.llm_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full py-2">
      {/* User Turn */}
      {message.user_chat && (
        <div className="flex items-start justify-end gap-3 pl-8 sm:pl-16">
          <div className="flex flex-col items-end max-w-[85%]">
            <span className="text-[11px] font-medium text-app-muted mb-1 px-1">
              {userName || 'You'}
            </span>
            <div className="user-bubble rounded-2xl rounded-tr-xs px-4 py-3 text-sm leading-relaxed shadow-md select-text break-words">
              {message.user_chat}
            </div>
          </div>
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 mt-3.5 shadow-sm text-xs"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <User className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Assistant Turn */}
      {(message.llm_response || message.isStreaming) && (
        <div className="flex items-start justify-start gap-3 pr-8 sm:pr-16">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 mt-1 shadow-sm text-xs"
            style={{ background: 'var(--accent-secondary, #ea580c)' }}
          >
            <Bot className="w-4 h-4" />
          </div>

          <div className="flex flex-col items-start max-w-[90%] w-full min-w-0">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-semibold text-app-main flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-app-accent" />
                Assistant
              </span>
              {message.isStreaming && (
                <span className="text-[10px] uppercase font-bold text-amber-500 animate-pulse">
                  Streaming...
                </span>
              )}
            </div>

            <Card className="ai-bubble w-full rounded-2xl rounded-tl-xs app-card-shadow transition-all duration-200">
              <Card.Content className="p-4 text-sm leading-relaxed">
                <div className="whitespace-pre-wrap select-text font-normal text-app-main break-words overflow-x-auto">
                  {message.llm_response}
                  {message.isStreaming && <span className="stream-cursor" />}
                </div>

                {!message.isStreaming && message.llm_response && (
                  <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-app-main/50">
                    <Button
                      size="sm"
                      variant="ghost"
                      isIconOnly
                      onClick={handleCopy}
                      className="h-7 w-7 min-w-7 rounded-lg text-app-muted hover:text-app-main hover:bg-app-surface-hover cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="sr-only">{copied ? 'Copied' : 'Copy response'}</span>
                    </Button>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
