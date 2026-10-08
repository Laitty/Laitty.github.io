/**
 * Cloudflare Worker: authenticated visitor-map writes.
 *
 * Public:
 *   POST /visit   → record one visit (Worker holds ExtendsClass + Abacus secrets)
 *   GET  /history → proxy-read merged places from ExtendsClass bins
 *
 * Admin (Authorization: Bearer WRITE_TOKEN):
 *   PUT  /history → merge body into ExtendsClass bins (rejects empty wipe)
 *
 * Secrets (wrangler secret put …):
 *   WRITE_TOKEN, EXTENDSCLASS_A, EXTENDSCLASS_B
 * Optional secrets / vars:
 *   ABACUS_BASE, ABACUS_NAMESPACE
 */

const ALLOWED_ORIGINS = new Set([
  "https://laitty.github.io",
  "http://localhost:4000",
  "http://127.0.0.1:4000",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
]);

/** Per-isolate rate limit for POST /visit (best-effort on free tier). */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;
const rateBuckets = new Map();

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://laitty.github.io";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(request, body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request), ...extra },
  });
}

function normalize(data) {
  const places = Array.isArray(data) ? data : data && data.places;
  return Array.isArray(places) ? places : [];
}

function pack(places) {
  return places.map((place) => {
    const lat = Number(place.lat);
    const lng = Number(place.lng);
    const located = Number.isFinite(lat) && Number.isFinite(lng);
    return {
      key: place.key,
      n: Number(place.n) || 0,
      lat: located ? Number(lat.toFixed(1)) : null,
      lng: located ? Number(lng.toFixed(1)) : null,
      label: place.label || "Visit",
    };
  });
}

function merge(lists) {
  const byKey = new Map();
  for (const place of lists.flat()) {
    if (!place || !place.key) continue;
    const lat = Number(place.lat);
    const lng = Number(place.lng);
    const located = Number.isFinite(lat) && Number.isFinite(lng);
    if (place.key !== "unknown" && !located) continue;
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
  }
  return [...byKey.values()];
}

function authorized(request, env) {
  const token = env.WRITE_TOKEN;
  if (!token) return false;
  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return Boolean(match && match[1] === token);
}

function clientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function rateLimited(ip) {
  const now = Date.now();
  let bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.start >= RATE_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    rateBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  if (rateBuckets.size > 5000) {
    for (const [key, value] of rateBuckets) {
      if (now - value.start >= RATE_WINDOW_MS) rateBuckets.delete(key);
    }
  }
  return bucket.count > RATE_MAX;
}

function storeUrls(env) {
  const a = (env.EXTENDSCLASS_A || "").replace(/\/$/, "");
  const b = (env.EXTENDSCLASS_B || "").replace(/\/$/, "");
  return [a, b].filter(Boolean);
}

function abacusBase(env) {
  return (env.ABACUS_BASE || "https://abacus.jasoncameron.dev").replace(/\/$/, "");
}

function abacusNamespace(env) {
  return env.ABACUS_NAMESPACE || "laitty-github-io-visits";
}

function counterKey(key) {
  return String(key).replace(/,/g, "_");
}

