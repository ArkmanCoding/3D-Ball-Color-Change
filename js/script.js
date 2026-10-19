/* =====================================================================
   js/script.js  —  Color Core
   ---------------------------------------------------------------------
   * Original click logic preserved EXACTLY (only one dispatch line added)
   * Visual layer is fully JS-driven: every element receives its colour
     via element.style (rgba), no reliance on CSS variables or color-mix.
   ===================================================================== */


/* =====================================================================
   PART 1 — ORIGINAL LOGIC (untouched, only the dispatch line is added)
   ===================================================================== */

const box = document.getElementById("box");

box.addEventListener("click", function(event){
    const color_name = event.target.dataset.value;
    console.log('User Click On The Color :', color_name);

    /* --- the ONLY addition: hand the colour to the visual layer --- */
    document.dispatchEvent(new CustomEvent("colorchange", { detail: color_name }));
});


/* =====================================================================
   PART 2 — VISUAL LAYER
   ===================================================================== */

(function initVisualLayer () {
  'use strict';

  console.log('[ColorCore] Visual layer booting…');

  /* ------------------------------------------------------------------
     PALETTE — RGB so we can build rgba() strings anywhere
     ------------------------------------------------------------------ */
  const PALETTE = {
    red: {
      rgb:  [255, 45, 85],
      soft: [255, 168, 184],
      hex:  '#ff2d55'
    },
    green: {
      rgb:  [22, 224, 125],
      soft: [157, 247, 201],
      hex:  '#16e07d'
    },
    blue: {
      rgb:  [47, 107, 255],
      soft: [166, 194, 255],
      hex:  '#2f6bff'
    }
  };

  /* ------------------------------------------------------------------
     UTILITIES
     ------------------------------------------------------------------ */
  function rgbString (rgb) {
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  }

  function rgbaString (rgb, alpha) {
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
  }

  /* ------------------------------------------------------------------
     ELEMENT REFERENCES
     ------------------------------------------------------------------ */
  const root         = document.documentElement;
  const stage        = document.getElementById('stage');
  const ambient      = document.getElementById('ambient');
  const orbCore      = document.getElementById('orbCore');
  const orbHalo      = document.getElementById('orbHalo');
  const orbCage      = document.getElementById('orbCage');
  const cageLines    = orbCage   ? orbCage.querySelectorAll('i') : [];
  const orbitRings   = document.querySelectorAll('.orb__orbit');
  const orbitDots    = document.querySelectorAll('.orb__orbit b');
  const platform     = document.querySelector('.platform');
  const platformGlow = document.getElementById('platformGlow');
  const platformRings= document.querySelectorAll('.platform__ring');
  const shock        = document.getElementById('shock');
  const particlesBox = document.getElementById('particles');
  const statusEl     = document.getElementById('status');
  const hudEyebrow   = document.getElementById('hudEyebrow');
  const hudDot       = document.getElementById('hudDot');
  const hudTitle     = document.getElementById('hudTitle');
  const watermark    = document.getElementById('watermark');
  const buttons      = Array.prototype.slice.call(document.querySelectorAll('.mybtn'));

  console.log('[ColorCore] Elements found:',
    'ambient=' + !!ambient,
    'core=' + !!orbCore,
    'halo=' + !!orbHalo,
    'cageLines=' + cageLines.length,
    'rings=' + platformRings.length,
    'particles=' + !!particlesBox,
    'buttons=' + buttons.length
  );

  /* ==================================================================
     1. BUILD PARTICLE FIELD
     ================================================================== */
  (function buildParticles () {
    if (!particlesBox) return;

    const small = window.matchMedia('(max-width: 640px)').matches;
    const count = small ? 16 : 28;
    const frag  = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const p = document.createElement('i');

      p.style.setProperty('--x',     (Math.random() * 100).toFixed(2) + '%');
      p.style.setProperty('--y',     (58 + Math.random() * 46).toFixed(2) + '%');
      p.style.setProperty('--s',     (1 + Math.random() * 2.6).toFixed(2) + 'px');
      p.style.setProperty('--dur',   (7 + Math.random() * 9).toFixed(2) + 's');
      p.style.setProperty('--delay', (-Math.random() * 16).toFixed(2) + 's');
      p.style.setProperty('--dx',    ((Math.random() - 0.5) * 90).toFixed(1) + 'px');

      frag.appendChild(p);
    }

    particlesBox.appendChild(frag);
    console.log('[ColorCore] Built ' + count + ' particles');
  })();

  /* ==================================================================
     2. POINTER PARALLAX
     ================================================================== */
  (function parallax () {
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = 0, targetY = 0, queued = false;

    function apply () {
      queued = false;
      stage.style.setProperty('--px', targetX.toFixed(2) + 'deg');
      stage.style.setProperty('--py', targetY.toFixed(2) + 'deg');
    }

    window.addEventListener('pointermove', function (e) {
      targetX = (e.clientX / window.innerWidth  - 0.5) *  20;
      targetY = (e.clientY / window.innerHeight - 0.5) * -15;
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });
  })();

  /* ==================================================================
     3. THE MAIN COLOR APPLIER
        Writes inline styles directly onto every element.
     ================================================================== */
  function applyColorToElement (el, styles) {
    if (!el) return;
    for (const key in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, key)) {
        try { el.style[key] = styles[key]; }
        catch (err) { /* ignore unsupported props */ }
      }
    }
  }

  function colorizeAmbient (rgb, soft) {
    if (!ambient) return;
    const r = rgb[0],  g = rgb[1],  b = rgb[2];
    const sr = soft[0], sg = soft[1], sb = soft[2];

    ambient.style.background =
      'radial-gradient(38% 38% at 50% 44%,' +
        ' rgba(' + r + ',' + g + ',' + b + ',0.46) 0%,' +
        ' rgba(' + r + ',' + g + ',' + b + ',0) 68%),' +
      'radial-gradient(60% 46% at 50% 108%,' +
        ' rgba(' + r + ',' + g + ',' + b + ',0.30) 0%,' +
        ' rgba(' + r + ',' + g + ',' + b + ',0) 70%),' +
      'radial-gradient(70% 60% at 12% 8%,' +
        ' rgba(' + sr + ',' + sg + ',' + sb + ',0.16) 0%,' +
        ' rgba(' + sr + ',' + sg + ',' + sb + ',0) 66%)';
  }

  function colorizeOrbCore (rgb) {
    if (!orbCore) return;
    const r = rgb[0], g = rgb[1], b = rgb[2];

    orbCore.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';

    orbCore.style.boxShadow =
      '0 0 46px  rgba(' + r + ',' + g + ',' + b + ',0.78),' +
      '0 0 120px rgba(' + r + ',' + g + ',' + b + ',0.52),' +
      '0 0 230px rgba(' + r + ',' + g + ',' + b + ',0.30),' +
      'inset -22px -24px 60px rgba(0,0,0,0.85),' +
      'inset  18px  18px 50px rgba(255,255,255,0.16)';
  }

  function colorizeOrbHalo (rgb) {
    if (!orbHalo) return;
    orbHalo.style.backgroundColor = rgbaString(rgb, 0.58);
  }

  function colorizeCage (rgb) {
    const r = rgb[0], g = rgb[1], b = rgb[2];
    for (let i = 0; i < cageLines.length; i++) {
      const line = cageLines[i];
      line.style.borderColor = 'rgba(' + r + ',' + g + ',' + b + ',0.42)';
      line.style.boxShadow =
        '0 0 14px rgba(' + r + ',' + g + ',' + b + ',0.32),' +
        'inset 0 0 14px rgba(' + r + ',' + g + ',' + b + ',0.18)';
    }
  }

  function colorizeOrbits (rgb, soft) {
    for (let i = 0; i < orbitRings.length; i++) {
      orbitRings[i].style.borderColor =
        'rgba(' + soft[0] + ',' + soft[1] + ',' + soft[2] + ',0.16)';
    }
    for (let i = 0; i < orbitDots.length; i++) {
      orbitDots[i].style.boxShadow =
        '0 0 12px 2px ' + rgbaString(rgb, 0.90) + ',' +
        '0 0 28px 6px ' + rgbaString(rgb, 0.55);
    }
  }

  function colorizePlatform (rgb) {
    const r = rgb[0], g = rgb[1], b = rgb[2];

    if (platformGlow) {
      platformGlow.style.background =
        'radial-gradient(circle,' +
          ' rgba(' + r + ',' + g + ',' + b + ',0.62) 0%,' +
          ' rgba(' + r + ',' + g + ',' + b + ',0.22) 45%,' +
          ' rgba(' + r + ',' + g + ',' + b + ',0) 72%)';
    }

    for (let i = 0; i < platformRings.length; i++) {
      const ring = platformRings[i];
      ring.style.borderColor = 'rgba(' + r + ',' + g + ',' + b + ',0.55)';
      ring.style.boxShadow =
        '0 0 34px rgba(' + r + ',' + g + ',' + b + ',0.34),' +
        'inset 0 0 44px rgba(' + r + ',' + g + ',' + b + ',0.20)';
    }
  }

  function colorizeHud (rgb, soft) {
    const r = rgb[0], g = rgb[1], b = rgb[2];
    const sr = soft[0], sg = soft[1], sb = soft[2];

    if (hudEyebrow) {
      hudEyebrow.style.color = 'rgba(' + sr + ',' + sg + ',' + sb + ',0.62)';
    }
    if (hudDot) {
      hudDot.style.color = 'rgb(' + r + ',' + g + ',' + b + ')';
      hudDot.style.textShadow =
        '0 0 26px rgba(' + r + ',' + g + ',' + b + ',0.90)';
    }
    if (hudTitle) {
      hudTitle.style.filter =
        'drop-shadow(0 6px 34px rgba(' + r + ',' + g + ',' + b + ',0.34))';
    }
    if (statusEl && statusEl.parentNode) {
      statusEl.parentNode.style.textShadow =
        '0 0 20px rgba(' + r + ',' + g + ',' + b + ',0.85)';
    }
  }

  function colorizeWatermark (rgb) {
    const r = rgb[0], g = rgb[1], b = rgb[2];
    if (!watermark) return;
    watermark.style.boxShadow =
      '0 12px 44px -16px rgba(' + r + ',' + g + ',' + b + ',0.85),' +
      'inset 0 0 0 1px rgba(255,255,255,0.05)';
    watermark.style.textShadow =
      '0 0 24px rgba(' + r + ',' + g + ',' + b + ',0.70),' +
      '0 1px 3px rgba(0,0,0,0.75)';
  }

  function colorizeParticles (rgb, soft) {
    const r = rgb[0], g = rgb[1], b = rgb[2];
    const sr = soft[0], sg = soft[1], sb = soft[2];

    const items = particlesBox ? particlesBox.querySelectorAll('i') : [];
    for (let i = 0; i < items.length; i++) {
      items[i].style.backgroundColor =
        'rgb(' + sr + ',' + sg + ',' + sb + ')';
      items[i].style.boxShadow =
        '0 0 10px 1px rgba(' + r + ',' + g + ',' + b + ',0.82)';
    }
  }

  function colorizeShock (rgb) {
    if (!shock) return;
    const r = rgb[0], g = rgb[1], b = rgb[2];
    shock.style.borderColor = 'rgb(' + r + ',' + g + ',' + b + ')';
    shock.style.boxShadow =
      '0 0 44px rgba(' + r + ',' + g + ',' + b + ',0.80),' +
      'inset 0 0 34px rgba(' + r + ',' + g + ',' + b + ',0.60)';
  }

  /* ==================================================================
     4. SIDE EFFECTS — shockwave, particle flash, active button
     ================================================================== */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function fireShock () {
    if (!shock || reduced.matches) return;
    shock.classList.remove('fire');
    void shock.offsetWidth;          /* force reflow → restart animation */
    shock.classList.add('fire');
  }

  function flashParticles () {
    if (!particlesBox || reduced.matches) return;
    particlesBox.style.filter = 'brightness(2.1) saturate(1.5)';
    window.clearTimeout(flashParticles._t);
    flashParticles._t = window.setTimeout(function () {
      particlesBox.style.filter = '';
    }, 420);
  }

  function setActiveButton (name) {
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('is-on', buttons[i].dataset.value === name);
    }
  }

  /* ==================================================================
     5. THE REVEAL — orchestrates everything
     ================================================================== */
  function reveal (name) {
    const p = PALETTE[name];
    if (!p) {
      console.log('[ColorCore] Unknown colour:', name);
      return;
    }

    console.log('[ColorCore] Applying:', name, p);

    /* also mirror on <html> so you can inspect in devtools */
    root.setAttribute('data-color', name);
    root.style.setProperty('--c',      p.hex);
    root.style.setProperty('--c-soft', rgbString(p.soft));
    root.style.setProperty('--c-hard', '#05060b');

    /* direct writes on real elements */
    colorizeAmbient(p.rgb, p.soft);
    colorizeOrbCore(p.rgb);
    colorizeOrbHalo(p.rgb);
    colorizeCage(p.rgb);
    colorizeOrbits(p.rgb, p.soft);
    colorizePlatform(p.rgb);
    colorizeHud(p.rgb, p.soft);
    colorizeWatermark(p.rgb);
    colorizeParticles(p.rgb, p.soft);
    colorizeShock(p.rgb);

    /* status text */
    if (statusEl) statusEl.textContent = name;

    /* feedback */
    setActiveButton(name);
    fireShock();
    flashParticles();
  }

  /* ==================================================================
     6. LISTEN FOR THE EVENT DISPATCHED BY PART 1
     ================================================================== */
  document.addEventListener('colorchange', function (event) {
    reveal(event.detail);
  });

  /* ==================================================================
     7. SANITY CHECK — apply the initial colour so the visual layer
        and the HTML share the same starting state
     ================================================================== */
  reveal('blue');

  console.log('[ColorCore] Visual layer ready.');
})();