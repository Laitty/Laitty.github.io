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
  land.src = root.dataset.map;
  const dots = document.createElement("div");
  dots.className = "visitor-map-dots";
  stage.append(land, dots);

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
      pin.innerHTML = `<span class="visitor-map-dot" style="width:${size}px;height:${size}px"></span><span class="visitor-map-count">${place.count}</span>`;
      pin.title = `${place.label} · ${place.count}`;
      pin.setAttribute("aria-label", pin.title);
      dots.append(pin);
    });

    let list = root.querySelector(".visitor-map-list");
    if (!list) {
      list = document.createElement("ol");
      list.className = "visitor-map-list";
      note.before(list);
    }
    list.replaceChildren();
    ranked.forEach((place) => {
      const item = document.createElement("li");
      item.innerHTML = `<span>${place.label}</span><strong>${place.count}</strong>`;
      list.append(item);
    });

    const total = ranked.reduce((sum, place) => sum + place.count, 0);
    if (note) {
      note.textContent = total
        ? `${total} ${total === 1 ? "visit" : "visits"} on this page`
        : "Visits to this page will show up here.";
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
