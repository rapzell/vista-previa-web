/* ==========================================================================
   PIRAMICASA — HERO ROTATIVO + LIGHTBOX
   Usa las 3 imágenes de .pm-subpage-gallery (oculta) como fondo rotativo
   del .pm-subpage-hero y añade un botón "Ver imágenes" con popup.
   ========================================================================== */
(function () {
  'use strict';
  var INTERVAL = 6000;

  function init() {
    var hero = document.querySelector('.pm-subpage-hero');
    var gal = document.querySelector('.pm-subpage-gallery');
    var centGal = gal ? null : document.querySelector('.pm-centro-gallery');
    if (!hero || (!gal && !centGal) || hero.dataset.pmRot) return;

    var items = [];
    if (gal) {
      items = [].slice.call(gal.querySelectorAll('figure')).map(function (f) {
        var im = f.querySelector('img');
        var cap = f.querySelector('figcaption');
        return { src: im && im.src, alt: im ? im.alt : '', cap: cap ? cap.textContent : '' };
      });
    } else {
      // Páginas de terapeutas: usar las fotos reales del centro
      var seen = {};
      [].slice.call(centGal.querySelectorAll('img')).forEach(function (im) {
        var s = im.src;
        if (s && !seen[s] && items.length < 4) {
          seen[s] = 1;
          items.push({ src: s, alt: im.alt || '', cap: im.alt || '' });
        }
      });
    }
    items = items.filter(function (i) { return i.src; });
    if (!items.length) return;
    hero.dataset.pmRot = '1';

    /* Fondo: solo el degradado verde, la foto pasa a capas rotativas */
    hero.style.backgroundImage =
      'linear-gradient(135deg,rgba(31,42,40,.92),rgba(74,124,117,.82) 50%,rgba(31,42,40,.92))';

    var rot = document.createElement('div');
    rot.className = 'pm-hero-rot';
    rot.setAttribute('aria-hidden', 'true');
    var layers = items.map(function (it, i) {
      var d = document.createElement('div');
      d.className = 'pm-hero-rot-layer' + (i === 0 ? ' is-on' : '');
      d.style.backgroundImage = 'url("' + it.src + '")';
      rot.appendChild(d);
      return d;
    });
    hero.insertBefore(rot, hero.firstChild);

    var cur = 0;
    function next() {
      layers[cur].classList.remove('is-on');
      cur = (cur + 1) % layers.length;
      layers[cur].classList.add('is-on');
    }
    var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timer = reduced ? 0 : setInterval(next, INTERVAL);
    document.addEventListener('visibilitychange', function () {
      if (reduced) return;
      if (document.hidden) { clearInterval(timer); }
      else { timer = setInterval(next, INTERVAL); }
    });

    /* Botón "Ver imágenes" */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pm-hero-gallery-btn';
    // En heroes sin wrapper de contenido (páginas de terapeutas), el botón
    // absoluto pisa los CTA: mostrarlo en flujo, centrado bajo ellos.
    if (!hero.querySelector('.pm-subpage-hero-content')) btn.classList.add('is-inline');
    btn.setAttribute('aria-label', 'Ver imágenes de esta sección');
    btn.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/vista-previa-web//><circle cx="8.5" cy="8.5" r="1.5"/vista-previa-web//><path d="M21 15l-5-5L5 21"/vista-previa-web//></svg>' +
      '<span>Ver imágenes</span>';
    hero.appendChild(btn);

    /* Lightbox (eliminar uno previo si el hero se re-renderizó) */
    var oldLb = document.getElementById('pm-hero-lightbox');
    if (oldLb) oldLb.remove();
    var lb = document.createElement('div');
    lb.id = 'pm-hero-lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Galería de imágenes');
    lb.innerHTML =
      '<div class="pm-lb-stage">' +
        '<span class="pm-lb-count"></span>' +
        '<button type="button" class="pm-lb-close">Cerrar ✕</button>' +
        '<img class="pm-lb-img" alt="">' +
        '<div class="pm-lb-cap"></div>' +
        '<button type="button" class="pm-lb-nav pm-lb-prev" aria-label="Anterior">‹</button>' +
        '<button type="button" class="pm-lb-nav pm-lb-next" aria-label="Siguiente">›</button>' +
      '</div>';
    document.body.appendChild(lb);

    var li = 0;
    function show(i) {
      li = (i + items.length) % items.length;
      var im = lb.querySelector('.pm-lb-img');
      im.src = items[li].src;
      im.alt = items[li].alt;
      lb.querySelector('.pm-lb-cap').textContent = items[li].cap;
      lb.querySelector('.pm-lb-count').textContent = (li + 1) + ' / ' + items.length;
    }
    function openLb() {
      show(cur);
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function closeLb() {
      lb.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    btn.addEventListener('click', openLb);
    lb.querySelector('.pm-lb-close').addEventListener('click', closeLb);
    lb.querySelector('.pm-lb-prev').addEventListener('click', function () { show(li - 1); });
    lb.querySelector('.pm-lb-next').addEventListener('click', function () { show(li + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(li - 1);
      if (e.key === 'ArrowRight') show(li + 1);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  /* React hidrata asíncrono y puede re-renderizar: reintentar de forma
     persistente; init es idempotente (guarda dataset.pmRot) */
  var tries = 0;
  var iv = setInterval(function () {
    init();
    if (++tries > 40) clearInterval(iv);
  }, 1500);
})();
