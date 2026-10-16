/* Páginas de plano — alternância de período e ano do rodapé */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const period = $('[data-period]');
  const value = $('.plan__value');
  const total = $('[data-total]');
  if (period && value && total) {
    const btns = $$('button', period);
    const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const update = (btn) => {
      const months = +btn.dataset.months;
      const monthly = Math.round(+value.dataset.base * (1 - +btn.dataset.discount));
      btns.forEach((b, i) => {
        const on = b === btn;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on) period.style.setProperty('--i', i);
      });
      value.textContent = monthly;
      total.textContent = months > 1 ? `${fmt.format(monthly * months)} por ${months} meses` : 'Sem fidelidade';
      if (!reduce) { value.classList.remove('is-changing'); void value.offsetWidth; value.classList.add('is-changing'); }
    };
    btns.forEach((b) => b.addEventListener('click', () => update(b)));
    period.addEventListener('keydown', (e) => {
      const i = btns.findIndex((b) => b.getAttribute('aria-checked') === 'true');
      let n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % btns.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + btns.length) % btns.length;
      if (n !== null) { e.preventDefault(); update(btns[n]); btns[n].focus(); }
    });
    update(btns[0]);
  }

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
