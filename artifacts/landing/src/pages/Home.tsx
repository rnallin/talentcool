import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart3,
  Calculator,
  KanbanSquare,
  Bot,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Clock,
  Users,
  Building2,
  ChevronRight,
  Menu,
  X,
  Star,
  Zap,
  Briefcase,
  LineChart,
} from 'lucide-react';

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
}

function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        if (ref.current) observer.unobserve(ref.current);
      }
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return [ref, isIntersecting] as const;
}

function useAnimatedNumber(end: number, duration: number = 2000, startAnimating: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnimating) return;
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration, startAnimating]);

  return count;
}

const AnimatedCounter = ({ end, prefix = "", suffix = "", duration = 2000, trigger = true }: { end: number; prefix?: string; suffix?: string; duration?: number; trigger?: boolean }) => {
  const count = useAnimatedNumber(end, duration, trigger);
  return <span>{prefix}{count.toLocaleString('pt-BR')}{suffix}</span>;
};

const SocialProofNumber = ({ end, prefix, suffix }: { end: number; prefix?: string; suffix?: string }) => {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <span ref={ref}>
      <AnimatedCounter end={end} prefix={prefix} suffix={suffix} trigger={isVisible} />
    </span>
  );
};

const FadeInSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const scrollY = useScrollPosition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#000402] font-['Inter',sans-serif] overflow-hidden selection:bg-[#2d8a5e] selection:text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#145338]/95 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#2d8a5e] flex items-center justify-center">
                <BarChart3 className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">Talent Cool</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#funcionalidades" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Funcionalidades</a>
              <a href="#calculadora" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Calculadora CoV</a>
              <a href="#metricas" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Resultados</a>
              <a href="#depoimentos" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Depoimentos</a>
              <a href="#precos" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Precos</a>
              <button className="bg-[#2d8a5e] hover:bg-[#2d8a5e]/90 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-[#2d8a5e]/20 hover:shadow-[#2d8a5e]/40 hover:-translate-y-0.5">
                Comece gratis
              </button>
            </div>
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-[#145338] border-t border-white/10 p-4 absolute w-full shadow-2xl">
            <div className="flex flex-col space-y-3">
              <a href="#funcionalidades" onClick={() => setIsMenuOpen(false)} className="text-white font-medium px-4 py-2 hover:bg-white/10 rounded-lg">Funcionalidades</a>
              <a href="#calculadora" onClick={() => setIsMenuOpen(false)} className="text-white font-medium px-4 py-2 hover:bg-white/10 rounded-lg">Calculadora CoV</a>
              <a href="#precos" onClick={() => setIsMenuOpen(false)} className="text-white font-medium px-4 py-2 hover:bg-white/10 rounded-lg">Precos</a>
              <button className="bg-[#2d8a5e] text-white px-6 py-3 rounded-full font-medium mt-2">Comece gratis</button>
            </div>
          </div>
        )}
      </nav>

      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-gradient-to-b from-[#145338] to-[#0a2e1f] overflow-hidden">
        <div
          className="absolute top-20 left-10 w-64 h-64 bg-[#2d8a5e]/20 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-[#2d8a5e]/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.7}px)` }}
        />
        <div
          className="absolute top-[40%] left-[60%] w-48 h-48 bg-[#2d8a5e]/15 rounded-full blur-2xl"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 font-medium text-sm mb-8 border border-white/20">
                <Zap className="w-4 h-4" />
                <span>Plataforma de RH para PMEs</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                Sua equipe de RH em um <span className="text-[#2d8a5e]">painel inteligente</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
                Centralize vagas, reduza custos de contratacao e tome decisoes baseadas em dados com a plataforma de recrutamento feita para PMEs brasileiras.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto bg-[#2d8a5e] hover:bg-white hover:text-[#145338] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl shadow-[#2d8a5e]/30 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 group">
                  Comece agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                  <Bot className="w-5 h-5" />
                  Falar com IA
                </button>
              </div>
            </FadeInSection>
          </div>

          <FadeInSection delay={200}>
            <div
              className="relative mx-auto max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-gray-100"
              style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            >
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-md border border-gray-200 text-sm font-medium text-gray-500">
                  <Building2 className="w-4 h-4" />
                  Acme Corp PME
                </div>
              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  {[
                    { label: "Vagas Abertas", value: 12, icon: KanbanSquare, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Tempo Medio", value: 18, suffix: " dias", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Custo por Vaga", value: 2450, prefix: "R$ ", icon: TrendingDown, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Candidatos", value: 342, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold text-[#000402]">
                        <AnimatedCounter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="col-span-1 md:col-span-3 bg-gray-50/50 rounded-xl border border-gray-100 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Pipeline: Desenvolvedor Front-end</h3>
                    <button className="text-sm text-[#2d8a5e] font-medium hover:underline">Ver todas</button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { title: "Triagem", count: 24, color: "bg-gray-200" },
                      { title: "Entrevista", count: 8, color: "bg-blue-200" },
                      { title: "Proposta", count: 2, color: "bg-amber-200" },
                    ].map((col, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase">{col.title}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{col.count}</span>
                        </div>
                        <div className="h-16 bg-white border border-gray-100 rounded shadow-sm p-2 relative overflow-hidden group hover:border-[#2d8a5e] transition-colors cursor-pointer">
                          <div className={`absolute top-0 left-0 w-1 h-full ${col.color}`}></div>
                          <div className="w-2/3 h-2 bg-gray-200 rounded mb-2 ml-2"></div>
                          <div className="w-1/2 h-2 bg-gray-100 rounded ml-2"></div>
                        </div>
                        {i === 0 && (
                          <div className="h-16 bg-white border border-gray-100 rounded shadow-sm p-2 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${col.color}`}></div>
                            <div className="w-3/4 h-2 bg-gray-200 rounded mb-2 ml-2"></div>
                            <div className="w-1/3 h-2 bg-gray-100 rounded ml-2"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-[#145338] to-[#0a2e1f] rounded-xl p-5 text-white shadow-inner flex flex-col relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  <div className="flex items-center gap-2 mb-4">
                    <Bot className="w-5 h-5 text-[#2d8a5e]" />
                    <h3 className="font-semibold text-white/90">Assistente IA</h3>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 mb-3 text-sm text-white/80">
                    "Qual o custo de vacancia atual da vaga de Vendas?"
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-sm text-white border border-white/5 backdrop-blur-sm">
                    <p className="mb-2">O CoV atual e de <strong className="text-[#2d8a5e]">R$ 4.250/mes</strong>. Recomendo acelerar a fase de entrevistas.</p>
                    <div className="flex gap-1 mt-2">
                      <span className="inline-block w-2 h-2 bg-[#2d8a5e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-[#2d8a5e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="inline-block w-2 h-2 bg-[#2d8a5e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="py-10 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
            Confiado por mais de 500+ empresas
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {[
              { icon: Zap, name: "BoltInc" },
              { icon: Briefcase, name: "Nexus" },
              { icon: BarChart3, name: "MetricsOS" },
              { icon: LineChart, name: "GrowTech" },
              { icon: Users, name: "PeopleFirst" },
            ].map((logo, i) => (
              <div key={i} className="flex items-center gap-2 font-bold text-xl text-gray-800">
                <logo.icon className="w-6 h-6" />
                {logo.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <FadeInSection>
              <h2 className="text-sm font-bold tracking-widest text-[#2d8a5e] uppercase mb-3">Tudo que voce precisa</h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-[#000402] mb-4">A plataforma completa para atrair e reter talentos</h3>
              <p className="text-[#6A6E6C] text-lg">Substitua planilhas confusas por um processo claro, visual e orientado a dados.</p>
            </FadeInSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: KanbanSquare,
                title: "Gestao de Vagas & Pipeline Kanban",
                desc: "Crie vagas em segundos e mova candidatos atraves de um funil visual intuitivo (Triagem, Entrevista, Proposta, Contratado).",
                delay: 0,
              },
              {
                icon: Calculator,
                title: "Calculadora de Custo de Vagas (CoV)",
                desc: "Simulador financeiro que calcula o impacto real de posicoes abertas considerando salario, encargos e produtividade perdida.",
                delay: 100,
              },
              {
                icon: BarChart3,
                title: "Metricas & Dashboard de RH",
                desc: "Visualizacoes em tempo real: tempo de contratacao, custo por contratacao e eficiencia do pipeline.",
                delay: 200,
              },
              {
                icon: Bot,
                title: "Assistente IA Integrado",
                desc: "Faca perguntas em linguagem natural sobre metricas, candidatos e custos. Obtenha respostas instantaneas.",
                delay: 300,
              },
            ].map((feature, i) => (
              <FadeInSection key={i} delay={feature.delay}>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group h-full">
                  <div className="w-14 h-14 bg-[#145338]/5 text-[#145338] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#2d8a5e] group-hover:text-white transition-colors duration-300">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-[#000402] mb-3">{feature.title}</h4>
                  <p className="text-[#6A6E6C] leading-relaxed">{feature.desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="calculadora" className="py-24 bg-white relative overflow-hidden">
        <div
          className="absolute right-0 top-0 w-[800px] h-[800px] bg-gradient-to-bl from-gray-50 to-white border border-gray-100 rounded-full opacity-50 -z-10"
          style={{ transform: `translate(20%, ${scrollY * 0.1 - 200}px)` }}
        />
        <div
          className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-[#145338]/5 rounded-full blur-3xl -z-10"
          style={{ transform: `translate(-30%, ${-scrollY * 0.05}px)` }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <FadeInSection>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-sm mb-6">
                  <TrendingDown className="w-4 h-4" />
                  Pare de perder dinheiro
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-[#000402] mb-6 leading-tight">
                  Sabe quanto custa uma vaga aberta?
                </h2>
                <p className="text-[#6A6E6C] text-lg mb-8 leading-relaxed">
                  Nossa Calculadora de Custo de Vacancia (CoV) mostra o impacto financeiro exato de posicoes nao preenchidas, somando salarios, encargos e a produtividade que sua empresa esta perdendo a cada dia.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    "Simulacoes baseadas em dados de mercado reais",
                    "Calculo automatico de encargos trabalhistas (CLT)",
                    "Fator de produtividade ajustavel por senioridade",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#2d8a5e] shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="text-[#145338] font-bold text-lg flex items-center gap-2 hover:text-[#2d8a5e] transition-colors group">
                  Testar calculadora gratuitamente
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </FadeInSection>
            </div>

            <div className="lg:w-1/2 w-full">
              <FadeInSection delay={200}>
                <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2d8a5e]/20 to-transparent rounded-tr-2xl rounded-bl-full opacity-50"></div>

                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">Simulador de CoV</h4>
                      <p className="text-sm text-gray-500">Engenheiro de Software Senior</p>
                    </div>
                    <Calculator className="text-[#2d8a5e] w-8 h-8 opacity-50" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">Salario Base (Mensal)</span>
                        <span className="font-bold">R$ 12.000</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#145338] h-2 rounded-full w-[60%]"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">Dias em Aberto</span>
                        <span className="font-bold">45 dias</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-amber-400 h-2 rounded-full w-[45%]"></div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                        <p className="text-sm font-semibold text-red-600 mb-1 uppercase tracking-wider">Custo Total Estimado</p>
                        <div className="text-4xl font-black text-red-700">
                          R$ 38.450<span className="text-xl text-red-500/70 font-bold">,00</span>
                        </div>
                        <p className="text-xs text-red-500 mt-2">*Inclui encargos (68%) e fator de produtividade (1.5x)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>

      <section id="metricas" className="py-20 bg-[#145338]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              { label: "Empresas ativas", value: 500, suffix: "+" },
              { label: "Contratacoes", value: 10000, suffix: "+" },
              { label: "Tempo Medio (SLA)", value: 32, suffix: "d" },
              { label: "Reducao de Custos", value: 40, suffix: "%" },
            ].map((stat, i) => (
              <div key={i} className="text-center py-6 md:py-0">
                <FadeInSection delay={i * 100}>
                  <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                    <SocialProofNumber end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-[#2d8a5e] font-medium text-lg">{stat.label}</p>
                </FadeInSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="depoimentos" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <FadeInSection>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#000402] mb-4">O que dizem os lideres de RH</h2>
              <p className="text-[#6A6E6C] text-lg">Empresas que transformaram seus processos seletivos com o Talent Cool.</p>
            </FadeInSection>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "O modulo de custos de vagas nos fez perceber o quanto perdiamos com processos lentos. Reduzimos nosso time-to-hire em 14 dias no primeiro trimestre.",
                name: "Carla Mendes",
                role: "CHRO @ TechGrowth",
              },
              {
                quote: "O Assistente IA e incrivel. Responde perguntas sobre metricas em segundos, sem precisar navegar por dashboards. Minha equipe adora.",
                name: "Roberto Silva",
                role: "Diretor de Talentos @ FinancePro",
              },
              {
                quote: "O Pipeline Kanban e o mais intuitivo que ja usei. Minha equipe de recrutadores abandonou as planilhas no primeiro dia de uso.",
                name: "Amanda Costa",
                role: "Head de Recrutamento @ RetailMax",
              },
            ].map((t, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="flex gap-1 mb-6 text-amber-400">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-[#000402] text-lg mb-8 flex-grow leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#145338] to-[#2d8a5e] flex items-center justify-center text-white font-bold text-lg">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[#000402]">{t.name}</div>
                      <div className="text-sm text-[#6A6E6C]">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="precos" className="py-24 bg-white relative">
        <div
          className="absolute left-[10%] top-[20%] w-[500px] h-[500px] bg-[#145338]/3 rounded-full blur-[100px] -z-10"
          style={{ transform: `translateY(${scrollY * 0.05 - 400}px)` }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <FadeInSection>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#000402] mb-4">Planos Simples e Transparentes</h2>
              <p className="text-[#6A6E6C] text-lg">Sem taxas escondidas. Escolha o plano ideal para o momento da sua empresa.</p>
            </FadeInSection>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeInSection>
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-md h-full">
                <h3 className="text-2xl font-bold mb-2 text-[#000402]">Starter</h3>
                <p className="text-[#6A6E6C] mb-6">Para times pequenos estruturando o RH.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-[#000402]">R$ 297</span>
                  <span className="text-[#6A6E6C]">/mes</span>
                </div>
                <button className="w-full border-2 border-[#145338] text-[#145338] hover:bg-[#145338] hover:text-white px-6 py-3 rounded-full font-bold transition-all duration-300 mb-8">
                  Testar Gratis por 14 dias
                </button>
                <ul className="space-y-4">
                  {['Ate 10 vagas ativas', 'Pipeline Kanban', 'Metricas basicas', 'Suporte por email'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#6A6E6C]">
                      <CheckCircle2 className="w-5 h-5 text-[#2d8a5e]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>

            <FadeInSection delay={100}>
              <div className="bg-white rounded-2xl p-8 border-2 border-[#145338] shadow-xl relative transform md:-translate-y-4 h-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#145338] to-[#2d8a5e] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  MAIS POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-2 text-[#000402]">Pro</h3>
                <p className="text-[#6A6E6C] mb-6">Para empresas em rapido crescimento.</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-[#000402]">R$ 597</span>
                  <span className="text-[#6A6E6C]">/mes</span>
                </div>
                <button className="w-full bg-[#145338] hover:bg-[#0a2e1f] text-white px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-lg mb-8">
                  Comecar Agora
                </button>
                <ul className="space-y-4">
                  {['Vagas ilimitadas', 'Modulo de Custos Avancado', 'Calculadora CoV', 'Assistente IA', 'Integracoes via API', 'Suporte prioritario'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#000402] font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#2d8a5e]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#000402] mb-6">
              Pronto para modernizar seu RH?
            </h2>
            <p className="text-[#6A6E6C] text-xl mb-10 max-w-2xl mx-auto">
              Junte-se a centenas de PMEs que ja automatizaram seus processos seletivos e reduziram custos de contratacao.
            </p>

            <form className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3 mb-12" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Seu e-mail corporativo"
                className="flex-1 px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2d8a5e] focus:border-transparent text-lg shadow-sm"
                required
              />
              <button
                type="submit"
                className="bg-[#145338] hover:bg-[#0a2e1f] text-white px-8 py-4 rounded-full font-bold text-lg transition-colors shadow-lg"
              >
                Comece gratis
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-[#6A6E6C]">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" /> Gratis por 14 dias</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" /> Sem cartao de credito</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" /> Setup em 5 minutos</span>
            </div>
          </FadeInSection>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#145338] flex items-center justify-center">
                <BarChart3 className="text-white w-3 h-3" />
              </div>
              <span className="text-xl font-bold text-[#145338] tracking-tight">Talent Cool</span>
            </div>

            <div className="flex gap-8 text-sm text-[#6A6E6C] font-medium">
              <a href="#" className="hover:text-[#145338] transition-colors">Termos</a>
              <a href="#" className="hover:text-[#145338] transition-colors">Privacidade</a>
              <a href="#" className="hover:text-[#145338] transition-colors">Contato</a>
            </div>

            <p className="text-sm text-[#97A09B]">
              &copy; {new Date().getFullYear()} Talent Cool. Feito no Brasil.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
