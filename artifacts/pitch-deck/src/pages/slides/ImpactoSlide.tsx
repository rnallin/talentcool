export default function ImpactoSlide() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#145338]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(45,138,94,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(45,138,94,0.15),transparent_40%)]" />

      <div className="relative flex h-full">
        <div className="w-[55%] flex flex-col justify-center px-[8vw]">
          <div className="flex items-center gap-[1vw] mb-[3vh]">
            <div className="w-[0.4vw] h-[3vh] bg-[#2d8a5e] rounded-full" />
            <span className="text-[1.4vw] font-bold text-[#2d8a5e] uppercase tracking-[0.15em]">O Impacto</span>
          </div>

          <h2 className="text-[3.5vw] font-extrabold text-white leading-[1.1] mb-[4vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
            O custo invisivel de vagas abertas
          </h2>

          <p className="text-[1.8vw] text-white/70 leading-relaxed max-w-[38vw]">
            Cada posicao nao preenchida custa salario, encargos e produtividade perdida. No Brasil, os encargos trabalhistas somam ate 68% sobre o salario base.
          </p>
        </div>

        <div className="w-[45%] flex items-center justify-center pr-[6vw]">
          <div className="bg-white/8 backdrop-blur-sm rounded-[1.5vw] border border-white/10 p-[3vw] w-full max-w-[34vw]">
            <p className="text-[1.4vw] font-semibold text-white/50 uppercase tracking-[0.12em] mb-[1vh]">Custo de Vacancia (CoV)</p>

            <div className="text-[9vw] font-black text-white leading-none mb-[1vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
              R$38k
            </div>
            <p className="text-[1.6vw] text-white/60 mb-[4vh]">por vaga aberta em 45 dias</p>

            <div className="space-y-[2vh]">
              <div className="flex items-center justify-between">
                <span className="text-[1.4vw] text-white/70">Salario base mensal</span>
                <span className="text-[1.5vw] font-bold text-white">R$ 12.000</span>
              </div>
              <div className="h-[0.1vh] bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-[1.4vw] text-white/70">Encargos CLT (+68%)</span>
                <span className="text-[1.5vw] font-bold text-[#2d8a5e]">R$ 8.160</span>
              </div>
              <div className="h-[0.1vh] bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-[1.4vw] text-white/70">Fator produtividade</span>
                <span className="text-[1.5vw] font-bold text-[#2d8a5e]">1.5x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
