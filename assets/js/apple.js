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
  const tablet = window.matchMedia("(min-width: 735px) and (max-width: 1100px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "apple-liquid-svg");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML =
    '<filter id="apple-name-warp" x="-25%" y="-25%" width="150%" height="150%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="2" result="noise"></feTurbulence>' +
    '<feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap>' +
    "</filter>";
  document.body.appendChild(svg);
  const warpMap = svg.querySelector("feDisplacementMap");

  const heroCanvas = document.createElement("canvas");
  heroCanvas.className = "apple-liquid-canvas";
  heroCanvas.setAttribute("aria-hidden", "true");
  hero.prepend(heroCanvas);
  const heroCtx = heroCanvas.getContext("2d", { alpha: true });

  const pageCanvas = document.createElement("canvas");
  pageCanvas.className = "apple-page-particles";
  pageCanvas.setAttribute("aria-hidden", "true");
  document.body.prepend(pageCanvas);
  const pageCtx = pageCanvas.getContext("2d", { alpha: true });

  const lens = document.createElement("div");
  lens.className = "apple-glass-lens";
  lens.setAttribute("aria-hidden", "true");
  hero.appendChild(lens);

  const palette = [
    [0, 113, 227],
    [94, 92, 230],
    [232, 168, 56],
  ];

  const blobCount = phone ? 7 : tablet ? 12 : 16;
  const blobs = Array.from({ length: blobCount }, (_, i) => ({
    x: 0.3 + Math.random() * 0.4,
    y: 0.28 + Math.random() * 0.2,
    vx: 0,
    vy: 0,
    r: 42 + (i % 5) * 10,
    hue: i % 3,
    seed: Math.random() * Math.PI * 2,
  }));

  const ambientCount = phone ? 22 : tablet ? 34 : 48;
  const field = [];
  const spawnAmbient = () => {
    field.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.28,
      r: 1.6 + Math.random() * 2.4,
      hue: Math.floor(Math.random() * 3),
      seed: Math.random() * Math.PI * 2,
      born: false,
    });
  };
  for (let i = 0; i < ambientCount; i += 1) spawnAmbient();

  let hw = 1;
  let hh = 1;
  let pw = 1;
  let ph = 1;
  let dpr = 1;
  let tx = 0.5;
  let ty = 0.34;
  let mx = 0.5;
  let my = 0.34;
  let heroHover = false;
  let nameHot = false;
  let time = 0;
  let warp = 0;
  let rx = 0;
  let ry = 0;
  let sc = 1;
  let trx = 0;
  let tryv = 0;
  let tsc = 1;
  let emitCool = 0;

  const fit = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const heroBox = hero.getBoundingClientRect();
    hw = Math.max(1, Math.floor(heroBox.width));
    hh = Math.max(1, Math.floor(heroBox.height));
    heroCanvas.width = hw * dpr;
    heroCanvas.height = hh * dpr;
    heroCanvas.style.width = `${hw}px`;
    heroCanvas.style.height = `${hh}px`;
    heroCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    pw = Math.max(1, window.innerWidth);
    ph = Math.max(1, window.innerHeight);
    pageCanvas.width = pw * dpr;
    pageCanvas.height = ph * dpr;
    pageCanvas.style.width = `${pw}px`;
    pageCanvas.style.height = `${ph}px`;
    pageCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const emitFromName = () => {
    const box = title.getBoundingClientRect();
    const burst = phone ? 2 : 3;
    for (let i = 0; i < burst; i += 1) {
      const x = box.left + Math.random() * box.width;
      const y = box.top + Math.random() * box.height * 0.85;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const ang = Math.atan2(y - cy, x - cx) + (Math.random() - 0.5) * 0.7;
      const speed = 1.6 + Math.random() * 2.4;
      field.push({
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 0.35,
        r: 2.1 + Math.random() * 2.8,
        hue: Math.floor(Math.random() * 3),
        seed: Math.random() * Math.PI * 2,
        born: true,
      });
    }
    const cap = phone ? 90 : 160;
    if (field.length > cap) field.splice(0, field.length - cap);
  };

  const drawDot = (ctx, p, alpha) => {
    const [r, g, b] = palette[p.hue];
    ctx.beginPath();
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.85, alpha + 0.1)})`;
    ctx.arc(p.x - p.r * 0.22, p.y - p.r * 0.26, Math.max(0.7, p.r * 0.28), 0, Math.PI * 2);
    ctx.fill();
  };

  const tick = () => {
    time += 0.016;
    if (!heroHover && !nameHot) {
      tx = 0.5 + Math.cos(time * 0.32) * (phone ? 0.16 : 0.12);
      ty = 0.34 + Math.sin(time * 0.24) * (phone ? 0.08 : 0.06);
    }
    mx += (tx - mx) * (coarse ? 0.1 : 0.07);
    my += (ty - my) * (coarse ? 0.1 : 0.07);
    warp += ((nameHot ? 12 : 0) - warp) * 0.12;
    rx += (trx - rx) * 0.14;
    ry += (tryv - ry) * 0.14;
    sc += (tsc - sc) * 0.14;
    if (!nameHot) {
      trx = 0;
      tryv = 0;
      tsc = 1;
    }

    hero.style.setProperty("--mx", `${(mx * 100).toFixed(2)}%`);
    hero.style.setProperty("--my", `${(my * 100).toFixed(2)}%`);
    title.style.setProperty("--lx", `${(mx * 100).toFixed(2)}%`);
    title.style.setProperty("--ly", `${(my * 100).toFixed(2)}%`);
    title.style.setProperty("--shift", `${(mx * 80 + 10).toFixed(1)}%`);
    title.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    title.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    title.style.setProperty("--sc", sc.toFixed(3));
    title.classList.toggle("is-hot", nameHot);
    if (warpMap) warpMap.setAttribute("scale", warp.toFixed(2));
    lens.style.left = `${mx * 100}%`;
    lens.style.top = `${my * 100}%`;
    lens.classList.toggle("is-active", heroHover || nameHot);

    if (nameHot) {
      emitCool += 0.016;
      if (emitCool > (phone ? 0.055 : 0.032)) {
        emitFromName();
        emitCool = 0;
      }
    }

    heroCtx.clearRect(0, 0, hw, hh);
    const titleBox = title.getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    const ax = (titleBox.left - heroBox.left + titleBox.width / 2) / hw;
    const ay = (titleBox.top - heroBox.top + titleBox.height / 2) / hh;
    blobs.forEach((p) => {
      const flowX = Math.cos(time * 0.7 + p.seed + p.y * 6) * 0.00045;
      const flowY = Math.sin(time * 0.65 + p.seed * 1.4 + p.x * 6) * 0.00035;
      const dxm = mx - p.x;
      const dym = my - p.y;
      const dm = Math.hypot(dxm, dym) || 0.001;
      const swirl = (heroHover || nameHot ? 0.0018 : 0.0004) / (dm + 0.08);
      p.vx += flowX - dym * swirl * 0.55 + dxm * swirl * 0.35;
      p.vy += flowY + dxm * swirl * 0.55 + dym * swirl * 0.2;
      p.vx += (ax - p.x) * 0.003;
      p.vy += (ay - p.y) * 0.003;
      p.vx *= 0.9;
      p.vy *= 0.9;
      p.x = Math.min(0.9, Math.max(0.1, p.x + p.vx));
      p.y = Math.min(0.72, Math.max(0.12, p.y + p.vy));
      const px = p.x * hw;
      const py = p.y * hh;
      const [r, g, b] = palette[p.hue];
      const radius = p.r * (nameHot ? 1.18 : 1);
      const glow = heroCtx.createRadialGradient(px, py, 0, px, py, radius);
      glow.addColorStop(0, `rgba(${r},${g},${b},0.34)`);
      glow.addColorStop(0.45, `rgba(${r},${g},${b},0.14)`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      heroCtx.fillStyle = glow;
      heroCtx.beginPath();
      heroCtx.arc(px, py, radius, 0, Math.PI * 2);
      heroCtx.fill();
    });

    pageCtx.clearRect(0, 0, pw, ph);
    field.forEach((p) => {
      p.vx += Math.cos(time * 0.55 + p.seed) * 0.012;
      p.vy += Math.sin(time * 0.48 + p.seed * 1.2) * 0.01;
      if (p.born) {
        p.vx *= 0.985;
        p.vy *= 0.985;
        if (Math.hypot(p.vx, p.vy) < 0.38) p.born = false;
      } else {
        p.vx *= 0.995;
        p.vy *= 0.995;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -12) p.x = pw + 12;
      if (p.x > pw + 12) p.x = -12;
      if (p.y < -12) p.y = ph + 12;
      if (p.y > ph + 12) p.y = -12;
      drawDot(pageCtx, p, p.born ? 0.95 : 0.62);
    });

    requestAnimationFrame(tick);
  };

  const setHeroTarget = (event) => {
    const rect = hero.getBoundingClientRect();
    tx = (event.clientX - rect.left) / rect.width;
    ty = (event.clientY - rect.top) / rect.height;
  };

  const setNameWarp = (event) => {
    const box = title.getBoundingClientRect();
    const px = (event.clientX - box.left) / Math.max(box.width, 1);
    const py = (event.clientY - box.top) / Math.max(box.height, 1);
    trx = (0.5 - py) * 14;
    tryv = (px - 0.5) * 18;
    tsc = 1.08;
  };

  hero.addEventListener("pointerenter", (event) => {
    heroHover = true;
    setHeroTarget(event);
  });
  hero.addEventListener("pointermove", (event) => {
    heroHover = true;
    setHeroTarget(event);
  });
  hero.addEventListener("pointerleave", () => {
    heroHover = false;
  });

  title.addEventListener("pointerenter", (event) => {
    nameHot = true;
    setNameWarp(event);
    emitFromName();
  });
  title.addEventListener("pointermove", (event) => {
    nameHot = true;
    setNameWarp(event);
    setHeroTarget(event);
  });
  title.addEventListener("pointerdown", (event) => {
    nameHot = true;
    setNameWarp(event);
    emitFromName();
  });
  title.addEventListener("pointerleave", () => {
    nameHot = false;
  });
  title.addEventListener("pointerup", () => {
    if (coarse) nameHot = false;
  });

  window.addEventListener("resize", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);

  fit();
  requestAnimationFrame(tick);
}
