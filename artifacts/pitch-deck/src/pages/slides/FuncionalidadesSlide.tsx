const base = import.meta.env.BASE_URL;

export default function FuncionalidadesSlide() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a2e1f]">
      <img
        src={`${base}pattern-bg.png`}
        crossOrigin="anonymous"
        alt="Abstract pattern"
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a2e1f]/80 to-[#0a2e1f]" />

      <div className="relative flex flex-col h-full px-[8vw] py-[7vh]">
        <div className="flex items-center gap-[1vw] mb-[2vh]">
          <div className="w-[0.4vw] h-[3vh] bg-[#2d8a5e] rounded-full" />
          <span className="text-[1.4vw] font-bold text-[#2d8a5e] uppercase tracking-[0.15em]">Funcionalidades</span>
        </div>

        <h2 className="text-[3.5vw] font-extrabold text-white leading-[1.05] mb-[6vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Tudo o que sua PME precisa em um so lugar
        </h2>

        <div className="grid grid-cols-5 gap-[2vw] flex-1 items-start">
          <div className="flex flex-col items-center text-center">
            <div className="w-[5vw] h-[5vw] rounded-[1vw] bg-[#2d8a5e]/15 border border-[#2d8a5e]/20 flex items-center justify-center mb-[2vh]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d8a5e" strokeWidth="1.8" className="w-[2.5vw] h-[2.5vw]">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-[1.5vw] font-bold text-white mb-[1vh]">Dashboard Inteligente</h3>
            <p className="text-[1.3vw] text-white/60 leading-relaxed">Metricas em tempo real de todo o pipeline de recrutamento</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-[5vw] h-[5vw] rounded-[1vw] bg-[#2d8a5e]/15 border border-[#2d8a5e]/20 flex items-center justify-center mb-[2vh]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d8a5e" strokeWidth="1.8" className="w-[2.5vw] h-[2.5vw]">
                <rect x="3" y="3" width="5" height="18" rx="1" />
                <rect x="10" y="8" width="5" height="13" rx="1" />
                <rect x="17" y="5" width="5" height="16" rx="1" />
              </svg>
            </div>
            <h3 className="text-[1.5vw] font-bold text-white mb-[1vh]">Pipeline Kanban</h3>
            <p className="text-[1.3vw] text-white/60 leading-relaxed">Funil visual de candidatos com drag-and-drop</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-[5vw] h-[5vw] rounded-[1vw] bg-[#2d8a5e]/15 border border-[#2d8a5e]/20 flex items-center justify-center mb-[2vh]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d8a5e" strokeWidth="1.8" className="w-[2.5vw] h-[2.5vw]">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round" />
                <circle cx="16" cy="18" r="3" fill="#2d8a5e" opacity="0.3" />
                <path d="M16 17v2M15 18h2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-[1.5vw] font-bold text-white mb-[1vh]">Calculadora CoV</h3>
            <p className="text-[1.3vw] text-white/60 leading-relaxed">Custo de vacancia com encargos e produtividade</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-[5vw] h-[5vw] rounded-[1vw] bg-[#2d8a5e]/15 border border-[#2d8a5e]/20 flex items-center justify-center mb-[2vh]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d8a5e" strokeWidth="1.8" className="w-[2.5vw] h-[2.5vw]">
                <path d="M12 8V4H8" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="2" y="2" width="20" height="20" rx="4" />
                <path d="M7 14l3-3 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="18" cy="18" r="3" fill="#2d8a5e" opacity="0.3" />
              </svg>
            </div>
            <h3 className="text-[1.5vw] font-bold text-white mb-[1vh]">Assistente IA</h3>
            <p className="text-[1.3vw] text-white/60 leading-relaxed">Perguntas em linguagem natural sobre metricas e custos</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-[5vw] h-[5vw] rounded-[1vw] bg-[#2d8a5e]/15 border border-[#2d8a5e]/20 flex items-center justify-center mb-[2vh]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d8a5e" strokeWidth="1.8" className="w-[2.5vw] h-[2.5vw]">
                <path d="M16 8a4 4 0 11-8 0 4 4 0 018 0z" />
                <path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
                <path d="M20 8v4M18 10h4" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-[1.5vw] font-bold text-white mb-[1vh]">Benchmarking Salarial</h3>
            <p className="text-[1.3vw] text-white/60 leading-relaxed">Compare salarios com dados de mercado atualizados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
