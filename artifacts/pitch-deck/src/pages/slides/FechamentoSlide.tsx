export default function FechamentoSlide() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#145338]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(45,138,94,0.2),transparent_70%)]" />
      <div className="absolute top-0 left-0 w-full h-[0.4vh] bg-gradient-to-r from-transparent via-[#2d8a5e] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-[0.4vh] bg-gradient-to-r from-transparent via-[#2d8a5e] to-transparent" />

      <div className="relative flex flex-col items-center justify-center h-full px-[8vw] text-center">
        <div className="flex items-center gap-[1.2vw] mb-[6vh]">
          <div className="w-[4.5vw] h-[4.5vw] rounded-[0.9vw] bg-[#2d8a5e] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-[2.5vw] h-[2.5vw]">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[3vw] font-extrabold text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>Talent Cool</span>
        </div>

        <h2 className="text-[4.5vw] font-black text-white leading-[1.05] max-w-[65vw] mb-[3vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Pare de perder dinheiro.
        </h2>
        <h2 className="text-[4.5vw] font-black text-[#2d8a5e] leading-[1.05] max-w-[65vw] mb-[5vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Comece agora.
        </h2>

        <p className="text-[2vw] text-white/60 max-w-[40vw]">
          Sua equipe de RH em um painel inteligente
        </p>

        <div className="absolute bottom-[6vh] left-[8vw] right-[8vw] flex items-center justify-between">
          <span className="text-[1.3vw] text-white/30">talentcool.com.br</span>
          <span className="text-[1.3vw] text-white/30">contato@talentcool.com.br</span>
        </div>
      </div>
    </div>
  );
}
