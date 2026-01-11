import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import type { Message } from '../../../worker/types';
import { formatTime, renderToolCall } from '@/lib/chat';
import { User, Sparkles, Terminal } from 'lucide-react';
interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}
export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  return (
    <div className={cn(
      "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "flex max-w-[85%] md:max-w-[70%] gap-3",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full sketch-border shrink-0 flex items-center justify-center bg-background",
          isAssistant ? "bg-primary/10" : "bg-accent"
        )}>
          {isAssistant ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        <div className="space-y-1">
          <div className={cn(
            "sketch-border p-4 hard-shadow-sm",
            isAssistant ? "bg-white text-foreground" : "bg-foreground text-background"
          )}>
            <div className={cn(
              "prose prose-sm max-w-none dark:prose-invert",
              isAssistant ? "font-sans" : "font-sans italic"
            )}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
            </div>
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-4 pt-3 border-t border-dashed border-foreground/20 space-y-2">
                {message.toolCalls.map((tc) => (
                  <div key={tc.id} className="flex items-center gap-2 text-xs font-mono bg-muted/50 p-2 rounded border border-foreground/10">
                    <Terminal className="w-3 h-3" />
                    <span>{renderToolCall(tc)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className={cn(
            "text-[10px] font-bold text-muted-foreground uppercase",
            isAssistant ? "text-left" : "text-right"
          )}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}