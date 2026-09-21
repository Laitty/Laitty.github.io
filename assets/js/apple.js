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

  const count = window.matchMedia("(pointer: fine)").matches ? 52 : 28;
  const particles = Array.from({ length: count }, (_, i) => ({
    x: 0.5,
    y: 0.38,
    vx: 0,
    vy: 0,
    r: 18 + (i % 7) * 7,
    hue: i % 3,
    seed: Math.random() * Math.PI * 2,
  }));

  let width = 0;
  let height = 0;
  let dpr = 1;
  let tx = 0.5;
  let ty = 0.38;
  let mx = 0.5;
  let my = 0.38;
  let hovering = false;
  let time = 0;

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
    particles.forEach((p, i) => {
      if (!p.ready) {
        p.x = 0.28 + Math.random() * 0.44;
        p.y = 0.22 + Math.random() * 0.34;
        p.ready = true;
      }
    });
  };

  const colors = [
    [255, 255, 255],
    [120, 190, 255],
    [196, 176, 255],
  ];

  const tick = () => {
    time += 0.008;
    mx += (tx - mx) * 0.055;
    my += (ty - my) * 0.055;

    hero.style.setProperty("--mx", `${mx * 100}%`);
    hero.style.setProperty("--my", `${my * 100}%`);
    title.style.setProperty("--lx", `${mx * 100}%`);
    title.style.setProperty("--ly", `${my * 100}%`);
    lens.style.left = `${mx * 100}%`;
    lens.style.top = `${my * 100}%`;
    lens.style.opacity = hovering ? "1" : "0.55";

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const cx = hovering ? mx : 0.5;
    const cy = hovering ? my : 0.36;

    particles.forEach((p, i) => {
      const wanderX = Math.cos(time * 0.9 + p.seed) * 0.00045;
      const wanderY = Math.sin(time * 1.1 + p.seed * 1.3) * 0.00038;
      const dx = cx - p.x;
      const dy = cy - p.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const pull = hovering ? 0.0018 / (dist + 0.12) : 0.00055;
      p.vx += dx * pull + wanderX;
      p.vy += dy * pull + wanderY;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.x += p.vx;
      p.y += p.vy;
      p.x += (0.5 - p.x) * 0.004;
      p.y += (0.34 - p.y) * 0.004;

      const px = p.x * width;
      const py = p.y * height;
      const radius = p.r * (hovering ? 1.08 : 1);
      const [r, g, b] = colors[p.hue];
      const glow = ctx.createRadialGradient(px, py, 0, px, py, radius);
      glow.addColorStop(0, `rgba(${r},${g},${b},0.28)`);
      glow.addColorStop(0.4, `rgba(${r},${g},${b},0.1)`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
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
  hero.addEventListener("pointermove", (event) => {
    hovering = true;
    setTarget(event);
  });
  hero.addEventListener("pointerleave", () => {
    hovering = false;
    tx = 0.5;
    ty = 0.36;
  });
  window.addEventListener("resize", fit);

  fit();
  requestAnimationFrame(tick);
}
