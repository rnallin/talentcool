export default function ProblemaSlide() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#f7faf8] to-[#e8f5ee]">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#145338]/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[25vw] h-[25vw] bg-[#2d8a5e]/5 rounded-full translate-y-1/3 -translate-x-1/4" />

      <div className="relative flex flex-col h-full px-[8vw] py-[7vh]">
        <div className="flex items-center gap-[1vw] mb-[2vh]">
          <div className="w-[0.4vw] h-[3vh] bg-[#2d8a5e] rounded-full" />
          <span className="text-[1.4vw] font-bold text-[#2d8a5e] uppercase tracking-[0.15em]">O Problema</span>
        </div>

        <h2 className="text-[4vw] font-extrabold text-[#0c1f15] leading-[1.05] max-w-[60vw] mb-[5vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
          PMEs brasileiras perdem dinheiro com recrutamento ineficiente
        </h2>

        <div className="grid grid-cols-2 gap-x-[4vw] gap-y-[4vh] flex-1">
          <div className="flex gap-[1.5vw] items-start">
            <div className="w-[3.5vw] h-[3.5vw] rounded-[0.5vw] bg-[#145338]/8 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#145338" strokeWidth="1.8" className="w-[2vw] h-[2vw]">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <h3 className="text-[1.8vw] font-bold text-[#0c1f15] mb-[0.5vh]">Processos em planilhas</h3>
              <p className="text-[1.5vw] text-[#4a5d52] leading-relaxed">Curriculos espalhados em e-mails, WhatsApp e pastas sem padrao ou rastreabilidade</p>
            </div>
          </div>

          <div className="flex gap-[1.5vw] items-start">
            <div className="w-[3.5vw] h-[3.5vw] rounded-[0.5vw] bg-[#145338]/8 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#145338" strokeWidth="1.8" className="w-[2vw] h-[2vw]">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-[1.8vw] font-bold text-[#0c1f15] mb-[0.5vh]">Vagas abertas por meses</h3>
              <p className="text-[1.5vw] text-[#4a5d52] leading-relaxed">Sem visibilidade do pipeline, processos seletivos demoram e candidatos desistem</p>
            </div>
          </div>

          <div className="flex gap-[1.5vw] items-start">
            <div className="w-[3.5vw] h-[3.5vw] rounded-[0.5vw] bg-[#145338]/8 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#145338" strokeWidth="1.8" className="w-[2vw] h-[2vw]">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
                <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 15V3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-[1.8vw] font-bold text-[#0c1f15] mb-[0.5vh]">E-mails perdidos</h3>
              <p className="text-[1.5vw] text-[#4a5d52] leading-relaxed">Comunicacao fragmentada entre recrutadores, gestores e candidatos</p>
            </div>
          </div>

          <div className="flex gap-[1.5vw] items-start">
            <div className="w-[3.5vw] h-[3.5vw] rounded-[0.5vw] bg-[#145338]/8 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="#145338" strokeWidth="1.8" className="w-[2vw] h-[2vw]">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 12h2v5H7zM11 8h2v9h-2zM15 10h2v7h-2z" fill="#145338" opacity="0.3" />
              </svg>
            </div>
            <div>
              <h3 className="text-[1.8vw] font-bold text-[#0c1f15] mb-[0.5vh]">Zero dados para decisoes</h3>
              <p className="text-[1.5vw] text-[#4a5d52] leading-relaxed">Sem metricas de custo, tempo ou eficiencia, decisoes sao baseadas em intuicao</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
