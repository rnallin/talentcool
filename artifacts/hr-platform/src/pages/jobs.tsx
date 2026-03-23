import { useState, useMemo } from "react";
import { useListJobs, useCreateJob, useUpdateJob, useListDepartments } from "@workspace/api-client-react";
import type { Job, CreateJobBody } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/formatters";
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  Plus,
  Search,
  Users,
  Kanban,
  LayoutGrid,
  Clock,
  ArrowRight,
  GripVertical,
} from "lucide-react";

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

type ViewMode = "kanban" | "cards";

const STATUS_COLUMNS = [
  { key: "open" as const, label: "Abertas", color: "border-emerald-300 bg-emerald-50/60", dotColor: "bg-emerald-500", countBg: "bg-emerald-100 text-emerald-700" },
  { key: "paused" as const, label: "Pausadas", color: "border-amber-300 bg-amber-50/60", dotColor: "bg-amber-500", countBg: "bg-amber-100 text-amber-700" },
  { key: "closed" as const, label: "Fechadas", color: "border-slate-300 bg-slate-50/60", dotColor: "bg-slate-400", countBg: "bg-slate-100 text-slate-600" },
] as const;

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

function getSeniorityLabel(s: string) {
  const map: Record<string, string> = { junior: "Júnior", pleno: "Pleno", senior: "Sênior", especialista: "Especialista", gerente: "Gerente", diretor: "Diretor" };
  return map[s] ?? s;
}

function getWorkModeLabel(w: string) {
  const map: Record<string, string> = { presencial: "Presencial", hibrido: "Híbrido", remoto: "Remoto" };
  return map[w] ?? w;
}

