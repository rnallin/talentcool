import { useState, useRef, useCallback, useMemo } from "react";
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
  Palette,
  Tag,
  Star,
  Download,
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
      toast({ title: "Preencha o título do cargo", variant: "destructive" });
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
          title: form.title,
          seniority: form.seniority,
          workMode: form.workMode,
          location: form.location,
          department: deptName ?? undefined,
          tone: form.tone,
          differentials: form.differentials || undefined,
          keywords: form.keywords || undefined,
          salaryRange,
          format: form.format,
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
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.content) {
              accumulated += data.content;
              setOutput(accumulated);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast({ title: "Erro ao gerar descrição", variant: "destructive" });
      }
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
    { value: "formal", label: "Formal", desc: "Corporativo e profissional", icon: "🏢" },
    { value: "casual", label: "Descontraído", desc: "Acessível e amigável", icon: "😊" },
    { value: "innovative", label: "Inovador", desc: "Inspirador e moderno", icon: "🚀" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Descrição de Vagas com IA
        </h1>
        <p className="text-muted-foreground mt-1">
          Crie descrições profissionais, inclusivas e otimizadas para atrair os melhores talentos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        <div className="space-y-5">
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Dados da Vaga</h3>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Título do Cargo *</label>
                <Input
                  placeholder="Ex: Desenvolvedor Full Stack Senior"
                  className="rounded-xl"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Senioridade</label>
                  <Select value={form.seniority} onValueChange={(v) => updateField("seniority", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Júnior</SelectItem>
                      <SelectItem value="pleno">Pleno</SelectItem>
                      <SelectItem value="senior">Sênior</SelectItem>
                      <SelectItem value="especialista">Especialista</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="diretor">Diretor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Modalidade</label>
                  <Select value={form.workMode} onValueChange={(v) => updateField("workMode", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                      <SelectItem value="remoto">Remoto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Localização *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="São Paulo, SP"
                      className="rounded-xl pl-8"
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Departamento</label>
                  <Select value={form.department} onValueChange={(v) => updateField("department", v)}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {departments?.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Salário Mín (R$)</label>
                  <Input
                    type="number"
                    placeholder="5.000"
                    className="rounded-xl"
                    value={form.salaryMin}
                    onChange={(e) => updateField("salaryMin", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Salário Máx (R$)</label>
                  <Input
                    type="number"
                    placeholder="12.000"
                    className="rounded-xl"
                    value={form.salaryMax}
                    onChange={(e) => updateField("salaryMax", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Tom de Voz</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {toneOptions.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => updateField("tone", t.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                      form.tone === t.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-xs font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Personalização</h3>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Diferenciais da vaga
                </label>
                <Textarea
                  placeholder="Ex: Bônus agressivo, equipe internacional, stock options, day-off no aniversário..."
                  className="rounded-xl resize-none min-h-[70px]"
                  value={form.differentials}
                  onChange={(e) => updateField("differentials", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Palavras-chave SEO
                  </div>
                </label>
                <Input
                  placeholder="Ex: React, Node.js, AWS, Agile"
                  className="rounded-xl"
                  value={form.keywords}
                  onChange={(e) => updateField("keywords", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Formato de Saída</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateField("format", "portal")}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                    form.format === "portal"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Globe className="w-5 h-5 text-primary/70" />
                  <div className="text-left">
                    <p className="text-xs font-semibold">Portal de Vagas</p>
                    <p className="text-[10px] text-muted-foreground">Completo e detalhado</p>
                  </div>
                </button>
                <button
                  onClick={() => updateField("format", "linkedin")}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                    form.format === "linkedin"
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Linkedin className="w-5 h-5 text-blue-600/70" />
                  <div className="text-left">
                    <p className="text-xs font-semibold">LinkedIn</p>
                    <p className="text-[10px] text-muted-foreground">Conciso com emojis</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {isGenerating ? (
            <Button
              onClick={handleStop}
              variant="outline"
              className="w-full rounded-xl h-12 text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parar Geração
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-white btn-fluid"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Descrição com IA
            </Button>
          )}
        </div>

        <div ref={outputRef}>
          {!output && !isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] bg-card rounded-2xl border border-dashed border-border">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                Sua descrição aparecerá aqui
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Preencha os dados da vaga e clique em "Gerar Descrição com IA" para criar uma descrição profissional e otimizada.
              </p>
            </div>
          ) : (
            <Card className="rounded-2xl border-border/60 h-full">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {isGenerating ? "Gerando descrição..." : "Descrição Gerada"}
                  </h3>
                  {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                </div>
                {output && !isGenerating && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerate}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Regenerar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownload}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Baixar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 text-xs rounded-lg"
                    >
                      {copied ? (
                        <><Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Copiado!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              <CardContent className="p-5 overflow-y-auto max-h-[calc(100vh-200px)]">
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
