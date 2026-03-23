import { useState } from "react";
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
import { Zap, Star, ChevronDown, Users, TrendingDown } from "lucide-react";

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

const FUNNEL_COLORS = [
  "from-[#145338] to-[#1a6b48]",
  "from-[#2d8a5e] to-[#238a50]",
  "from-[#97A09B] to-[#848d88]",
  "from-[#6A6E6C] to-[#585b59]",
  "from-[#000402] to-[#1a1c1b]",
  "from-slate-400 to-slate-500",
];

const FUNNEL_BG = [
  "bg-gradient-to-r from-[#145338] to-[#1a6b48]",
  "bg-gradient-to-r from-[#2d8a5e] to-[#238a50]",
  "bg-gradient-to-r from-[#97A09B] to-[#848d88]",
  "bg-gradient-to-r from-[#6A6E6C] to-[#585b59]",
  "bg-gradient-to-r from-[#000402] to-[#1a1c1b]",
  "bg-gradient-to-r from-slate-400 to-slate-500",
];

function FunnelViz({ stages }: { stages: FunnelStage[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const maxCount = stages[0]?.count ?? 1;

  return (
    <div className="w-full space-y-0">
      {stages.map((stage, i) => {
        const widthPct = 25 + Math.round((stage.count / maxCount) * 75);
        const prev = i > 0 ? stages[i - 1] : null;
        const dropOff = prev && prev.count > 0
          ? Math.round(((prev.count - stage.count) / prev.count) * 100)
          : null;
        const isSelected = selected === i;
        const isLast = i === stages.length - 1;

        return (
          <div key={stage.stage} className="flex flex-col items-stretch">
            {dropOff !== null && (
              <div className="flex justify-center items-center py-1">
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full px-2.5 py-0.5">
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                  <span className="text-[10px] font-semibold text-rose-400">−{dropOff}% descartados</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelected(isSelected ? null : i)}
              className="group relative flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200 text-left"
            >
              <div className="w-28 shrink-0 text-right">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {stage.label}
                </span>
              </div>

              <div className="flex-1 flex justify-center">
                <div
                  className={`relative h-10 rounded-lg transition-all duration-300 ${FUNNEL_BG[i] ?? FUNNEL_BG[FUNNEL_BG.length - 1]} ${isSelected ? "ring-2 ring-white/40 shadow-lg shadow-[#145338]/20" : ""}`}
                  style={{ width: `${widthPct}%` }}
                >
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-white font-bold text-sm">{stage.count}</span>
                    </div>
                    <span className="text-white/80 text-xs font-medium">{stage.conversionRate}%</span>
                  </div>
                </div>
              </div>

              <div className="w-6 shrink-0 flex justify-center">
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isSelected ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            {isSelected && (
              <div className="mx-2 mb-1 mt-0.5 p-4 bg-card border border-border rounded-xl text-sm space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${FUNNEL_COLORS[i] ?? FUNNEL_COLORS[FUNNEL_COLORS.length - 1]}`} />
                  {stage.label}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/40 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-foreground">{stage.count}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">candidatos</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-foreground">{stage.conversionRate}%</div>
                    <div className="text-xs text-muted-foreground mt-0.5">taxa geral</div>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3 text-center">
                    {dropOff !== null ? (
                      <>
                        <div className="text-2xl font-bold text-rose-400">{dropOff}%</div>
                        <div className="text-xs text-muted-foreground mt-0.5">descartados</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-emerald-400">—</div>
                        <div className="text-xs text-muted-foreground mt-0.5">etapa inicial</div>
                      </>
                    )}
                  </div>
                </div>
                {!isLast && stages[i + 1] && (
                  <p className="text-xs text-muted-foreground">
                    Da etapa seguinte (<strong className="text-foreground">{stages[i + 1]!.label}</strong>): apenas{" "}
                    <strong className="text-foreground">{stages[i + 1]!.count}</strong> candidatos avançaram.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const STATIC_SOURCE_OF_HIRE = [
  { name: "LinkedIn", value: 38, color: "#145338" },
  { name: "Indicação", value: 24, color: "#0d9488" },
  { name: "Site da Empresa", value: 18, color: "#97A09B" },
  { name: "Gupy / Catho", value: 12, color: "#2d8a5e" },
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
          className="h-full bg-[#145338] rounded-full"
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
        <Card className="chart-card border-border rounded-xl fade-in-up">
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
        <Card className="chart-card border-border rounded-xl fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Funil de Conversão Global</CardTitle>
            <p className="text-xs text-muted-foreground">Clique em uma etapa para ver detalhes</p>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            {funnelData.length > 0 ? (
              <FunnelViz stages={funnelData} />
            ) : (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Sem dados de funil disponíveis.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hires Over Time */}
        <Card className="col-span-1 lg:col-span-2 chart-card border-border rounded-xl fade-in-up">
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
                  <Line type="monotone" dataKey="openings" name="Novas Vagas" stroke="#145338" strokeWidth={2.5} dot={{ r: 4, fill: "#145338", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="hires" name="Contratações" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Custo por Contratação — Tendência */}
        <Card className="chart-card border-border rounded-xl fade-in-up">
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
                    stroke="#145338"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#145338", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Contratações por Departamento */}
        <Card className="chart-card border-border rounded-xl fade-in-up">
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
                  <Bar dataKey="openJobs" name="Vagas Abertas" fill="#6A6E6C" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="hires" name="Contratados" fill="#145338" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Source of Hire */}
        <Card className="chart-card border-border rounded-xl fade-in-up">
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
        <Card className="chart-card border-border rounded-xl fade-in-up">
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
                    stroke="#145338"
                    fill="#145338"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance por Recrutador */}
        <Card className="col-span-1 lg:col-span-2 chart-card border-border rounded-xl fade-in-up">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#145338]" />
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
                          <div className="w-9 h-9 rounded-full bg-[#145338]/15 flex items-center justify-center text-xs font-bold text-[#145338]">
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
