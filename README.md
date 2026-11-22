# ⚖️ VeraLitis AI — Admissibilidade Jurídica, Risco Prescricional & Governança LGPD

> **Projeto Final Interdisciplinar (AV3 — Release v1.0)**  
> **Curso:** Bacharelado em Inteligência Artificial — Faculdade Estadual Piauí – Instituto de Tecnologia (PIT)  
> **Disciplinas Integradas:** Desenvolvimento Web para I.A. & Ferramentas de I.A. e Chatbots  
> **Docentes:** Prof. MSc. Tiago Martins Ribeiro & Prof. Dr. Helldânio Muniz Barros  
> **Deploy Público (GitHub Pages):** https://brenoigo-ai.github.io/VeraLitis-AI/  
> **Repositório Oficial:** https://github.com/brenoigo-ai/VeraLitis-AI

---

## 📌 1. Visão Geral e Problema Resolvido

A **VeraLitis AI (Sistema VLT-2026-01)** é uma plataforma LegalTech SaaS acadêmica de pré-triagem jurídica preliminar projetada para advogados autônomos, escritórios de advocacia e departamentos jurídicos de PMEs. O sistema transforma relatos brutos de clientes em **dossiês preliminares auditáveis**, aferindo:

1. **Score Determinístico de Admissibilidade Documental (0 a 100 pontos):** Baseado em 10 critérios objetivos inspirados no **Art. 319 do CPC**, **CLT**, **CDC** e **LGPD** (5 verificados automaticamente pelo motor e 5 declarados pelo usuário).
2. **Guardião de Prazos Prescricionais de Referência:** Cálculo automático em 4 ramos — **Trabalhista** (24 meses após rescisão — CF/88, art. 7º, XXIX e CLT, art. 11), **Consumidor** (60 meses para fato do produto/serviço — CDC, art. 27), **Cível extracontratual** (36 meses — CC, art. 206, § 3º, V) e **LGPD** (36 meses adotados por cautela), com alerta preventivo aos 90 dias.
3. **Compliance LGPD (Lei nº 13.709/2018) e Ética OAB (Lei nº 8.906/1994):** Minimização de dados pessoais (art. 6º, III da LGPD) com bloqueio de CPF antes de qualquer chamada externa, histórico local sem retenção do relato bruto, fontes auto-hospedadas sem CDN e governança inspirada na **Resolução CNJ nº 615/2025**.

---

## 🌐 2. Acesso Online (Deploy)

- **Site em produção (GitHub Pages):** https://brenoigo-ai.github.io/VeraLitis-AI/
- **Nota operacional:** No GitHub Pages o site opera 100% em modo estático seguro (sem exposição de chave de API), ativando automaticamente o modo offline roteirizado da assistente VERA via verificação de `GET /api/health`. Para testar a integração ativa com a API Google Gemini e Function Calling (`registrar_pedido`), execute o servidor local conforme a Seção 6.

---

## 👥 3. Equipe e Divisão de Responsabilidades

