import { useState } from "react";
import {
  useListBenchmarks,
  useListBenchmarkRegions,
  useListBenchmarkJobTitles,
  useListJobs,
} from "@workspace/api-client-react";
import type { ListBenchmarksParams } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Search, Map, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";

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
      <Minus className="w-3 h-3" /> Na Média
    </span>
  );
}

export default function Benchmarking() {
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: regions } = useListBenchmarkRegions();
  const { data: jobTitles } = useListBenchmarkJobTitles();

  const params: ListBenchmarksParams = {};
  if (regionFilter !== "all") params.region = regionFilter;
  if (jobFilter !== "all") params.jobTitle = jobFilter;

  const { data: benchmarks, isLoading } = useListBenchmarks(params);
  const { data: openJobs } = useListJobs({ status: "open" });

  const filteredBenchmarks = benchmarks?.filter((b) =>
    b.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const comparisonRows = openJobs?.map((job) => {
    const offeredMid = (job.minSalary + job.maxSalary) / 2;
    const match = benchmarks?.find(
      (b) => b.jobTitle.toLowerCase().includes(job.title.split(" ")[0].toLowerCase())
    );
    const marketMedian = match?.medianSalary ?? null;
    const delta = marketMedian ? ((offeredMid - marketMedian) / marketMedian) * 100 : null;
    return { job, offeredMid, marketMedian, delta };
  });

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          Benchmarking de Mercado
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none text-xs rounded-full">
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
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
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
                  <SelectItem key={j} value={j}>
                    {j}
                  </SelectItem>
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
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
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
                          <div className="text-xs text-muted-foreground capitalize mt-0.5">
                            {item.seniority}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal text-xs">
                            {item.region}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {formatCurrency(item.minSalary)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary bg-primary/5 group-hover:bg-primary/10 transition-colors text-sm">
                          {formatCurrency(item.medianSalary)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {formatCurrency(item.maxSalary)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            {item.sampleSize}
                          </span>
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
          <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800">
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
                    <TableHead className="font-semibold text-foreground text-right">
                      Salário Oferecido (mid)
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-right">
                      Mediana Mercado
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-center">
                      Posicionamento
                    </TableHead>
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
                        <TableCell className="text-sm text-muted-foreground">
                          {job.departmentName}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {formatCurrency(offeredMid)}
                        </TableCell>
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
      </Tabs>
    </div>
  );
}
