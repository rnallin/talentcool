import { useGetOpenJobsCost } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { Calculator, AlertCircle, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Costs() {
  const { data: costData, isLoading } = useGetOpenJobsCost();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  if (!costData) return null;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Custo de Vagas em Aberto</h1>
        <p className="text-muted-foreground mt-1 text-lg">Análise financeira do impacto das posições não preenchidas.</p>
      </div>

      <Alert className="bg-indigo-50 border-indigo-200 text-indigo-900 rounded-xl">
        <AlertCircle className="h-4 w-4" color="currentColor" />
        <AlertTitle className="font-semibold">Como calculamos isso?</AlertTitle>
        <AlertDescription className="text-indigo-800/80 mt-1">
          O cálculo baseia-se no salário médio de mercado para a posição + uma taxa de encargos configurada (atualmente <strong>{costData.chargesRate * 100}%</strong>), dividida pelos dias úteis. Representa o custo de oportunidade e produtividade perdida.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-rose-500 to-red-600 text-white border-0 shadow-lg shadow-rose-500/20 card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-rose-100 text-sm font-medium flex justify-between">
              Custo Total Acumulado
              <Calculator className="h-4 w-4 opacity-70" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold">
              {formatCurrency(costData.jobs.reduce((acc, job) => acc + job.totalAccruedCost, 0))}
            </div>
            <p className="text-sm text-rose-100/80 mt-2">Soma de todas as vagas abertas hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Impacto Mensal Projetado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">
              {formatCurrency(costData.totalMonthlyCost)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Se as vagas não forem fechadas neste mês</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">Vazamento Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-foreground">
              {formatCurrency(costData.totalDailyCost)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Custo por dia de atraso nas contratações</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-lg font-display">Detalhamento por Vaga</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
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
                <TableRow key={job.jobId} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{job.jobTitle}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Building2 className="w-3 h-3 mr-1.5" />
                      {job.department}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                      {job.daysOpen}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(job.avgSalary)}</TableCell>
                  <TableCell className="text-right font-medium text-rose-600/80">{formatCurrency(job.dailyCost)}</TableCell>
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
