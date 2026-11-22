// Termos: [nome, álbum, pista]
const ALBUNS = [
  { n: "Processamento", quem: "a CPU", txt: "Você decide, calcula e coordena. Nada acontece sem passar por você." },
  { n: "Memórias", quem: "a Cache", txt: "Você guarda o que importa e entrega rápido quando precisam." },
  { n: "Comunicação", quem: "um Barramento", txt: "Você leva informação de um lado para o outro sem perder nada." },
  { n: "Chips e núcleos", quem: "um Microcontrolador", txt: "Você faz muito com pouco, tudo num chip só." }
];
const T = [
["CPU",0,"Cérebro do computador: busca, decodifica e executa as instruções dos programas."],
["ULA",0,"Circuito do processador que faz as contas e as comparações lógicas."],
["UC",0,"Dirige o processador: decide qual passo vem a seguir e coordena os demais blocos."],
["Registradores",0,"Pequenas posições dentro da CPU, as mais rápidas, que guardam dados em uso agora."],
["RAM",1,"Área volátil principal onde ficam dados e instruções em uso; perde tudo sem energia."],
["ROM",1,"Não volátil, vem gravada de fábrica e normalmente não se altera."],
["EEPROM",1,"Regravável, guarda configurações sem energia e permite alterar um único byte por vez."],
["Flash",1,"Não volátil e regravável, apaga por blocos; usada em pendrives e cartões de memória."],
["Cache",1,"Pequena e muito veloz, fica perto da CPU guardando cópias dos dados mais usados."],
["Memória de massa",1,"Guarda arquivos em grande quantidade e por muito tempo, como HD ou SSD."],
["DMA",2,"Recurso que transfere dados entre periféricos e RAM sem a CPU copiar cada byte."],
["Address bus",2,"Via que leva da CPU o número da posição a ser lida ou escrita."],
["Data bus",2,"Via de mão dupla que transporta o conteúdo trocado entre CPU e demais componentes."],
["Microcontrolador",3,"Chip único com processador, memórias e portas de entrada e saída, como no Arduino."],
["Dual core",3,"Processador com dois núcleos que podem trabalhar ao mesmo tempo."],
["Quad core",3,"Processador com quatro núcleos trabalhando em paralelo."]
];
const RODADAS = 12, CORES = ["#ff4fa3", "#35a7ff", "#ff7a1a", "#ffd23f", "#9b7bff"];
const $ = (id) => document.getElementById(id);
const emb = (a) => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
const seg = (ms) => (ms / 1000).toFixed(1).replace(".", ",") + " s";
const TOTAL = RODADAS + 4;
let rod = [], res = [], etapa = -1, t0 = 0;

function opcoes(t) {
  const mesmo = emb(T.filter(x => x !== t && x[1] === t[1])), outros = emb(T.filter(x => x[1] !== t[1]));
  return emb([t, ...[...mesmo, ...outros].slice(0, 3)]);
}
function iniciar() {
  rod = emb(T).slice(0, RODADAS).map(t => ({ t, o: opcoes(t) }));
  res = []; ir(0);
}
function ir(e) {
  etapa = e;
  document.documentElement.style.setProperty("--bg", e < 0 ? "#c8ff3d" : CORES[e % CORES.length]);
  $("prog").innerHTML = e < 0 ? "" : Array.from({ length: TOTAL }, (_, k) => `<i class="${k < e ? "feito" : k === e ? "agora" : ""}"></i>`).join("");
  e < 0 ? intro() : e < RODADAS ? pergunta(e) : final(e - RODADAS);
}
const prox = (txt = "Continuar") => `<button class="cta" id="prox">${txt}</button>`;
const ligar = (f) => { $("prox").onclick = f; $("prox").focus(); };

function intro() {
  $("tela").innerHTML = `<h1>Seu Arq Wrapped</h1>
    <p>${RODADAS} pistas, 16 termos de Arquitetura Computacional. No fim, você descobre seu álbum do ano.</p>${prox("Começar")}`;
  ligar(iniciar);
}
function pergunta(e, marcada) {
  const { t, o } = rod[e], r = res[e];
  $("tela").innerHTML = `<span class="chip">Faixa ${e + 1} de ${RODADAS}</span>
    <h2>${t[2]}</h2>
    <div class="opcoes">${o.map((x, k) => {
      const cl = !r ? "" : x === t ? "certa" : (x === r.esc ? "errada" : "apagada");
      return `<button data-k="${k}" class="${cl}" ${r ? "disabled" : ""}>${x[0]}</button>`;
    }).join("")}</div>
    ${r ? `<p class="feedback">${r.ok ? "Certo." : "Quase. Era " + t[0] + "."}</p>${prox(e === RODADAS - 1 ? "Ver minha retrospectiva" : "Próxima")}` : ""}`;
  if (r) return ligar(() => ir(e + 1));
  t0 = performance.now();
  document.querySelectorAll(".opcoes button").forEach(b => b.onclick = () => {
    const esc = o[+b.dataset.k];
    res[e] = { t, esc, ok: esc === t, ms: performance.now() - t0 };
    pergunta(e);
  });
}
function final(k) {
  const ok = res.filter(r => r.ok), erros = res.filter(r => !r.ok);
  const por = ALBUNS.map((a, i) => {
    const q = res.filter(r => r.t[1] === i);
    return { a, i, q: q.length, c: q.filter(r => r.ok).length };
  }).filter(x => x.q).sort((x, y) => y.c - x.c || y.c / y.q - x.c / x.q);
  const top = por[0].c ? por[0] : null;
  let h = "";
  if (k === 0) h = `<p>Você acertou</p><div class="gigante">${ok.length}</div>
    <h2>de ${RODADAS} faixas</h2><div class="barra"><b style="width:${ok.length / RODADAS * 100}%"></b></div>`;
  if (k === 1) h = top
    ? `<p>Seu álbum do ano</p><h1>${top.a.n}</h1><p>${top.c} de ${top.q} faixas certas.</p>
       <h2>Você é ${top.a.quem}.</h2><p>${top.a.txt}</p>`
    : `<p>Seu álbum do ano</p><h1>Ainda por descobrir</h1><p>Nenhuma faixa certa desta vez. Tente de novo para revelar o seu.</p>`;
  if (k === 2) {
    const r = ok.sort((a, b) => a.ms - b.ms).slice(0, 5);
    h = `<h2>Suas faixas mais rápidas</h2>` + (r.length
      ? `<ol>${r.map((x, i) => `<li><span class="pos">${i + 1}</span>${x.t[0]}<small>${seg(x.ms)}</small></li>`).join("")}</ol>`
      : `<p>Quando você acertar, as respostas mais rápidas aparecem aqui.</p>`);
  }
  if (k === 3) h = erros.length
    ? `<h2>Para ouvir de novo</h2><ul class="lista">${erros.map(x => `<li>${x.t[0]}<small>${x.t[2]}</small></li>`).join("")}</ul>${prox("Jogar de novo")}`
    : `<h1>Álbum perfeito.</h1><p>Você acertou todas as faixas.</p>${prox("Jogar de novo")}`;
  $("tela").innerHTML = h + (k < 3 ? prox() : "");
  ligar(k < 3 ? () => ir(etapa + 1) : () => ir(-1));
}
document.addEventListener("keydown", e => {
  if (etapa >= 0 && etapa < RODADAS && !res[etapa] && /^[1-4]$/.test(e.key)) document.querySelectorAll(".opcoes button")[+e.key - 1]?.click();
});
ir(-1);
