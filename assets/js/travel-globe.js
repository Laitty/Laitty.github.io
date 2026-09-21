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

    const globe = Globe()(mount)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("https://cdn.jsdelivr.net/npm/three-globe@2.44.1/example/img/earth-night.jpg")
      .atmosphereColor("#4aa3ff")
      .atmosphereAltitude(0.16)
      .showGraticules(false)
      .polygonsData(regions.features)
      .polygonGeoJsonGeometry((d) => d.geometry)
      .polygonCapColor((d) =>
        d.properties.visited ? "rgba(10,132,255,0.62)" : "rgba(255,255,255,0.035)"
      )
      .polygonSideColor((d) =>
        d.properties.visited ? "rgba(10,132,255,0.22)" : "rgba(255,255,255,0.03)"
      )
      .polygonStrokeColor((d) =>
        d.properties.visited ? "rgba(150,220,255,0.85)" : "rgba(255,255,255,0.12)"
      )
      .polygonAltitude((d) => (d.properties.visited ? 0.012 : 0.003))
      .polygonLabel(
        (d) =>
          `<div class="travel-tip"><strong>${d.properties.name}</strong>${
            d.properties.parent ? `<span>${d.properties.parent}</span>` : ""
          }</div>`
      )
      .arcsData(flights.arcs)
      .arcStartLat("startLat")
      .arcStartLng("startLng")
      .arcEndLat("endLat")
      .arcEndLng("endLng")
      .arcColor(() => ["rgba(186,230,255,0.15)", "#7dd3fc"])
      .arcStroke((d) => Math.min(0.45 + d.count * 0.12, 1.15))
      .arcAltitudeAutoScale(0.28)
      .arcDashLength(0.28)
      .arcDashGap(0.7)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(1600)
      .arcLabel((d) => `<div class="travel-tip"><strong>${d.from} → ${d.to}</strong></div>`)
      .pointsData(flights.airports)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude(0.01)
      .pointRadius(0.16)
      .pointColor(() => "#f5f5f7")
      .pointLabel((d) => `<div class="travel-tip"><strong>${d.city}</strong><span>${d.id}</span></div>`)
      .pointOfView({ lat: 32, lng: 88, altitude: 2.15 }, 0);

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.35;
    globe.controls().enableDamping = true;
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
