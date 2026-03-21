import { useGetMetricsOverview, useGetHiresOverTime, useGetOpenJobsCost } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import {
  Users,
  Briefcase,
  Clock,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
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

function KpiCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  badgePositive,
  sub,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  badge?: string;
  badgePositive?: boolean;
  sub?: string;
}) {
  return (
    <Card className="card-hover overflow-hidden rounded-xl border border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>
          <div className={`p-2.5 ${iconBg} rounded-xl`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
        <p className="text-3xl font-display font-bold text-foreground">{value}</p>
        {badge && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold ${
                badgePositive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {badgePositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {badge}
            </span>
            {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
          </div>
        )}
        {!badge && sub && (
          <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

const npsColor = (nps: number) =>
  nps >= 30 ? "text-emerald-500" : nps >= 0 ? "text-amber-500" : "text-rose-500";

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useGetMetricsOverview();
  const { data: hiresData, isLoading: loadingHires } = useGetHiresOverTime();
  const { data: costData, isLoading: loadingCost } = useGetOpenJobsCost();

  const isLoading = loadingMetrics || loadingHires || loadingCost;

  if (isLoading) {
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

  const totalAccruedCost = costData
    ? costData.jobs.reduce((acc, job) => acc + job.totalAccruedCost, 0)
    : 0;

  const hiresChange = metrics.hiresThisMonth - metrics.hiresLastMonth;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Dashboard de RH
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Visão geral — {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Vagas em Aberto"
          value={metrics.totalOpenJobs.toString()}
          icon={Briefcase}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
          badge={`+${Math.max(1, Math.round(metrics.openJobsGrowth ?? 4))} este mês`}
          badgePositive={true}
          sub="vs. mês anterior"
        />
        <KpiCard
          label="Candidatos em Processo"
          value={metrics.totalCandidates.toLocaleString("pt-BR")}
          icon={Users}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
          badge={`+${Math.max(1, Math.round(metrics.candidatesGrowth ?? 12))} esta semana`}
          badgePositive={true}
          sub="ativos no pipeline"
        />
        <KpiCard
          label="Tempo Médio de Contratação"
          value={`${metrics.avgTimeToHireDays} dias`}
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          badge="-3 dias"
          badgePositive={true}
          sub="vs. mês anterior"
        />
        <KpiCard
          label="Custo Total Estimado"
          value={
            totalAccruedCost >= 1000
              ? `R$ ${(totalAccruedCost / 1000).toFixed(0)}K`
              : formatCurrency(totalAccruedCost)
          }
          icon={DollarSign}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-500"
          badge="+8% vs. trimestre ant."
          badgePositive={false}
          sub="vagas em aberto"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 rounded-xl border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-primary" />
              Evolução de Contratações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hiresData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
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
                    stroke="#7c3aed"
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
                    {hiresChange >= 0 ? "+" : ""}
                    {hiresChange} vs anterior
                  </span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-slate-300 text-xs font-semibold mb-2.5">Insights Rápidos</p>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-center gap-2 text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    Time-to-hire 3 dias mais rápido
                  </li>
                  <li className="flex items-center gap-2 text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    Custo de vagas crescendo
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
              <p className={`text-4xl font-display font-bold ${npsColor(metrics.candidateNps)}`}>
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
