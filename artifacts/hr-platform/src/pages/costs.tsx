import { useState, useMemo } from "react";
import { useGetOpenJobsCost } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import {
  Calculator,
  AlertCircle,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Lightbulb,
  Zap,
  Target,
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
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
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

const COST_DISTRIBUTION = [
  { name: "Custo de Oportunidade", value: 65, color: "#145338" },
  { name: "Recrutador/RH", value: 18, color: "#2d8a5e" },
  { name: "Agências", value: 11, color: "#97A09B" },
  { name: "Ferramentas", value: 4, color: "#6A6E6C" },
  { name: "Anúncios", value: 2, color: "#000402" },
];

const IMPACT_OPTIONS = [
  { value: "low", label: "Suporte/Adm (Baixo Impacto)", factor: 1.5 },
  { value: "medium", label: "Técnico/Especialista (Médio Impacto)", factor: 2.5 },
  { value: "high", label: "Vendas/Liderança/TI (Alto Impacto)", factor: 4.0 },
];

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <Card className="border-border shadow-sm rounded-xl card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">{label}</p>
            <p className="text-3xl font-display font-bold text-foreground">{value}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {trend && (
                <span className={`inline-flex items-center text-xs font-medium ${trend.positive ? "text-emerald-600" : "text-rose-500"}`}>
                  {trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {trend.value}
                </span>
              )}
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CovSimulator() {
  const [cargo, setCargo] = useState("Executivo de Vendas");
  const [salarioMensal, setSalarioMensal] = useState(8000);
  const [encargosPercent, setEncargosPercent] = useState(75);
  const [diasVagaAberta, setDiasVagaAberta] = useState(30);
  const [impacto, setImpacto] = useState("medium");

  const fator = IMPACT_OPTIONS.find((o) => o.value === impacto)?.factor ?? 2.5;

  const safeSalario = Number.isFinite(salarioMensal) && salarioMensal > 0 ? salarioMensal : 0;
  const safeEncargos = Number.isFinite(encargosPercent) ? encargosPercent : 75;
  const safeDias = Number.isFinite(diasVagaAberta) && diasVagaAberta > 0 ? diasVagaAberta : 0;

  const custoMensalTotal = safeSalario * (1 + safeEncargos / 100);
  const valorDiarioPerdido = (custoMensalTotal * fator) / 22;
  const prejuizoTotal = valorDiarioPerdido * safeDias;

  const reducaoDias = 15;
  const economiaEstimada = valorDiarioPerdido * reducaoDias;

  const projectionData = useMemo(() => {
    const points = [];
    for (let d = 0; d <= Math.max(safeDias, 60); d += 5) {
      points.push({
        dia: d,
        semPlataforma: Math.round(valorDiarioPerdido * d),
        comPlataforma: Math.round(valorDiarioPerdido * Math.max(0, d - reducaoDias)),
      });
    }
    return points;
  }, [valorDiarioPerdido, safeDias, reducaoDias]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border shadow-sm rounded-xl lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#145338]" />
              Configurações da Vaga
            </CardTitle>
            <p className="text-xs text-muted-foreground">Benchmarks LATAM 2025/2026</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nome do Cargo</Label>
              <Input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex: Executivo de Vendas"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Salário Mensal Bruto</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  type="number"
                  value={salarioMensal}
                  onChange={(e) => setSalarioMensal(Number(e.target.value))}
                  className="pl-10"
                  step={500}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Encargos e Benefícios</Label>
                <span className="text-sm font-bold text-[#145338]">{encargosPercent}%</span>
              </div>
              <Slider
                value={[encargosPercent]}
                onValueChange={(v) => setEncargosPercent(v[0])}
                min={40}
                max={100}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>40%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Dias de Vaga Aberta</Label>
              <Input
                type="number"
                value={diasVagaAberta}
                onChange={(e) => setDiasVagaAberta(Number(e.target.value))}
                step={1}
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Impacto na Receita</Label>
              <Select value={impacto} onValueChange={setImpacto}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMPACT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Fator de produtividade: <span className="font-semibold text-foreground">{fator}x</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border shadow-sm rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">Custo Mensal Real</p>
                <p className="text-2xl font-display font-bold text-foreground">{formatCurrency(custoMensalTotal)}</p>
                <p className="text-xs text-muted-foreground mt-1">Salário + encargos</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm rounded-xl">
              <CardContent className="p-4">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">Perda Diária</p>
                <p className="text-2xl font-display font-bold text-rose-600">{formatCurrency(valorDiarioPerdido)}</p>
                <p className="text-xs text-muted-foreground mt-1">Por dia útil sem a posição</p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm rounded-xl border-rose-200 bg-rose-50/30">
              <CardContent className="p-4">
                <p className="text-xs font-semibold tracking-widest text-rose-600 uppercase mb-1">Prejuízo Acumulado</p>
                <p className="text-2xl font-display font-bold text-rose-700">{formatCurrency(prejuizoTotal)}</p>
                <p className="text-xs text-rose-500 mt-1">{diasVagaAberta} dias × fator {fator}x</p>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">Alerta de Vacância</p>
                <p className="text-sm text-amber-800 mt-1">
                  Sua empresa está deixando de gerar{" "}
                  <span className="font-bold">{formatCurrency(prejuizoTotal)}</span>{" "}
                  em valor/receita devido à vacância da posição de{" "}
                  <span className="font-bold">{cargo || "—"}</span>.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-border shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Projeção de Prejuízo Acumulado</CardTitle>
              <p className="text-xs text-muted-foreground">Sem plataforma vs. com Talent Cool</p>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 8, right: 16, left: 4, bottom: 4 }}>
                    <defs>
                      <linearGradient id="gradRose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#145338" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#145338" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="dia"
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}d`}
                    />
                    <YAxis
                      fontSize={11}
                      stroke="hsl(var(--muted-foreground))"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `R$${Math.round(v / 1000)}K`}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => [
                        formatCurrency(v),
                        name === "semPlataforma" ? "Sem plataforma" : "Com Talent Cool",
                      ]}
                      labelFormatter={(l) => `Dia ${l}`}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid hsl(var(--border))",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="semPlataforma"
                      stroke="#e11d48"
                      strokeWidth={2}
                      fill="url(#gradRose)"
                      name="semPlataforma"
                    />
                    <Area
                      type="monotone"
                      dataKey="comPlataforma"
                      stroke="#145338"
                      strokeWidth={2}
                      fill="url(#gradGreen)"
                      name="comPlataforma"
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(val) => (val === "semPlataforma" ? "Sem plataforma" : "Com Talent Cool")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#145338]/20 bg-[#145338]/5 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#145338]/10 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-[#145338]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm mb-2">Como o Talent Cool resolve isso</p>
                  <p className="text-sm text-muted-foreground">
                    Ao utilizar nossa plataforma de automação, você reduz o tempo médio de contratação em{" "}
                    <span className="font-bold text-[#145338]">{reducaoDias} dias</span>.
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#145338]/10">
                      <Zap className="w-4 h-4 text-[#145338]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Economia por vaga</p>
                        <p className="font-bold text-[#145338]">{formatCurrency(economiaEstimada)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#145338]/10">
                      <Target className="w-4 h-4 text-[#145338]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Redução no tempo</p>
                        <p className="font-bold text-[#145338]">-{reducaoDias} dias</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-[#145338]/10">
                      <BarChart3 className="w-4 h-4 text-[#145338]" />
                      <div>
                        <p className="text-xs text-muted-foreground">ROI estimado</p>
                        <p className="font-bold text-[#145338]">
                          {prejuizoTotal > 0 ? Math.round((economiaEstimada / prejuizoTotal) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RealCostView() {
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

  const highestCostJob = costData.jobs.length > 0
    ? costData.jobs.reduce((max, j) => (j.totalAccruedCost > max.totalAccruedCost ? j : max), costData.jobs[0])
    : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          label="Custo Total Estimado"
          value={formatCurrency(totalAccruedCost)}
          sub={`${costData.jobs.length} vagas ativas`}
          icon={DollarSign}
          iconBg="bg-[#145338]/10"
          iconColor="text-[#145338]"
        />
        <KpiCard
          label="Custo Médio por Vaga"
          value={formatCurrency(avgCostPerJob)}
          sub="Média geral"
          icon={Calculator}
          iconBg="bg-[#97A09B]/10"
          iconColor="text-[#97A09B]"
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

      {highestCostJob && (
        <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">Maior impacto financeiro</p>
            <p className="text-amber-800 mt-0.5">
              A vaga de <span className="font-bold">{highestCostJob.jobTitle}</span> ({highestCostJob.department}) está aberta há{" "}
              <span className="font-bold">{highestCostJob.daysOpen} dias</span> e já acumulou{" "}
              <span className="font-bold">{formatCurrency(highestCostJob.totalAccruedCost)}</span> em custos.
            </p>
          </div>
        </div>
      )}

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
                  <Bar dataKey="Oportunidade" stackId="a" fill="#145338" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Recrutador" stackId="a" fill="#2d8a5e" />
                  <Bar dataKey="Agência" stackId="a" fill="#97A09B" />
                  <Bar dataKey="Anúncio" stackId="a" fill="#6A6E6C" />
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

      <div className="flex items-start gap-2 p-4 bg-[#145338]/10 border border-[#145338]/20 rounded-xl text-sm">
        <AlertCircle className="h-4 w-4 text-[#145338] mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-foreground">Como calculamos?</p>
          <p className="text-muted-foreground mt-0.5">
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
                    <span className={`inline-flex px-2 py-1 rounded-md font-medium text-xs ${
                      job.daysOpen > 45
                        ? "bg-rose-100 text-rose-700"
                        : job.daysOpen > 30
                          ? "bg-amber-100 text-amber-700"
                          : "bg-muted text-muted-foreground"
                    }`}>
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

export default function Costs() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Custo de Vagas em Aberto
        </h1>
        <p className="text-muted-foreground mt-1">Análise financeira e simulador de Cost of Vacancy (CoV)</p>
      </div>

      <Tabs defaultValue="real" className="w-full">
        <TabsList className="bg-muted/60 p-1 rounded-lg">
          <TabsTrigger value="real" className="rounded-md text-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <DollarSign className="w-4 h-4 mr-1.5" />
            Vagas Abertas
          </TabsTrigger>
          <TabsTrigger value="simulator" className="rounded-md text-sm px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Calculator className="w-4 h-4 mr-1.5" />
            Simulador CoV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="real" className="mt-6">
          <RealCostView />
        </TabsContent>

        <TabsContent value="simulator" className="mt-6">
          <CovSimulator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
