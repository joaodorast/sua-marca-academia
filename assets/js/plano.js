/* Páginas de plano — alternância de período e ano do rodapé */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = { months: 1, monthly: 0 };
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
      state.months = months; state.monthly = monthly;
      const sp = $('[data-sticky-price]');
      if (sp) sp.textContent = `R$ ${monthly}/mês`;
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

  /* ---------- barra fixa (mobile): aparece depois do cartão de preço ---------- */
  const sticky = $('[data-sticky]');
  const card = $('.pl-card');
  if (sticky && card && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => sticky.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0)).observe(card);
  }

  /* ---------- checkout SIMULADO: nada é enviado nem salvo ---------- */
  const dlg = $('#pay');
  if (dlg && card) {
    const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const form = $('#pay-form', dlg);
    const done = $('[data-pay-done]', dlg);
    const submit = $('[data-pay-submit]', dlg);
    const demo = $('.pay__demo', dlg);
    const planName = card.dataset.planName;
    const tabs = $$('[data-method]', dlg);
    const panels = $$('[data-panel]', dlg);
    let method = 'pix';
    const periodName = () => ({ 1: 'Mensal', 6: 'Semestral', 12: 'Anual' }[state.months]);
    const total = () => state.monthly * state.months;
    const digits = (v) => v.replace(/\D/g, '');
    const rand = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

    const qr = () => {
      const n = 25; let cells = '';
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
        const corner = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
        let on;
        if (corner) {
          const fx = x < 7 ? x : x - (n - 7), fy = y < 7 ? y : y - (n - 7);
          on = fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5);
        } else on = Math.random() > .5;
        if (on) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
      $('[data-qr]', dlg).innerHTML = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" fill="#0b0a0a">${cells}</svg>`;
    };
    const refresh = () => {
      $('[data-pay-summary]', dlg).innerHTML = `${planName} · ${periodName()}<strong>${fmt.format(total())}</strong>${state.months > 1 ? `${state.months}x de ${fmt.format(state.monthly)}` : 'Cobrança mensal, sem fidelidade'}`;
      const max = Math.min(state.months, 12);
      $('[data-parcelas]', dlg).innerHTML = Array.from({ length: max }, (_, i) => `<option value="${i + 1}">${i + 1}x de ${fmt.format(total() / (i + 1))} sem juros</option>`).join('');
      submit.textContent = `Pagar ${fmt.format(total())} (simulação)`;
      $('[data-pix]', dlg).textContent = `00020126580014BR.GOV.BCB.PIX0136SIMULACAO-${rand(8)}5204000053039865406${total().toFixed(2).replace('.', '')}5802BR6304${rand(4)}`;
      $('[data-boleto]', dlg).textContent = `${rand(5)}.${rand(5)} ${rand(5)}.${rand(6)} ${rand(5)}.${rand(6)} ${rand(1)} ${rand(14)}`;
      qr();
    };
    const setMethod = (m) => {
      method = m;
      tabs.forEach((t) => { const on = t.dataset.method === m; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      panels.forEach((pn) => { pn.hidden = pn.dataset.panel !== m; });
    };
    tabs.forEach((t) => t.addEventListener('click', () => setMethod(t.dataset.method)));
    $('.pay__tabs', dlg).addEventListener('keydown', (e) => {
      const i = tabs.findIndex((t) => t.dataset.method === method);
      let n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (n !== null) { e.preventDefault(); setMethod(tabs[n].dataset.method); tabs[n].focus(); }
    });

    const open = () => {
      done.hidden = true; form.hidden = false; demo.hidden = false;
      refresh(); setMethod('pix');
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    };
    $$('[data-checkout]').forEach((b) => b.addEventListener('click', open));
    $$('[data-pay-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

    const copy = (sel, btn) => {
      const text = $(sel, dlg).textContent;
      const ok = () => { const old = btn.textContent; btn.textContent = 'Copiado!'; setTimeout(() => { btn.textContent = old; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, ok); else ok();
    };
    $('[data-copy]', dlg).addEventListener('click', (e) => copy('[data-pix]', e.currentTarget));
    $('[data-copy-boleto]', dlg).addEventListener('click', (e) => copy('[data-boleto]', e.currentTarget));

    $('#p-num', dlg).addEventListener('input', (e) => { e.target.value = digits(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); });
    $('#p-val', dlg).addEventListener('input', (e) => { const d = digits(e.target.value).slice(0, 4); e.target.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; });
    $('#p-cvv', dlg).addEventListener('input', (e) => { e.target.value = digits(e.target.value).slice(0, 4); });

    const setErr = (el, msg) => {
      const f = el.closest('.field');
      f.classList.toggle('is-invalid', !!msg);
      $('.field__error', f).textContent = msg;
      el.setAttribute('aria-invalid', String(!!msg));
      return !msg;
    };
    const validate = () => {
      const nome = $('#p-nome', dlg), email = $('#p-email', dlg);
      const r = [
        setErr(nome, nome.value.trim().length < 3 ? 'Informe seu nome completo.' : ''),
        setErr(email, /^\S+@\S+\.\S+$/.test(email.value.trim()) ? '' : 'Digite um e-mail válido, como nome@email.com.')
      ];
      if (method === 'card') {
        const num = $('#p-num', dlg), holder = $('#p-holder', dlg), val = $('#p-val', dlg), cvv = $('#p-cvv', dlg);
        const m = digits(val.value);
        const mm = +m.slice(0, 2), yy = 2000 + +m.slice(2, 4), now = new Date();
        const expired = yy < now.getFullYear() || (yy === now.getFullYear() && mm < now.getMonth() + 1);
        r.push(
          setErr(num, digits(num.value).length < 13 ? 'Número de cartão incompleto.' : ''),
          setErr(holder, holder.value.trim().length < 3 ? 'Informe o nome impresso no cartão.' : ''),
          setErr(val, m.length < 4 || mm < 1 || mm > 12 ? 'Use o formato MM/AA.' : expired ? 'Cartão vencido.' : ''),
          setErr(cvv, digits(cvv.value).length < 3 ? 'CVV inválido.' : '')
        );
      }
      return r.every(Boolean);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) { $('.is-invalid input', form)?.focus(); return; }
      submit.disabled = true;
      submit.textContent = 'Processando…';
      setTimeout(() => {
        const first = $('#p-nome', dlg).value.trim().split(/\s+/)[0];
        const how = { pix: 'Pix', card: `cartão em ${$('[data-parcelas]', dlg).value}x`, boleto: 'boleto' }[method];
        $('[data-done-text]', dlg).textContent = `${first}, seu plano ${planName} (${periodName().toLowerCase()}) foi confirmado via ${how}: ${fmt.format(total())}.`;
        $('[data-proto]', dlg).textContent = `SIM-${rand(8)}`;
        form.hidden = true; demo.hidden = true; done.hidden = false; done.focus();
        form.reset(); submit.disabled = false;
        $$('.is-invalid', form).forEach((f) => f.classList.remove('is-invalid'));
      }, 1300);
    });
  }

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
