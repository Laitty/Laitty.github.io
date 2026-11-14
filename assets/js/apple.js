document.addEventListener("DOMContentLoaded", () => {
  const nodes = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? []
    : document.querySelectorAll(".apple-hero, .apple-article h2, .apple-article ul > li, .bibliography > ol > li, .publications li, .social");
  nodes.forEach((el, i) => {
    el.style.animationDelay = `${Math.min(i * 0.05, 0.6)}s`;
    el.classList.add("apple-reveal");
  });
  initLiquidName();
  initPosterViewer();
  initSectionRail();
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

  const canvas = document.createElement("canvas");
  canvas.className = "apple-liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  hero.prepend(canvas);
  const ctx = canvas.getContext("2d", { alpha: true });

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
  const cap = phone ? 70 : 120;
  let hw = 1;
  let hh = 1;
  let dpr = 1;
  let time = 0;

  const dark = () =>
    document.documentElement.getAttribute("data-theme") === "dark" || document.documentElement.getAttribute("data-theme-setting") === "dark";

  let anchor = { x: 0, y: 0, w: 1, h: 1 };

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
      const r = 1.45 + Math.random() * 3.55;
      const heft = (r - 1.45) / 3.55;
      const speed = (1.85 + Math.random() * 3.05) * (1.22 - 0.58 * heft);
      field.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - 0.5,
        r,
        drag: 0.9965 - heft * 0.0055,
        grav: 0.013 + heft * 0.008,
        life: 5.6 + Math.random() * 4.4,
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
      const deforming = target > st.influence;
      [st.influence, st.vInf] = stepSpring(st.influence, st.vInf, target, deforming ? 460 : 230, deforming ? 32 : 22.4);
      const turning = Math.abs(targetRot) > Math.abs(st.rot);
      [st.rot, st.vRot] = stepSpring(st.rot, st.vRot, targetRot, turning ? 460 : 230, turning ? 32 : 22.4);
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
      p.vy += p.grav;
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
      p.vx *= p.drag;
      p.vy *= p.drag;
      const fade = p.age > p.life - 1.6 ? Math.max(0, (p.life - p.age) / 1.6) : 1;
      if (p.age > p.life || fade <= 0) {
        field.splice(i, 1);
        continue;
      }
      const [r, g, b] = colors[p.hue];
      // Phone: no glass blur wall — soften chroma/alpha so Tartan accents match desktop.
      let pr = r;
      let pg = g;
      let pb = b;
      let bodyA = 0.22 + 0.7 * fade;
      let hiA = 0.4 * fade;
      if (phone) {
        const neut = dark() ? 196 : 72;
        const k = 0.58;
        pr = Math.round(r * k + neut * (1 - k));
        pg = Math.round(g * k + neut * (1 - k));
        pb = Math.round(b * k + neut * (1 - k));
        bodyA = 0.12 + 0.42 * fade;
        hiA = 0.16 * fade;
      }
      ctx.beginPath();
      ctx.fillStyle = `rgba(${pr},${pg},${pb},${bodyA})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${hiA})`;
      ctx.arc(p.x - p.r * 0.22, p.y - p.r * 0.25, Math.max(0.5, p.r * 0.3), 0, Math.PI * 2);
      ctx.fill();
    }

    if (heroVisible) requestAnimationFrame(tick);
    else running = false;
  };

  // Stop drawing once the hero scrolls out of view, so the canvas does not
  // keep burning CPU (and battery) while the rest of the page is being read.
  let heroVisible = true;
  let running = false;
  const start = () => {
    if (running || !heroVisible) return;
    running = true;
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      heroVisible = entries[entries.length - 1].isIntersecting;
      start();
    }).observe(hero);
  }

  window.addEventListener("resize", fit);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  fit();
  start();
}

function splitName(title) {
  // Collapse the template's indentation and newlines first; otherwise every
  // whitespace character becomes an invisible flex item that pushes the name
  // off-centre and forces early line breaks.
  const text = title.textContent.replace(/\s+/g, " ").trim();
  title.textContent = "";
  // Screen readers get the name once as plain text; the animated letters are hidden from them.
  const spoken = document.createElement("span");
  spoken.className = "sr-only";
  spoken.textContent = text;
  title.appendChild(spoken);
  const letters = [];
  // Group letters by word so the flex row only wraps between words, never mid-word.
  text.split(" ").forEach((word) => {
    const group = document.createElement("span");
    group.className = "apple-word";
    group.setAttribute("aria-hidden", "true");
    for (const ch of word) {
      const span = document.createElement("span");
      span.className = "apple-ch";
      span.textContent = ch;
      if (/[A-Za-z]/.test(ch)) letters.push(span);
      group.appendChild(span);
    }
    title.appendChild(group);
  });
  return letters;
}

