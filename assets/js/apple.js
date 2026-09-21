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

  const canvas = document.createElement("canvas");
  canvas.className = "apple-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  const lens = document.createElement("div");
  lens.className = "apple-glass-lens";
  lens.setAttribute("aria-hidden", "true");
  hero.appendChild(lens);

  const phone = window.matchMedia("(max-width: 734px)").matches;
  const tablet = window.matchMedia("(min-width: 735px) and (max-width: 1100px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const blobCount = phone ? 7 : tablet ? 12 : 16;
  const dotCount = phone ? 16 : tablet ? 28 : 46;
  const blobs = Array.from({ length: blobCount }, (_, i) => ({
    kind: "blob",
    x: 0.3 + Math.random() * 0.4,
    y: 0.28 + Math.random() * 0.2,
    vx: 0,
    vy: 0,
    r: 42 + (i % 5) * 10,
    hue: i % 3,
    seed: Math.random() * Math.PI * 2,
  }));
  const dots = Array.from({ length: dotCount }, (_, i) => ({
    kind: "dot",
    x: 0.22 + Math.random() * 0.56,
    y: 0.2 + Math.random() * 0.28,
    vx: (Math.random() - 0.5) * 0.002,
    vy: (Math.random() - 0.5) * 0.002,
    r: 2.2 + (i % 4),
    hue: i % 3,
    seed: Math.random() * Math.PI * 2,
  }));
  const particles = blobs.concat(dots);

  let width = 1;
  let height = 1;
  let dpr = 1;
  let tx = 0.5;
  let ty = 0.34;
  let mx = 0.5;
  let my = 0.34;
  let hovering = false;
  let time = 0;

  const palette = [
    [0, 113, 227],
    [94, 92, 230],
    [232, 168, 56],
  ];

  const fit = () => {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const tick = () => {
    time += 0.016;
    if (!hovering) {
      tx = 0.5 + Math.cos(time * 0.32) * (phone ? 0.16 : 0.12);
      ty = 0.34 + Math.sin(time * 0.24) * (phone ? 0.08 : 0.06);
    }
    mx += (tx - mx) * (coarse ? 0.1 : 0.07);
    my += (ty - my) * (coarse ? 0.1 : 0.07);

    hero.style.setProperty("--mx", `${(mx * 100).toFixed(2)}%`);
    hero.style.setProperty("--my", `${(my * 100).toFixed(2)}%`);
    title.style.setProperty("--lx", `${(mx * 100).toFixed(2)}%`);
    title.style.setProperty("--ly", `${(my * 100).toFixed(2)}%`);
    title.style.setProperty("--shift", `${(mx * 80 + 10).toFixed(1)}%`);
    lens.style.left = `${mx * 100}%`;
    lens.style.top = `${my * 100}%`;
    lens.classList.toggle("is-active", hovering);

    ctx.clearRect(0, 0, width, height);

    const titleBox = title.getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    const ax = (titleBox.left - heroBox.left + titleBox.width / 2) / width;
    const ay = (titleBox.top - heroBox.top + titleBox.height / 2) / height;

    particles.forEach((p) => {
      const flowX = Math.cos(time * 0.7 + p.seed + p.y * 6) * (p.kind === "dot" ? 0.0012 : 0.00045);
      const flowY = Math.sin(time * 0.65 + p.seed * 1.4 + p.x * 6) * (p.kind === "dot" ? 0.001 : 0.00035);
      const dxm = mx - p.x;
      const dym = my - p.y;
      const dm = Math.hypot(dxm, dym) || 0.001;
      const swirl = hovering ? 0.0016 / (dm + 0.08) : 0.0004;
      p.vx += flowX - dym * swirl * 0.55 + dxm * swirl * 0.35;
      p.vy += flowY + dxm * swirl * 0.55 + dym * swirl * 0.2;
      p.vx += (ax - p.x) * 0.003;
      p.vy += (ay - p.y) * 0.003;
      p.vx *= p.kind === "dot" ? 0.96 : 0.9;
      p.vy *= p.kind === "dot" ? 0.96 : 0.9;
      p.x += p.vx;
      p.y += p.vy;
      p.x = Math.min(0.9, Math.max(0.1, p.x));
      p.y = Math.min(0.72, Math.max(0.12, p.y));

      const px = p.x * width;
      const py = p.y * height;
      const [r, g, b] = palette[p.hue];

      if (p.kind === "blob") {
        const radius = p.r * (hovering ? 1.12 : 1);
        const glow = ctx.createRadialGradient(px, py, 0, px, py, radius);
        glow.addColorStop(0, `rgba(${r},${g},${b},0.34)`);
        glow.addColorStop(0.45, `rgba(${r},${g},${b},0.14)`);
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},0.78)`;
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.arc(px - p.r * 0.2, py - p.r * 0.25, Math.max(0.8, p.r * 0.28), 0, Math.PI * 2);
        ctx.fill();
      }
    });

    requestAnimationFrame(tick);
  };

  const setTarget = (event) => {
    const rect = hero.getBoundingClientRect();
    tx = (event.clientX - rect.left) / rect.width;
    ty = (event.clientY - rect.top) / rect.height;
  };

  hero.addEventListener("pointerenter", (event) => {
    hovering = true;
    setTarget(event);
  });
  hero.addEventListener("pointerdown", (event) => {
    hovering = true;
    setTarget(event);
  });
  hero.addEventListener("pointermove", (event) => {
    hovering = true;
    setTarget(event);
  });
  hero.addEventListener("pointerup", () => {
    if (coarse) hovering = false;
  });
  hero.addEventListener("pointerleave", () => {
    hovering = false;
  });
  window.addEventListener("resize", fit);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", fit);
  }

  fit();
  requestAnimationFrame(tick);
}
