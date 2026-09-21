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

  const lai = ["L", "a", "i"];
  const given = ["T", "i", "a", "n", "y", "o", "u"];
  const edge = ["T", "h", "e", "o", "y", "n"];

  const layout = phone
    ? [
        ...lai.map((ch, i) => ({
          ch,
          nx: 0.28 + i * 0.22,
          ny: 0.36,
          s: 0.24,
          tier: "core",
        })),
        ...given.map((ch, i) => ({
          ch,
          nx: 0.14 + i * 0.12,
          ny: 0.58,
          s: 0.13,
          tier: "row",
        })),
        { ch: edge[0], nx: 0.08, ny: 0.18, s: 0.1, tier: "edge" },
        { ch: edge[1], nx: 0.9, ny: 0.22, s: 0.1, tier: "edge" },
        { ch: edge[2], nx: 0.1, ny: 0.82, s: 0.09, tier: "edge" },
        { ch: edge[3], nx: 0.9, ny: 0.8, s: 0.1, tier: "edge" },
        { ch: edge[4], nx: 0.5, ny: 0.14, s: 0.08, tier: "edge" },
        { ch: edge[5], nx: 0.5, ny: 0.86, s: 0.08, tier: "edge" },
      ]
    : [
        ...lai.map((ch, i) => ({
          ch,
          nx: 0.28 + i * 0.22,
          ny: 0.34,
          s: 0.3,
          tier: "core",
        })),
        ...given.map((ch, i) => ({
          ch,
          nx: 0.12 + i * 0.126,
          ny: 0.58,
          s: 0.16,
          tier: "row",
        })),
        { ch: edge[0], nx: 0.07, ny: 0.16, s: 0.11, tier: "edge" },
        { ch: edge[1], nx: 0.93, ny: 0.18, s: 0.11, tier: "edge" },
        { ch: edge[2], nx: 0.08, ny: 0.84, s: 0.1, tier: "edge" },
        { ch: edge[3], nx: 0.92, ny: 0.82, s: 0.11, tier: "edge" },
        { ch: edge[4], nx: 0.5, ny: 0.12, s: 0.09, tier: "edge" },
        { ch: edge[5], nx: 0.5, ny: 0.88, s: 0.09, tier: "edge" },
        { ch: "T", nx: 0.16, ny: 0.48, s: 0.08, tier: "edge" },
        { ch: "o", nx: 0.84, ny: 0.46, s: 0.08, tier: "edge" },
      ];

  const glyphs = layout.map((g, i) => ({
    ...g,
    rot: (i % 2 === 0 ? -1 : 1) * (0.04 + (i % 5) * 0.015),
    phase: i * 0.72,
    stain: 1,
    speed: 0.55,
    lastHot: false,
    ox: (i % 3) * 0.14 - 0.14,
    oy: ((i + 1) % 3) * 0.12 - 0.12,
  }));

  const mist = [];
  const mistCap = phone ? 48 : 80;
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

  const emitMist = (x, y, size, burst, hot) => {
    const rgb = inkRgb();
    for (let i = 0; i < burst; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const dist = size * (0.12 + Math.random() * 0.55);
      const speed = 0.15 + Math.random() * (hot ? 0.9 : 0.45);
      mist.push({
        x: x + Math.cos(ang) * dist * 0.35,
        y: y + Math.sin(ang) * dist * 0.35,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 0.08,
        r: (hot ? 5 : 3) + Math.random() * (hot ? 14 : 9),
        squash: 0.55 + Math.random() * 0.45,
        rot: Math.random() * Math.PI,
        life: 1.2 + Math.random() * 1.8,
        age: 0,
        bloom: 0.08 + Math.random() * 0.16,
        rgb,
      });
    }
    if (mist.length > mistCap) mist.splice(0, mist.length - mistCap);
  };

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
      const pad = size * 0.72;
      const x = Math.min(hw - pad, Math.max(pad, g.nx * hw + Math.sin(time * 0.28 + g.phase) * 5));
      const y = Math.min(hh - pad, Math.max(pad, g.ny * hh + Math.cos(time * 0.22 + g.phase) * 4));
      const hot = Boolean(inkFocus && g.ch.toLowerCase() === inkFocus.toLowerCase());
      if (hot && !g.lastHot) {
        g.stain = 0;
        g.speed = phone ? 1.2 : 1.5;
        g.ox = (Math.random() - 0.5) * 0.28;
        g.oy = (Math.random() - 0.5) * 0.28;
        emitMist(x + g.ox * size, y + g.oy * size, size, phone ? 5 : 8, true);
      }
      g.lastHot = hot;
      g.speed += ((hot ? 1.4 : 0.42) - g.speed) * 0.1;
      if (g.stain < 1) {
        g.stain = Math.min(1, g.stain + 0.016 * g.speed);
        const edge = size * (0.08 + 1.05 * g.stain);
        if (Math.random() < (hot ? 0.42 : 0.16)) {
          const ang = Math.random() * Math.PI * 2;
          emitMist(
            x + g.ox * size + Math.cos(ang) * edge * 0.55,
            y + g.oy * size + Math.sin(ang) * edge * 0.55,
            size,
            hot ? (phone ? 2 : 3) : 1,
            hot
          );
        }
      }

      const base =
        g.tier === "core" ? (hot ? 0.46 : 0.3) : g.tier === "row" ? (hot ? 0.34 : 0.22) : hot ? 0.2 : 0.12;
      const alpha = base * (0.9 + 0.1 * Math.sin(time * 0.5 + g.phase));
      drawStain(g, x, y, size, g.stain, rgb, alpha);
    });

    for (let i = mist.length - 1; i >= 0; i -= 1) {
      const p = mist[i];
      p.age += 0.016;
      p.r += p.bloom;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.986;
      p.vy *= 0.992;
      const fade =
        p.age > p.life - 0.85 ? Math.max(0, (p.life - p.age) / 0.85) : Math.min(1, p.age / 0.12);
      if (p.age > p.life || fade <= 0) {
        mist.splice(i, 1);
        continue;
      }
      const [r, gv, b] = p.rgb;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(${r},${gv},${b},${0.16 * fade})`);
      grad.addColorStop(0.48, `rgba(${r},${gv},${b},${0.07 * fade})`);
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
