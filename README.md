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

### ✅ Entregue — Etapa 1 (Kickoff e estrutura)
- [x] Estrutura de pastas, `.gitignore` e repositório no GitHub
- [x] Design System editorial (tokens de cor, tipografia e espaçamento) em `css/styles.css`
- [x] HTML semântico com as 4 seções âncora (`#inicio`, `#simulador`, `#planos`, `#contato`)
- [x] Hero com exemplo estático de dossiê preliminar
- [x] Contrato inicial da função `analisarCaso()` em `js/scoring.js`

### ⏳ Em andamento — Etapa 2
- [x] Fontes auto-hospedadas (sem requisições ao Google Fonts — Privacy by Design LGPD) — Membro 3
- [ ] Acessibilidade: foco visível de alto contraste, link "pular para o conteúdo" e âncoras sob o header fixo — Membro 3
- [ ] Motor `scoring.js` calculando o score e a prescrição a partir das entradas reais + bateria de testes — Membro 1 (Pedro Henrique)

### ⬜ Planejado — próximas etapas
- [ ] Interface do simulador (`#simulador`: formulário, casos de referência, barra de progresso, checklist e `localStorage`) — Membro 1 (Pedro Henrique)
- [ ] Cards de módulos (`.cards-grid`) e de planos (`.cards-flex`) na seção `#planos` — Membro 2 (Raimundo Clecio)
- [ ] Formulário comercial com resumo dinâmico do pedido e protocolo na seção `#contato` — Membro 2 (Raimundo Clecio)
- [ ] Assistente VERA (`persona.js`, `server.js` e widget `js/chat.js`) com fallback local — Membro 3 (Breno Igo)
- [ ] Teste de usabilidade e auditoria Lighthouse — Equipe

## Tecnologias utilizadas
- **HTML5 semântico** (header, nav, main, section, aside, footer)
- **CSS3** com CSS Grid e Flexbox; tipografia Source Serif 4 + Public Sans + JetBrains Mono auto-hospedadas
- **JavaScript (ES6+) vanilla**, sem frameworks
- *(planejado)* **API de LLM (Node/Express + Gemini SDK / Proxy)** com fallback roteirizado local
- *(planejado)* **localStorage** para o histórico de triagens e **GitHub Pages** para hospedagem

## Como executar
1. Clone o repositório:
   ```bash
   git clone [https://github.com/brenoigo-ai/VeraLitis-AI.git](https://github.com/brenoigo-ai/VeraLitis-AI.git)
   ```
2. Abra o arquivo `index.html` no navegador (duplo clique) ou sirva com a extensão **Live Server** do VS Code.

## Integração com Inteligência Artificial
O projeto foi desenhado em duas camadas:
1. **Motor determinístico (`js/scoring.js`):** pontua o relato do cliente contra 10 critérios objetivos inspirados no CPC (art. 319), na CLT (art. 11), no CDC, na LGPD e nas Tabelas Processuais Unificadas (TPU/CNJ).
2. **Assistente generativa (VERA — `js/chat.js` / `persona.js`)** *(planejada)*: consultora virtual de pré-triagem e planos SaaS com travas éticas do Estatuto da OAB e Resolução CNJ nº 332/2020.

## Estrutura de pastas
```text
veralitis-ai/
├── index.html
├── css/
│   ├── styles.css
│   ├── fonts.css
│   └── fonts/          (woff2 + licenças SIL OFL 1.1)
├── js/
│   ├── main.js
│   ├── scoring.js
│   └── chat.js
├── assets/
│   ├── img/
│   └── icons/
├── docs/
│   └── relatorio-engenharia-prompts.md
├── .gitignore
└── README.md
```

## Testes e verificações
| Verificação | Status |
| :--- | :--- |
| Contraste da paleta de cores (cálculo da razão WCAG) | ✅ Feito — valores em `docs/relatorio-engenharia-prompts.md` |
| Bateria de casos do motor `scoring.js` | ⏳ Em andamento (Membro 1) |
| Suíte de prompts adversariais da VERA | ⬜ Planejado (Membro 3) |
| Auditoria Lighthouse (acessibilidade ≥ 90) | ⬜ Planejado (Equipe) |

## Aviso legal
Ferramenta acadêmica de triagem operacional preliminar desenvolvida para as disciplinas de Desenvolvimento Web para I.A. e Ferramentas de I.A. e Chatbots (PIT). Não constitui parecer jurídico vinculante nem substitui a análise de um advogado habilitado (Lei nº 8.906/1994).