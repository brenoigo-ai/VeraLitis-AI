# Relatório de Engenharia de Prompts — VeraLitis AI (VLT-2026-01)

Registro de iterações de prompts utilizados pela equipe na construção do MVP (Desenvolvimento Web para I.A. & Ferramentas de I.A. e Chatbots).

## 1. Iterações do Design System (css/styles.css), Motor (js/scoring.js) e Auditoria

| ID | Data | Artefato | Problema Identificado na v1 | Ajuste Aplicado no Prompt / Código (v2) | Resultado Validado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CORE-01 | 30/10/2026 | js/scoring.js | A função classificarFaixa() promovia relatos vagos (score = 20) para a faixa amarela quando alertaPrescricao = true. | Adicionada guarda incondicional na 1ª linha: if (score < 45) return "vermelho"; | Guarda validada manualmente. Bateria automatizada em implementação. |
| CORE-02 | 30/10/2026 | css/styles.css | Quatro combinações de cores reprovavam no critério WCAG AA (< 4,5:1): rodapé, badge amarelo, badge verde e hover de link. | Criados tokens --muted-on-dark (#C9D4E3, 11,97:1 sobre --navy-900) e --gold-700 (#7D5D10, 5,54:1 sobre --paper), e escurecidos --verde (6,17:1) e --amarelo (6,06:1). | Todos os pares aprovados no padrão WCAG AA (>= 4,5:1) (auditoria Lighthouse ainda pendente). |
| AUD-01 | 31/10/2026 | Repositório completo | Revisão técnica apontou: README descrevendo funções ainda não implementadas, selo "WCAG AA VERIFIED" sem auditoria finalizada e valores de tokens divergentes do CSS. | README reestruturado com a seção "Status do MVP"; selo removido do rodapé; valores deste relatório recalculados a partir do CSS. | Documentação alinhada ao código real da Etapa 1. |
| CORE-04 | 31/10/2026 | index.html / css/fonts.css | Google Fonts carregado por CDN enviava o IP do visitante a um terceiro sem consentimento — incoerente com um produto de compliance LGPD. | Fontes baixadas para css/fonts/ (woff2, subset latin) e declaradas via @font-face em css/fonts.css; links do Google removidos. | Aba Network do DevTools sem requisições a fonts.googleapis.com / fonts.gstatic.com. |