async function readStore(url) {
  try {
    const response = await fetch(`${url}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return normalize(await response.json());
  } catch {
    return null;
  }
}

async function writeStore(url, places) {
  const packed = pack(places);
  if (!packed.length) {
    const remote = await readStore(url);
    if (Array.isArray(remote) && remote.length) {
      return { ok: false, skipped: "refuse empty overwrite" };
    }
  }
  const response = await fetch(url, {
    method: "PUT",
    cache: "no-store",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ places: packed }),
  });
  return { ok: response.ok, status: response.status };
}

async function writeAllStores(env, places) {
  const urls = storeUrls(env);
  if (!urls.length) return { ok: false, error: "no ExtendsClass store secrets configured" };
  const results = await Promise.all(urls.map((url) => writeStore(url, places).catch(() => ({ ok: false }))));
  return { ok: results.some((r) => r && r.ok), results };
}

async function loadMerged(env) {
  const urls = storeUrls(env);
  const remotes = await Promise.all(urls.map(readStore));
  return merge(remotes.filter(Array.isArray));
}

async function hitAbacus(env, key) {
  const url = `${abacusBase(env)}/hit/${abacusNamespace(env)}/${encodeURIComponent(counterKey(key))}`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return Number((await response.json()).value) || 0;
  } catch {
    return null;
  }
}

function pointFromBody(body, request) {
  if (body && typeof body === "object") {
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const key = typeof body.key === "string" && body.key ? body.key : null;
    if (key === "unknown") {
      return { key: "unknown", lat: null, lng: null, label: body.label || "Unknown" };
    }
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const roundedLat = Number(lat.toFixed(1));
      const roundedLng = Number(lng.toFixed(1));
      return {
        key: key || `${roundedLat},${roundedLng}`,
        lat: roundedLat,
        lng: roundedLng,
        label: (typeof body.label === "string" && body.label) || "Visit",
      };
    }
  }

  const cf = request.cf || {};
  const lat = Number(cf.latitude);
  const lng = Number(cf.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const roundedLat = Number(lat.toFixed(1));
    const roundedLng = Number(lng.toFixed(1));
    const label = [cf.city, cf.country].filter(Boolean).join(", ") || "Visit";
    return { key: `${roundedLat},${roundedLng}`, lat: roundedLat, lng: roundedLng, label };
  }

  return { key: "unknown", lat: null, lng: null, label: "Unknown" };
}

function pathOf(url) {
  const path = url.pathname.replace(/\/$/, "") || "/";
  return path;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const url = new URL(request.url);
    const path = pathOf(url);

    if (path === "/" && request.method === "GET") {
      return json(request, {
        ok: true,
        service: "laitty-visitor-api",
        endpoints: ["GET /history", "POST /visit", "PUT /history"],
      });
    }

    if (path === "/history" && request.method === "GET") {
      if (!storeUrls(env).length) {
        return json(request, { error: "stores not configured" }, 503);
      }
      const places = await loadMerged(env);
      return json(request, { places });
    }

    if (path === "/history" && request.method === "PUT") {
      if (!authorized(request, env)) {
        return json(request, { error: "unauthorized" }, 401);
      }
      if (!storeUrls(env).length) {
        return json(request, { error: "stores not configured" }, 503);
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return json(request, { error: "invalid json" }, 400);
      }
      const incoming = normalize(body);
      const existing = await loadMerged(env);
      if (!incoming.length && existing.length) {
        return json(request, { error: "refuse empty overwrite of non-empty store" }, 409);
      }
      const places = merge([existing, incoming]);
      const written = await writeAllStores(env, places);
      if (!written.ok) {
        return json(request, { error: "store write failed", places }, 502);
      }
      return json(request, { places, ok: true });
    }

    if (path === "/visit" && request.method === "POST") {
      if (!storeUrls(env).length) {
        return json(request, { error: "stores not configured" }, 503);
      }
      if (rateLimited(clientIp(request))) {
        return json(request, { error: "rate limited" }, 429);
      }

      let body = null;
      try {
        const text = await request.text();
        body = text ? JSON.parse(text) : null;
      } catch {
        return json(request, { error: "invalid json" }, 400);
      }

      const point = pointFromBody(body, request);
      const hit = await hitAbacus(env, point.key);
      const existingPlaces = await loadMerged(env);
      const existing = existingPlaces.find((place) => place.key === point.key);
      const n =
        hit != null ? hit : (Number(existing && existing.n) || 0) + 1;
      const nextPlace = {
        ...point,
        n: Math.max(n, Number(existing && existing.n) || 0),
        label: (existing && existing.label) || point.label,
      };
      const places = existing
        ? existingPlaces.map((place) => (place.key === point.key ? { ...place, ...nextPlace } : place))
        : [...existingPlaces, nextPlace];

      // Dual-mirror heal: always write the merged registry to both bins.
      const written = await writeAllStores(env, places);
      if (!written.ok && hit == null) {
        return json(request, { error: "store write failed", places: existingPlaces }, 502);
      }
      return json(request, { places, ok: true, stored: Boolean(written.ok) });
    }

    return json(request, { error: "not found" }, 404);
  },
};
