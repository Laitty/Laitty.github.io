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
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  const wrap = document.createElement("div");
  wrap.className = "apple-title-wrap";
  title.parentNode.insertBefore(wrap, title);
  wrap.appendChild(title);

  const canvas = document.createElement("canvas");
  canvas.className = "apple-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  const inkLight = [
    [22, 22, 24],
    [42, 46, 54],
    [58, 74, 98],
    [92, 28, 32],
  ];
  const inkDark = [
    [236, 238, 242],
    [198, 206, 218],
    [156, 178, 206],
    [210, 168, 168],
  ];
  const ink = () =>
    document.documentElement.getAttribute("data-theme") === "dark" ||
    document.documentElement.getAttribute("data-theme-setting") === "dark"
      ? inkDark
      : inkLight;

  const field = [];
  const cap = phone ? 36 : 58;
  let hw = 1;
  let hh = 1;
  let dpr = 1;
  let nameHot = false;
  let mx = 0;
  let my = 0;
  let emitCool = 0;

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
    const palette = ink();
    for (let i = 0; i < burst; i += 1) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = 0.35 + Math.random() * 1.1;
      field.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        r: 6 + Math.random() * 16,
        squash: 0.62 + Math.random() * 0.5,
        rot: Math.random() * Math.PI,
        hue: Math.floor(Math.random() * palette.length),
        life: 2.4 + Math.random() * 2.8,
        age: 0,
        bloom: 0.12 + Math.random() * 0.18,
      });
    }
    if (field.length > cap) field.splice(0, field.length - cap);
  };

  const setHot = (event, on) => {
    nameHot = on;
    hero.classList.toggle("is-bloom", on);
    if (!on) return;
    const box = title.getBoundingClientRect();
    title.style.setProperty("--lx", `${((event.clientX - box.left) / Math.max(1, box.width)) * 100}%`);
    title.style.setProperty("--ly", `${((event.clientY - box.top) / Math.max(1, box.height)) * 100}%`);
  };

  const tick = () => {
    if (nameHot) {
      emitCool += 0.016;
      if (emitCool > (phone ? 0.055 : 0.032)) {
        emitAt(mx, my, phone ? 1 : 2);
        emitCool = 0;
      }
    }

    ctx.clearRect(0, 0, hw, hh);
    const palette = ink();
    for (let i = field.length - 1; i >= 0; i -= 1) {
      const p = field[i];
      p.age += 0.016;
      p.r += p.bloom;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.99;
      if (p.x < p.r) {
        p.x = p.r;
        p.vx = Math.abs(p.vx) * 0.55;
      } else if (p.x > hw - p.r) {
        p.x = hw - p.r;
        p.vx = -Math.abs(p.vx) * 0.55;
      }
      if (p.y < p.r) {
        p.y = p.r;
        p.vy = Math.abs(p.vy) * 0.4;
      } else if (p.y > hh - p.r) {
        p.y = hh - p.r;
        p.vy = -Math.abs(p.vy) * 0.4;
      }
      const fade = p.age > p.life - 1.1 ? Math.max(0, (p.life - p.age) / 1.1) : Math.min(1, p.age / 0.18);
      if (p.age > p.life || fade <= 0) {
        field.splice(i, 1);
        continue;
      }
      const [r, g, b] = palette[p.hue % palette.length];
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0, `rgba(${r},${g},${b},${0.2 * fade})`);
      grad.addColorStop(0.42, `rgba(${r},${g},${b},${0.1 * fade})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * p.squash, p.rot, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  };

  title.addEventListener("pointerenter", (event) => {
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    setHot(event, true);
    emitAt(mx, my, phone ? 5 : 8);
  });
  title.addEventListener("pointermove", (event) => {
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    setHot(event, true);
  });
  title.addEventListener("pointerdown", (event) => {
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    setHot(event, true);
    emitAt(mx, my, phone ? 6 : 10);
  });
  title.addEventListener("pointerleave", () => {
    setHot(null, false);
  });
  title.addEventListener("pointerup", () => {
    if (coarse) setHot(null, false);
  });

  window.addEventListener("resize", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  fit();
  requestAnimationFrame(tick);
}
