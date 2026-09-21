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

  title.addEventListener("pointerover", (event) => {
    const span = event.target.closest(".apple-ch");
    if (!span || span.classList.contains("is-space")) return;
    letters.forEach((s) => s.classList.toggle("is-hot", s === span));
    inkFocus = span.textContent;
  });
  title.addEventListener("pointerout", (event) => {
    if (event.relatedTarget && title.contains(event.relatedTarget)) return;
    letters.forEach((s) => s.classList.remove("is-hot"));
    inkFocus = "";
  });

  const canvas = document.createElement("canvas");
  canvas.className = "apple-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  const src = [...title.getAttribute("aria-label")].filter((ch) => /[A-Za-z]/.test(ch));
  const layout = phone
    ? [
        { ch: src[0] || "T", nx: 0.16, ny: 0.4, s: 0.42 },
        { ch: src[src.length - 1] || "i", nx: 0.82, ny: 0.68, s: 0.34 },
        { ch: src[3] || "n", nx: 0.52, ny: 0.22, s: 0.22 },
        { ch: src[6] || "u", nx: 0.3, ny: 0.78, s: 0.2 },
        { ch: src[8] || "h", nx: 0.72, ny: 0.36, s: 0.18 },
      ]
    : [
        { ch: src[0] || "T", nx: 0.14, ny: 0.36, s: 0.46 },
        { ch: src[src.length - 3] || "L", nx: 0.84, ny: 0.64, s: 0.4 },
        { ch: src[1] || "i", nx: 0.4, ny: 0.18, s: 0.18 },
        { ch: src[2] || "a", nx: 0.58, ny: 0.26, s: 0.22 },
        { ch: src[3] || "n", nx: 0.32, ny: 0.74, s: 0.24 },
        { ch: src[4] || "y", nx: 0.12, ny: 0.78, s: 0.2 },
        { ch: src[5] || "o", nx: 0.62, ny: 0.8, s: 0.2 },
        { ch: src[6] || "u", nx: 0.78, ny: 0.22, s: 0.18 },
        { ch: src[8] || "h", nx: 0.5, ny: 0.52, s: 0.16 },
        { ch: src[9] || "e", nx: 0.28, ny: 0.5, s: 0.16 },
      ];

  const glyphs = layout.map((g, i) => ({
    ...g,
    rot: (i % 2 === 0 ? -1 : 1) * (0.08 + (i % 5) * 0.03),
    phase: i * 0.9,
    dots: Array.from({ length: 5 }, () => ({
      dx: (Math.random() - 0.5) * 0.9,
      dy: (Math.random() - 0.5) * 0.9,
      r: 0.03 + Math.random() * 0.08,
    })),
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

  const tick = () => {
    time += 0.016;
    ctx.clearRect(0, 0, hw, hh);
    const [ir, ig, ib] = inkRgb();
    const min = Math.min(hw, hh);

    glyphs.forEach((g) => {
      const x = g.nx * hw + Math.sin(time * 0.35 + g.phase) * 10;
      const y = g.ny * hh + Math.cos(time * 0.28 + g.phase) * 8;
      const size = g.s * min;
      const hot = inkFocus && g.ch.toLowerCase() === inkFocus.toLowerCase();
      const alpha = (hot ? 0.22 : 0.11) * (0.86 + 0.14 * Math.sin(time * 0.6 + g.phase));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(g.rot + Math.sin(time * 0.2 + g.phase) * 0.03);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `italic 600 ${size}px "Snell Roundhand", "Apple Chancery", "Kaiti SC", "KaiTi", "Palatino Linotype", serif`;

      ctx.filter = "blur(10px)";
      ctx.fillStyle = `rgba(${ir},${ig},${ib},${alpha * 0.55})`;
      ctx.fillText(g.ch, 4, 6);

      ctx.filter = "blur(1.1px)";
      ctx.fillStyle = `rgba(${ir},${ig},${ib},${alpha})`;
      ctx.fillText(g.ch, 0, 0);

      ctx.filter = "blur(0.2px)";
      ctx.globalAlpha = hot ? 0.55 : 0.28;
      ctx.fillText(g.ch, -size * 0.012, -size * 0.01);
      ctx.restore();

      g.dots.forEach((d, di) => {
        const dx = x + d.dx * size;
        const dy = y + d.dy * size + Math.sin(time * 0.5 + di) * 2;
        const r = d.r * size;
        const grad = ctx.createRadialGradient(dx, dy, 0, dx, dy, r);
        grad.addColorStop(0, `rgba(${ir},${ig},${ib},${alpha * 0.7})`);
        grad.addColorStop(1, `rgba(${ir},${ig},${ib},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(dx, dy, r, r * 0.7, d.dx, 0, Math.PI * 2);
        ctx.fill();
      });
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
