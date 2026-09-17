export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface ChatItem {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageItem {
  id?: string;
  chat_id?: string;
  user_chat: string;
  llm_response: string;
  created_at?: string;
  isStreaming?: boolean;
}

export interface ChatDetailResponse {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: MessageItem[];
}
