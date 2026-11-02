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
app.use(express.json());

/* A.3: Restringe arquivos estaticos apenas ao frontend publico (protege server.js, persona.js e data/pedidos.json) */
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/index.html", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/tests", express.static(path.join(__dirname, "tests")));

const MODELO_GEMINI = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ARQUIVO_PEDIDOS = process.env.PEDIDOS_PATH || path.join(__dirname, "data", "pedidos.json");

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const sessoes = new Map();

function salvarPedido(dados) {
  const pasta = path.dirname(ARQUIVO_PEDIDOS);
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }
  let pedidos = [];
  if (fs.existsSync(ARQUIVO_PEDIDOS)) {
    pedidos = JSON.parse(fs.readFileSync(ARQUIVO_PEDIDOS, "utf-8"));
  }
  const novoPedido = {
    id: pedidos.length + 1,
    protocolo: "VLT-2026-" + String(1000 + pedidos.length + 1),
    data: new Date().toLocaleString("pt-BR"),
    nome: String(dados.nome || "").trim(),
    telefone: String(dados.telefone || "").trim(),
    pedido: String(dados.pedido || "").trim()
  };
  pedidos.push(novoPedido);
  fs.writeFileSync(ARQUIVO_PEDIDOS, JSON.stringify(pedidos, null, 2));
  return novoPedido;
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

/* A.2 e B.5: Endpoint de healthcheck para deteccao limpa do modo servidor */
app.get("/api/health", function (req, res) {
  res.json({
    ok: Boolean(ai),
    modo: ai ? "gemini" : "local",
    modelo: MODELO_GEMINI
  });
});

app.post("/api/chat", async function (req, res) {
  try {
    const mensagem = req.body && req.body.mensagem ? String(req.body.mensagem).trim() : "";
    let sessionId = req.body ? req.body.sessionId : null;

    if (!mensagem) {
      return res.status(400).json({ erro: "Mensagem vazia." });
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
          tools: [ferramentaRegistrarPedido]
        }
      });
      sessoes.set(sessionId, chat);
    }

    const chat = sessoes.get(sessionId);
    let resposta = await chat.sendMessage({ message: mensagem });

    /* A.1: Laco de Function Calling com teto de 3 iteracoes e tratamento de ferramentas desconhecidas */
    const MAX_ITERACOES = 3;
    let iteracao = 0;

    while (resposta.functionCalls && resposta.functionCalls.length > 0 && iteracao < MAX_ITERACOES) {
      iteracao += 1;
      const retornosFuncoes = [];

      for (let i = 0; i < resposta.functionCalls.length; i += 1) {
        const chamada = resposta.functionCalls[i];
        if (chamada.name === "registrar_pedido") {
          const pedidoSalvo = salvarPedido(chamada.args || {});
          retornosFuncoes.push({
            functionResponse: {
              name: "registrar_pedido",
              response: { sucesso: true, pedido: pedidoSalvo }
            }
          });
        } else {
          retornosFuncoes.push({
            functionResponse: {
              name: chamada.name,
              response: { sucesso: false, erro: "Ferramenta desconhecida: " + chamada.name }
            }
          });
        }
      }

      resposta = await chat.sendMessage({ message: retornosFuncoes });
    }

    const textoFinal = resposta && resposta.text && String(resposta.text).trim()
      ? String(resposta.text).trim()
      : "Solicitação processada pelas diretrizes da VeraLitis AI. Como posso auxiliar nos módulos de triagem ou planos SaaS?";

    res.json({ resposta: textoFinal, sessionId: sessionId, modelo: MODELO_GEMINI });
  } catch (erro) {
    console.error("Erro em /api/chat:", erro);
    res.status(500).json({ erro: "Erro ao processar mensagem no servidor." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Servidor VeraLitis AI rodando em http://localhost:" + PORT + " | Modelo: " + MODELO_GEMINI + " | API Key configurada: " + Boolean(ai));
});