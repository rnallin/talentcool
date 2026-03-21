import { useState, useRef } from "react";
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
} from "lucide-react";

type Template = "report" | "insights" | "custom";

interface SendResult {
  success: boolean;
  message: string;
}

const TEMPLATES: Array<{
  id: Template;
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    id: "report",
    label: "Relatório de RH",
    desc: "Resumo completo: vagas, candidatos, pipeline, departamentos e custos",
    icon: FileText,
  },
  {
    id: "insights",
    label: "Insights & Alertas",
    desc: "Análise inteligente com recomendações baseadas nos seus dados",
    icon: Lightbulb,
  },
  {
    id: "custom",
    label: "E-mail Personalizado",
    desc: "Escreva seu próprio conteúdo com template Talent Cool",
    icon: PenLine,
  },
];

export default function Emails() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>("report");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`Relatório de RH — ${new Date().toLocaleDateString("pt-BR")}`);
  const [customHtml, setCustomHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const baseUrl = import.meta.env.BASE_URL || "/";

  function getDefaultSubject(tmpl: Template): string {
    const date = new Date().toLocaleDateString("pt-BR");
    switch (tmpl) {
      case "report":
        return `Relatório de RH — ${date}`;
      case "insights":
        return `Insights & Alertas de RH — ${date}`;
      case "custom":
        return "";
    }
  }

  function handleTemplateSelect(tmpl: Template) {
    setSelectedTemplate(tmpl);
    setSubject(getDefaultSubject(tmpl));
    setResult(null);
    setShowPreview(false);
  }

  async function handlePreview() {
    if (selectedTemplate === "custom") {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:0;"><div style="max-width:640px;margin:0 auto;background:#fff;"><div style="background:#145338;padding:32px 24px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:24px;">Talent Cool</h1></div><div style="padding:24px;font-size:14px;line-height:1.7;color:#333;">${customHtml}</div><div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#6A6E6C;">Enviado pela plataforma Talent Cool</div></div></body></html>`;
      setPreviewHtml(html);
      setShowPreview(true);
      return;
    }

    setPreviewLoading(true);
    try {
      const apiUrl = `${baseUrl}api/email/preview`.replace(/\/\//g, "/");
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selectedTemplate }),
      });
      const data = await res.json();
      if (data.html) {
        setPreviewHtml(data.html);
        setShowPreview(true);
      }
    } catch {
      setResult({ success: false, message: "Erro ao gerar preview" });
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleSend() {
    if (!to.trim()) {
      setResult({ success: false, message: "Informe o(s) destinatário(s)" });
      return;
    }
    if (!subject.trim()) {
      setResult({ success: false, message: "Informe o assunto do e-mail" });
      return;
    }
    if (selectedTemplate === "custom" && !customHtml.trim()) {
      setResult({ success: false, message: "Escreva o conteúdo do e-mail" });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const apiUrl = `${baseUrl}api/email/send`.replace(/\/\//g, "/");
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          template: selectedTemplate,
          customHtml: selectedTemplate === "custom" ? customHtml : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ success: true, message: "E-mail enviado com sucesso!" });
      } else {
        setResult({ success: false, message: data.error || "Erro ao enviar" });
      }
    } catch {
      setResult({ success: false, message: "Erro de conexão ao enviar e-mail" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 -mt-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Reporting</h1>
          <p className="text-sm text-muted-foreground">
            Envie relatórios, métricas e insights por e-mail para sua equipe
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = selectedTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              onClick={() => handleTemplateSelect(tmpl.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {tmpl.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{tmpl.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Destinatário(s)
              </label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="email@empresa.com (separe com vírgula)"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Assunto
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto do e-mail"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
              />
            </div>

            {selectedTemplate === "custom" && (
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Conteúdo (HTML permitido)
                </label>
                <textarea
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  placeholder="Escreva o conteúdo do seu e-mail aqui..."
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar E-mail
              </button>
              <button
                onClick={handlePreview}
                disabled={previewLoading}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                {previewLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Preview
              </button>
            </div>

            {result && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  result.success
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {result.message}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground">
              {showPreview ? "Preview do E-mail" : "Selecione um template e clique em Preview"}
            </span>
            {showPreview && (
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="h-[500px] bg-[#f9fafb]">
            {showPreview ? (
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                className="w-full h-full border-none"
                title="Email preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Eye className="w-8 h-8 mb-3 opacity-30" />
                <p className="text-sm">Clique em "Preview" para visualizar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
