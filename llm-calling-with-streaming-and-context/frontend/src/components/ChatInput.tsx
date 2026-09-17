import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Send, CornerDownLeft, Sparkles, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (msg: string) => void;
  onStopGenerating?: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGenerating,
  isGenerating,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isGenerating && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [isGenerating]);

  // Adjust height on text change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isGenerating || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4">
      <div className="relative rounded-2xl bg-app-surface border border-app-main p-2 app-card-shadow focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Please sign in to message...'
              : isGenerating
              ? 'Assistant is typing... You can draft your next question here'
              : 'Message Assistant... (Shift+Enter for newline)'
          }
          disabled={disabled}
          rows={1}
          className="w-full bg-transparent px-2.5 py-1.5 text-sm text-app-main placeholder:text-app-muted/70 leading-relaxed resize-none border-none outline-none focus:outline-none focus:ring-0 max-h-40 overflow-y-auto block"
          style={{ minHeight: '38px' }}
        />

        <div className="flex items-center justify-between pt-1 px-2 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-app-muted select-none">
            <Sparkles className="w-3.5 h-3.5 text-app-accent" />
            <span className="hidden sm:inline text-[11px]">
              {isGenerating ? 'Generating response...' : 'Ready'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isGenerating && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-app-muted mr-1 select-none">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-app-surface-elevated border border-app-main flex items-center gap-0.5">
                  <CornerDownLeft className="w-2.5 h-2.5" /> Enter
                </kbd>
              </div>
            )}

            {isGenerating ? (
              <Button
                size="sm"
                isIconOnly
                onClick={onStopGenerating}
                className="h-8 w-8 min-w-8 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/30 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center p-0 shrink-0"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span className="sr-only">Stop generating</span>
              </Button>
            ) : (
              <Button
                size="sm"
                isIconOnly
                onClick={handleSubmit}
                isDisabled={!text.trim() || disabled}
                className="h-8 w-8 min-w-8 rounded-xl text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-40 cursor-pointer flex items-center justify-center p-0 shrink-0 border-none"
                style={{
                  background: 'var(--accent-gradient)',
                }}
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
