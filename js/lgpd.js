/* =============================================================
   VeraLitis AI — js/lgpd.js
   Detector único de CPF (módulo 11), usado por server.js (Node) e por
   js/chat.js (navegador). Qualquer ajuste da regra é feito SÓ aqui.
   ============================================================= */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.VeraLGPD = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PADRAO_CPF = /\d{3}[.\s\/-]?\d{3}[.\s\/-]?\d{3}[.\s\/-]?\d{2}/g;
  const SEPARADOR = /[.\s\/-]/;

  function digitosVerificadoresOk(digitos) {
    if (new Set(digitos).size === 1) return false;
    for (let t = 9; t < 11; t++) {
      let soma = 0;
      for (let i = 0; i < t; i++) soma += digitos[i] * (t + 1 - i);
      if (((soma * 10) % 11) % 10 !== digitos[t]) return false;
    }
    return true;
  }

  function contemCpfValido(texto) {
    const alvo = String(texto || "");
    const re = new RegExp(PADRAO_CPF.source, "g");
    let achado;
    while ((achado = re.exec(alvo)) !== null) {
      const antes = alvo.charAt(achado.index - 1);
      const depois = alvo.charAt(achado.index + achado[0].length);
      if (/\d/.test(antes) || /\d/.test(depois)) {
        re.lastIndex = achado.index + 1;
        continue;
      }
      if (SEPARADOR.test(achado[0])) return true;
      if (digitosVerificadoresOk(achado[0].split("").map(Number))) return true;
    }
    return false;
  }

  function pareceCelularBR(texto) {
    const t = String(texto || "").trim();
    return /^\d{2}9\d{8}$/.test(t) && Number(t.slice(0, 2)) >= 11;
  }

  return { contemCpfValido: contemCpfValido, pareceCelularBR: pareceCelularBR };
});
