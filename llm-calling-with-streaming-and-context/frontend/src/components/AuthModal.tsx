import React, { useState } from 'react';
import { Input, Button } from '@heroui/react';
import { Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<unknown>;
  onRegister: (name: string, email: string, pass: string) => Promise<unknown>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isLoginTab) {
        await onLogin(email, password);
      } else {
        await onRegister(name, email, password);
      }
      onClose();
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-app-surface border border-app-main p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-app-main">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: 'var(--accent-gradient)' }}
            >
              {isLoginTab ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-app-main leading-tight">
                {isLoginTab ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-xs text-app-muted">
                {isLoginTab
                  ? 'Sign in to access your chat history'
                  : 'Register to persist conversation context'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-app-muted hover:text-app-main p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-app-surface-elevated p-1 my-4 border border-app-main">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isLoginTab
                ? 'bg-app-surface text-app-main shadow-sm'
                : 'text-app-muted hover:text-app-main'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              !isLoginTab
                ? 'bg-app-surface text-app-main shadow-sm'
                : 'text-app-muted hover:text-app-main'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {!isLoginTab && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-app-muted flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Full Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-app-surface-elevated border border-app-main text-app-main text-sm outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-app-muted flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-app-surface-elevated border border-app-main text-app-main text-sm outline-none focus:border-amber-500"
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
              className="w-full px-3 py-2 rounded-xl bg-app-surface-elevated border border-app-main text-app-main text-sm outline-none focus:border-amber-500"
            />
          </div>

          <Button
            type="submit"
            isDisabled={loading}
            className="w-full mt-2 font-semibold text-white rounded-xl shadow-md py-2.5 transition-all duration-200 cursor-pointer"
            style={{
              background: 'var(--accent-gradient)',
            }}
          >
            {loading
              ? 'Processing...'
              : isLoginTab
              ? 'Sign In'
              : 'Create Account'}
          </Button>
        </form>
      </div>
    </div>
  );
};
