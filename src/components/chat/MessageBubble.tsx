import { memo } from 'react';
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
export const MessageBubble = memo(({ message, isStreaming }: MessageBubbleProps) => {
  const isAssistant = message.role === 'assistant';
  return (
    <div className={cn(
      "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2",
      isAssistant ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "flex max-w-[85%] md:max-w-[75%] gap-3",
        isAssistant ? "flex-row" : "flex-row-reverse"
      )}>
        <div className={cn(
          "w-9 h-9 rounded-full sketch-border shrink-0 flex items-center justify-center bg-background",
          isAssistant ? "bg-primary/10" : "bg-accent"
        )}>
          {isAssistant ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>
        <div className="space-y-1.5 min-w-0">
          <div className={cn(
            "sketch-border p-4 hard-shadow-sm transition-all",
            isAssistant ? "bg-white text-foreground" : "bg-foreground text-background"
          )}>
            <div className={cn(
              "prose prose-sm max-w-none dark:prose-invert break-words",
              isAssistant ? "font-sans leading-relaxed" : "font-sans italic leading-relaxed"
            )}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2.5 h-4 ml-1.5 bg-primary/60 animate-pulse align-middle" />
              )}
            </div>
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-4 pt-3 border-t-2 border-dashed border-foreground/10 space-y-2">
                {message.toolCalls.map((tc) => (
                  <div 
                    key={tc.id} 
                    className="flex items-center gap-2 text-[11px] font-mono bg-muted/40 p-2 border border-foreground/10 rounded-sm"
                  >
                    <Terminal className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{renderToolCall(tc)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className={cn(
            "text-[9px] font-bold text-muted-foreground uppercase tracking-tight",
            isAssistant ? "text-left" : "text-right"
          )}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  // Only re-render if the content changes or streaming status changes
  return prev.message.content === next.message.content && 
         prev.isStreaming === next.isStreaming &&
         prev.message.id === next.message.id;
});
MessageBubble.displayName = "MessageBubble";