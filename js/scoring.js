/* =============================================================
   VeraLitis AI — scoring.js (Membro 1: Pedro Henrique)
   Motor determinístico de triagem jurídica preliminar (#simulador).

   - Determinístico: mesma entrada + mesma data de referência = mesma saída.
   - Sem dependências externas e sem acesso à rede.
   - Minimização de dados (LGPD, art. 6º, III): o relato é analisado em
     memória; este módulo NUNCA o devolve nem o persiste.
   ============================================================= */

const CHECKLISTS_POR_AREA = {
  trabalhista: ["CTPS Digital", "Extrato Analítico do FGTS", "TRCT (Termo de Rescisão)", "Holerites", "Espelhos de ponto"],
  consumidor: ["Nota Fiscal ou contrato", "Protocolo de atendimento / SAC", "Comprovante de negativação (Serasa/SPC)", "Comprovante de endereço"],
  civel: ["Contrato ou instrumento assinado", "Comunicações (e-mail/WhatsApp) sobre o caso", "Comprovante de prejuízo ou pagamento"],
  lgpd: ["Prints do incidente / vazamento", "Política de Privacidade vigente", "Registro de solicitação ao Encarregado (DPO)"]
};

const PRAZOS_PRESCRICIONAIS = {
  trabalhista: { meses: 24, baseLegal: "Art. 7º, XXIX, da CF/88 e art. 11 da CLT (2 anos após o fim do contrato)" },
  consumidor: { meses: 60, baseLegal: "Art. 27 do CDC (5 anos — fato do produto ou do serviço)" },
  civel: { meses: 36, baseLegal: "Art. 206, § 3º, V, do Código Civil (3 anos — reparação civil)" },
  lgpd: { meses: 36, baseLegal: "A LGPD não fixa prazo próprio; adotado, por cautela, o art. 206, § 3º, V, do CC" }
};

/* Radicais SEM acento: o relato é normalizado (sem acento, minúsculo) antes da busca. */
const PALAVRAS_CHAVE_POR_AREA = {
  trabalhista: ["salario", "fgts", "hora extra", "horas extras", "demiss", "dispens", "rescis", "ctps", "carteira", "empregador", "patrao", "ferias"],
  consumidor: ["compra", "comprei", "produto", "loja", "cobranca", "negativ", "serasa", "spc", "fatura", "defeito", "reembolso", "sac"],
  civel: ["contrato", "aluguel", "divida", "indeniza", "dano", "acidente", "vizinho", "pagamento", "imovel"],
  lgpd: ["dados", "vazamento", "privacidade", "consentimento", "lgpd", "cadastro", "dpo", "encarregado", "spam"]
};

/* Dados pessoais diretos no relato: CPF, e-mail e telefone. */
const PADROES_DADOS_PESSOAIS = [
  /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/,
  /[\w.+-]+@[\w-]+\.[\w.]+/,
  /\(?\b\d{2}\)?\s?9?\d{4}-?\d{4}\b/
];

const MIN_PALAVRAS_RELATO = 25;
const DIAS_ALERTA_PRAZO = 90;
const UM_DIA_MS = 24 * 60 * 60 * 1000;
const LIMITE_VERDE = 75;
const LIMITE_AMARELO = 45;

const MENSAGENS_POR_FAIXA = {
  verde: "Caso Maduro / Alta Viabilidade Documental: pronto para agendar consulta e redigir a inicial.",
  amarelo: "Viável com Pendência Probatória ou Alerta de Prazo: exige coleta urgente dos documentos do checklist.",
  vermelho: "Relato Insuficiente, Baixa Viabilidade Preliminar ou Prescrição Consumada: complemente fatos e provas antes de acionar o advogado."
};

/* ---------- Utilitários ---------- */

function normalizarTexto(texto) {
  return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function contarPalavras(texto) {
  const limpo = String(texto || "").trim();
  return limpo ? limpo.split(/\s+/).length : 0;
}

function detectarDadosPessoais(texto) {
  const alvo = String(texto || "");
  return PADROES_DADOS_PESSOAIS.some(function (padrao) { return padrao.test(alvo); });
}

function relatoAderenteAoRamo(texto, ramo) {
  const alvo = normalizarTexto(texto);
  return (PALAVRAS_CHAVE_POR_AREA[ramo] || []).some(function (termo) { return alvo.indexOf(termo) !== -1; });
}

/* Converte "AAAA-MM-DD" (ou Date) em Date local à meia-noite; devolve null se inválida. */
function interpretarData(valor) {
  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(valor || "").trim());
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]) - 1;
  const dia = Number(m[3]);
  const data = new Date(ano, mes, dia);
  const valida = data.getFullYear() === ano && data.getMonth() === mes && data.getDate() === dia;
  return valida ? data : null;
}

/* Soma meses preservando o dia; se o mês de destino for mais curto, usa o último dia dele. */
function somarMeses(data, meses) {
  const destino = new Date(data.getFullYear(), data.getMonth() + meses, 1);
  const ultimoDia = new Date(destino.getFullYear(), destino.getMonth() + 1, 0).getDate();
  destino.setDate(Math.min(data.getDate(), ultimoDia));
  return destino;
}

/* ---------- Prescrição ---------- */

