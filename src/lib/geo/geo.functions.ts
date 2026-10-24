import { createServerFn } from "@tanstack/react-start";

interface NominatimReverse {
  address?: { city?: string; town?: string; village?: string; state?: string; country?: string };
  display_name?: string;
}

/**
 * Reverse-geocode browser geolocation coordinates via OpenStreetMap Nominatim
 * (no API key). Returns a "City, State" label or null when lookup fails.
 */
export const reverseGeocode = createServerFn({ method: "GET" })
  .inputValidator((d: { lat: number; lon: number }) => d)
  .handler(async ({ data }) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${data.lat}&lon=${data.lon}&zoom=10`,
        { headers: { "User-Agent": "YatraAI/1.0 (https://yatra-vibe-finder.onrender.com)" } },
      );
      if (!r.ok) return { label: null };
      const j = (await r.json()) as NominatimReverse;
      const a = j.address;
      const place = a?.city ?? a?.town ?? a?.village;
      const label = place ? `${place}${a?.state ? `, ${a.state}` : ""}` : (j.display_name?.split(",").slice(0, 2).join(",") ?? null);
      return { label };
    } catch {
      return { label: null };
    }
  });
