import { Router, type IRouter } from "express";
import { getResendClient } from "../lib/resend";
import { db, jobsTable, candidatesTable, departmentsTable, companySettingsTable, emailDraftsTable, emailAutomationsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

async function getOverviewData() {
  const [jobs, candidates, departments, settings] = await Promise.all([
    db.select().from(jobsTable),
    db.select().from(candidatesTable),
    db.select().from(departmentsTable),
    db.select().from(companySettingsTable),
  ]);

  const openJobs = jobs.filter((j) => j.status === "open");
  const hiredThisMonth = candidates.filter((c) => {
    if (c.stage !== "contratado") return false;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return c.updatedAt >= start;
  });

  const deptMap = new Map(departments.map((d) => [d.id, d.name]));
  const chargesRate = parseFloat(settings.find((s) => s.key === "charges_rate")?.value ?? "0.68");

  const candidatesByStage: Record<string, number> = {};
  for (const c of candidates) {
    const stage = c.stage ?? "desconhecido";
    candidatesByStage[stage] = (candidatesByStage[stage] || 0) + 1;
  }

  let totalMonthlyCost = 0;
  for (const j of openJobs) {
    const avg = (parseFloat(j.minSalary) + parseFloat(j.maxSalary)) / 2;
    totalMonthlyCost += avg * (1 + chargesRate);
  }

  const topJobsByCandidate = openJobs
    .map((j) => ({
      title: j.title,
      dept: deptMap.get(j.departmentId) ?? "",
      count: candidates.filter((c) => c.jobId === j.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalJobs: jobs.length,
    openJobs: openJobs.length,
    closedJobs: jobs.filter((j) => j.status === "closed").length,
    totalCandidates: candidates.length,
    hiredThisMonth: hiredThisMonth.length,
    totalDepartments: departments.length,
    candidatesByStage,
    totalMonthlyCost,
    topJobsByCandidate,
    departments: departments.map((d) => ({
      name: d.name,
      headcount: d.headcount,
      openJobs: openJobs.filter((j) => j.departmentId === d.id).length,
    })),
  };
}

function buildReportHtml(data: Awaited<ReturnType<typeof getOverviewData>>) {
  const stageRows = Object.entries(data.candidatesByStage)
    .map(([stage, count]) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${stage}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${count}</td></tr>`)
    .join("");

  const topJobRows = data.topJobsByCandidate
    .map((j) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${j.title}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${j.dept}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${j.count}</td></tr>`)
    .join("");

  const deptRows = data.departments
    .map((d) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${d.name}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${d.headcount}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${d.openJobs}</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:640px;margin:0 auto;background:#fff;">
  <div style="background:#145338;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Talent Cool — Relatório de RH</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
  </div>

  <div style="padding:24px;">
    <h2 style="color:#145338;font-size:18px;margin:0 0 16px;">Resumo Geral</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr>
        <td style="padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;width:25%;">
          <div style="font-size:28px;font-weight:700;color:#145338;">${data.openJobs}</div>
          <div style="font-size:12px;color:#6A6E6C;margin-top:4px;">Vagas Abertas</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;width:25%;">
          <div style="font-size:28px;font-weight:700;color:#145338;">${data.totalCandidates}</div>
          <div style="font-size:12px;color:#6A6E6C;margin-top:4px;">Candidatos</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;width:25%;">
          <div style="font-size:28px;font-weight:700;color:#145338;">${data.hiredThisMonth}</div>
          <div style="font-size:12px;color:#6A6E6C;margin-top:4px;">Contratados (mês)</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;background:#f0fdf4;border-radius:8px;text-align:center;width:25%;">
          <div style="font-size:28px;font-weight:700;color:#145338;">R$${Math.round(data.totalMonthlyCost / 1000)}K</div>
          <div style="font-size:12px;color:#6A6E6C;margin-top:4px;">Custo Mensal</div>
        </td>
      </tr>
    </table>

    <h2 style="color:#145338;font-size:18px;margin:0 0 12px;">Pipeline de Candidatos</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6A6E6C;">Etapa</th>
          <th style="padding:8px 12px;text-align:right;font-weight:600;color:#6A6E6C;">Candidatos</th>
        </tr>
      </thead>
      <tbody>${stageRows}</tbody>
    </table>

    <h2 style="color:#145338;font-size:18px;margin:0 0 12px;">Top 5 Vagas por Candidatos</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6A6E6C;">Vaga</th>
          <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6A6E6C;">Departamento</th>
          <th style="padding:8px 12px;text-align:right;font-weight:600;color:#6A6E6C;">Candidatos</th>
        </tr>
      </thead>
      <tbody>${topJobRows}</tbody>
    </table>

    <h2 style="color:#145338;font-size:18px;margin:0 0 12px;">Departamentos</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:14px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6A6E6C;">Departamento</th>
          <th style="padding:8px 12px;text-align:right;font-weight:600;color:#6A6E6C;">Headcount</th>
          <th style="padding:8px 12px;text-align:right;font-weight:600;color:#6A6E6C;">Vagas Abertas</th>
        </tr>
      </thead>
      <tbody>${deptRows}</tbody>
    </table>
  </div>

  <div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#6A6E6C;">
    Enviado automaticamente pela plataforma Talent Cool
  </div>
</div>
</body>
</html>`;
}

function buildInsightsHtml(data: Awaited<ReturnType<typeof getOverviewData>>) {
  const insights: string[] = [];

  if (data.openJobs > 10) {
    insights.push(`📊 Você tem <strong>${data.openJobs} vagas abertas</strong> — considere priorizar as mais antigas.`);
  }

  const triagemCount = data.candidatesByStage["triagem"] ?? 0;
  if (triagemCount > 10) {
    insights.push(`⚠️ <strong>${triagemCount} candidatos</strong> ainda na triagem. Considere agilizar as avaliações iniciais.`);
  }

  if (data.totalMonthlyCost > 100000) {
    insights.push(`💰 O custo mensal das vagas abertas é <strong>R$${(data.totalMonthlyCost / 1000).toFixed(0)}K</strong>. Fechar vagas críticas pode reduzir esse custo.`);
  }

  const hiredCount = data.candidatesByStage["contratado"] ?? 0;
  const convRate = data.totalCandidates > 0 ? ((hiredCount / data.totalCandidates) * 100).toFixed(1) : "0";
  insights.push(`📈 Taxa de conversão geral: <strong>${convRate}%</strong> (${hiredCount} contratados de ${data.totalCandidates} candidatos).`);

  for (const dept of data.departments) {
    if (dept.openJobs >= 3) {
      insights.push(`🏢 <strong>${dept.name}</strong> tem ${dept.openJobs} vagas abertas — pode precisar de atenção prioritária.`);
    }
  }

  if (insights.length === 0) {
    insights.push("✅ Tudo parece sob controle! Sem alertas no momento.");
  }

  const insightItems = insights.map((i) => `<li style="padding:12px 0;border-bottom:1px solid #e5e7eb;line-height:1.6;">${i}</li>`).join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:640px;margin:0 auto;background:#fff;">
  <div style="background:#145338;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Talent Cool — Insights & Alertas</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
  </div>
  <div style="padding:24px;">
    <ul style="list-style:none;padding:0;margin:0;font-size:14px;">${insightItems}</ul>
  </div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#6A6E6C;">
    Enviado automaticamente pela plataforma Talent Cool
  </div>
</div>
</body>
</html>`;
}

router.post("/email/send", async (req, res) => {
  try {
    const { to, subject, template, customHtml } = req.body as {
      to: string;
      subject: string;
      template?: "report" | "insights" | "custom";
      customHtml?: string;
    };

    if (!to || !subject) {
      res.status(400).json({ error: "Campos 'to' e 'subject' são obrigatórios" });
      return;
    }

    const recipients = to.split(",").map((e) => e.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (recipients.length === 0 || recipients.length > 10) {
      res.status(400).json({ error: "Informe entre 1 e 10 destinatários" });
      return;
    }
    for (const r of recipients) {
      if (!emailRegex.test(r)) {
        res.status(400).json({ error: `E-mail inválido: ${r}` });
        return;
      }
    }

    let html: string;

    if (template === "report") {
      const data = await getOverviewData();
      html = buildReportHtml(data);
    } else if (template === "insights") {
      const data = await getOverviewData();
      html = buildInsightsHtml(data);
    } else if (template === "custom" && customHtml) {
      html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:640px;margin:0 auto;background:#fff;">
  <div style="background:#145338;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Talent Cool</h1>
  </div>
  <div style="padding:24px;font-size:14px;line-height:1.7;color:#333;">${customHtml}</div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#6A6E6C;">
    Enviado pela plataforma Talent Cool
  </div>
</div>
</body>
</html>`;
    } else {
      res.status(400).json({ error: "Template inválido. Use 'report', 'insights' ou 'custom'" });
      return;
    }

    const { client, fromEmail } = await getResendClient();

    const result = await client.emails.send({
      from: fromEmail || "Talent Cool <onboarding@resend.dev>",
      to: recipients,
      subject,
      html,
    });

    res.json({ success: true, id: (result as any).data?.id ?? null });
  } catch (error: any) {
    console.error("Email send error:", error);
    res.status(500).json({ error: error.message || "Erro ao enviar e-mail" });
  }
});

router.post("/email/preview", async (req, res) => {
  try {
    const { template } = req.body as { template: "report" | "insights" };

    const data = await getOverviewData();
    const html = template === "insights" ? buildInsightsHtml(data) : buildReportHtml(data);

    res.json({ html });
  } catch (error: any) {
    console.error("Email preview error:", error);
    res.status(500).json({ error: "Erro ao gerar preview" });
  }
});

router.get("/email/drafts", async (_req, res) => {
  try {
    const drafts = await db.select().from(emailDraftsTable).orderBy(desc(emailDraftsTable.updatedAt));
    res.json(drafts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/email/drafts", async (req, res) => {
  try {
    const { subject, recipients, content, template } = req.body;
    const [draft] = await db.insert(emailDraftsTable).values({
      subject: subject || "",
      recipients: recipients || "",
      content: content || "",
      template: template || "custom",
      status: "draft",
    }).returning();
    res.json(draft);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/email/drafts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { subject, recipients, content, template, status } = req.body;
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (subject !== undefined) updates.subject = subject;
    if (recipients !== undefined) updates.recipients = recipients;
    if (content !== undefined) updates.content = content;
    if (template !== undefined) updates.template = template;
    if (status !== undefined) updates.status = status;
    if (status === "sent") updates.sentAt = new Date();

    const [draft] = await db.update(emailDraftsTable).set(updates).where(eq(emailDraftsTable.id, id)).returning();
    res.json(draft);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/email/drafts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(emailDraftsTable).where(eq(emailDraftsTable.id, id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/email/drafts/:id/send", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [draft] = await db.select().from(emailDraftsTable).where(eq(emailDraftsTable.id, id));
    if (!draft) { res.status(404).json({ error: "Rascunho não encontrado" }); return; }

    const recipients = draft.recipients.split(",").map((e) => e.trim()).filter(Boolean);
    if (recipients.length === 0) { res.status(400).json({ error: "Sem destinatários" }); return; }

    let html: string;
    if (draft.template === "report") {
      const data = await getOverviewData();
      html = buildReportHtml(data);
    } else if (draft.template === "insights") {
      const data = await getOverviewData();
      html = buildInsightsHtml(data);
    } else {
      html = wrapCustomHtml(draft.content);
    }

    const { client, fromEmail } = await getResendClient();
    await client.emails.send({
      from: fromEmail || "Talent Cool <onboarding@resend.dev>",
      to: recipients,
      subject: draft.subject,
      html,
    });

    await db.update(emailDraftsTable).set({ status: "sent", sentAt: new Date(), updatedAt: new Date() }).where(eq(emailDraftsTable.id, id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function wrapCustomHtml(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f9fafb;margin:0;padding:0;">
<div style="max-width:640px;margin:0 auto;background:#fff;">
  <div style="background:#145338;padding:32px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Talent Cool</h1>
  </div>
  <div style="padding:24px;font-size:14px;line-height:1.7;color:#333;">${content}</div>
  <div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#6A6E6C;">
    Enviado pela plataforma Talent Cool
  </div>
</div></body></html>`;
}

router.get("/email/automations", async (_req, res) => {
  try {
    const automations = await db.select().from(emailAutomationsTable).orderBy(desc(emailAutomationsTable.createdAt));
    res.json(automations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/email/automations", async (req, res) => {
  try {
    const { name, description, template, recipients, frequency, dayOfWeek, hour, minute } = req.body;
    const nextRunAt = computeNextRun(frequency, dayOfWeek ?? 2, hour ?? 8, minute ?? 0);
    const [automation] = await db.insert(emailAutomationsTable).values({
      name,
      description: description || "",
      template,
      recipients: recipients || "",
      frequency: frequency || "weekly",
      dayOfWeek: dayOfWeek ?? 2,
      hour: hour ?? 8,
      minute: minute ?? 0,
      isActive: true,
      nextRunAt,
    }).returning();
    res.json(automation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/email/automations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, template, recipients, frequency, dayOfWeek, hour, minute, isActive } = req.body;
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (template !== undefined) updates.template = template;
    if (recipients !== undefined) updates.recipients = recipients;
    if (frequency !== undefined) updates.frequency = frequency;
    if (dayOfWeek !== undefined) updates.dayOfWeek = dayOfWeek;
    if (hour !== undefined) updates.hour = hour;
    if (minute !== undefined) updates.minute = minute;
    if (isActive !== undefined) updates.isActive = isActive;

    if (frequency || dayOfWeek !== undefined || hour !== undefined) {
      const f = frequency || "weekly";
      const d = dayOfWeek ?? 2;
      const h = hour ?? 8;
      const m = minute ?? 0;
      updates.nextRunAt = computeNextRun(f, d, h, m);
    }

    const [automation] = await db.update(emailAutomationsTable).set(updates).where(eq(emailAutomationsTable.id, id)).returning();
    res.json(automation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/email/automations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(emailAutomationsTable).where(eq(emailAutomationsTable.id, id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/email/automations/:id/toggle", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [current] = await db.select().from(emailAutomationsTable).where(eq(emailAutomationsTable.id, id));
    if (!current) { res.status(404).json({ error: "Automação não encontrada" }); return; }
    const newActive = !current.isActive;
    const nextRunAt = newActive ? computeNextRun(current.frequency, current.dayOfWeek, current.hour, current.minute) : null;
    const [automation] = await db.update(emailAutomationsTable).set({ isActive: newActive, nextRunAt }).where(eq(emailAutomationsTable.id, id)).returning();
    res.json(automation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function computeNextRun(frequency: string, dayOfWeek: number, hour: number, minute: number): Date {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);

  if (frequency === "daily") {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
    const currentDay = next.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && next <= now)) daysUntil += 7;
    next.setDate(next.getDate() + daysUntil);
  } else if (frequency === "biweekly") {
    const currentDay = next.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && next <= now)) daysUntil += 14;
    next.setDate(next.getDate() + daysUntil);
  } else if (frequency === "monthly") {
    next.setDate(1);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  }

  return next;
}

export default router;
