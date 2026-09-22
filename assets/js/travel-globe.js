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

    const phone = window.matchMedia("(max-width: 734px)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    // Stack duplicate / round-trip arcs by altitude so they don't tangle,
    // but keep each route's original distance-based height (long-haul stays high).
    const routeBuckets = new Map();
    flights.arcs.forEach((arc) => {
      const key = [arc.from, arc.to].sort().join("||");
      if (!routeBuckets.has(key)) routeBuckets.set(key, []);
      routeBuckets.get(key).push(arc);
    });
    routeBuckets.forEach((list) => {
      list.sort((a, b) => {
        if (a.from !== b.from) return a.from < b.from ? -1 : 1;
        if (a.to !== b.to) return a.to < b.to ? -1 : 1;
        return (a.gap || 0) - (b.gap || 0);
      });
      const n = list.length;
      const step = n > 1 ? Math.min(0.022, 0.28 / Math.max(1, n - 1)) : 0;
      list.forEach((arc, i) => {
        const orig = Number.isFinite(arc.alt) ? arc.alt : 0.12;
        const dirLift = arc.from <= arc.to ? 0 : step * 0.4;
        arc.alt = orig + i * step + dirLift;
      });
    });

    const tracks = flights.arcs.map((arc) => ({ ...arc, kind: "track" }));
    const pulses = phone
      ? []
      : flights.arcs.map((arc, i) => ({
          ...arc,
          kind: "pulse",
          gap: arc.gap ?? (i * 0.13) % 1,
        }));

    const dayMap = "https://cdn.jsdelivr.net/npm/three-globe@2.44.1/example/img/earth-blue-marble.jpg";
    const nightMap = "https://cdn.jsdelivr.net/npm/three-globe@2.44.1/example/img/earth-night.jpg";
    const isDark = () => {
      const root = document.documentElement;
      const setting = root.getAttribute("data-theme-setting");
      if (setting === "dark") return true;
      if (setting === "light") return false;
      return root.getAttribute("data-theme") === "dark" || window.matchMedia("(prefers-color-scheme: dark)").matches;
    };
    const applyGlobeTheme = (globe) => {
      const dark = isDark();
      globe.globeImageUrl(dark ? nightMap : dayMap);
      globe.atmosphereColor(dark ? "#5aa7ff" : "#8ec8ff");
      globe.atmosphereAltitude(dark ? 0.22 : 0.18);
      const material = globe.globeMaterial();
      if (material && "emissive" in material) {
        material.emissive.setHex(dark ? 0x0b1220 : 0x3a4d66);
        material.emissiveIntensity = dark ? 0.18 : 0.35;
      }
    };

    const globe = Globe()(mount)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl(isDark() ? nightMap : dayMap)
      .atmosphereColor(isDark() ? "#5aa7ff" : "#8ec8ff")
      .atmosphereAltitude(isDark() ? 0.22 : 0.18)
      .showGraticules(false)
      .polygonsData(regions.features)
      .polygonGeoJsonGeometry((d) => d.geometry)
      .polygonCapColor((d) => {
        if (d.properties.visited) return "rgba(232, 168, 56, 0.62)";
        if (d.properties.kind === "polar") return "rgba(170, 210, 255, 0.1)";
        return "rgba(255,255,255,0.06)";
      })
      .polygonSideColor((d) => {
        if (d.properties.visited) return "rgba(232, 168, 56, 0.28)";
        if (d.properties.kind === "polar") return "rgba(140, 190, 240, 0.16)";
        return "rgba(255,255,255,0.05)";
      })
      .polygonStrokeColor((d) => {
        if (d.properties.visited) return "rgba(255, 236, 190, 0.95)";
        if (d.properties.kind === "polar") return "rgba(170, 210, 255, 0.78)";
        return "rgba(255,255,255,0.22)";
      })
      .polygonAltitude((d) => {
        if (d.properties.visited) return 0.012;
        if (d.properties.kind === "polar") return 0.007;
        return 0.003;
      })
      .polygonLabel((d) => {
        const extra = d.properties.parent
          ? `<div class="travel-tip-sub">${d.properties.parent}</div>`
          : "";
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
          : ["#0071e3", "#e8a838"]
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
      .pointColor(() => "#e8a838")
      .pointLabel((d) => `<div class="travel-tip"><div class="travel-tip-name">${d.city}</div></div>`)
      .pointOfView({ lat: 32, lng: 88, altitude: phone ? 2.55 : 2.15 }, 0);

    const material = globe.globeMaterial();
    if (material) material.color.setHex(0xffffff);
    applyGlobeTheme(globe);
    const themeWatcher = new MutationObserver(() => applyGlobeTheme(globe));
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-theme-setting"] });
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = coarse ? 0.45 : 0.35;
    globe.controls().enableDamping = true;
    globe.controls().enableZoom = !coarse;
    globe.controls().rotateSpeed = coarse ? 0.55 : 0.4;
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2));
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
    mount.addEventListener("pointerup", () => setTimeout(resume, 1400));
    mount.addEventListener("pointerleave", resume);
    mount.style.touchAction = "none";

    window.addEventListener("resize", () => fit(globe));
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => fit(globe));
    }
  };

  init().catch((err) => {
    console.error(err);
    setStatus("The globe could not load in this browser.");
  });
})();