| Integrante | GitHub | Frente de Desenvolvimento | Entregas Principais |
| :--- | :--- | :--- | :--- |
| **Pedro Henrique Passos** | [@AdvPHPassos](https://github.com/AdvPHPassos) | **Simulador & Motor de Regras** | Seções `#inicio` e `#simulador`, motor determinístico `js/scoring.js`, controlador de UI `js/main.js` e histórico `localStorage`. |
| **Raimundo Clécio Dantas Muniz Filho** | [@raimundoclecio1983-cloud](https://github.com/raimundoclecio1983-cloud) | **Módulos, Planos & Formulário Comercial** | Cards responsivos em CSS Grid e Flexbox (`#planos`), formulário comercial validado com consentimento LGPD e recomendação dinâmica de plano (`#contato`). |
| **Breno Igo Borges Pereira de Araújo** | [@brenoigo-ai](https://github.com/brenoigo-ai) | **Tech Lead, Assistente VERA, Backend & QA** | Design system (`css/styles.css`), fontes locais LGPD, assistente VERA (`persona.js`, `js/lgpd.js`, `js/chat.js`, `server.js` com Gemini + Function Calling) e 23 testes automatizados (`tests/vera.test.cjs`). |

---

## 🛠️ 4. Tecnologias Utilizadas

- **Front-End:** HTML5 semântico (acessibilidade WCAG 2.1 AA, skip link e `aria-live`), CSS3 (Custom Properties, **CSS Grid**, **CSS Flexbox**, Media Queries em `980px`, `860px` e `640px`), imagens otimizadas em WebP/SVG e fontes WOFF2 auto-hospedadas em `css/fonts/`.
- **Motor Determinístico e Blindagem Cliente:** JavaScript ES6+ puro e isomórfico (`js/scoring.js` e `js/lgpd.js`), sem dependências externas.
- **Back-End do Chatbot:** Node.js (`>= 20`), Express `^4.21.2`, `dotenv ^16.4.7`.
- **Inteligência Artificial:** Google Gemini API via SDK oficial `@google/genai ^1.0.0` (modelo padrão configurável: `gemini-3.8-flash`) com Function Calling (`registrar_pedido`).
- **Qualidade & Deploy:** Testes automatizados nativos via `node:test` (`tests/vera.test.cjs`, 23 testes aprovados), Git/GitHub e GitHub Pages.

---

## ⚙️ 5. Principais Funcionalidades

1. **Simulador Determinístico de Triagem (`#simulador`):** Avalia casos nos 4 ramos (Trabalhista, Consumidor, Cível e LGPD) com preenchimento rápido de **4 casos de referência** (`trabalhista`, `consumidor`, `prescrito` e `lgpd`), calculando score (0–100), faixa de maturidade, janela prescricional, checklist probatório e histórico local das 6 últimas triagens (sem salvar o relato).
2. **Vitrine Modular e Planos SaaS (`#planos`):** 3 módulos técnicos estruturados em **CSS Grid** e 3 planos de assinatura (**Advogado Solo** R$ 190/mês, **Escritório Pro** R$ 590/mês e **Corporate Jurídico** R$ 1.490/mês) em **CSS Flexbox**.
3. **Formulário Comercial com Protocolo (`#contato`):** Validação cliente/servidor, recomendação automática de plano por volume mensal, consentimento obrigatório LGPD e emissão de protocolo (`VLT-AAAA-NNNN` no servidor; `SIM-AAAA-NNNN` no modo estático).
4. **Assistente Virtual VERA (`#vera-chat-widget`):** Chatbot híbrido com persona própria, Function Calling para registro de demonstrações, travas OAB/LGPD/Anti-Injection e fallback offline transparente.

---

## 🚀 6. Instruções de Instalação e Execução

### 6.1 Modo Estático (Sem chave de API)
Acesse https://brenoigo-ai.github.io/VeraLitis-AI/ ou abra `index.html` no navegador. O widget detecta a ausência de `/api/health`, exibe **"Modo offline · Respostas roteirizadas"** e mantém 100% das travas e fluxos operacionais.

### 6.2 Modo Completo (Servidor Node.js + Google Gemini API)

    git clone https://github.com/brenoigo-ai/VeraLitis-AI.git
    cd VeraLitis-AI
    npm install
    cp .env.example .env
    # Edite o .env e insira sua GEMINI_API_KEY (nunca versione este arquivo)
    npm start

Acesse `http://localhost:3000`. O widget exibirá **"IA generativa · Gemini (gemini-3.8-flash)"** e habilitará o Function Calling `registrar_pedido` com persistência em `data/pedidos.json`.

### 6.3 Suíte de Testes Automatizados

    npm test

Executa os **23 testes automatizados** de `tests/vera.test.cjs` validando motor de score, prazos, detecção de CPF (Módulo 11 vs. celular BR), travas OAB/Anti-Injection e coerência entre `index.html`, `persona.js` e `js/chat.js`.

---

## 🤖 7. Integração com Inteligência Artificial (Assistente VERA)

- **Persona e Contexto (`persona.js`):** Define identidade, base factual e 7 regras absolutas (escopo exclusivo do produto, veracidade factual, texto simples até 4 frases, trava OAB, trava LGPD, consentimento expresso e defesa anti-injection).
- **Function Calling (`registrar_pedido` em `server.js`):** Coleta `nome`, `telefone`, `pedido` e `consentimento_confirmado`; o servidor bloqueia qualquer gravação se `consentimento_confirmado !== true`, limita o laço a 3 iterações e a 2 pedidos por sessão.
- **Travas Determinísticas em Duas Camadas (`js/lgpd.js`, `js/chat.js` e `server.js`):** Bloqueio de CPF (Módulo 11, preservando celulares de 11 dígitos na etapa de contato), bloqueio de pedidos de parecer/peça/êxito (Lei nº 8.906/1994) e proteção contra Prompt Injection antes de consumir tokens do Gemini, além de rate limit de 20 req/min por IP.
- **Roteiro rápido de validação na interface:**
  1. **Planos e Preços:** *"Quais são os planos e preços?"* → Lista Solo (R$ 190/mês), Pro (R$ 590/mês) e Corporate (R$ 1.490/mês).
  2. **Motor e Prazos:** *"Como funciona o cálculo do score e prescrição?"* → Explica os 10 critérios e os prazos de 24m (CLT), 60m (CDC) e 36m (CC/LGPD).
  3. **Trava Ética OAB:** *"Essa causa é ganha? Redija uma petição inicial para mim."* → Recusa citando a Lei nº 8.906/1994.
  4. **Trava LGPD:** *"Meu CPF é 123.456.789-09, avalie meu caso."* → Oculta a mensagem e exibe alerta do Art. 6º, III da LGPD.
  5. **Agendamento:** *"Quero agendar uma demonstração"* → Coleta nome, contato, plano e consentimento, gerando protocolo `VLT-AAAA-NNNN` (online) ou `SIM-AAAA-NNNN` (offline).

---

## 🗂️ 8. Estrutura de Pastas e Arquivos

    VeraLitis-AI/
    ├── assets/
    │   └── img/
    │       ├── logo-veralitis.svg       # Logomarca vetorial autoral (Balança + Monograma VL)
    │       ├── fluxo-triagem.svg        # Diagrama vetorial do pipeline de 3 etapas
    │       ├── hero-banner.svg          # Ilustração vetorial de apoio
    │       ├── hero-editorial.webp      # Fotografia editorial desktop otimizada
    │       └── hero-editorial-640.webp  # Fotografia editorial mobile otimizada
    ├── css/
    │   ├── fonts/                       # Fontes WOFF2 auto-hospedadas + licenças OFL (Zero CDN)
    │   ├── fonts.css                    # Declarações @font-face locais
    │   └── styles.css                   # Design System Editorial Forense (WCAG AA)
    ├── docs/
    │   └── relatorio-engenharia-prompts.md  # Evolução do prompt (v1–v3) e bateria de 15 testes
    ├── js/
    │   ├── package.json                 # Compatibilidade CommonJS para testes Node
    │   ├── scoring.js                   # Motor determinístico (10 critérios + prazos)
    │   ├── main.js                      # Controlador de UI (#inicio, #simulador, #contato)
    │   ├── lgpd.js                      # Detector único de CPF (Módulo 11) + celular BR
    │   └── chat.js                      # Widget da VERA, travas locais e fallback offline
    ├── tests/
    │   └── vera.test.cjs                # Suíte com 23 testes automatizados (node:test)
    ├── .env.example                     # Modelo de variáveis (GEMINI_API_KEY e GEMINI_MODEL)
    ├── .gitignore                       # Impede versionamento de .env, node_modules e data/
    ├── index.html                       # SPA semântica com 4 seções e 2 formulários
    ├── package.json                     # Manifesto ES Module (Express + @google/genai)
    ├── persona.js                       # Persona, base de conhecimento e regras da VERA
    ├── server.js                        # Proxy Express (/api/health, /api/chat, /api/pedidos)
    └── README.md                        # Documentação principal

---

## ⚠️ 9. Limitações Conhecidas do MVP

- **Score:** 5 dos 10 critérios (55 de 100 pontos) são autodeclarados por caixas de seleção; o motor verifica automaticamente relato, data, prazo, aderência ao ramo e dados pessoais (45 pontos). Relatos com menos de 25 palavras limitam a faixa a vermelha.
- **Prazos:** o motor soma meses corridos à data informada e não modela *actio nata*, suspensão ou interrupção (CC, arts. 189 e 197–204). A conferência jurídica cabe sempre a advogado habilitado.
- **Persistência:** pedidos são salvos em `data/pedidos.json` (servidor) e sessões do chat ficam em memória (TTL de 30 min), sem banco de dados nem cobrança real.
- **Acessibilidade e Privacidade:** pares de cores auditados entre 5,54:1 e 11,97:1 (WCAG 2.1 AA) e fontes WOFF2 locais sem CDN de terceiros.