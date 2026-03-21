const base = import.meta.env.BASE_URL;

export default function TitleSlide() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a2e1f]">
      <img
        src={`${base}hero-bg.png`}
        crossOrigin="anonymous"
        alt="Team collaborating"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a2e1f] via-[#0a2e1f]/85 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-[#0a2e1f] to-transparent" />

      <div className="relative flex flex-col justify-between h-full px-[8vw] py-[8vh]">
        <div className="flex items-center gap-[1vw]">
          <div className="w-[3vw] h-[3vw] rounded-[0.6vw] bg-[#2d8a5e] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-[1.8vw] h-[1.8vw]">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[2vw] font-extrabold text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>TalentOS</span>
        </div>

        <div className="max-w-[55vw]">
          <h1 className="text-[5.5vw] leading-[1] font-black text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            Sua equipe de RH em um <span className="text-[#2d8a5e]">painel inteligente</span>
          </h1>
          <p className="mt-[3vh] text-[2vw] leading-snug text-white/70 max-w-[45vw]">
            A plataforma de recrutamento e gestao de talentos feita para PMEs brasileiras.
          </p>
        </div>

        <div className="flex items-center gap-[2vw]">
          <span className="text-[1.4vw] text-white/50 tracking-wider uppercase">Recrutamento inteligente para PMEs</span>
          <div className="h-[0.15vh] flex-1 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
