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

  /* ------------------------------------------------------------------------
     Carrusel de próximos eventos (hero)
     Solo quedan los eventos de hoy en adelante, del más cercano al más
     lejano. Si ya pasaron todos, se muestran igual para no dejar el hero
     vacío. El avance automático lo marca la barra de progreso (CSS): al
     terminar su animación se pasa al siguiente.
     ------------------------------------------------------------------------ */

  const carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    const stage = carousel.querySelector('.carousel__stage');
    const navBar = carousel.querySelector('.carousel__nav');
    const dotList = carousel.querySelector('.carousel__dots');
    const pauseBtn = carousel.querySelector('[data-action="pause"]');
    const pauseIcon = pauseBtn.querySelector('i');
    const bgs = Array.from(carousel.querySelectorAll('.carousel__bg'));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let events = Array.from(stage.querySelectorAll('.slide'), (slide, i) => ({
      slide,
      bg: bgs[i],
      date: new Date(`${slide.dataset.date}T00:00`),
    })).sort((a, b) => a.date - b.date);

    const upcoming = events.filter((ev) => ev.date >= today);
    if (upcoming.length) {
      events.forEach((ev) => {
        if (upcoming.includes(ev)) return;
        ev.slide.remove();
        ev.bg.remove();
      });
      events = upcoming;
    }

    const total = events.length;
    const dots = events.map((ev, i) => {
      const title = ev.slide.querySelector('.hero__title').textContent.trim();
      ev.slide.setAttribute('aria-label', `${i + 1} de ${total}: ${title}`);

      const li = document.createElement('li');
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `${title}, ${ev.slide.dataset.short}`);
      dot.innerHTML =
        '<span class="carousel__bar"><span class="carousel__fill"></span></span>' +
        `<span class="carousel__dot-label" aria-hidden="true"><b></b></span>`;
      const label = dot.querySelector('.carousel__dot-label');
      label.querySelector('b').textContent = ev.slide.dataset.short;
      label.append(title);
      li.append(dot);
      dotList.append(li);
      return dot;
    });

    let current = 0;
    let userPaused = false;
    let hovering = false;
    let focused = false;

    const show = (index) => {
      current = (index + total) % total;
      events.forEach((ev, i) => {
        const active = i === current;
        ev.slide.classList.toggle('is-active', active);
        ev.bg.classList.toggle('is-active', active);
        if (active) dots[i].setAttribute('aria-current', 'true');
        else dots[i].removeAttribute('aria-current');
      });
    };

    const syncPause = () => {
      const paused = userPaused || hovering || focused;
      carousel.classList.toggle('is-paused', paused);
      // Anuncia los cambios solo cuando no avanza solo
      stage.setAttribute('aria-live', paused ? 'polite' : 'off');
    };

    const setUserPaused = (paused) => {
      userPaused = paused;
      pauseBtn.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
      pauseIcon.className = paused ? 'ph ph-play' : 'ph ph-pause';
      syncPause();
    };

    if (total < 2) {
      navBar.hidden = true;
    } else {
      // Con movimiento reducido no hay avance automático
      if (reduceMotion.matches) {
        carousel.classList.add('is-static');
        pauseBtn.hidden = true;
        userPaused = true;
      }

      dotList.addEventListener('animationend', (e) => {
        if (e.animationName === 'carousel-progress') show(current + 1);
      });

      dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
      carousel.querySelector('[data-action="prev"]').addEventListener('click', () => show(current - 1));
      carousel.querySelector('[data-action="next"]').addEventListener('click', () => show(current + 1));
      pauseBtn.addEventListener('click', () => setUserPaused(!userPaused));

      navBar.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        show(current + (e.key === 'ArrowRight' ? 1 : -1));
        if (e.target.classList.contains('carousel__dot')) dots[current].focus();
      });

      const content = carousel.querySelector('.carousel');
      content.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') { hovering = true; syncPause(); }
      });
      content.addEventListener('pointerleave', () => { hovering = false; syncPause(); });
      carousel.addEventListener('focusin', () => { focused = true; syncPause(); });
      carousel.addEventListener('focusout', (e) => {
        if (!carousel.contains(e.relatedTarget)) { focused = false; syncPause(); }
      });

      // Deslizar en pantallas táctiles
      let startX = 0;
      let startY = 0;
      carousel.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
      });
      carousel.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'mouse') return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - startY)) {
          show(current + (dx < 0 ? 1 : -1));
        }
      });
    }

    show(0);
    syncPause();
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
    const status = form.querySelector('.form__status');
    const inputs = Array.from(form.querySelectorAll('input'));
    const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const isValid = (input) => {
      const value = input.value.trim();
      if (input.required && value === '') return false;
      if (input.type === 'email' && value !== '' && !emailShape.test(value)) return false;
      return input.checkValidity();
    };

    const setFieldState = (input, valid) => {
      const error = document.getElementById(`e-${input.name}`);
      input.closest('.field').classList.toggle('is-invalid', !valid);
      input.setAttribute('aria-invalid', String(!valid));
      if (error && !valid) input.setAttribute('aria-describedby', error.id);
      else input.removeAttribute('aria-describedby');
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
        status.textContent = 'Revisa los campos marcados.';
        firstInvalid.focus();
        return;
      }

      status.textContent = 'Datos completos. La suscripción en línea aún no está activa.';
    });

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
      status.textContent = '';
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
