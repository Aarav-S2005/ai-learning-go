import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { Sidebar } from './sections/Sidebar';
import { ChatArea } from './sections/ChatArea';
import { AuthPage } from './sections/AuthPage';
import { NewChatModal } from './components/NewChatModal';
import { Spinner } from '@heroui/react';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);
  const { user, loading, login, register, logout } = useAuth();

  const {
    chats,
    activeChatId,
    messages,
    isGenerating,
    loadingMessages,
    error,
    selectChat,
    startNewChat,
    stopGenerating,
    sendMessage,
  } = useChat(!!user);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  // Synchronize browser history and path changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(path);
  };

  // Auth redirect logic
  useEffect(() => {
    if (loading) return;

    if (!user && currentPath !== '/auth') {
      navigateTo('/auth');
    } else if (user && currentPath === '/auth') {
      navigateTo('/');
    }
  }, [user, loading, currentPath]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-app-page text-app-main">
        <Spinner size="lg" />
      </div>
    );
  }

  // Auth Route (/auth)
  if (!user || currentPath === '/auth') {
    return (
      <AuthPage
        onLogin={async (email, pass) => {
          await login(email, pass);
          navigateTo('/');
        }}
        onRegister={async (name, email, pass) => {
          await register(name, email, pass);
          navigateTo('/');
        }}
      />
    );
  }

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Main Chat Route (/)
  return (
    <div className="fixed inset-0 flex h-full w-full overflow-hidden bg-app-page text-app-main font-sans">
      {/* Desktop Persistent / Collapsible Sidebar */}
      <div
        className={`hidden md:flex h-full shrink-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72 sm:w-80' : 'w-0 overflow-hidden opacity-0 pointer-events-none'
        }`}
      >
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={selectChat}
          onOpenNewChat={() => setIsNewChatModalOpen(true)}
          user={user}
          onLogout={async () => {
            await logout();
            navigateTo('/auth');
          }}
        />
      </div>

      {/* Mobile & Tablet Drawer Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative z-10 flex h-full max-w-xs w-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={selectChat}
              onOpenNewChat={() => setIsNewChatModalOpen(true)}
              user={user}
              onLogout={async () => {
                await logout();
                navigateTo('/auth');
              }}
              onCloseMobile={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Chat Workspace */}
      <ChatArea
        messages={messages}
        isGenerating={isGenerating}
        loadingMessages={loadingMessages}
        error={error}
        activeChatTitle={activeChat?.title}
        user={user}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onSendMessage={sendMessage}
        onStopGenerating={stopGenerating}
      />

      {/* New Chat Title Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onCreate={(title) => {
          startNewChat(title);
        }}
      />
    </div>
  );
};

export default App;
