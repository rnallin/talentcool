import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mail,
  Send,
  FileText,
  Lightbulb,
  PenLine,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Save,
  Clock,
  Play,
  Pause,
  Trash2,
  Plus,
  Edit3,
  Calendar,
  Zap,
  RefreshCw,
  MailOpen,
  Timer,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tab = "compor" | "rascunhos" | "automacoes";
type Template = "report" | "insights" | "custom";

interface Draft {
  id: number;
  subject: string;
  recipients: string;
  content: string;
  template: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

interface Automation {
  id: number;
  name: string;
  description: string;
  template: string;
  recipients: string;
  frequency: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

const baseUrl = import.meta.env.BASE_URL || "/";
function apiUrl(path: string) {
  return `${baseUrl}api/${path}`.replace(/\/\//g, "/");
}

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const FREQ_LABELS: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
};
const TEMPLATE_LABELS: Record<string, string> = {
  report: "Relatório de RH",
  insights: "Insights & Alertas",
  custom: "E-mail Personalizado",
};

export default function Emails() {
  const [activeTab, setActiveTab] = useState<Tab>("compor");
  const [selectedTemplate, setSelectedTemplate] = useState<Template>("custom");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [automationsLoading, setAutomationsLoading] = useState(false);
  const [showNewAutomation, setShowNewAutomation] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    name: "",
    description: "",
    template: "report" as string,
    recipients: "",
    frequency: "weekly",
    dayOfWeek: 2,
    hour: 8,
    minute: 0,
  });

