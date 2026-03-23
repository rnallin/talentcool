import { useState, useRef, useCallback } from "react";
import { useListDepartments } from "@workspace/api-client-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Linkedin,
  Globe,
  Building2,
  MapPin,
  Briefcase,
  Tag,
  Download,
  Zap,
  Wand2,
} from "lucide-react";

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, (line) => line ? `${line}` : '')
    .replace(/\n/g, '<br/>');
}

interface FormData {
  title: string;
  seniority: string;
  workMode: string;
  location: string;
  department: string;
  tone: string;
  differentials: string;
  keywords: string;
  salaryMin: string;
  salaryMax: string;
  format: string;
}

const initialForm: FormData = {
  title: "",
  seniority: "pleno",
  workMode: "hibrido",
  location: "",
  department: "",
  tone: "formal",
  differentials: "",
  keywords: "",
  salaryMin: "",
  salaryMax: "",
  format: "portal",
};

export default function JobDescription() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const { data: departments } = useListDepartments();
  const { toast } = useToast();

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleGenerate = async () => {
    if (!form.title.trim()) {
      toast({ title: "Preencha o titulo do cargo", variant: "destructive" });
      return;
    }
    if (!form.location.trim()) {
      toast({ title: "Preencha a localização", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setOutput("");
    setCopied(false);
    abortRef.current = new AbortController();

    try {
      const salaryRange = form.salaryMin && form.salaryMax
        ? `R$ ${Number(form.salaryMin).toLocaleString("pt-BR")} - R$ ${Number(form.salaryMax).toLocaleString("pt-BR")}`
        : undefined;
      const deptName = departments?.find((d) => String(d.id) === form.department)?.name;

      const res = await fetch("/api/ai/job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          title: form.title, seniority: form.seniority, workMode: form.workMode,
          location: form.location, department: deptName ?? undefined, tone: form.tone,
          differentials: form.differentials || undefined, keywords: form.keywords || undefined,
          salaryRange, format: form.format,
        }),
      });

      if (!res.ok) throw new Error("Falha na geração");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.content) { accumulated += data.content; setOutput(accumulated); }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") toast({ title: "Erro ao gerar descrição", variant: "destructive" });
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Descrição copiada!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vaga-${form.title.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Arquivo baixado!" });
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsGenerating(false);
  };

  const toneOptions = [
    { value: "formal", label: "Formal", icon: Building2, color: "text-slate-600", bg: "bg-slate-50", activeBg: "bg-slate-100" },
    { value: "casual", label: "Descontraído", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50", activeBg: "bg-amber-100" },
    { value: "innovative", label: "Inovador", icon: Zap, color: "text-violet-500", bg: "bg-violet-50", activeBg: "bg-violet-100" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-start gap-3 mb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-100 flex items-center justify-center shrink-0">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
              Descrição de Vagas
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/10 to-primary/10 border border-violet-200/50">
              <Sparkles className="w-3 h-3 text-violet-500" />
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">AI Powered</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Crie descrições profissionais, inclusivas e otimizadas para atrair os melhores talentos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 min-h-0">
        <Card className="rounded-2xl border-border/60 shadow-sm p-5 space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Dados da Vaga</h3>
          </div>

          <div className="grid grid-cols-[1fr_120px_120px] gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cargo *</label>
              <Input placeholder="Ex: Desenvolvedor Full Stack Senior" className="rounded-xl h-9 text-sm" value={form.title} onChange={(e) => updateField("title", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Senioridade</label>
              <Select value={form.seniority} onValueChange={(v) => updateField("seniority", v)}>
                <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="pleno">Pleno</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="especialista">Especialista</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="diretor">Diretor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Modalidade</label>
              <Select value={form.workMode} onValueChange={(v) => updateField("workMode", v)}>
                <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="hibrido">Hibrido</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Localização *</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <Input placeholder="São Paulo, SP" className="rounded-xl h-9 pl-7 text-sm" value={form.location} onChange={(e) => updateField("location", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Departamento</label>
              <Select value={form.department} onValueChange={(v) => updateField("department", v)}>
                <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {departments?.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Salário Min</label>
              <Input type="number" placeholder="5.000" className="rounded-xl h-9 text-sm" value={form.salaryMin} onChange={(e) => updateField("salaryMin", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Salário Max</label>
              <Input type="number" placeholder="12.000" className="rounded-xl h-9 text-sm" value={form.salaryMax} onChange={(e) => updateField("salaryMax", e.target.value)} />
            </div>
          </div>

          <div className="h-px bg-border/40" />

          <div className="grid grid-cols-[1fr_auto] gap-6 items-start">
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tom de Voz</h3>
              <div className="flex gap-1.5">
                {toneOptions.map((t) => {
                  const isActive = form.tone === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => updateField("tone", t.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                        isActive
                          ? `border-primary/40 ${t.activeBg}`
                          : "border-border/40 bg-muted/20 hover:bg-muted/50"
                      }`}
                    >
                      <t.icon className={`w-3 h-3 ${t.color} shrink-0`} />
                      <span className="text-[11px] font-medium whitespace-nowrap">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Formato</h3>
              <div className="flex gap-1.5">
                {[
                  { value: "portal", label: "Portal", Icon: Globe, color: "text-primary/70" },
                  { value: "linkedin", label: "LinkedIn", Icon: Linkedin, color: "text-blue-600/70" },
                ].map((opt) => {
                  const isActive = form.format === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => updateField("format", opt.value)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                        isActive
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/40 bg-muted/20 hover:bg-muted/50"
                      }`}
                    >
                      <opt.Icon className={`w-3 h-3 ${opt.color} shrink-0`} />
                      <span className="text-[11px] font-medium whitespace-nowrap">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Diferenciais da vaga</label>
              <Input placeholder="Bonus, stock options, day-off..." className="rounded-xl h-9 text-sm" value={form.differentials} onChange={(e) => updateField("differentials", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                <Tag className="w-3 h-3" /> Palavras-chave SEO
              </label>
              <Input placeholder="React, Node.js, AWS, Agile..." className="rounded-xl h-9 text-sm" value={form.keywords} onChange={(e) => updateField("keywords", e.target.value)} />
            </div>
          </div>

          {isGenerating ? (
            <Button onClick={handleStop} variant="outline" className="w-full rounded-xl h-11 text-rose-600 border-rose-200 hover:bg-rose-50">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parar Geração
            </Button>
          ) : (
            <Button onClick={handleGenerate} className="group w-full rounded-xl h-11 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-md hover:shadow-lg transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              Gerar Descrição com IA
            </Button>
          )}
        </Card>

        <div ref={outputRef} className="min-h-0">
          {!output && !isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-card to-muted/20 rounded-2xl border border-dashed border-border/60">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary/30" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center border border-violet-200/50">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                </div>
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                Sua descrição aparecerá aqui
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
                Preencha os dados e clique em "Gerar Descrição com IA" para criar uma descrição profissional e otimizada.
              </p>
            </div>
          ) : (
            <Card className="rounded-2xl border-border/60 h-full shadow-sm flex flex-col">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {isGenerating ? "Gerando descrição..." : "Descrição Gerada"}
                  </h3>
                  {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                </div>
                {output && !isGenerating && (
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" onClick={handleGenerate} className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Regenerar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Baixar
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs rounded-lg gap-1.5">
                      {copied ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="p-5 overflow-y-auto flex-1">
                <div
                  className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-strong:text-foreground"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
