document.addEventListener("DOMContentLoaded", () => {
  const nodes = document.querySelectorAll(
    ".apple-hero, .apple-article h2, .apple-article ul > li, .bibliography > ol > li, .publications li, .social"
  );
  nodes.forEach((el, i) => {
    el.style.animationDelay = `${Math.min(i * 0.05, 0.6)}s`;
    el.classList.add("apple-reveal");
  });

  initHeroMotion();
});

function initHeroMotion() {
  const hero = document.querySelector(".apple-hero");
  const title = document.querySelector(".apple-hero-title");
  if (!hero || !title) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const label = title.textContent.replace(/\s+/g, " ").trim();
  title.setAttribute("aria-label", label);
  title.textContent = "";
  [...label].forEach((ch) => {
    const span = document.createElement("span");
    span.className = ch === " " ? "apple-letter apple-letter-space" : "apple-letter";
    span.textContent = ch === " " ? "\u00a0" : ch;
    title.appendChild(span);
  });

  const letters = [...title.querySelectorAll(".apple-letter")];
  const sub = hero.querySelector(".apple-hero-sub");
  const lede = hero.querySelector(".apple-hero-lede");
  const eyebrow = hero.querySelector(".apple-eyebrow");
  const orbs = hero.querySelector(".apple-orbs");
  const copy = [...document.querySelectorAll(".apple-article > .clearfix > p")].slice(0, 2);
  copy.forEach((p) => p.classList.add("apple-copy-motion"));

  let tx = 0;
  let ty = 0;
  let mx = 0;
  let my = 0;
  let inside = false;
  let raf = 0;

  const tick = () => {
    mx += (tx - mx) * 0.14;
    my += (ty - my) * 0.14;
    const rect = hero.getBoundingClientRect();
    const hx = ((mx - rect.left) / rect.width) * 2 - 1;
    const hy = ((my - rect.top) / rect.height) * 2 - 1;

    hero.style.setProperty("--mx", `${mx - rect.left}px`);
    hero.style.setProperty("--my", `${my - rect.top}px`);

    const titleBox = title.getBoundingClientRect();
    letters.forEach((letter) => {
      const cx = titleBox.left + letter.offsetLeft + letter.offsetWidth / 2;
      const cy = titleBox.top + letter.offsetTop + letter.offsetHeight / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy);
      const force = inside ? Math.max(0, 1 - dist / 170) : 0;
      const lift = force ** 1.35;
      letter.style.transform = `translate3d(${dx * lift * 0.16}px, ${dy * lift * 0.18}px, 0) scale(${1 + lift * 0.28})`;
      letter.style.color = `color-mix(in srgb, var(--apple-blue) ${Math.round(lift * 100)}%, var(--apple-text))`;
      letter.style.textShadow = lift > 0.08 ? `0 10px 28px rgba(0, 113, 227, ${0.18 + lift * 0.35})` : "none";
      letter.style.zIndex = String(Math.round(lift * 10));
    });

    const parax = inside ? hx : 0;
    const paray = inside ? hy : 0;
    if (eyebrow) eyebrow.style.transform = `translate3d(${parax * 6}px, ${paray * 4}px, 0)`;
    if (sub) sub.style.transform = `translate3d(${parax * 10}px, ${paray * 7}px, 0)`;
    if (lede) lede.style.transform = `translate3d(${parax * 7}px, ${paray * 5}px, 0)`;
    if (orbs) orbs.style.translate = `${parax * 22}px ${paray * 16}px`;

    copy.forEach((p, i) => {
      const box = p.getBoundingClientRect();
      const near = mx >= box.left - 28 && mx <= box.right + 28 && my >= box.top - 28 && my <= box.bottom + 28;
      const glow = near ? Math.max(0, 1 - Math.hypot(mx - (box.left + box.width / 2), my - (box.top + box.height / 2)) / 460) : 0;
      p.style.setProperty("--cx", `${mx - box.left}px`);
      p.style.setProperty("--cy", `${my - box.top}px`);
      p.style.setProperty("--copy-glow", glow.toFixed(3));
      if (inside) {
        p.style.transform = `translate3d(${parax * (3 - i)}px, ${paray * (2 - i * 0.4)}px, 0)`;
      } else {
        p.style.transform = near
          ? `translate3d(${(mx - (box.left + box.width / 2)) * 0.012}px, ${(my - (box.top + box.height / 2)) * 0.01}px, 0)`
          : "none";
      }
    });

    raf = requestAnimationFrame(tick);
  };

  hero.addEventListener("pointerenter", (e) => {
    inside = true;
    tx = e.clientX;
    ty = e.clientY;
    mx = tx;
    my = ty;
  });
  hero.addEventListener("pointermove", (e) => {
    inside = true;
    tx = e.clientX;
    ty = e.clientY;
  });
  hero.addEventListener("pointerleave", () => {
    inside = false;
  });

  window.addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
  });

  raf = requestAnimationFrame(tick);
}
