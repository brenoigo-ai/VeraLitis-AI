import "dotenv/config";
import express from "express";
import crypto from "crypto";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { PERSONA, CONHECIMENTO, REGRAS } from "./persona.js";

const app = express();
app.use(express.json());
app.use(express.static("."));

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const sessoes = new Map();
const ARQUIVO_PEDIDOS = "./pedidos.json";

function salvarPedido(dados) {
  let pedidos = [];
  if (fs.existsSync(ARQUIVO_PEDIDOS)) {
    pedidos = JSON.parse(fs.readFileSync(ARQUIVO_PEDIDOS, "utf-8"));
  }
  const novoPedido = {
    id: pedidos.length + 1,
    protocolo: "VLT-2026-" + String(1000 + pedidos.length + 1),
    data: new Date().toLocaleString("pt-BR"),
    ...dados
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
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: montarSystemInstruction(),
          tools: [ferramentaRegistrarPedido]
        }
      });
      sessoes.set(sessionId, chat);
    }

    const chat = sessoes.get(sessionId);
    let resposta = await chat.sendMessage({ message: mensagem });

    while (resposta.functionCalls && resposta.functionCalls.length > 0) {
      const chamada = resposta.functionCalls[0];
      if (chamada.name === "registrar_pedido") {
        const pedidoSalvo = salvarPedido(chamada.args);
        resposta = await chat.sendMessage({
          message: [
            {
              functionResponse: {
                name: "registrar_pedido",
                response: { sucesso: true, pedido: pedidoSalvo }
              }
            }
          ]
        });
      }
    }

    res.json({ resposta: resposta.text, sessionId: sessionId });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao processar mensagem no servidor." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Servidor VeraLitis AI rodando em http://localhost:" + PORT);
});