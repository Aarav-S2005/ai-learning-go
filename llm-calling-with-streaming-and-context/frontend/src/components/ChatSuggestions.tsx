import React from 'react';
import { Card } from '@heroui/react';
import { Code2, Lightbulb, Compass, Sparkles } from 'lucide-react';

interface ChatSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: 'Explain a complex concept',
    prompt: 'Explain how distributed systems achieve consensus in simple terms.',
  },
  {
    icon: Code2,
    title: 'Write or debug code',
    prompt: 'Write a clean example of a concurrent worker queue in Golang with error handling.',
  },
  {
    icon: Sparkles,
    title: 'Brainstorm creative ideas',
    prompt: 'Give me 5 unique product ideas for AI productivity tools.',
  },
  {
    icon: Compass,
    title: 'Draft or summarize text',
    prompt: 'Draft a professional announcement for a new software release.',
  },
];

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4 py-8 text-center animate-float">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4"
        style={{ background: 'var(--accent-gradient)' }}
      >
        <Sparkles className="w-6 h-6" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-app-main mb-2">
        How can I help you today?
      </h2>
      <p className="text-sm text-app-muted max-w-md mb-8">
        Start a new conversation or choose a prompt to begin exploring.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
        {SUGGESTIONS.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="cursor-pointer"
            >
              <Card className="bg-app-surface border border-app-main hover:border-amber-500/60 rounded-2xl app-card-shadow transition-all duration-200 hover:-translate-y-0.5">
                <Card.Content className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1.5 rounded-lg text-white"
                      style={{ background: 'var(--accent-gradient)' }}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-xs text-app-main">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-app-muted line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </p>
                </Card.Content>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
