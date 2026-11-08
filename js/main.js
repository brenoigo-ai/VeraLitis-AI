/* =============================================================
   VeraLitis AI — main.js
   Integração de Interface: Dossiê Hero, Simulador (#simulador),
   Histórico Local LGPD e Formulário Comercial (#contato).
   ============================================================= */

(function () {
  "use strict";

  const STORAGE_HISTORICO = "veralitis_historico_triagens_v1";
  const STORAGE_PEDIDOS_ANTIGO = "veralitis_pedidos_comerciais_v1";

  const NOMES_RAMO = {
    trabalhista: "Trabalhista (CLT)",
    consumidor: "Consumidor (CDC)",
    civel: "Cível / Contratos (CC)",
    lgpd: "Proteção de Dados (LGPD)"
  };

  const CRITERIOS_DECLARADOS = [3, 4, 5, 6, 7];
  const ROTULOS_FAIXA = { verde: "Maduro", amarelo: "Com pendência", vermelho: "Baixa viabilidade" };
  const ROTULOS_SITUACAO = {
    regular: "REGULAR",
    proximo: "PRÓXIMO DO VENCIMENTO",
    prescrito: "POSSÍVEL PRESCRIÇÃO",
    indeterminada: "INDETERMINADO"
  };
  const CORES_FAIXA = { verde: "var(--verde)", amarelo: "var(--amarelo)", vermelho: "var(--vermelho)" };

  function gerarProtocoloLocal() {
    const sorteio = Math.floor(1000 + Math.random() * 9000);
    return "SIM-" + new Date().getFullYear() + "-" + sorteio;
  }

  function preencherTelemetriaHero(resultado) {
    let auto = 0, autoMax = 0, decl = 0, declMax = 0;
    resultado.criterios.forEach(function (c) {
      if (CRITERIOS_DECLARADOS.indexOf(c.id) !== -1) {
        declMax += c.pontos;
        if (c.atendido) decl += c.pontos;
      } else {
        autoMax += c.pontos;
        if (c.atendido) auto += c.pontos;
      }
    });
    function escrever(id, texto) { const el = document.getElementById(id); if (el) el.textContent = texto; }
    function largura(id, pct) { const el = document.getElementById(id); if (el) el.style.width = pct + "%"; }
    escrever("hero-tel-tag", "SCORE " + resultado.score + "/100 · " + resultado.faixa.toUpperCase());
    escrever("hero-tel-auto", auto + " / " + autoMax + " pts");
    escrever("hero-tel-decl", decl + " / " + declMax + " pts");
    largura("hero-tel-auto-fill", Math.round((100 * auto) / autoMax));
    largura("hero-tel-decl-fill", Math.round((100 * decl) / declMax));
    escrever("hero-tel-prazo", ROTULOS_SITUACAO[resultado.prescricao.situacao]);
  }

  function formatarDataISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return ano + "-" + mes + "-" + dia;
  }

  function dataMesesAtras(meses) {
    const d = new Date();
    d.setMonth(d.getMonth() - meses);
    return formatarDataISO(d);
  }

  const CASOS_EXEMPLO = {
    trabalhista: {
      ramo: "trabalhista",
      dataFato: dataMesesAtras(4),
      relato:
        "Trabalhei durante dois anos como analista administrativo em jornada diária com duas horas extras habituais sem pagamento correto no holerite e fui dispensado sem justa causa há quatro meses sem receber os depósitos integrais do FGTS na rescisão contratual.",
      checkboxes: {
        possuiProvas: true,
        identificaRe: true,
        pedidoDefinido: true,
        tentativaPrevia: true,
        valorEstimado: true
      }
    },
    consumidor: {
      ramo: "consumidor",
      dataFato: dataMesesAtras(6),
      relato:
        "Comprei um equipamento eletrônico em loja online e recebi cobrança indevida duplicada na fatura após cancelar o pedido por defeito de fabricação, mas ainda preciso reunir os comprovantes e protocolos de atendimento.",
      checkboxes: {
        possuiProvas: false,
        identificaRe: true,
        pedidoDefinido: true,
        tentativaPrevia: false,
        valorEstimado: false
      }
    },
    prescrito: {
      ramo: "trabalhista",
      dataFato: dataMesesAtras(30),
      relato:
        "Fui dispensado da empresa há mais de dois anos e meio sem receber o pagamento correto das férias vencidas, horas extras realizadas e diferenças de FGTS que constavam na minha carteira de trabalho.",
      checkboxes: {
        possuiProvas: true,
        identificaRe: true,
        pedidoDefinido: true,
        tentativaPrevia: true,
        valorEstimado: true
      }
    },
    lgpd: {
      ramo: "lgpd",
      dataFato: dataMesesAtras(2),
      relato:
        "Identifiquei vazamento de dados pessoais do meu cadastro sem consentimento após incidente na plataforma digital, incluindo exposição do meu CPF 123.456.789-00 e envio contínuo de mensagens de spam sem resposta do encarregado DPO.",
      checkboxes: {
        possuiProvas: true,
        identificaRe: true,
        pedidoDefinido: true,
        tentativaPrevia: true,
        valorEstimado: false
      }
    }
  };

  /* ---------- 1. Dossiê Dinâmico do Hero (#inicio) ---------- */
  function inicializarDossieHero() {
    if (typeof analisarCaso !== "function") return;
    const casoHero = {
      ramo: "trabalhista",
      dataFato: dataMesesAtras(4),
      relato: CASOS_EXEMPLO.trabalhista.relato,
      checkboxes: {
        possuiProvas: false,
        identificaRe: true,
        pedidoDefinido: true,
        tentativaPrevia: true,
        valorEstimado: true
      }
    };
    const resultado = analisarCaso(casoHero);
    if (!resultado || resultado.erro) return;

    const badge = document.getElementById("hero-dossier-badge");
    const pct = document.getElementById("hero-dossier-pct");
    const fill = document.getElementById("hero-dossier-fill");
    const presc = document.getElementById("hero-dossier-presc");

    if (badge) {
      badge.textContent = "Score " + resultado.score + "/100 • " + (ROTULOS_FAIXA[resultado.faixa] || resultado.faixa);
    }
    if (pct) {
      pct.textContent = resultado.score + "% (FAIXA " + resultado.faixa.toUpperCase() + ")";
    }
    if (fill) {
      fill.style.width = resultado.score + "%";
    }
    if (presc && resultado.prescricao && resultado.prescricao.diasRestantes !== null) {
      presc.textContent = ROTULOS_SITUACAO[resultado.prescricao.situacao] + " (" + resultado.prescricao.diasRestantes + " dias restantes)";
    }
    preencherTelemetriaHero(resultado);
  }

  /* ---------- 2. Histórico Local de Triagens (LGPD) ---------- */
  function lerHistorico() {
    try {
      const bruto = localStorage.getItem(STORAGE_HISTORICO);
      return bruto ? JSON.parse(bruto) : [];
    } catch (_) {
      return [];
    }
  }

  function salvarNoHistorico(resultado, protocolo) {
    try {
      const lista = lerHistorico();
      lista.unshift({
        protocolo: protocolo || gerarProtocoloLocal(),
        dataHora: new Date().toLocaleString("pt-BR"),
        ramo: NOMES_RAMO[resultado.ramo] || resultado.ramo,
        score: resultado.score,
        faixa: resultado.faixa.toUpperCase()
      });
      localStorage.setItem(STORAGE_HISTORICO, JSON.stringify(lista.slice(0, 6)));
      renderizarHistorico();
    } catch (_) {
      /* ignora se localStorage estiver bloqueado */
    }
  }

  function renderizarHistorico() {
    const ul = document.getElementById("sim-historico-lista");
    if (!ul) return;
    ul.textContent = "";
    const lista = lerHistorico();

    if (!lista.length) {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = "Nenhuma triagem registrada nesta sessão local.";
      li.appendChild(span);
      ul.appendChild(li);
      return;
    }

    lista.forEach(function (item) {
      const li = document.createElement("li");
      const esq = document.createElement("span");
      esq.textContent = item.protocolo + " • " + item.ramo + " (" + item.dataHora + ")";
      const dir = document.createElement("span");
      dir.className = item.faixa === "VERDE" ? "dossier-tag-ok" : "dossier-tag-pend";
      dir.textContent = "Score " + item.score + "/100 [" + item.faixa + "]";
      li.appendChild(esq);
      li.appendChild(dir);
      ul.appendChild(li);
    });
  }

  /* ---------- 3. Simulador de Triagem (#simulador) ---------- */
  function atualizarContadorRelato() {
    const campoRelato = document.getElementById("sim-relato");
    const contador = document.getElementById("sim-contador-palavras");
    if (!campoRelato || !contador || typeof contarPalavras !== "function") return;

    const texto = campoRelato.value || "";
    const total = contarPalavras(texto);
    const temPII = typeof detectarDadosPessoais === "function" && detectarDadosPessoais(texto);

    if (temPII) {
      contador.textContent =
        total + " palavras digitadas — ⚠️ ALERTA LGPD (Art. 6º, III): CPF, telefone ou e-mail detectado no relato. Remova dados pessoais diretos.";
      contador.style.color = "#B45309";
    } else if (total >= 25) {
      contador.textContent = total + " palavras digitadas (requisito mínimo de 25 palavras atendido ✓).";
      contador.style.color = "#16653B";
    } else {
      contador.textContent = total + " palavras digitadas (mínimo recomendado: 25 palavras).";
      contador.style.color = "";
    }
  }

  function renderizarResultadoSimulador(resultado) {
    const container = document.getElementById("sim-resultado");
    if (!container) return;
    container.hidden = false;

    const proto = document.getElementById("res-protocolo");
    const titulo = document.getElementById("res-titulo");
    const badge = document.getElementById("res-badge");
    const msg = document.getElementById("res-mensagem");
    const barraTexto = document.getElementById("res-barra-texto");
    const barraFill = document.getElementById("res-barra-fill");
    const presc = document.getElementById("res-prescricao");
    const baseLegal = document.getElementById("res-base-legal");
    const lgpd = document.getElementById("res-lgpd");
    const ulChecklist = document.getElementById("res-checklist");
    const ulCriterios = document.getElementById("res-criterios");

    if (resultado.erro) {
      if (titulo) titulo.textContent = "Atenção: Entrada Inválida";
      if (badge) {
        badge.className = "badge badge-vermelho";
        badge.textContent = "Erro de Validação";
      }
      if (msg) msg.textContent = resultado.erro;
      return;
    }

    const codigoProto = gerarProtocoloLocal();
    if (proto) proto.textContent = "DOSSIÊ PRELIMINAR • ID LOCAL " + codigoProto;
    if (titulo) titulo.textContent = "Triagem: " + (NOMES_RAMO[resultado.ramo] || resultado.ramo);

    if (badge) {
      badge.className = "badge badge-" + resultado.faixa;
      badge.textContent = "Score " + resultado.score + "/100 • Faixa " + resultado.faixa.toUpperCase();
    }
    if (msg) msg.textContent = resultado.mensagem;
    const alertaCritico = document.getElementById("res-alerta-critico");
    const corFaixa = CORES_FAIXA[resultado.faixa];

    if (barraTexto) {
      barraTexto.textContent = resultado.score + "% (FAIXA " + resultado.faixa.toUpperCase() + ")";
      barraTexto.style.color = corFaixa;
      barraTexto.style.fontWeight = "700";
    }
    if (barraFill) {
      barraFill.style.width = resultado.score + "%";
      barraFill.style.background = corFaixa;
    }

    if (alertaCritico) {
      if (resultado.prescricao && resultado.prescricao.situacao === "prescrito") {
        alertaCritico.hidden = false;
        alertaCritico.style.background = "#FEE2E2";
        alertaCritico.style.border = "2px solid #DC2626";
        alertaCritico.style.color = "#991B1B";
        alertaCritico.textContent = "⛔ TRAVA DE RISCO PRESCRICIONAL ATIVADA (CPC, Art. 487, II): Apesar de o relato pontuar " + resultado.score + "/100 nos critérios documentais, o prazo legal de " + resultado.prescricao.meses + " meses já foi ultrapassado em " + Math.abs(resultado.prescricao.diasRestantes) + " dias (" + resultado.prescricao.baseLegal + "). O caso é rebaixado obrigatoriamente para a FAIXA VERMELHA.";
      } else if (resultado.faixa === "amarelo") {
        alertaCritico.hidden = false;
        alertaCritico.style.background = "#FEF3C7";
        alertaCritico.style.border = "2px solid #D97706";
        alertaCritico.style.color = "#92400E";
        alertaCritico.textContent = "⚠️ ATENÇÃO — PENDÊNCIA PROBATÓRIA (FAIXA AMARELA): O caso é tempestivo, mas exige juntada de documentos comprobatórios mínimos antes do ajuizamento.";
      } else {
        alertaCritico.hidden = true;
      }
    }

    if (presc && resultado.prescricao) {
      if (resultado.prescricao.situacao === "prescrito") {
        presc.textContent = "⛔ PRESCRITO (" + Math.abs(resultado.prescricao.diasRestantes) + " dias após o limite)";
        presc.style.color = "#DC2626";
        presc.style.fontWeight = "700";
      } else if (resultado.prescricao.diasRestantes !== null) {
        presc.textContent =
          ROTULOS_SITUACAO[resultado.prescricao.situacao] + " (" + resultado.prescricao.diasRestantes + " dias restantes)";
        presc.style.color = "#16653B";
        presc.style.fontWeight = "600";
      } else {
        presc.textContent = "Indeterminado";
        presc.style.color = "";
      }
    }

    if (baseLegal && resultado.prescricao) {
      baseLegal.textContent = resultado.prescricao.baseLegal;
    }

    if (lgpd) {
      lgpd.textContent = resultado.dadosPessoaisDetectados
        ? "Alerta: Dados pessoais detectados no relato (remova CPF/telefone)"
        : "Minimização OK (Sem CPF/telefone no relato)";
    }

    if (ulChecklist) {
      ulChecklist.textContent = "";
      (resultado.checklistDocumentos || []).forEach(function (doc, idx) {
        const li = document.createElement("li");
        const s1 = document.createElement("span");
        s1.textContent = idx + 1 + ". " + doc;
        const s2 = document.createElement("span");
        s2.className = "dossier-tag-ok";
        s2.textContent = "[OBRIGATÓRIO]";
        li.appendChild(s1);
        li.appendChild(s2);
        ulChecklist.appendChild(li);
      });
    }

    if (ulCriterios) {
      ulCriterios.textContent = "";
      (resultado.criterios || []).forEach(function (crit) {
        const li = document.createElement("li");
        const s1 = document.createElement("span");
        const declarado = CRITERIOS_DECLARADOS.indexOf(crit.id) !== -1;
        const origem = declarado ? " — declarado por você" : " — verificado pelo motor";
        s1.textContent = crit.id + ". " + crit.nome + " (" + crit.pontos + " pts)" + origem;
        const s2 = document.createElement("span");
        s2.className = crit.atendido ? "dossier-tag-ok" : "dossier-tag-pend";
        s2.textContent = crit.atendido ? "[OK]" : "[PENDENTE]";
        li.appendChild(s1);
        li.appendChild(s2);
        ulCriterios.appendChild(li);
      });
    }

    salvarNoHistorico(resultado, codigoProto);
  }

  function configurarSimulador() {
    const form = document.getElementById("form-simulador");
    const campoRamo = document.getElementById("sim-ramo");
    const campoData = document.getElementById("sim-data");
    const campoRelato = document.getElementById("sim-relato");
    const chkProvas = document.getElementById("chk-provas");
    const chkRe = document.getElementById("chk-re");
    const chkPedido = document.getElementById("chk-pedido");
    const chkTentativa = document.getElementById("chk-tentativa");
    const chkValor = document.getElementById("chk-valor");

    if (!form) return;

    const hojeISO = formatarDataISO(new Date());
    if (campoData) {
      campoData.max = hojeISO;
      if (!campoData.value) campoData.value = dataMesesAtras(4);
    }

    if (campoRelato) {
      campoRelato.addEventListener("input", atualizarContadorRelato);
    }

    document.querySelectorAll(".btn-caso-exemplo").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const chave = btn.getAttribute("data-caso");
        const exemplo = CASOS_EXEMPLO[chave];
        if (!exemplo) return;

        if (campoRamo) campoRamo.value = exemplo.ramo;
        if (campoData) campoData.value = exemplo.dataFato;
        if (campoRelato) campoRelato.value = exemplo.relato;
        if (chkProvas) chkProvas.checked = Boolean(exemplo.checkboxes.possuiProvas);
        if (chkRe) chkRe.checked = Boolean(exemplo.checkboxes.identificaRe);
        if (chkPedido) chkPedido.checked = Boolean(exemplo.checkboxes.pedidoDefinido);
        if (chkTentativa) chkTentativa.checked = Boolean(exemplo.checkboxes.tentativaPrevia);
        if (chkValor) chkValor.checked = Boolean(exemplo.checkboxes.valorEstimado);

        atualizarContadorRelato();
        const res = analisarCaso(exemplo);
        renderizarResultadoSimulador(res);
      });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (typeof analisarCaso !== "function") return;

      const entrada = {
        ramo: campoRamo ? campoRamo.value : "trabalhista",
        dataFato: campoData ? campoData.value : "",
        relato: campoRelato ? campoRelato.value : "",
        checkboxes: {
          possuiProvas: Boolean(chkProvas && chkProvas.checked),
          identificaRe: Boolean(chkRe && chkRe.checked),
          pedidoDefinido: Boolean(chkPedido && chkPedido.checked),
          tentativaPrevia: Boolean(chkTentativa && chkTentativa.checked),
          valorEstimado: Boolean(chkValor && chkValor.checked)
        }
      };

      const resultado = analisarCaso(entrada);
      renderizarResultadoSimulador(resultado);
    });

    form.addEventListener("reset", function () {
      setTimeout(function () {
        if (campoData) campoData.value = dataMesesAtras(4);
        atualizarContadorRelato();
        const container = document.getElementById("sim-resultado");
        if (container) container.hidden = true;
      }, 10);
    });

    const btnLimparHist = document.getElementById("btn-limpar-historico");
    if (btnLimparHist) {
      btnLimparHist.addEventListener("click", function () {
        try {
          localStorage.removeItem(STORAGE_HISTORICO);
        } catch (_) {}
        renderizarHistorico();
      });
    }

    renderizarHistorico();
  }

  /* ---------- 4. Seleção de Planos e Formulário (#contato) ---------- */
  function configurarFormularioContato() {
    const formContato = document.getElementById("form-contato");
    const selectPlano = document.getElementById("contato-plano");
    const inputVolume = document.getElementById("contato-volume");
    const resumoFranquia = document.getElementById("contato-resumo-franquia");
    const feedback = document.getElementById("contato-feedback");

    document.querySelectorAll("[data-selecionar-plano]").forEach(function (link) {
      link.addEventListener("click", function () {
        const plano = link.getAttribute("data-selecionar-plano");
        if (selectPlano && plano) {
          selectPlano.value = plano;
          atualizarResumoFranquia();
        }
      });
    });

    function atualizarResumoFranquia() {
      if (!inputVolume || !resumoFranquia) return;
      const vol = Number(inputVolume.value) || 0;
      if (vol <= 80) {
        resumoFranquia.textContent =
          "Para " + vol + " triagens/mês: o Plano Advogado Solo (R$ 190/mês — até 80 triagens) atende integralmente.";
      } else if (vol <= 400) {
        resumoFranquia.textContent =
          "Para " + vol + " triagens/mês: recomendamos o Plano Escritório Pro (R$ 590/mês — até 400 triagens + IA VERA).";
      } else {
        resumoFranquia.textContent =
          "Para " + vol + " triagens/mês: recomendamos o Plano Corporate Jurídico (R$ 1.490/mês — triagens ilimitadas e API).";
      }
    }

    if (inputVolume) inputVolume.addEventListener("input", atualizarResumoFranquia);
    if (selectPlano) selectPlano.addEventListener("change", atualizarResumoFranquia);

    if (!formContato) return;

    formContato.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      if (!feedback) return;

      const nome = (document.getElementById("contato-nome")?.value || "").trim();
      const registro = (document.getElementById("contato-registro")?.value || "").trim();
      const email = (document.getElementById("contato-email")?.value || "").trim();
      const telefone = (document.getElementById("contato-telefone")?.value || "").trim();
      const plano = (selectPlano?.value || "pro").trim();
      const volume = Number(inputVolume?.value || 0);
      const modalidade = (document.getElementById("contato-modalidade")?.value || "").trim();
      const lgpdOk = Boolean(document.getElementById("contato-lgpd")?.checked);

      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!nome || !registro || !emailValido || telefone.length < 8 || volume < 1 || !lgpdOk) {
        feedback.hidden = false;
        feedback.className = "legal-notice-bar";
        feedback.textContent =
          "⚠️ Preencha todos os campos obrigatórios com um e-mail comercial válido, telefone institucional e marque o consentimento LGPD.";
        return;
      }

      const protocolo = "#VLT-2026-" + String(Math.floor(1000 + Math.random() * 9000));
      let gravadoServidor = false;

      try {
        const resp = await fetch("/api/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: nome,
            registro: registro,
            contato: email + " | " + telefone,
            plano: plano,
            volume: volume,
            modalidade: modalidade,
            protocolo: protocolo
          })
        });
        gravadoServidor = resp.ok;
      } catch (_) {
        gravadoServidor = false;
      }

      try {
        const salvos = JSON.parse(localStorage.getItem(STORAGE_PEDIDOS) || "[]");
        salvos.unshift({
          protocolo: protocolo,
          nome: nome,
          plano: plano,
          modalidade: modalidade,
          dataHora: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_PEDIDOS, JSON.stringify(salvos.slice(0, 10)));
      } catch (_) {}

      feedback.hidden = false;
      feedback.className = "dossier-preview";
      feedback.textContent = "";

      const titulo = document.createElement("h3");
      titulo.className = "dossier-preview__title";
      titulo.textContent = "Solicitação Registrada • Protocolo " + protocolo;

      const detalhe = document.createElement("p");
      detalhe.style.marginTop = "8px";
      detalhe.textContent =
        "Escritório/Advogado: " +
        nome +
        " (" +
        registro +
        ") | Plano: " +
        plano.toUpperCase() +
        " | Modalidade: " +
        modalidade +
        ".";

      const modoNota = document.createElement("small");
      modoNota.className = "text-muted";
      modoNota.textContent = gravadoServidor
        ? "Status: Pedido persistido com sucesso no servidor da VeraLitis AI."
        : "Status: Simulação concluída em modo estático local (gravado em localStorage; nenhum dado enviado a terceiros).";

      feedback.appendChild(titulo);
      feedback.appendChild(detalhe);
      feedback.appendChild(modoNota);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    inicializarDossieHero();
    configurarSimulador();
    configurarFormularioContato();
  });
})();

