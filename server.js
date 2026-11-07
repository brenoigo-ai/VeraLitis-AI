function contemCpfValido(texto) {
  const achados = String(texto).match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g) || [];
  return achados.some(function (c) {
    if (/[.-]/.test(c)) return true;
    const d = c.split("").map(Number);
    if (new Set(d).size === 1) return false;
    for (let t = 9; t < 11; t++) {
      let s = 0;
      for (let i = 0; i < t; i++) s += d[i] * (t + 1 - i);
      if (((s * 10) % 11) % 10 !== d[t]) return false;
    }
    return true;
  });
}
import "dotenv/config";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { PERSONA, CONHECIMENTO, REGRAS } from "./persona.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

/* A.3: Restringe arquivos estaticos apenas ao frontend publico (protege server.js, persona.js, .env e data/) */
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/index.html", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.use("/css", express.static(path.join(__dirname, "css"), { maxAge: "7d" }));
app.use("/js", express.static(path.join(__dirname, "js"), { maxAge: "7d" }));
app.use("/assets", express.static(path.join(__dirname, "assets"), { maxAge: "7d" }));

const MODELO_GEMINI = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ARQUIVO_PEDIDOS = process.env.PEDIDOS_PATH || path.join(__dirname, "data", "pedidos.json");
const REGEX_CPF = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/;

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const sessoes = new Map();
const janelaRequisicoesIp = new Map();

/* Limpeza periodica de sessoes inativas (> 30 min) */
setInterval(function () {
  const agora = Date.now();
  for (const [id, sessao] of sessoes.entries()) {
    if (agora - sessao.ultimoUso > 30 * 60 * 1000) {
      sessoes.delete(id);
    }
  }
}, 5 * 60 * 1000).unref();

function verificarRateLimit(ip) {
  const agora = Date.now();
  const registro = janelaRequisicoesIp.get(ip) || { cont: 0, inicio: agora };
  if (agora - registro.inicio > 60000) {
    registro.cont = 1;
    registro.inicio = agora;
  } else {
    registro.cont += 1;
  }
  janelaRequisicoesIp.set(ip, registro);
  return registro.cont <= 20;
}

export function salvarPedido(dados) {
  try {
    const pasta = path.dirname(ARQUIVO_PEDIDOS);
    if (!fs.existsSync(pasta)) {
      fs.mkdirSync(pasta, { recursive: true });
    }
    let pedidos = [];
    if (fs.existsSync(ARQUIVO_PEDIDOS)) {
      try {
        pedidos = JSON.parse(fs.readFileSync(ARQUIVO_PEDIDOS, "utf-8"));
      } catch (_) {
        pedidos = [];
      }
    }
    const novoPedido = {
      id: pedidos.length + 1,
      protocolo: dados.protocolo || ("VLT-2026-" + String(1000 + pedidos.length + 1)),
      data: new Date().toLocaleString("pt-BR"),
      nome: String(dados.nome || "").trim().slice(0, 120),
      telefone: String(dados.telefone || dados.contato || "").trim().slice(0, 120),
      pedido: String(dados.pedido || dados.plano || "pro").trim().slice(0, 120)
    };
    pedidos.push(novoPedido);
    fs.writeFileSync(ARQUIVO_PEDIDOS, JSON.stringify(pedidos.slice(-100), null, 2));
    return novoPedido;
  } catch (err) {
    return {
      id: 0,
      protocolo: "VLT-2026-" + String(Math.floor(1000 + Math.random() * 9000)),
      data: new Date().toLocaleString("pt-BR"),
      nome: String(dados.nome || "").trim(),
      telefone: String(dados.telefone || dados.contato || "").trim(),
      pedido: String(dados.pedido || dados.plano || "pro").trim(),
      aviso: "Registro em memória (disco indisponível)"
    };
  }
}

const ferramentaRegistrarPedido = {
  functionDeclarations: [
    {
      name: "registrar_pedido",
      description: "Registra uma solicitação de demonstração ou contratação de plano SaaS da VeraLitis AI quando o cliente confirma nome, telefone/contato e plano desejado.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          nome: {
            type: Type.STRING,
            description: "Nome completo do advogado, gestor ou escritório"
          },
          telefone: {
            type: Type.STRING,
            description: "Telefone, WhatsApp ou e-mail comercial para contato"
          },
          pedido: {
            type: Type.STRING,
            description: "Plano escolhido (Advogado Solo, Escritório Pro ou Corporate) e observações"
          }
        },
        required: ["nome", "telefone", "pedido"]
      }
    }
  ]
};

function montarSystemInstruction() {
  const regrasFormatadas = REGRAS.map(function (r) { return "- " + r; }).join("\n");
  return [
    "Você é " + PERSONA.nome + ", assistente virtual da " + PERSONA.empresa + " (" + PERSONA.ramo + ").",
    "Seu objetivo: " + PERSONA.objetivo + ".",
    "Tom de voz: " + PERSONA.tom + ".",
    "",
    "BASE DE CONHECIMENTO:",
    CONHECIMENTO,
    "",
    "REGRAS OBRIGATORIAS:",
    regrasFormatadas
  ].join("\n");
}

