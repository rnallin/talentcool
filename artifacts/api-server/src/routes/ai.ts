import { Router, type IRouter } from "express";
import { db, jobsTable, candidatesTable, departmentsTable, companySettingsTable, pipelineStagesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

let openaiClient: any = null;

async function getOpenAI() {
  if (!openaiClient) {
    const { openai } = await import("@workspace/integrations-openai-ai-server");
    openaiClient = openai;
  }
  return openaiClient;
}

const router: IRouter = Router();

async function gatherPlatformData() {
  const [jobs, candidates, departments, stages, settings] = await Promise.all([
    db.select().from(jobsTable),
    db.select().from(candidatesTable),
    db.select().from(departmentsTable),
    db.select().from(pipelineStagesTable),
    db.select().from(companySettingsTable),
  ]);

  const openJobs = jobs.filter((j) => j.status === "open");
  const closedJobs = jobs.filter((j) => j.status === "closed");

  const hiredCandidates = candidates.filter((c) => c.stage === "contratado");

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));

  const jobsSummary = jobs.map((j) => ({
    titulo: j.title,
    departamento: deptMap.get(j.departmentId) ?? "N/A",
    status: j.status,
    localidade: j.location,
    modelo: j.workMode,
    salarioMin: j.minSalary,
    salarioMax: j.maxSalary,
    senioridade: j.seniority,
    abertoEm: j.openedAt,
    fechadoEm: j.closedAt,
    candidatos: candidates.filter((c) => c.jobId === j.id).length,
  }));

  const deptsSummary = departments.map((d) => ({
    nome: d.name,
    headcount: d.headcount,
    vagasAbertas: openJobs.filter((j) => j.departmentId === d.id).length,
  }));

  const candidatesByStage: Record<string, number> = {};
  for (const c of candidates) {
    const stage = c.stage ?? "desconhecido";
    candidatesByStage[stage] = (candidatesByStage[stage] || 0) + 1;
  }

  const candidatesSummary = candidates.map((c) => ({
    nome: c.name,
    etapa: c.stage,
    fonte: c.source,
    vagaId: c.jobId,
  }));

  const chargesRate = settings.find((s) => s.key === "charges_rate")?.value ?? "0.68";

  return {
    resumo: {
      totalVagas: jobs.length,
      vagasAbertas: openJobs.length,
      vagasFechadas: closedJobs.length,
      totalCandidatos: candidates.length,
      contratados: hiredCandidates.length,
      totalDepartamentos: departments.length,
      taxaEncargos: chargesRate,
    },
    vagas: jobsSummary,
    departamentos: deptsSummary,
    candidatos: candidatesSummary,
    candidatosPorEtapa: candidatesByStage,
    etapasPipeline: stages.map((s) => s.name),
  };
}

const SYSTEM_PROMPT = `Você é o assistente de IA da plataforma Talent Cool, um sistema de gestão de RH para empresas brasileiras.

Seu papel é ajudar os usuários a encontrar informações sobre vagas, candidatos, departamentos, métricas de recrutamento e custos.

Regras:
- Responda sempre em português brasileiro (pt-BR)
- Seja direto e objetivo
- Use dados reais da plataforma quando disponíveis
- Formate números brasileiros (R$ para moeda, separador de milhar com ponto)
- Use markdown para formatar respostas (negrito, listas)
- Se não souber a resposta, diga que não tem essa informação
- Não invente dados que não estejam no contexto fornecido

REGRA IMPORTANTE DE VISUALIZAÇÃO:
Sempre que apresentar dados numéricos, INCLUA gráficos usando blocos \`\`\`chart. Use o formato JSON abaixo.
NÃO use tabelas markdown. Prefira gráficos para visualizar dados.
Você pode incluir múltiplos gráficos em uma resposta.

Tipos disponíveis: "bar", "pie", "area", "kpi"

Formato para bar/area:
\`\`\`chart
{"type":"bar","title":"Título","data":[{"name":"Label","value":10},{"name":"Label2","value":20}]}
\`\`\`

Formato para pie:
\`\`\`chart
{"type":"pie","title":"Título","data":[{"name":"Seg A","value":40},{"name":"Seg B","value":60}]}
\`\`\`

Formato para KPI cards (resumo de métricas):
\`\`\`chart
{"type":"kpi","title":"Resumo","items":[{"label":"Vagas Abertas","value":"24"},{"label":"Candidatos","value":"52"},{"label":"Contratados","value":"5"}]}
\`\`\`

Exemplos de quando usar cada tipo:
- KPI: para resumos gerais com várias métricas
- Bar: para comparações entre departamentos, etapas, etc.
- Pie: para distribuições percentuais
- Area: para dados temporais ou tendências

Sempre inclua pelo menos um gráfico em suas respostas. Combine texto explicativo com gráficos.`;

