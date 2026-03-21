export default function SolucaoSlide() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#f7faf8] via-white to-[#e8f5ee]">
      <div className="absolute top-[10vh] right-[5vw] w-[30vw] h-[30vw] bg-[#2d8a5e]/5 rounded-full" />
      <div className="absolute bottom-[5vh] left-[10vw] w-[20vw] h-[20vw] bg-[#145338]/5 rounded-full" />

      <div className="relative flex flex-col h-full px-[8vw] py-[7vh]">
        <div className="flex items-center gap-[1vw] mb-[2vh]">
          <div className="w-[0.4vw] h-[3vh] bg-[#2d8a5e] rounded-full" />
          <span className="text-[1.4vw] font-bold text-[#2d8a5e] uppercase tracking-[0.15em]">A Solucao</span>
        </div>

        <div className="flex items-start gap-[6vw] flex-1">
          <div className="w-[45%] flex flex-col justify-center">
            <div className="flex items-center gap-[1.2vw] mb-[3vh]">
              <div className="w-[4vw] h-[4vw] rounded-[0.8vw] bg-[#145338] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-[2.2vw] h-[2.2vw]">
                  <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[2.5vw] font-extrabold text-[#145338] tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>TalentOS</span>
            </div>

            <h2 className="text-[3.5vw] font-extrabold text-[#0c1f15] leading-[1.05] mb-[3vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Plataforma inteligente all-in-one para RH de PMEs
            </h2>

            <p className="text-[1.7vw] text-[#4a5d52] leading-relaxed">
              Centralize vagas, candidatos e metricas em um unico painel. Tome decisoes baseadas em dados, nao em intuicao.
            </p>
          </div>

          <div className="w-[45%] flex flex-col justify-center gap-[3vh]">
            <div className="bg-white rounded-[1vw] border border-[#145338]/10 p-[2.5vw] shadow-[0_4px_24px_rgba(20,83,56,0.06)]">
              <div className="flex items-center gap-[1vw] mb-[1.5vh]">
                <div className="w-[2.5vw] h-[2.5vw] rounded-[0.4vw] bg-[#e8f5ee] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#145338" strokeWidth="2" className="w-[1.4vw] h-[1.4vw]">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[1.6vw] font-bold text-[#0c1f15]">Simples de usar</span>
              </div>
              <p className="text-[1.4vw] text-[#4a5d52]">Interface intuitiva que qualquer equipe adota sem treinamento</p>
            </div>

            <div className="bg-white rounded-[1vw] border border-[#145338]/10 p-[2.5vw] shadow-[0_4px_24px_rgba(20,83,56,0.06)]">
              <div className="flex items-center gap-[1vw] mb-[1.5vh]">
                <div className="w-[2.5vw] h-[2.5vw] rounded-[0.4vw] bg-[#e8f5ee] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#145338" strokeWidth="2" className="w-[1.4vw] h-[1.4vw]">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="text-[1.6vw] font-bold text-[#0c1f15]">Feito para o Brasil</span>
              </div>
              <p className="text-[1.4vw] text-[#4a5d52]">Calculos de encargos CLT, benchmarking salarial local e IA em portugues</p>
            </div>

            <div className="bg-white rounded-[1vw] border border-[#145338]/10 p-[2.5vw] shadow-[0_4px_24px_rgba(20,83,56,0.06)]">
              <div className="flex items-center gap-[1vw] mb-[1.5vh]">
                <div className="w-[2.5vw] h-[2.5vw] rounded-[0.4vw] bg-[#e8f5ee] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#145338" strokeWidth="2" className="w-[1.4vw] h-[1.4vw]">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[1.6vw] font-bold text-[#0c1f15]">IA integrada</span>
              </div>
              <p className="text-[1.4vw] text-[#4a5d52]">Assistente que responde perguntas sobre metricas, custos e candidatos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
