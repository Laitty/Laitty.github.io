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
    resting: true,
  }));
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
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

  const lai = ["L", "a", "i"];
  const given = ["T", "i", "a", "n", "y", "o", "u"];

  const layoutFor = (isPhone) =>
    isPhone
      ? [
          ...lai.map((ch, i) => ({ ch, nx: 0.3 + i * 0.2, ny: 0.26, s: 0.22, tier: "core" })),
          ...given.map((ch, i) => ({ ch, nx: 0.08 + i * 0.14, ny: 0.56, s: 0.15, tier: "row" })),
        ]
      : [
          ...lai.map((ch, i) => ({ ch, nx: 0.28 + i * 0.22, ny: 0.26, s: 0.3, tier: "core" })),
          ...given.map((ch, i) => ({ ch, nx: 0.12 + i * 0.126, ny: 0.46, s: 0.16, tier: "row" })),
        ];

  const glyphs = layoutFor(phone).map((g, i) => ({
    ...g,
    rot: (i % 2 === 0 ? -1 : 1) * (0.04 + (i % 5) * 0.015),
    phase: i * 0.72,
  }));

  // Neutrals plus CMU Tartan accents (shared by desktop and mobile emitters).
  const palette = [
    [22, 24, 28],
    [48, 56, 68],
    [196, 18, 48],
    [253, 181, 21],
    [0, 143, 145],
    [4, 54, 115],
    [0, 123, 192],
    [239, 58, 71],
  ];
  const paletteDark = [
    [236, 238, 242],
    [198, 206, 218],
    [224, 58, 79],
    [253, 196, 72],
    [72, 196, 198],
    [120, 168, 232],
    [90, 186, 255],
    [239, 108, 118],
  ];

  const field = [];
  const capFor = () => (phone ? 56 : 72);
  let hw = 1;
  let hh = 1;
  let dpr = 1;
  let time = 0;
  let sprites = [];
  let spriteKey = "";
  let raf = 0;
  let lastDark = null;

  const dark = () =>
    document.documentElement.getAttribute("data-theme") === "dark" ||
    document.documentElement.getAttribute("data-theme-setting") === "dark";
  const inkRgb = () => (dark() ? [236, 238, 242] : [22, 24, 28]);

  let anchor = { x: 0, y: 0, w: 1, h: 1 };

  const bakeSprites = () => {
    const rgb = inkRgb();
    const min = Math.min(hw, hh);
    const key = `${phone}|${hw}|${hh}|${rgb.join(",")}`;
    if (key === spriteKey && sprites.length === glyphs.length) return;
    spriteKey = key;
    lastDark = dark();
    sprites = glyphs.map((g) => {
      const size = Math.max(10, phone ? g.s * anchor.w : g.s * min);
      const pad = Math.ceil(size * 0.38);
      const w = Math.ceil(size + pad * 2);
      const h = Math.ceil(size + pad * 2);
      const layer = document.createElement("canvas");
      const scale = Math.min(dpr, 1.5);
      layer.width = Math.max(1, Math.floor(w * scale));
      layer.height = Math.max(1, Math.floor(h * scale));
      const gctx = layer.getContext("2d");
      gctx.setTransform(scale, 0, 0, scale, 0, 0);
      gctx.font = `italic 600 ${size}px "Snell Roundhand", "Apple Chancery", "Kaiti SC", "KaiTi", "Palatino Linotype", serif`;
      gctx.textAlign = "center";
      gctx.textBaseline = "middle";
      gctx.shadowColor = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.42)`;
      gctx.shadowBlur = Math.max(6, size * 0.12);
      gctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`;
      gctx.fillText(g.ch, w / 2, h / 2);
      return { layer, w, h, size };
    });
  };

  const applyLayout = (next) => {
    next.forEach((g, i) => {
      glyphs[i].nx = g.nx;
      glyphs[i].ny = g.ny;
      glyphs[i].s = g.s;
      glyphs[i].tier = g.tier;
    });
  };

  const fit = () => {
    const nextPhone = isPhone();
    if (nextPhone !== phone) {
      phone = nextPhone;
      applyLayout(layoutFor(phone));
    }
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
    bakeSprites();
  };

  const stepSpring = (value, velocity, target, stiffness, damping) => {
    const dt = 0.016;
    const next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
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
    const cap = capFor();
    if (field.length > cap) field.splice(0, field.length - cap);
  };

  title.addEventListener("pointerenter", (event) => {
    pointerOn = true;
    px = event.clientX;
    py = event.clientY;
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    emitAt(mx, my, 8);
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
    emitAt(mx, my, 10);
  });
  const release = () => {
    pointerOn = false;
  };
  title.addEventListener("pointerup", release);
  title.addEventListener("pointercancel", release);

  const tick = () => {
    if (lastDark !== dark()) bakeSprites();
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
      const deforming = target > st.influence;
      [st.influence, st.vInf] = stepSpring(st.influence, st.vInf, target, deforming ? 460 : 230, deforming ? 32 : 22.4);
      const turning = Math.abs(targetRot) > Math.abs(st.rot);
      [st.rot, st.vRot] = stepSpring(st.rot, st.vRot, targetRot, turning ? 460 : 230, turning ? 32 : 22.4);
      const eased = st.influence;
      const idle = !pointerOn && eased < 0.004 && Math.abs(st.rot) < 0.08 && Math.abs(st.vInf) < 0.4;
      if (idle) {
        if (!st.resting) {
          st.span.style.transform = "";
          st.span.classList.remove("is-hot");
          st.resting = true;
        }
        return;
      }
      st.resting = false;
      st.span.style.transform = `translate3d(${st.rot * 0.28}px, ${-30 * eased}px, 0) scale(${1 + 0.64 * eased}) rotate(${st.rot}deg)`;
      st.span.classList.toggle("is-hot", eased > 0.72);
    });
    if (pointerOn) {
      emitCool += 0.016;
      if (emitCool > 0.04) {
        emitAt(mx, my, 2);
        emitCool = 0;
      }
    }

    ctx.clearRect(0, 0, hw, hh);

    glyphs.forEach((g, i) => {
      const sprite = sprites[i];
      if (!sprite) return;
      const pad = sprite.size * 0.72;
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
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite.layer, -sprite.w / 2, -sprite.h / 2, sprite.w, sprite.h);
      ctx.restore();
    });

    const colors = dark() ? paletteDark : palette;
    const neut = dark() ? 196 : 72;
    const k = 0.58;
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
      const pr = Math.round(r * k + neut * (1 - k));
      const pg = Math.round(g * k + neut * (1 - k));
      const pb = Math.round(b * k + neut * (1 - k));
      ctx.beginPath();
      ctx.fillStyle = `rgba(${pr},${pg},${pb},${0.14 + 0.46 * fade})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(tick);
  };

  const play = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
  };
  const pause = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  window.addEventListener("resize", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else play();
  });
  fit();
  play();
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
