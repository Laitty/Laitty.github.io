/**
 * Optional Cloudflare Worker for visitor-map history.
 * Scaffold only — not used by the live site until you deploy + rewire.
 *
 * GET  /history          → { places }
 * PUT  /history + Bearer → merge into KV (rejects empty wipe)
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extra },
  });
}

function normalize(data) {
  const places = Array.isArray(data) ? data : data && data.places;
  return Array.isArray(places) ? places : [];
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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/history" && url.pathname !== "/") {
      return json({ error: "not found" }, 404);
    }

    if (!env.VISITOR_HISTORY) {
      return json(
        {
          error: "KV binding VISITOR_HISTORY missing — see tools/visitor-api/README.md",
        },
        503
      );
    }

    if (request.method === "GET") {
      if (env.ALLOW_PUBLIC_GET === "false" && !authorized(request, env)) {
        return json({ error: "unauthorized" }, 401);
      }
      const raw = await env.VISITOR_HISTORY.get("places", "json");
      return json({ places: normalize(raw) });
    }

    if (request.method === "PUT") {
      if (!authorized(request, env)) {
        return json({ error: "unauthorized" }, 401);
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "invalid json" }, 400);
      }
      const incoming = normalize(body);
      const existing = normalize(await env.VISITOR_HISTORY.get("places", "json"));
      if (!incoming.length && existing.length) {
        return json({ error: "refuse empty overwrite of non-empty store" }, 409);
      }
      const places = merge([existing, incoming]);
      await env.VISITOR_HISTORY.put("places", JSON.stringify({ places }));
      return json({ places, ok: true });
    }

    return json({ error: "method not allowed" }, 405);
  },
};
