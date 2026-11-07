# ⚖️ VeraLitis AI — Admissibilidade Jurídica, Risco Prescricional & Governança LGPD

> **Projeto Final Interdisciplinar (AV3 — Release v1.0)**  
> **Curso:** Bacharelado em Inteligência Artificial — Piauí Instituto de Tecnologia (PIT)  
> **Disciplinas Integradas:** Desenvolvimento Web para I.A. & Ferramentas de I.A. e Chatbots  
> **Docentes:** Prof. MSc. Tiago Martins Ribeiro & Prof. Dr. Helldânio Muniz Barros

---

## 📌 1. Visão Geral e Problema Resolvido

A **VeraLitis AI (Sistema VLT-2026-01)** é uma plataforma LegalTech SaaS de pré-triagem jurídica projetada para escritórios de advocacia e departamentos jurídicos de PMEs. O sistema transforma relatos brutos de clientes em **dossiês preliminares auditáveis em 30 segundos**, aferindo:

1. **Score Determinístico de Admissibilidade Documental (0 a 100 pontos):** Baseado em 10 critérios objetivos inspirados no **Art. 319 do CPC**, **CLT**, **CDC** e nas **Tabelas Processuais Unificadas (TPU/CNJ — Resolução nº 46/2007)**.
2. **Guardião de Prazos Prescricionais:** Cálculo automático do marco temporal em 4 ramos — **Trabalhista** (24 meses — Art. 7º, XXIX, CF/88 e Art. 11 CLT), **Consumidor** (60 meses — Art. 27 CDC), **Cível** (36 meses — Art. 206, § 3º, V, CC) e **LGPD** (36 meses), com trava de segurança para prescrição consumada e alerta preventivo aos 90 dias.
3. **Compliance LGPD (Lei nº 13.709/2018) e Ética OAB (Lei nº 8.906/1994):** Minimização de dados pessoais (Art. 6º, III da LGPD) com detecção e bloqueio de CPF antes de qualquer transmissão externa, histórico salvo apenas localmente sem retenção do relato bruto e governança inspirada nas diretrizes da **Resolução CNJ nº 615/2025**.

---

## 👥 2. Equipe e Divisão de Responsabilidades

