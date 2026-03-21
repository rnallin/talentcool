import { useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar collapsed={collapsed} />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex h-14 shrink-0 items-center px-5 bg-card border-b border-border z-10 sticky top-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="h-4 w-px bg-border mx-4 hidden sm:block" />
          <span className="text-sm font-medium text-muted-foreground hidden sm:block">
            Plataforma de Gestão Estratégica
          </span>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
