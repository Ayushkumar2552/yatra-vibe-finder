import { createServerFn } from "@tanstack/react-start";

/**
 * Amadeus travel APIs (test environment). Requires the secrets
 * AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET. Without them every function
 * returns { available: false } and the UI shows "Live … unavailable".
 * Nothing is ever fabricated.
 */

const BASE = "https://test.api.amadeus.com";

async function amadeusToken(): Promise<string | null> {
  const id = process.env["AMADEUS_CLIENT_ID"];
  const secret = process.env["AMADEUS_CLIENT_SECRET"];
  if (!id || !secret) return null;
  try {
    const r = await fetch(`${BASE}/v1/security/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { access_token?: string };
    return j.access_token ?? null;
  } catch {
    return null;
  }
}

export interface FlightOffer {
  airline: string; // carrier code
  price: number; currency: string;
  departAt: string; arriveAt: string; duration: string; stops: number;
  fetchedAt: string;
}

interface AmadeusFlightResponse {
  data?: {
    itineraries: { duration: string; segments: { departure: { at: string }; arrival: { at: string }; carrierCode: string }[] }[];
    price: { total: string; currency: string };
  }[];
}

/** Live flight fares: cheapest offer for origin→destination IATA codes. */
export const searchFlights = createServerFn({ method: "POST" })
  .inputValidator((d: { from: string; to: string; date: string; adults: number }) => d)
  .handler(async ({ data }) => {
    const token = await amadeusToken();
    if (!token) return { available: false as const, offers: [] as FlightOffer[] };
    try {
      const u = `${BASE}/v2/shopping/flight-offers?originLocationCode=${data.from}&destinationLocationCode=${data.to}` +
        `&departureDate=${data.date}&adults=${Math.max(1, data.adults)}&currencyCode=INR&max=3&nonStop=false`;
      const r = await fetch(u, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return { available: false as const, offers: [] as FlightOffer[] };
      const j = (await r.json()) as AmadeusFlightResponse;
      const offers: FlightOffer[] = (j.data ?? []).map((o) => {
        const segs = o.itineraries[0]?.segments ?? [];
        const first = segs[0], last = segs[segs.length - 1];
        return {
          airline: first?.carrierCode ?? "—",
          price: Math.round(Number(o.price.total)), currency: o.price.currency,
          departAt: first?.departure.at ?? "", arriveAt: last?.arrival.at ?? "",
          duration: o.itineraries[0]?.duration ?? "", stops: Math.max(0, segs.length - 1),
          fetchedAt: new Date().toISOString(),
        };
      });
      return { available: offers.length > 0, offers };
    } catch {
      return { available: false as const, offers: [] as FlightOffer[] };
    }
  });

export interface HotelOffer {
  name: string; pricePerNight: number; total: number; currency: string; fetchedAt: string;
}

interface AmadeusHotelList { data?: { hotelId: string }[] }
interface AmadeusHotelOffers {
  data?: { hotel: { name: string }; offers?: { price: { total: string; currency: string } }[] }[];
}

/** Live hotel prices: cheapest offers in a city (IATA city code). */
export const searchHotels = createServerFn({ method: "POST" })
  .inputValidator((d: { cityCode: string; checkIn: string; checkOut: string; adults: number; rooms: number }) => d)
  .handler(async ({ data }) => {
    const token = await amadeusToken();
    if (!token) return { available: false as const, offers: [] as HotelOffer[] };
    try {
      const listR = await fetch(`${BASE}/v1/reference-data/locations/hotels/by-city?cityCode=${data.cityCode}&radius=20&radiusUnit=KM`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!listR.ok) return { available: false as const, offers: [] as HotelOffer[] };
      const list = (await listR.json()) as AmadeusHotelList;
      const ids = (list.data ?? []).slice(0, 15).map((h) => h.hotelId);
      if (!ids.length) return { available: false as const, offers: [] as HotelOffer[] };
      const u = `${BASE}/v3/shopping/hotel-offers?hotelIds=${ids.join(",")}&checkInDate=${data.checkIn}&checkOutDate=${data.checkOut}` +
        `&adults=${Math.max(1, data.adults)}&roomQuantity=${Math.max(1, data.rooms)}&currency=INR`;
      const r = await fetch(u, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return { available: false as const, offers: [] as HotelOffer[] };
      const j = (await r.json()) as AmadeusHotelOffers;
      const nights = Math.max(1, Math.round((Date.parse(data.checkOut) - Date.parse(data.checkIn)) / 86400000));
      const offers: HotelOffer[] = (j.data ?? []).flatMap((h) => {
        const o = h.offers?.[0];
        if (!o) return [];
        const total = Math.round(Number(o.price.total));
        return [{ name: h.hotel.name, pricePerNight: Math.round(total / nights), total, currency: o.price.currency, fetchedAt: new Date().toISOString() }];
      }).slice(0, 3);
      return { available: offers.length > 0, offers };
    } catch {
      return { available: false as const, offers: [] as HotelOffer[] };
    }
  });

/** Lets the UI know whether live travel pricing is configured, without calling the APIs. */
export const travelProviderStatus = createServerFn({ method: "GET" }).handler(async () => ({
  amadeus: !!(process.env["AMADEUS_CLIENT_ID"] && process.env["AMADEUS_CLIENT_SECRET"]),
}));
