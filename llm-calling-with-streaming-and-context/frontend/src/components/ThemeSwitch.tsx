import React from 'react';
import { Button } from '@heroui/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const ThemeSwitch: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      isIconOnly
      size={size}
      variant="ghost"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-xl border border-app-main bg-app-surface text-app-main hover:bg-app-surface-hover transition-all duration-200 cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-orange-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </Button>
  );
};
