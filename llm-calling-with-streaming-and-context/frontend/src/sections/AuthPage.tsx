import React, { useState } from 'react';
import { Input, Button } from '@heroui/react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeSwitch } from '../components/ThemeSwitch';

interface AuthPageProps {
  onLogin: (email: string, pass: string) => Promise<unknown>;
  onRegister: (name: string, email: string, pass: string) => Promise<unknown>;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister(name, email, password);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-app-page text-app-main selection:bg-amber-500/20">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-app-main bg-app-surface/60 backdrop-blur-sm">
        <Logo size={28} />
        <ThemeSwitch size="sm" />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-app-surface border border-app-main rounded-3xl p-6 sm:p-8 app-card-shadow transition-all duration-200">
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md mb-3"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {activeTab === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <h1 className="text-2xl font-bold text-app-main tracking-tight">
              {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-xs text-app-muted mt-1">
              {activeTab === 'login'
                ? 'Enter your credentials to access your chat history'
                : 'Sign up to start chatting and saving conversations'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-app-surface-elevated p-1 mb-6 border border-app-main">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-app-surface text-app-main shadow-sm'
                  : 'text-app-muted hover:text-app-main'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-app-surface text-app-main shadow-sm'
                  : 'text-app-muted hover:text-app-main'
              }`}
            >
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {activeTab === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-app-muted flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" /> Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-app-surface-elevated border border-app-main text-app-main text-sm outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-app-muted flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-app-surface-elevated border border-app-main text-app-main text-sm outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-app-muted flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-app-surface-elevated border border-app-main text-app-main text-sm outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <Button
              type="submit"
              isDisabled={loading}
              className="w-full mt-2 font-semibold text-white rounded-xl shadow-md py-3 text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'var(--accent-gradient)',
              }}
            >
              {loading
                ? 'Please wait...'
                : activeTab === 'login'
                ? 'Sign In'
                : 'Create Account'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};
