import {
  db,
  departmentsTable,
  jobsTable,
  candidatesTable,
  benchmarksTable,
  pipelineStagesTable,
  companySettingsTable,
} from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  // Departments
  const depts = await db
    .insert(departmentsTable)
    .values([
      { name: "Tecnologia", headcount: 45 },
      { name: "Comercial", headcount: 32 },
      { name: "Marketing", headcount: 18 },
      { name: "Operações", headcount: 27 },
      { name: "Recursos Humanos", headcount: 12 },
      { name: "Financeiro", headcount: 15 },
      { name: "Produto", headcount: 22 },
    ])
    .returning();

  console.log(`✓ ${depts.length} departments created`);

  const deptMap = Object.fromEntries(depts.map((d) => [d.name, d.id]));

  // Jobs
  const now = new Date();
  function daysAgo(n: number) {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  }

  const jobs = await db
    .insert(jobsTable)
    .values([
      // Tecnologia - open
      { title: "Engenheiro de Software Sênior", departmentId: deptMap["Tecnologia"], status: "open", seniority: "senior", minSalary: "12000", maxSalary: "18000", location: "São Paulo, SP", workMode: "hibrido", requirements: "React, Node.js, TypeScript, 5+ anos de experiência", openedAt: daysAgo(42) },
      { title: "Tech Lead", departmentId: deptMap["Tecnologia"], status: "open", seniority: "especialista", minSalary: "18000", maxSalary: "25000", location: "São Paulo, SP", workMode: "hibrido", requirements: "Liderança técnica, arquitetura de sistemas, 8+ anos", openedAt: daysAgo(28) },
      { title: "Desenvolvedor Fullstack Pleno", departmentId: deptMap["Tecnologia"], status: "open", seniority: "pleno", minSalary: "8000", maxSalary: "12000", location: "Remoto", workMode: "remoto", requirements: "React, Python ou Node.js, 3+ anos", openedAt: daysAgo(15) },
      { title: "Analista de QA", departmentId: deptMap["Tecnologia"], status: "open", seniority: "pleno", minSalary: "6000", maxSalary: "9000", location: "São Paulo, SP", workMode: "presencial", requirements: "Testes automatizados, Cypress, Selenium", openedAt: daysAgo(20) },
      { title: "Engenheiro de Dados", departmentId: deptMap["Tecnologia"], status: "paused", seniority: "senior", minSalary: "14000", maxSalary: "20000", location: "Remoto", workMode: "remoto", requirements: "Python, Spark, dbt, 5+ anos", openedAt: daysAgo(35) },

      // Comercial - open
      { title: "Gerente de Vendas", departmentId: deptMap["Comercial"], status: "open", seniority: "gerente", minSalary: "10000", maxSalary: "16000", location: "Rio de Janeiro, RJ", workMode: "hibrido", requirements: "Gestão de equipes comerciais, B2B SaaS", openedAt: daysAgo(30) },
      { title: "Account Executive", departmentId: deptMap["Comercial"], status: "open", seniority: "pleno", minSalary: "6000", maxSalary: "9000", location: "São Paulo, SP", workMode: "presencial", requirements: "Vendas B2B, CRM, 2+ anos", openedAt: daysAgo(18) },
      { title: "Closer", departmentId: deptMap["Comercial"], status: "open", seniority: "junior", minSalary: "3500", maxSalary: "5500", location: "São Paulo, SP", workMode: "presencial", requirements: "Experiência em vendas, proatividade", openedAt: daysAgo(10) },

      // Marketing - open
      { title: "Analista de Marketing Digital", departmentId: deptMap["Marketing"], status: "open", seniority: "pleno", minSalary: "5500", maxSalary: "8500", location: "Remoto", workMode: "remoto", requirements: "Google Ads, Meta Ads, SEO, analytics", openedAt: daysAgo(22) },
      { title: "Designer de Produto", departmentId: deptMap["Marketing"], status: "open", seniority: "senior", minSalary: "9000", maxSalary: "14000", location: "São Paulo, SP", workMode: "hibrido", requirements: "Figma, Design System, UX Research", openedAt: daysAgo(12) },

      // Produto - open
      { title: "Product Manager", departmentId: deptMap["Produto"], status: "open", seniority: "senior", minSalary: "14000", maxSalary: "22000", location: "São Paulo, SP", workMode: "hibrido", requirements: "Experiência com squads, OKRs, roadmap", openedAt: daysAgo(50) },
      { title: "Product Designer", departmentId: deptMap["Produto"], status: "open", seniority: "pleno", minSalary: "8000", maxSalary: "13000", location: "Remoto", workMode: "remoto", requirements: "Figma, prototipagem, UX", openedAt: daysAgo(8) },

      // Operações - open
      { title: "Analista de Operações", departmentId: deptMap["Operações"], status: "open", seniority: "pleno", minSalary: "5000", maxSalary: "7500", location: "Curitiba, PR", workMode: "presencial", requirements: "Excel avançado, processos, melhoria contínua", openedAt: daysAgo(25) },

      // Closed jobs (for metrics)
      { title: "Desenvolvedor Frontend Junior", departmentId: deptMap["Tecnologia"], status: "closed", seniority: "junior", minSalary: "4000", maxSalary: "6000", location: "São Paulo, SP", workMode: "hibrido", requirements: "React, JavaScript", openedAt: daysAgo(120), closedAt: daysAgo(85) },
      { title: "Analista de RH", departmentId: deptMap["Recursos Humanos"], status: "closed", seniority: "pleno", minSalary: "4500", maxSalary: "7000", location: "São Paulo, SP", workMode: "presencial", openedAt: daysAgo(90), closedAt: daysAgo(60) },
      { title: "Analista Financeiro", departmentId: deptMap["Financeiro"], status: "closed", seniority: "pleno", minSalary: "5000", maxSalary: "7500", location: "São Paulo, SP", workMode: "hibrido", openedAt: daysAgo(110), closedAt: daysAgo(75) },
      { title: "Scrum Master", departmentId: deptMap["Produto"], status: "closed", seniority: "especialista", minSalary: "9000", maxSalary: "14000", location: "Remoto", workMode: "remoto", openedAt: daysAgo(100), closedAt: daysAgo(55) },
      { title: "SDR", departmentId: deptMap["Comercial"], status: "closed", seniority: "junior", minSalary: "3000", maxSalary: "5000", location: "São Paulo, SP", workMode: "presencial", openedAt: daysAgo(80), closedAt: daysAgo(40) },
    ])
    .returning();

  console.log(`✓ ${jobs.length} jobs created`);

  // Candidates for open jobs
  const stages = ["triagem", "entrevista_rh", "entrevista_tecnica", "proposta", "contratado", "reprovado"] as const;
  const sources = ["linkedin", "indicacao", "site", "outro"] as const;

  const candidateNames = [
    "Ana Lima", "Bruno Santos", "Carla Mendes", "Diego Ferreira", "Elena Costa",
    "Felipe Alves", "Gabriela Rocha", "Henrique Nunes", "Isabella Pereira", "João Oliveira",
    "Karen Silva", "Lucas Martins", "Mariana Souza", "Nicolas Barbosa", "Olivia Cardoso",
    "Paulo Ribeiro", "Raquel Gomes", "Sandro Azevedo", "Tatiana Cruz", "Victor Monteiro",
    "Wanda Torres", "Xavier Lima", "Yasmin Borges", "Zé Roberto Fonseca", "Amanda Freitas",
    "Bernardo Correia", "Cecília Lopes", "Danilo Nogueira", "Estela Vieira", "Fábio Machado",
    "Giovanna Pinto", "Hector Ramos", "Iara Bispo", "Júlio Fernandes", "Lara Cunha",
    "Márcio Cavalcanti", "Natalia Teixeira", "Otto Carvalho", "Priscila Duarte", "Rafael Mesquita",
  ];

  let candidateIdx = 0;
  const candidatesData: Array<{
    jobId: number;
    name: string;
    email: string;
    stage: string;
    source: string;
    appliedAt: Date;
    updatedAt: Date;
    notes?: string;
  }> = [];

  // Active open jobs - with many candidates in various stages
  for (const job of jobs.filter((j) => j.status === "open")) {
    const numCandidates = Math.floor(Math.random() * 8) + 3; // 3-10 candidates
    for (let i = 0; i < numCandidates && candidateIdx < candidateNames.length; i++) {
      const name = candidateNames[candidateIdx++];
      const stage = stages[Math.floor(Math.random() * 4)]; // mostly early stages
      const source = sources[Math.floor(Math.random() * sources.length)];
      const appliedDaysAgo = Math.floor(Math.random() * 20) + 1;
      const appliedAt = daysAgo(appliedDaysAgo);
      const updatedAt = daysAgo(Math.floor(appliedDaysAgo / 2));

      candidatesData.push({
        jobId: job.id,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".").replace(/[áàãâ]/g, "a").replace(/[éê]/g, "e").replace(/[íi]/g, "i").replace(/[óõô]/g, "o").replace(/[ú]/g, "u").replace(/[ç]/g, "c")}@email.com`,
        stage,
        source,
        appliedAt,
        updatedAt,
      });
    }
  }

  // Closed jobs - hired candidates (for metrics)
  for (const job of jobs.filter((j) => j.status === "closed")) {
    // 1-2 hired candidates
    const numHired = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numHired && candidateIdx < candidateNames.length; i++) {
      const name = candidateNames[candidateIdx++];
      const appliedAt = daysAgo(Math.floor(Math.random() * 30) + 60);
      const updatedAt = new Date(
        appliedAt.getTime() + (Math.floor(Math.random() * 30) + 15) * 24 * 60 * 60 * 1000
      );
      candidatesData.push({
        jobId: job.id,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".").replace(/[áàãâ]/g, "a").replace(/[éê]/g, "e").replace(/[íi]/g, "i").replace(/[óõô]/g, "o").replace(/[ú]/g, "u").replace(/[ç]/g, "c")}@email.com`,
        stage: "contratado",
        source: sources[Math.floor(Math.random() * sources.length)],
        appliedAt,
        updatedAt,
        notes: "Candidato aprovado e admitido.",
      });

      // Some rejected
      if (candidateIdx < candidateNames.length) {
        const rName = candidateNames[candidateIdx++];
        candidatesData.push({
          jobId: job.id,
          name: rName,
          email: `${rName.toLowerCase().replace(/\s+/g, ".").replace(/[áàãâ]/g, "a").replace(/[éê]/g, "e").replace(/[íi]/g, "i").replace(/[óõô]/g, "o").replace(/[ú]/g, "u").replace(/[ç]/g, "c")}@email.com`,
          stage: "reprovado",
          source: sources[Math.floor(Math.random() * sources.length)],
          appliedAt: daysAgo(Math.floor(Math.random() * 20) + 65),
          updatedAt: daysAgo(Math.floor(Math.random() * 10) + 45),
        });
      }
    }
  }

  if (candidatesData.length > 0) {
    await db.insert(candidatesTable).values(
      candidatesData.map((c) => ({
        jobId: c.jobId,
        name: c.name,
        email: c.email,
        stage: c.stage,
        source: c.source,
        appliedAt: c.appliedAt,
        updatedAt: c.updatedAt,
        notes: c.notes ?? null,
      }))
    );
  }
  console.log(`✓ ${candidatesData.length} candidates created`);

  // Benchmark data - salary by role, seniority, and Brazilian region
  const benchmarkData = [];
  const regions = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Porto Alegre, RS", "Brasília, DF", "Florianópolis, SC", "Recife, PE", "Salvador, BA", "Fortaleza, CE", "Região Sul", "Região Sudeste", "Região Norte", "Região Nordeste", "Região Centro-Oeste"];
  const roles = [
    { title: "Engenheiro de Software", seniority: "junior", min: 4000, median: 5500, max: 7000 },
    { title: "Engenheiro de Software", seniority: "pleno", min: 7000, median: 10000, max: 14000 },
    { title: "Engenheiro de Software", seniority: "senior", min: 12000, median: 17000, max: 24000 },
    { title: "Engenheiro de Software", seniority: "especialista", min: 18000, median: 25000, max: 35000 },
    { title: "Product Manager", seniority: "junior", min: 5000, median: 7000, max: 10000 },
    { title: "Product Manager", seniority: "pleno", min: 10000, median: 14000, max: 19000 },
    { title: "Product Manager", seniority: "senior", min: 16000, median: 22000, max: 30000 },
    { title: "Product Designer", seniority: "junior", min: 3500, median: 5000, max: 7000 },
    { title: "Product Designer", seniority: "pleno", min: 7000, median: 10000, max: 14000 },
    { title: "Product Designer", seniority: "senior", min: 12000, median: 17000, max: 23000 },
    { title: "Analista de Marketing", seniority: "junior", min: 2500, median: 3500, max: 5000 },
    { title: "Analista de Marketing", seniority: "pleno", min: 5000, median: 7000, max: 10000 },
    { title: "Analista de Marketing", seniority: "senior", min: 9000, median: 12000, max: 17000 },
    { title: "Gerente de Vendas", seniority: "gerente", min: 9000, median: 14000, max: 20000 },
    { title: "Account Executive", seniority: "pleno", min: 5000, median: 8000, max: 12000 },
    { title: "SDR", seniority: "junior", min: 2500, median: 3800, max: 5500 },
    { title: "Analista de RH", seniority: "pleno", min: 4000, median: 6000, max: 8500 },
    { title: "Analista Financeiro", seniority: "pleno", min: 5000, median: 7500, max: 10000 },
    { title: "Engenheiro de Dados", seniority: "pleno", min: 9000, median: 13000, max: 18000 },
    { title: "Engenheiro de Dados", seniority: "senior", min: 14000, median: 20000, max: 28000 },
    { title: "Tech Lead", seniority: "especialista", min: 18000, median: 26000, max: 38000 },
    { title: "Analista de QA", seniority: "pleno", min: 5000, median: 7500, max: 11000 },
    { title: "Scrum Master", seniority: "especialista", min: 9000, median: 13000, max: 18000 },
  ];

  // Regional multipliers
  const regionMultiplier: Record<string, number> = {
    "São Paulo, SP": 1.0,
    "Rio de Janeiro, RJ": 0.92,
    "Brasília, DF": 0.95,
    "Curitiba, PR": 0.88,
    "Porto Alegre, RS": 0.85,
    "Florianópolis, SC": 0.82,
    "Belo Horizonte, MG": 0.80,
    "Recife, PE": 0.70,
    "Salvador, BA": 0.68,
    "Fortaleza, CE": 0.65,
    "Região Sudeste": 0.90,
    "Região Sul": 0.85,
    "Região Centro-Oeste": 0.80,
    "Região Nordeste": 0.65,
    "Região Norte": 0.62,
  };

  for (const role of roles) {
    for (const region of regions) {
      const mult = regionMultiplier[region] ?? 1.0;
      benchmarkData.push({
        jobTitle: role.title,
        seniority: role.seniority,
        region,
        minSalary: String(Math.round(role.min * mult)),
        medianSalary: String(Math.round(role.median * mult)),
        maxSalary: String(Math.round(role.max * mult)),
        sampleSize: Math.floor(Math.random() * 200) + 50,
      });
    }
  }

  await db.insert(benchmarksTable).values(benchmarkData);
  console.log(`✓ ${benchmarkData.length} benchmark entries created`);

  // Pipeline stages
  await db
    .insert(pipelineStagesTable)
    .values([
      { name: "triagem", label: "Triagem", color: "border-slate-200 bg-slate-50", position: 1, isTerminal: false },
      { name: "entrevista_rh", label: "Entrevista RH", color: "border-indigo-200 bg-indigo-50", position: 2, isTerminal: false },
      { name: "entrevista_tecnica", label: "Entrevista Técnica", color: "border-blue-200 bg-blue-50", position: 3, isTerminal: false },
      { name: "proposta", label: "Proposta", color: "border-amber-200 bg-amber-50", position: 4, isTerminal: false },
      { name: "contratado", label: "Contratado", color: "border-emerald-200 bg-emerald-50", position: 5, isTerminal: true },
      { name: "reprovado", label: "Reprovado", color: "border-rose-200 bg-rose-50", position: 6, isTerminal: true },
    ])
    .onConflictDoNothing();
  console.log("✓ 6 pipeline stages created");

  // Company settings
  await db
    .insert(companySettingsTable)
    .values([
      { key: "charges_rate", value: "0.68" },
      { key: "working_days_per_month", value: "22" },
      { key: "company_name", value: "Empresa Demo" },
    ])
    .onConflictDoNothing();
  console.log("✓ Company settings seeded");

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
