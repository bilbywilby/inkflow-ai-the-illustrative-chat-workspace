import { Agent } from 'agents';
import type { Env } from './core-utils';
import type { ChatState } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
import { kgEngine } from './kg-engine';
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    kg: { entities: {}, relations: [] }
  };
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL,
      this.env.CF_AI_API_KEY,
      this.state.model
    );
  }
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      if (method === 'GET' && url.pathname === '/messages') return this.handleGetMessages();
      if (method === 'POST' && url.pathname === '/chat') return this.handleChatMessage(await request.json());
      if (method === 'DELETE' && url.pathname === '/clear') return this.handleClearMessages();
      if (method === 'POST' && url.pathname === '/ingest') return this.handleManualIngest();
      if (method === 'GET' && url.pathname === '/kg') return Response.json({ success: true, data: this.state.kg });
      return Response.json({ success: false, error: API_RESPONSES.NOT_FOUND }, { status: 404 });
    } catch (error) {
      console.error('Request handling error:', error);
      return Response.json({ success: false, error: API_RESPONSES.INTERNAL_ERROR }, { status: 500 });
    }
  }
  private handleGetMessages(): Response {
    return Response.json({ success: true, data: this.state });
  }
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean }): Promise<Response> {
    const { message, model, stream } = body;
    if (!message?.trim()) return Response.json({ success: false, error: API_RESPONSES.MISSING_MESSAGE }, { status: 400 });
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    const userMessage = createMessage('user', message.trim());
    this.setState({ ...this.state, messages: [...this.state.messages, userMessage], isProcessing: true });
    try {
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = createEncoder();
        (async () => {
          try {
            let fullContent = '';
            const response = await this.chatHandler!.processMessage(message, this.state.messages, (chunk: string) => {
              fullContent += chunk;
              writer.write(encoder.encode(chunk));
            });
            const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
            const updatedMessages = [...this.state.messages, assistantMessage];
            // Post-processing: KG Ingestion
            const currentKg = this.state.kg || { entities: {}, relations: [] };
            const updatedKg = await kgEngine.processCheckpoint(message + " " + response.content, this.state.sessionId, currentKg);
            this.setState({ 
              ...this.state, 
              messages: updatedMessages, 
              isProcessing: false, 
              kg: updatedKg 
            });
          } catch (e) {
            console.error('Streaming error:', e);
          } finally {
            writer.close();
          }
        })();
        return createStreamResponse(readable);
      }
      const response = await this.chatHandler!.processMessage(message, this.state.messages);
      const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
      const currentKg = this.state.kg || { entities: {}, relations: [] };
      const updatedKg = await kgEngine.processCheckpoint(message + " " + response.content, this.state.sessionId, currentKg);
      this.setState({ 
        ...this.state, 
        messages: [...this.state.messages, assistantMessage], 
        isProcessing: false, 
        kg: updatedKg 
      });
      return Response.json({ success: true, data: this.state });
    } catch (error) {
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({ success: false, error: API_RESPONSES.PROCESSING_ERROR }, { status: 500 });
    }
  }
  private async handleManualIngest(): Promise<Response> {
    const allText = this.state.messages.map(m => m.content).join('\n');
    const currentKg = this.state.kg || { entities: {}, relations: [] };
    const updatedKg = await kgEngine.processCheckpoint(allText, this.state.sessionId, currentKg);
    this.setState({ ...this.state, kg: updatedKg });
    return Response.json({ success: true, data: updatedKg });
  }
  private handleClearMessages(): Response {
    this.setState({ ...this.state, messages: [], kg: { entities: {}, relations: [] } });
    return Response.json({ success: true, data: this.state });
  }
}