import { useState } from "react";
import { useListJobs, useCreateJob, useListDepartments } from "@workspace/api-client-react";
import type { Job, CreateJobBody } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import { Briefcase, Building2, Calendar, MapPin, Plus, Search, Users } from "lucide-react";

const createJobSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  departmentId: z.coerce.number().min(1, "Selecione um departamento"),
  status: z.enum(["open", "closed", "paused"] as const),
  seniority: z.enum(["junior", "pleno", "senior", "especialista", "gerente", "diretor"] as const),
  minSalary: z.coerce.number().min(1000, "Salário mínimo inválido"),
  maxSalary: z.coerce.number().min(1000, "Salário máximo inválido"),
  location: z.string().min(2, "Localização é obrigatória"),
  workMode: z.enum(["presencial", "hibrido", "remoto"] as const),
  requirements: z.string().optional(),
});

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'closed': return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'paused': return 'bg-amber-100 text-amber-800 border-amber-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'open': return 'Aberta';
    case 'closed': return 'Fechada';
    case 'paused': return 'Pausada';
    default: return status;
  }
}

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: jobs, isLoading } = useListJobs();
  const { data: departments } = useListDepartments();
  const createJobMutation = useCreateJob();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createJobSchema>>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      status: "open",
      workMode: "hibrido",
      seniority: "pleno",
      minSalary: 5000,
      maxSalary: 8000,
    }
  });

  const onSubmit = (data: z.infer<typeof createJobSchema>) => {
    createJobMutation.mutate({ data: data as CreateJobBody }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "Vaga criada com sucesso!" });
      },
      onError: () => {
        toast({ title: "Erro ao criar vaga", variant: "destructive" });
      }
    });
  };

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Gestão de Vagas</h1>
          <p className="text-muted-foreground mt-1">Gerencie oportunidades e acompanhe o funil de candidatos.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl px-6 h-11 transition-all hover:-translate-y-0.5">
              <Plus className="mr-2 h-5 w-5" />
              Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-gradient-to-r from-primary to-indigo-600 p-6">
              <DialogTitle className="text-white text-xl font-display">Criar Nova Vaga</DialogTitle>
              <DialogDescription className="text-indigo-100 mt-1">
                Preencha as informações para abrir uma nova oportunidade.
              </DialogDescription>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Título da Vaga</FormLabel>
                      <FormControl><Input placeholder="Ex: Desenvolvedor Senior" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="departmentId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map(d => (
                            <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="seniority" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="junior">Júnior</SelectItem>
                          <SelectItem value="pleno">Pleno</SelectItem>
                          <SelectItem value="senior">Sênior</SelectItem>
                          <SelectItem value="especialista">Especialista</SelectItem>
                          <SelectItem value="gerente">Gerente</SelectItem>
                          <SelectItem value="diretor">Diretor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="minSalary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salário Mínimo (R$)</FormLabel>
                      <FormControl><Input type="number" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="maxSalary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salário Máximo (R$)</FormLabel>
                      <FormControl><Input type="number" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="workMode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                          <SelectItem value="remoto">Remoto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização</FormLabel>
                      <FormControl><Input placeholder="Ex: São Paulo, SP" className="rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                
                <DialogFooter className="pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                  <Button type="submit" disabled={createJobMutation.isPending} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    {createJobMutation.isPending ? "Criando..." : "Criar Vaga"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar vagas por título ou departamento..." 
            className="pl-10 h-11 bg-background rounded-xl border-border focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl bg-background border-border">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="paused">Pausadas</SelectItem>
            <SelectItem value="closed">Fechadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : filteredJobs?.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center">
          <Briefcase className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground">Nenhuma vaga encontrada</h3>
          <p className="text-muted-foreground mt-2 max-w-md">Tente ajustar seus filtros de busca ou crie uma nova vaga para começar a receber candidatos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs?.map(job => (
            <Link key={job.id} href={`/vagas/${job.id}`}>
              <Card className="card-hover h-full flex flex-col cursor-pointer border-border/60 rounded-2xl group">
                <CardHeader className="pb-3 relative">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`font-medium capitalize ${getStatusColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </Badge>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      {job.daysOpen} dias
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Building2 className="w-4 h-4 mr-1.5" />
                    {job.departmentName} • <span className="capitalize ml-1">{job.seniority}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <div className="space-y-2.5">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary/60" />
                      <span className="capitalize">{job.workMode}</span>
                      <span className="mx-2">•</span>
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2 text-primary/60" />
                      Abertura: {format(new Date(job.openedAt), "dd 'de' MMM", { locale: ptBR })}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/50 bg-muted/20 flex justify-between items-center rounded-b-2xl">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground">
                      {job.candidateCount} <span className="text-muted-foreground font-normal">Candidatos</span>
                    </span>
                  </div>
                  <div className="font-semibold text-primary text-sm group-hover:underline">
                    Ver pipeline &rarr;
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
