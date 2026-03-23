import { useState, useMemo } from "react";
import { useListJobs, useCreateJob, useUpdateCandidate, useListDepartments, useListPipelineStages } from "@workspace/api-client-react";
import type { Job, CreateJobBody, PipelineStage } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
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
  GripVertical,
} from "lucide-react";

interface AllCandidate {
  id: number;
  jobId: number;
  name: string;
  email: string;
  phone: string | null;
  stage: string;
  source: string;
  appliedAt: string;
  updatedAt: string;
  notes: string | null;
  jobTitle: string;
}

function useAllCandidates() {
  return useQuery<AllCandidate[]>({
    queryKey: ["/api/candidates/all"],
    queryFn: async () => {
      const res = await fetch("/api/candidates/all");
      if (!res.ok) throw new Error("Failed to fetch candidates");
      return res.json();
    },
  });
}

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

const FALLBACK_STAGES: PipelineStage[] = [
  { id: 1, name: "triagem", label: "Triagem", color: "border-slate-300 bg-slate-50/60", position: 1, isTerminal: false, createdAt: new Date().toISOString() },
  { id: 2, name: "entrevista_rh", label: "Entrevista RH", color: "border-emerald-300 bg-emerald-50/60", position: 2, isTerminal: false, createdAt: new Date().toISOString() },
  { id: 3, name: "entrevista_tecnica", label: "Entrevista Técnica", color: "border-blue-300 bg-blue-50/60", position: 3, isTerminal: false, createdAt: new Date().toISOString() },
  { id: 4, name: "proposta", label: "Proposta", color: "border-amber-300 bg-amber-50/60", position: 4, isTerminal: false, createdAt: new Date().toISOString() },
  { id: 5, name: "contratado", label: "Contratado", color: "border-emerald-400 bg-emerald-50/60", position: 5, isTerminal: true, createdAt: new Date().toISOString() },
  { id: 6, name: "reprovado", label: "Reprovado", color: "border-rose-300 bg-rose-50/60", position: 6, isTerminal: true, createdAt: new Date().toISOString() },
];

const STAGE_STYLES: Record<string, { dot: string; countBg: string; border: string; cardBg: string; cardBorder: string; avatarBg: string; avatarText: string }> = {
  triagem: { dot: "bg-slate-400", countBg: "bg-slate-100 text-slate-600", border: "border-slate-300 bg-slate-50/40", cardBg: "bg-slate-50/80", cardBorder: "border-slate-200", avatarBg: "bg-slate-200", avatarText: "text-slate-700" },
  entrevista_rh: { dot: "bg-emerald-500", countBg: "bg-emerald-100 text-emerald-700", border: "border-emerald-300 bg-emerald-50/40", cardBg: "bg-emerald-50/60", cardBorder: "border-emerald-200", avatarBg: "bg-emerald-200", avatarText: "text-emerald-800" },
  entrevista_tecnica: { dot: "bg-blue-500", countBg: "bg-blue-100 text-blue-700", border: "border-blue-300 bg-blue-50/40", cardBg: "bg-blue-50/60", cardBorder: "border-blue-200", avatarBg: "bg-blue-200", avatarText: "text-blue-800" },
  proposta: { dot: "bg-amber-500", countBg: "bg-amber-100 text-amber-700", border: "border-amber-300 bg-amber-50/40", cardBg: "bg-amber-50/60", cardBorder: "border-amber-200", avatarBg: "bg-amber-200", avatarText: "text-amber-800" },
  contratado: { dot: "bg-emerald-600", countBg: "bg-emerald-100 text-emerald-800", border: "border-emerald-400 bg-emerald-50/40", cardBg: "bg-emerald-50/70", cardBorder: "border-emerald-300", avatarBg: "bg-emerald-300", avatarText: "text-emerald-900" },
  reprovado: { dot: "bg-rose-500", countBg: "bg-rose-100 text-rose-700", border: "border-rose-300 bg-rose-50/40", cardBg: "bg-rose-50/60", cardBorder: "border-rose-200", avatarBg: "bg-rose-200", avatarText: "text-rose-800" },
};

