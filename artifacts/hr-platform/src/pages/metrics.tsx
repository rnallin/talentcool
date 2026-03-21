import {
  useGetTimeToHireMetrics,
  useGetFunnelMetrics,
  useGetHiresOverTime,
  useGetCostPerHireTrend,
  useGetHiresByDepartment,
  useGetMetricsOverview,
} from "@workspace/api-client-react";
import type { FunnelStage, TimeToHireByDept, MonthlyHires, CostPerHireTrendPoint, HiresByDepartment } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Funnel,
  FunnelChart,
  LabelList,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { Zap, Star } from "lucide-react";

function CustomTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color as string }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function CurrencyTooltip({ active, payload, label }: TooltipProps<ValueType, NameType>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
        <p className="font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color as string }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {typeof entry.value === "number" ? formatCurrency(entry.value) : "—"}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

const STATIC_SOURCE_OF_HIRE = [
  { name: "LinkedIn", value: 38, color: "#6366f1" },
  { name: "Indicação", value: 24, color: "#0d9488" },
  { name: "Site da Empresa", value: 18, color: "#8b5cf6" },
  { name: "Gupy / Catho", value: 12, color: "#f59e0b" },
  { name: "Outros", value: 8, color: "#64748b" },
];

const STATIC_RECRUITERS = [
  { name: "Ana Martins", initials: "AM", vagas: 12, fechadas: 9, tempoMedio: 28, qualidade: 4.7, satisfacao: 91 },
  { name: "Carlos Silva", initials: "CS", vagas: 10, fechadas: 7, tempoMedio: 35, qualidade: 4.4, satisfacao: 86 },
  { name: "Juliana Costa", initials: "JC", vagas: 8, fechadas: 6, tempoMedio: 31, qualidade: 4.6, satisfacao: 88 },
  { name: "Roberto Lima", initials: "RL", vagas: 6, fechadas: 4, tempoMedio: 40, qualidade: 4.2, satisfacao: 82 },
];

function tempoColor(days: number) {
  if (days <= 30) return "text-emerald-600";
  if (days <= 35) return "text-amber-500";
  return "text-rose-500";
}

function ClosedBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full"
          style={{ width: `${Math.round((value / max) * 100)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function SatisfacaoBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm text-muted-foreground">{value}%</span>
    </div>
  );
}

export default function Metrics() {
  const { data: timeToHire, isLoading: load1 } = useGetTimeToHireMetrics();
  const { data: funnel, isLoading: load2 } = useGetFunnelMetrics();
  const { data: hires, isLoading: load3 } = useGetHiresOverTime();
  const { data: costTrend, isLoading: load4 } = useGetCostPerHireTrend();
  const { data: hiresByDept, isLoading: load5 } = useGetHiresByDepartment();
  const { data: overview } = useGetMetricsOverview();

  const isLoading = load1 || load2 || load3 || load4 || load5;

  const funnelData: (FunnelStage & { fill: string; displayValue: string })[] =
    funnel?.map((f, i) => ({
      ...f,
      fill: `hsl(var(--chart-${(i % 5) + 1}))`,
      displayValue: `${f.count} (${f.conversionRate}%)`,
    })) ?? [];

  const timeToHireData: TimeToHireByDept[] = timeToHire ?? [];
  const hiresData: MonthlyHires[] = hires ?? [];
  const costTrendData: CostPerHireTrendPoint[] = (costTrend ?? []).filter((p) => p.costPerHire !== null);
  const hiresByDeptData: HiresByDepartment[] = (hiresByDept ?? []).slice(0, 7);

  const maxFechadas = Math.max(...STATIC_RECRUITERS.map((r) => r.fechadas), 1);

  const scorecardData = [
    {
      subject: "Tempo p/ Contratar",
      score: overview ? Math.max(0, Math.min(100, Math.round((90 - overview.avgTimeToHireDays) / 90 * 100))) : 72,
    },
    { subject: "Taxa de Oferta", score: 70 },
    { subject: "Retenção 6m", score: 82 },
    {
      subject: "Satisfação",
      score: overview ? Math.max(0, Math.min(100, Math.round((overview.candidateNps + 100) / 2))) : 78,
    },
    { subject: "Qualidade Hire", score: 75 },
    {
      subject: "Custo p/ Hire",
      score: overview ? Math.max(0, Math.min(100, Math.round((1 - overview.costPerHire / 30000) * 100))) : 68,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl col-span-1 lg:col-span-2" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[160px] rounded-xl col-span-1 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Métricas de Performance
        </h1>
        <p className="text-muted-foreground mt-1 text-base">
          Analise a eficiência e gargalos do seu processo de R&S.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time to Hire */}
        <Card className="shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Time-to-Hire por Departamento (Dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeToHireData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="department" type="category" stroke="hsl(var(--foreground))" fontSize={13} fontWeight={500} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgDays" name="Dias em Média" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={28}>
                    <LabelList dataKey="avgDays" position="right" fill="hsl(var(--muted-foreground))" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card className="shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Funil de Conversão Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="90%">
                <FunnelChart>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Funnel dataKey="count" data={funnelData} isAnimationActive>
                    <LabelList position="right" fill="#000" stroke="none" dataKey="label" fontSize={13} fontWeight={500} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {funnelData.map((f, i) => (
                <div key={i} className="flex items-center text-xs">
                  <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: f.fill }} />
                  <span className="text-muted-foreground mr-1">{f.label}:</span>
                  <span className="font-semibold">{f.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hires Over Time */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Volume de Vagas vs. Contratações (12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hiresData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="openings" name="Novas Vagas" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="hires" name="Contratações" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Custo por Contratação — Tendência */}
        <Card className="shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Custo por Contratação — Tendência</CardTitle>
            <p className="text-xs text-muted-foreground">Custo médio em reais por hire</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costTrendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={8} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$${Math.round(v / 1000)}K`}
                  />
                  <RechartsTooltip content={<CurrencyTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="costPerHire"
                    name="Custo/Hire"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contratações por Departamento */}
        <Card className="shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Contratações por Departamento</CardTitle>
            <p className="text-xs text-muted-foreground">Vagas abertas vs. contratados</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hiresByDeptData} margin={{ top: 5, right: 15, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="department"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingBottom: "8px" }}
                  />
                  <Bar dataKey="openJobs" name="Vagas Abertas" fill="#c4b5fd" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="hires" name="Contratados" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source of Hire */}
        <Card className="shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Source of Hire</CardTitle>
            <p className="text-xs text-muted-foreground">Por canal de recrutamento</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATIC_SOURCE_OF_HIRE}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {STATIC_SOURCE_OF_HIRE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: "12px" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scorecard RH */}
        <Card className="shadow-sm border-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Scorecard RH</CardTitle>
            <p className="text-xs text-muted-foreground">Desempenho geral do time</p>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={scorecardData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                    tickCount={4}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance por Recrutador */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-border rounded-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-500" />
              <CardTitle className="text-base">Performance por Recrutador</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Indicadores individuais — Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recrutador</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vagas Gerenciadas</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fechadas</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tempo Médio</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qualidade</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Satisfação</th>
                  </tr>
                </thead>
                <tbody>
                  {STATIC_RECRUITERS.map((r) => (
                    <tr key={r.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                            {r.initials}
                          </div>
                          <span className="font-medium text-foreground">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-muted-foreground">{r.vagas}</td>
                      <td className="py-3.5 px-3">
                        <ClosedBar value={r.fechadas} max={maxFechadas} />
                      </td>
                      <td className={`py-3.5 px-3 font-semibold ${tempoColor(r.tempoMedio)}`}>
                        {r.tempoMedio}d
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-foreground">{r.qualidade.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <SatisfacaoBar value={r.satisfacao} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
