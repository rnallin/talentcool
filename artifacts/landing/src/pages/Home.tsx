import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight, 
  LineChart, 
  Users, 
  Zap,
  Star,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#70709F] to-[#AC69A8] rounded-xl flex items-center justify-center shadow-lg shadow-[#70709F]/20">
                <Briefcase className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">TalentOS</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
              <a href="#metrics" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Resultados</a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Depoimentos</a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Preços</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="font-semibold">Login</Button>
              <Button>Começar Grátis</Button>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-foreground p-2">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-b border-border p-4 absolute w-full shadow-2xl">
            <div className="flex flex-col space-y-4">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="font-medium px-4 py-2 hover:bg-muted rounded-lg">Funcionalidades</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="font-medium px-4 py-2 hover:bg-muted rounded-lg">Preços</a>
              <Button className="w-full mt-4">Começar Grátis</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#70709F]/8 blur-[100px]" />
          <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] rounded-full bg-[#AC69A8]/8 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8 border border-primary/20">
              <Zap className="w-4 h-4" />
              <span>O Futuro do Recrutamento</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              Contrate os melhores <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#70709F] to-[#AC69A8]">talentos com inteligência</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Nossa plataforma de RH guiada por dados automatiza tarefas, encontra os melhores candidatos e reduz o custo das suas vagas em até 40%.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto group">
                Começar Agora 
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver Demonstração
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#70709F] to-[#AC69A8] rounded-3xl blur opacity-15" />
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-mockup.png`} 
              alt="Dashboard TalentOS" 
              className="relative rounded-3xl shadow-2xl border border-border/50 bg-background w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
            Confiado por mais de 500+ empresas e equipes de vendas
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Fake logos using icons for aesthetic */}
            <div className="flex items-center gap-2 font-display font-bold text-xl"><Zap className="w-6 h-6"/> BoltInc</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl"><Briefcase className="w-6 h-6"/> Nexus</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl"><BarChart3 className="w-6 h-6"/> MetricsOS</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl"><LineChart className="w-6 h-6"/> GrowTech</div>
            <div className="flex items-center gap-2 font-display font-bold text-xl"><Users className="w-6 h-6"/> PeopleFirst</div>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Descubra como o TalentOS funciona</h2>
            <p className="text-muted-foreground text-lg">Processo simples em 3 etapas para preencher posições produtivas vazias mais rápido do que nunca.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 -z-10" />

            {[
              {
                step: "1",
                title: "Publique Vagas",
                desc: "Distribuição em dezenas de portais e captura automática de candidatos no seu funil.",
                icon: Briefcase
              },
              {
                step: "2",
                title: "Pipeline Kanban",
                desc: "Arraste e solte candidatos, avalie skills com IA e comunique-se com facilidade.",
                icon: Users
              },
              {
                step: "3",
                title: "Decida com Dados",
                desc: "Métricas de tempo de contratação, custo por vaga e performance da equipe.",
                icon: BarChart3
              }
            ].map((s, i) => (
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                key={i} 
                className="bg-card rounded-3xl p-8 border border-border shadow-lg shadow-black/5 relative hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary border border-primary/20">
                  <s.icon className="w-8 h-8" />
                </div>
                <div className="absolute top-8 right-8 text-5xl font-black text-muted/50 -z-10 select-none">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics Highlights */}
      <section id="metrics" className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#70709F] via-[#70709F] to-[#443334]" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">500+</div>
              <div className="text-primary-foreground/80 font-medium">Empresas Ativas</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">10k+</div>
              <div className="text-primary-foreground/80 font-medium">Contratações</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">32d</div>
              <div className="text-primary-foreground/80 font-medium">Tempo Médio (SLA)</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">40%</div>
              <div className="text-primary-foreground/80 font-medium">Redução de Custos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Features */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-primary font-medium text-sm mb-6">
                Gestão de Vagas
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Pipeline Kanban Inteligente</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Visualize todo o processo de recrutamento de forma clara. Mova candidatos entre etapas, agende entrevistas e envie propostas com poucos cliques.
              </p>
              <ul className="space-y-4">
                {['Filtros avançados e pontuação automática', 'Integração com calendários (Google/Outlook)', 'Templates de e-mail e mensagens'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#70709F]/15 rounded-3xl blur-2xl transform translate-x-4 translate-y-4" />
                <img 
                  src={`${import.meta.env.BASE_URL}images/pipeline-mockup.png`} 
                  alt="Pipeline Kanban" 
                  className="relative rounded-3xl border border-border shadow-xl w-full"
                />
              </div>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-primary font-medium text-sm mb-6">
                Analytics & ROI
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Métricas de Performance e Custos</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Entenda exatamente para onde vai o seu orçamento. Calcule o custo de oportunidade de vagas abertas e identifique gargalos no seu funil.
              </p>
              <ul className="space-y-4">
                {['Dashboards de custo por vaga em tempo real', 'Scorecard completo por recrutador', 'Análise de fontes de contratação (Source of Hire)'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#AC69A8]/15 rounded-3xl blur-2xl transform -translate-x-4 translate-y-4" />
                <img 
                  src={`${import.meta.env.BASE_URL}images/metrics-mockup.png`} 
                  alt="Métricas e Custos" 
                  className="relative rounded-3xl border border-border shadow-xl w-full"
                />
              </div>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-primary font-medium text-sm mb-6">
                Estratégia
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Benchmarking Salarial Preciso</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Pare de perder talentos por ofertas não competitivas. Compare seus salários internos com dados atualizados do mercado por região e senioridade.
              </p>
              <ul className="space-y-4">
                {['Faixas salariais (P10 ao P90)', 'Índices de variação regional', 'Comparativo visual do seu salário interno vs mercado'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#70709F]/15 rounded-3xl blur-2xl transform translate-x-4 -translate-y-4" />
                <img 
                  src={`${import.meta.env.BASE_URL}images/benchmark-mockup.png`} 
                  alt="Benchmarking Salarial" 
                  className="relative rounded-3xl border border-border shadow-xl w-full"
                />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O que dizem os líderes de RH</h2>
            <p className="text-muted-foreground text-lg">Empresas que transformaram seus processos seletivos com o TalentOS.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "O módulo de custos de vagas nos fez perceber o quanto perdíamos com processos lentos. Reduzimos nosso time-to-hire em 14 dias no primeiro trimestre.",
                name: "Carla Mendes",
                role: "CHRO @ TechGrowth",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
              },
              {
                quote: "A funcionalidade de Benchmarking é fantástica. Agora temos segurança para fazer ofertas certeiras e nossa taxa de aceitação subiu para 92%.",
                name: "Roberto Silva",
                role: "Diretor de Talentos @ FinancePro",
                img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop"
              },
              {
                quote: "O Pipeline Kanban é o mais intuitivo que já usei. Minha equipe de recrutadores abandonou as planilhas no primeiro dia de uso.",
                name: "Amanda Costa",
                role: "Head de Recrutamento @ RetailMax",
                img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
              }
            ].map((t, i) => (
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                key={i} 
                className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col h-full"
              >
                <div className="flex gap-1 mb-6 text-amber-400">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-foreground text-lg mb-8 flex-grow">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  {/* Testimonial avatar */}
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                  <div>
                    <div className="font-bold text-foreground">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos Simples e Transparentes</h2>
            <p className="text-muted-foreground text-lg">Sem taxas escondidas. Escolha o plano ideal para o momento da sua empresa.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-md">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground mb-6">Para times pequenos estruturando o RH.</p>
              <div className="mb-8">
                <span className="text-4xl font-black">R$ 297</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <Button variant="outline" size="lg" className="w-full mb-8">Testar Grátis por 14 dias</Button>
              <ul className="space-y-4">
                {['Até 10 vagas ativas', 'Pipeline Kanban', 'Métricas básicas', 'Suporte por email'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-card rounded-3xl p-8 border-2 border-primary shadow-xl relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#70709F] to-[#AC69A8] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                MAIS POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">Para empresas em rápido crescimento.</p>
              <div className="mb-8">
                <span className="text-4xl font-black">R$ 597</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <Button size="lg" className="w-full mb-8">Começar Agora</Button>
              <ul className="space-y-4">
                {['Vagas ilimitadas', 'Módulo de Custos Avançado', 'Benchmarking Salarial', 'Scorecard de Recrutadores', 'Integrações via API', 'Suporte prioritário'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#70709F]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#70709F] via-[#5A5F5B] to-[#030504]" />
        {/* Abstract pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para revolucionar seu RH?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já otimizaram suas contratações. Configure seu workspace em menos de 10 minutos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="white" size="lg" className="w-full sm:w-auto font-bold text-primary">
              Criar Conta Gratuita
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 hover:text-white">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border pt-16 pb-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="text-white w-4 h-4" />
              </div>
              <span className="font-display font-bold text-xl">TalentOS</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              A plataforma definitiva para times de recrutamento de alta performance.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Produto</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Funcionalidades</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Recursos</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Guias e E-books</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Calculadora de Custos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Parceiros</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 TalentOS Tecnologia. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Termos de Uso</a>
            <a href="#" className="hover:text-foreground">Privacidade</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
