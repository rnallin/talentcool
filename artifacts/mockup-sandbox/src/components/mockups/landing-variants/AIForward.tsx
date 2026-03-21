import React, { useEffect, useState, useRef } from "react";
import {
  MessageSquare,
  Sparkles,
  BarChart3,
  Users,
  Calculator,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  PieChart,
  Activity,
  Zap,
  Globe,
  Twitter,
  Linkedin,
  Github
} from "lucide-react";

export default function AIForward() {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});

  // Refs for intersection observer
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    demo: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    data: useRef<HTMLDivElement>(null),
    testimonial: useRef<HTMLDivElement>(null),
    cta: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  // Parallax helper
  const getParallaxStyle = (speed: number) => ({
    transform: `translateY(${scrollY * speed}px)`,
  });

  return (
    <div className="min-h-screen bg-white text-[#000402] overflow-hidden font-sans selection:bg-[#2d8a5e] selection:text-white">
      <style>{`
        @keyframes typing {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(45, 138, 94, 0.2); }
          50% { box-shadow: 0 0 40px rgba(45, 138, 94, 0.4); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        .animate-typing-1 { animation: typing 0.5s ease-out forwards; animation-delay: 0.5s; opacity: 0; }
        .animate-typing-2 { animation: typing 0.5s ease-out forwards; animation-delay: 1.5s; opacity: 0; }
        .animate-typing-3 { animation: typing 0.5s ease-out forwards; animation-delay: 2.5s; opacity: 0; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 7s ease-in-out infinite; animation-delay: 1s; }
        .chart-line { stroke-dasharray: 100; animation: drawLine 2s ease-out forwards; }
        .bg-dots { background-image: radial-gradient(circle, #2d8a5e 1px, transparent 1px); background-size: 24px 24px; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#145338] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-[#145338]">Talent Cool</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6A6E6C]">
            <a href="#features" className="hover:text-[#145338] transition-colors">Funcionalidades</a>
            <a href="#demo" className="hover:text-[#145338] transition-colors">Assistente IA</a>
            <a href="#data" className="hover:text-[#145338] transition-colors">Métricas</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-[#145338] hover:text-[#2d8a5e] transition-colors">
              Login
            </button>
            <button className="bg-[#145338] hover:bg-[#2d8a5e] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-[0_4px_14px_0_rgba(20,83,56,0.39)] hover:shadow-[0_6px_20px_rgba(45,138,94,0.23)]">
              Começar Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section id="hero" ref={sectionRefs.hero} className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden bg-gradient-to-b from-white to-[#f0fdf4]">
        {/* Parallax Background Shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full border border-[#2d8a5e]/20 blur-[1px]" style={getParallaxStyle(0.2)}></div>
        <div className="absolute top-40 right-20 w-96 h-96 rounded-full bg-[#2d8a5e]/5 blur-3xl" style={getParallaxStyle(0.5)}></div>
        <div className="absolute bottom-10 left-1/4 w-32 h-32 rounded-full border-[10px] border-[#145338]/5" style={getParallaxStyle(0.8)}></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#2d8a5e]/20 text-[#2d8a5e] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>O RH do futuro chegou</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Inteligência Artificial a serviço do seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#145338] to-[#2d8a5e]">RH</span>
            </h1>
            <p className="text-lg text-[#6A6E6C] mb-8 max-w-lg leading-relaxed">
              Gerencie vagas, simule custos e analise métricas com uma plataforma inteligente que pensa com você. Para PMEs que querem crescer rápido.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#145338] hover:bg-[#2d8a5e] text-white px-8 py-4 rounded-full text-base font-semibold transition-all shadow-[0_4px_14px_0_rgba(20,83,56,0.39)] hover:shadow-[0_6px_20px_rgba(45,138,94,0.23)] flex items-center justify-center gap-2 group">
                Experimente a IA
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white border-2 border-[#145338]/10 hover:border-[#2d8a5e]/30 text-[#145338] px-8 py-4 rounded-full text-base font-semibold transition-all flex items-center justify-center gap-2">
                Ver demonstração
              </button>
            </div>
            <div className="mt-10 flex items-center gap-4 text-sm text-[#97A09B]">
              <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" /> Setup rápido</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" /> Sem cartão</div>
            </div>
          </div>

          <div className="relative z-10 animate-float">
            <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_-12px_rgba(20,83,56,0.15)] border border-gray-100">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#145338] to-[#2d8a5e] flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Talent Cool AI</h3>
                    <p className="text-xs text-[#2d8a5e]">Online agora</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-3 animate-typing-1">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-sm font-medium">Você</div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-[#000402]">
                    Quantos candidatos temos para a vaga de dev frontend?
                  </div>
                </div>
                <div className="flex items-start gap-3 animate-typing-2">
                  <div className="w-8 h-8 rounded-full bg-[#145338] flex-shrink-0 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#f0fdf4] rounded-2xl rounded-tl-none px-4 py-3 text-sm text-[#145338] border border-[#2d8a5e]/20 shadow-sm">
                    Temos <strong>42 candidatos</strong> no total.<br/><br/>
                    • 25 em Triagem<br/>
                    • 12 em Entrevista<br/>
                    • 5 em Teste Técnico<br/><br/>
                    O tempo médio de contratação está em 14 dias. Deseja ver os currículos da fase de entrevista?
                  </div>
                </div>
                <div className="flex items-start gap-3 animate-typing-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-sm font-medium">Você</div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-[#000402]">
                    Sim, mostre os 3 com maior score.
                  </div>
                </div>
              </div>
              <div className="mt-8 relative">
                <div className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-4 text-sm text-[#97A09B] flex items-center justify-between">
                  <span>Digite sua pergunta...</span>
                  <div className="w-8 h-8 rounded-full bg-[#145338] flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI Demo Section */}
      <section id="demo" ref={sectionRefs.demo} className="py-24 px-6 relative bg-white">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-1000 transform ${visibleSections.demo ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pergunte qualquer coisa</h2>
            <p className="text-lg text-[#6A6E6C]">Nossa IA analisa seus dados em tempo real para responder perguntas complexas sobre seu recrutamento.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { q: "Qual o custo da vaga de gerente?", icon: Calculator },
              { q: "Mostre as métricas do mês", icon: BarChart3 },
              { q: "Quantos candidatos na fase de entrevista?", icon: Users },
              { q: "Gere um relatório de contratações", icon: Activity }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`group cursor-pointer bg-white border border-gray-200 hover:border-[#2d8a5e] p-6 rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(45,138,94,0.15)] transition-all duration-500 transform ${visibleSections.demo ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f0fdf4] group-hover:bg-[#145338] flex items-center justify-center transition-colors duration-300">
                      <item.icon className="w-5 h-5 text-[#2d8a5e] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="font-medium text-[#000402] group-hover:text-[#145338] transition-colors">{item.q}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#2d8a5e] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Platform Features */}
      <section id="features" ref={sectionRefs.features} className="py-32 px-6 relative bg-[#f8faf9] overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30" style={getParallaxStyle(0.1)}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className={`text-center max-w-3xl mx-auto mb-20 transition-all duration-1000 transform ${visibleSections.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Tudo que seu RH precisa</h2>
            <p className="text-lg text-[#6A6E6C]">Uma plataforma completa para atrair, avaliar e contratar os melhores talentos com eficiência.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Gestão de Vagas & Kanban",
                desc: "Crie vagas e gerencie candidatos em um funil visual intuitivo. Arraste e solte entre as fases de triagem a contratado.",
                icon: Users,
                delay: 0,
                parallaxSpeed: 0.05
              },
              {
                title: "Custo de Vagas (CoV)",
                desc: "Simule o impacto financeiro de vagas abertas. Calcule salários, encargos e perda de produtividade em tempo real.",
                icon: Calculator,
                delay: 100,
                parallaxSpeed: 0.1
              },
              {
                title: "Métricas & Dashboard",
                desc: "Tempo de contratação, custo por contratação e taxa de conversão. Dados claros para decisões estratégicas.",
                icon: BarChart3,
                delay: 200,
                parallaxSpeed: 0.07
              },
              {
                title: "Assistente de IA",
                desc: "Seu co-piloto de RH. Peça relatórios, resumos de currículos ou insights sobre o processo em linguagem natural.",
                icon: Sparkles,
                delay: 300,
                parallaxSpeed: 0.12
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className={`relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-[#2d8a5e]/50 transition-all duration-700 transform ${visibleSections.features ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                style={{ 
                  transitionDelay: `${feature.delay}ms`,
                  transform: visibleSections.features ? `translateY(${scrollY * feature.parallaxSpeed - 50}px)` : 'translateY(100px)',
                  boxShadow: `0 ${10 + (scrollY * 0.02)}px ${30 + (scrollY * 0.05)}px -10px rgba(20,83,56,0.1)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#f0fdf4] opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0fdf4] text-[#145338] flex items-center justify-center mb-6 border border-[#2d8a5e]/20">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-[#6A6E6C] leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Data Visualization */}
      <section id="data" ref={sectionRefs.data} className="py-24 px-6 bg-[#145338] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#2d8a5e] rounded-full blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 transform ${visibleSections.data ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Dados que fazem sentido</h2>
              <p className="text-[#97A09B] text-lg mb-8">
                Deixe o Excel de lado. O Talent Cool processa milhares de pontos de dados para entregar métricas prontas para sua diretoria.
              </p>
              <ul className="space-y-4">
                {[
                  "Acompanhamento em tempo real",
                  "Gráficos interativos",
                  "Exportação em 1 clique",
                  "Previsibilidade de contratações"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2d8a5e]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" />
                    </div>
                    <span className="text-[#f8faf9]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`relative transition-all duration-1000 delay-300 transform ${visibleSections.data ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              {/* Mock Dashboard */}
              <div className="bg-[#0a3120] rounded-2xl p-6 border border-[#2d8a5e]/30 shadow-2xl backdrop-blur-sm relative animate-float">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-semibold text-lg">Visão Geral</h4>
                  <div className="px-3 py-1 bg-[#2d8a5e]/20 rounded-full text-xs text-[#2d8a5e] font-medium">Este mês</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#145338]/50 p-4 rounded-xl border border-[#2d8a5e]/20">
                    <p className="text-[#97A09B] text-xs mb-1">Tempo de Contratação</p>
                    <p className="text-2xl font-bold">14 dias <span className="text-xs text-[#2d8a5e] font-normal ml-2">↓ 2 dias</span></p>
                  </div>
                  <div className="bg-[#145338]/50 p-4 rounded-xl border border-[#2d8a5e]/20">
                    <p className="text-[#97A09B] text-xs mb-1">Custo Médio</p>
                    <p className="text-2xl font-bold">R$ 1.2k <span className="text-xs text-[#2d8a5e] font-normal ml-2">↓ 15%</span></p>
                  </div>
                </div>

                <div className="h-40 border-l border-b border-[#2d8a5e]/30 relative flex items-end">
                  {/* SVG Line Chart */}
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path 
                      d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10" 
                      fill="none" 
                      stroke="#2d8a5e" 
                      strokeWidth="2"
                      className={visibleSections.data ? "chart-line" : ""}
                    />
                    <path 
                      d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10 L100,100 L0,100 Z" 
                      fill="url(#gradient)" 
                      opacity="0.2"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2d8a5e" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonial */}
      <section id="testimonial" ref={sectionRefs.testimonial} className="py-24 px-6 relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-20" style={getParallaxStyle(0.3)}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#145338] to-[#2d8a5e] mx-auto mb-8 p-1 shadow-xl">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-[#145338]">
              MS
            </div>
          </div>
          <blockquote className="text-2xl md:text-4xl font-medium leading-tight mb-8 text-[#000402]">
            "A capacidade do Talent Cool de calcular o custo das vagas e me dar respostas na hora mudou como apresento resultados para a diretoria. Não é só um ATS, é inteligência de negócio."
          </blockquote>
          <div>
            <div className="font-bold text-lg">Mariana Silva</div>
            <div className="text-[#6A6E6C]">Diretora de RH na TechPME</div>
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section id="cta" ref={sectionRefs.cta} className="py-24 px-6 bg-[#f0fdf4]">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-10 md:p-16 shadow-[0_20px_50px_-12px_rgba(20,83,56,0.1)] border border-[#2d8a5e]/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#145338]/5 to-[#2d8a5e]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Experimente a IA do Talent Cool</h2>
          <p className="text-lg text-[#6A6E6C] mb-10 max-w-2xl mx-auto relative z-10">
            Junte-se a centenas de empresas que estão modernizando seus processos seletivos. Comece agora, sem compromisso.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto relative z-10" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Seu e-mail profissional" 
              className="flex-1 px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:border-[#2d8a5e] focus:ring-2 focus:ring-[#2d8a5e]/20 transition-all"
            />
            <button className="bg-[#145338] hover:bg-[#2d8a5e] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
              Começar Grátis
            </button>
          </form>
          
          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-[#6A6E6C] relative z-10">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" /> Grátis por 14 dias</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" /> Sem cartão de crédito</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2d8a5e]" /> Setup em 5 minutos</div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#145338] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-[#145338]">Talent Cool</span>
            </div>
            <p className="text-[#6A6E6C] max-w-sm mb-6">
              A plataforma de RH inteligente para empresas que querem contratar melhor, mais rápido e com previsibilidade.
            </p>
            <div className="flex items-center gap-4 text-[#97A09B]">
              <a href="#" className="hover:text-[#145338] transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-[#145338] transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-[#145338] transition-colors"><Github className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3 text-sm text-[#6A6E6C]">
              <li><a href="#" className="hover:text-[#145338] transition-colors">Kanban de Vagas</a></li>
              <li><a href="#" className="hover:text-[#145338] transition-colors">Calculadora CoV</a></li>
              <li><a href="#" className="hover:text-[#145338] transition-colors">Dashboard de Métricas</a></li>
              <li><a href="#" className="hover:text-[#145338] transition-colors">Assistente IA</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm text-[#6A6E6C]">
              <li><a href="#" className="hover:text-[#145338] transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-[#145338] transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-[#145338] transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-[#145338] transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#97A09B]">
          <p>© {new Date().getFullYear()} Talent Cool. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span>Português (Brasil)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
