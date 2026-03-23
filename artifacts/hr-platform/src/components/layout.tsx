import { useState, useRef } from "react";
import { Menu, Search, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocation } from "wouter";
import { AppSidebar } from "@/components/app-sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = () => setCollapsed((c) => !c);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchValue.trim();
    if (!q) return;
    setSearchValue("");
    navigate(`/assistente?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar collapsed={collapsed} onToggle={toggle} />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex h-14 shrink-0 items-center px-5 bg-card border-b border-border z-10 sticky top-0 gap-3">
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <span className="text-sm font-medium text-muted-foreground hidden lg:block shrink-0">
            Plataforma de Gestão Estratégica
          </span>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl ml-auto">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted/30 focus-within:border-primary/50 focus-within:bg-background transition-all">
              <Sparkles className="w-4 h-4 text-primary/60 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Pergunte à IA sobre vagas, candidatos, métricas..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="shrink-0 p-1 rounded text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
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
