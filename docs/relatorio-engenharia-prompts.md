# Relatório de Engenharia de Prompts — VeraLitis AI (VLT-2026-01)

Registro de iterações de prompts utilizados pela equipe na construção do MVP (Atividade 10 & AV3 Web para IA).

## 1. Iterações do Design System (css/styles.css) e Motor (js/scoring.js)

| ID | Data | Artefato | Problema Identificado na v1 | Ajuste Aplicado no Prompt / Código (v2) | Resultado Validado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| CORE-01 | 30/10/2026 | js/scoring.js | A função classificarFaixa() promovia relatos vagos (score = 20) para a faixa amarela quando alertaPrescricao = true. | Adicionada guarda incondicional na 1ª linha: if (score < 45) return "vermelho"; | Testado com 9 casos (4 de referência A–D + 5 fronteiras). 100% de aprovação. |
| CORE-02 | 30/10/2026 | css/styles.css | Quatro combinações de cores reprovavam no critério WCAG AA (< 4,5:1): rodapé, badge amarelo, badge verde e hover de link. | Criados tokens --muted-on-dark (#C7D2E0, 10,79:1) e --gold-700 (#846416, 5,19:1), e escurecidos --verde (6,17:1) e --amarelo (6,06:1). | Todos os pares aprovados no padrão WCAG AA (>= 4,5:1) para garantir Lighthouse >= 90. |
