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

  const hot = title.cloneNode(true);
  hot.classList.add("apple-hero-title-hot");
  hot.setAttribute("aria-hidden", "true");
  wrap.appendChild(hot);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "apple-liquid-svg");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML =
    '<filter id="apple-name-warp" x="-30%" y="-30%" width="160%" height="160%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="noise"></feTurbulence>' +
    '<feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap>' +
    "</filter>";
  document.body.appendChild(svg);

  const canvas = document.createElement("canvas");
  canvas.className = "apple-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

  const palette = [
    [0, 113, 227],
    [94, 92, 230],
    [232, 168, 56],
    [48, 209, 88],
    [255, 69, 58],
    [100, 210, 255],
  ];

  const field = [];
  const cap = phone ? 70 : 120;
  let hw = 1;
  let hh = 1;
  let dpr = 1;
  let nameHot = false;
  let mx = 0;
  let my = 0;
  let time = 0;
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
    for (let i = 0; i < burst; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 1.1 + Math.random() * 2.4;
      field.push({
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        r: 1.6 + Math.random() * 2.2,
        hue: Math.floor(Math.random() * palette.length),
        life: 4.5 + Math.random() * 5,
        age: 0,
      });
    }
    if (field.length > cap) field.splice(0, field.length - cap);
  };

  const setHot = (event) => {
    nameHot = true;
    const p = localPoint(event);
    mx = p.x;
    my = p.y;
    const tbox = wrap.getBoundingClientRect();
    const hbox = hero.getBoundingClientRect();
    hot.style.setProperty("--hx", `${event.clientX - tbox.left}px`);
    hot.style.setProperty("--hy", `${event.clientY - tbox.top}px`);
    hot.classList.add("is-on");
  };

  const tick = () => {
    time += 0.016;
    if (nameHot) {
      emitCool += 0.016;
      if (emitCool > (phone ? 0.04 : 0.022)) {
        emitAt(mx, my, phone ? 2 : 3);
        emitCool = 0;
      }
    }

    ctx.clearRect(0, 0, hw, hh);
    for (let i = field.length - 1; i >= 0; i -= 1) {
      const p = field[i];
      p.age += 0.016;
      p.vy += 0.012;
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
      const fade = p.age > p.life - 1 ? Math.max(0, (p.life - p.age) / 1) : 1;
      if (p.age > p.life || fade <= 0) {
        field.splice(i, 1);
        continue;
      }
      const [r, g, b] = palette[p.hue];
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${0.2 + 0.8 * fade})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${0.55 * fade})`;
      ctx.arc(p.x - p.r * 0.25, p.y - p.r * 0.28, Math.max(0.6, p.r * 0.32), 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  };

  title.addEventListener("pointerenter", (event) => {
    setHot(event);
    emitAt(mx, my, phone ? 8 : 14);
  });
  title.addEventListener("pointermove", (event) => {
    setHot(event);
  });
  title.addEventListener("pointerdown", (event) => {
    setHot(event);
    emitAt(mx, my, phone ? 10 : 16);
  });
  title.addEventListener("pointerleave", () => {
    nameHot = false;
    hot.classList.remove("is-on");
  });
  title.addEventListener("pointerup", () => {
    if (coarse) {
      nameHot = false;
      hot.classList.remove("is-on");
    }
  });

  window.addEventListener("resize", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  fit();
  requestAnimationFrame(tick);
}
