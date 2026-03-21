import { useState } from "react";
import {
  useListBenchmarks,
  useListBenchmarkRegions,
  useListBenchmarkJobTitles,
  useListJobs,
  useGetBenchmarkSalaryBands,
  useGetBenchmarkRegionalVariation,
  getGetBenchmarkSalaryBandsQueryKey,
  getGetBenchmarkRegionalVariationQueryKey,
} from "@workspace/api-client-react";
import type { ListBenchmarksParams } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Search, Map, ArrowUp, ArrowDown, Minus, MapPin, Info } from "lucide-react";
import { Input } from "@/components/ui/input";

const SENIORITY_LABELS: Record<string, string> = {
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
};

function PositionBadge({ delta }: { delta: number }) {
  if (delta > 10) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <ArrowUp className="w-3 h-3" /> Acima +{delta.toFixed(0)}%
      </span>
    );
  }
  if (delta < -10) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
        <ArrowDown className="w-3 h-3" /> Abaixo {delta.toFixed(0)}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
      <Minus className="w-3 h-3" /> Na mediana
    </span>
  );
}

function SalaryBandRow({
  seniority,
  p10,
  p25,
  median,
  p75,
  p90,
  internalSalary,
}: {
  seniority: string;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  internalSalary: number | null;
}) {
  const range = p90 - p10;
  const pct = (v: number) => (range > 0 ? ((v - p10) / range) * 100 : 50);

  const p25pct = pct(p25);
  const medianPct = pct(median);
  const p75pct = pct(p75);
  const internalPct = internalSalary !== null ? pct(internalSalary) : null;

  const delta = internalSalary ? ((internalSalary - median) / median) * 100 : null;
  const label = delta === null ? null : Math.abs(delta) <= 10 ? "Na mediana do mercado" : delta > 0 ? `Acima +${delta.toFixed(0)}%` : `Abaixo ${delta.toFixed(0)}%`;
  const labelColor = delta === null ? "" : Math.abs(delta) <= 10 ? "text-amber-600" : delta > 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-foreground">{SENIORITY_LABELS[seniority] ?? seniority}</span>
        {label && <span className={`text-xs font-medium ${labelColor}`}>— {label}</span>}
      </div>

      <div className="relative h-3 rounded-full bg-muted overflow-visible mx-1">
        {/* IQR bar P25-P75 */}
        <div
          className="absolute top-0 h-full rounded-full bg-[#B5BCC9]"
          style={{ left: `${p25pct}%`, width: `${p75pct - p25pct}%` }}
        />
        {/* Median tick */}
        <div
          className="absolute top-[-3px] bottom-[-3px] w-0.5 bg-[#70709F] rounded-full"
          style={{ left: `${medianPct}%` }}
        />
        {/* Internal salary dot */}
        {internalPct !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-md z-10"
            style={{ left: `${internalPct}%`, transform: "translate(-50%, -50%)" }}
          />
        )}
      </div>

      <div className="flex justify-between mt-2 text-[11px] text-muted-foreground">
        <span>P10: {formatCurrency(p10)}</span>
        <span className="text-[#70709F] font-medium">Mediana: {formatCurrency(median)}</span>
        <span>P90: {formatCurrency(p90)}</span>
      </div>
      {internalSalary !== null && (
        <div className="mt-1 text-center">
          <span className="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
            Interno: {formatCurrency(internalSalary)}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Benchmarking() {
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [analysisJob, setAnalysisJob] = useState<string>("");
  const [analysisRegion, setAnalysisRegion] = useState<string>("São Paulo, SP");
  const [analysisSeniority, setAnalysisSeniority] = useState<string>("pleno");

  const { data: regions } = useListBenchmarkRegions();
  const { data: jobTitles } = useListBenchmarkJobTitles();

  const params: ListBenchmarksParams = {};
  if (regionFilter !== "all") params.region = regionFilter;
  if (jobFilter !== "all") params.jobTitle = jobFilter;

  const { data: benchmarks, isLoading } = useListBenchmarks(params);
  const { data: openJobs } = useListJobs({ status: "open" });

  const firstJob = jobTitles?.[0] ?? "";
  const effectiveJob = analysisJob || firstJob;

  const salaryBandsParams = { jobTitle: effectiveJob, region: analysisRegion };
  const { data: salaryBands, isLoading: bandsLoading } = useGetBenchmarkSalaryBands(
    salaryBandsParams,
    { query: { queryKey: getGetBenchmarkSalaryBandsQueryKey(salaryBandsParams), enabled: !!effectiveJob } }
  );

  const regionalParams = { jobTitle: effectiveJob, seniority: analysisSeniority };
  const { data: regionalData, isLoading: regionalLoading } = useGetBenchmarkRegionalVariation(
    regionalParams,
    { query: { queryKey: getGetBenchmarkRegionalVariationQueryKey(regionalParams), enabled: !!effectiveJob } }
  );

  const filteredBenchmarks = benchmarks?.filter((b) =>
    b.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  function scoreBenchmarkMatch(benchmarkTitle: string, jobTitle: string): number {
    const bt = benchmarkTitle.toLowerCase();
    const jt = jobTitle.toLowerCase();
    if (bt === jt) return 100;
    const jobWords = jt.split(/\s+/).filter((w) => w.length > 2);
    const matchCount = jobWords.filter((w) => bt.includes(w)).length;
    return jobWords.length > 0 ? matchCount / jobWords.length : 0;
  }

  const comparisonRows = openJobs?.map((job) => {
    const offeredMid = (job.minSalary + job.maxSalary) / 2;
    let bestMatch = null;
    let bestScore = 0;
    for (const b of benchmarks ?? []) {
      const score = scoreBenchmarkMatch(b.jobTitle, job.title);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = b;
      }
    }
    const match = bestScore > 0 ? bestMatch : null;
    const marketMedian = match?.medianSalary ?? null;
    const delta = marketMedian ? ((offeredMid - marketMedian) / marketMedian) * 100 : null;
    return { job, offeredMid, marketMedian, delta };
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          Benchmarking de Mercado
          <Badge className="bg-[#70709F]/15 text-[#70709F] hover:bg-[#70709F]/15 border-none text-xs rounded-full">
            Módulo Estratégico
          </Badge>
        </h1>
        <p className="text-muted-foreground mt-2 text-base max-w-3xl">
          Compare as faixas salariais da sua empresa com o mercado regional. Base com dados de
          milhares de empresas brasileiras.
        </p>
      </div>

      <Tabs defaultValue="market">
        <TabsList className="mb-4">
          <TabsTrigger value="market">Dados de Mercado</TabsTrigger>
          <TabsTrigger value="comparison">Comparativo Salarial</TabsTrigger>
          <TabsTrigger value="analysis">Análise Detalhada</TabsTrigger>
        </TabsList>

        {/* Market data tab */}
        <TabsContent value="market">
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cargo..."
                className="pl-9 h-10 bg-background rounded-lg border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full md:w-[220px] h-10 rounded-lg bg-background border-border">
                <Map className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Brasil (Nacional)</SelectItem>
                {regions?.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-full md:w-[220px] h-10 rounded-lg bg-background border-border">
                <LineChart className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filtrar Cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Cargos</SelectItem>
                {jobTitles?.map((j) => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="border-border shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground py-3">Cargo & Senioridade</TableHead>
                    <TableHead className="font-semibold text-foreground">Região</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">P25</TableHead>
                    <TableHead className="font-semibold text-foreground text-right bg-primary/5 text-primary">P50 Mediana</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">P75</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Amostra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredBenchmarks?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Nenhum dado encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBenchmarks?.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors group">
                        <TableCell>
                          <div className="font-semibold text-foreground">{item.jobTitle}</div>
                          <div className="text-xs text-muted-foreground capitalize mt-0.5">{item.seniority}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal text-xs">{item.region}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{formatCurrency(item.minSalary)}</TableCell>
                        <TableCell className="text-right font-bold text-primary bg-primary/5 group-hover:bg-primary/10 transition-colors text-sm">
                          {formatCurrency(item.medianSalary)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">{formatCurrency(item.maxSalary)}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{item.sampleSize}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Comparison tab */}
        <TabsContent value="comparison">
          <div className="mb-4 p-4 bg-[#70709F]/10 border border-[#70709F]/20 rounded-xl text-sm text-foreground">
            <strong>Comparativo Interno vs. Mercado</strong> — Cada vaga aberta é cruzada com o
            benchmark de mercado mais próximo pelo nome do cargo. Use para ajustar faixas salariais
            antes de fechar uma contratação.
          </div>
          <Card className="border-border shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground py-3">Vaga</TableHead>
                    <TableHead className="font-semibold text-foreground">Departamento</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Salário Oferecido (mid)</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">Mediana Mercado</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">Posicionamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!comparisonRows || comparisonRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        Nenhuma vaga aberta encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    comparisonRows.map(({ job, offeredMid, marketMedian, delta }) => (
                      <TableRow key={job.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-foreground text-sm">{job.title}</div>
                          <div className="text-xs text-muted-foreground capitalize">{job.seniority}</div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{job.departmentName}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">{formatCurrency(offeredMid)}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {marketMedian ? formatCurrency(marketMedian) : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {delta !== null ? (
                            <PositionBadge delta={delta} />
                          ) : (
                            <span className="text-xs text-muted-foreground">Sem referência</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Detailed Analysis tab */}
        <TabsContent value="analysis">
          {/* Selectors */}
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3 mb-6">
            <Select value={effectiveJob} onValueChange={setAnalysisJob}>
              <SelectTrigger className="w-full md:w-[260px] h-10 rounded-lg bg-background border-border">
                <LineChart className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Selecionar Cargo" />
              </SelectTrigger>
              <SelectContent>
                {jobTitles?.map((j) => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={analysisRegion} onValueChange={setAnalysisRegion}>
              <SelectTrigger className="w-full md:w-[220px] h-10 rounded-lg bg-background border-border">
                <Map className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                {regions?.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={analysisSeniority} onValueChange={setAnalysisSeniority}>
              <SelectTrigger className="w-full md:w-[160px] h-10 rounded-lg bg-background border-border">
                <SelectValue placeholder="Senioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="junior">Júnior</SelectItem>
                <SelectItem value="pleno">Pleno</SelectItem>
                <SelectItem value="senior">Sênior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Salary Bands Visualization */}
            <Card className="border-border shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">
                  {effectiveJob || "Cargo"} — Faixas por Nível
                </CardTitle>
                <p className="text-xs text-muted-foreground">{analysisRegion}</p>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="mb-5 p-3 bg-muted/40 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">Como ler o gráfico</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2 rounded-full bg-[#B5BCC9]" />
                      <span>Intervalo Interquartil (P25–P75)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-0.5 h-4 bg-[#70709F] rounded-full" />
                      <span>Mediana do mercado (P50)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white shadow-sm" />
                      <span>Salário interno atual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-muted-foreground/40 rounded-full" />
                      <span>Limites P10 e P90</span>
                    </div>
                  </div>
                </div>

                {bandsLoading ? (
                  <div className="space-y-6">
                    {[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
                  </div>
                ) : !salaryBands || salaryBands.bands.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum dado disponível para o cargo selecionado.
                  </p>
                ) : (
                  salaryBands.bands.map((band) => (
                    <SalaryBandRow
                      key={band.seniority}
                      seniority={band.seniority}
                      p10={band.p10}
                      p25={band.p25}
                      median={band.median}
                      p75={band.p75}
                      p90={band.p90}
                      internalSalary={band.internalSalary ?? null}
                    />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Variação Salarial por Região */}
            <Card className="border-border shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Variação Salarial por Região</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {effectiveJob} — {SENIORITY_LABELS[analysisSeniority] ?? analysisSeniority} — Mediana do mercado
                </p>
              </CardHeader>
              <CardContent>
                {regionalLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                  </div>
                ) : !regionalData || regionalData.regions.length === 0 ? (
                  <p className="text-center py-10 text-muted-foreground text-sm">
                    Nenhum dado disponível para o cargo selecionado.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {regionalData.regions.map((r) => {
                      const isSP = r.index === 100;
                      return (
                        <div
                          key={r.region}
                          className={`p-3 rounded-xl border ${isSP ? "bg-[#70709F] border-[#70709F] text-white" : "bg-card border-border"}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className={`flex items-center gap-1 text-xs ${isSP ? "text-[#B5BCC9]" : "text-muted-foreground"}`}>
                              <MapPin className="w-3 h-3" />
                              <span>{r.region}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSP ? "bg-[#70709F]/80 text-white" : "bg-muted text-foreground"}`}>
                              {r.index}
                            </span>
                          </div>
                          <div className={`text-lg font-bold ${isSP ? "text-white" : "text-foreground"}`}>
                            {formatCurrency(r.medianSalary)}
                          </div>
                          <div className={`text-[11px] mt-0.5 ${isSP ? "text-[#B5BCC9]" : "text-muted-foreground"}`}>
                            índice relativo a SP
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comparativo Detalhado por Nível */}
            <Card className="col-span-1 lg:col-span-2 border-border shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base">Comparativo Detalhado por Nível</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Todos os percentis e posição do salário interno — {analysisRegion}
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-foreground py-3">Nível</TableHead>
                        <TableHead className="font-semibold text-foreground text-right">P10</TableHead>
                        <TableHead className="font-semibold text-foreground text-right">P25</TableHead>
                        <TableHead className="font-semibold text-foreground text-right text-[#70709F] bg-[#70709F]/10">Mediana</TableHead>
                        <TableHead className="font-semibold text-foreground text-right">P75</TableHead>
                        <TableHead className="font-semibold text-foreground text-right">P90</TableHead>
                        <TableHead className="font-semibold text-amber-600 text-right">Salário Interno</TableHead>
                        <TableHead className="font-semibold text-foreground text-center">Posição</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bandsLoading ? (
                        Array(3).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            {Array(8).fill(0).map((_, j) => (
                              <TableCell key={j}><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : !salaryBands || salaryBands.bands.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                            Selecione um cargo para ver os dados detalhados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        salaryBands.bands.map((band) => {
                          const delta = band.internalSalary
                            ? ((band.internalSalary - band.median) / band.median) * 100
                            : null;
                          return (
                            <TableRow key={band.seniority} className="hover:bg-muted/20 transition-colors">
                              <TableCell className="font-semibold py-4">
                                {SENIORITY_LABELS[band.seniority] ?? band.seniority}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {formatCurrency(band.p10)}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {formatCurrency(band.p25)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-[#70709F] bg-[#70709F]/10">
                                {formatCurrency(band.median)}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {formatCurrency(band.p75)}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {formatCurrency(band.p90)}
                              </TableCell>
                              <TableCell className="text-right font-bold text-amber-600">
                                {band.internalSalary ? formatCurrency(band.internalSalary) : <span className="text-muted-foreground font-normal">—</span>}
                              </TableCell>
                              <TableCell className="text-center">
                                {delta !== null ? (
                                  <PositionBadge delta={delta} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
