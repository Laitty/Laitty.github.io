document.addEventListener("DOMContentLoaded", () => {
  const nodes = document.querySelectorAll(
    ".apple-hero, .apple-article h2, .apple-article ul > li, .bibliography > ol > li, .publications li, .social"
  );
  nodes.forEach((el, i) => {
    el.style.animationDelay = `${Math.min(i * 0.05, 0.6)}s`;
    el.classList.add("apple-reveal");
  });
  initLiquidName();
});

function initLiquidName() {
  const hero = document.querySelector(".apple-hero");
  const title = document.querySelector(".apple-hero-title");
  if (!hero || !title) return;

  title.classList.add("apple-liquid-name");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const phone = window.matchMedia("(max-width: 734px)").matches;

  const wrap = document.createElement("div");
  wrap.className = "apple-title-wrap";
  title.parentNode.insertBefore(wrap, title);
  wrap.appendChild(title);

  const letters = splitName(title);
  let inkFocus = "";
  let pointerOn = false;
  let px = 0;
  let py = 0;

  const swellLetters = () => {
    const radius = phone ? 72 : 108;
    let best = "";
    let bestT = 0;
    letters.forEach((span) => {
      if (!pointerOn) {
        span.style.transform = "";
        span.classList.remove("is-hot");
        return;
      }
      const b = span.getBoundingClientRect();
      const dx = px - (b.left + b.width / 2);
      const dy = py - (b.top + b.height / 2);
      const t = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
      const ease = t * t * (3 - 2 * t);
      const sc = 1 + 0.46 * ease;
      const lift = -18 * ease;
      const rot = (dx / 48) * ease * -7;
      span.style.transform = `translate3d(0, ${lift}px, 0) scale(${sc}) rotate(${rot}deg)`;
      span.classList.toggle("is-hot", ease > 0.62);
      if (ease > bestT) {
        bestT = ease;
        best = span.textContent;
      }
    });
    inkFocus = bestT > 0.28 ? best : "";
  };

  title.addEventListener("pointerenter", (event) => {
    pointerOn = true;
    px = event.clientX;
    py = event.clientY;
    swellLetters();
  });
  title.addEventListener("pointermove", (event) => {
    pointerOn = true;
    px = event.clientX;
    py = event.clientY;
    swellLetters();
  });
  title.addEventListener("pointerleave", () => {
    pointerOn = false;
    inkFocus = "";
    swellLetters();
  });

  const canvas = document.createElement("canvas");
  canvas.className = "apple-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });
  const stamp = document.createElement("canvas");
  const sctx = stamp.getContext("2d", { alpha: true });

  const src = [...title.getAttribute("aria-label")].filter((ch) => /[A-Za-z]/.test(ch));
  const layout = phone
    ? [
        { ch: src[0] || "T", nx: 0.22, ny: 0.38, s: 0.28 },
        { ch: src[src.length - 3] || "L", nx: 0.78, ny: 0.62, s: 0.26 },
        { ch: src[2] || "a", nx: 0.5, ny: 0.24, s: 0.18 },
        { ch: src[5] || "o", nx: 0.32, ny: 0.72, s: 0.17 },
        { ch: src[8] || "h", nx: 0.68, ny: 0.34, s: 0.16 },
      ]
    : [
        { ch: src[0] || "T", nx: 0.2, ny: 0.34, s: 0.3 },
        { ch: src[src.length - 3] || "L", nx: 0.8, ny: 0.64, s: 0.28 },
        { ch: src[1] || "i", nx: 0.4, ny: 0.24, s: 0.16 },
        { ch: src[2] || "a", nx: 0.58, ny: 0.28, s: 0.18 },
        { ch: src[3] || "n", nx: 0.3, ny: 0.7, s: 0.18 },
        { ch: src[4] || "y", nx: 0.18, ny: 0.62, s: 0.16 },
        { ch: src[5] || "o", nx: 0.62, ny: 0.74, s: 0.16 },
        { ch: src[6] || "u", nx: 0.78, ny: 0.28, s: 0.15 },
        { ch: src[8] || "h", nx: 0.48, ny: 0.52, s: 0.14 },
        { ch: src[9] || "e", nx: 0.36, ny: 0.48, s: 0.14 },
      ];

  const glyphs = layout.map((g, i) => ({
    ...g,
    rot: (i % 2 === 0 ? -1 : 1) * (0.05 + (i % 5) * 0.02),
    phase: i * 0.9,
    stain: 1,
    speed: 0.55,
    lastHot: false,
    ox: (i % 3) * 0.18 - 0.18,
    oy: ((i + 1) % 3) * 0.16 - 0.16,
  }));

  let hw = 1;
  let hh = 1;
  let dpr = 1;
  let time = 0;

  const dark = () =>
    document.documentElement.getAttribute("data-theme") === "dark" ||
    document.documentElement.getAttribute("data-theme-setting") === "dark";

  const fit = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const box = hero.getBoundingClientRect();
    hw = Math.max(1, Math.floor(box.width));
    hh = Math.max(1, Math.floor(box.height));
    canvas.width = hw * dpr;
    canvas.height = hh * dpr;
    canvas.style.width = `${hw}px`;
    canvas.style.height = `${hh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const inkRgb = () => (dark() ? [236, 238, 242] : [22, 24, 28]);

  const drawStain = (g, x, y, size, progress, rgb, alpha) => {
    const dim = Math.max(48, Math.ceil(size * 2.35));
    stamp.width = dim * dpr;
    stamp.height = dim * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, dim, dim);
    const cx = dim / 2;
    const cy = dim / 2;
    sctx.save();
    sctx.translate(cx, cy);
    sctx.rotate(g.rot + Math.sin(time * 0.2 + g.phase) * 0.025);
    sctx.textAlign = "center";
    sctx.textBaseline = "middle";
    sctx.font = `italic 600 ${size}px "Snell Roundhand", "Apple Chancery", "Kaiti SC", "KaiTi", "Palatino Linotype", serif`;
    sctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
    sctx.filter = "blur(0.7px)";
    sctx.fillText(g.ch, 0, 0);
    sctx.filter = "blur(6px)";
    sctx.globalAlpha = 0.32;
    sctx.fillText(g.ch, size * 0.02, size * 0.03);
    sctx.restore();

    if (progress < 0.995) {
      sctx.save();
      sctx.globalCompositeOperation = "destination-in";
      const r = size * (0.08 + 1.05 * progress);
      const gx = sctx.createRadialGradient(
        cx + g.ox * size,
        cy + g.oy * size,
        0,
        cx + g.ox * size,
        cy + g.oy * size,
        r
      );
      gx.addColorStop(0, "rgba(0,0,0,1)");
      gx.addColorStop(0.7, "rgba(0,0,0,0.88)");
      gx.addColorStop(1, "rgba(0,0,0,0)");
      sctx.fillStyle = gx;
      sctx.fillRect(0, 0, dim, dim);
      sctx.restore();
    }

    ctx.drawImage(stamp, x - dim / 2, y - dim / 2, dim, dim);
  };

  const tick = () => {
    time += 0.016;
    ctx.clearRect(0, 0, hw, hh);
    const rgb = inkRgb();
    const min = Math.min(hw, hh);

    glyphs.forEach((g) => {
      const size = g.s * min;
      const pad = size * 1.05;
      const x = Math.min(hw - pad, Math.max(pad, g.nx * hw + Math.sin(time * 0.28 + g.phase) * 8));
      const y = Math.min(hh - pad, Math.max(pad, g.ny * hh + Math.cos(time * 0.22 + g.phase) * 6));
      const hot = Boolean(inkFocus && g.ch.toLowerCase() === inkFocus.toLowerCase());
      if (hot && !g.lastHot) {
        g.stain = 0;
        g.speed = phone ? 1.2 : 1.5;
        g.ox = (Math.random() - 0.5) * 0.28;
        g.oy = (Math.random() - 0.5) * 0.28;
      }
      g.lastHot = hot;
      g.speed += ((hot ? 1.4 : 0.42) - g.speed) * 0.1;
      if (g.stain < 1) g.stain = Math.min(1, g.stain + 0.016 * g.speed);

      const alpha = (hot ? 0.28 : 0.14) * (0.9 + 0.1 * Math.sin(time * 0.5 + g.phase));
      drawStain(g, x, y, size, g.stain, rgb, alpha);
    });

    requestAnimationFrame(tick);
  };

  window.addEventListener("resize", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  fit();
  requestAnimationFrame(tick);
}

function splitName(title) {
  const text = title.textContent;
  title.setAttribute("aria-label", text.trim());
  title.textContent = "";
  const letters = [];
  for (const ch of text) {
    const span = document.createElement("span");
    if (ch === " ") {
      span.className = "apple-ch is-space";
      span.textContent = "\u00a0";
    } else {
      span.className = "apple-ch";
      span.textContent = ch;
      if (/[A-Za-z]/.test(ch)) letters.push(span);
    }
    title.appendChild(span);
  }
  return letters;
}
