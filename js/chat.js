/* =============================================================
   VeraLitis AI — js/chat.js (Membro 3: Breno Igo)
   Widget da Assistente Virtual VERA:
   1. Tenta conectar ao backend Node/Gemini (POST /api/chat — server.js)
   2. Caso executado em hospedagem estatica (GitHub Pages), utiliza o
      Motor Roteirizado Local sincronizado com persona.js, mantendo
      as travas eticas OAB, LGPD, Anti-Injection e geracao de protocolo.
   ============================================================= */

(function () {
  const containerRoot = document.getElementById("vera-chat-widget");
  if (!containerRoot) return;

  let sessionId = null;
  let estadoAgendamento = { ativo: false, nome: "", contato: "", plano: "" };

  /* Monta a interface do widget sem depender de alteracoes no index.html */
  containerRoot.innerHTML = [
    '<button id="chat-toggle" class="vera-toggle" type="button" aria-expanded="false" aria-controls="chat">',
    '  <span class="vera-toggle__seal" aria-hidden="true">VL</span>',
    '  <span class="vera-toggle__text">Assistente <strong>VERA</strong></span>',
    '</button>',
    '<aside id="chat" class="vera-window" role="dialog" aria-label="Atendimento Virtual VERA" hidden>',
    '  <header class="vera-header">',
    '    <div>',
    '      <strong class="vera-header__title">VERA &bull; Consultora Virtual</strong>',
    '      <span class="vera-header__sub">Pré-Triagem &amp; Planos SaaS (OAB/LGPD)</span>',
    '    </div>',
    '    <button id="chat-close" class="vera-close" type="button" aria-label="Fechar chat">&times;</button>',
    '  </header>',
    '  <div class="vera-chips" aria-label="Sugestões rápidas">',
    '    <button type="button" class="vera-chip" data-pergunta="Quais são os planos e preços?">Planos e preços</button>',
    '    <button type="button" class="vera-chip" data-pergunta="Como funciona o cálculo do score e prescrição?">Como funciona o score?</button>',
    '    <button type="button" class="vera-chip" data-pergunta="Como vocês garantem a conformidade com a OAB e a LGPD?">Travas OAB &amp; LGPD</button>',
    '    <button type="button" class="vera-chip" data-pergunta="Quero agendar uma demonstração">Agendar demo</button>',
    '  </div>',
    '  <div id="chat-box" class="vera-messages" aria-live="polite"></div>',
    '  <div class="vera-input-area">',
    '    <label for="input" class="visually-hidden">Digite sua dúvida para a VERA</label>',
    '    <input id="input" type="text" placeholder="Pergunte sobre planos, score ou LGPD..." autocomplete="off" />',
    '    <button id="enviar" type="button">Enviar</button>',
    '  </div>',
    '</aside>'
  ].join("\n");

  const btnToggle = document.getElementById("chat-toggle");
  const btnClose = document.getElementById("chat-close");
  const janelaChat = document.getElementById("chat");
  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("input");
  const btnEnviar = document.getElementById("enviar");
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

  /* Motor local de contingencia (sincronizado com persona.js para GitHub Pages) */
  function responderLocalmente(mensagemBruta) {
    const texto = String(mensagemBruta || "").trim();
    const norm = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    /* 1. Trava LGPD: Deteccao de CPF no chat */
    if (/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(texto)) {
      return "ALERTA LGPD (Art. 6º, III - Minimização): Detectei um padrão de CPF na sua mensagem. Por segurança e privacidade, não envie CPF, RG ou senhas no chat. Como posso ajudar com os planos ou funcionamento da plataforma?";
    }

    /* 2. Trava Anti-Injection e protecao de System Prompt */
    if (
      norm.includes("ignore as instrucoes") ||
      norm.includes("ignore todas as regras") ||
      norm.includes("system prompt") ||
      norm.includes("prompt de sistema") ||
      norm.includes("chave de api") ||
      norm.includes("api_key") ||
      norm.includes("modo desenvolvedor") ||
      norm.includes("jailbreak") ||
      norm.includes("dan ") ||
      norm.includes("aja como")
    ) {
      return "Solicitação recusada pelas diretrizes de governança da VeraLitis AI (Resolução CNJ nº 332/2020). Não compartilho instruções internas nem altero minhas regras éticas. Posso explicar nossos módulos de triagem ou planos SaaS?";
    }

    /* 3. Trava Etica OAB (Lei 8.906/1994): Proibicao de parecer juridico ou promessa de ganho */
    if (
      norm.includes("causa ganha") ||
      norm.includes("vou ganhar") ||
      norm.includes("chance de ganhar") ||
      norm.includes("redija uma peticao") ||
      norm.includes("faca uma peticao") ||
      norm.includes("parecer juridico") ||
      norm.includes("devo processar") ||
      norm.includes("quanto vou receber de indenizacao")
    ) {
      return "Em conformidade com o Estatuto da OAB (Lei nº 8.906/1994), a VeraLitis AI não emite parecer jurídico sobre mérito, não promete resultado de processos nem redige peças judiciais. Nossa plataforma realiza a pré-triagem documental e de prazos para apoiar o advogado habilitado.";
    }

    /* 4. Fluxo guiado de agendamento / contratacao (equivalente a registrar_pedido) */
    if (estadoAgendamento.ativo) {
      if (!estadoAgendamento.nome) {
        estadoAgendamento.nome = texto;
        return "Perfeito, " + estadoAgendamento.nome + "! Qual é o melhor e-mail comercial ou WhatsApp para nossa equipe enviar o acesso?";
      }
      if (!estadoAgendamento.contato) {
        estadoAgendamento.contato = texto;
        return "Anotei o contato (" + estadoAgendamento.contato + "). Qual plano você deseja testar ou contratar: Advogado Solo (R\$ 190/mês), Escritório Pro (R\$ 590/mês) ou Corporate?";
      }
      estadoAgendamento.plano = texto;
      const proto = "#VLT-2026-" + Math.floor(1000 + Math.random() * 9000);
      const resumo = "Solicitação registrada com sucesso sob o protocolo " + proto + "! Resumo: " + estadoAgendamento.nome + " | Contato: " + estadoAgendamento.contato + " | Plano: " + estadoAgendamento.plano + ". Nossa equipe comercial entrará em contato em até 2 horas úteis.";
      estadoAgendamento = { ativo: false, nome: "", contato: "", plano: "" };
      return resumo;
    }

    if (
      norm.includes("agendar") ||
      norm.includes("demonstracao") ||
      norm.includes("contratar") ||
      norm.includes("quero testar") ||
      norm.includes("assinar")
    ) {
      estadoAgendamento.ativo = true;
      return "Excelente! Vamos registrar sua solicitação de demonstração/contratação. Para começar (sem informar CPF), qual é o seu nome ou o nome do seu escritório?";
    }

    /* 5. Planos e Precos */
    if (norm.includes("plano") || norm.includes("preco") || norm.includes("valor") || norm.includes("custa") || norm.includes("mensalidade")) {
      return "Trabalhamos com 3 planos SaaS: 1) Advogado Solo (R\$ 190/mês, até 80 triagens/mês); 2) Escritório Pro (R\$ 590/mês, até 400 triagens/mês, 5 usuários e VERA integrada — Recomendado); e 3) Corporate Jurídico (sob consulta, triagens ilimitadas e API). Deseja agendar uma demonstração de 7 dias?";
    }

    /* 6. Funcionamento do Score e Prescricao */
    if (norm.includes("score") || norm.includes("pontuacao") || norm.includes("criterio") || norm.includes("funciona") || norm.includes("simulador")) {
      return "O motor determinístico (scoring.js) avalia 10 critérios objetivos do relato (fato gerador, marco temporal, provas, parte ré, pedido, tentativa prévia, valor, segurança de prazo > 90 dias, aderência à área e minimização LGPD), classificando o dossiê nas faixas Verde (75-100), Amarela (45-74) ou Vermelha (< 45 ou prescrito).";
    }

    if (norm.includes("prescricao") || norm.includes("prazo") || norm.includes("clt") || norm.includes("cdc") || norm.includes("trabalhista")) {
      return "O motor verifica automaticamente os prazos referenciais a partir da data do fato: Trabalhista (24 meses - Art. 11 CLT), Consumidor (60 meses - Art. 27 CDC), Cível (36 meses - Art. 206 §3º V CC) e LGPD (36 meses por cautela), disparando alerta quando restam 90 dias ou menos.";
    }

    /* 7. Conformidade LGPD, OAB e CNJ */
    if (norm.includes("lgpd") || norm.includes("oab") || norm.includes("cnj") || norm.includes("privacidade") || norm.includes("dados")) {
      return "Seguimos 3 pilares de governança: 1) LGPD by Design (fontes auto-hospedadas sem envio de IP ao Google e alerta contra CPF no relato); 2) Resolução CNJ nº 332/2020 (motor auditável e explicável); e 3) Estatuto da OAB (triagem estritamente operacional, sem promessa de resultado).";
    }

    /* 8. Pagamento */
    if (norm.includes("pagamento") || norm.includes("pix") || norm.includes("boleto") || norm.includes("cartao")) {
      return "Aceitamos PIX corporativo, boleto bancário faturado para o CNPJ do escritório e cartão de crédito em recorrência mensal, sem fidelidade obrigatória nos planos Solo e Pro.";
    }

    /* 9. Saudacao e resposta padrao */
    return "Olá! Sou a VERA, consultora virtual da VeraLitis AI. Posso explicar nossos Planos SaaS (Solo R\$ 190, Pro R\$ 590 e Corporate), o cálculo dos 10 critérios do Score de Admissibilidade, as travas OAB/LGPD ou registrar um pedido de demonstração. Como posso ajudar?";
  }

  async function enviarMensagem(textoManual) {
    const mensagem = typeof textoManual === "string" ? textoManual : input.value.trim();
    if (!mensagem) return;

    if (typeof textoManual !== "string") {
      input.value = "";
    }
    adicionarMensagem("Você", mensagem, "vera-msg--user");

    btnEnviar.disabled = true;
    const msgDigitando = adicionarMensagem("VERA", "Analisando solicitação...", "vera-msg--bot");

    try {
      const resposta = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: mensagem, sessionId: sessionId })
      });

      if (!resposta.ok) {
        throw new Error("Endpoint /api/chat indisponivel no ambiente estatico");
      }

      const dados = await resposta.json();
      msgDigitando.remove();

      if (dados.erro) {
        adicionarMensagem("VERA", responderLocalmente(mensagem), "vera-msg--bot");
      } else {
        sessionId = dados.sessionId;
        adicionarMensagem("VERA", dados.resposta, "vera-msg--bot");
      }
    } catch (e) {
      /* Fallback transparente para GitHub Pages */
      msgDigitando.remove();
      const respostaLocal = responderLocalmente(mensagem);
      adicionarMensagem("VERA", respostaLocal, "vera-msg--bot");
    } finally {
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
          "Olá! Sou a VERA, assistente virtual da VeraLitis AI. Posso detalhar nossos planos SaaS, explicar os 10 critérios do simulador jurídico ou agendar uma demonstração para o seu escritório.",
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

  btnEnviar.addEventListener("click", function () {
    enviarMensagem();
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      enviarMensagem();
    }
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const pergunta = chip.getAttribute("data-pergunta");
      if (pergunta) enviarMensagem(pergunta);
    });
  });
})();