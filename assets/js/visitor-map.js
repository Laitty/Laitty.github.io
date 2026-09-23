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
    let total = 0;
    places.forEach((place) => {
      const count = Number(place.n) || 0;
      const lat = Number(place.lat);
      const lng = Number(place.lng);
      if (!count || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
      total += count;
      const dot = document.createElement("span");
      dot.className = "visitor-map-dot";
      dot.style.left = `${((lng + 180) / 360) * 100}%`;
      dot.style.top = `${((90 - lat) / 180) * 100}%`;
      const size = Math.min(16, 6 + Math.sqrt(count) * 2.4);
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      const label = place.label || "Visit";
      dot.title = `${label} · ${count}`;
      dot.setAttribute("aria-label", dot.title);
      dots.append(dot);
    });
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
