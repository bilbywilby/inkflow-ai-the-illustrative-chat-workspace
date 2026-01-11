import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useChatStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { SketchInput } from '@/components/sketch/SketchInput';
import { SketchButton } from '@/components/sketch/SketchButton';
import { Send, Sparkles, Trash2, Settings2 } from 'lucide-react';
import { MODELS } from '@/lib/chat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ChatWindow = React.memo(function ChatWindow() {
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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef(input);
  const modelRef = useRef(model);
  
  useEffect(() => {
    inputRef.current = input;
  }, [input]);
  
  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  const debouncedSend = useCallback(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    const timeout = setTimeout(() => {
      const currentInput = inputRef.current;
      if (!currentInput.trim() || isProcessing) return;
      sendMessage(currentInput, modelRef.current);
      setInput('');
    }, 300);
    debounceTimeoutRef.current = timeout;
  }, [isProcessing, sendMessage]);

  const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId), [sessions, currentSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages, streamingMessage]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full relative">
      <header className="h-16 border-b-2 border-foreground bg-background/90 backdrop-blur-md z-10 flex items-center justify-between px-6 shrink-0">
        <div className="flex flex-col min-w-0">
          <h1 className="sketch-font text-xl font-bold truncate max-w-[180px] md:max-w-md">
            {currentSession?.title ?? 'Blank Sheet'}
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-[160px] h-9 sketch-border bg-background text-xs font-bold">
              <Settings2 className="w-3.5 h-3.5 mr-2" />
              <SelectValue placeholder="Pen" />
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
            className="h-9 w-9"
            onClick={clearMessages}
            title="Burn Sheet"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </SketchButton>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 md:px-12 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="w-24 h-24 sketch-border rounded-full flex items-center justify-center bg-muted/30 animate-pulse shadow-hard-sm">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="sketch-font text-4xl font-bold tracking-tight">Inkflow AI</h2>
                <p className="text-muted-foreground max-w-sm italic text-sm">
                  The canvas is waiting. Every stroke counts toward your final masterpiece.
                </p>
              </div>
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
      <div className="p-4 md:p-8 bg-gradient-to-t from-background via-background/95 to-transparent shrink-0">
        <div className="max-w-3xl mx-auto relative group">
          <SketchInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Sketch your thoughts..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                debouncedSend();
              }
            }}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-3">
            <span className="text-[9px] text-muted-foreground font-bold uppercase hidden sm:inline-block bg-muted px-2 py-1 rounded-sm border border-foreground/5">
              Enter to Send
            </span>
            <SketchButton
              size="icon"
              className="rounded-full h-11 w-11"
              onClick={debouncedSend}
              disabled={!input.trim() || isProcessing}
            >
              <Send className="w-4.5 h-4.5" />
            </SketchButton>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] sketch-font">
          Note: AI resources are shared. Use your ink thoughtfully.
        </p>
      </div>
    </div>
  );
});

export { ChatWindow };
//