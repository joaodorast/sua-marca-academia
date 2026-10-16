/* Template academia premium — interações */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- header + CTA flutuante ---------- */
  const header = $('[data-header]');
  const floatCta = $('[data-float]');
  const trial = $('#experimental');
  let trialVisible = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (floatCta) floatCta.classList.toggle('is-visible', y > window.innerHeight * .8 && !trialVisible);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- menu mobile ---------- */
  const burger = $('[data-burger]');
  const nav = $('[data-nav]');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    if (open) nav.querySelector('a')?.focus({ preventScroll: true });
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  window.matchMedia('(min-width: 1021px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

  /* ---------- link ativo ---------- */
  const links = $$('.nav__link');
  const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));

    const tObs = new IntersectionObserver(([en]) => { trialVisible = en.isIntersecting; onScroll(); }, { threshold: .15 });
    if (trial) tObs.observe(trial);

    /* ---------- revelar ao rolar ---------- */
    const rev = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); rev.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    $$('.reveal').forEach((el, i) => {
      el.style.transitionDelay = reduce ? '0s' : ((i % 4) * 70) + 'ms';
      rev.observe(el);
    });
  } else {
    $$('.reveal').forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- modalidades: acordeão ---------- */
  const mods = $$('.mod');
  mods.forEach((mod) => {
    const btn = $('.mod__head', mod);
    btn.addEventListener('click', () => {
      const open = !mod.classList.contains('is-open');
      mods.forEach((m) => { m.classList.remove('is-open'); $('.mod__head', m).setAttribute('aria-expanded', 'false'); });
      if (open) { mod.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- planos ---------- */
  const period = $('[data-period]');
  if (period) {
    const btns = $$('button', period);
    const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const update = (btn, animate = true) => {
      const months = +btn.dataset.months;
      const discount = +btn.dataset.discount;
      btns.forEach((b, i) => {
        const on = b === btn;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on) period.style.setProperty('--i', i);
      });
      $$('.plan').forEach((plan) => {
        const v = $('.plan__value', plan);
        const total = $('[data-total]', plan);
        const monthly = Math.round(+v.dataset.base * (1 - discount));
        const apply = () => {
          v.textContent = monthly;
          total.textContent = months > 1 ? `${fmt.format(monthly * months)} por ${months} meses` : 'Sem fidelidade';
        };
        if (animate && !reduce && v.textContent !== String(monthly)) {
          v.classList.remove('is-changing'); void v.offsetWidth; v.classList.add('is-changing');
          setTimeout(apply, 200);
        } else apply();
      });
    };
    btns.forEach((b) => b.addEventListener('click', () => update(b)));
    period.addEventListener('keydown', (e) => {
      const i = btns.findIndex((b) => b.getAttribute('aria-checked') === 'true');
      let n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % btns.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + btns.length) % btns.length;
      if (n !== null) { e.preventDefault(); update(btns[n]); btns[n].focus(); }
    });
    update(btns[0], false);
  }

  // botão de plano pré-preenche o formulário
  $$('[data-plan]').forEach((a) => a.addEventListener('click', () => {
    const hidden = $('#t-plano');
    if (hidden) hidden.value = a.dataset.plan;
  }));

  /* ---------- máscara de telefone ---------- */
  $$('[data-mask="phone"]').forEach((input) => {
    input.addEventListener('input', () => {
      const d = input.value.replace(/\D/g, '').slice(0, 11);
      let out = d;
      if (d.length > 2) out = `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length > 7) out = `(${d.slice(0, 2)}) ${d.slice(2, d.length === 11 ? 7 : 6)}-${d.slice(d.length === 11 ? 7 : 6)}`;
      input.value = out;
    });
  });

  /* ---------- validação dos formulários ---------- */
  const messages = (el) => {
    const v = el.validity;
    if (v.valueMissing) return el.tagName === 'SELECT' ? 'Escolha uma opção.' : 'Preencha este campo.';
    if (v.typeMismatch && el.type === 'email') return 'Digite um e-mail válido, como nome@email.com.';
    if (v.tooShort) return `Use pelo menos ${el.minLength} caracteres.`;
    if (el.dataset.mask === 'phone' && el.value.replace(/\D/g, '').length < 10) return 'Informe o DDD e o número completo.';
    return '';
  };
  const check = (el) => {
    const field = el.closest('.field');
    const msg = messages(el);
    el.setCustomValidity(msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (field) {
      field.classList.toggle('is-invalid', !!msg);
      const err = $('.field__error', field);
      if (err) {
        err.textContent = msg;
        if (!err.id) err.id = el.id + '-erro';
        el.setAttribute('aria-describedby', err.id);
      }
    }
    return !msg;
  };

  $$('[data-form]').forEach((form) => {
    const controls = $$('input:not([type="hidden"]):not([type="radio"]), select, textarea', form);
    controls.forEach((el) => {
      el.addEventListener('blur', () => { if (el.value) check(el); });
      el.addEventListener('input', () => { if (el.closest('.field')?.classList.contains('is-invalid')) check(el); });
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const results = controls.map(check);
      const firstBad = controls[results.indexOf(false)];
      if (firstBad) { firstBad.focus(); return; }

      const data = Object.fromEntries(new FormData(form));
      // Integração: envie `data` para o seu backend, CRM ou API de WhatsApp aqui.
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      const label = btn.firstChild.textContent;
      btn.firstChild.textContent = 'Enviando… ';
      setTimeout(() => {
        const ok = $('.form__success', form);
        const text = $('[data-success-text]', ok);
        if (text && data.nome) {
          const first = data.nome.trim().split(/\s+/)[0];
          text.textContent = `${first}, vamos confirmar sua aula de ${data.modalidade.toLowerCase()} no período da ${data.periodo.toLowerCase()}${data.plano ? ` (interesse no plano ${data.plano})` : ''}.`;
        }
        ok.hidden = false;
        ok.focus({ preventScroll: true });
        form.reset();
        controls.forEach((el) => { el.closest('.field')?.classList.remove('is-invalid'); el.removeAttribute('aria-invalid'); });
        btn.disabled = false;
        btn.firstChild.textContent = label;
      }, 700);
    });
  });

  /* ---------- barra de progresso ---------- */
  const bar = $('[data-progress]');
  if (bar) {
    let ticking = false;
    const paint = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();
  }

  /* ---------- imagens: entrada suave ao carregar ---------- */
  $$('img[loading="lazy"]').forEach((img) => {
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });

  /* ---------- pausa animações contínuas fora da tela ---------- */
  if ('IntersectionObserver' in window) {
    const pause = new IntersectionObserver((entries) => {
      entries.forEach((en) => en.target.classList.toggle('is-paused', !en.isIntersecting));
    });
    $$('.ticker, .about__stamp').forEach((el) => pause.observe(el));
  }

  /* ---------- grade de horários ----------
     Edite aqui: [horário, aula, duração/local, nível 1–3] */
  const GRADE = {
    seg: [['06:00', 'Cross training', '60 min · Sala funcional', 3], ['07:00', 'Funcional', '50 min · Sala funcional', 2], ['12:15', 'Condicionamento', '30 min · Área de cardio', 3], ['18:30', 'Lutas', '60 min · Tatame', 2], ['19:30', 'Cross training', '60 min · Sala funcional', 3], ['20:30', 'Mobilidade', '45 min · Estúdio', 1]],
    ter: [['06:30', 'Funcional', '50 min · Sala funcional', 2], ['07:30', 'Mobilidade', '45 min · Estúdio', 1], ['12:15', 'Cross training', '60 min · Sala funcional', 3], ['18:00', 'Condicionamento', '30 min · Área de cardio', 3], ['19:00', 'Lutas', '60 min · Tatame', 2], ['20:00', 'Funcional', '50 min · Sala funcional', 2]],
    qua: [['06:00', 'Cross training', '60 min · Sala funcional', 3], ['07:00', 'Condicionamento', '30 min · Área de cardio', 3], ['12:15', 'Funcional', '50 min · Sala funcional', 2], ['18:30', 'Lutas', '60 min · Tatame', 2], ['19:30', 'Cross training', '60 min · Sala funcional', 3], ['20:30', 'Mobilidade', '45 min · Estúdio', 1]],
    qui: [['06:30', 'Funcional', '50 min · Sala funcional', 2], ['07:30', 'Cross training', '60 min · Sala funcional', 3], ['12:15', 'Mobilidade', '45 min · Estúdio', 1], ['18:00', 'Condicionamento', '30 min · Área de cardio', 3], ['19:00', 'Lutas', '60 min · Tatame', 2], ['20:00', 'Cross training', '60 min · Sala funcional', 3]],
    sex: [['06:00', 'Cross training', '60 min · Sala funcional', 3], ['07:00', 'Funcional', '50 min · Sala funcional', 2], ['12:15', 'Condicionamento', '30 min · Área de cardio', 3], ['18:30', 'Lutas', '60 min · Tatame', 2], ['19:30', 'Funcional', '50 min · Sala funcional', 2]],
    sab: [['09:00', 'Cross training', '60 min · Sala funcional', 3], ['10:15', 'Funcional', '50 min · Sala funcional', 2], ['11:15', 'Mobilidade', '45 min · Estúdio', 1]],
    dom: [['09:30', 'Funcional', '50 min · Sala funcional', 2], ['10:30', 'Mobilidade', '45 min · Estúdio', 1]]
  };
  const NIVEL = { 1: 'Leve', 2: 'Moderado', 3: 'Intenso' };
  const daysEl = $('[data-days]');
  const slotsEl = $('[data-slots]');
  if (daysEl && slotsEl) {
    const tabs = $$('[role="tab"]', daysEl);
    const panel = $('#sched-panel');
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const render = (day) => {
      const list = GRADE[day] || [];
      slotsEl.innerHTML = list.length
        ? list.map(([h, n, i, l], k) => `<li class="slot" style="--n:${k}"><time>${esc(h)}</time><span class="slot__name">${esc(n)}</span><span class="slot__info">${esc(i)}</span><span class="slot__lvl" data-lvl="${l}">${NIVEL[l]}</span></li>`).join('')
        : '<li class="slot slot--empty">Sem aulas coletivas neste dia. A musculação segue em horário livre.</li>';
    };
    const select = (tab, focus = false) => {
      tabs.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
      panel.setAttribute('aria-labelledby', tab.id);
      render(tab.dataset.day);
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };
    tabs.forEach((t) => t.addEventListener('click', () => select(t)));
    daysEl.addEventListener('keydown', (e) => {
      const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
      if (!(e.key in map)) return;
      e.preventDefault();
      select(tabs[(map[e.key] + tabs.length) % tabs.length], true);
    });
    const today = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][new Date().getDay()];
    const todayTab = tabs.find((t) => t.dataset.day === today);
    if (todayTab) { todayTab.classList.add('is-today'); tabs.forEach((t) => { const on = t === todayTab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; }); panel.setAttribute('aria-labelledby', todayTab.id); render(today); }
  }

  /* ---------- ano no rodapé ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
