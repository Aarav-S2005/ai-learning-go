import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center rounded-xl p-1.5 shadow-sm transition-all duration-300"
        style={{
          background: 'var(--accent-gradient)',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M16 4L18.8 11.2L26 14L18.8 16.8L16 24L13.2 16.8L6 14L13.2 11.2L16 4Z"
            fill="currentColor"
          />
          <circle cx="23" cy="7" r="2" fill="currentColor" opacity="0.8" />
          <circle cx="9" cy="23" r="1.5" fill="currentColor" opacity="0.8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-base leading-none text-app-main">
            Assistant
          </span>
          <span className="text-[11px] font-medium text-app-muted leading-tight mt-0.5">
            AI Workspace
          </span>
        </div>
      )}
    </div>
  );
};
