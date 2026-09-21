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
  let pointerOn = false;
  let px = 0;
  let py = 0;
  let mx = 0;
  let my = 0;
  let emitCool = 0;

  const canvas = document.createElement("canvas");
  canvas.className = "apple-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  const lai = ["L", "a", "i"];
  const given = ["T", "i", "a", "n", "y", "o", "u"];

  const layout = phone
    ? [
        ...lai.map((ch, i) => ({ ch, nx: 0.28 + i * 0.22, ny: 0.36, s: 0.24, tier: "core" })),
        ...given.map((ch, i) => ({ ch, nx: 0.14 + i * 0.12, ny: 0.58, s: 0.13, tier: "row" })),
      ]
    : [
        ...lai.map((ch, i) => ({ ch, nx: 0.28 + i * 0.22, ny: 0.34, s: 0.3, tier: "core" })),
        ...given.map((ch, i) => ({ ch, nx: 0.12 + i * 0.126, ny: 0.58, s: 0.16, tier: "row" })),
      ];

  const glyphs = layout.map((g, i) => ({
    ...g,
    rot: (i % 2 === 0 ? -1 : 1) * (0.04 + (i % 5) * 0.015),
    phase: i * 0.72,
  }));

  const palette = [
    [22, 24, 28],
    [48, 56, 68],
    [0, 113, 227],
    [58, 74, 98],
    [92, 48, 44],
  ];
  const paletteDark = [
    [236, 238, 242],
    [198, 206, 218],
    [100, 180, 255],
    [180, 190, 205],
    [220, 180, 175],
  ];

  const field = [];
  const cap = phone ? 70 : 120;
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

  const localPoint = (event) => {
    const box = hero.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  const emitAt = (x, y, burst) => {
    const colors = dark() ? paletteDark : palette;
    for (let i = 0; i < burst; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 1.45 + Math.random() * 2.8;
      field.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 0.5,
        r: 1.8 + Math.random() * 2.6,
        life: 3.8 + Math.random() * 3.5,
        age: 0,
        hue: Math.floor(Math.random() * colors.length),
      });
    }
    if (field.length > cap) field.splice(0, field.length - cap);
  };

  const swellLetters = () => {
    const radius = phone ? 72 : 108;
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
      span.style.transform = `translate3d(0, ${-18 * ease}px, 0) scale(${1 + 0.46 * ease}) rotate(${(dx / 48) * ease * -7}deg)`;
      span.classList.toggle("is-hot", ease > 0.62);
    });
  };

  title.addEventListener("pointerenter", (event) => {
    pointerOn = true;
    px = event.clientX;
    py = event.clientY;
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    swellLetters();
    emitAt(mx, my, phone ? 10 : 16);
  });
  title.addEventListener("pointermove", (event) => {
    pointerOn = true;
    px = event.clientX;
    py = event.clientY;
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    swellLetters();
  });
  title.addEventListener("pointerleave", () => {
    pointerOn = false;
    swellLetters();
  });

  const inkRgb = () => (dark() ? [236, 238, 242] : [22, 24, 28]);

  const tick = () => {
    time += 0.016;
    if (pointerOn) {
      emitCool += 0.016;
      if (emitCool > (phone ? 0.04 : 0.022)) {
        emitAt(mx, my, phone ? 2 : 3);
        emitCool = 0;
      }
    }

    ctx.clearRect(0, 0, hw, hh);
    const rgb = inkRgb();
    const min = Math.min(hw, hh);

    glyphs.forEach((g) => {
      const size = g.s * min;
      const pad = size * 0.72;
      const x = Math.min(hw - pad, Math.max(pad, g.nx * hw + Math.sin(time * 0.28 + g.phase) * 5));
      const y = Math.min(hh - pad, Math.max(pad, g.ny * hh + Math.cos(time * 0.22 + g.phase) * 4));
      const base = g.tier === "core" ? 0.28 : 0.2;
      const alpha = base * (0.92 + 0.08 * Math.sin(time * 0.45 + g.phase));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(g.rot + Math.sin(time * 0.2 + g.phase) * 0.02);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `italic 600 ${size}px "Snell Roundhand", "Apple Chancery", "Kaiti SC", "KaiTi", "Palatino Linotype", serif`;
      ctx.filter = "blur(5px)";
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 0.35})`;
      ctx.fillText(g.ch, size * 0.02, size * 0.025);
      ctx.filter = "blur(0.4px)";
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
      ctx.fillText(g.ch, 0, 0);
      ctx.restore();
    });

    const colors = dark() ? paletteDark : palette;
    for (let i = field.length - 1; i >= 0; i -= 1) {
      const p = field[i];
      p.age += 0.016;
      p.vy += 0.016;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < p.r) {
        p.x = p.r;
        p.vx = Math.abs(p.vx) * 0.86;
      } else if (p.x > hw - p.r) {
        p.x = hw - p.r;
        p.vx = -Math.abs(p.vx) * 0.86;
      }
      if (p.y < p.r) {
        p.y = p.r;
        p.vy = Math.abs(p.vy) * 0.86;
      } else if (p.y > hh - p.r) {
        p.y = hh - p.r;
        p.vy = -Math.abs(p.vy) * 0.86;
      }
      p.vx *= 0.995;
      p.vy *= 0.995;
      const fade = p.age > p.life - 1 ? Math.max(0, p.life - p.age) : 1;
      if (p.age > p.life || fade <= 0) {
        field.splice(i, 1);
        continue;
      }
      const [r, g, b] = colors[p.hue];
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${0.22 + 0.7 * fade})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${0.4 * fade})`;
      ctx.arc(p.x - p.r * 0.22, p.y - p.r * 0.25, Math.max(0.5, p.r * 0.3), 0, Math.PI * 2);
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
