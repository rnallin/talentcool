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
  Activity,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

function MetricCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendLabel,
  isCurrency = false,
  inverseTrend = false,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: number;
  trendLabel?: string;
  isCurrency?: boolean;
  inverseTrend?: boolean;
}) {
  const isPositive = trend !== undefined && trend > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const isGoodTrend = inverseTrend ? !isPositive : isPositive;
  const trendColor = isGoodTrend ? "text-emerald-600" : "text-rose-600";
  const trendBg = isGoodTrend ? "bg-emerald-50" : "bg-rose-50";

  return (
    <Card className="card-hover overflow-hidden rounded-xl border border-border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2.5 ${iconBg} rounded-xl`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-display font-bold text-foreground">
          {isCurrency ? formatCurrency(value) : value.toLocaleString("pt-BR")}
        </div>
        {trend !== undefined && (
          <div className="flex items-center mt-2 text-xs">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[380px] w-full rounded-xl" />
      </div>
    );
  }

  if (!metrics) return null;

  const npsColor =
    metrics.candidateNps >= 30
      ? "text-emerald-600"
      : metrics.candidateNps >= 0
      ? "text-amber-600"
      : "text-rose-600";

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Visão Geral
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          Acompanhe os principais indicadores de recrutamento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Vagas Abertas"
          value={metrics.totalOpenJobs}
          icon={Briefcase}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          trend={metrics.openJobsGrowth}
          trendLabel="vs. mês passado"
        />
        <MetricCard
          title="Total de Candidatos"
          value={metrics.totalCandidates}
          icon={Users}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          trend={metrics.candidatesGrowth}
          trendLabel="vs. mês passado"
        />
        <MetricCard
          title="Time-to-Hire Médio"
          value={metrics.avgTimeToHireDays}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={-12.5}
          trendLabel="vs. mês passado"
          inverseTrend
        />
        <MetricCard
          title="Custo por Contratação"
          value={metrics.costPerHire}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          isCurrency
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 rounded-xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-primary" />
              Evolução de Contratações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hiresData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
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
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hires"
                    name="Contratações"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorHires)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="flex-1 rounded-xl border border-border shadow-sm bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-white text-base">Resumo do Mês</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="text-slate-400 text-xs font-medium mb-1">Contratações Realizadas</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-display font-bold">{metrics.hiresThisMonth}</span>
                  <span className="text-slate-400 mb-0.5 text-sm">
                    {metrics.hiresThisMonth >= metrics.hiresLastMonth ? "+" : ""}
                    {metrics.hiresThisMonth - metrics.hiresLastMonth} vs anterior
                  </span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-slate-300 text-xs font-semibold mb-2.5">Insights Rápidos</p>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-center gap-2 text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Time-to-hire 12% mais rápido
                  </li>
                  <li className="flex items-center gap-2 text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Custo de vagas em alta
                  </li>
                  <li className="flex items-center gap-2 text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/70 shrink-0" />
                    Tecnologia é o depto mais ativo
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">cNPS do Candidato</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-4xl font-display font-bold ${npsColor}`}>
                {metrics.candidateNps > 0 ? "+" : ""}
                {metrics.candidateNps}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.candidateNps >= 50
                  ? "Excelente experiência"
                  : metrics.candidateNps >= 30
                  ? "Boa experiência"
                  : metrics.candidateNps >= 0
                  ? "Experiência regular"
                  : "Requer atenção"}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    metrics.candidateNps >= 30
                      ? "bg-emerald-500"
                      : metrics.candidateNps >= 0
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.max(5, (metrics.candidateNps + 100) / 2)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Baseado em contratados vs. reprovados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
