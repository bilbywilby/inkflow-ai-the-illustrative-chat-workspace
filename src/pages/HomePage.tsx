import React, { useEffect } from 'react';
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
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ThemeToggle />
      {/* Desktop Layout */}
      {!isMobile && (
        <>
          <ChatSidebar />
          <main className="flex-1 min-w-0 bg-background relative">
            <ChatWindow />
          </main>
        </>
      )}
      {/* Mobile Layout with Sidebar Drawer */}
      {isMobile && (
        <SidebarProvider defaultOpen={false}>
          <div className="flex h-full w-full">
            <ChatSidebar />
            <main className="flex-1 min-w-0 bg-background relative">
              <div className="absolute left-4 top-4 z-20">
                <SidebarTrigger />
              </div>
              <ChatWindow />
            </main>
          </div>
        </SidebarProvider>
      )}
      <Toaster richColors position="top-right" />
    </div>
  );
}