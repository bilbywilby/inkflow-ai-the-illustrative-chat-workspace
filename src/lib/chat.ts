import type { Message, ChatState, ToolCall, WeatherResult, MCPResult, ErrorResult, SessionInfo } from '../../worker/types';
export interface ChatResponse {
  success: boolean;
  data?: ChatState;
  error?: string;
}
export const MODELS = [
  { id: 'google-ai-studio/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'google-ai-studio/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'google-ai-studio/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
];
class ChatService {
  private sessionId: string;
  private baseUrl: string;
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.baseUrl = `/api/chat/${this.sessionId}`;
  }
  async sendMessage(
    message: string,
    model?: string,
    onChunk?: (chunk: string) => void
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, model, stream: !!onChunk }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (onChunk && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) onChunk(chunk);
        }
      } finally {
        reader.releaseLock();
      }
      return { success: true };
    }
    return await response.json();
  }
  async getMessages(): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/messages`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }
  async clearMessages(): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/clear`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  }
  switchSession(sessionId: string): void {
    this.sessionId = sessionId;
    this.baseUrl = `/api/chat/${sessionId}`;
  }
  async createSession(title?: string, sessionId?: string, firstMessage?: string) {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, sessionId, firstMessage })
    });
    return await response.json();
  }
  async listSessions() {
    const response = await fetch('/api/sessions');
    return await response.json();
  }
  async deleteSession(sessionId: string) {
    const response = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
    return await response.json();
  }
}
export const chatService = new ChatService();
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
export const renderToolCall = (toolCall: ToolCall): string => {
  const result = toolCall.result as any;
  if (!result) return `${toolCall.name}: Thinking...`;
  if (result.error) return `Error: ${result.error}`;
  switch (toolCall.name) {
    case 'get_weather':
      return `Weather: ${result.condition}, ${result.temperature}°C`;
    case 'web_search':
      return `Search: ${toolCall.arguments.query || 'Results found'}`;
    default:
      return `${toolCall.name}: Processed`;
  }
};