function KanbanJobCard({ job, index }: { job: Job; index: number }) {
  return (
    <Draggable draggableId={`job-${job.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group bg-card rounded-xl border border-border/60 p-4 transition-shadow duration-200 ${snapshot.isDragging ? "shadow-xl ring-2 ring-primary/20 rotate-1" : "shadow-sm hover:shadow-md"}`}
        >
          <div className="flex items-start gap-2">
            <div
              {...provided.dragHandleProps}
              className="mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing shrink-0"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/vagas/${job.id}`}>
                <h4 className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2">
                  {job.title}
                </h4>
              </Link>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{job.departmentName}</span>
                <span className="text-border">|</span>
                <span className="shrink-0">{getSeniorityLabel(job.seniority)}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5">
              <MapPin className="w-3 h-3" />
              {getWorkModeLabel(job.workMode)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5">
              <Clock className="w-3 h-3" />
              {job.daysOpen}d
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">{job.candidateCount}</span>
              <span className="text-xs text-muted-foreground">candidatos</span>
            </div>
            <Link href={`/vagas/${job.id}`}>
              <span className="text-xs font-medium text-primary hover:underline cursor-pointer inline-flex items-center gap-0.5">
                Pipeline <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function KanbanView({ jobs, onStatusChange }: { jobs: Job[]; onStatusChange: (jobId: number, newStatus: string) => void }) {
  const columns = useMemo(() => {
    const cols: Record<string, Job[]> = { open: [], paused: [], closed: [] };
    jobs.forEach((job) => {
      if (cols[job.status]) {
        cols[job.status].push(job);
      }
    });
    return cols;
  }, [jobs]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const jobId = Number(draggableId.replace("job-", ""));
    const newStatus = destination.droppableId;
    const job = jobs.find((j) => j.id === jobId);
    if (job && job.status !== newStatus) {
      onStatusChange(jobId, newStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 min-h-[60vh]">
        {STATUS_COLUMNS.map((col) => {
          const colJobs = columns[col.key] ?? [];
          return (
            <div key={col.key} className={`flex flex-col rounded-2xl border-2 ${col.color} overflow-hidden`}>
              <div className="px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg}`}>
                  {colJobs.length}
                </span>
              </div>
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 px-3 pb-3 space-y-2.5 overflow-y-auto min-h-[120px] transition-colors duration-200 ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                  >
                    {colJobs.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Briefcase className="w-8 h-8 text-muted-foreground/20 mb-2" />
                        <p className="text-xs text-muted-foreground/60">Arraste vagas para cá</p>
                      </div>
                    )}
                    {colJobs.map((job, idx) => (
                      <KanbanJobCard key={job.id} job={job} index={idx} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

function CardsView({ jobs }: { jobs: Job[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job, idx) => (
        <Link key={job.id} href={`/vagas/${job.id}`}>
          <Card className="card-hover h-full flex flex-col cursor-pointer border-border/60 rounded-2xl group fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
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
  );
}

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  
  const { data: jobs, isLoading } = useListJobs();
  const { data: departments } = useListDepartments();
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
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

  const handleStatusChange = (jobId: number, newStatus: string) => {
    queryClient.setQueryData<Job[]>(['/api/jobs'], (old) =>
      old?.map((j) => (j.id === jobId ? { ...j, status: newStatus as Job["status"] } : j))
    );
    updateJobMutation.mutate(
      { id: jobId, data: { status: newStatus as Job["status"] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
          toast({ title: "Status da vaga atualizado!" });
        },
        onError: () => {
          queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
          toast({ title: "Erro ao atualizar status", variant: "destructive" });
        },
      }
    );
  };

  const filteredJobs = useMemo(() => {
    return jobs?.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) ?? [];
  }, [jobs, searchTerm, statusFilter]);

  const totalOpen = jobs?.filter(j => j.status === "open").length ?? 0;
  const totalPaused = jobs?.filter(j => j.status === "paused").length ?? 0;
  const totalClosed = jobs?.filter(j => j.status === "closed").length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Gestão de Vagas</h1>
          <p className="text-muted-foreground mt-1">
            {totalOpen + totalPaused + totalClosed} vagas
            <span className="mx-1.5 text-border">•</span>
            <span className="text-emerald-600 font-medium">{totalOpen} abertas</span>
            <span className="mx-1.5 text-border">•</span>
            <span className="text-amber-600 font-medium">{totalPaused} pausadas</span>
            <span className="mx-1.5 text-border">•</span>
            <span className="text-slate-500 font-medium">{totalClosed} fechadas</span>
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-11 btn-fluid">
              <Plus className="mr-2 h-5 w-5" />
              Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
            <div className="bg-gradient-to-r from-primary to-[#145338] p-6">
              <DialogTitle className="text-white text-xl font-display">Criar Nova Vaga</DialogTitle>
              <DialogDescription className="text-white/70 mt-1">
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
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : undefined}>
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

                <FormField control={form.control} name="requirements" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requisitos</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Liste os requisitos, competências e qualificações desejadas para a vaga..."
                        className="rounded-xl resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
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

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex bg-card border border-border rounded-xl p-1 shrink-0">
          <button
            onClick={() => { setViewMode("kanban"); setStatusFilter("all"); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "kanban" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
          >
            <Kanban className="w-4 h-4" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "cards" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </button>
        </div>

        <div className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por título ou departamento..." 
              className="pl-9 h-10 bg-card rounded-xl border-border focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {viewMode === "cards" && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[170px] h-10 rounded-xl bg-card border-border">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="open">Abertas</SelectItem>
                <SelectItem value="paused">Pausadas</SelectItem>
                <SelectItem value="closed">Fechadas</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {isLoading ? (
        viewMode === "kanban" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border-2 border-border p-4 space-y-3">
                <Skeleton className="h-6 w-24 rounded-lg" />
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        )
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center">
          <Briefcase className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground">Nenhuma vaga encontrada</h3>
          <p className="text-muted-foreground mt-2 max-w-md">Tente ajustar seus filtros de busca ou crie uma nova vaga para começar a receber candidatos.</p>
        </div>
      ) : viewMode === "kanban" ? (
        <KanbanView jobs={filteredJobs} onStatusChange={handleStatusChange} />
      ) : (
        <CardsView jobs={filteredJobs} />
      )}
    </div>
  );
}
