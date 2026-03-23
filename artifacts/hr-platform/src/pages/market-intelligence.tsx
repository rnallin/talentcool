import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Send,
  Loader2,
  ChevronRight,
  ExternalLink,
  Clock,
  Tag,
  Zap,
  Shield,
  Cpu,
  Users,
  BarChart3,
  ArrowRight,
  Mail,
  Check,
  RefreshCw,
  Globe2,
  X,
} from "lucide-react";

interface Insight {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  relevance: string;
  actionItems: string[];
  tags: string[];
}

interface Article {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  readTime: string;
}

interface IntelData {
  insights: Insight[];
  articles: Article[];
  weeklyDigest: string;
}

const CATEGORY_MAP: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  tendencia: { label: "Tendência", icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
  legislacao: { label: "Legislação", icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
  tecnologia: { label: "Tecnologia", icon: Cpu, color: "text-blue-600", bg: "bg-blue-50" },
  gestao: { label: "Gestão", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  mercado: { label: "Mercado", icon: BarChart3, color: "text-rose-600", bg: "bg-rose-50" },
};

const SECTORS = [
  "Tecnologia", "Saúde", "Financeiro", "Varejo", "Indústria",
  "Educação", "Serviços", "Agronegócio", "Logística", "Construção Civil",
];

const AREAS = [
  "Recrutamento & Seleção", "Desenvolvimento Organizacional", "Remuneração & Benefícios",
  "Treinamento & Desenvolvimento", "Relações Trabalhistas", "Business Partner",
  "People Analytics", "Employer Branding", "Diversidade & Inclusão",
];

const TOPIC_OPTIONS = [
  { id: "salarios", label: "Salários & Remuneração" },
  { id: "ia-rh", label: "IA no RH" },
  { id: "legislacao", label: "Legislação Trabalhista" },
  { id: "remoto", label: "Trabalho Remoto/Híbrido" },
  { id: "dei", label: "Diversidade & Inclusão" },
  { id: "employer-branding", label: "Employer Branding" },
  { id: "retencao", label: "Retenção de Talentos" },
  { id: "wellbeing", label: "Bem-estar & Saúde Mental" },
];

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-4 mb-2">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n{2,}/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br/>');
}

export default function MarketIntelligence() {
  const [sector, setSector] = useState("");
  const [area, setArea] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<IntelData | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [emailTarget, setEmailTarget] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailPanel, setShowEmailPanel] = useState(false);

  const { toast } = useToast();

  const toggleTopic = useCallback((id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setData(null);
    setExpandedInsight(null);
    setShowEmailPanel(false);
    setEmailSent(false);

    try {
      const topicLabels = selectedTopics.map(
        (id) => TOPIC_OPTIONS.find((t) => t.id === id)?.label ?? id
      );

      const res = await fetch("/api/ai/market-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: sector || undefined,
          area: area || undefined,
          topics: topicLabels.length > 0 ? topicLabels : undefined,
        }),
      });

      if (!res.ok) throw new Error("Falha na geração");

      const result = await res.json();
      setData(result);
    } catch {
      toast({ title: "Erro ao gerar inteligência de mercado", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTarget.trim() || !data) return;

    setIsSendingEmail(true);
    try {
      const insightsHtml = data.insights.map((ins) => {
        const cat = CATEGORY_MAP[ins.category];
        return `
          <div style="margin-bottom:20px;padding:16px;background:#f9fafb;border-radius:12px;border-left:4px solid #145338;">
            <div style="font-size:11px;color:#6A6E6C;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${cat?.label ?? ins.category}</div>
            <h3 style="margin:0 0 8px;font-size:16px;color:#145338;">${ins.title}</h3>
            <p style="margin:0 0 12px;font-size:14px;color:#333;line-height:1.6;">${ins.summary}</p>
            ${ins.actionItems.length > 0 ? `
              <div style="font-size:13px;font-weight:600;color:#145338;margin-bottom:4px;">Ações recomendadas:</div>
              <ul style="margin:0;padding-left:20px;font-size:13px;color:#555;">${ins.actionItems.map((a) => `<li style="margin-bottom:4px;">${a}</li>`).join("")}</ul>
            ` : ""}
          </div>
        `;
      }).join("");

      const articlesHtml = data.articles.map((art) => `
        <div style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
          <h4 style="margin:0 0 4px;font-size:14px;color:#145338;">${art.title}</h4>
          <p style="margin:0;font-size:12px;color:#6A6E6C;">${art.source} · ${art.readTime} de leitura</p>
          <p style="margin:4px 0 0;font-size:13px;color:#555;">${art.summary}</p>
        </div>
      `).join("");

      const fullHtml = `
        <h2 style="color:#145338;font-size:20px;margin:0 0 8px;">Inteligência de Mercado - RH</h2>
        <p style="color:#6A6E6C;font-size:14px;margin:0 0 24px;">${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
        ${data.weeklyDigest ? `<div style="padding:16px;background:#f0fdf4;border-radius:12px;margin-bottom:24px;font-size:14px;color:#333;line-height:1.6;"><strong>Resumo da semana:</strong> ${data.weeklyDigest}</div>` : ""}
        <h3 style="color:#145338;font-size:16px;margin:0 0 16px;">Insights</h3>
        ${insightsHtml}
        <h3 style="color:#145338;font-size:16px;margin:24px 0 12px;">Leituras Recomendadas</h3>
        ${articlesHtml}
      `;

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTarget,
          subject: `Inteligência de Mercado RH — ${new Date().toLocaleDateString("pt-BR")}`,
          template: "custom",
          customHtml: fullHtml,
        }),
      });

      if (!res.ok) throw new Error("Falha no envio");

      setEmailSent(true);
      toast({ title: "E-mail enviado com sucesso!" });
    } catch {
      toast({ title: "Erro ao enviar e-mail", variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-primary/20 flex items-center justify-center shrink-0">
          <Globe2 className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
              Inteligência de Mercado
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/10 to-primary/10 border border-violet-200/50">
              <Sparkles className="w-3 h-3 text-violet-500" />
              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">AI Powered</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tendências, insights e artigos relevantes para empoderar sua gestão de pessoas.
          </p>
        </div>
      </div>

      {!data && !isLoading && (
        <div className="space-y-5">
          <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-violet-50/50 px-6 py-4 border-b border-border/40">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Personalize seus insights
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Quanto mais contexto, mais relevante será o conteúdo gerado.</p>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Setor da empresa</label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sua área de atuação</label>
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                    <SelectContent>
                      {AREAS.map((a) => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Tópicos de interesse</label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_OPTIONS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => toggleTopic(topic.id)}
                        className={`group px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                          isSelected
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/60 hover:border-border"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                className="group w-full rounded-xl h-12 bg-gradient-to-r from-violet-600 to-primary hover:from-violet-600/90 hover:to-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                Gerar Insights de Mercado
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50", title: "Tendências", desc: "Dados e movimentos atuais do mercado de trabalho" },
              { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50", title: "Artigos", desc: "Leituras recomendadas de fontes confiáveis" },
              { icon: Mail, color: "text-emerald-600", bg: "bg-emerald-50", title: "Newsletter", desc: "Envie os insights por e-mail para sua equipe" },
            ].map((item) => (
              <Card key={item.title} className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-5 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-primary/20 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-violet-500" />
            </div>
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mt-5">
            Analisando o mercado...
          </h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            A IA está pesquisando tendências, legislação e melhores práticas para o seu perfil.
          </p>
          <Loader2 className="w-5 h-5 animate-spin text-primary mt-4" />
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-6">
          {data.weeklyDigest && (
            <Card className="rounded-2xl border-primary/20 shadow-sm bg-gradient-to-r from-primary/5 to-emerald-50/50">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Resumo da Semana</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">{data.weeklyDigest}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Insights ({data.insights.length})
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowEmailPanel(!showEmailPanel); setEmailSent(false); }}
                className="h-8 text-xs rounded-lg gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                Enviar por E-mail
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setData(null); setExpandedInsight(null); }}
                className="h-8 text-xs rounded-lg gap-1.5 text-muted-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Nova pesquisa
              </Button>
            </div>
          </div>

          {showEmailPanel && (
            <Card className="rounded-2xl border-violet-200/60 shadow-sm bg-violet-50/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Enviar insights para</label>
                    <Input
                      placeholder="email@empresa.com.br"
                      className="rounded-xl h-10"
                      value={emailTarget}
                      onChange={(e) => setEmailTarget(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleSendEmail}
                    disabled={!emailTarget.trim() || isSendingEmail || emailSent}
                    className="mt-5 rounded-xl h-10 px-5 bg-gradient-to-r from-violet-600 to-primary text-white"
                  >
                    {emailSent ? (
                      <><Check className="w-4 h-4 mr-1.5" /> Enviado!</>
                    ) : isSendingEmail ? (
                      <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Enviando...</>
                    ) : (
                      <><Send className="w-4 h-4 mr-1.5" /> Enviar</>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmailPanel(false)}
                    className="mt-5 h-10 w-10 text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.insights.map((insight) => {
              const cat = CATEGORY_MAP[insight.category] ?? CATEGORY_MAP.mercado;
              const isExpanded = expandedInsight === insight.id;
              return (
                <Card
                  key={insight.id}
                  className={`rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                    isExpanded ? "lg:col-span-2 border-primary/30" : ""
                  }`}
                  onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <cat.icon className={`w-4.5 h-4.5 ${cat.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.color}`}>{cat.label}</span>
                          {insight.relevance === "alta" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Alta relevância</span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground leading-snug">{insight.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{insight.summary}</p>

                        {isExpanded && (
                          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div
                              className="text-sm text-foreground/85 leading-relaxed prose-sm"
                              dangerouslySetInnerHTML={{ __html: renderMarkdown(insight.content) }}
                            />

                            {insight.actionItems.length > 0 && (
                              <div className="bg-primary/5 rounded-xl p-4">
                                <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                                  <ArrowRight className="w-3.5 h-3.5" />
                                  Ações Recomendadas
                                </h4>
                                <ul className="space-y-1.5">
                                  {insight.actionItems.map((action, i) => (
                                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                                      <Check className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {insight.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {insight.tags.map((tag) => (
                                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">
                                    <Tag className="w-2.5 h-2.5" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {!isExpanded && (
                          <button className="mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            Ler mais <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {data.articles.length > 0 && (
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Leituras Recomendadas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {data.articles.map((article) => (
                  <Card key={article.id} className="group rounded-2xl border-border/60 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all duration-300">
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-semibold text-blue-600 uppercase tracking-wider">{article.source}</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {article.readTime}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-blue-700 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{article.summary}</p>
                      <div className="flex items-center gap-1 text-xs text-blue-600 font-medium pt-1">
                        <ExternalLink className="w-3 h-3" />
                        Ler artigo
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
