import { useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { SketchButton } from '@/components/sketch/SketchButton';
import { Plus, Book, Trash2, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
export function ChatSidebar() {
  const sessions = useChatStore(s => s.sessions);
  const currentSessionId = useChatStore(s => s.currentSessionId);
  const fetchSessions = useChatStore(s => s.fetchSessions);
  const createSession = useChatStore(s => s.createSession);
  const selectSession = useChatStore(s => s.selectSession);
  const deleteSession = useChatStore(s => s.deleteSession);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  return (
    <div className="flex flex-col h-full bg-background border-r-2 border-foreground w-64 md:w-72">
      <div className="p-4 border-b-2 border-foreground bg-muted/30">
        <h2 className="sketch-font text-2xl font-bold flex items-center gap-2">
          <Book className="w-6 h-6" /> The Shelf
        </h2>
      </div>
      <div className="p-4">
        <SketchButton
          onClick={() => createSession()}
          className="w-full justify-start gap-2"
        >
          <Plus className="w-4 h-4" /> New Sketch
        </SketchButton>
      </div>
      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 opacity-50">
              <p className="text-sm italic">Empty shelf...</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = currentSessionId === session.id;
              return (
                <div
                  key={session.id}
                  className={cn(
                    "group relative sketch-border p-3 cursor-pointer transition-all hover:rotate-1",
                    isActive 
                      ? "bg-accent hard-shadow translate-x-1 border-primary ring-1 ring-primary/20" 
                      : "bg-card hover:bg-muted/50"
                  )}
                  style={isActive ? { backgroundImage: 'radial-gradient(var(--primary-foreground) 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' } : {}}
                  onClick={() => selectSession(session.id)}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className={cn("w-4 h-4 mt-1 shrink-0", isActive && "text-primary")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-bold truncate pr-6",
                        isActive && "sketch-font text-base"
                      )}>
                        {session.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        Last edited {new Date(session.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
      <div className="p-4 mt-auto border-t-2 border-foreground bg-muted/10">
        <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest font-bold">
          Inkflow AI v1.0
        </p>
      </div>
    </div>
  );
}