router.post("/ai/search", async (req, res) => {
  try {
    const { message, history } = req.body as {
      message: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Campo 'message' é obrigatório" });
      return;
    }

    const platformData = await gatherPlatformData();

    const contextMessage = `Dados atuais da plataforma Talent Cool:\n\n${JSON.stringify(platformData, null, 2)}`;

    const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage },
    ];

    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        chatMessages.push({ role: msg.role, content: msg.content });
      }
    }

    chatMessages.push({ role: "user", content: message });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const openai = await getOpenAI();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("AI search error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao processar a busca com IA" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Erro ao processar" })}\n\n`);
      res.end();
    }
  }
});

const JOB_DESCRIPTION_SYSTEM_PROMPT = `Você é um especialista em Recrutamento e Seleção com foco em Copywriting para o mercado brasileiro.
Sua missão é criar descrições de vagas que convertam, atraiam os melhores talentos e sejam otimizadas para plataformas de emprego (SEO).

Regras:
- Escreva sempre em português brasileiro (pt-BR)
- Use linguagem inclusiva e neutra (sem viés de gênero, idade ou origem)
- Foque em benefícios e resultados, não apenas tarefas
- Use verbos de ação no infinitivo para responsabilidades
- Organize as informações com Markdown (## para seções, - para listas)
- Formate salários no padrão brasileiro (R$ X.XXX)

A descrição DEVE seguir esta estrutura exata com estas seções:

## 🎯 Sobre a Oportunidade
Um parágrafo de gancho que venda o desafio, a missão da empresa e por que essa vaga é especial. Deve despertar o interesse imediato do candidato.

## 📋 Responsabilidades
Lista de 5-8 atividades focadas em resultados e impacto, não apenas tarefas operacionais.

## ✅ Requisitos Essenciais
Lista de 4-6 competências eliminatórias (o que o candidato DEVE ter).

## ⭐ Diferenciais Desejáveis
Lista de 3-5 competências que somam pontos mas não eliminam.

## 💼 Benefícios e Cultura
Lista de benefícios reais e aspectos culturais da empresa.

## 📍 Informações da Vaga
Resumo com: Modelo de trabalho, Localização, Faixa salarial, Senioridade.

Ao final, adicione uma seção separada:

## 🔍 Análise DEI (Diversidade, Equidade e Inclusão)
Revise o texto gerado e liste:
- Palavras ou expressões potencialmente excludentes encontradas (se houver)
- Sugestões de termos mais inclusivos
- Avaliação geral do nível de inclusividade (Alto/Médio/Baixo)

## 💡 Perguntas de Triagem Sugeridas
Sugira 3 perguntas de knock-out para o formulário de inscrição, focadas em validar os requisitos essenciais.`;

router.post("/ai/job-description", async (req, res) => {
  try {
    const {
      title, seniority, workMode, location, department,
      tone, differentials, keywords, salaryRange, format
    } = req.body as {
      title: string;
      seniority: string;
      workMode: string;
      location: string;
      department?: string;
      tone?: string;
      differentials?: string;
      keywords?: string;
      salaryRange?: string;
      format?: string;
    };

    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Campo 'title' é obrigatório" });
      return;
    }

    const seniorityLabels: Record<string, string> = {
      junior: "Júnior", pleno: "Pleno", senior: "Sênior",
      especialista: "Especialista", gerente: "Gerente", diretor: "Diretor",
    };
    const workModeLabels: Record<string, string> = {
      presencial: "Presencial", hibrido: "Híbrido", remoto: "Remoto",
    };
    const toneLabels: Record<string, string> = {
      formal: "Formal e corporativo",
      casual: "Descontraído e acessível",
      innovative: "Inovador e inspirador",
    };

    let userPrompt = `Crie uma descrição completa para a seguinte vaga:\n\n`;
    userPrompt += `**Cargo:** ${title}\n`;
    userPrompt += `**Senioridade:** ${seniorityLabels[seniority] ?? seniority}\n`;
    userPrompt += `**Modelo:** ${workModeLabels[workMode] ?? workMode}\n`;
    userPrompt += `**Localização:** ${location}\n`;
    if (department) userPrompt += `**Departamento:** ${department}\n`;
    if (salaryRange) userPrompt += `**Faixa Salarial:** ${salaryRange}\n`;
    if (tone) userPrompt += `\n**Tom de voz:** ${toneLabels[tone] ?? tone}\n`;
    if (differentials) userPrompt += `\n**Diferenciais desta vaga:** ${differentials}\n`;
    if (keywords) userPrompt += `\n**Palavras-chave importantes para SEO:** ${keywords}\n`;

    if (format === "linkedin") {
      userPrompt += `\nADAPTAÇÃO: Gere o texto otimizado para LinkedIn — mais curto, direto, com emojis estratégicos e tom que engaje. Mantenha as seções mas seja mais conciso.`;
    } else if (format === "portal") {
      userPrompt += `\nADAPTAÇÃO: Gere o texto no formato completo para portal de vagas — estruturado, formal e detalhado.`;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const openai = await getOpenAI();
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: JOB_DESCRIPTION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Job description AI error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao gerar descrição da vaga" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Erro ao processar" })}\n\n`);
      res.end();
    }
  }
});

export default router;
