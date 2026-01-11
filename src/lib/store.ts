import { create } from 'zustand';
import { chatService } from './chat';
import type { Message, SessionInfo } from '../../worker/types';
interface ChatStore {
  sessions: SessionInfo[];
  currentSessionId: string | null;
  messages: Message[];
  isProcessing: boolean;
  streamingMessage: string;
  fetchSessions: () => Promise<void>;
  createSession: (firstMessage?: string) => Promise<string | null>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string, model: string) => Promise<void>;
  clearMessages: () => Promise<void>;
}
export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isProcessing: false,
  streamingMessage: '',
  fetchSessions: async () => {
    const res = await chatService.listSessions();
    if (res.success && res.data) {
      set({ sessions: res.data });
    }
  },
  createSession: async (firstMessage) => {
    const res = await chatService.createSession(undefined, undefined, firstMessage);
    if (res.success && res.data) {
      const sessionId = res.data.sessionId;
      await get().fetchSessions();
      await get().selectSession(sessionId);
      return sessionId;
    }
    return null;
  },
  selectSession: async (sessionId) => {
    chatService.switchSession(sessionId);
    set({ currentSessionId: sessionId, messages: [], streamingMessage: '' });
    const res = await chatService.getMessages();
    if (res.success && res.data) {
      set({ messages: res.data.messages || [] });
    }
  },
  deleteSession: async (sessionId) => {
    const res = await chatService.deleteSession(sessionId);
    if (res.success) {
      const { currentSessionId } = get();
      await get().fetchSessions();
      if (currentSessionId === sessionId) {
        set({ currentSessionId: null, messages: [] });
      }
    }
  },
  sendMessage: async (content, model) => {
    const { currentSessionId } = get();
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await get().createSession(content);
      if (!sessionId) return;
    }
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    set(state => ({ 
      messages: [...state.messages, userMsg],
      isProcessing: true,
      streamingMessage: '' 
    }));
    const res = await chatService.sendMessage(content, model, (chunk) => {
      set(state => ({ streamingMessage: state.streamingMessage + chunk }));
    });
    if (res.success) {
      const finalRes = await chatService.getMessages();
      if (finalRes.success && finalRes.data) {
        set({ 
          messages: finalRes.data.messages || [], 
          isProcessing: false, 
          streamingMessage: '' 
        });
        await get().fetchSessions();
      }
    } else {
      set({ isProcessing: false });
    }
  },
  clearMessages: async () => {
    const { currentSessionId } = get();
    if (!currentSessionId) return;
    const res = await chatService.clearMessages();
    if (res.success) {
      set({ messages: [] });
    }
  }
}));