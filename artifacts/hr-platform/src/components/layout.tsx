import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-card/80 backdrop-blur-md border-b border-border z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-colors" />
              <div className="h-4 w-px bg-border hidden sm:block" />
              <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                Plataforma de Gestão Estratégica
              </span>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
            <div className="max-w-7xl mx-auto w-full h-full animate-in fade-in duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
