import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  DollarSign, 
  TrendingDown, 
  LayoutDashboard, 
  Calculator, 
  BarChart3, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function ProblemSolution() {
  const [scrollY, setScrollY] = useState(0);
  const [moneyLost, setMoneyLost] = useState(45000);
  const [roiAmount, setRoiAmount] = useState(0);
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  
  // Refs for intersection observer
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const beforeAfterRef = useRef<HTMLDivElement>(null);
  const roiRef = useRef<HTMLDivElement>(null);

  // Scroll handler for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Real-time money lost counter
  useEffect(() => {
    const interval = setInterval(() => {
      setMoneyLost(prev => prev + (Math.random() * 5 + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for fade-ins and ROI counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
            
            // Trigger ROI counter when ROI section is visible
            if (entry.target.id === 'roi-section') {
              let start = 0;
              const end = 180000;
              const duration = 2000;
              const startTime = performance.now();
              
              const updateCounter = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                
                setRoiAmount(Math.floor(end * easeOutQuart));
                
                if (progress < 1) {
                  requestAnimationFrame(updateCounter);
                }
              };
              requestAnimationFrame(updateCounter);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const refs = [problemRef, solutionRef, beforeAfterRef, roiRef];
    refs.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      refs.forEach(ref => {
        if (ref.current) observer.unobserve(ref.current);
      });
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate timeline progress based on scroll
  const timelineProgress = Math.min(Math.max((scrollY - 1000) / 800, 0), 1) * 100;

  return (
    <div className="min-h-screen bg-white text-[#000402] font-['Inter',sans-serif] overflow-hidden selection:bg-[#2d8a5e] selection:text-white">
      
      {/* Scroll Progress Indicator */}
      <div className="fixed left-0 top-0 bottom-0 w-1 bg-gray-100 z-50">
        <div 
          className="w-full bg-[#2d8a5e]"
          style={{ height: `${(scrollY / (document.body.scrollHeight - window.innerHeight)) * 100}%` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #145338 1px, transparent 0)',
            backgroundSize: '40px 40px',
            transform: `translateY(${scrollY * 0.2}px)`
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 font-medium text-sm border border-red-100 mb-8 animate-pulse">
            <AlertTriangle size={16} />
            <span>Alerta de Custo Invisível</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Cada vaga aberta custa <br/>
            <span className="text-red-500 block mt-4 font-mono transition-all duration-300">
              {formatCurrency(moneyLost)}
            </span>
            para sua empresa.
          </h1>
          
          <p className="text-xl md:text-2xl text-[#6A6E6C] max-w-2xl mx-auto font-light">
            Descubra quanto sua empresa está perdendo todos os dias — e como estancar esse sangramento financeiro hoje mesmo.
          </p>
          
          <div className="pt-8">
            <button className="group relative inline-flex items-center justify-center gap-3 bg-[#145338] text-white px-8 py-4 rounded-xl text-lg font-bold overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_20px_40px_-15px_rgba(20,83,56,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(20,83,56,0.7)]">
              <span className="absolute inset-0 bg-gradient-to-r from-[#2d8a5e] to-[#145338] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">Calcular meu prejuízo</span>
              <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-sm text-[#97A09B]">Leva menos de 2 minutos. 100% gratuito.</p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section 
        id="problem-section" 
        ref={problemRef}
        className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#145338]">
              O problema que ninguém vê (mas o financeiro sente)
            </h2>
            <p className="text-xl text-[#6A6E6C]">
              Enquanto você preenche planilhas, os custos ocultos de uma posição vazia corroem sua margem de lucro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-10 h-10 text-orange-500" />,
                title: "Tempo Perdido",
                desc: "Média de 42 dias para fechar uma vaga complexa. Cada dia é receita não gerada.",
                delay: "0ms",
                speed: 0.1
              },
              {
                icon: <DollarSign className="w-10 h-10 text-red-500" />,
                title: "Custo Acumulado",
                desc: "Equipe sobrecarregada fazendo horas extras e pagando taxas altíssimas para headhunters.",
                delay: "100ms",
                speed: 0.2
              },
              {
                icon: <TrendingDown className="w-10 h-10 text-purple-500" />,
                title: "Produtividade em Queda",
                desc: "O moral da equipe cai, o burnout aumenta, gerando um ciclo vicioso de turnover.",
                delay: "200ms",
                speed: 0.3
              }
            ].map((item, i) => (
              <div 
                key={i}
                className={`bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-1000 transform ${
                  isVisible['problem-section'] ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'
                }`}
                style={{ 
                  transitionDelay: item.delay,
                  transform: isVisible['problem-section'] 
                    ? `translateY(${(scrollY - 800) * item.speed}px)` 
                    : undefined
                }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-[#6A6E6C] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Timeline Section */}
      <section 
        id="solution-section" 
        ref={solutionRef}
        className="py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#145338]">
              A solução completa: Talent Cool
            </h2>
            <p className="text-xl text-[#6A6E6C] max-w-2xl mx-auto">
              Uma plataforma integrada que transforma o caos do RH em uma máquina de contratação previsível e rentável.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 hidden md:block">
              <div 
                className="h-full bg-[#2d8a5e] transition-all duration-300 ease-out"
                style={{ width: `${timelineProgress}%` }}
              />
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  icon: <LayoutDashboard />,
                  title: "Gerir",
                  desc: "Pipeline Kanban visual. Saiba exatamente onde cada candidato está.",
                  active: timelineProgress > 0
                },
                {
                  icon: <Calculator />,
                  title: "Calcular",
                  desc: "Simulador CoV integrado. Prove o ROI de cada contratação.",
                  active: timelineProgress > 25
                },
                {
                  icon: <BarChart3 />,
                  title: "Analisar",
                  desc: "Métricas em tempo real. Time-to-hire e custo por vaga na ponta do dedo.",
                  active: timelineProgress > 50
                },
                {
                  icon: <Bot />,
                  title: "Automatizar",
                  desc: "Assistente IA que responde dúvidas e filtra candidatos automaticamente.",
                  active: timelineProgress > 75
                }
              ].map((step, i) => (
                <div 
                  key={i}
                  className={`bg-white border-2 p-6 rounded-2xl transition-all duration-500 ${
                    step.active 
                      ? 'border-[#2d8a5e] shadow-[0_10px_30px_-10px_rgba(45,138,94,0.3)] transform -translate-y-2' 
                      : 'border-gray-100'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${
                    step.active ? 'bg-[#145338] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-[#000402]">{step.title}</h3>
                  <p className="text-[#6A6E6C] text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Before / After Split Screen */}
      <section 
        id="before-after-section" 
        ref={beforeAfterRef}
        className="py-32 bg-gray-900 text-white overflow-hidden relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-20">A diferença é clara</h2>
          
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Before */}
            <div 
              className="bg-gray-800 rounded-3xl p-8 border border-red-900/50"
              style={{ transform: `translateY(${(scrollY - 2000) * 0.15}px)` }}
            >
              <div className="flex items-center gap-3 mb-8 text-red-400">
                <XCircle className="w-8 h-8" />
                <h3 className="text-3xl font-bold">Sem Talent Cool</h3>
              </div>
              
              <ul className="space-y-6 text-lg text-gray-400">
                <li className="flex gap-4">
                  <span className="text-red-500">✕</span>
                  Planilhas espalhadas e desatualizadas
                </li>
                <li className="flex gap-4">
                  <span className="text-red-500">✕</span>
                  Aprovação de vagas via e-mails perdidos
                </li>
                <li className="flex gap-4">
                  <span className="text-red-500">✕</span>
                  Zero visibilidade do custo da vaga
                </li>
                <li className="flex gap-4">
                  <span className="text-red-500">✕</span>
                  Relatórios manuais que levam horas
                </li>
              </ul>
            </div>

            {/* After */}
            <div 
              className="bg-gradient-to-br from-[#145338] to-[#0f3b28] rounded-3xl p-8 border border-[#2d8a5e]/30 shadow-2xl shadow-[#2d8a5e]/20"
              style={{ transform: `translateY(${(scrollY - 2000) * -0.05}px)` }}
            >
              <div className="flex items-center gap-3 mb-8 text-[#2d8a5e]">
                <CheckCircle2 className="w-8 h-8" />
                <h3 className="text-3xl font-bold text-white">Com Talent Cool</h3>
              </div>
              
              <ul className="space-y-6 text-lg text-gray-200">
                <li className="flex gap-4">
                  <span className="text-[#2d8a5e]">✓</span>
                  Pipeline visual Kanban centralizado
                </li>
                <li className="flex gap-4">
                  <span className="text-[#2d8a5e]">✓</span>
                  Calculadora de Custo de Vaga em tempo real
                </li>
                <li className="flex gap-4">
                  <span className="text-[#2d8a5e]">✓</span>
                  Dashboards com Time-to-Hire automático
                </li>
                <li className="flex gap-4">
                  <span className="text-[#2d8a5e]">✓</span>
                  Assistente IA para responder dúvidas na hora
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Preview */}
      <section 
        id="roi-section" 
        ref={roiRef}
        className="py-32 px-4 sm:px-6 lg:px-8 bg-[#145338] text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: 'linear-gradient(#2d8a5e 1px, transparent 1px), linear-gradient(90deg, #2d8a5e 1px, transparent 1px)',
               backgroundSize: '40px 40px',
               transform: `translateY(${scrollY * 0.1}px)`
             }}
        />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            Economize até
          </h2>
          <div className="text-6xl md:text-8xl font-black text-[#2d8a5e] mb-12 tracking-tighter">
            {formatCurrency(roiAmount)}
            <span className="text-3xl text-white font-normal block mt-4">por ano*</span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto text-left border border-white/20">
            <h4 className="text-xl font-semibold mb-6">Baseado em uma empresa de 50 funcionários:</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-gray-300">Redução do Time-to-Hire (30%)</span>
                <span className="font-bold text-[#2d8a5e]">+ R$ 65.000</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-gray-300">Economia com agências</span>
                <span className="font-bold text-[#2d8a5e]">+ R$ 80.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Ganho de produtividade RH</span>
                <span className="font-bold text-[#2d8a5e]">+ R$ 35.000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-extrabold text-[#145338] mb-8">
            Pare de perder dinheiro. Comece agora.
          </h2>
          <p className="text-xl text-[#6A6E6C] mb-12">
            Junte-se a centenas de empresas que já transformaram seu RH em um centro de inteligência e resultados.
          </p>
          
          <button className="group bg-[#2d8a5e] text-white px-10 py-5 rounded-xl text-xl font-bold hover:bg-[#145338] transition-all duration-300 shadow-xl shadow-[#2d8a5e]/30 flex items-center gap-4 mx-auto">
            Agendar Demonstração Gratuita
            <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8 text-center text-[#6A6E6C]">
        <div className="flex items-center justify-center gap-2 mb-4 font-bold text-[#145338] text-xl">
          <LayoutDashboard className="w-6 h-6" />
          Talent Cool
        </div>
        <p>© {new Date().getFullYear()} Talent Cool. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
