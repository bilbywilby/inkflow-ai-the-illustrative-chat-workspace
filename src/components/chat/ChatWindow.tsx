import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { SketchInput } from '@/components/sketch/SketchInput';
import { SketchButton } from '@/components/sketch/SketchButton';
import { Send, Sparkles, Trash2, Settings2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MODELS } from '@/lib/chat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export function ChatWindow() {
  const messages = useChatStore(s => s.messages);
  const isProcessing = useChatStore(s => s.isProcessing);
  const streamingMessage = useChatStore(s => s.streamingMessage);
  const sendMessage = useChatStore(s => s.sendMessage);
  const clearMessages = useChatStore(s => s.clearMessages);
  const currentSessionId = useChatStore(s => s.currentSessionId);
  const sessions = useChatStore(s => s.sessions);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find(s => s.id === currentSessionId);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, streamingMessage]);
  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    sendMessage(input, model);
    setInput('');
  };
  return (
    <div className="flex flex-col h-full relative">
      {/* Canvas Header */}
      <header className="h-16 border-b-2 border-foreground bg-background/80 backdrop-blur-sm z-10 flex items-center justify-between px-6">
        <div className="flex flex-col">
          <h1 className="sketch-font text-xl font-bold truncate max-w-[200px] md:max-w-md">
            {currentSession?.title || 'Blank Sheet'}
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-[180px] h-8 sketch-border bg-background text-xs font-bold">
              <Settings2 className="w-3 h-3 mr-2" />
              <SelectValue placeholder="Pencil Type" />
            </SelectTrigger>
            <SelectContent className="sketch-border hard-shadow">
              {MODELS.map(m => (
                <SelectItem key={m.id} value={m.id} className="text-xs font-bold">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SketchButton 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={clearMessages}
            title="Burn Sheet"
          >
            <Trash2 className="w-4 h-4" />
          </SketchButton>
        </div>
      </header>
      {/* Message Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-24 h-24 sketch-border rounded-full flex items-center justify-center bg-muted animate-bounce">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="sketch-font text-3xl font-bold">Inkflow AI</h2>
              <p className="text-muted-foreground max-w-sm italic">
                The canvas is empty. Start sketching your ideas below.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {streamingMessage && (
                <MessageBubble 
                  message={{
                    id: 'streaming',
                    role: 'assistant',
                    content: streamingMessage,
                    timestamp: Date.now()
                  }} 
                  isStreaming 
                />
              )}
            </>
          )}
        </div>
      </div>
      {/* Composer */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto relative group">
          <SketchInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write something brilliant..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-bold uppercase hidden md:inline">
              Press Enter to send
            </span>
            <SketchButton 
              size="icon" 
              className="rounded-full h-10 w-10"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
            >
              <Send className="w-4 h-4" />
            </SketchButton>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
          Requests are limited. Use your ink wisely.
        </p>
      </div>
    </div>
  );
}