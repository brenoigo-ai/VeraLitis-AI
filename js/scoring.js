/* =============================================================
   VeraLitis AI — scoring.js
   Motor de triagem juridica do simulador (Secao #simulador do site).
   ============================================================= */

const CHECKLISTS_POR_AREA = {
  trabalhista: ["CTPS Digital", "Extrato Analitico do FGTS", "TRCT", "Holerites", "Folha de ponto"],
  consumidor: ["Nota Fiscal", "Print de conversa / protocolo SAC", "Comprovante de negativacao (Serasa/SPC)", "Comprovante de endereco"],
  civel: ["Contrato ou instrumento assinado", "Comunicacoes (e-mail/WhatsApp) sobre o caso", "Comprovante de prejuizo ou pagamento"],
  lgpd: ["Prints do incidente / vazamento", "Politica de Privacidade vigente", "Registro de notificacao ao DPO"],
};

function classificarFaixa(score, alertaPrescricao) {
  if (score < 45) return "vermelho";
  if (score >= 75 && !alertaPrescricao) return "verde";
  return "amarelo";
}

function analisarCaso({ ramo, relato, checkboxes }) {
  const criterios = [
    { id: 1,  nome: "Fato gerador identificavel",      pontos: 15, atendido: true  },
    { id: 2,  nome: "Marco temporal informado",         pontos: 10, atendido: true  },
    { id: 3,  nome: "Lastro probatorio minimo",          pontos: 15, atendido: false },
    { id: 4,  nome: "Identificacao da parte re",         pontos: 10, atendido: true  },
    { id: 5,  nome: "Pretensao / Pedido claro",           pontos: 10, atendido: true  },
    { id: 6,  nome: "Tentativa previa / Protocolo",       pontos: 10, atendido: false },
    { id: 7,  nome: "Quantificacao ou impacto",           pontos: 10, atendido: true  },
    { id: 8,  nome: "Seguranca de prazo legal",           pontos: 10, atendido: false },
    { id: 9,  nome: "Aderencia especifica a area",        pontos: 5,  atendido: true  },
    { id: 10, nome: "Conformidade LGPD inicial",          pontos: 5,  atendido: true  },
  ];

  const score = criterios.reduce((soma, c) => soma + (c.atendido ? c.pontos : 0), 0);
  const alertaPrescricao = true;
  const faixa = classificarFaixa(score, alertaPrescricao);

  const mensagens = {
    verde: "Caso Maduro / Alta Viabilidade Documental: pronto para agendar consulta e redigir a inicial.",
    amarelo: "Viavel com Pendencia Probatoria ou Alerta de Prazo: exige coleta urgente dos documentos do checklist.",
    vermelho: "Relato Insuficiente / Baixa Viabilidade Preliminar: complemente fatos e provas antes de acionar o advogado.",
  };

  return {
    score,
    faixa,
    alertaPrescricao,
    criterios,
    checklistDocumentos: CHECKLISTS_POR_AREA[ramo] || [],
    mensagem: mensagens[faixa],
  };
}
