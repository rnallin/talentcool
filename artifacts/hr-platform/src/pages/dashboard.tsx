import { useGetMetricsOverview, useGetHiresOverTime } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { 
  Users, 
  Briefcase, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Activity
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  isCurrency = false,
  inverseTrend = false
}: { 
  title: string; 
  value: number; 
  icon: any; 
  trend?: number; 
  trendLabel?: string;
  isCurrency?: boolean;
  inverseTrend?: boolean;
}) {
  const isPositive = trend && trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  // For things like time-to-hire or cost, down is good.
  const isGoodTrend = inverseTrend ? !isPositive : isPositive;
  const trendColor = isGoodTrend ? "text-emerald-600" : "text-rose-600";
  const trendBg = isGoodTrend ? "bg-emerald-100/50" : "bg-rose-100/50";

  return (
    <Card className="card-hover overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-display font-bold text-foreground">
          {isCurrency ? formatCurrency(value) : value.toLocaleString('pt-BR')}
        </div>
        {trend !== undefined && (
          <div className="flex items-center mt-3 text-xs">
            <span className={`flex items-center px-1.5 py-0.5 rounded-md font-medium ${trendColor} ${trendBg}`}>
              <TrendIcon className="h-3 w-3 mr-1" />
              {Math.abs(trend)}%
            </span>
            <span className="text-muted-foreground ml-2">{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useGetMetricsOverview();
  const { data: hiresData, isLoading: loadingHires } = useGetHiresOverTime();

  if (loadingMetrics || loadingHires) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground mt-1 text-lg">Acompanhe os principais indicadores de recrutamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Vagas Abertas" 
          value={metrics.totalOpenJobs} 
          icon={Briefcase}
          trend={metrics.openJobsGrowth}
          trendLabel="vs. mês passado"
        />
        <MetricCard 
          title="Total de Candidatos" 
          value={metrics.totalCandidates} 
          icon={Users}
          trend={metrics.candidatesGrowth}
          trendLabel="vs. mês passado"
        />
        <MetricCard 
          title="Time-to-Hire Médio (Dias)" 
          value={metrics.avgTimeToHireDays} 
          icon={Clock}
          trend={-12.5} // Simulated trend
          trendLabel="vs. mês passado"
          inverseTrend
        />
        <MetricCard 
          title="Custo Vagas em Aberto" 
          value={metrics.totalOpenJobsCost} 
          icon={DollarSign}
          isCurrency
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Evolução de Contratações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hiresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hires" 
                    name="Contratações"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorHires)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-border bg-gradient-to-br from-primary to-indigo-600 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10" />
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-white text-lg">Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex flex-col justify-center h-[calc(100%-70px)] gap-8">
            <div>
              <p className="text-indigo-100 font-medium text-sm mb-1">Contratações Realizadas</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-display font-bold">{metrics.hiresThisMonth}</span>
                <span className="text-indigo-200 mb-1 text-sm font-medium">
                  {metrics.hiresThisMonth >= metrics.hiresLastMonth ? '+' : ''}
                  {metrics.hiresThisMonth - metrics.hiresLastMonth} vs mês anterior
                </span>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
              <p className="text-indigo-50 font-medium text-sm mb-3">Insights Rápidos</p>
              <ul className="space-y-3 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Time-to-hire está 12% mais rápido
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Custo de vagas subiu levemente
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  Engenharia é o depto mais ativo
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
