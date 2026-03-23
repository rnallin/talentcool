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
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

function KpiCard({
  value,
  label,
  badge,
  badgePositive,
  icon: Icon,
  className: cn = "",
  href,
}: {
  value: string;
  label: string;
  badge?: string;
  badgePositive?: boolean;
  icon: LucideIcon;
  className?: string;
  href?: string;
}) {
  const content = (
    <div className={`kpi-card flex items-center gap-4 p-5 bg-card rounded-2xl border border-border ${href ? "cursor-pointer" : "cursor-default"} ${cn}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-foreground tracking-tight">{value}</span>
          {badge && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                badgePositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {badgePositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
      <div className="p-2.5 rounded-xl bg-primary/8">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block no-underline">{content}</Link>;
  }
  return content;
}

const DEPT_DATA = [
  { name: "Tecnologia", value: 35, color: "#145338" },
  { name: "Comercial", value: 25, color: "#97A09B" },
  { name: "Operações", value: 20, color: "#6A6E6C" },
  { name: "Marketing", value: 12, color: "#2d8a5e" },
  { name: "Financeiro", value: 8, color: "#b8c0bb" },
];

const npsColor = (nps: number) =>
  nps >= 30 ? "text-emerald-600" : nps >= 0 ? "text-amber-600" : "text-rose-600";

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useGetMetricsOverview();
  const { data: hiresData, isLoading: loadingHires } = useGetHiresOverTime();
  const { data: costData, isLoading: loadingCost } = useGetOpenJobsCost();

  const isLoading = loadingMetrics || loadingHires || loadingCost;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[360px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!metrics) return null;

  const totalAccruedCost = costData
    ? costData.jobs.reduce((acc, job) => acc + job.totalAccruedCost, 0)
    : 0;

  const hiresChange = metrics.hiresThisMonth - metrics.hiresLastMonth;

  const insights = [
    { text: "Time-to-hire 3 dias mais rápido", positive: true },
    { text: "Custo de vagas crescendo", positive: false },
    { text: "Tecnologia é o depto mais ativo", positive: true },
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          value={metrics.totalOpenJobs.toString()}
          label="Vagas em aberto"
          icon={Briefcase}
          badge={`+${Math.max(1, Math.round(metrics.openJobsGrowth ?? 4))}%`}
          badgePositive={true}
          className="fade-in-up stagger-1"
          href="/vagas"
        />
        <KpiCard
          value={metrics.totalCandidates.toLocaleString("pt-BR")}
          label="Candidatos em processo"
          icon={Users}
          badge={`+${Math.max(1, Math.round(metrics.candidatesGrowth ?? 12))}%`}
          badgePositive={true}
          className="fade-in-up stagger-2"
          href="/vagas"
        />
        <KpiCard
          value={`${metrics.avgTimeToHireDays}`}
          label="Tempo médio (dias)"
          icon={Clock}
          badge="-3 dias"
          badgePositive={true}
          className="fade-in-up stagger-3"
          href="/metricas"
        />
        <KpiCard
          value={metrics.hiresThisMonth.toString()}
          label="Contratações este mês"
          icon={Activity}
          badge={`${hiresChange >= 0 ? "+" : ""}${hiresChange}`}
          badgePositive={hiresChange >= 0}
          className="fade-in-up stagger-4"
          href="/metricas"
        />
        <KpiCard
          value={
            totalAccruedCost >= 1000
              ? `${(totalAccruedCost / 1000).toFixed(0)}K`
              : formatCurrency(totalAccruedCost).replace("R$\u00a0", "")
          }
          label="Custo estimado (R$)"
          icon={DollarSign}
          badge="+8%"
          badgePositive={false}
          className="fade-in-up stagger-5"
          href="/custo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 rounded-2xl border border-border chart-card fade-in-up">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Contratações</CardTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Contratações</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={hiresData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#145338" stopOpacity={0.25} />
                      <stop offset="50%" stopColor="#145338" stopOpacity={0.08} />
                      <stop offset="95%" stopColor="#145338" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    stroke="#97A09B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#97A09B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                      fontSize: "13px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hires"
                    name="Contratações"
                    stroke="#145338"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHires)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border chart-card fade-in-up">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold text-foreground">Vagas por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEPT_DATA}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {DEPT_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, '']}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-1">
              {DEPT_DATA.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-foreground">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{d.value}%</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="rounded-2xl border border-border chart-card fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">cNPS do Candidato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-4xl font-bold ${npsColor(metrics.candidateNps)}`}>
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
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border border-border chart-card fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Insights do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.positive ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="text-sm text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
