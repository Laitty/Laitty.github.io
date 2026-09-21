document.addEventListener("DOMContentLoaded", () => {
  const nodes = document.querySelectorAll(
    ".apple-hero, .apple-feature, .apple-article h2, .apple-article ul > li, .bibliography > ol > li, .social"
  );
  nodes.forEach((el, i) => {
    el.style.animationDelay = `${Math.min(i * 0.04, 0.45)}s`;
    el.classList.add("apple-reveal");
  });
});
