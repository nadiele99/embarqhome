// Jornada "Como funciona" — adaptada de "Embarq Jornada v3".
// Avança conforme a rolagem: o trilho tem várias telas de altura e o quadro
// fica fixo (sticky) enquanto ele passa. As etapas levam à posição de cada uma.
(function () {
  const raiz = document.querySelector('[data-jornada]');
  if (!raiz) return;

  const reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PESO = [1, 1, 2, 1.6, 1.1];

  const ETAPAS = [
    { curto: 'Solicitação', titulo: 'Solicitação do frete', texto: 'A empresa cadastra o frete de forma estruturada: carga, origem e destino, prazos, valor e exigências.' },
    { curto: 'Direcionamento', titulo: 'Direcionamento', texto: 'A plataforma envia a solicitação para as transportadoras homologadas compatíveis com a carga e a rota.' },
    { curto: 'Propostas confidenciais', titulo: 'Propostas confidenciais', texto: 'Cada transportadora envia preço, prazo e diferenciais sem ver as condições das concorrentes.' },
    { curto: 'Comparação e aceite', titulo: 'Comparação e aceite', texto: 'Você vê todas as propostas lado a lado e aceita uma. O aceite gera a Ordem de Serviço e revela a transportadora escolhida.' },
    { curto: 'Encerramento', titulo: 'Encerramento', texto: 'Após a entrega: recebimento confirmado com canhoto e fotos, avaliação da transportadora e pacote documental registrado.' }
  ];

  const OFERTAS = [
    { id: 'A', preco: 5480, prazo: '1 dia útil', nota: '4,9', selo: 'Camada 2' },
    { id: 'B', preco: 4920, prazo: '2 dias úteis', nota: '4,6', selo: 'Camada 1', nome: 'Solimões Logística' },
    { id: 'C', preco: 5150, prazo: '1 dia útil', nota: '4,7', selo: 'Camada 1' }
  ];
  const brl = v => 'R$ ' + v.toLocaleString('pt-BR');

  const $ = (sel, el = raiz) => el.querySelector(sel);
  const $$ = (sel, el) => Array.from(el.querySelectorAll(sel));
  const criar = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  // ── Cenas: cada uma monta o DOM uma vez e devolve aplicar(p), p de 0 a 1 ──
  const CENAS = [
    function solicitacao() {
      const campos = [['Carga', '12 paletes · 4,8 t'], ['Origem → destino', 'Manaus → Itacoatiara'], ['Prazos', 'Entrega até 25/10'], ['Valor da carga', 'R$ 380.000'], ['Exigências', 'Baú fechado']];
      const el = criar(`<div class="jn-card">
        <div class="jn-card-h"><span>Nova solicitação</span><span class="jn-mono">EMB-0142</span></div>
        ${campos.map(([r, v]) => `<div class="jn-field"><span>${r}</span><span>${v}</span></div>`).join('')}
        <div class="jn-status"><span data-i>…</span><span data-t>Preenchendo</span></div>
      </div>`);
      const linhas = $$('.jn-field', el), status = $('.jn-status', el);
      return { el, aplicar(p) {
        linhas.forEach((l, i) => l.classList.toggle('on', p > i * 0.13));
        const ok = p > 0.7;
        status.classList.toggle('ok', ok);
        $('[data-i]', status).textContent = ok ? '✓' : '…';
        $('[data-t]', status).textContent = ok ? 'Solicitação enviada' : 'Preenchendo';
      } };
    },

    function direcionamento() {
      const R = [{ c: 'A', ok: 1 }, { c: 'B', ok: 1 }, { c: 'C', ok: 1 }, { c: '—', ok: 0 }];
      const el = criar(`<div class="jn-route">
        <div class="jn-origin"><span class="jn-mono">EMB-0142</span><b>Manaus → Itacoatiara</b></div>
        <div class="jn-dests">${R.map(r => `<div class="jn-dest${r.ok ? '' : ' nok'}"><span class="jn-line"></span><div class="jn-dcard"><span class="jn-id">${r.c}</span><div><b>${r.ok ? 'Transportadora ' + r.c : 'Não compatível'}</b><small>${r.ok ? 'Verificando…' : 'Fora da rota'}</small></div></div></div>`).join('')}</div>
      </div>`);
      const dests = $$('.jn-dest', el);
      return { el, aplicar(p) {
        dests.forEach((d, i) => {
          const on = p > 0.1 + i * 0.18;
          d.classList.toggle('on', on);
          if (R[i].ok) $('small', d).textContent = on ? 'Recebeu a solicitação' : 'Verificando…';
        });
      } };
    },

    function propostas() {
      const el = criar(`<div class="jn-envs">
        <div class="jn-envgrid">${OFERTAS.map(o => `<div class="jn-env"><b>Transp. ${o.id}</b><span class="jn-mono">${brl(o.preco)}</span><small>${o.prazo}</small><span class="jn-tag">Enviada</span></div>`).join('')}</div>
        <div class="jn-seal"><i></i>Nenhuma transportadora vê a proposta da outra.</div>
      </div>`);
      const envs = $$('.jn-env', el), selo = $('.jn-seal', el);
      return { el, aplicar(p) {
        envs.forEach((e, i) => e.classList.toggle('on', p > 0.08 + i * 0.2));
        selo.classList.toggle('on', p > 0.7);
      } };
    },

    function comparacao() {
      const el = criar(`<div class="jn-cmp">
        <div class="jn-views"><span>Visão do solicitante</span><span>Visão da Transp. B</span></div>
        <div class="jn-cards"></div>
        <div class="jn-cmp-f"><span class="jn-msg"></span><span class="jn-os">✓ Ordem de Serviço gerada</span></div>
      </div>`);
      const vistas = $$('.jn-views span', el), cards = $('.jn-cards', el), msg = $('.jn-msg', el), os = $('.jn-os', el);
      let chave = '';
      return { el, aplicar(p) {
        // Sequência: todas visíveis → seleciona B → aceita → muda para a visão da B
        const sel = p > 0.3, aceito = p > 0.52, comprador = p <= 0.74;
        const k = '' + +sel + +aceito + +comprador;
        if (k === chave) return;
        chave = k;
        vistas[0].classList.toggle('on', comprador);
        vistas[1].classList.toggle('on', !comprador);
        cards.innerHTML = OFERTAS.map(o => {
          const aberta = comprador || o.id === 'B', escolhida = sel && o.id === 'B', ganhou = aceito && escolhida && comprador;
          if (!aberta) return '<div class="jn-oferta lacrada"><b>Concorrente</b><span class="jn-mono">R$ ••••</span><small>Não visível</small></div>';
          const cls = ['jn-oferta', escolhida && comprador ? 'sel' : '', ganhou ? 'ganhou' : '', comprador && aceito && !escolhida ? 'apagada' : ''].join(' ');
          return `<div class="${cls}"><b>${ganhou ? o.nome : '<span class="jn-longo">Transportadora</span><span class="jn-curto">Transp.</span> ' + o.id}</b><span class="jn-mono">${brl(o.preco)}</span><small>${o.prazo}</small><small>★ ${o.nota} · ${o.selo}</small></div>`;
        }).join('');
        msg.textContent = !comprador ? 'A Transportadora B vê apenas a própria proposta.' : aceito ? 'Identidade revelada: Solimões Logística.' : sel ? 'Transportadora B selecionada.' : 'Todas as propostas, no mesmo formato.';
        os.classList.toggle('on', aceito && comprador);
      } };
    },

    function encerramento() {
      const itens = ['Coleta e entrega registradas', 'Canhoto e fotos da carga', 'Avaliação da transportadora', 'Pacote documental registrado'];
      const el = criar(`<div class="jn-card">
        <div class="jn-card-h"><span>OS-0142 · Solimões Logística</span></div>
        ${itens.map(t => `<div class="jn-check"><i></i><span>${t}</span></div>`).join('')}
        <div class="jn-end">Em andamento</div>
      </div>`);
      const checks = $$('.jn-check', el), fim = $('.jn-end', el);
      return { el, aplicar(p) {
        checks.forEach((c, i) => { const on = p > 0.1 + i * 0.17; c.classList.toggle('on', on); $('i', c).textContent = on ? '✓' : ''; });
        const acabou = p > 0.82;
        fim.classList.toggle('on', acabou);
        fim.textContent = acabou ? 'Frete encerrado' : 'Em andamento';
      } };
    }
  ];

  // ── Montagem ──
  const abas = $('.jn-tabs');
  abas.insertAdjacentHTML('beforeend', ETAPAS.map((e, i) =>
    `<button type="button" class="jn-tab" aria-label="Etapa ${i + 1}: ${e.curto}"><span class="jn-dot">0${i + 1}</span><span class="jn-lbl">${e.curto}</span></button>`).join(''));
  const botoes = $$('.jn-tab', abas);
  const trilho = $('.jn-trilho'), linha = $('.jn-fill'), barra = $('.jn-bar i');
  const conteudo = $('.jn-conteudo'), palco = $('.jn-stage');
  const num = $('.jn-num'), titulo = $('.jn-title'), texto = $('.jn-body');
  const dica = $('.jn-dica'), dicaT = $('.jn-dica-t');
  const atalhos = $('.jn-atalhos');
  const TOTAL = PESO.reduce((a, b) => a + b, 0);

  // Altura do trilho: ~90vh por unidade de peso, como na v3.
  trilho.style.height = Math.round(TOTAL * 90 + 100) + 'vh';

  let etapa = -1, cena = null, troca = 0;

  function mostrar(i) {
    const e = ETAPAS[i];
    num.textContent = '0' + (i + 1);
    titulo.textContent = e.titulo;
    texto.textContent = e.texto;
    cena = CENAS[i]();
    palco.replaceChildren(cena.el);
    botoes.forEach((b, j) => {
      b.classList.toggle('ativo', j === i);
      b.classList.toggle('feito', j < i);
      if (j === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }

  function atualizar() {
    const r = trilho.getBoundingClientRect(), vao = r.height - window.innerHeight;
    const g = Math.max(0, Math.min(0.9999, -r.top / Math.max(1, vao))) * TOTAL;
    let acc = 0, i = 0;
    for (; i < PESO.length - 1; i++) { if (g < acc + PESO[i]) break; acc += PESO[i]; }
    const p = Math.max(0, Math.min(1, (g - acc) / PESO[i]));

    if (i !== etapa) {
      const primeira = etapa < 0;
      etapa = i;
      clearTimeout(troca);
      if (primeira || reduzido) mostrar(i);
      else {
        conteudo.classList.add('saindo');
        troca = setTimeout(() => { mostrar(etapa); atualizar(); conteudo.classList.remove('saindo'); }, 180);
      }
    }
    if (cena) cena.aplicar(p);
    barra.style.width = Math.round(p * 100) + '%';
    linha.style.width = Math.min(80, (i + p) * 20) + '%';
    dica.style.opacity = i === 4 && p > 0.82 ? 0 : 1;
    dicaT.textContent = i === 0 && p < 0.2 ? 'Role para ver o processo' : 'Continue rolando';
    atalhos.classList.toggle('visivel', r.top <= 1 && r.bottom >= window.innerHeight - 1);
  }

  function irPara(i) {
    const vao = trilho.offsetHeight - window.innerHeight;
    const antes = PESO.slice(0, i).reduce((a, b) => a + b, 0) + PESO[i] * 0.05;
    const topo = trilho.getBoundingClientRect().top + window.scrollY + vao * (antes / TOTAL);
    window.scrollTo({ top: topo, behavior: reduzido ? 'auto' : 'smooth' });
  }

  let pedido = 0;
  const agendar = () => { if (!pedido) pedido = requestAnimationFrame(() => { pedido = 0; atualizar(); }); };
  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  botoes.forEach((b, i) => b.addEventListener('click', () => irPara(i)));

  // Atalhos: topo da página ou logo depois da jornada.
  atalhos.addEventListener('click', ev => {
    const a = ev.target.closest('[data-ir]');
    if (!a) return;
    ev.preventDefault();
    ev.stopPropagation();
    const alvo = a.dataset.ir === 'topo' ? 0 : trilho.getBoundingClientRect().bottom + window.scrollY - 68;
    window.scrollTo({ top: alvo, behavior: reduzido ? 'auto' : 'smooth' });
  });

  atualizar();
})();