function getDaysInStage(updatedAt: string): number {
  return Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
}

function getPerformanceIndicator(days: number, isTerminal: boolean) {
  if (isTerminal) return null;
  if (days <= 15) return { color: "bg-emerald-500", ring: "ring-emerald-200", label: `${days}d`, tooltip: "No prazo" };
  if (days <= 35) return { color: "bg-amber-500", ring: "ring-amber-200", label: `${days}d`, tooltip: "Atenção" };
  return { color: "bg-rose-500", ring: "ring-rose-200", label: `${days}d`, tooltip: "Crítico" };
}

const TERMINAL_STAGES = new Set(["contratado", "reprovado"]);

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

function getSourceLabel(s: string) {
  const map: Record<string, string> = { linkedin: "LinkedIn", indicacao: "Indicação", site: "Site", outro: "Outro" };
  return map[s] ?? s;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function PipelineCandidateCard({ candidate, index }: { candidate: AllCandidate; index: number }) {
  const stageStyle = STAGE_STYLES[candidate.stage] ?? STAGE_STYLES.triagem;
  const days = getDaysInStage(candidate.updatedAt);
  const isTerminal = TERMINAL_STAGES.has(candidate.stage);
  const perf = getPerformanceIndicator(days, isTerminal);

  return (
    <Draggable draggableId={`cand-${candidate.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`group rounded-xl border p-3.5 transition-all duration-200 ${stageStyle.cardBg} ${stageStyle.cardBorder} ${snapshot.isDragging ? "shadow-xl ring-2 ring-primary/20 rotate-1 scale-[1.02]" : "shadow-sm hover:shadow-md"}`}
        >
          <div className="flex items-start gap-2.5">
            <div
              {...provided.dragHandleProps}
              className="mt-1 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab active:cursor-grabbing shrink-0"
            >
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
            </div>

            <div className={`w-8 h-8 rounded-full ${stageStyle.avatarBg} flex items-center justify-center shrink-0`}>
              <span className={`text-[10px] font-bold ${stageStyle.avatarText}`}>{getInitials(candidate.name)}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground leading-snug truncate flex-1">{candidate.name}</p>
                {perf && (
                  <span
                    title={perf.tooltip}
                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${perf.color} ring-1 ${perf.ring}`}
                  >
                    {perf.label}
                  </span>
                )}
              </div>
              <Link href={`/vagas/${candidate.jobId}`}>
                <p className="text-xs text-primary/80 hover:text-primary hover:underline truncate cursor-pointer mt-0.5">{candidate.jobTitle}</p>
              </Link>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-white/60 rounded-md px-1.5 py-0.5">
              {getSourceLabel(candidate.source)}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-white/60 rounded-md px-1.5 py-0.5">
              <Clock className="w-2.5 h-2.5" />
              {formatDistanceToNow(new Date(candidate.updatedAt), { locale: ptBR, addSuffix: false })}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function PipelineKanbanView({
  candidates,
  stages,
  searchTerm,
  onStageChange,
}: {
  candidates: AllCandidate[];
  stages: PipelineStage[];
  searchTerm: string;
  onStageChange: (candidateId: number, newStage: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchTerm) return candidates;
    const q = searchTerm.toLowerCase();
    return candidates.filter(
      (c) => c.name.toLowerCase().includes(q) || c.jobTitle.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [candidates, searchTerm]);

  const columns = useMemo(() => {
    const cols: Record<string, AllCandidate[]> = {};
    stages.forEach((s) => (cols[s.name] = []));
    filtered.forEach((c) => {
      if (cols[c.stage] !== undefined) {
        cols[c.stage].push(c);
      }
    });
    return cols;
  }, [filtered, stages]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const candidateId = Number(result.draggableId.replace("cand-", ""));
    const newStage = result.destination.droppableId;
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate && candidate.stage !== newStage) {
      onStageChange(candidateId, newStage);
    }
  };

  const perfSummary = useMemo(() => {
    let green = 0, yellow = 0, red = 0;
    filtered.forEach((c) => {
      if (TERMINAL_STAGES.has(c.stage)) return;
      const d = getDaysInStage(c.updatedAt);
      if (d <= 15) green++;
      else if (d <= 35) yellow++;
      else red++;
    });
    return { green, yellow, red };
  }, [filtered]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex items-center gap-4 mb-3 text-xs">
        <span className="text-muted-foreground font-medium">Performance:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-muted-foreground">0-15d</span>
          <span className="font-semibold text-foreground">{perfSummary.green}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-muted-foreground">16-35d</span>
          <span className="font-semibold text-foreground">{perfSummary.yellow}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-muted-foreground">36d+</span>
          <span className="font-semibold text-foreground">{perfSummary.red}</span>
        </span>
      </div>
      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => {
            const stageStyle = STAGE_STYLES[stage.name] ?? STAGE_STYLES.triagem;
            const colCandidates = columns[stage.name] ?? [];
            return (
              <div
                key={stage.name}
                className={`w-[280px] shrink-0 flex flex-col rounded-2xl border-2 ${stageStyle.border} overflow-hidden max-h-[calc(100vh-220px)]`}
              >
                <div className="px-4 py-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stageStyle.dot}`} />
                    <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stageStyle.countBg}`}>
                    {colCandidates.length}
                  </span>
                </div>

                <Droppable droppableId={stage.name}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 px-2.5 pb-3 space-y-2 overflow-y-auto min-h-[100px] transition-colors duration-200 ${snapshot.isDraggingOver ? "bg-primary/5" : ""}`}
                    >
                      {colCandidates.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Users className="w-6 h-6 text-muted-foreground/20 mb-1.5" />
                          <p className="text-[11px] text-muted-foreground/50">Arraste candidatos para cá</p>
                        </div>
                      )}
                      {colCandidates.map((c, idx) => (
                        <PipelineCandidateCard key={c.id} candidate={c} index={idx} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
}

function getJobPerfStyle(days: number, status: string) {
  if (status === "closed") return {
    card: "bg-slate-50 border-slate-200",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    daysBg: "bg-slate-100 text-slate-600",
    footer: "bg-slate-100/60 border-slate-200",
    icon: "text-slate-400",
  };
  if (days <= 15) return {
    card: "bg-emerald-50/70 border-emerald-200",
    badge: "bg-emerald-500 text-white border-emerald-500",
    daysBg: "bg-emerald-100 text-emerald-700",
    footer: "bg-emerald-100/50 border-emerald-200/60",
    icon: "text-emerald-500",
  };
  if (days <= 35) return {
    card: "bg-amber-50/70 border-amber-200",
    badge: "bg-amber-500 text-white border-amber-500",
    daysBg: "bg-amber-100 text-amber-700",
    footer: "bg-amber-100/50 border-amber-200/60",
    icon: "text-amber-500",
  };
  return {
    card: "bg-rose-50/70 border-rose-200",
    badge: "bg-rose-500 text-white border-rose-500",
    daysBg: "bg-rose-100 text-rose-700",
    footer: "bg-rose-100/50 border-rose-200/60",
    icon: "text-rose-500",
  };
}

function CardsView({ jobs }: { jobs: Job[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job, idx) => {
        const perf = getJobPerfStyle(job.daysOpen, job.status);
        return (
        <Link key={job.id} href={`/vagas/${job.id}`}>
          <Card className={`card-hover h-full flex flex-col cursor-pointer rounded-2xl group fade-in-up border ${perf.card}`} style={{ animationDelay: `${idx * 50}ms` }}>
            <CardHeader className="pb-3 relative">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className={`font-medium capitalize ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </Badge>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${perf.daysBg}`}>
                  {job.daysOpen} dias
                </span>
              </div>
              <h3 className="text-xl font-display font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {job.title}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Building2 className={`w-4 h-4 mr-1.5 ${perf.icon}`} />
                {job.departmentName} • <span className="capitalize ml-1">{job.seniority}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-4 flex-1">
              <div className="space-y-2.5">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className={`w-4 h-4 mr-2 ${perf.icon}`} />
                  <span className="capitalize">{job.workMode}</span>
                  <span className="mx-2">•</span>
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className={`w-4 h-4 mr-2 ${perf.icon}`} />
                  Abertura: {format(new Date(job.openedAt), "dd 'de' MMM", { locale: ptBR })}
                </div>
              </div>
            </CardContent>
            <CardFooter className={`pt-4 border-t flex justify-between items-center rounded-b-2xl ${perf.footer}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${job.status === "closed" ? "bg-slate-200" : perf.daysBg}`}>
                  <Users className={`w-4 h-4 ${perf.icon}`} />
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
        );
      })}
    </div>
  );
}

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const { data: jobs, isLoading: jobsLoading } = useListJobs();
  const { data: departments } = useListDepartments();
  const { data: allCandidates, isLoading: candidatesLoading } = useAllCandidates();
  const { data: stagesData } = useListPipelineStages();
  const stages = stagesData && stagesData.length > 0 ? stagesData : FALLBACK_STAGES;

  const createJobMutation = useCreateJob();
  const updateCandidateMutation = useUpdateCandidate();
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

  const handleCandidateStageChange = (candidateId: number, newStage: string) => {
    queryClient.setQueryData<AllCandidate[]>(["/api/candidates/all"], (old) =>
      old?.map((c) => (c.id === candidateId ? { ...c, stage: newStage, updatedAt: new Date().toISOString() } : c))
    );
    updateCandidateMutation.mutate(
      { id: candidateId, data: { stage: newStage } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/candidates/all"] });
          queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0] as string)?.startsWith("/api/metrics") });
          toast({ title: "Etapa do candidato atualizada!" });
        },
        onError: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/candidates/all"] });
          toast({ title: "Erro ao atualizar etapa", variant: "destructive" });
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

  const totalCandidates = allCandidates?.length ?? 0;
  const totalOpen = jobs?.filter(j => j.status === "open").length ?? 0;

  const isLoading = viewMode === "kanban" ? candidatesLoading : jobsLoading;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">Gestão de Vagas</h1>
          <p className="text-muted-foreground mt-1">
            {totalOpen} vagas abertas
            <span className="mx-1.5 text-border">•</span>
            <span className="font-medium text-foreground">{totalCandidates} candidatos</span>
            {" "}no pipeline
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
            onClick={() => setViewMode("kanban")}
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
              placeholder={viewMode === "kanban" ? "Buscar candidato, vaga ou email..." : "Buscar por título ou departamento..."}
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
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="w-[280px] shrink-0 rounded-2xl border-2 border-border p-4 space-y-3">
                <Skeleton className="h-6 w-28 rounded-lg" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        )
      ) : viewMode === "kanban" ? (
        allCandidates && allCandidates.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center">
            <Users className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-display font-semibold text-foreground">Nenhum candidato no pipeline</h3>
            <p className="text-muted-foreground mt-2 max-w-md">Adicione candidatos às suas vagas para vê-los aqui no Kanban.</p>
          </div>
        ) : (
          <PipelineKanbanView
            candidates={allCandidates ?? []}
            stages={stages}
            searchTerm={searchTerm}
            onStageChange={handleCandidateStageChange}
          />
        )
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border flex flex-col items-center">
          <Briefcase className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-display font-semibold text-foreground">Nenhuma vaga encontrada</h3>
          <p className="text-muted-foreground mt-2 max-w-md">Tente ajustar seus filtros de busca ou crie uma nova vaga para começar a receber candidatos.</p>
        </div>
      ) : (
        <CardsView jobs={filteredJobs} />
      )}
    </div>
  );
}
