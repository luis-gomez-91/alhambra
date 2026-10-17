(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------------------
     Navegación: fondo al hacer scroll y menú móvil
     ------------------------------------------------------------------------ */

  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav__toggle');
  const menu = document.getElementById('nav-menu');
  const toggleIcon = toggle.querySelector('i');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    toggleIcon.className = open ? 'ph ph-x' : 'ph ph-list';
  };

  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  const film = document.querySelector('.hero__video');
  if (film && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    film.removeAttribute('autoplay');
    film.pause();
  }

  /* ------------------------------------------------------------------------
     Próximos eventos con scroll
     Solo quedan los eventos de hoy en adelante, del más cercano al más
     lejano. Si ya pasaron todos, se muestran igual para no dejar la sección
     vacía. La sección mide un tramo de pantalla por evento y el panel se
     queda fijo: según cuánto se haya recorrido se activa uno u otro. Cada
     evento recibe --local (0 a 1) para el parallax de su foto y la barra.
     Con movimiento reducido (o un solo evento) quedan apilados.
     ------------------------------------------------------------------------ */

  const eventsScroll = document.querySelector('[data-events]');

  if (eventsScroll) {
    const progress = eventsScroll.querySelector('.events-progress');
    const list = progress.querySelector('.events-progress__list');
    const countNow = progress.querySelector('.events-progress__count b');
    const countAll = progress.querySelector('.events-progress__count span');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let events = Array.from(eventsScroll.querySelectorAll('.event'), (el) => ({
      el,
      date: new Date(`${el.dataset.date}T00:00`),
    })).sort((a, b) => a.date - b.date);

    const upcoming = events.filter((ev) => ev.date >= today);
    if (upcoming.length) {
      events.forEach((ev) => { if (!upcoming.includes(ev)) ev.el.remove(); });
      events = upcoming;
    }
    // Respeta el orden cronológico también en el DOM (lo usa la vista apilada)
    events.forEach((ev) => progress.before(ev.el));

    const total = events.length;
    const pad = (n) => String(n).padStart(2, '0');
    countAll.textContent = pad(total);

    const dots = events.map((ev, i) => {
      const title = ev.el.querySelector('.event__title').textContent.trim();
      const li = document.createElement('li');
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'events-progress__dot';
      dot.setAttribute('aria-label', `${title}, ${ev.el.dataset.short}`);
      dot.innerHTML =
        '<span class="events-progress__bar"><span class="events-progress__fill"></span></span>' +
        '<span class="events-progress__label" aria-hidden="true"><b></b></span>';
      const label = dot.querySelector('.events-progress__label');
      label.querySelector('b').textContent = ev.el.dataset.short;
      label.append(title);
      dot.addEventListener('click', () => goTo(i));
      li.append(dot);
      list.append(li);
      return dot;
    });

    let current = -1;
    let pinned = false;
    let ticking = false;

    const show = (index) => {
      if (index === current) return;
      current = index;
      events.forEach((ev, i) => {
        const active = i === index;
        ev.el.classList.toggle('is-active', active);
        ev.el.inert = !active;
        if (active) dots[i].setAttribute('aria-current', 'true');
        else dots[i].removeAttribute('aria-current');
      });
      countNow.textContent = pad(index + 1);
    };

    // Recorrido de la sección: 0 cuando el panel se fija, 1 cuando se suelta
    const range = () => {
      const top = eventsScroll.getBoundingClientRect().top + window.scrollY;
      return { top, length: eventsScroll.offsetHeight - window.innerHeight };
    };

    const goTo = (i) => {
      const { top, length } = range();
      // Un poco dentro del tramo para que no quede en el borde con el anterior
      const behavior = reduceMotion.matches ? 'auto' : 'smooth';
      window.scrollTo({ top: top + length * ((i + 0.15) / total), behavior });
    };

    const update = () => {
      ticking = false;
      if (!pinned) return;
      const { top, length } = range();
      const p = Math.min(Math.max((window.scrollY - top) / length, 0), 1);
      const pos = p * total;
      events.forEach((ev, i) => {
        const local = Math.min(Math.max(pos - i, 0), 1);
        ev.el.style.setProperty('--local', local.toFixed(4));
        dots[i].style.setProperty('--local', local.toFixed(4));
      });
      show(Math.min(Math.floor(pos), total - 1));
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const setMode = () => {
      pinned = total > 1 && !reduceMotion.matches;
      eventsScroll.classList.toggle('is-pinned', pinned);
      eventsScroll.style.setProperty('--count', total);
      progress.hidden = !pinned;
      if (pinned) {
        current = -1;
        update();
      } else {
        events.forEach((ev) => {
          ev.el.classList.add('is-active');
          ev.el.inert = false;
          ev.el.style.removeProperty('--local');
        });
      }
    };

    setMode();
    reduceMotion.addEventListener('change', setMode);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  /* ------------------------------------------------------------------------
     Revelado al entrar en viewport
     ------------------------------------------------------------------------ */

  const revealItems = document.querySelectorAll('.reveal');

  // Escalona los elementos hermanos de una misma lista
  document.querySelectorAll('.grid').forEach((list) => {
    Array.from(list.children).forEach((item, i) => {
      item.style.setProperty('--delay', `${(i % 4) * 0.08}s`);
    });
  });

  // En «Descubre» el retraso depende de la columna, así cada fila entra de izquierda a derecha
  document.querySelectorAll('.discover__grid').forEach((list) => {
    const box = list.getBoundingClientRect();
    Array.from(list.children).forEach((item) => {
      const left = (item.getBoundingClientRect().left - box.left) / box.width;
      item.style.setProperty('--delay', `${(left * 0.36).toFixed(2)}s`);
    });
  });

  // Cuando termina el revelado se quita la clase para que el hover recupere su transición
  const settle = (el) => {
    el.classList.remove('reveal', 'is-visible');
    el.style.removeProperty('--delay');
  };

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(settle);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        el.addEventListener('transitionend', (ev) => {
          if (ev.target === el && ev.propertyName === 'opacity') settle(el);
        });
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    revealItems.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------------
     Filas de logos: se repiten hasta cubrir el ancho y se duplican una vez
     más para que el recorrido a -50% sea continuo. La velocidad es la
     misma en todas las filas aunque tengan distinta cantidad de logos.
     ------------------------------------------------------------------------ */

  const marquees = document.querySelectorAll('[data-marquee]');
  const SPEED = 40; // px por segundo

  // Los logos anchos se achican y los cuadrados crecen: misma presencia visual
  document.querySelectorAll('.marquee__track img').forEach((img) => {
    const w = Number(img.getAttribute('width'));
    const h = Number(img.getAttribute('height'));
    const ratio = w && h ? w / h : 2.5;
    img.style.setProperty('--k', Math.min(Math.max(ratio ** -0.42, 0.34), 1).toFixed(3));
  });

  const buildMarquee = (marquee) => {
    const track = marquee.querySelector('.marquee__track');
    const originals = Array.from(track.querySelectorAll('li:not([aria-hidden])'));
    track.replaceChildren(...originals);

    const addCopy = () => originals.forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.append(copy);
    });

    for (let i = 0; i < 20 && track.scrollWidth < marquee.clientWidth; i++) addCopy();
    const half = track.scrollWidth;
    if (!half) return;
    Array.from(track.children).forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.append(copy);
    });

    marquee.style.setProperty('--marquee-duration', `${half / SPEED}s`);
    marquee.classList.add('is-ready');
  };

  if (marquees.length) {
    // Espera a las imágenes para medir anchos reales
    window.addEventListener('load', () => {
      marquees.forEach(buildMarquee);
      let width = window.innerWidth;
      window.addEventListener('resize', () => {
        if (window.innerWidth === width) return;
        width = window.innerWidth;
        marquees.forEach(buildMarquee);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Movimiento ligado al scroll
     - Hero: --hero-p va de 0 a 1 mientras sale de pantalla (lo usa el CSS).
     - Descubre: cada foto se desplaza dentro de su marco (--py).
     - Logos: las filas aceleran con la velocidad del scroll y, al subir
       rápido, giran al revés. Al soltar vuelven solas a su ritmo.
     ------------------------------------------------------------------------ */

  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const hero = document.querySelector('.hero--film');
    const tracks = Array.from(document.querySelectorAll('.marquee__track'));
    const frames = new Set();

    const frameIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) frames.add(entry.target);
        else frames.delete(entry.target);
      });
    });
    document.querySelectorAll('.discover__frame').forEach((frame) => frameIO.observe(frame));

    let lastY = window.scrollY;
    let velocity = 0; // px por cuadro, suavizado
    let running = false;

    const setRate = (rate) => tracks.forEach((track) => {
      track.getAnimations().forEach((anim) => { anim.playbackRate = rate; });
    });

    const tick = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      velocity = velocity * 0.88 + (y - lastY) * 0.12;
      lastY = y;

      if (hero) {
        const p = Math.min(Math.max(y / hero.offsetHeight, 0), 1);
        hero.style.setProperty('--hero-p', p.toFixed(4));
      }

      frames.forEach((frame) => {
        const r = frame.getBoundingClientRect();
        // -1 cuando el marco entra por abajo, 1 cuando sale por arriba
        const t = (vh / 2 - (r.top + r.height / 2)) / ((vh + r.height) / 2);
        frame.style.setProperty('--py', `${(t * 6).toFixed(2)}%`);
      });

      if (Math.abs(velocity) > 0.05) {
        setRate(1 + Math.max(-3, Math.min(4, velocity * 0.3)));
        requestAnimationFrame(tick);
      } else {
        velocity = 0;
        setRate(1);
        running = false;
      }
    };

    const kick = () => {
      if (running) return;
      running = true;
      requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    kick();
  }

  /* ------------------------------------------------------------------------
     Cifras: cuentan desde 0 al entrar en pantalla. El HTML ya trae el valor
     final, así que sin JS o sin movimiento se ve el número directamente.
     ------------------------------------------------------------------------ */

  const counters = document.querySelectorAll('[data-count]');

  if (counters.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    const DURATION = 1800;
    const easeOut = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

    const digit = (el) => el.querySelector('span') || el;

    const run = (el, delay) => {
      const target = Number(el.dataset.count);
      const value = digit(el);
      let start = 0;
      const step = (now) => {
        if (!start) start = now + delay;
        const t = Math.min(Math.max((now - start) / DURATION, 0), 1);
        value.textContent = String(Math.round(easeOut(t) * target));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countIO.unobserve(entry.target);
        run(entry.target, Array.from(counters).indexOf(entry.target) * 120);
      });
    }, { threshold: 0.6 });

    counters.forEach((el) => {
      digit(el).textContent = '0';
      countIO.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     Cursor «Ver»: un círculo que sigue al mouse con un leve retraso sobre
     los elementos con data-cursor. Solo con mouse y con movimiento activo.
     ------------------------------------------------------------------------ */

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (finePointer.matches && !reduceMotion.matches && document.querySelector('[data-cursor]')) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
    document.documentElement.classList.add('has-cursor');

    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let scale = 0;
    let scaleTo = 0;
    let following = false;
    let hideTimer = 0;

    const follow = () => {
      cx += (x - cx) * 0.55;
      cy += (y - cy) * 0.55;
      scale += (scaleTo - scale) * 0.35;
      if (scale < 0.01) scale = 0;
      // Escala y posición van en el mismo transform: si la escala vive aparte,
      // al salir de la foto el círculo salta a la esquina y vuelve
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(${scale})`;
      if (Math.abs(x - cx) > 0.4 || Math.abs(y - cy) > 0.4 || Math.abs(scaleTo - scale) > 0.01) {
        requestAnimationFrame(follow);
      } else following = false;
    };

    const start = () => {
      if (following) return;
      following = true;
      requestAnimationFrame(follow);
    };

    const place = (show) => {
      if (show) {
        clearTimeout(hideTimer);
        if (scaleTo === 0) {
          // Aparece donde está el mouse, sin viajar desde la posición anterior
          cx = x;
          cy = y;
        }
        scaleTo = 1;
        start();
        return;
      }
      // El hueco entre fotos es estrecho: un corte inmediato hace parpadear el círculo
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        scaleTo = 0;
        start();
      }, 50);
    };

    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      const target = e.target.closest('[data-cursor]');
      if (target) cursor.textContent = target.dataset.cursor;
      place(Boolean(target));
      start();
    });

    document.addEventListener('pointerleave', () => {
      clearTimeout(hideTimer);
      scaleTo = 0;
      start();
    });
    // Al hacer scroll con la rueda el mouse no se mueve pero la foto debajo sí
    window.addEventListener('scroll', () => {
      const under = document.elementFromPoint(x, y);
      place(Boolean(under && under.closest('[data-cursor]')));
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     Categorías
     Cada tarjeta lleva data-categorias con las opciones del sitio en vivo.
     Los chips pasan a ser botones y filtran la grilla. Las categorías
     secundarias (data-extra) quedan plegadas tras «Ver todas».
     El buscador se suma al chip activo: una tarjeta se ve si cumple ambos.
     ------------------------------------------------------------------------ */

  // Minúsculas y sin tildes, para que «cafeteria» encuentre «Cafetería»
  const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  // Estado de filtro por grilla: { category, query }
  const filters = new Map();

  const applyFilters = (grid) => {
    const { category = null, query = '' } = filters.get(grid.id) || {};
    let visible = 0;

    Array.from(grid.children).forEach((card) => {
      const cats = (card.dataset.categorias || '').split('|');
      const logo = card.querySelector('.card__logo img');
      // data-nombre lleva el nombre real del local; mientras no exista se usa el alt del logo
      const haystack = normalize([card.dataset.nombre || '', logo ? logo.alt : '', ...cats].join(' '));
      const show = (category === null || cats.includes(category)) && (query === '' || haystack.includes(query));
      card.hidden = !show;
      if (show) visible += 1;
    });

    const empty = document.querySelector(`[data-empty-for="${grid.id}"]`);
    if (empty) {
      empty.textContent = visible === 0
        ? 'No encontramos resultados. Prueba con otra palabra o elige «Todas».'
        : '';
    }
  };

  const setFilter = (grid, patch) => {
    filters.set(grid.id, { ...filters.get(grid.id), ...patch });
    applyFilters(grid);
  };

  document.querySelectorAll('.search input[data-target]').forEach((input) => {
    const grid = document.getElementById(input.dataset.target);
    if (!grid) return;
    input.addEventListener('input', () => setFilter(grid, { query: normalize(input.value) }));
  });

  document.querySelectorAll('.chips').forEach((list) => {
    const grid = document.getElementById(list.dataset.target);
    const cards = grid ? Array.from(grid.children) : [];
    const hasData = cards.some((card) => card.dataset.categorias);

    if (hasData) {
      list.classList.add('is-interactive');

      list.querySelectorAll('span.chip').forEach((span) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = span.className;
        btn.textContent = span.textContent;
        if (span.dataset.filter) btn.dataset.filter = span.dataset.filter;
        btn.setAttribute('aria-pressed', String(Boolean(span.dataset.filter)));
        span.replaceWith(btn);
      });

      list.addEventListener('click', (e) => {
        const chip = e.target.closest('button.chip:not(.chip--more)');
        if (!chip) return;

        list.querySelectorAll('button.chip:not(.chip--more)').forEach((c) => {
          c.setAttribute('aria-pressed', String(c === chip));
        });

        const value = chip.dataset.filter === 'todas' ? null : chip.textContent.trim();
        setFilter(grid, { category: value });
      });
    }

    const extras = list.querySelectorAll('[data-extra]');
    if (!extras.length) return;

    const total = list.dataset.total || list.querySelectorAll('.chip:not(.chip--all)').length;
    const item = document.createElement('li');
    item.className = 'chips__more';
    item.innerHTML =
      '<button type="button" class="chip chip--more" aria-expanded="false">' +
      '<span></span><i class="ph ph-plus" aria-hidden="true"></i></button>';
    list.append(item);

    const more = item.querySelector('button');
    const moreLabel = more.querySelector('span');
    const moreIcon = more.querySelector('i');

    const setOpen = (open) => {
      list.classList.toggle('is-collapsed', !open);
      more.setAttribute('aria-expanded', String(open));
      moreLabel.textContent = open ? 'Ver menos' : `Ver todas (${total})`;
      moreIcon.className = open ? 'ph ph-minus' : 'ph ph-plus';
    };

    setOpen(false);
    more.addEventListener('click', () => setOpen(more.getAttribute('aria-expanded') !== 'true'));
  });

  /* ------------------------------------------------------------------------
     Formulario: validación en el navegador. No hay backend todavía, así que
     el mensaje final no afirma que los datos se enviaron.
     ------------------------------------------------------------------------ */

  const form = document.getElementById('subscribe-form');
  if (form) {
    const toast = document.getElementById('form-toast');
    let toastTimer = 0;
    const inputs = Array.from(form.querySelectorAll('input'));
    const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const isValid = (input) => {
      const value = input.value.trim();
      if (input.required && value === '') return false;
      if (input.type === 'email' && value !== '' && !emailShape.test(value)) return false;
      return input.checkValidity();
    };

    const setFieldState = (input, valid) => {
      input.closest('.field').classList.toggle('is-invalid', !valid);
      input.setAttribute('aria-invalid', String(!valid));
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let firstInvalid = null;

      inputs.forEach((input) => {
        const valid = isValid(input);
        setFieldState(input, valid);
        if (!valid && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        showToast('Faltan campos por llenar.');
        return;
      }

      showToast('Datos completos. La suscripción en línea aún no está activa.');
    });

    const showToast = (message) => {
      toast.textContent = message;
      toast.hidden = false;
      clearTimeout(toastTimer);
      requestAnimationFrame(() => {
        toast.classList.add('is-visible');
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
      });
    };

    // Revalida al salir de un campo que ya tiene contenido o que estaba marcado
    form.addEventListener('focusout', (e) => {
      const input = e.target;
      if (!(input instanceof HTMLInputElement)) return;
      if (input.value.trim() === '' && !input.closest('.field').classList.contains('is-invalid')) return;
      setFieldState(input, isValid(input));
    });

    form.addEventListener('input', (e) => {
      const input = e.target;
      if (input.closest('.field').classList.contains('is-invalid') && isValid(input)) {
        setFieldState(input, true);
      }
      toast.classList.remove('is-visible');
    });

    // Email que llega desde el footer de otra página (index.html?email=…#suscripcion)
    const emailParam = new URLSearchParams(location.search).get('email');
    if (emailParam) document.getElementById('f-email').value = emailParam;
  }

  // Suscripción del footer: lleva el email al formulario completo
  const footerForm = document.getElementById('footer-subscribe');
  if (footerForm) {
    footerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = footerForm.querySelector('input').value.trim();
      const section = document.getElementById('suscripcion');
      // El formulario completo solo vive en el index
      if (!section) {
        location.href = `index.html${email ? `?email=${encodeURIComponent(email)}` : ''}#suscripcion`;
        return;
      }
      const target = document.getElementById('f-email');
      if (target && email) target.value = email;
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('f-nombres').focus({ preventScroll: true });
    });
  }
})();
