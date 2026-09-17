import React from 'react';
import { Button } from '@heroui/react';
import { Menu, Bot } from 'lucide-react';
import { ThemeSwitch } from '../components/ThemeSwitch';
import type { User } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeChatTitle?: string;
  user: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  activeChatTitle,
  user,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-app-main bg-app-surface/90 backdrop-blur-md sticky top-0 z-10 select-none">
      <div className="flex items-center gap-2.5">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="rounded-xl border border-app-main text-app-main hover:bg-app-surface-hover cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span className="sr-only">Toggle navigation</span>
        </Button>

        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm"
            style={{ background: 'var(--accent-gradient)' }}
          >
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xs sm:text-sm font-bold text-app-main truncate max-w-[160px] sm:max-w-xs">
              {activeChatTitle || 'New Conversation'}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeSwitch size="sm" />

        {user && (
          <div
            className="text-white font-bold h-8 w-8 rounded-full flex items-center justify-center text-xs shadow-sm select-none"
            style={{ background: 'var(--accent-gradient)' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
};