/* Healthcheck para deteccao limpa do modo servidor */
app.get("/api/health", function (req, res) {
  res.json({
    ok: Boolean(ai),
    modo: ai ? "gemini" : "local",
    modelo: MODELO_GEMINI
  });
});

/* Endpoint para o formulario comercial (#contato) */
app.post("/api/pedidos", function (req, res) {
  const ip = req.ip || "local";
  if (!verificarRateLimit(ip)) {
    return res.status(429).json({ erro: "Limite de requisições excedido. Tente novamente em 1 minuto." });
  }
  const corpo = req.body || {};
  const nome = String(corpo.nome || "").trim();
  const contato = String(corpo.contato || corpo.telefone || "").trim();
  const plano = String(corpo.plano || corpo.pedido || "").trim();

  if (!nome || !contato || !plano) {
    return res.status(400).json({ erro: "Campos obrigatórios ausentes (nome, contato e plano)." });
  }
  const salvo = salvarPedido({
    nome: nome,
    telefone: contato,
    pedido: plano + (corpo.modalidade ? " - " + corpo.modalidade : ""),
    protocolo: corpo.protocolo
  });
  return res.status(201).json({ ok: true, pedido: salvo });
});

app.post("/api/chat", async function (req, res) {
  try {
    const ip = req.ip || "local";
    if (!verificarRateLimit(ip)) {
      return res.status(429).json({ erro: "Muitas mensagens em sequência. Aguarde um instante." });
    }

    const mensagem = req.body && req.body.mensagem ? String(req.body.mensagem).trim() : "";
    let sessionId = req.body ? req.body.sessionId : null;

    if (!mensagem) {
      return res.status(400).json({ erro: "Mensagem vazia." });
    }
    if (mensagem.length > 500) {
      return res.status(400).json({ erro: "Mensagem excede o limite de 500 caracteres." });
    }

    /* Bloqueio LGPD no servidor ANTES de enviar ao modelo externo */
    if (contemCpfValido(mensagem)) {
      return res.json({
        resposta: "ALERTA LGPD (Art. 6º, III - Minimização): Detectei um padrão de CPF na sua mensagem. Por segurança, o número foi bloqueado antes do envio ao modelo externo. Como posso ajudar com os planos ou funcionamento da plataforma?",
        sessionId: sessionId
      });
    }

    if (!ai) {
      return res.status(503).json({ erro: "GEMINI_API_KEY nao configurada no servidor." });
    }

    if (!sessionId || !sessoes.has(sessionId)) {
      sessionId = crypto.randomUUID();
      const chat = ai.chats.create({
        model: MODELO_GEMINI,
        config: {
          systemInstruction: montarSystemInstruction(),
          tools: [ferramentaRegistrarPedido],
          temperature: 0.3,
          maxOutputTokens: 1024
        }
      });
      sessoes.set(sessionId, { chat: chat, ultimoUso: Date.now(), pedidosRegistrados: 0 });
    }

    const sessao = sessoes.get(sessionId);
    sessao.ultimoUso = Date.now();
    let resposta = await sessao.chat.sendMessage({ message: mensagem });

    const MAX_ITERACOES = 3;
    let iteracao = 0;

    while (resposta.functionCalls && resposta.functionCalls.length > 0 && iteracao < MAX_ITERACOES) {
      iteracao += 1;
      const retornosFuncoes = [];

      for (let i = 0; i < resposta.functionCalls.length; i += 1) {
        const chamada = resposta.functionCalls[i];
        if (chamada.name === "registrar_pedido") {
          if (sessao.pedidosRegistrados >= 2) {
            retornosFuncoes.push({
              functionResponse: { id: chamada.id, name: chamada.name,
                response: { sucesso: false, erro: "Limite de pedidos por sessão atingido." }
              }
            });
          } else {
            const pedidoSalvo = salvarPedido(chamada.args || {});
            sessao.pedidosRegistrados += 1;
            retornosFuncoes.push({
              functionResponse: { id: chamada.id, name: chamada.name,
                response: { sucesso: true, pedido: pedidoSalvo }
              }
            });
          }
        } else {
          retornosFuncoes.push({
            functionResponse: { id: chamada.id, name: chamada.name,
              response: { sucesso: false, erro: "Ferramenta desconhecida: " + chamada.name }
            }
          });
        }
      }

      resposta = await sessao.chat.sendMessage({ message: retornosFuncoes });
    }

    const textoLimpo = String(resposta.text || "Não consegui processar a resposta no momento.")
      .replace(/\*\*/g, "");

    return res.json({
      resposta: textoLimpo,
      sessionId: sessionId
    });
  } catch (erro) {
    console.error("Erro em /api/chat:", erro.message);
    return res.status(500).json({ erro: "Falha ao processar mensagem na assistente VERA." });
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, function () {
    console.log("Servidor VeraLitis AI ativo em http://localhost:" + PORT);
  });
}

export default app;