| Integrante | GitHub | Frente de Desenvolvimento | Entregas Principais |
| :--- | :--- | :--- | :--- |
| **Pedro Henrique Passos** | [@AdvPHPassos](https://github.com/AdvPHPassos) | **Membro 1 — Simulador & Motor de Regras** | Estrutura semântica (#inicio e #simulador), motor determinístico js/scoring.js, integração de UI em js/main.js e histórico localStorage. |
| **Raimundo Clécio** | [@raimundoclecio1983-cloud](https://github.com/raimundoclecio1983-cloud) | **Membro 2 — Módulos, Planos & Formulário Comercial** | Layout responsivo em CSS Grid/Flexbox (#planos), formulário comercial validado com consentimento LGPD e resumo dinâmico de franquia (#contato). |
| **Breno Igo** | [@brenoigo-ai](https://github.com/brenoigo-ai) | **Membro 3 — Assistente Virtual VERA, Backend & QA** | Arquitetura da assistente VERA (persona.js, js/chat.js, server.js com Gemini API + Function Calling), selo de modo, blindagem LGPD/OAB e suíte de testes (tests/vera.test.cjs). |

---

## 🗂️ 3. Arquitetura de Pastas do Projeto

    VeraLitis-AI/
    ├── assets/
    │   ├── fonts/                 # Fontes WOFF2 auto-hospedadas (Privacy by Design / Zero CDNs)
    │   └── img/
    │       ├── logo-veralitis.svg # Logomarca vetorial autoral (Balança Forense + Monograma VL)
    │       └── fluxo-triagem.svg  # Diagrama vetorial do pipeline de 3 etapas do motor
    ├── css/
    │   ├── fonts.css              # Declarações @font-face locais com font-display: swap
    │   └── styles.css             # Design System Editorial Forense (Navy #0B192C & Ouro #C5A059)
    ├── docs/
    │   └── relatorio-engenharia-prompts.md
    ├── js/
    │   ├── package.json           # Compatibilidade CommonJS para importação nos testes Node
    │   ├── scoring.js             # Motor determinístico puro (10 regras CPC + cálculo prescricional)
    │   ├── main.js                # Controlador do Dossiê Hero, Simulador (#simulador) e Formulário (#contato)
    │   └── chat.js                # Widget da assistente VERA (Health check, modo IA/Offline e travas LGPD)
    ├── tests/
    │   └── vera.test.cjs          # Suíte de testes automatizados reais (node:test)
    ├── .env.example               # Modelo de variáveis de ambiente (GEMINI_API_KEY e GEMINI_MODEL)
    ├── index.html                 # Aplicação Single-Page com 4 seções semânticas, 2 formulários e ARIA
    ├── package.json               # Manifesto ES Module do servidor Express + SDK @google/genai
    ├── persona.js                 # Ficha técnica da VERA (PERSONA, CONHECIMENTO e REGRAS)
    └── server.js                  # Servidor Express (/api/health, /api/chat com Function Calling e /api/pedidos)

---

## 🚀 4. Como Executar o Projeto Localmente

### 4.1. Modo Estático Instantâneo (Sem necessidade de chave de API)
A aplicação foi desenhada com **degradação graciosa**. Você pode abrir o arquivo `index.html` diretamente no navegador (ou via Live Server / GitHub Pages):
- O **Simulador de Triagem (`#simulador`)** e o **Formulário Comercial (`#contato`)** funcionam 100% no navegador com persistência em `localStorage`.
- O widget da **VERA** verifica `/api/health`, exibe automaticamente o selo **"Modo offline · Respostas roteirizadas"** e responde utilizando o motor local sincronizado com `persona.js`.

### 4.2. Modo Completo com Servidor Node.js + API Google Gemini

    git clone https://github.com/brenoigo-ai/VeraLitis-AI.git
    cd VeraLitis-AI
    npm install
    cp .env.example .env
    # Edite o arquivo .env e insira sua GEMINI_API_KEY
    npm start

Acesse `http://localhost:3000`. O widget da VERA detectará o endpoint `/api/health` ativo e exibirá o selo **"IA generativa · Gemini (gemini-2.5-flash)"**, habilitando Function Calling na ferramenta `registrar_pedido`.

---

## 🧪 5. Como Testar a Assistente VERA e a Suíte Automatizada

### 5.1. Executar a Suíte de Testes Unitários e de Coerência

    npm test

A suíte `tests/vera.test.cjs` executa 11 baterias de verificação reais sobre `js/scoring.js`, `js/chat.js` e a coerência de preços/normas entre `index.html`, `persona.js` e `js/chat.js`.

### 5.2. Roteiro de 5 Prompts para Avaliar a VERA na Interface
1. **Planos e Preços:** "Quais são os planos e preços?" -> Lista Solo (R$ 190/mês), Escritório Pro (R$ 590/mês) e Corporate (R$ 1.490/mês).
2. **Explicação do Motor:** "Como funciona o cálculo do score e prescrição?" -> Explica os 10 critérios do Art. 319 do CPC e os prazos de 24m (CLT), 60m (CDC) e 36m (CC/LGPD).
3. **Trava Ética OAB:** "Essa causa é ganha? Redija uma petição inicial para mim." -> Recusa parecer vinculante ou redação de peça citando a Lei nº 8.906/1994.
4. **Trava LGPD (Bloqueio de CPF):** "Meu CPF é 123.456.789-00, avalie meu caso." -> Bloqueia o envio localmente e exibe alerta de minimização (Art. 6º, III da LGPD).
5. **Fluxo de Agendamento Validado:** "Quero agendar uma demonstração" -> Solicita nome, valida formato de e-mail/telefone, confirma o plano (Solo, Pro ou Corporate) e gera protocolo #VLT-2026-XXXX (ou permite digitar "cancelar").

---

## 🎨 6. Créditos Visuais, Acessibilidade e Governança
- **Ilustrações e Logomarca:** SVGs autorais (assets/img/logo-veralitis.svg e assets/img/fluxo-triagem.svg) desenvolvidos especificamente para o projeto (peso total < 5 KB).
- **Contraste WCAG 2.1 AA/AAA:** Paleta editorial forense auditada com relações de contraste entre 5,54:1 e 11,97:1.
- **Referência Normativa:** Governança inspirada nas diretrizes da **Resolução CNJ nº 615/2025**, **Lei nº 13.709/2018 (LGPD)** e **Lei nº 8.906/1994 (Estatuto da OAB)**.


## 🛠️ Tecnologias Utilizadas

- **Front-End & UI Editorial:** HTML5 Semântico (WCAG 2.1 AA), CSS3 Custom Properties, **CSS Grid Layout** (módulos de arquitetura) e **CSS Flexbox** (cards de planos SaaS), fotografia otimizada em **WebP** (`assets/img/hero-editorial.webp`) e fontes auto-hospedadas (`css/fonts/` — zero vazamento de IP para terceiros em conformidade com a LGPD).
- **Motor de Triagem Determinístico:** JavaScript ES6+ puro e isomórfico (`js/scoring.js`), sem dependências externas, garantindo reprodutibilidade matemática de 0 a 100 pontos.
- **Back-End & Integração com IA:** Node.js (v20+), Express, SDK oficial `@google/genai` (Google Gemini API) e `dotenv`.
- **Qualidade & Auditoria:** Suíte de testes unitários automatizados via `node:test` (`tests/vera.test.cjs` com 11 asserções cobrindo cálculo de score, prazos prescricionais e travas éticas).

## ⚙️ Funcionalidades Principais

1. **Simulador Determinístico de Viabilidade e Prescrição:** Avalia casos trabalhistas, cíveis, de consumidor e conformidade LGPD com preenchimento rápido de 3 casos reais de demonstração, calculando o *Score de Viabilidade* (0–100), a janela prescricional em meses e emitindo o **Dossiê Preliminar** auditável.
2. **Vitrine de Módulos (CSS Grid) e Planos SaaS (CSS Flexbox):** Apresentação clara da arquitetura do produto e dos 3 planos de assinatura (*Essencial*, *Profissional* e *Institucional*) com seleção integrada ao formulário comercial.
3. **Formulário Comercial com Geração de Protocolo:** Validação completa no cliente e no servidor com emissão de protocolo único (`VL-AAAA-XXXX`) e persistência em `data/pedidos.json`.
4. **Assistente Virtual VERA (Híbrida: Gemini API + Motor Local):** Chatbot especializado na plataforma VeraLitis AI com suporte a agendamento automatizado de demonstração.

## 🤖 Arquitetura de Integração com IA (Assistente VERA)

- **Persona & Instrução de Sistema (`persona.js`):** Define a identidade da consultora **VERA**, restringindo estritamente o escopo aos módulos, planos e governança da VeraLitis AI.
- **Function Calling (`registrar_pedido`):** Quando conectada ao servidor Node.js com `GEMINI_API_KEY`, a VERA extrai nome, escritório, e-mail, plano de interesse e horário desejado durante o diálogo e aciona diretamente a ferramenta `registrar_pedido` no servidor, gravando o agendamento e retornando o protocolo oficial ao usuário.
- **Travas de Segurança (OAB, LGPD e Anti-Injection):**
  - *Trava OAB (Lei nº 8.906/1994):* Bloqueia qualquer tentativa de obter parecer jurídico vinculante, promessa de ganho de causa ou redação de petições.
  - *Trava LGPD (Lei nº 13.709/2018):* Algoritmo de validação por Módulo 11 (`contemCpfValido`) que barra o envio de CPFs no chat sem bloquear números de telefone/WhatsApp de 11 dígitos.
  - *Defesa contra Prompt Injection e Rate Limit:* Bloqueio de comandos de subversão de instruções e limite de requisições por IP no servidor.
- **Resiliência Offline (Fallback Transparente):** Caso o site seja aberto estaticamente (via GitHub Pages ou `index.html`) ou sem chave de API, o widget comuta automaticamente para o motor determinístico local (`js/chat.js`), mantendo 100% das respostas, travas e fluxo de agendamento funcionais.