function calcularPrescricao(ramo, dataFato, hoje) {
  const prazo = PRAZOS_PRESCRICIONAIS[ramo];
  const base = { meses: prazo.meses, baseLegal: prazo.baseLegal };
  const fato = interpretarData(dataFato);

  if (!fato) {
    return Object.assign(base, { dataLimite: null, diasRestantes: null, situacao: "indeterminada", alerta: true });
  }

  const limite = somarMeses(fato, prazo.meses);
  const diasRestantes = Math.round((limite.getTime() - interpretarData(hoje).getTime()) / UM_DIA_MS);

  let situacao = "regular";
  if (diasRestantes < 0) situacao = "prescrito";
  else if (diasRestantes <= DIAS_ALERTA_PRAZO) situacao = "proximo";

  return Object.assign(base, {
    dataLimite: limite,
    diasRestantes: diasRestantes,
    situacao: situacao,
    alerta: situacao !== "regular"
  });
}

/* ---------- Faixas ---------- */

/* VERMELHO: score < 45 ou prescrição consumada. VERDE: score >= 75 sem alerta. AMARELO: demais. */
function classificarFaixa(score, alertaPrescricao, prescrito) {
  if (score < LIMITE_AMARELO) return "vermelho"; /* guarda incondicional (CORE-01) */
  if (prescrito) return "vermelho";
  if (score >= LIMITE_VERDE && !alertaPrescricao) return "verde";
  return "amarelo";
}

/* ---------- Motor principal ---------- */

/**
 * @param {Object} entrada  { ramo, relato, dataFato ("AAAA-MM-DD"), checkboxes }
 *   checkboxes: { possuiProvas, identificaRe, pedidoDefinido, tentativaPrevia, valorEstimado }
 * @param {Date} [hoje]  data de referência (padrão: hoje); permite testes reproduzíveis
 * @returns {Object} resultado da triagem, ou { erro } se a entrada for inválida
 */
function analisarCaso(entrada, hoje) {
  const dados = entrada || {};
  const ramo = String(dados.ramo || "").toLowerCase();

  if (!PRAZOS_PRESCRICIONAIS[ramo]) {
    return { erro: "Ramo jurídico inválido: informe trabalhista, consumidor, civel ou lgpd." };
  }

  const referencia = interpretarData(hoje || new Date());
  const fato = interpretarData(dados.dataFato);
  if (fato && fato.getTime() > referencia.getTime()) {
    return { erro: "A data do fato não pode ser posterior à data atual." };
  }

  const relato = dados.relato || "";
  const chk = dados.checkboxes || {};
  const prescricao = calcularPrescricao(ramo, dados.dataFato, referencia);
  const dadosPessoaisDetectados = detectarDadosPessoais(relato);

  /* 10 critérios objetivos (art. 319 do CPC e correlatos). Soma dos pontos = 100. */
  const criterios = [
    { id: 1,  nome: "Fato gerador identificável (relato ≥ " + MIN_PALAVRAS_RELATO + " palavras)", pontos: 15, base: "CPC, art. 319, III", atendido: contarPalavras(relato) >= MIN_PALAVRAS_RELATO },
    { id: 2,  nome: "Marco temporal informado", pontos: 10, base: "CPC, art. 319, III", atendido: fato !== null },
    { id: 3,  nome: "Lastro probatório mínimo", pontos: 15, base: "CPC, art. 319, VI", atendido: chk.possuiProvas === true },
    { id: 4,  nome: "Identificação da parte ré", pontos: 10, base: "CPC, art. 319, II", atendido: chk.identificaRe === true },
    { id: 5,  nome: "Pretensão / pedido claro", pontos: 10, base: "CPC, art. 319, IV", atendido: chk.pedidoDefinido === true },
    { id: 6,  nome: "Tentativa prévia / protocolo", pontos: 10, base: "CPC, art. 3º, §§ 2º e 3º", atendido: chk.tentativaPrevia === true },
    { id: 7,  nome: "Quantificação ou impacto (valor da causa)", pontos: 10, base: "CPC, art. 319, V", atendido: chk.valorEstimado === true },
    { id: 8,  nome: "Segurança de prazo legal (> " + DIAS_ALERTA_PRAZO + " dias)", pontos: 10, base: "Prescrição — CC, art. 189", atendido: fato !== null && prescricao.situacao === "regular" },
    { id: 9,  nome: "Aderência específica à área", pontos: 5, base: "TPU/CNJ", atendido: relatoAderenteAoRamo(relato, ramo) },
    { id: 10, nome: "Conformidade LGPD inicial (sem dados pessoais)", pontos: 5, base: "LGPD, art. 6º, III", atendido: !dadosPessoaisDetectados }
  ];

  const score = criterios.reduce(function (soma, c) { return soma + (c.atendido ? c.pontos : 0); }, 0);
  const alertaPrescricao = prescricao.alerta;
  const faixa = classificarFaixa(score, alertaPrescricao, prescricao.situacao === "prescrito");

  return {
    ramo: ramo,
    score: score,
    faixa: faixa,
    alertaPrescricao: alertaPrescricao,
    dadosPessoaisDetectados: dadosPessoaisDetectados,
    prescricao: prescricao,
    criterios: criterios,
    checklistDocumentos: (CHECKLISTS_POR_AREA[ramo] || []).slice(),
    mensagem: MENSAGENS_POR_FAIXA[faixa]
  };
}

/* Permite testar no Node sem afetar o navegador. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { analisarCaso, classificarFaixa, calcularPrescricao, contarPalavras, normalizarTexto, detectarDadosPessoais, somarMeses, interpretarData, CHECKLISTS_POR_AREA, PRAZOS_PRESCRICIONAIS };
}
