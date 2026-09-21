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
    write: 0.2 + (i % 7) * 0.08,
    hold: 1.2 + i * 0.35,
    speed: 0.35,
    lastHot: false,
    dots: Array.from({ length: 4 }, () => ({
      dx: (Math.random() - 0.5) * 0.9,
      dy: (Math.random() - 0.5) * 0.9,
      r: 0.03 + Math.random() * 0.07,
    })),
  }));

  const field = [];
  const cap = phone ? 48 : 90;
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

  const bez = (t, a, b, c, d) => {
    const u = 1 - t;
    return {
      x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
      y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
    };
  };

  const strokeFor = (size, seed) => {
    const s = size * 0.5;
    return {
      a: { x: -s * 0.72, y: -s * 0.52 },
      b: { x: -s * 0.08 + seed * 12, y: s * 0.18 },
      c: { x: s * 0.22, y: -s * 0.12 },
      d: { x: s * 0.68, y: s * 0.54 },
    };
  };

  const emitInk = (x, y, burst, extra) => {
    const palette = inkRgb();
    for (let i = 0; i < burst; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 0.25 + Math.random() * 1.35;
      field.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(ang) * speed * 0.45,
        vy: Math.sin(ang) * speed * 0.45 + 0.12,
        r: (extra ? 7 : 4) + Math.random() * (extra ? 18 : 11),
        squash: 0.55 + Math.random() * 0.5,
        rot: Math.random() * Math.PI,
        life: 1.6 + Math.random() * 2.4,
        age: 0,
        bloom: 0.1 + Math.random() * 0.2,
        rgb: palette,
      });
    }
    if (field.length > cap) field.splice(0, field.length - cap);
  };

  const drawWritten = (g, x, y, size, progress, rgb, alpha) => {
    const dim = Math.max(32, Math.ceil(size * 1.7));
    stamp.width = dim * dpr;
    stamp.height = dim * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sctx.clearRect(0, 0, dim, dim);
    const cx = dim / 2;
    const cy = dim / 2;
    sctx.save();
    sctx.translate(cx, cy);
    sctx.rotate(g.rot + Math.sin(time * 0.2 + g.phase) * 0.03);
    sctx.textAlign = "center";
    sctx.textBaseline = "middle";
    sctx.font = `italic 600 ${size}px "Snell Roundhand", "Apple Chancery", "Kaiti SC", "KaiTi", "Palatino Linotype", serif`;
    sctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
    sctx.filter = "blur(0.8px)";
    sctx.fillText(g.ch, 0, 0);
    sctx.filter = "blur(7px)";
    sctx.globalAlpha = 0.35;
    sctx.fillText(g.ch, 3, 5);
    sctx.restore();

    const st = strokeFor(size, g.phase);
    sctx.save();
    sctx.translate(cx, cy);
    sctx.globalCompositeOperation = "destination-in";
    sctx.beginPath();
    sctx.moveTo(st.a.x, st.a.y);
    sctx.bezierCurveTo(st.b.x, st.b.y, st.c.x, st.c.y, st.d.x, st.d.y);
    sctx.lineCap = "round";
    sctx.lineJoin = "round";
    sctx.lineWidth = size * 0.58;
    sctx.strokeStyle = "#000";
    const len = size * 1.85;
    sctx.setLineDash([Math.max(1, len * progress), len]);
    sctx.lineDashOffset = 0;
    sctx.stroke();
    sctx.restore();

    ctx.drawImage(stamp, x - dim / 2, y - dim / 2, dim, dim);
    return bez(Math.min(1, progress), st.a, st.b, st.c, st.d);
  };

  const tick = () => {
    time += 0.016;
    ctx.clearRect(0, 0, hw, hh);
    const rgb = inkRgb();
    const min = Math.min(hw, hh);

    glyphs.forEach((g) => {
      const x = g.nx * hw + Math.sin(time * 0.35 + g.phase) * 10;
      const y = g.ny * hh + Math.cos(time * 0.28 + g.phase) * 8;
      const size = g.s * min;
      const hot = Boolean(inkFocus && g.ch.toLowerCase() === inkFocus.toLowerCase());
      if (hot && !g.lastHot) {
        g.write = 0;
        g.speed = phone ? 1.15 : 1.45;
        emitInk(x, y, phone ? 6 : 10, true);
      }
      g.lastHot = hot;
      g.speed += ((hot ? 1.35 : 0.32) - g.speed) * 0.08;
      g.write += 0.016 * g.speed;
      if (g.write >= 1) {
        g.hold -= 0.016;
        g.write = 1;
        if (g.hold <= 0 && !hot) {
          g.write = 0;
          g.hold = 2.4 + g.phase;
          g.speed = 0.28;
        }
      }

      const alpha = (hot ? 0.3 : 0.13) * (0.88 + 0.12 * Math.sin(time * 0.6 + g.phase));
      const tip = drawWritten(g, x, y, size, Math.min(1, g.write), rgb, alpha);
      if (g.write < 1 && Math.random() < (hot ? 0.5 : 0.14)) {
        emitInk(x + tip.x, y + tip.y, hot ? (phone ? 2 : 3) : 1, hot);
      }

      g.dots.forEach((d, di) => {
        const dx = x + d.dx * size;
        const dy = y + d.dy * size + Math.sin(time * 0.5 + di) * 2;
        const r = d.r * size * (0.7 + 0.3 * g.write);
        const grad = ctx.createRadialGradient(dx, dy, 0, dx, dy, r);
        grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 0.55 * g.write})`);
        grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(dx, dy, r, r * 0.68, d.dx, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    for (let i = field.length - 1; i >= 0; i -= 1) {
      const p = field[i];
      p.age += 0.016;
      p.r += p.bloom;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.99;
      if (p.x < 0) p.vx = Math.abs(p.vx) * 0.5;
      if (p.x > hw) p.vx = -Math.abs(p.vx) * 0.5;
      if (p.y < 0) p.vy = Math.abs(p.vy) * 0.4;
      if (p.y > hh) p.vy = -Math.abs(p.vy) * 0.4;
      const fade = p.age > p.life - 0.9 ? Math.max(0, (p.life - p.age) / 0.9) : Math.min(1, p.age / 0.12);
      if (p.age > p.life || fade <= 0) {
        field.splice(i, 1);
        continue;
      }
      const [r, gv, b] = p.rgb;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(${r},${gv},${b},${0.18 * fade})`);
      grad.addColorStop(0.45, `rgba(${r},${gv},${b},${0.08 * fade})`);
      grad.addColorStop(1, `rgba(${r},${gv},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * p.squash, p.rot, 0, Math.PI * 2);
      ctx.fill();
    }

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
