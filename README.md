# VeraLitis AI — Triagem Jurídica Inteligente & Governança LGPD

SaaS de pré-triagem de casos jurídicos, aferição de risco prescricional e compliance LGPD para escritórios de advocacia e PMEs.

## Sobre o projeto
Projeto unificado das disciplinas **Desenvolvimento Web para I.A.** (AV3) e **Ferramentas de I.A. e Chatbots** do **Piauí Instituto de Tecnologia (PIT)**. Site institucional e comercial completo integrado a um simulador determinístico de admissibilidade jurídica e à assistente virtual **VERA**.

## Integrantes
- **Pedro Henrique dos Passos Sousa** — Membro 1 (Interface Hero, Simulador de Triagem, Histórico localStorage, SWOT & Business Model Canvas)
- **Raimundo Clecio Dantas Muniz Filho** (@cleciofilho-code) — Membro 2 (Módulos em CSS Grid, Planos em Flexbox, Formulário com Protocolo, Motor scoring.js & TAP)
- **Breno Igo Borges Pereira de Araújo** (@brenoigo-ai) — Membro 3 (Arquitetura & Design System Editorial, Assistente VERA via Proxy Serverless, Fallback Local & Engenharia de Prompts)

## Tecnologias utilizadas
- **HTML5 semântico** (header, nav, main, section, aside, footer)
- **CSS3 Editorial Swiss Grid** (CSS Grid e Flexbox, tipografia Source Serif 4 + Public Sans + JetBrains Mono, contraste auditado WCAG AA >= 5,5:1)
- **JavaScript (ES6+) Vanilla** — sem frameworks externos
- **API de LLM via Proxy Serverless** (Cloudflare Workers / Vercel Functions) + Fallback roteirizado local
- **GitHub Pages** (hospedagem estática)
- **localStorage** (persistência do histórico de dossiês de triagem no navegador)

## Como instalar e executar
1. Clone o repositório:
    git clone https://github.com/brenoigo-ai/VeraLitis-AI.git
2. Abra o arquivo index.html diretamente no navegador (duplo-clique) ou sirva com a extensão Live Server do VS Code.
3. O chat da assistente VERA conecta ao endpoint do proxy serverless (documentado em /docs) — caso esteja sem internet ou com o proxy desligado, o widget aciona automaticamente o fallback roteirizado local.

## Funcionalidades principais
- Simulador de triagem jurídica com 10 critérios objetivos (js/scoring.js), score de 0 a 100 e 3 faixas de admissibilidade (Verde, Amarelo, Vermelho).
- Checklist automático de documentos por ramo do Direito (Trabalhista/CLT, Consumidor/CDC, Cível e Proteção de Dados/LGPD).
- Histórico de triagens persistente no navegador (localStorage).
- Chatbot VERA com persona própria e 6 travas éticas e de segurança (Estatuto da OAB, Resolução CNJ nº 332/2020 e LGPD).
- Formulário comercial com cálculo dinâmico de resumo do pedido e geração de protocolo.

## Integração com Inteligência Artificial
O projeto utiliza IA e engenharia de regras em duas camadas:
1. **Motor determinístico (js/scoring.js):** pontua o relato do cliente contra 10 critérios jurídicos objetivos inspirados no CPC (art. 319), CLT (art. 11), CDC, LGPD e Tabelas Processuais Unificadas (TPU/CNJ).
2. **Assistente generativa (VERA — js/chat.js):** consultora virtual de pré-triagem e planos SaaS com System Prompt blindado no servidor e validado contra uma suíte adversarial de 15 prompts.

## Estrutura de pastas
    veralitis-ai/
    ├── index.html
    ├── css/styles.css
    ├── js/main.js
    ├── js/scoring.js
    ├── js/chat.js
    ├── assets/img/
    ├── assets/icons/
    ├── docs/relatorio-engenharia-prompts.md
    ├── .gitignore
    └── README.md

## Testes realizados
- Suíte de 15 prompts de segurança e escopo da VERA (meta >= 13/15 e 100% nas travas anti-injection e OAB).
- Bateria de 9 casos de teste no motor scoring.js (4 casos de referência A–D + 5 fronteiras de transição).
- Teste de usabilidade com 3 usuários reais e auditoria de acessibilidade Lighthouse >= 90.

## Aviso legal
Ferramenta acadêmica de triagem operacional preliminar desenvolvida para as disciplinas de Desenvolvimento Web para I.A. e Ferramentas de I.A. e Chatbots (PIT). Não constitui parecer jurídico vinculante nem substitui a análise de um advogado habilitado (Lei nº 8.906/1994).
