// Contagem regressiva dos números do hero (0 · 1 · 5) ao carregar a página.
// Cada número parte de data-de e desce até o valor real escrito no HTML,
// que continua sendo o que aparece sem JavaScript ou com movimento reduzido.
(function () {
  const nums = document.querySelectorAll('.v2-numeros b[data-de]');
  if (!nums.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Aba aberta em segundo plano: o navegador pausa a animação, então os números
  // ficam direto no valor real em vez de presos no valor inicial.
  if (document.visibilityState !== 'visible') return;

  const DURACAO = 1600, ATRASO = 300, ESCALONA = 150;
  const suave = t => 1 - Math.pow(1 - t, 3);

  nums.forEach((el, i) => {
    const fim = Number(el.textContent), de = Number(el.dataset.de);
    el.setAttribute('aria-label', String(fim));
    el.textContent = de;
    const inicio = performance.now() + ATRASO + i * ESCALONA;
    function quadro(agora) {
      const t = Math.min(1, Math.max(0, (agora - inicio) / DURACAO));
      el.textContent = Math.round(de - (de - fim) * suave(t));
      if (t < 1) requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
    // Garantia: o valor real aparece mesmo que a animação seja interrompida.
    setTimeout(() => { el.textContent = fim; }, ATRASO + i * ESCALONA + DURACAO + 400);
  });
})();
