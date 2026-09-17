import React from 'react';
import { Button } from '@heroui/react';
import { Plus, MessageSquare, LogOut, X } from 'lucide-react';
import type { ChatItem, User } from '../types';
import { Logo } from '../components/Logo';
import { ThemeSwitch } from '../components/ThemeSwitch';

interface SidebarProps {
  chats: ChatItem[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onOpenNewChat: () => void;
  user: User | null;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onOpenNewChat,
  user,
  onLogout,
  onCloseMobile,
}) => {
  return (
    <aside className="flex flex-col h-full w-72 sm:w-80 bg-app-sidebar border-r border-app-main select-none">
      {/* Top Header & Logo */}
      <div className="flex items-center justify-between p-4 border-b border-app-main">
        <Logo size={28} />
        <div className="flex items-center gap-1.5">
          <ThemeSwitch size="sm" />
          {onCloseMobile && (
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onClick={onCloseMobile}
              className="md:hidden rounded-lg text-app-muted hover:text-app-main cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </div>

      {/* New Chat Action */}
      <div className="p-3">
        <Button
          fullWidth
          onClick={() => {
            onOpenNewChat();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full font-semibold text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 py-2.5 hover:opacity-95 active:scale-[0.98]"
          style={{
            background: 'var(--accent-gradient)',
          }}
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="text-sm font-semibold">New chat</span>
        </Button>
      </div>

      {/* Chat History List */}
      <div className="flex-1 min-h-0 overflow-hidden px-3 flex flex-col">
        <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-app-muted uppercase tracking-wider shrink-0">
          <span>Recent</span>
          <span className="text-[10px] font-normal lowercase bg-app-surface-elevated px-1.5 py-0.5 rounded border border-app-main">
            {chats.length}
          </span>
        </div>

        <div className="flex-1 min-h-0 space-y-1 py-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-app-muted text-xs gap-2">
              <MessageSquare className="w-6 h-6 opacity-40" />
              <span>No conversations yet.</span>
            </div>
          ) : (
            chats.map((chat) => {
              const isActive = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    onSelectChat(chat.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-app-surface border border-amber-500/50 text-app-main font-semibold app-card-shadow'
                      : 'text-app-muted hover:bg-app-surface-hover hover:text-app-main border border-transparent'
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-app-accent' : 'opacity-60'
                    }`}
                  />
                  <span className="truncate flex-1">{chat.title || 'Untitled'}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* User Profile Footer */}
      {user && (
        <div className="p-3 border-t border-app-main bg-app-surface/50">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-app-surface border border-app-main app-card-shadow">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ background: 'var(--accent-gradient)' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-app-main truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-app-muted truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              onClick={onLogout}
              className="text-app-muted hover:text-red-500 rounded-lg h-7 w-7 min-w-7 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};
