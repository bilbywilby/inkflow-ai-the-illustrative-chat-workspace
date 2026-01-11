import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useChatStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { SketchInput } from '@/components/sketch/SketchInput';
import { SketchButton } from '@/components/sketch/SketchButton';
import { Send, Sparkles, Trash2, BrainCircuit, Activity } from 'lucide-react';
import { MODELS, chatService } from '@/lib/chat';
import { getFusedContext } from '@/lib/hybrid-reconciler';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
const ChatWindow = React.memo(function ChatWindow() {
  // Zustand Zero-Tolerance: Primitive Selectors ONLY
  const messages = useChatStore(s => s.messages);
  const isProcessing = useChatStore(s => s.isProcessing);
  const streamingMessage = useChatStore(s => s.streamingMessage);
  const sendMessage = useChatStore(s => s.sendMessage);
  const clearMessages = useChatStore(s => s.clearMessages);
  const currentSessionId = useChatStore(s => s.currentSessionId);
  const sessions = useChatStore(s => s.sessions);
  const kgData = useChatStore(s => s.kgData);
  const setKgData = useChatStore(s => s.setKgData);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(MODELS[0]?.id || '');
  const [isIngesting, setIsIngesting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId), [sessions, currentSessionId]);
  const fusedContext = useMemo(() => {
    if (!kgData || messages.length === 0) return null;
    const lastMsg = messages[messages.length - 1]?.content || "";
    return getFusedContext(lastMsg, kgData);
  }, [kgData, messages]);
  useEffect(() => {
    if (currentSessionId) {
      chatService.getKG().then(res => {
        if (res.success && res.data) setKgData(res.data);
      }).catch(err => {
        console.error("KG Fetch failed:", err);
      });
    }
  }, [currentSessionId, messages.length, setKgData]);
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);
  const handleSend = useCallback(() => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isProcessing) return;
    sendMessage(trimmedInput, model);
    setInput('');
  }, [input, isProcessing, model, sendMessage]);
  const handleManualIngest = async () => {
    if (!currentSessionId) return;
    setIsIngesting(true);
    try {
      const res = await chatService.triggerIngestion();
      if (res.success) {
        setKgData(res.data);
        toast.success("Knowledge Graph Updated");
      }
    } catch (e) {
      toast.error("Ingestion failed");
    } finally {
      setIsIngesting(false);
    }
  };
  return (
    <div className="flex flex-col h-full relative">
      <header className="h-16 border-b-2 border-foreground bg-background/90 backdrop-blur-md z-10 flex items-center justify-between px-6 shrink-0">
        <div className="flex flex-col min-w-0">
          <h1 className="sketch-font text-xl font-bold truncate max-w-[180px] md:max-w-md">
            {currentSession?.title ?? 'Blank Sheet'}
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <SketchButton
            variant="ghost"
            size="sm"
            onClick={handleManualIngest}
            disabled={isIngesting || !currentSessionId}
            className="h-9 px-2 gap-2"
          >
            {isIngesting ? <Activity className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            <span className="hidden md:inline">Ingest</span>
          </SketchButton>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-[140px] md:w-[160px] h-9 sketch-border bg-background text-xs font-bold">
              <SelectValue placeholder="Pen" />
            </SelectTrigger>
            <SelectContent className="sketch-border hard-shadow">
              {MODELS.map(m => (
                <SelectItem key={m.id} value={m.id} className="text-xs font-bold">{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SketchButton variant="ghost" size="icon" className="h-9 w-9" onClick={clearMessages}>
            <Trash2 className="w-4 h-4" />
          </SketchButton>
        </div>
      </header>
      <AnimatePresence>
        {fusedContext && fusedContext.entities.length > 0 && (
          <motion.div
            key="fused-context-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-muted/30 border-b-2 border-foreground/10 px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0"
          >
            <span className="text-[9px] font-bold uppercase text-muted-foreground mt-1.5 shrink-0">Linked:</span>
            <div className="flex gap-2">
              <TooltipProvider>
                {fusedContext.entities.map((e, idx) => (
                  <Tooltip key={`${e.id}-${idx}`}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0.8, x: -10 }}
                        animate={{ scale: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="sketch-border bg-white dark:bg-card px-2 py-0.5 text-[10px] font-bold flex items-center gap-1 shadow-hard-sm shrink-0 cursor-help hover:-translate-y-0.5 transition-transform"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-primary" /> {e.canonical}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="sketch-border hard-shadow text-[10px] bg-background text-foreground">
                      <p>Type: {e.type}</p>
                      <p>Mentions: {e.version}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 md:px-12 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
              <div className="w-24 h-24 sketch-border rounded-full flex items-center justify-center bg-muted/30 animate-pulse shadow-hard-sm">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="sketch-font text-4xl font-bold tracking-tight">Inkflow AI</h2>
              <p className="text-muted-foreground italic text-sm max-w-xs">Start sketching your ideas with the power of a persistent Knowledge Graph.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
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
            </div>
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
                handleSend(); 
              } 
            }}
          />
          <div className="absolute right-3 bottom-3">
            <SketchButton 
              size="icon" 
              className="rounded-full h-11 w-11" 
              onClick={handleSend} 
              disabled={!input.trim() || isProcessing}
            >
              <Send className="w-4.5 h-4.5" />
            </SketchButton>
          </div>
        </div>
      </div>
      {/* Disclaimer as required by instructions */}
      <footer className="px-4 pb-2 text-center">
        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
          Note: AI capabilities are subject to global request limits across user applications.
        </p>
      </footer>
    </div>
  );
});
export { ChatWindow };