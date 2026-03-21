import { useGetOpenJobsCost } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { Calculator, AlertCircle, Building2, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COST_DISTRIBUTION = [
  { name: "Custo de Oportunidade", value: 65, color: "#6366f1" },
  { name: "Recrutador/RH", value: 18, color: "#a78bfa" },
  { name: "Agências", value: 11, color: "#3b82f6" },
  { name: "Ferramentas", value: 4, color: "#06b6d4" },
  { name: "Anúncios", value: 2, color: "#f59e0b" },
];

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="border-border shadow-sm rounded-xl card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">{label}</p>
            <p className="text-3xl font-display font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Costs() {
  const { data: costData, isLoading } = useGetOpenJobsCost();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[380px] rounded-xl" />
          <Skeleton className="h-[380px] rounded-xl" />
        </div>
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    );
  }

  if (!costData) return null;

  const totalAccruedCost = costData.jobs.reduce((acc, job) => acc + job.totalAccruedCost, 0);
  const avgCostPerJob = costData.jobs.length > 0 ? totalAccruedCost / costData.jobs.length : 0;
  const avgDaysOpen =
    costData.jobs.length > 0
      ? Math.round(costData.jobs.reduce((acc, job) => acc + job.daysOpen, 0) / costData.jobs.length)
      : 0;
  const opportunityCost = costData.totalMonthlyCost;

  const barChartData = costData.jobs.map((job) => ({
    name: job.jobTitle.length > 20 ? job.jobTitle.slice(0, 20) + "…" : job.jobTitle,
    Oportunidade: Math.round(job.totalAccruedCost * 0.65),
    Recrutador: Math.round(job.totalAccruedCost * 0.18),
    Agência: Math.round(job.totalAccruedCost * 0.11),
    Anúncio: Math.round(job.totalAccruedCost * 0.02),
    Ferramentas: Math.round(job.totalAccruedCost * 0.04),
  }));

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Custo de Vagas em Aberto
        </h1>
        <p className="text-muted-foreground mt-1">Análise financeira do processo seletivo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Custo Total Estimado"
          value={formatCurrency(totalAccruedCost)}
          sub={`${costData.jobs.length} vagas ativas`}
          icon={DollarSign}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <KpiCard
          label="Custo Médio por Vaga"
          value={formatCurrency(avgCostPerJob)}
          sub="Média geral"
          icon={Calculator}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <KpiCard
          label="Custo de Oportunidade"
          value={formatCurrency(opportunityCost)}
          sub="Posições produtivas vazias"
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <KpiCard
          label="Tempo Médio em Aberto"
          value={`${avgDaysOpen} dias`}
          sub="Tempo para fechar vaga"
          icon={Clock}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Custo por Vaga</CardTitle>
            <p className="text-xs text-muted-foreground">Composição de custos por posição</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 4, bottom: 4 }}
                >
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `R$${Math.round(v / 1000)}K`}
                    fontSize={11}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    fontSize={11}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Oportunidade" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Recrutador" stackId="a" fill="#a78bfa" />
                  <Bar dataKey="Agência" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Anúncio" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Ferramentas" stackId="a" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Custos</CardTitle>
            <p className="text-xs text-muted-foreground">Por categoria</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COST_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {COST_DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {COST_DISTRIBUTION.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-start gap-2 p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-sm">
        <AlertCircle className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-indigo-900">Como calculamos?</p>
          <p className="text-indigo-700 mt-0.5">
            Baseado no salário médio de mercado + encargos ({(costData.chargesRate * 100).toFixed(0)}%) por dia útil.
            Representa o custo de oportunidade e produtividade perdida por posição não preenchida.
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-base font-display">Detalhamento por Vaga</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground">Cargo</TableHead>
                <TableHead className="font-semibold text-foreground">Departamento</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Dias Aberta</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Salário Ref.</TableHead>
                <TableHead className="font-semibold text-foreground text-right text-rose-600">Custo Diário</TableHead>
                <TableHead className="font-semibold text-foreground text-right text-rose-600">Custo Acumulado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costData.jobs.map((job) => (
                <TableRow key={job.jobId} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="font-medium">{job.jobTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Building2 className="w-3 h-3 mr-1.5" />
                      {job.department}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium text-xs">
                      {job.daysOpen}d
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(job.avgSalary)}</TableCell>
                  <TableCell className="text-right font-medium text-rose-500">{formatCurrency(job.dailyCost)}</TableCell>
                  <TableCell className="text-right font-bold text-rose-600">{formatCurrency(job.totalAccruedCost)}</TableCell>
                </TableRow>
              ))}
              {costData.jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Nenhuma vaga aberta no momento. Parabéns!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
