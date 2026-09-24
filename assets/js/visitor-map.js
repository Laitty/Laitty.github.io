(() => {
  const root = document.getElementById("visitor-map");
  if (!root) return;

  const api = (root.dataset.api || "").replace(/\/$/, "");
  const stage = root.querySelector(".visitor-map-stage");
  const note = root.querySelector(".visitor-map-note");
  if (!api || !stage) return;

  const land = document.createElement("img");
  land.className = "visitor-map-land";
  land.alt = "";
  land.draggable = false;
  land.src = root.dataset.map;
  const dots = document.createElement("div");
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

  const draw = (places) => {
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

    ranked.forEach((place) => {
      const pin = document.createElement("span");
      pin.className = "visitor-map-pin";
      pin.style.left = `${((place.lng + 180) / 360) * 100}%`;
      pin.style.top = `${((90 - place.lat) / 180) * 100}%`;
      const size = Math.min(18, 7 + Math.sqrt(place.count) * 2.2);
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

    const total = ranked.reduce((sum, place) => sum + place.count, 0);
    if (note) {
      note.textContent = total
        ? `${total} cumulative ${total === 1 ? "visit" : "visits"}`
        : "Cumulative visits will show up here.";
    }
  };

  const load = () => fetch(`${api}/places`).then((response) => response.json());

  const record = async (places) => {
    if (!Array.isArray(places)) return [];
    if (sessionStorage.getItem("visitor-map-counted")) return places;

    let geo;
    try {
      geo = await fetch("https://get.geojs.io/v1/ip/geo.json").then((response) => response.json());
    } catch {
      return places;
    }

    const lat = Number(geo.latitude);
    const lng = Number(geo.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return places;

    const key = `${lat.toFixed(1)},${lng.toFixed(1)}`;
    const label = [geo.city, geo.country].filter(Boolean).join(", ") || "Visit";
    const existing = places.find((place) => place.key === key);
    sessionStorage.setItem("visitor-map-counted", "1");

    if (existing) {
      const body = {
        key,
        n: (Number(existing.n) || 0) + 1,
        lat: Number(lat.toFixed(1)),
        lng: Number(lng.toFixed(1)),
        label: existing.label || label,
      };
      const response = await fetch(`${api}/places/${existing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) return places;
      return places.map((place) => (place._id === existing._id ? { ...place, ...body } : place));
    }

    const body = {
      key,
      n: 1,
      lat: Number(lat.toFixed(1)),
      lng: Number(lng.toFixed(1)),
      label,
    };
    const response = await fetch(`${api}/places`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return places;
    return [...places, await response.json()];
  };

  load()
    .then(record)
    .then(draw)
    .catch(() => {
      if (note) note.textContent = "The visitor map could not load.";
    });
})();
