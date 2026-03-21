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
- Use markdown para formatar respostas (tabelas, listas, negrito)
- Se não souber a resposta, diga que não tem essa informação
- Não invente dados que não estejam no contexto fornecido`;

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

export default router;
