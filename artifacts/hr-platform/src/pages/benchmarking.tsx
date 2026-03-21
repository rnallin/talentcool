import { useState } from "react";
import { useListBenchmarks, useListBenchmarkRegions, useListBenchmarkJobTitles } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Search, Map } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Benchmarking() {
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: regions } = useListBenchmarkRegions();
  const { data: jobTitles } = useListBenchmarkJobTitles();
  
  // Pass params if not "all"
  const params: any = {};
  if (regionFilter !== "all") params.region = regionFilter;
  if (jobFilter !== "all") params.jobTitle = jobFilter;
  
  const { data: benchmarks, isLoading } = useListBenchmarks(params);

  // Client side text search fallback
  const filteredBenchmarks = benchmarks?.filter(b => 
    b.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-3">
          Benchmarking de Mercado
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none">Módulo Estratégico</Badge>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-3xl">
          Compare as faixas salariais da sua empresa com o mercado. Dados agregados de milhares de empresas para basear suas decisões.
        </p>
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar por cargo..." 
            className="pl-10 h-11 bg-background rounded-xl border-border focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-full md:w-[250px] h-11 rounded-xl bg-background border-border">
            <Map className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Brasil (Nacional)</SelectItem>
            {regions?.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-full md:w-[250px] h-11 rounded-xl bg-background border-border">
            <LineChart className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar Cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Cargos</SelectItem>
            {jobTitles?.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-foreground py-4">Cargo & Senioridade</TableHead>
                <TableHead className="font-semibold text-foreground">Região</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Mínimo (P25)</TableHead>
                <TableHead className="font-semibold text-foreground text-right bg-primary/5 text-primary">Mediana (P50)</TableHead>
                <TableHead className="font-semibold text-foreground text-right">Máximo (P75)</TableHead>
                <TableHead className="font-semibold text-foreground text-center">Amostra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredBenchmarks?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum dado de benchmark encontrado para os filtros selecionados.
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
                      <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-700">{item.region}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(item.minSalary)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      {formatCurrency(item.medianSalary)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(item.maxSalary)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {item.sampleSize} empresas
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
