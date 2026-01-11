import { create } from 'zustand';
import { chatService } from './chat';
import { toast } from 'sonner';
import type { Message, SessionInfo, KnowledgeGraph } from '../../worker/types';
interface ChatStore {
  sessions: SessionInfo[];
  currentSessionId: string | null;
  messages: Message[];
  isProcessing: boolean;
  streamingMessage: string;
  kgData: KnowledgeGraph | undefined;
  fetchSessions: () => Promise<void>;
  createSession: (firstMessage?: string) => Promise<string | null>;
  selectSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string, model: string) => Promise<void>;
  clearMessages: () => Promise<void>;
  setKgData: (data: KnowledgeGraph) => void;
}
export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isProcessing: false,
  streamingMessage: '',
  kgData: undefined,
  setKgData: (data) => set({ kgData: data }),
  fetchSessions: async () => {
    try {
      const res = await chatService.listSessions();
      if (res.success && res.data) {
        set({ sessions: res.data });
      }
    } catch (error) {
      toast.error("Failed to sync sketches");
    }
  },
  createSession: async (firstMessage) => {
    try {
      const res = await chatService.createSession(undefined, undefined, firstMessage);
      if (res.success && res.data) {
        const sessionId = res.data.sessionId;
        await get().fetchSessions();
        await get().selectSession(sessionId);
        return sessionId;
      }
      return null;
    } catch (error) {
      toast.error("Sketch creation failed");
      return null;
    }
  },
  selectSession: async (sessionId) => {
    try {
      chatService.switchSession(sessionId);
      set({ currentSessionId: sessionId, messages: [], streamingMessage: '', kgData: undefined });
      const res = await chatService.getMessages();
      if (res.success && res.data) {
        set({ 
          messages: res.data.messages || [],
          kgData: res.data.kg
        });
      }
    } catch (error) {
      toast.error("Could not open sketchbook");
    }
  },
  deleteSession: async (sessionId) => {
    try {
      const res = await chatService.deleteSession(sessionId);
      if (res.success) {
        const currentSessionId = get().currentSessionId;
        await get().fetchSessions();
        if (currentSessionId === sessionId) {
          set({ currentSessionId: null, messages: [], kgData: undefined });
        }
        toast.success("Sketch deleted");
      }
    } catch (error) {
      toast.error("Failed to delete sketch");
    }
  },
  sendMessage: async (content, model) => {
    const currentSessionId = get().currentSessionId;
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
    try {
      const res = await chatService.sendMessage(content, model, (chunk) => {
        set(state => ({ streamingMessage: state.streamingMessage + chunk }));
      });
      if (res.success) {
        const finalRes = await chatService.getMessages();
        if (finalRes.success && finalRes.data) {
          set({
            messages: finalRes.data.messages || [],
            kgData: finalRes.data.kg,
            isProcessing: false,
            streamingMessage: ''
          });
          await get().fetchSessions();
        }
      } else {
        throw new Error(res.error || "Processing failed");
      }
    } catch (error) {
      set({ isProcessing: false });
      toast.error("The pen ran out of ink. Please try again.");
    }
  },
  clearMessages: async () => {
    const currentSessionId = get().currentSessionId;
    if (!currentSessionId) return;
    try {
      const res = await chatService.clearMessages();
      if (res.success) {
        set({ messages: [], kgData: { entities: {}, relations: [] } });
        toast.success("Canvas cleared");
      }
    } catch (error) {
      toast.error("Failed to clear canvas");
    }
  }
}));