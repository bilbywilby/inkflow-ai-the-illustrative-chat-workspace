import { useEffect } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChatStore } from '@/lib/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
export function HomePage() {
  const isMobile = useIsMobile();
  const fetchSessions = useChatStore(s => s.fetchSessions);
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background relative selection:bg-primary/20">
      {/* Noise Texture Overlay for Paper Feel */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-50 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      <ThemeToggle className="absolute top-4 right-4 z-50" />
      {!isMobile && (
        <div className="flex h-full w-full">
          <ChatSidebar />
          <main className="flex-1 min-w-0 bg-background relative shadow-inner">
            <ChatWindow />
          </main>
        </div>
      )}
      {isMobile && (
        <SidebarProvider defaultOpen={false}>
          <div className="flex h-full w-full">
            <ChatSidebar />
            <main className="flex-1 min-w-0 bg-background relative">
              <div className="absolute left-4 top-4 z-20">
                <SidebarTrigger className="sketch-border bg-background hard-shadow-sm h-9 w-9" />
              </div>
              <ChatWindow />
            </main>
          </div>
        </SidebarProvider>
      )}
      <Toaster 
        richColors 
        position="top-right" 
        toastOptions={{
          className: "sketch-border hard-shadow-sm font-bold",
        }} 
      />
    </div>
  );
}