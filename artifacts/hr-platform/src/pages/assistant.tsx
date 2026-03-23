import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, Bot, User, Sparkles, Loader2, ArrowRight, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ROI_REPORT_TRIGGER = "__ROI_REPORT__";

const SUGGESTIONS = [
  { text: "Quero um relatório com todas as métricas", emoji: "📊" },
  { text: "Quantas vagas estão abertas por departamento?", emoji: "📋" },
  { text: "Qual a distribuição de candidatos por etapa?", emoji: "👥" },
  { text: "Qual o custo estimado das vagas abertas?", emoji: "💰" },
  { text: "Resumo geral do recrutamento", emoji: "🎯" },
  { text: "Qual o tempo médio de contratação?", emoji: "⏱️" },
];

const CHART_COLORS = ["#145338", "#2d8a5e", "#4ade80", "#97A09B", "#6A6E6C", "#b8c0bb", "#059669", "#10b981"];

interface ChartBlock {
  type: "bar" | "pie" | "area" | "kpi";
  title?: string;
  data?: Array<{ name: string; value: number }>;
  items?: Array<{ label: string; value: string }>;
}

function InlineChart({ chart }: { chart: ChartBlock }) {
  if (chart.type === "kpi" && chart.items) {
    return (
      <div className="my-4">
        {chart.title && <p className="text-sm font-semibold text-foreground mb-3">{chart.title}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {chart.items.map((item, i) => (
            <div key={i} className="bg-background border border-border rounded-xl p-3.5 text-center">
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!chart.data || chart.data.length === 0) return null;

  if (chart.type === "pie") {
    return (
      <div className="my-4">
        {chart.title && <p className="text-sm font-semibold text-foreground mb-3">{chart.title}</p>}
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={200} minWidth={180}>
              <PieChart>
                <Pie
                  data={chart.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chart.data.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "0.8rem",
                    backdropFilter: "blur(8px)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center sm:flex-col sm:justify-start">
              {chart.data.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (chart.type === "area") {
    return (
      <div className="my-4">
        {chart.title && <p className="text-sm font-semibold text-foreground mb-3">{chart.title}</p>}
        <div className="bg-background border border-border rounded-xl p-4">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chart.data}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#145338" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#145338" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "0.8rem",
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#145338" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      {chart.title && <p className="text-sm font-semibold text-foreground mb-3">{chart.title}</p>}
      <div className="bg-background border border-border rounded-xl p-4">
        <ResponsiveContainer width="100%" height={Math.max(200, chart.data.length * 40)}>
          <BarChart data={chart.data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.75rem",
                fontSize: "0.8rem",
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {chart.data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function parseAndRender(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const chartRegex = /```chart\s*\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = chartRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = text.slice(lastIndex, match.index);
      parts.push(
        <div key={`t-${lastIndex}`} className="prose prose-sm max-w-none [&_strong]:font-semibold [&_code]:text-xs" dangerouslySetInnerHTML={{ __html: parseMarkdown(textBefore) }} />
      );
    }

    try {
      const chartData: ChartBlock = JSON.parse(match[1].trim());
      parts.push(<InlineChart key={`c-${match.index}`} chart={chartData} />);
    } catch {
      parts.push(
        <div key={`e-${match.index}`} className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(match[0]) }} />
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim()) {
      parts.push(
        <div key={`t-${lastIndex}`} className="prose prose-sm max-w-none [&_strong]:font-semibold [&_code]:text-xs" dangerouslySetInnerHTML={{ __html: parseMarkdown(remaining) }} />
      );
    }
  }

  return parts;
}

function parseMarkdown(text: string): string {
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');

  html = html.replace(/^### (.+)$/gm, '<h3 class="font-semibold text-base mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-semibold text-lg mt-4 mb-1">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-bold text-xl mt-4 mb-2">$1</h1>');

  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (m) => `<ul class="my-1">${m}</ul>`);

  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setInput("");
      sendMessage(q);
    }
  }, []);

  useEffect(() => {
    if (!hasMessages) {
      inputRef.current?.focus();
    }
  }, [hasMessages]);

  async function sendMessage(text?: string) {
    const messageText = text ?? input.trim();
    if (!messageText || isStreaming) return;

    const isRoiReport = messageText === ROI_REPORT_TRIGGER;
    const displayText = isRoiReport ? "Gerar Relatório de ROI do Talent Cool" : messageText;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: displayText,
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const baseUrl = import.meta.env.BASE_URL || "/";

      let response: Response;

      if (isRoiReport) {
        const apiUrl = `${baseUrl}api/ai/roi-report`.replace(/\/\//g, "/");
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      } else {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const apiUrl = `${baseUrl}api/ai/search`.replace(/\/\//g, "/");
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText, history }),
        });
      }

      if (!response.ok) throw new Error("Erro na resposta do servidor");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Stream não disponível");

      let accumulated = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.done) continue;
              if (data.error) {
                accumulated += `\n\n⚠️ ${data.error}`;
              } else if (data.content) {
                accumulated += data.content;
              }
              const currentAccumulated = accumulated;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: currentAccumulated }
                    : m
                )
              );
            } catch {}
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!hasMessages) {
    return (
      <div className="flex flex-col items-center justify-center h-full -mt-8 px-4">
        <div className="max-w-2xl w-full flex flex-col items-center">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 text-primary text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Talent Cool IA
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
              {getGreeting()}, Ana
            </h1>
            <p className="text-lg text-muted-foreground mt-3">
              Como posso ajudar com o recrutamento hoje?
            </p>
          </div>

          <div className="w-full mb-8">
            <div className="flex items-end gap-2 p-2 rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre vagas, candidatos, métricas..."
                rows={1}
                className="flex-1 resize-none bg-transparent border-none outline-none text-sm px-3 py-3 text-foreground placeholder:text-muted-foreground min-h-[48px] max-h-[120px]"
                style={{ fieldSizing: "content" } as any}
                disabled={isStreaming}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:bg-primary/90 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => sendMessage(ROI_REPORT_TRIGGER)}
            className="group w-full flex items-center gap-4 text-left px-5 py-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-emerald-50/50 to-transparent hover:from-primary/10 hover:via-emerald-50 hover:border-primary/40 hover:shadow-md transition-all mb-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground block">Relatório de ROI</span>
              <span className="text-xs text-muted-foreground">Analise o retorno do Talent Cool para a empresa e para o RH</span>
            </div>
            <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0 transition-all shrink-0" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                onClick={() => sendMessage(s.text)}
                className="group flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 hover:shadow-sm transition-all text-sm text-muted-foreground hover:text-foreground"
              >
                <span className="text-base shrink-0">{s.emoji}</span>
                <span className="flex-1">{s.text}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all" />
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground/60 mt-8">
            A IA usa dados reais da sua plataforma para responder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex-1 min-h-0 overflow-y-auto py-4">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "max-w-[80%] bg-primary text-primary-foreground rounded-br-md px-4 py-3"
                    : "flex-1 min-w-0"
                }`}
              >
                {msg.role === "assistant" ? (
                  msg.content ? (
                    <div className="space-y-0">
                      {parseAndRender(msg.content)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analisando seus dados...</span>
                    </div>
                  )
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-primary font-bold text-xs">
                  AS
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 pt-4 pb-2">
        <div className="flex items-end gap-2 p-2 rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/50 focus-within:shadow-md transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre vagas, candidatos, métricas..."
            rows={1}
            className="flex-1 resize-none bg-transparent border-none outline-none text-sm px-3 py-3 text-foreground placeholder:text-muted-foreground min-h-[48px] max-h-[120px]"
            style={{ fieldSizing: "content" } as any}
            disabled={isStreaming}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            className="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:bg-primary/90 transition-colors"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-2 text-center">
          A IA usa dados reais da sua plataforma para responder.
        </p>
      </div>
    </div>
  );
}
