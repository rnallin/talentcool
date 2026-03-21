import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Briefcase,
  Calculator,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  HelpCircle,
  FileText,
  MessageSquare,
} from "lucide-react";

const generalItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Vagas e Pipeline", url: "/vagas", icon: Briefcase },
  { title: "Métricas", url: "/metricas", icon: BarChart3 },
];

const toolItems = [
  { title: "Custo de Vagas", url: "/custo", icon: Calculator },
  { title: "Benchmarking", url: "/benchmarking", icon: LineChart },
];

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const [location] = useLocation();

  const renderItem = (item: { title: string; url: string; icon: React.ElementType }) => {
    const isActive =
      location === item.url ||
      (item.url !== "/" && location.startsWith(item.url));
    return (
      <Link
        key={item.title}
        href={item.url}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        } ${collapsed ? "justify-center" : ""}`}
        title={collapsed ? item.title : undefined}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span>{item.title}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`flex flex-col h-full bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      } shrink-0`}
    >
      <div className="flex h-16 items-center px-4 border-b border-[hsl(var(--sidebar-border))]">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
          T
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <span className="font-display font-bold text-base leading-tight text-foreground block">
              TalentOS
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
        <div>
          {!collapsed && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
              Geral
            </p>
          )}
          <div className="space-y-0.5">
            {generalItems.map(renderItem)}
          </div>
        </div>

        <div>
          {!collapsed && (
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
              Ferramentas
            </p>
          )}
          <div className="space-y-0.5">
            {toolItems.map(renderItem)}
          </div>
        </div>

        {!collapsed && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
              Outros
            </p>
            <div className="space-y-0.5">
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full">
                <HelpCircle className="w-5 h-5 shrink-0" />
                Ajuda
              </button>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full">
                <Settings className="w-5 h-5 shrink-0" />
                Configurações
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              AS
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">Ana Silva</p>
              <p className="text-xs text-muted-foreground truncate">Diretora de RH</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs cursor-pointer" title="Ana Silva">
              AS
            </div>
          </div>
        )}
        {!collapsed && (
          <button className="mt-1 flex items-center gap-2 w-full px-2 py-2 rounded-lg text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        )}
      </div>
    </aside>
  );
}
