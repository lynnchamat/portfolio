/* Lynn Chamat — Portfolio
 * Scroll-reveal, page indicator, keyboard navigation, section nav highlight.
 */

(function () {
  'use strict';

  const deck = document.getElementById('deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const indicator = document.querySelector('.page-indicator');
  const indicatorNum = indicator?.querySelector('.page-indicator__num');
  const navLinks = Array.from(document.querySelectorAll('.topbar__nav a'));

  if (!deck || slides.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Text splitting (letters / words) ─────────────────── */
  function splitText(el, mode) {
    if (!el) return 0;
    const original = el.textContent.trim();
    el.setAttribute('aria-label', original);

    /* Walk children to preserve <br> tags */
    const fragments = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        fragments.push({ kind: 'text', value: node.nodeValue });
      } else if (node.nodeName === 'BR') {
        fragments.push({ kind: 'br' });
      } else {
        fragments.push({ kind: 'text', value: node.textContent });
      }
    });

    el.textContent = '';
    let i = 0;

    fragments.forEach((frag) => {
      if (frag.kind === 'br') {
        el.appendChild(document.createElement('br'));
        return;
      }
      if (mode === 'letters') {
        /* Group consecutive non-space chars into a word-group so the
           browser never line-breaks inside a word. */
        const tokens = frag.value.split(/(\s+)/);
        for (const tok of tokens) {
          if (tok === '') continue;
          if (/^\s+$/.test(tok)) {
            el.appendChild(document.createTextNode(tok));
            continue;
          }
          const wordGroup = document.createElement('span');
          wordGroup.className = 'char-word';
          for (const ch of tok) {
            const span = document.createElement('span');
            span.setAttribute('aria-hidden', 'true');
            span.className = 'char';
            span.textContent = ch;
            span.style.setProperty('--i', i++);
            wordGroup.appendChild(span);
          }
          el.appendChild(wordGroup);
        }
      } else {
        const words = frag.value.split(/(\s+)/);
        for (const w of words) {
          if (w === '') continue;
          if (/^\s+$/.test(w)) {
            el.appendChild(document.createTextNode(w));
            continue;
          }
          const span = document.createElement('span');
          span.className = 'word';
          span.setAttribute('aria-hidden', 'true');
          span.textContent = w;
          span.style.setProperty('--i', i++);
          el.appendChild(span);
        }
      }
    });

    el.classList.add('is-split');
    return i;
  }

  document.querySelectorAll('[data-split-letters]').forEach((el) => splitText(el, 'letters'));
  document.querySelectorAll('[data-split-words]').forEach((el) => {
    const count = splitText(el, 'words');
    el.style.setProperty('--word-count', count);
  });

  /* ── Decorative drifting asterisks (cover + thanks bg) ── */
  /* Each zone = { top: [min%, max%], left: [min%, max%] }.
     Asterisks are placed only inside these text-free regions. */
  function spawnDecoAsterisks(parent, count, zones) {
    if (!parent || reduceMotion) return;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < count; i++) {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', 'deco-asterisk');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS(SVG_NS, 'use');
      use.setAttribute('href', '#asterisk');
      svg.appendChild(use);

      const size = 16 + Math.random() * 14;            // 16–30px
      const zone = zones[i % zones.length];
      const top  = zone.top[0]  + Math.random() * (zone.top[1]  - zone.top[0]);
      const left = zone.left[0] + Math.random() * (zone.left[1] - zone.left[0]);
      const dur  = 14 + Math.random() * 8;             // 14–22s
      const delay = Math.random() * 4;                 // 0–4s
      const opacity = 0.10 + Math.random() * 0.08;     // 0.10–0.18 (subtle)

      svg.style.width = `${size}px`;
      svg.style.height = `${size}px`;
      svg.style.top = `${top.toFixed(1)}%`;
      svg.style.left = `${left.toFixed(1)}%`;
      svg.style.setProperty('--dur', `${dur.toFixed(2)}s`);
      svg.style.setProperty('--delay', `${delay.toFixed(2)}s`);
      svg.style.setProperty('--opacity', opacity.toFixed(2));

      parent.appendChild(svg);
    }
  }

  const coverFrame = document.querySelector('.slide--cover .frame');
  const thanksFrame = document.querySelector('.slide--thanks .frame');

  /* Cover: only the top-left empty area (above the title, left of the floral) */
  spawnDecoAsterisks(coverFrame, 4, [
    { top: [6, 42], left: [4, 46] }
  ]);

  /* Thanks: top band (above THANK YOU!) and bottom band (below YOU!),
     left half only — keeps clear of the big asterisk on the right */
  spawnDecoAsterisks(thanksFrame, 5, [
    { top: [4, 18],  left: [6, 56] },
    { top: [82, 94], left: [6, 56] }
  ]);

  /* ── Thank-you asterisk burst ─────────────────────────── */
  /* Wrap the star SVG in a positioned span so HTML burst particles can sit on top */
  let starWrap = null;
  const thanksStar = document.querySelector('.thanks__star');
  if (thanksStar) {
    starWrap = document.createElement('span');
    starWrap.className = 'thanks__star-wrap';
    thanksStar.parentNode.insertBefore(starWrap, thanksStar);
    starWrap.appendChild(thanksStar);
  }

  function spawnBurst() {
    if (!starWrap || reduceMotion) return;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const count = 8;
    for (let i = 0; i < count; i++) {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('class', 'burst-particle');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS(SVG_NS, 'use');
      use.setAttribute('href', '#asterisk');
      svg.appendChild(use);

      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 90 + Math.random() * 80;        // 90–170px
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      svg.style.setProperty('--dx', `${dx.toFixed(0)}px`);
      svg.style.setProperty('--dy', `${dy.toFixed(0)}px`);

      starWrap.appendChild(svg);
      svg.addEventListener('animationend', () => svg.remove(), { once: true });
    }
  }


  /* ── Divider label decorations + underline rule ───────── */
  document.querySelectorAll('.slide--divider').forEach((slide) => {
    const dividerEl = slide.querySelector('.divider');
    const labelEl   = slide.querySelector('.divider__label');
    const copyEl    = slide.querySelector('.divider__copy');
    if (!dividerEl || !labelEl) return;

    /* Wrap label in a flex container holding label + small mark */
    const wrapper = document.createElement('span');
    wrapper.className = 'divider__label-deco';
    labelEl.parentNode.insertBefore(wrapper, labelEl);
    wrapper.appendChild(labelEl);
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const mark = document.createElementNS(SVG_NS, 'svg');
    mark.setAttribute('class', 'deco-mark');
    mark.setAttribute('viewBox', '0 0 100 100');
    mark.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#asterisk');
    mark.appendChild(use);
    wrapper.appendChild(mark);

    /* Underline rule beneath the copy */
    if (copyEl) {
      const rule = document.createElement('span');
      rule.className = 'divider__rule';
      rule.setAttribute('aria-hidden', 'true');
      copyEl.parentNode.insertBefore(rule, copyEl.nextSibling);
    }
  });

  /* ── Scroll reveal ───────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');

        /* Thank-you slide: fire a one-shot asterisk burst the first time it reveals */
        if (entry.target.classList.contains('slide--thanks') &&
            !entry.target.dataset.burstFired) {
          entry.target.dataset.burstFired = '1';
          /* Slight delay so it lands after the title pop */
          setTimeout(() => spawnBurst(), 600);
        }
      }
    });
  }, { root: deck, threshold: 0.25 });

  slides.forEach((slide) => revealObserver.observe(slide));

  /* The first slide on load: reveal immediately so the cover animates */
  requestAnimationFrame(() => {
    if (slides[0]) slides[0].classList.add('is-revealed');
  });

  /* ── Active-slide tracker (page indicator + nav highlight) ─ */
  let lastActive = 1;

  const trackObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const page = parseInt(entry.target.dataset.page, 10);
        if (page === lastActive) return;
        lastActive = page;
        updateIndicator(page);
        updateNavHighlight(page);
      }
    });
  }, { root: deck, threshold: [0.5, 0.75] });

  slides.forEach((slide) => trackObserver.observe(slide));

  function updateIndicator(page) {
    if (!indicator || !indicatorNum) return;
    indicator.classList.add('is-changing');
    setTimeout(() => {
      indicatorNum.textContent = String(page);
      indicator.classList.remove('is-changing');
    }, 140);
  }

  function updateNavHighlight(page) {
    let activeSection = null;
    if (page >= 2 && page <= 9)  activeSection = 'event-concept';
    if (page >= 10 && page <= 15) activeSection = 'event-execution';
    if (page >= 16 && page <= 24) activeSection = 'pr-strategy';

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.section === activeSection);
    });
  }

  /* ── Keyboard navigation ─────────────────────────────── */
  function scrollToSlide(index) {
    const target = slides[index];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.addEventListener('keydown', (e) => {
    /* Don't hijack typing in inputs/textareas */
    if (e.target.matches('input, textarea, [contenteditable]')) return;

    const currentIndex = slides.findIndex((s) => parseInt(s.dataset.page, 10) === lastActive);

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        scrollToSlide(currentIndex + 1);
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        scrollToSlide(currentIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        scrollToSlide(currentIndex + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        scrollToSlide(currentIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        scrollToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        scrollToSlide(slides.length - 1);
        break;
    }
  });

  /* ── Smooth-scroll for in-page anchor clicks ─────────── */
  document.querySelectorAll('a[href^="#page-"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

})();
