import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Briefcase, 
  Calculator, 
  LayoutDashboard, 
  LineChart, 
  Settings 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Vagas e Pipeline", url: "/vagas", icon: Briefcase },
  { title: "Custo de Vagas", url: "/custo", icon: Calculator },
  { title: "Métricas", url: "/metricas", icon: BarChart3 },
  { title: "Benchmarking", url: "/benchmarking", icon: LineChart },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-border shadow-sm">
      <SidebarHeader className="p-4 flex h-16 items-center flex-row gap-3">
        <div className="bg-primary/10 p-2 rounded-xl">
          <img 
            src={`${import.meta.env.BASE_URL}images/logo-icon.png`} 
            alt="Logo" 
            className="w-6 h-6 object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg leading-tight text-foreground">TalentOS</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Enterprise HR</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 mt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">
            Módulos Principais
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        rounded-lg py-5 px-3 transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                        }
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : ''}`} />
                        <span className="font-medium text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 pb-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border shadow-sm">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-inner">
            RH
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-semibold truncate text-foreground">Ana Silva</span>
            <span className="text-xs text-muted-foreground truncate">Diretora de RH</span>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
