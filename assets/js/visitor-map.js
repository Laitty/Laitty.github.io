(() => {
  const config = window.visitorHistory || {};
  const stores = (config.stores || []).map((url) => url.replace(/\/$/, "")).filter(Boolean);
  const historyUrl = config.history || "";
  const visitorApi = (config.visitorApi || "").replace(/\/$/, "");
  const counter = (config.counter || "").replace(/\/$/, "");
  const namespace = config.namespace || "";
  // Read path needs at least one source. Writes require visitorApi (fail closed).
  if (!stores.length && !historyUrl && !visitorApi) return;

  const root = document.getElementById("visitor-map");
  const stage = root && root.querySelector(".visitor-map-stage");
  const note = root && root.querySelector(".visitor-map-note");
  let dots = null;
  let draw = () => {};

  if (root && stage) {

  const land = document.createElement("img");
  land.className = "visitor-map-land";
  land.alt = "";
  land.draggable = false;
  land.src = root.dataset.map;
  dots = document.createElement("div");
  dots.className = "visitor-map-dots";
  const world = document.createElement("div");
  world.className = "visitor-map-world";
  world.append(land, dots);
  stage.append(world);

  const controls = document.createElement("div");
  controls.className = "visitor-map-controls";
  const addControl = (label, text) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "visitor-map-control";
    button.setAttribute("aria-label", label);
    button.textContent = text;
    controls.append(button);
    return button;
  };
  const zoomInButton = addControl("Zoom in", "+");
  const zoomOutButton = addControl("Zoom out", "−");
  const resetButton = addControl("Reset map", "⤢");
  stage.append(controls);

  let scale = 1;
  let originX = 0;
  let originY = 0;
  const minScale = 1;
  const maxScale = 8;

  const clamp = () => {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    originX = Math.min(0, Math.max(width - width * scale, originX));
    originY = Math.min(0, Math.max(height - height * scale, originY));
  };

  const apply = () => {
    world.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    dots.style.setProperty("--visitor-pin-scale", String(1 / scale));
  };

  const zoomAt = (clientX, clientY, nextScale) => {
    const rect = stage.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const clamped = Math.min(maxScale, Math.max(minScale, nextScale));
    const ratio = clamped / scale;
    originX = px - (px - originX) * ratio;
    originY = py - (py - originY) * ratio;
    scale = clamped;
    clamp();
    apply();
  };

  const zoomAtCenter = (nextScale) => {
    const rect = stage.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, nextScale);
  };

  stage.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.14 : 1 / 1.14;
      zoomAt(event.clientX, event.clientY, scale * factor);
    },
    { passive: false }
  );

  const pointers = new Map();
  let drag = null;
  let pinchDistance = 0;

  const endPointer = (event) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchDistance = 0;
    if (pointers.size === 0) {
      drag = null;
      stage.classList.remove("is-panning");
    }
  };

  stage.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".visitor-map-controls")) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    try {
      stage.setPointerCapture(event.pointerId);
    } catch (error) {
      /* capture is unavailable for some synthetic pointers */
    }
    if (pointers.size === 1) {
      drag = { x: event.clientX, y: event.clientY, ox: originX, oy: originY };
    } else if (pointers.size >= 2) {
      drag = null;
      const [a, b] = [...pointers.values()];
      pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });

  stage.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size >= 2 && pinchDistance > 0) {
      const [a, b] = [...pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, scale * (distance / pinchDistance));
      pinchDistance = distance;
      return;
    }
    if (!drag || scale <= 1) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.hypot(dx, dy) > 2) stage.classList.add("is-panning");
    originX = drag.ox + dx;
    originY = drag.oy + dy;
    clamp();
    apply();
  });

  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);
  stage.addEventListener("dblclick", (event) => {
    if (event.target.closest(".visitor-map-controls")) return;
    scale = 1;
    originX = 0;
    originY = 0;
    apply();
  });
  window.addEventListener("resize", () => {
    clamp();
    apply();
  });

  zoomInButton.addEventListener("click", () => zoomAtCenter(scale * 1.35));
  zoomOutButton.addEventListener("click", () => zoomAtCenter(scale / 1.35));
  resetButton.addEventListener("click", () => {
    scale = 1;
    originX = 0;
    originY = 0;
    apply();
  });

  draw = (places) => {
    dots.replaceChildren();
    const ranked = places
      .map((place) => ({
        ...place,
        count: Number(place.n) || 0,
        lat: Number(place.lat),
        lng: Number(place.lng),
        label: place.label || "Visit",
      }))
      .filter((place) => place.count && Number.isFinite(place.lat) && Number.isFinite(place.lng))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    const pinSizeForCount = (count) => {
      const n = Number(count) || 0;
      if (n <= 1) return 4.5;
      if (n <= 3) return 6;
      if (n <= 5) return 7.5;
      if (n <= 10) return 8.5;
      if (n <= 50) return 9.5;
      if (n <= 100) return 10.5;
      return 12;
    };

    ranked.forEach((place) => {
      const pin = document.createElement("span");
      pin.className = "visitor-map-pin";
      pin.style.left = `${((place.lng + 180) / 360) * 100}%`;
      pin.style.top = `${((90 - place.lat) / 180) * 100}%`;
      const size = pinSizeForCount(place.count);
      const dot = document.createElement("span");
      dot.className = "visitor-map-dot";
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      const tip = document.createElement("span");
      tip.className = "visitor-map-tip";
      const city = document.createElement("span");
      city.textContent = place.label;
      const count = document.createElement("strong");
      count.textContent = `${place.count} ${place.count === 1 ? "visit" : "visits"}`;
      tip.append(city, count);
      pin.append(dot, tip);
      pin.setAttribute("aria-label", `${place.label}, ${place.count}`);
      dots.append(pin);
    });

    const total = places.reduce((sum, place) => sum + (Number(place.n) || 0), 0);
    if (note) {
      note.textContent = total
        ? `${total} cumulative ${total === 1 ? "visit" : "visits"}`
        : "Cumulative visits will show up here.";
    }
  };
  }

  const counterKey = (key) => String(key).replace(/,/g, "_");

  const normalize = (data) => {
    const places = Array.isArray(data) ? data : data && data.places;
    return Array.isArray(places) ? places : [];
  };

  const merge = (lists) => {
    const byKey = new Map();
    lists.flat().forEach((place) => {
      if (!place || !place.key) return;
      const lat = Number(place.lat);
      const lng = Number(place.lng);
      const located = Number.isFinite(lat) && Number.isFinite(lng);
      if (place.key !== "unknown" && !located) return;
      const n = Number(place.n) || 0;
      const prev = byKey.get(place.key);
      if (!prev || n >= prev.n) {
        byKey.set(place.key, {
          key: place.key,
          n: Math.max(n, prev ? prev.n : 0),
          lat: located ? Number(lat.toFixed(1)) : null,
          lng: located ? Number(lng.toFixed(1)) : null,
          label: place.label || (prev && prev.label) || "Visit",
        });
      }
    });
    return [...byKey.values()];
  };

  const readLocal = async () => {
    if (!historyUrl) return [];
    try {
      const response = await fetch(historyUrl, { cache: "no-store" });
      if (!response.ok) return [];
      return normalize(await response.json());
    } catch {
      return [];
    }
  };

  const readStore = async (url) => {
    try {
      const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return null;
      return normalize(await response.json());
    } catch {
      return null;
    }
  };

  const readApiHistory = async () => {
    if (!visitorApi) return null;
    try {
      const response = await fetch(`${visitorApi}/history?t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return null;
      return normalize(await response.json());
    } catch {
      return null;
    }
  };

  const counterUrl = (action, key) =>
    `${counter}/${action}/${namespace}/${encodeURIComponent(counterKey(key))}`;

  const readCount = async (key) => {
    if (!counter || !namespace) return null;
    try {
      const response = await fetch(counterUrl("get", key), { cache: "no-store" });
      if (response.status === 404) return 0;
      if (!response.ok) return null;
      return Number((await response.json()).value) || 0;
    } catch {
      return null;
    }
  };

  // Abacus GET only — HIT writes go through the Worker.
  const syncCounts = async (places) => {
    if (!counter || !namespace) return places;
    return Promise.all(
      places.map(async (place) => {
        const value = await readCount(place.key);
        if (value == null) return place;
        return { ...place, n: Math.max(Number(place.n) || 0, value) };
      })
    );
  };

  const gather = async () => {
    const [local, api, ...remotes] = await Promise.all([
      readLocal(),
      readApiHistory(),
      ...stores.map(readStore),
    ]);
    return { local, api, remotes };
  };

  const loadRegistry = async () => {
    const { local, api, remotes } = await gather();
    return merge([local, api, ...remotes].filter(Array.isArray));
  };

  const counted = () => {
    try {
      return sessionStorage.getItem("visitor-map-counted") === "1";
    } catch {
      return false;
    }
  };

  const markCounted = () => {
    try {
      sessionStorage.setItem("visitor-map-counted", "1");
    } catch {
      /* this page view is still counted for the session */
    }
  };

  const postVisit = async (point) => {
    const response = await fetch(`${visitorApi}/visit`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(point),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return normalize(data);
  };

  // Fail closed: without visitorApi, map stays read-only (no public ExtendsClass PUT).
  const record = async (places) => {
    if (!Array.isArray(places) || counted()) return places;
    if (!visitorApi) return places;

    let point = { key: "unknown", lat: null, lng: null, label: "Unknown" };
    try {
      const geo = await fetch("https://get.geojs.io/v1/ip/geo.json").then((response) => response.json());
      const lat = Number(geo.latitude);
      const lng = Number(geo.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        point = {
          key: `${lat.toFixed(1)},${lng.toFixed(1)}`,
          lat: Number(lat.toFixed(1)),
          lng: Number(lng.toFixed(1)),
          label: [geo.city, geo.country].filter(Boolean).join(", ") || "Visit",
        };
      }
    } catch {
      /* Worker may still geolocate via CF; unknown is acceptable */
    }

    try {
      const saved = await postVisit(point);
      if (!saved) return places;
      markCounted();
      return merge([places, saved]);
    } catch {
      return places;
    }
  };

  let shown = [];
  let signature = "";

  const fingerprint = (places) =>
    places
      .map((place) => `${place.key}:${Number(place.n) || 0}:${place.label || ""}`)
      .sort()
      .join("|");

  const publish = (places) => {
    if (!dots) return;
    const next = merge([shown, places]);
    const nextSignature = fingerprint(next);
    if (nextSignature === signature) return;
    signature = nextSignature;
    shown = next;
    draw(next);
  };

  const watch = async (withCounts) => {
    let places = await loadRegistry();
    if (withCounts) places = await syncCounts(places);
    publish(places);
  };

  loadRegistry()
    .then((places) => (dots ? syncCounts(places) : places))
    .then(record)
    .then(publish)
    .catch(async () => {
      try {
        publish(await readLocal());
      } catch {
        if (note) note.textContent = "The visitor map could not load.";
      }
    });

  if (dots) {
    let ticks = 0;
    window.setInterval(() => {
      ticks += 1;
      watch(ticks % 3 === 0).catch(() => {});
    }, 10000);
  }
})();