function initSectionRail() {
  const root = document.querySelector(".apple-article") || document.querySelector("article") || document.querySelector(".post");
  if (!root) return;

  const heads = [...root.querySelectorAll("h2, h3")].filter((heading) => {
    if (heading.classList.contains("bibliography")) return false;
    return heading.textContent.trim().length > 0;
  });
  if (heads.length < 2) return;

  const used = new Set([...document.querySelectorAll("[id]")].map((node) => node.id));
  heads.forEach((heading) => {
    if (heading.id) return;
    const base =
      heading.textContent
        .trim()
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "section";
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    heading.id = id;
  });

  const entries = heads.map((heading) => ({
    el: heading,
    id: heading.id,
    label: heading.textContent.trim(),
    sub: heading.tagName === "H3",
  }));
  if (root.id === "about") {
    entries.unshift({ el: root, id: "about", label: "About me", sub: false });
  }

  const nav = document.createElement("nav");
  nav.className = "section-rail";
  nav.setAttribute("aria-label", "On this page");
  const list = document.createElement("ol");
  entries.forEach((entry) => {
    const item = document.createElement("li");
    if (entry.sub) item.className = "is-sub";
    const link = document.createElement("a");
    link.href = `#${entry.id}`;
    link.textContent = entry.label;
    item.appendChild(link);
    list.appendChild(item);
  });
  nav.appendChild(list);
  document.body.appendChild(nav);

  const links = [...nav.querySelectorAll("a")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setCurrent = (id) => {
    links.forEach((link) => {
      const on = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-current", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const mark = () => {
    const line = 128;
    let current = entries[0];
    entries.forEach((entry) => {
      if (entry.el.getBoundingClientRect().top <= line) current = entry;
    });
    // A short last section never scrolls up to the line, so the bottom of the page marks it.
    const page = document.documentElement;
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= page.scrollHeight - 2) current = entries[entries.length - 1];
    setCurrent(current.id);
  };

  links.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      entries[index].el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
      setCurrent(entries[index].id);
    });
  });

  let markQueued = false;
  const queueMark = () => {
    if (markQueued) return;
    markQueued = true;
    requestAnimationFrame(() => {
      markQueued = false;
      mark();
    });
  };

  mark();
  window.addEventListener("scroll", queueMark, { passive: true });
}

