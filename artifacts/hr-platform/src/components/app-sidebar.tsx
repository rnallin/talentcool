import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Briefcase,
  Calculator,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
} from "lucide-react";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Vagas e Pipeline", url: "/vagas", icon: Briefcase },
  { title: "Custo de Vagas", url: "/custo", icon: Calculator },
  { title: "Métricas", url: "/metricas", icon: BarChart3 },
  { title: "Benchmarking", url: "/benchmarking", icon: LineChart },
];

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const [location] = useLocation();

  return (
    <aside
      className={`flex flex-col h-full bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      } shrink-0`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-[hsl(var(--sidebar-border))]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
          T
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <span className="font-display font-bold text-lg leading-tight text-white block">
              TalentOS
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
              Enterprise HR
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-3">
            Módulos
          </p>
        )}
        {mainItems.map((item) => {
          const isActive =
            location === item.url ||
            (item.url !== "/" && location.startsWith(item.url));
          return (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[hsl(var(--sidebar-border))]">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              AS
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Ana Silva</p>
              <p className="text-xs text-slate-400 truncate">Diretora de RH</p>
            </div>
            <Settings className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs cursor-pointer" title="Ana Silva">
              AS
            </div>
          </div>
        )}
        {!collapsed && (
          <button className="mt-2 flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        )}
      </div>
    </aside>
  );
}
