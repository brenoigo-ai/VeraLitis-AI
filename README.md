# VeraLitis AI — Triagem Jurídica Inteligente & Governança LGPD

> **Status do projeto:** MVP em construção (Etapa 2). O que já funciona e o que ainda será entregue está descrito em [Status do MVP](#status-do-mvp-roadmap-de-implementação).

SaaS de pré-triagem de casos jurídicos, aferição de risco prescricional e compliance LGPD para escritórios de advocacia e PMEs.

## Sobre o projeto
Projeto unificado das disciplinas **Desenvolvimento Web para I.A.** (AV3) e **Ferramentas de I.A. e Chatbots** do **Piauí Instituto de Tecnologia (PIT)**. O objetivo é um site institucional e comercial integrado a um simulador determinístico de admissibilidade jurídica e à assistente virtual **VERA**.

## Integrantes
- **Pedro Henrique dos Passos Sousa** — Membro 1 (Revisão Jurídica e Motor `scoring.js`, Interface do Simulador de Triagem, Histórico `localStorage`, SWOT & Business Model Canvas)
- **Raimundo Clecio Dantas Muniz Filho** (@cleciofilho-code) — Membro 2 (Módulos Técnicos em CSS Grid, Planos de Assinatura em Flexbox, Formulário Comercial com Protocolo & TAP)
- **Breno Igo Borges Pereira de Araújo** (@brenoigo-ai) — Membro 3 (Arquitetura & Design System Editorial, Conformidade LGPD/Acessibilidade, Assistente VERA & Engenharia de Prompts)

## Status do MVP (Roadmap de Implementação)

### ✅ Entregue — Etapa 1 e Frente Membro 3 (Arquitetura, LGPD, A11y e Assistente VERA)
- [x] Estrutura de pastas, `.gitignore`, `.gitattributes` e repositório no GitHub
- [x] Design System editorial (tokens de cor, tipografia e espaçamento) em `css/styles.css`
- [x] HTML semântico com as 4 seções âncora (`#inicio`, `#simulador`, `#planos`, `#contato`)
- [x] Hero com exemplo estático de dossiê preliminar
- [x] Fontes auto-hospedadas em `css/fonts/` (zero requisição ao Google Fonts — Privacy by Design LGPD) — Membro 3
- [x] Acessibilidade WCAG AA: foco visível de alto contraste, link "pular para o conteúdo" e `scroll-padding-top` — Membro 3
- [x] Assistente Virtual **VERA** (`persona.js`, `server.js` com Function Calling `registrar_pedido` e widget `js/chat.js` com fallback local para GitHub Pages) — Membro 3
- [x] Suíte de 15 prompts adversariais e funcionais da VERA documentada em `docs/relatorio-engenharia-prompts.md` — Membro 3

### ⏳ Em andamento — Frentes Membro 1 e Membro 2
- [ ] Motor `scoring.js` calculando o score e a prescrição a partir das entradas reais + bateria de testes — Membro 1 (Pedro Henrique)
- [ ] Interface do simulador (`#simulador`: formulário, casos de referência, barra de progresso, checklist e `localStorage`) — Membro 1 (Pedro Henrique)
- [ ] Cards de módulos (`.cards-grid`) e de planos (`.cards-flex`) na seção `#planos` — Membro 2 (Raimundo Clecio)
- [ ] Formulário comercial com resumo dinâmico do pedido e protocolo na seção `#contato` — Membro 2 (Raimundo Clecio)

## Tecnologias utilizadas
- **HTML5 semântico** (header, nav, main, section, aside, footer)
- **CSS3** com CSS Grid e Flexbox; tipografia Source Serif 4 + Public Sans + JetBrains Mono auto-hospedadas
- **JavaScript (ES6+) vanilla**, sem frameworks
- **Node.js + Express + Google GenAI SDK (`@google/genai`)** em `server.js` e `persona.js`, com fallback roteirizado local em `js/chat.js` para funcionamento no GitHub Pages

## Como executar
1. Clone o repositório:
   ```bash
   git clone [https://github.com/brenoigo-ai/VeraLitis-AI.git](https://github.com/brenoigo-ai/VeraLitis-AI.git)
   ```
2. **Modo Estático (Live Server / GitHub Pages):** Abra `index.html` no navegador. O widget da **VERA** funciona imediatamente com o motor local sincronizado.
3. **Modo Servidor com Gemini API (Padrão Oficina):**
   ```bash
   npm install
   cp .env.example .env
   # Insira sua GEMINI_API_KEY no arquivo .env
   npm start
   ```
   Acesse `http://localhost:3000`.

## Estrutura de pastas
```text
veralitis-ai/
├── index.html
├── persona.js
├── server.js
├── package.json
├── .env.example
├── css/
│   ├── styles.css
│   ├── fonts.css
│   └── fonts/          (woff2 + licenças SIL OFL 1.1)
├── js/
│   ├── main.js
│   ├── scoring.js
│   └── chat.js
├── docs/
│   └── relatorio-engenharia-prompts.md
├── .gitignore
├── .gitattributes
└── README.md
```

## Testes e verificações
| Verificação | Status |
| :--- | :--- |
| Contraste da paleta de cores (cálculo da razão WCAG) | ✅ Feito — valores em `docs/relatorio-engenharia-prompts.md` |
| Suíte de 15 prompts adversariais da VERA (OAB, LGPD e Anti-Injection) | ✅ 15/15 aprovados — `docs/relatorio-engenharia-prompts.md` |
| Bateria de casos do motor `scoring.js` | ⏳ Em andamento (Membro 1) |
| Auditoria Lighthouse (acessibilidade ≥ 90) | ⬜ Planejado após conclusão das seções §02, §03 e §04 |

## Aviso legal
Ferramenta acadêmica de triagem operacional preliminar desenvolvida para as disciplinas de Desenvolvimento Web para I.A. e Ferramentas de I.A. e Chatbots (PIT). Não constitui parecer jurídico vinculante nem substitui a análise de um advogado habilitado (Lei nº 8.906/1994).