  const fetchDrafts = useCallback(async () => {
    setDraftsLoading(true);
    try {
      const res = await fetch(apiUrl("email/drafts"));
      const data = await res.json();
      setDrafts(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setDraftsLoading(false); }
  }, []);

  const fetchAutomations = useCallback(async () => {
    setAutomationsLoading(true);
    try {
      const res = await fetch(apiUrl("email/automations"));
      const data = await res.json();
      setAutomations(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setAutomationsLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "rascunhos") fetchDrafts();
    if (activeTab === "automacoes") fetchAutomations();
  }, [activeTab, fetchDrafts, fetchAutomations]);

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch(apiUrl("ai/email-draft"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.subject) setSubject(data.subject);
      if (data.content) setContent(data.content);
      setSelectedTemplate("custom");
    } catch {
      setResult({ success: false, message: "Erro ao gerar e-mail com IA" });
    } finally { setAiLoading(false); }
  }

  async function handlePreview() {
    if (selectedTemplate === "custom") {
      const wrappedHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:0;"><div style="max-width:640px;margin:0 auto;background:#fff;"><div style="background:#145338;padding:32px 24px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:24px;">Talent Cool</h1></div><div style="padding:24px;font-size:14px;line-height:1.7;color:#333;">${content}</div><div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#6A6E6C;">Enviado pela plataforma Talent Cool</div></div></body></html>`;
      setPreviewHtml(wrappedHtml);
      setShowPreview(true);
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch(apiUrl("email/preview"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selectedTemplate }),
      });
      const data = await res.json();
      if (data.html) { setPreviewHtml(data.html); setShowPreview(true); }
    } catch { setResult({ success: false, message: "Erro ao gerar preview" }); }
    finally { setPreviewLoading(false); }
  }

  async function handleSend() {
    if (!to.trim()) { setResult({ success: false, message: "Informe o(s) destinatário(s)" }); return; }
    if (!subject.trim()) { setResult({ success: false, message: "Informe o assunto" }); return; }
    setLoading(true); setResult(null);
    try {
      const res = await fetch(apiUrl("email/send"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(), subject: subject.trim(),
          template: selectedTemplate,
          customHtml: selectedTemplate === "custom" ? content : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) setResult({ success: true, message: "E-mail enviado com sucesso!" });
      else setResult({ success: false, message: data.error || "Erro ao enviar" });
    } catch { setResult({ success: false, message: "Erro de conexão" }); }
    finally { setLoading(false); }
  }

  async function handleSaveDraft() {
    try {
      await fetch(apiUrl("email/drafts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, recipients: to, content, template: selectedTemplate }),
      });
      setResult({ success: true, message: "Rascunho salvo!" });
    } catch { setResult({ success: false, message: "Erro ao salvar rascunho" }); }
  }

  function loadDraft(draft: Draft) {
    setSubject(draft.subject);
    setTo(draft.recipients);
    setContent(draft.content);
    setSelectedTemplate(draft.template as Template);
    setActiveTab("compor");
  }

  async function deleteDraft(id: number) {
    try {
      await fetch(apiUrl(`email/drafts/${id}`), { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch { /* ignore */ }
  }

  async function sendDraft(id: number) {
    try {
      const res = await fetch(apiUrl(`email/drafts/${id}/send`), { method: "POST" });
      const data = await res.json();
      if (data.success) fetchDrafts();
    } catch { /* ignore */ }
  }

  async function toggleAutomation(id: number) {
    try {
      await fetch(apiUrl(`email/automations/${id}/toggle`), { method: "POST" });
      fetchAutomations();
    } catch { /* ignore */ }
  }

  async function deleteAutomation(id: number) {
    try {
      await fetch(apiUrl(`email/automations/${id}`), { method: "DELETE" });
      setAutomations((prev) => prev.filter((a) => a.id !== id));
    } catch { /* ignore */ }
  }

  async function createAutomation() {
    if (!newAutomation.name.trim() || !newAutomation.recipients.trim()) return;
    try {
      await fetch(apiUrl("email/automations"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAutomation),
      });
      setShowNewAutomation(false);
      setNewAutomation({ name: "", description: "", template: "report", recipients: "", frequency: "weekly", dayOfWeek: 2, hour: 8, minute: 0 });
      fetchAutomations();
    } catch { /* ignore */ }
  }

  const tabs = [
    { id: "compor" as Tab, label: "Compor", icon: PenLine, badge: null },
    { id: "rascunhos" as Tab, label: "Rascunhos", icon: FileText, badge: drafts.filter((d) => d.status === "draft").length || null },
    { id: "automacoes" as Tab, label: "Automações", icon: Zap, badge: automations.filter((a) => a.isActive).length || null },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-display font-semibold text-foreground">Reporting & E-mail</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200/50">
                <Sparkles className="w-3 h-3" /> AI Pro
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Compose com IA, gerencie rascunhos e automatize envios de relatórios
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-4 bg-muted/30 p-1 rounded-xl w-fit shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge ? (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "compor" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-full">
            <div className="space-y-4">
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    Gerar com IA
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ex: E-mail de boas-vindas para novos contratados..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAiGenerate()}
                      className="rounded-xl text-sm"
                    />
                    <Button
                      onClick={handleAiGenerate}
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shrink-0"
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-2">
                    {(["report", "insights", "custom"] as Template[]).map((t) => {
                      const labels: Record<Template, { label: string; icon: React.ElementType }> = {
                        report: { label: "Relatório", icon: FileText },
                        insights: { label: "Insights", icon: Lightbulb },
                        custom: { label: "Personalizado", icon: PenLine },
                      };
                      const { label, icon: Icon } = labels[t];
                      const isActive = selectedTemplate === t;
                      return (
                        <button
                          key={t}
                          onClick={() => {
                            setSelectedTemplate(t);
                            if (t === "report") setSubject(`Relatório de RH — ${new Date().toLocaleDateString("pt-BR")}`);
                            else if (t === "insights") setSubject(`Insights & Alertas — ${new Date().toLocaleDateString("pt-BR")}`);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            isActive ? "border-primary/40 bg-primary/5 text-primary" : "border-border/40 text-muted-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Destinatários</label>
                      <Input placeholder="email@empresa.com" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl text-sm h-9" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Assunto</label>
                      <Input placeholder="Assunto do e-mail" value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-xl text-sm h-9" />
                    </div>
                  </div>

                  {selectedTemplate === "custom" && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Conteúdo</label>
                      <Textarea
                        placeholder="Escreva o conteúdo do e-mail ou use a IA para gerar..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="rounded-xl text-sm min-h-[140px] resize-none"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Button onClick={handleSend} disabled={loading} className="rounded-xl bg-primary hover:bg-primary/90 text-sm gap-2">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar
                    </Button>
                    <Button onClick={handlePreview} disabled={previewLoading} variant="outline" className="rounded-xl text-sm gap-2">
                      {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      Preview
                    </Button>
                    <Button onClick={handleSaveDraft} variant="ghost" className="rounded-xl text-sm gap-2 text-muted-foreground">
                      <Save className="w-4 h-4" /> Salvar Rascunho
                    </Button>
                  </div>

                  {result && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${result.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                      {result.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      {result.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                <span className="text-sm font-medium text-muted-foreground">
                  {showPreview ? "Preview do E-mail" : "Clique em Preview para visualizar"}
                </span>
                {showPreview && (
                  <button onClick={() => setShowPreview(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="h-[calc(100%-48px)] bg-[#f9fafb]">
                {showPreview ? (
                  <iframe ref={iframeRef} srcDoc={previewHtml} className="w-full h-full border-none" title="Email preview" sandbox="allow-same-origin" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Eye className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-sm">Selecione um template e clique em "Preview"</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "rascunhos" && (
          <div className="space-y-3">
            {draftsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : drafts.length === 0 ? (
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <MailOpen className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Nenhum rascunho ainda</p>
                  <p className="text-xs mt-1">Compose um e-mail e clique em "Salvar Rascunho"</p>
                </CardContent>
              </Card>
            ) : (
              drafts.map((draft) => (
                <Card key={draft.id} className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            draft.status === "sent"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {draft.status === "sent" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                            {draft.status === "sent" ? "Enviado" : "Rascunho"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {TEMPLATE_LABELS[draft.template] || draft.template}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {draft.subject || "(Sem assunto)"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Para: {draft.recipients || "(Sem destinatário)"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {draft.sentAt
                            ? `Enviado em ${new Date(draft.sentAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                            : `Atualizado em ${new Date(draft.updatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        {draft.status === "draft" && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => loadDraft(draft)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => sendDraft(draft.id)} className="h-8 w-8 p-0 text-primary hover:text-primary">
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteDraft(draft.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "automacoes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Configure envios automáticos de relatórios para sua equipe
              </p>
              <Button onClick={() => setShowNewAutomation(true)} className="rounded-xl text-sm gap-2 bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Nova Automação
              </Button>
            </div>

            {showNewAutomation && (
              <Card className="rounded-2xl border-primary/30 shadow-sm bg-primary/[0.02]">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Zap className="w-4 h-4 text-violet-500" />
                    Nova Automação
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label>
                      <Input
                        placeholder="Ex: Relatório semanal de RH"
                        value={newAutomation.name}
                        onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                        className="rounded-xl text-sm h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Destinatários *</label>
                      <Input
                        placeholder="email@empresa.com"
                        value={newAutomation.recipients}
                        onChange={(e) => setNewAutomation({ ...newAutomation, recipients: e.target.value })}
                        className="rounded-xl text-sm h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
                    <Input
                      placeholder="Descrição da automação..."
                      value={newAutomation.description}
                      onChange={(e) => setNewAutomation({ ...newAutomation, description: e.target.value })}
                      className="rounded-xl text-sm h-9"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Template</label>
                      <Select value={newAutomation.template} onValueChange={(v) => setNewAutomation({ ...newAutomation, template: v })}>
                        <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="report">Relatório de RH</SelectItem>
                          <SelectItem value="insights">Insights & Alertas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Frequência</label>
                      <Select value={newAutomation.frequency} onValueChange={(v) => setNewAutomation({ ...newAutomation, frequency: v })}>
                        <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="biweekly">Quinzenal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Dia da semana</label>
                      <Select value={String(newAutomation.dayOfWeek)} onValueChange={(v) => setNewAutomation({ ...newAutomation, dayOfWeek: parseInt(v) })}>
                        <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Horário</label>
                      <Select value={`${newAutomation.hour}:${String(newAutomation.minute).padStart(2, "0")}`} onValueChange={(v) => {
                        const [h, m] = v.split(":").map(Number);
                        setNewAutomation({ ...newAutomation, hour: h, minute: m });
                      }}>
                        <SelectTrigger className="rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((h) => (
                            <SelectItem key={h} value={`${h}:00`}>{`${String(h).padStart(2, "0")}:00`}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button onClick={createAutomation} className="rounded-xl text-sm gap-2 bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4" /> Criar Automação
                    </Button>
                    <Button onClick={() => setShowNewAutomation(false)} variant="ghost" className="rounded-xl text-sm">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {automationsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : automations.length === 0 && !showNewAutomation ? (
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Timer className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Nenhuma automação configurada</p>
                  <p className="text-xs mt-1">Crie automações para enviar relatórios periodicamente</p>
                </CardContent>
              </Card>
            ) : (
              automations.map((auto) => (
                <Card key={auto.id} className={`rounded-2xl shadow-sm transition-all ${auto.isActive ? "border-primary/20 bg-primary/[0.01]" : "border-border/60 opacity-60"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${auto.isActive ? "bg-primary/10" : "bg-muted"}`}>
                          <Zap className={`w-5 h-5 ${auto.isActive ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-foreground truncate">{auto.name}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                              auto.isActive
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}>
                              {auto.isActive ? "Ativa" : "Pausada"}
                            </span>
                          </div>
                          {auto.description && <p className="text-xs text-muted-foreground mb-2">{auto.description}</p>}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {TEMPLATE_LABELS[auto.template] || auto.template}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {FREQ_LABELS[auto.frequency] || auto.frequency} — {DAYS[auto.dayOfWeek]} às {String(auto.hour).padStart(2, "0")}:{String(auto.minute).padStart(2, "0")}
                            </span>
                            {auto.nextRunAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Próximo: {new Date(auto.nextRunAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Para: {auto.recipients}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAutomation(auto.id)}
                          className={`h-8 w-8 p-0 ${auto.isActive ? "text-amber-500 hover:text-amber-600" : "text-green-500 hover:text-green-600"}`}
                        >
                          {auto.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAutomation(auto.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