// Poster viewer: shows a pre-rendered image of the poster (a light preview first, then the
// sharp version) fitted to the window, with zoom and pan for mouse, trackpad and touch.
// Browsers render PDFs inside a page badly or not at all on phones, so the PDF itself is
// only offered through the "PDF" button and through the link (new tab / modifier clicks).
function initPosterViewer() {
  if (!document.querySelector("a.js-poster-view")) return;

  const dialog = document.createElement("dialog");
  dialog.className = "poster-dialog";
  dialog.setAttribute("aria-label", "Poster");
  dialog.innerHTML = `
    <div class="poster-dialog-bar">
      <span class="poster-dialog-title">Poster</span>
      <div class="poster-dialog-tools">
        <button type="button" class="poster-tool" data-action="out" aria-label="Zoom out">&minus;</button>
        <button type="button" class="poster-tool poster-tool-fit" data-action="fit" aria-label="Fit poster to window">Fit</button>
        <button type="button" class="poster-tool" data-action="in" aria-label="Zoom in">+</button>
        <a class="poster-tool poster-tool-pdf" target="_blank" rel="noopener" aria-label="Open the PDF in a new tab">PDF</a>
        <button type="button" class="poster-tool poster-dialog-close" data-action="close" aria-label="Close poster">&times;</button>
      </div>
    </div>
    <div class="poster-stage">
      <img class="poster-image" alt="" draggable="false" decoding="async">
      <p class="poster-status">Loading poster…</p>
      <p class="poster-hint" aria-hidden="true"></p>
    </div>
  `;
  document.body.appendChild(dialog);

  const stage = dialog.querySelector(".poster-stage");
  const img = dialog.querySelector(".poster-image");
  const status = dialog.querySelector(".poster-status");
  const hint = dialog.querySelector(".poster-hint");
  const title = dialog.querySelector(".poster-dialog-title");
  const fitBtn = dialog.querySelector(".poster-tool-fit");
  const pdfLink = dialog.querySelector(".poster-tool-pdf");
  const touchFirst = window.matchMedia("(hover: none)").matches;

  // Geometry: the image is laid out at the preview's pixel size and moved with one transform.
  let iw = 0;
  let ih = 0;
  let detail = 2; // full-image pixels per preview pixel, measured once the sharp image loads
  let fit = 1;
  let scale = 1;
  let tx = 0;
  let ty = 0;
  let token = 0;
  let hintTimer = 0;
  let lastPointer = "mouse";
  let lastTap = { time: 0, x: 0, y: 0 };
  const pointers = new Map();
  let pinch = null;
  let drag = null;

  const box = () => stage.getBoundingClientRect();
  const maxScale = () => Math.max(fit * 2.5, detail * 1.25);
  const isZoomed = () => scale > fit * 1.01;

  const render = (animate = false) => {
    const { width: w, height: h } = box();
    const sw = iw * scale;
    const sh = ih * scale;
    tx = sw <= w ? (w - sw) / 2 : Math.min(0, Math.max(w - sw, tx));
    ty = sh <= h ? (h - sh) / 2 : Math.min(0, Math.max(h - sh, ty));
    img.classList.toggle("is-animating", animate);
    img.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    const pct = Math.round((scale / fit) * 100);
    fitBtn.textContent = pct <= 101 ? "Fit" : `${pct}%`;
    stage.classList.toggle("is-zoomed", isZoomed());
  };

  const zoomTo = (next, px, py, animate = false) => {
    if (!iw) return;
    const { width: w, height: h } = box();
    const x = px === undefined ? w / 2 : px;
    const y = py === undefined ? h / 2 : py;
    const target = Math.min(maxScale(), Math.max(fit, next));
    tx = x - ((x - tx) * target) / scale;
    ty = y - ((y - ty) * target) / scale;
    scale = target;
    render(animate);
  };

  const computeFit = () => {
    const { width: w, height: h } = box();
    const pad = w < 600 ? 10 : 28;
    fit = Math.max(0.01, Math.min((w - pad * 2) / iw, (h - pad * 2) / ih));
  };

  const resetFit = (animate = false) => {
    if (!iw) return;
    computeFit();
    scale = fit;
    render(animate);
  };

  const local = (event) => {
    const r = box();
    return { x: event.clientX - r.left, y: event.clientY - r.top };
  };

  const toggleZoom = (x, y) => {
    if (isZoomed()) resetFit(true);
    else zoomTo(Math.max(fit * 2.5, Math.min(1, maxScale())), x, y, true);
  };

  const hideHint = () => {
    clearTimeout(hintTimer);
    hint.classList.remove("is-visible");
  };

  const showHint = () => {
    hint.textContent = touchFirst ? "Pinch to zoom · double-tap to zoom in" : "Scroll to zoom · drag to move · double-click to zoom in";
    hint.classList.add("is-visible");
    hintTimer = setTimeout(hideHint, 3200);
  };

  const cleanup = () => {
    token += 1;
    hideHint();
    pointers.clear();
    pinch = null;
    drag = null;
    img.removeAttribute("src");
    document.documentElement.classList.remove("poster-open");
  };

  const closePoster = () => {
    if (dialog.open) dialog.close();
    cleanup();
  };

  const openPoster = (link) => {
    const preview = link.dataset.posterPreview;
    if (!preview || typeof dialog.showModal !== "function") {
      window.open(link.href, "_blank", "noopener");
      return;
    }
    const run = ++token;
    const label = link.dataset.posterTitle || "Poster";
    title.textContent = label;
    img.alt = label;
    pdfLink.href = link.href;
    iw = 0;
    ih = 0;
    detail = 2;
    img.removeAttribute("src");
    img.style.transform = "";
    stage.classList.add("is-loading");
    stage.classList.remove("is-zoomed");
    status.textContent = "Loading poster…";
    fitBtn.textContent = "Fit";
    document.documentElement.classList.add("poster-open");
    dialog.showModal();
    dialog.querySelector(".poster-dialog-close").focus({ preventScroll: true });

    const first = new Image();
    first.decoding = "async";
    first.onload = () => {
      if (run !== token) return;
      iw = first.naturalWidth;
      ih = first.naturalHeight;
      img.style.width = `${iw}px`;
      img.style.height = `${ih}px`;
      img.src = preview;
      stage.classList.remove("is-loading");
      resetFit();
      showHint();
      const full = link.dataset.posterFull;
      if (!full) return;
      const sharp = new Image();
      sharp.decoding = "async";
      // Swap only once the sharp image is decoded, so the poster never flashes blank.
      sharp.onload = () => {
        const swap = () => {
          if (run !== token) return;
          detail = sharp.naturalWidth / iw || detail;
          img.src = full;
        };
        if (typeof sharp.decode === "function") sharp.decode().then(swap, swap);
        else swap();
      };
      sharp.src = full;
    };
    first.onerror = () => {
      if (run !== token) return;
      status.textContent = "The poster image could not be loaded. Use the PDF button instead.";
    };
    first.src = preview;
  };

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a.js-poster-view");
      if (!link) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      openPoster(link);
    },
    true
  );

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closePoster();
      return;
    }
    const control = event.target.closest("[data-action]");
    const action = control ? control.dataset.action : "";
    if (action === "close") closePoster();
    else if (action === "fit") resetFit(true);
    else if (action === "in") zoomTo(scale * 1.6, undefined, undefined, true);
    else if (action === "out") zoomTo(scale / 1.6, undefined, undefined, true);
  });

  // Esc closes the dialog natively; its "close" event can arrive a moment later, so it
  // must not undo a poster that has been opened again in the meantime.
  dialog.addEventListener("close", () => {
    if (!dialog.open) cleanup();
  });

  dialog.addEventListener("keydown", (event) => {
    const step = 80;
    const keys = {
      "+": () => zoomTo(scale * 1.4, undefined, undefined, true),
      "=": () => zoomTo(scale * 1.4, undefined, undefined, true),
      "-": () => zoomTo(scale / 1.4, undefined, undefined, true),
      0: () => resetFit(true),
      ArrowLeft: () => ((tx += step), render(true)),
      ArrowRight: () => ((tx -= step), render(true)),
      ArrowUp: () => ((ty += step), render(true)),
      ArrowDown: () => ((ty -= step), render(true)),
    };
    const run = keys[event.key];
    if (!run || !iw) return;
    event.preventDefault();
    hideHint();
    run();
  });

  stage.addEventListener(
    "wheel",
    (event) => {
      if (!iw) return;
      event.preventDefault();
      hideHint();
      const { x, y } = local(event);
      // A mouse wheel moves in large whole steps (or in lines); a trackpad sends small fractional deltas.
      const mouseWheel = event.deltaMode !== 0 || (event.deltaX === 0 && Number.isInteger(event.deltaY) && Math.abs(event.deltaY) >= 40);
      if (event.ctrlKey) zoomTo(scale * Math.exp(-event.deltaY * 0.01), x, y);
      else if (mouseWheel || !isZoomed()) zoomTo(scale * Math.exp(-event.deltaY * 0.002), x, y);
      else {
        tx -= event.deltaX;
        ty -= event.deltaY;
        render();
      }
    },
    { passive: false }
  );

  stage.addEventListener("pointerdown", (event) => {
    if (!iw || (event.pointerType === "mouse" && event.button !== 0)) return;
    lastPointer = event.pointerType;
    try {
      stage.setPointerCapture(event.pointerId);
    } catch (error) {
      // The pointer is already gone; moves still arrive on the stage itself.
    }
    pointers.set(event.pointerId, local(event));
    hideHint();
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, scale, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      drag = null;
    } else if (pointers.size === 1) {
      const p = pointers.get(event.pointerId);
      drag = { x: p.x, y: p.y, tx, ty, moved: false };
    }
  });

  stage.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, local(event));
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const x = (a.x + b.x) / 2;
      const y = (a.y + b.y) / 2;
      tx += x - pinch.x;
      ty += y - pinch.y;
      pinch.x = x;
      pinch.y = y;
      zoomTo((pinch.scale * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.dist, x, y);
    } else if (drag) {
      const p = pointers.get(event.pointerId);
      if (Math.abs(p.x - drag.x) + Math.abs(p.y - drag.y) > 4) drag.moved = true;
      if (!drag.moved) return;
      stage.classList.add("is-dragging");
      tx = drag.tx + (p.x - drag.x);
      ty = drag.ty + (p.y - drag.y);
      render();
    }
  });

  const endPointer = (event) => {
    if (!pointers.has(event.pointerId)) return;
    const p = pointers.get(event.pointerId);
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 1) {
      const [rest] = [...pointers.values()];
      drag = { x: rest.x, y: rest.y, tx, ty, moved: true };
      return;
    }
    if (pointers.size > 0) return;
    stage.classList.remove("is-dragging");
    const tapped = drag && !drag.moved && event.type === "pointerup";
    drag = null;
    if (!tapped || event.pointerType === "mouse") return;
    const now = Date.now();
    if (now - lastTap.time < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 40) {
      lastTap = { time: 0, x: 0, y: 0 };
      toggleZoom(p.x, p.y);
    } else {
      lastTap = { time: now, x: p.x, y: p.y };
    }
  };
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  stage.addEventListener("dblclick", (event) => {
    if (!iw || lastPointer !== "mouse") return;
    event.preventDefault();
    const { x, y } = local(event);
    toggleZoom(x, y);
  });

  // Keep the poster fitted (or the zoom clamped) when the window or phone orientation changes.
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      if (!dialog.open || !iw) return;
      const wasFit = !isZoomed();
      computeFit();
      if (wasFit) scale = fit;
      else scale = Math.min(maxScale(), Math.max(fit, scale));
      render();
    }).observe(stage);
  }
}
