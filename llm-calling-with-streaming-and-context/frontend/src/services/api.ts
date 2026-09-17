import type { User, ChatItem, ChatDetailResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function fetchMe(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(data.error || 'Invalid email or password');
  }

  return await res.json();
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(data.error || 'Failed to register account');
  }

  return await res.json();
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function fetchChats(): Promise<ChatItem[]> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch chats');
  }
  return await res.json();
}

export async function fetchChatDetails(chatID: string): Promise<ChatDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/chat/${chatID}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch chat details');
  }
  return await res.json();
}

export async function createChat(title?: string, message?: string): Promise<ChatItem> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title, message, stream: false }),
  });
  if (!res.ok) {
    throw new Error('Failed to create new chat');
  }
  return await res.json();
}

export async function streamChatMessage({
  chatID,
  message,
  signal,
  onChunk,
  onComplete,
  onError,
}: {
  chatID: string;
  message: string;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
  onComplete: (data: { chat_id: string; message_id?: string }) => void;
  onError: (err: string) => void;
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${chatID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message, stream: true }),
      signal,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errJson.error || `Server error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Streaming unsupported by browser/network');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const block of lines) {
        if (!block.trim()) continue;

        const dataLine = block.split('\n').find((l) => l.startsWith('data: '));
        if (dataLine) {
          try {
            const parsed = JSON.parse(dataLine.replace(/^data:\s*/, ''));
            if (parsed.chunk) {
              onChunk(parsed.chunk);
            }
            if (parsed.done) {
              onComplete(parsed);
            }
          } catch {
            // Ignore non-json SSE lines
          }
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return;
    }
    const message = err instanceof Error ? err.message : 'Streaming communication failed';
    onError(message);
  }
}
