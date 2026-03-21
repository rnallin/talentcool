export default function DiferencialSlide() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#f7faf8] to-[#e8f5ee]">
      <div className="absolute top-[15vh] left-[50vw] w-[35vw] h-[35vw] bg-[#145338]/4 rounded-full" />

      <div className="relative flex flex-col h-full px-[8vw] py-[7vh]">
        <div className="flex items-center gap-[1vw] mb-[2vh]">
          <div className="w-[0.4vw] h-[3vh] bg-[#2d8a5e] rounded-full" />
          <span className="text-[1.4vw] font-bold text-[#2d8a5e] uppercase tracking-[0.15em]">Resultados</span>
        </div>

        <h2 className="text-[3.5vw] font-extrabold text-[#0c1f15] leading-[1.05] max-w-[55vw] mb-[6vh]" style={{ fontFamily: "'Inter', sans-serif" }}>
          Dados que viram decisoes, nao relatorios
        </h2>

        <div className="flex gap-[4vw] flex-1 items-start">
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-[3vw]">
              <div className="bg-white rounded-[1vw] border border-[#145338]/8 p-[2.5vw]">
                <div className="text-[5vw] font-black text-[#145338] leading-none mb-[1vh]" style={{ fontFamily: "'Inter', sans-serif" }}>40%</div>
                <p className="text-[1.5vw] font-semibold text-[#0c1f15] mb-[0.5vh]">Reducao no time-to-hire</p>
                <p className="text-[1.3vw] text-[#4a5d52]">Pipeline visual acelera cada etapa do processo seletivo</p>
              </div>

              <div className="bg-white rounded-[1vw] border border-[#145338]/8 p-[2.5vw]">
                <div className="text-[5vw] font-black text-[#145338] leading-none mb-[1vh]" style={{ fontFamily: "'Inter', sans-serif" }}>60%</div>
                <p className="text-[1.5vw] font-semibold text-[#0c1f15] mb-[0.5vh]">Menos custo por contratacao</p>
                <p className="text-[1.3vw] text-[#4a5d52]">Calculadora CoV identifica onde o dinheiro esta sendo desperdicado</p>
              </div>

              <div className="bg-white rounded-[1vw] border border-[#145338]/8 p-[2.5vw]">
                <div className="text-[5vw] font-black text-[#2d8a5e] leading-none mb-[1vh]" style={{ fontFamily: "'Inter', sans-serif" }}>3x</div>
                <p className="text-[1.5vw] font-semibold text-[#0c1f15] mb-[0.5vh]">Mais produtividade do RH</p>
                <p className="text-[1.3vw] text-[#4a5d52]">Automacao substitui planilhas e tarefas manuais repetitivas</p>
              </div>

              <div className="bg-white rounded-[1vw] border border-[#145338]/8 p-[2.5vw]">
                <div className="text-[5vw] font-black text-[#2d8a5e] leading-none mb-[1vh]" style={{ fontFamily: "'Inter', sans-serif" }}>100%</div>
                <p className="text-[1.5vw] font-semibold text-[#0c1f15] mb-[0.5vh]">Visibilidade do pipeline</p>
                <p className="text-[1.3vw] text-[#4a5d52]">Dashboard mostra status de cada vaga e candidato em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
