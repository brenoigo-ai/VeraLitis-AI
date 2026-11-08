/* =============================================================
   VeraLitis AI — js/chat.js (Membro 3: Breno Igo)
   Widget da Assistente Virtual VERA:
   1. Verifica /api/health e exibe selo de modo (IA Gemini vs. Modo Offline)
   2. Bloqueia CPF localmente antes de qualquer envio (LGPD Art. 6º, III)
   3. Motor Roteirizado Local sincronizado com persona.js (OAB, LGPD,
      Res. CNJ nº 615/2025, Anti-Injection e validação de agendamento)
   ============================================================= */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(require("./lgpd.js"));
  } else {
    root.VeraChat = factory(root.VeraLGPD);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (lgpd) {
  "use strict";

  const contemCpfValido = lgpd.contemCpfValido;
  const pareceCelularBR = lgpd.pareceCelularBR;
  const AVISO_CPF =
    "ALERTA LGPD (Art. 6º, III - Minimização): detectei um padrão de CPF na sua mensagem e o número " +
    "foi bloqueado antes de qualquer envio. Se for um telefone, informe com DDD e hífen, por exemplo " +
    "(86) 99999-0000. Como posso ajudar com os planos ou o funcionamento da plataforma?";
  function contatoValido(texto) {
    const digitos = (texto.match(/\d/g) || []).length;
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto);
    return email || (/^\+?[\d\s()-]+$/.test(texto) && digitos >= 10 && digitos <= 13);
  }

  function criarEstadoAgendamentoInicial() {
    return { ativo: false, nome: "", contato: "", plano: "" };
  }

  let estadoAgendamentoGlobal = criarEstadoAgendamentoInicial();

  function resetarEstadoAgendamento() {
    estadoAgendamentoGlobal = criarEstadoAgendamentoInicial();
  }

  function normalizar(texto) {
    return String(texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  const RESPOSTA_INJECTION =
    "Solicitação recusada pelas diretrizes de governança da VeraLitis AI (inspiradas na Resolução CNJ nº 615/2025). " +
    "Não compartilho instruções internas nem altero minhas regras éticas. Posso explicar nossos módulos de triagem ou planos SaaS?";

  const RESPOSTA_OAB =
    "Em respeito ao Estatuto da OAB (Lei nº 8.906/1994), a VeraLitis AI realiza exclusivamente triagem operacional e " +
    "documental preliminar. Não emitimos juízo de certeza sobre êxito processual, não redigimos peças judiciais nem " +
    "substituímos a consulta com advogado habilitado. Deseja testar a admissibilidade documental no Simulador (§02)?";

  /* Trava Anti-Injection (usa \bmodo dan\b para não bloquear 'Jordan Plaza' nem 'Dan Advogados') */
  const PADROES_INJECTION = [
    /\bignor\w* (as |todas as |suas |minhas |essas |)(instrucoes|regras|diretrizes)/,
    /\bignore (all |the |your )?(previous |prior |above )?(instructions|rules)\b/,
    /\besquec\w* (as |todas as |suas |)(instrucoes|regras|diretrizes)/,
    /\b(revele|mostre|repita|imprima|exiba)\b.{0,20}\b(suas instrucoes|instrucoes internas|seu prompt|o prompt|regras internas|sua configuracao)\b/,
    /\bsystem prompt\b|\bprompt de sistema\b|\bprompt do sistema\b/,
    /\bchave de api\b|\bapi[_ ]?key\b/,
    /\bmodo desenvolvedor\b|\bdeveloper mode\b|\bjailbreak\b/,
    /\bmodo dan\b|\bdo anything now\b/,
    /\baja como\b|\bfinja (ser|que)\b|\bvoce agora e\b/
  ];

  /* Trava Ética OAB (Lei 8.906/1994): parecer individualizado, promessa de resultado ou redação de peças */
  const PADROES_OAB = [
    /\bcausa (e |esta |ja e )?(ganha|perdida)\b/,
    /\bvou (ganhar|perder)\b/,
    /\bchances? de (ganhar|exito|vitoria|sucesso)\b/,
    /\bganhar (a causa|o processo|a acao)\b/,
    /\b(redija|redigir|escreva|escrever|faca|fazer|elabore|elaborar|monte|montar)\b.{0,25}\b(peticao|contestacao|recurso|peca|procuracao|notificacao extrajudicial)\b/,
    /\bparecer juridico\b/,
    /\btenho direito\b/,
    /\b(devo|posso|vale a pena) (processar|entrar com|ajuizar|acionar)\b/,
    /\bqual (e )?o meu prazo\b/
  ];

  /**
   * Travas determinísticas compartilhadas entre o widget (navegador) e o server.js (antes do Gemini).
   * @returns {{tipo: "injection"|"oab", resposta: string} | null}
   */
  function verificarTravas(mensagem) {
    const norm = normalizar(mensagem);
    if (!norm.trim()) return null;
    if (PADROES_INJECTION.some(function (re) { return re.test(norm); })) {
      return { tipo: "injection", resposta: RESPOSTA_INJECTION };
    }
    if (PADROES_OAB.some(function (re) { return re.test(norm); })) {
      return { tipo: "oab", resposta: RESPOSTA_OAB };
    }
    return null;
  }

  /* Motor local de contingencia (sincronizado com persona.js e exportavel para testes) */
  function responderLocalmente(mensagemBruta, estadoCustom) {
    const estado = estadoCustom || estadoAgendamentoGlobal;
    const texto = String(mensagemBruta || "").trim();
    const norm = normalizar(texto);

    if (!texto) {
      return "Por favor, digite sua dúvida sobre o simulador, módulos técnicos, planos SaaS ou agendamento de demonstração.";
    }

    /* 1. Trava LGPD: Deteccao de CPF no chat */
    const aguardandoContato = estado.ativo && Boolean(estado.nome) && !estado.contato;
    if (contemCpfValido(texto) && !(aguardandoContato && pareceCelularBR(texto))) {
      return AVISO_CPF;
    }

    /* 2. Cancelamento explicito do fluxo de agendamento */
    if (estado.ativo && /^(cancelar|voltar|sair|parar|nao quero|desistir)\b/i.test(norm)) {
      estado.ativo = false;
      estado.nome = "";
      estado.contato = "";
      estado.plano = "";
      return "Tudo bem, cancelei a solicitação de agendamento. Posso ajudar com informações sobre o simulador de triagem ou nossos planos Solo, Pro e Corporate?";
    }

    /* 3 e 4. Travas Anti-Injection (Res. CNJ 615/2025) e Ética OAB (Lei 8.906/1994) — mesma regra usada no server.js */
    const trava = verificarTravas(texto);
    if (trava) {
      return trava.resposta;
    }

    /* 5. Fluxo guiado de agendamento de demonstracao com validacao estrita */
    if (estado.ativo) {
      if (!estado.nome) {
        if (
          texto.length < 3 ||
          texto.includes("?") ||
          /\b(quais|quanto|preco|planos|como funciona|score|lgpd)\b/.test(norm)
        ) {
          return "Para prosseguir com o agendamento, informe primeiro o nome do advogado ou do escritório (ou digite 'cancelar' para sair do agendamento).";
        }
        estado.nome = texto;
        return "Obrigado, " + estado.nome + ". Agora informe um telefone/WhatsApp com DDD ou e-mail comercial válido para retorno (ou digite 'cancelar'):";
      }

      if (!estado.contato) {
        if (!contatoValido(texto)) {
          return "Preciso de um e-mail comercial válido (ex.: contato@escritorio.adv.br) ou telefone com DDD (mínimo 10 dígitos), ou digite 'cancelar'.";
        }
        estado.contato = texto;
        return "Perfeito! Qual plano deseja avaliar na demonstração: Advogado Solo (R$ 190/mês), Escritório Pro (R$ 590/mês) ou Corporate Jurídico (R$ 1.490/mês)?";
      }

      if (!/\b(solo|pro|corporate)\b/i.test(norm)) {
        return "Por favor, escolha um dos três planos: Solo, Pro ou Corporate (ou digite 'cancelar').";
      }

      const planoNorm = norm.includes("solo")
        ? "Advogado Solo (R$ 190/mês)"
        : norm.includes("corporate")
          ? "Corporate Jurídico (R$ 1.490/mês)"
          : "Escritório Pro (R$ 590/mês)";

      estado.plano = planoNorm;
      const sorteio = String(Math.floor(1000 + Math.random() * 9000));
      const protocolo = "SIM-" + new Date().getFullYear() + "-" + sorteio;
      const resumo =
        "Simulação de agendamento concluída sob o protocolo #" +
        protocolo +
        " para " +
        estado.nome +
        " (" +
        estado.contato +
        ") no plano " +
        estado.plano +
        ". No modo estático local, nenhum dado foi enviado a servidores externos (para persistência imediata, utilize também o formulário da seção §04 Contratar / Demo).";

      estado.ativo = false;
      estado.nome = "";
      estado.contato = "";
      estado.plano = "";
      return resumo;
    }

    if (
      norm.includes("agendar") ||
      norm.includes("demonstracao") ||
      norm.includes("contratar") ||
      norm.includes("assinar") ||
      norm.includes("quero testar")
    ) {
      estado.ativo = true;
      return "Com prazer! Para registrar sua solicitação de demonstração comercial (finalidade exclusiva de contato institucional conforme a LGPD), qual é o seu nome ou o nome do escritório?";
    }

    /* 6. Perguntas sobre Planos e Precos (alinhado com index.html e persona.js) */
    if (
      norm.includes("plano") ||
      norm.includes("preco") ||
      norm.includes("valor") ||
      norm.includes("mensalidade") ||
      norm.includes("quanto custa") ||
      norm.includes("solo") ||
      norm.includes("corporate")
    ) {
      return "Trabalhamos com 3 planos SaaS na seção §03 (#planos): 1) Advogado Solo (R$ 190/mês — até 80 triagens, 1 advogado); 2) Escritório Pro (R$ 590/mês — até 400 triagens, até 5 usuários, VERA 24/7 e trilha LGPD); 3) Corporate Jurídico (R$ 1.490/mês — triagens ilimitadas, múltiplas equipes, API e SLA dedicado). Deseja agendar uma demonstração?";
    }

    /* 7. Perguntas sobre Score, Prescricao e Simulador */
    if (
      norm.includes("score") ||
      norm.includes("simulador") ||
      norm.includes("prescricao") ||
      norm.includes("criterio") ||
      norm.includes("como funciona") ||
      norm.includes("calculo") ||
      /\btpu\b/.test(norm)
    ) {
      return (
        "O Simulador (§02 #simulador) avalia 10 critérios inspirados no art. 319 do CPC (5 verificados pelo " +
        "motor e 5 declarados por você) e verifica prazos em 4 ramos: Trabalhista (24 meses - CLT), " +
        "Consumidor (60 meses - CDC), Cível extracontratual (36 meses - CC) e LGPD (36 meses, adotados por " +
        "cautela), com alerta preventivo aos 90 dias do vencimento. O resultado classifica o caso nas faixas " +
        "Verde (75-100), Amarela (45-74) ou Vermelha (0-44, relato insuficiente ou possível prescrição). " +
        "Que tal testar um caso de referência na seção §02?"
      );
    }

    /* 8. Perguntas sobre LGPD, OAB e Governanca CNJ */
    if (
      norm.includes("lgpd") ||
      norm.includes("oab") ||
      norm.includes("cnj") ||
      norm.includes("etica") ||
      norm.includes("seguranca") ||
      norm.includes("privacidade") ||
      norm.includes("dados")
    ) {
      return "A VeraLitis AI aplica Privacy by Design (fontes auto-hospedadas, histórico local sem salvar o relato bruto e bloqueio de CPF antes do envio ao modelo conforme o Art. 6º, III da LGPD). Nossa governança respeita a Lei nº 8.906/1994 (OAB) e é inspirada nas diretrizes da Resolução CNJ nº 615/2025. Deseja conhecer os módulos na seção §03?";
    }

    /* 9. Perguntas sobre Pagamento, Desconto, Teste Gratis ou Fidelidade (Sem inventar fatos) */
    if (
      norm.includes("pagamento") ||
      norm.includes("pix") ||
      norm.includes("boleto") ||
      norm.includes("cartao") ||
      norm.includes("desconto") ||
      norm.includes("teste gratis") ||
      norm.includes("fidelidade")
    ) {
      return "Aceitamos PIX corporativo, boleto faturado para CNPJ/OAB e cartão de crédito recorrente. Sobre condições comerciais específicas (como descontos, fidelidade ou período de avaliação), não possuo esse dado tabelado aqui, mas posso registrar agora uma demonstração guiada para nossa equipe apresentar uma proposta. Deseja agendar?";
    }

    /* 10. Saudacoes e navegacao */
    if (/^(oi|ola|bom dia|boa tarde|boa noite|tudo bem|ajuda|menu)\b/.test(norm)) {
      return "Olá! Sou a VERA, consultora virtual da VeraLitis AI. Posso explicar como funciona o Simulador de Triagem (§02), detalhar os Planos Solo, Pro e Corporate (§03), esclarecer nossas travas OAB/LGPD ou registrar uma demonstração (§04). Por onde prefere começar?";
    }

    /* 11. Fora de escopo */
    return "Atuo exclusivamente com orientações sobre a plataforma VeraLitis AI (simulador de pré-triagem jurídica, módulos técnicos, planos SaaS e conformidade OAB/LGPD). Posso apresentar nossos planos, explicar o simulador ou agendar uma demonstração?";
  }

  /* Inicializacao no navegador */
  function inicializarWidgetDOM() {
    if (typeof document === "undefined") return;
    const containerRoot = document.getElementById("vera-chat-widget");
    if (!containerRoot) return;

    let sessionId = null;
    let modoServidor = "offline";
    let enviando = false;
    let ultimaChecagem = 0;

    containerRoot.innerHTML = [
      '<button id="chat-toggle" class="vera-toggle" type="button" aria-expanded="false" aria-controls="vera-window">',
      '  <span class="vera-toggle__seal" aria-hidden="true">VL</span>',
      '  <span class="vera-toggle__text">Assistente <strong>VERA</strong></span>',
      '</button>',
      '<aside id="vera-window" class="vera-window" role="dialog" aria-label="Atendimento Virtual VERA" hidden>',
      '  <header class="vera-header">',
      '    <div>',
      '      <strong class="vera-header__title">VERA &bull; Consultora Virtual</strong>',
      '      <span class="vera-header__sub" id="vera-mode-badge" data-modo="verificando" aria-live="polite">Verificando conexão &bull; aguarde</span>',
      '    </div>',
      '    <button id="chat-close" class="vera-close" type="button" aria-label="Fechar chat">&times;</button>',
      '  </header>',
      '  <div class="vera-chips" role="group" aria-label="Sugestões rápidas">',
      '    <button type="button" class="vera-chip" data-pergunta="Quais são os planos e preços?">Planos e preços</button>',
      '    <button type="button" class="vera-chip" data-pergunta="Como funciona o cálculo do score e prescrição?">Como funciona o score?</button>',
      '    <button type="button" class="vera-chip" data-pergunta="Como vocês garantem a conformidade com a OAB e a LGPD?">Travas OAB &amp; LGPD</button>',
      '    <button type="button" class="vera-chip" data-pergunta="Quero agendar uma demonstração">Agendar demo</button>',
      '  </div>',
      '  <div id="vera-chat-box" class="vera-messages" role="log" aria-live="polite" aria-label="Conversa com a VERA"></div>',
      '  <div class="vera-input-area">',
      '    <label for="vera-input" class="visually-hidden">Digite sua dúvida para a VERA</label>',
      '    <input id="vera-input" type="text" maxlength="500" placeholder="Pergunte sobre planos, score ou LGPD..." autocomplete="off" />',
      '    <button id="vera-send" type="button">Enviar</button>',
      '  </div>',
      '</aside>'
    ].join("\n");

    const btnToggle = document.getElementById("chat-toggle");
    const btnClose = document.getElementById("chat-close");
    const janelaChat = document.getElementById("vera-window");
    const chatBox = document.getElementById("vera-chat-box");
    const input = document.getElementById("vera-input");
    const btnEnviar = document.getElementById("vera-send");
    const badgeModo = document.getElementById("vera-mode-badge");
    const chips = containerRoot.querySelectorAll(".vera-chip");

    function adicionarMensagem(autor, texto, classe) {
      const linha = document.createElement("div");
      linha.className = "vera-msg " + classe;

      const rotulo = document.createElement("strong");
      rotulo.className = "vera-msg__author";
      rotulo.textContent = autor + ": ";

      const corpo = document.createElement("span");
      corpo.textContent = texto;

      linha.appendChild(rotulo);
      linha.appendChild(corpo);
      chatBox.appendChild(linha);
      chatBox.scrollTop = chatBox.scrollHeight;
      return linha;
    }

    /* Selo de modo: "ia" (Gemini via servidor) ou "offline" (motor roteirizado local). */
    function definirModo(modo, modelo) {
      modoServidor = modo;
      if (!badgeModo) return;
      badgeModo.setAttribute("data-modo", modo);
      badgeModo.textContent = modo === "ia"
        ? "IA generativa \u00b7 Gemini (" + (modelo || "Ativo") + ")"
        : "Modo offline \u00b7 Respostas roteirizadas";
    }

    async function detectarModo() {
      ultimaChecagem = Date.now();
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(function () { ctrl.abort(); }, 4000);
        const r = await fetch("/api/health", { signal: ctrl.signal, cache: "no-store" });
        clearTimeout(timer);
        if (r.ok) {
          const dados = await r.json();
          if (dados && dados.ok) {
            definirModo("ia", dados.modelo);
            return;
          }
        }
      } catch (_) {}
      definirModo("offline");
    }

    async function enviarMensagem(textoForcado) {
      if (enviando) return;
      const mensagem = typeof textoForcado === "string" ? textoForcado.trim() : input.value.trim();
      if (!mensagem) return;

      enviando = true;
      btnEnviar.disabled = true;
      input.value = "";

      try {
        if (modoServidor !== "ia" && Date.now() - ultimaChecagem > 10000) {
          await detectarModo();
        }

        const estado = estadoAgendamentoGlobal;
        const aguardandoContato = modoServidor !== "ia" && estado.ativo && Boolean(estado.nome) && !estado.contato;
        if (contemCpfValido(mensagem) && !(aguardandoContato && pareceCelularBR(mensagem))) {
          adicionarMensagem("Você", "[mensagem ocultada: contém padrão de CPF]", "vera-msg--user");
          adicionarMensagem("VERA", AVISO_CPF, "vera-msg--bot");
          return;
        }

        adicionarMensagem("Você", mensagem, "vera-msg--user");

        if (modoServidor !== "ia") {
          adicionarMensagem("VERA", responderLocalmente(mensagem), "vera-msg--bot");
          return;
        }

        /* Travas OAB/Anti-Injection resolvidas no próprio navegador: resposta imediata e nada vai ao modelo. */
        const trava = verificarTravas(mensagem);
        if (trava) {
          adicionarMensagem("VERA", trava.resposta, "vera-msg--bot");
          return;
        }

        const linhaCarregando = adicionarMensagem("VERA", "Consultando base normativa...", "vera-msg--bot");
        const corpoResposta = linhaCarregando.querySelector("span");
        chatBox.setAttribute("aria-busy", "true");

        try {
          const ctrl = new AbortController();
          const timer = setTimeout(function () { ctrl.abort(); }, 25000);
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: mensagem, sessionId: sessionId }),
            signal: ctrl.signal
          });
          clearTimeout(timer);

          /* 429 (limite) e 400 (entrada inválida) não significam servidor fora do ar: mantém o modo IA. */
          if (res.status === 429 || res.status === 400) {
            const erro = await res.json().catch(function () { return {}; });
            corpoResposta.textContent = (erro && erro.erro) || "Não foi possível enviar agora. Tente novamente em instantes.";
            return;
          }
          if (!res.ok) throw new Error("Fallback local");
          const dados = await res.json();
          sessionId = dados.sessionId || sessionId;
          corpoResposta.textContent = dados.resposta;
        } catch (_) {
          definirModo("offline");
          corpoResposta.textContent = responderLocalmente(mensagem);
        } finally {
          chatBox.removeAttribute("aria-busy");
        }
      } finally {
        enviando = false;
        btnEnviar.disabled = false;
        input.focus();
      }
    }

    btnToggle.addEventListener("click", function () {
      const aberto = !janelaChat.hidden;
      janelaChat.hidden = aberto;
      btnToggle.setAttribute("aria-expanded", String(!aberto));
      if (!aberto) {
        if (chatBox.children.length === 0) {
          adicionarMensagem(
            "VERA",
            "Olá! Sou a VERA, assistente virtual da VeraLitis AI. Posso explicar nosso motor de triagem (§02), detalhar os planos Solo, Pro e Corporate (§03) ou agendar uma demonstração. Como posso ajudar?",
            "vera-msg--bot"
          );
        }
        input.focus();
      }
    });

    btnClose.addEventListener("click", function () {
      janelaChat.hidden = true;
      btnToggle.setAttribute("aria-expanded", "false");
      btnToggle.focus();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !janelaChat.hidden) {
        janelaChat.hidden = true;
        btnToggle.setAttribute("aria-expanded", "false");
        btnToggle.focus();
      }
    });

    btnEnviar.addEventListener("click", function () {
      enviarMensagem();
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        enviarMensagem();
      }
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        const pergunta = chip.getAttribute("data-pergunta");
        if (pergunta) enviarMensagem(pergunta);
      });
    });

    detectarModo();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", inicializarWidgetDOM);
    } else {
      inicializarWidgetDOM();
    }
  }

  return {
    responderLocalmente: responderLocalmente,
    resetarEstadoAgendamento: resetarEstadoAgendamento,
    verificarTravas: verificarTravas,
    contatoValido: contatoValido,
    AVISO_CPF: AVISO_CPF
  };
});
