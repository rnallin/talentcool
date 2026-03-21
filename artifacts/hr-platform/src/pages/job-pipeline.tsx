import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import { useGetJob, useUpdateCandidate, useCreateCandidate } from "@workspace/api-client-react";
import type { Candidate, CreateCandidateBody } from "@workspace/api-client-react/src/generated/api.schemas";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Plus, Mail, Phone, Calendar, MoreHorizontal } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STAGES = [
  { id: "triagem", title: "Triagem", color: "border-slate-200 bg-slate-50" },
  { id: "entrevista_rh", title: "Entrevista RH", color: "border-indigo-200 bg-indigo-50" },
  { id: "entrevista_tecnica", title: "Entr. Técnica", color: "border-blue-200 bg-blue-50" },
  { id: "proposta", title: "Proposta", color: "border-amber-200 bg-amber-50" },
  { id: "contratado", title: "Contratado", color: "border-emerald-200 bg-emerald-50" },
  { id: "reprovado", title: "Reprovado", color: "border-rose-200 bg-rose-50" },
] as const;

const createCandidateSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  stage: z.enum(["triagem", "entrevista_rh", "entrevista_tecnica", "proposta", "contratado", "reprovado"] as const),
  source: z.enum(["linkedin", "indicacao", "site", "outro"] as const),
  notes: z.string().optional(),
});

function CandidateCard({ candidate, index }: { candidate: Candidate; index: number }) {
  return (
    <Draggable draggableId={candidate.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3 outline-none"
        >
          <Card className={`
            p-3.5 border border-border shadow-sm bg-card hover:border-primary/50 transition-colors
            ${snapshot.isDragging ? 'shadow-xl scale-105 rotate-2 z-50 border-primary cursor-grabbing' : 'cursor-grab'}
          `}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                  {getInitials(candidate.name)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-1">{candidate.name}</h4>
                  <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{candidate.source}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1.5 mt-3">
              <div className="flex items-center text-[12px] text-muted-foreground">
                <Mail className="h-3 w-3 mr-1.5 opacity-70" />
                <span className="truncate">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center text-[12px] text-muted-foreground">
                  <Phone className="h-3 w-3 mr-1.5 opacity-70" />
                  {candidate.phone}
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
              <div className="flex items-center text-[10px] text-muted-foreground font-medium">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(candidate.appliedAt), "dd MMM", { locale: ptBR })}
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

export default function JobPipeline() {
  const [, params] = useRoute("/vagas/:id");
  const jobId = parseInt(params?.id || "0");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: job, isLoading } = useGetJob(jobId);
  const updateCandidateMutation = useUpdateCandidate();
  const createCandidateMutation = useCreateCandidate();

  const form = useForm<z.infer<typeof createCandidateSchema>>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: { stage: "triagem", source: "linkedin" }
  });

  const onSubmit = (data: z.infer<typeof createCandidateSchema>) => {
    createCandidateMutation.mutate({ id: jobId, data: data as CreateCandidateBody }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
        setIsDialogOpen(false);
        form.reset();
        toast({ title: "Candidato adicionado!" });
      },
      onError: () => toast({ title: "Erro ao adicionar", variant: "destructive" })
    });
  };

  const columns = useMemo(() => {
    if (!job?.candidates) return null;
    const cols: Record<string, Candidate[]> = {};
    STAGES.forEach(s => cols[s.id] = []);
    job.candidates.forEach(c => {
      if (cols[c.stage]) cols[c.stage].push(c);
    });
    // Sort by updated date descending within columns
    Object.keys(cols).forEach(k => cols[k].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    return cols;
  }, [job?.candidates]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const candidateId = parseInt(draggableId);
    const newStage = destination.droppableId as any;

    // Optimistic UI Update
    queryClient.setQueryData([`/api/jobs/${jobId}`], (oldData: any) => {
      if (!oldData) return oldData;
      const updatedCandidates = oldData.candidates.map((c: Candidate) => 
        c.id === candidateId ? { ...c, stage: newStage, updatedAt: new Date().toISOString() } : c
      );
      return { ...oldData, candidates: updatedCandidates };
    });

    updateCandidateMutation.mutate(
      { id: candidateId, data: { stage: newStage } },
      {
        onError: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
          toast({ title: "Erro ao mover candidato", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 h-[calc(100vh-8rem)]">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="flex gap-4 h-full">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="w-[300px] h-full rounded-xl shrink-0" />)}
        </div>
      </div>
    );
  }

  if (!job || !columns) return <div>Vaga não encontrada</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/vagas" className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-md hover:bg-muted">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Badge variant="secondary" className="font-medium text-xs">{job.departmentName}</Badge>
            <Badge variant="outline" className="font-medium text-xs capitalize">{job.seniority}</Badge>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">{job.title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-sm font-medium text-muted-foreground">Total no Pipeline</p>
            <p className="text-xl font-bold font-display text-primary">{job.candidates.length}</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 h-10 px-5">
                <Plus className="w-4 h-4 mr-2" /> Candidato
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-indigo-600 p-6">
                <DialogTitle className="text-white text-xl font-display">Adicionar Candidato</DialogTitle>
                <DialogDescription className="text-indigo-100">Adicione manualmente um candidato ao funil desta vaga.</DialogDescription>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input className="rounded-xl" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="stage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fase Inicial</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="source" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origem</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="indicacao">Indicação</SelectItem>
                            <SelectItem value="site">Site/Carreiras</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem><FormLabel>Notas Iniciais</FormLabel><FormControl><Textarea className="rounded-xl resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createCandidateMutation.isPending} className="rounded-xl bg-primary text-primary-foreground">
                      Salvar Candidato
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full items-start px-1">
            {STAGES.map((stage) => {
              const columnCandidates = columns[stage.id];
              return (
                <div key={stage.id} className={`w-[320px] shrink-0 flex flex-col max-h-full rounded-2xl border ${stage.color} overflow-hidden`}>
                  <div className="p-3 border-b border-black/5 bg-white/40 backdrop-blur-sm flex justify-between items-center shrink-0">
                    <h3 className="font-semibold text-sm text-foreground flex items-center">
                      {stage.title}
                      <span className="ml-2 bg-black/10 text-foreground/80 px-2 py-0.5 rounded-full text-[10px]">
                        {columnCandidates.length}
                      </span>
                    </h3>
                  </div>
                  
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}
                      >
                        {columnCandidates.map((c, i) => (
                          <CandidateCard key={c.id} candidate={c} index={i} />
                        ))}
                        {provided.placeholder}
                        
                        {columnCandidates.length === 0 && !snapshot.isDraggingOver && (
                          <div className="h-32 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-black/10 rounded-xl mt-2">
                            <span className="text-xs font-medium text-foreground">Vazio</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
