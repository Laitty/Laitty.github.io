(() => {
  const mount = document.getElementById("travel-globe");
  if (!mount) return;

  const status = mount.parentElement.querySelector(".travel-globe-status");
  const setStatus = (text) => {
    if (!status) return;
    status.textContent = text || "";
    status.hidden = !text;
  };

  const waitForGlobe = () =>
    new Promise((resolve, reject) => {
      let n = 0;
      const tick = () => {
        if (typeof Globe === "function") return resolve();
        if (++n > 80) return reject(new Error("Globe library failed to load"));
        setTimeout(tick, 50);
      };
      tick();
    });

  const fit = (globe) => {
    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 520;
    globe.width(width).height(height);
  };

  const init = async () => {
    await waitForGlobe();
    const [regions, flights] = await Promise.all([
      fetch(mount.dataset.regions).then((r) => r.json()),
      fetch(mount.dataset.flights).then((r) => r.json()),
    ]);

    const tracks = flights.arcs.map((arc) => ({ ...arc, kind: "track" }));
    const pulses = flights.arcs.map((arc, i) => ({
      ...arc,
      kind: "pulse",
      gap: arc.gap ?? (i * 0.13) % 1,
    }));

    const globe = Globe()(mount)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("https://cdn.jsdelivr.net/npm/three-globe@2.44.1/example/img/earth-blue-marble.jpg")
      .atmosphereColor("#8ec8ff")
      .atmosphereAltitude(0.18)
      .showGraticules(false)
      .polygonsData(regions.features)
      .polygonGeoJsonGeometry((d) => d.geometry)
      .polygonCapColor((d) =>
        d.properties.visited ? "rgba(0,145,255,0.52)" : "rgba(255,255,255,0.06)"
      )
      .polygonSideColor((d) =>
        d.properties.visited ? "rgba(0,145,255,0.28)" : "rgba(255,255,255,0.05)"
      )
      .polygonStrokeColor((d) =>
        d.properties.visited ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)"
      )
      .polygonAltitude((d) => (d.properties.visited ? 0.012 : 0.003))
      .polygonLabel((d) => {
        const extra = d.properties.parent ? `<div class="travel-tip-sub">${d.properties.parent}</div>` : "";
        return `<div class="travel-tip"><div class="travel-tip-name">${d.properties.name}</div>${extra}</div>`;
      })
      .arcsData([...tracks, ...pulses])
      .arcStartLat("startLat")
      .arcStartLng("startLng")
      .arcEndLat("endLat")
      .arcEndLng("endLng")
      .arcColor((d) =>
        d.kind === "pulse"
          ? "rgba(255, 255, 255, 0.42)"
          : ["#7ec8ff", "#0055d4"]
      )
      .arcStroke((d) => (d.kind === "pulse" ? 0.28 : 0.46))
      .arcAltitude((d) => d.alt || 0.12)
      .arcDashLength((d) => (d.kind === "pulse" ? 0.035 : 1))
      .arcDashGap((d) => (d.kind === "pulse" ? 1.2 : 0))
      .arcDashInitialGap((d) => (d.kind === "pulse" ? d.gap : 0))
      .arcDashAnimateTime((d) => (d.kind === "pulse" ? 2800 : 0))
      .arcLabel((d) =>
        d.kind === "track"
          ? `<div class="travel-tip"><div class="travel-tip-name">${d.from} → ${d.to}</div></div>`
          : ""
      )
      .pointsData(flights.airports)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude(0.012)
      .pointRadius(0.22)
      .pointColor(() => "#0071e3")
      .pointLabel((d) => `<div class="travel-tip"><div class="travel-tip-name">${d.city}</div></div>`)
      .pointOfView({ lat: 32, lng: 88, altitude: 2.15 }, 0);

    const material = globe.globeMaterial();
    if (material) {
      material.color.setHex(0xffffff);
      if ("emissive" in material) {
        material.emissive.setHex(0x3a4d66);
        material.emissiveIntensity = 0.35;
      }
    }
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.35;
    globe.controls().enableDamping = true;
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ("toneMappingExposure" in globe.renderer()) {
      globe.renderer().toneMappingExposure = 1.35;
    }
    fit(globe);
    setStatus("");

    const pause = () => {
      globe.controls().autoRotate = false;
    };
    const resume = () => {
      globe.controls().autoRotate = true;
    };
    mount.addEventListener("pointerdown", pause);
    mount.addEventListener("pointerleave", resume);

    window.addEventListener("resize", () => fit(globe));
  };

  init().catch((err) => {
    console.error(err);
    setStatus("The globe could not load in this browser.");
  });
})();
