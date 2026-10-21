# Roadmap

## Destination galleries (carried over)
- [ ] 24 destinations have 1–3 asset-pointer photos; 24 have only the single Commons image.
- [ ] Get 3 verified Commons photos each for the 24 missing + supplements for thin galleries (subagent).
- [ ] Wire galleries (pointers + Commons) into destinations.ts images/imageLabels.

## Realistic planner (new spec)
- [ ] Weather: Open-Meteo server fn (current + 16-day forecast), remove mockWeather from UI, live/unavailable labels, timestamps.
- [ ] Geolocation: Nominatim reverse-geocode server fn; planner shows "Using your location: City, State"; denial handled.
- [ ] Routing: OSRM road distance/duration server fn; islands show "Road route not applicable".
- [ ] Flights/hotels: Amadeus server fns gated on AMADEUS_CLIENT_ID/SECRET; "unavailable" labels without creds.
- [ ] Data: per-destination airport (IATA), altitude, food/local/activity cost ranges; verify coordinates.
- [ ] Engine: live vs estimated cost split, budget confidence, weather-unavailable handling, route-aware practicality.
- [ ] Planner form: inline validation, start/end dates, geolocation flow.
- [ ] Results: sort by match/cost/weather/distance/time, source labels, loading/error states.
- [ ] Detail page: live weather + timestamp, route info, flight/hotel availability, labelled estimates.
- [ ] Tests: scenarios A–D + rule tests; typecheck; build; browser verify.
- [ ] Final report: live vs static vs estimated vs unavailable; secrets needed.
