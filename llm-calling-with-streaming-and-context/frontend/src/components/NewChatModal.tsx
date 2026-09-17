import React, { useState } from 'react';
import { Input, Button } from '@heroui/react';
import { MessageSquarePlus, X } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-app-surface border border-app-main p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-app-main">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ background: 'var(--accent-gradient)' }}
            >
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-app-main leading-tight">
                New Conversation
              </h2>
              <p className="text-xs text-app-muted">
                Set a title to create a new chat session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-app-muted hover:text-app-main p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-app-muted">
              Conversation Title
            </label>
            <Input
              type="text"
              placeholder="e.g. System Architecture, Golang Debugging..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-app-surface-elevated border border-app-main text-app-main text-sm outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-app-muted hover:text-app-main cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isDisabled={!title.trim()}
              className="px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm transition-all duration-200 disabled:opacity-40 cursor-pointer"
              style={{
                background: 'var(--accent-gradient)',
              }}
            >
              Create Chat
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
