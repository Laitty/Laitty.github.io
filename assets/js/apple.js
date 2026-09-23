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

  const isPhone = () => window.matchMedia("(max-width: 734px)").matches;
  let phone = isPhone();

  const wrap = document.createElement("div");
  wrap.className = "apple-title-wrap";
  title.parentNode.insertBefore(wrap, title);
  wrap.appendChild(title);

  const letters = splitName(title);
  const springs = letters.map((span) => ({
    span,
    cx: 0,
    cy: 0,
    influence: 0,
    vInf: 0,
    rot: 0,
    vRot: 0,
  }));
  let pointerOn = false;
  let px = 0;
  let py = 0;
  let mx = 0;
  let my = 0;
  let emitCool = 0;
  let idleCool = 0;

  const canvas = document.createElement("canvas");
  canvas.className = "apple-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  const lai = ["L", "a", "i"];
  const given = ["T", "i", "a", "n", "y", "o", "u"];

  const layout = phone
    ? [
        ...lai.map((ch, i) => ({ ch, nx: 0.3 + i * 0.2, ny: 0.34, s: 0.22, tier: "core" })),
        ...given.map((ch, i) => ({ ch, nx: 0.08 + i * 0.14, ny: 0.7, s: 0.15, tier: "row" })),
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

  let anchor = { x: 0, y: 0, w: 1, h: 1 };

  const fit = () => {
    phone = isPhone();
    dpr = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2);
    const box = hero.getBoundingClientRect();
    hw = Math.max(1, Math.floor(box.width));
    hh = Math.max(1, Math.floor(box.height));
    canvas.width = hw * dpr;
    canvas.height = hh * dpr;
    canvas.style.width = `${hw}px`;
    canvas.style.height = `${hh}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const titleBox = wrap.getBoundingClientRect();
    anchor = {
      x: titleBox.left - box.left,
      y: titleBox.top - box.top,
      w: Math.max(1, titleBox.width),
      h: Math.max(1, titleBox.height),
    };
    const titleRect = title.getBoundingClientRect();
    springs.forEach((st) => {
      const span = st.span;
      st.cx = titleRect.left + span.offsetLeft + span.offsetWidth / 2;
      st.cy = titleRect.top + span.offsetTop + span.offsetHeight * 0.78;
    });
  };

  const stepSpring = (value, velocity, target) => {
    const dt = 0.016;
    const next = velocity + ((target - value) * 128 - velocity * 16.8) * dt;
    return [value + next * dt, next];
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

  title.addEventListener("pointerenter", (event) => {
    pointerOn = true;
    px = event.clientX;
    py = event.clientY;
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    emitAt(mx, my, phone ? 10 : 16);
  });
  title.addEventListener("pointermove", (event) => {
    pointerOn = true;
    px = event.clientX;
    py = event.clientY;
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
  });
  title.addEventListener("pointerleave", () => {
    pointerOn = false;
  });
  title.addEventListener("pointerdown", (event) => {
    pointerOn = true;
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    emitAt(mx, my, phone ? 14 : 10);
  });
  const release = () => {
    pointerOn = false;
  };
  title.addEventListener("pointerup", release);
  title.addEventListener("pointercancel", release);

  const inkRgb = () => (dark() ? [236, 238, 242] : [22, 24, 28]);

  const tick = () => {
    time += 0.016;
    const radius = phone ? 108 : 168;
    springs.forEach((st) => {
      let target = 0;
      let targetRot = 0;
      if (pointerOn) {
        const dx = px - st.cx;
        const dy = py - st.cy;
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
        target = near * near * (3 - 2 * near);
        targetRot = (dx / 96) * target * -10;
      }
      [st.influence, st.vInf] = stepSpring(st.influence, st.vInf, target);
      [st.rot, st.vRot] = stepSpring(st.rot, st.vRot, targetRot);
      const eased = st.influence;
      st.span.style.transform = `translate3d(${st.rot * 0.28}px, ${-30 * eased}px, 0) scale(${1 + 0.64 * eased}) rotate(${st.rot}deg)`;
      st.span.classList.toggle("is-hot", eased > 0.72);
    });
    if (pointerOn) {
      emitCool += 0.016;
      if (emitCool > (phone ? 0.04 : 0.022)) {
        emitAt(mx, my, phone ? 2 : 3);
        emitCool = 0;
      }
    }

    if (phone && !pointerOn) {
      idleCool += 0.016;
      if (idleCool > 0.2) {
        emitAt(anchor.x + anchor.w * (0.18 + Math.random() * 0.64), anchor.y + anchor.h * 0.62, 2);
        const born = field[field.length - 1];
        if (born) {
          born.vy = -1.15 - Math.random() * 0.9;
          born.vx *= 0.35;
        }
        const born2 = field[field.length - 2];
        if (born2) {
          born2.vy = -1.15 - Math.random() * 0.9;
          born2.vx *= 0.35;
        }
        idleCool = 0;
      }
    }

    ctx.clearRect(0, 0, hw, hh);
    const rgb = inkRgb();
    const min = Math.min(hw, hh);

    glyphs.forEach((g) => {
      const size = phone ? g.s * anchor.w : g.s * min;
      const pad = size * 0.72;
      const driftX = Math.sin(time * 0.28 + g.phase) * (phone ? 2 : 5);
      const driftY = Math.cos(time * 0.22 + g.phase) * (phone ? 1.5 : 4);
      const rawX = phone ? anchor.x + g.nx * anchor.w + driftX : g.nx * hw + driftX;
      const rawY = phone ? anchor.y + g.ny * anchor.h + driftY : g.ny * hh + driftY;
      const x = Math.min(hw - pad, Math.max(pad, rawX));
      const y = Math.min(hh - pad, Math.max(pad, rawY));
      const base = g.tier === "core" ? (phone ? 0.4 : 0.28) : phone ? 0.3 : 0.2;
      const alpha = base * (0.92 + 0.08 * Math.sin(time * 0.45 + g.phase));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(g.rot + Math.sin(time * 0.2 + g.phase) * 0.02);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `italic 600 ${size}px "Snell Roundhand", "Apple Chancery", "Kaiti SC", "KaiTi", "Palatino Linotype", serif`;
      if (phone) {
        ctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 0.45})`;
        ctx.shadowBlur = Math.max(6, size * 0.14);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
        ctx.fillText(g.ch, 0, 0);
      } else {
        ctx.filter = "blur(5px)";
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 0.35})`;
        ctx.fillText(g.ch, size * 0.02, size * 0.025);
        ctx.filter = "blur(0.4px)";
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
        ctx.fillText(g.ch, 0, 0);
      }
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
