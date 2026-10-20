# Remix of Yatra AI Explorer

Build a polished full-stack India AI travel destination recommendation website inspired by the interaction/design quality of mindtrip.ai, but with an original brand, original copy, and clearly distinct layout/details (do not copy Mindtrip branding, logo, or proprietary assets). The user supplied three screenshots as visual references showing the desired immersive full-width travel hero aesthetic: one beach/pool scene, one orange vintage van with a couple by the ocean, and one desert/camel scene. Recreate that FEEL with replaceable hero media slots and smooth crossfading/auto-rotating background video support. IMPORTANT: the screenshots themselves are reference images, not the original videos. Build the media architecture so the owner can drop in beach.mp4, roadtrip.mp4, and desert.mp4 later; provide tasteful fallback hero imagery/gradients if videos are absent. Do not claim to have copied the exact videos from mindtrip.ai.

Project concept/name: YatraAI (or a similarly original premium India-travel name). Main headline could be “India, picked for your mood.” / “Find the trip that fits you.” Hero should be cinematic, nearly full viewport, transparent/floating nav over media, large bold typography, premium whitespace, rounded pill controls, subtle animations. Navbar: logo, Explore, Beaches, Mountains, Heritage, Road Trips, AI Planner, Weather; right side Saved Trips and “Plan my trip” CTA. No cookie banner needed.

CORE PRODUCT: AI/rule-based destination recommender for travel within India. User inputs current/start location, total budget in INR, number of travelers, trip duration, preferred travel vibe/categories, preferred climate, travel month/dates, transport preference, and optionally “use current weather”. Fetch/live-weather integration should be architected cleanly using a weather API environment variable, with a mock/fallback weather provider so the app runs immediately without keys. Show current temperature, condition, feels-like and a weather suitability indicator for recommendations. If browser geolocation permission is available, allow “Use my location”; otherwise manual city selection. Never silently assume exact location.

Recommendation engine: implement a transparent weighted/rule-based scoring system appropriate for an AI college mini-project. Rank destinations using budget fit, weather suitability, distance/travel practicality, user vibe/interests, seasonality, duration, and group type. Show match percentage and a “Why this fits you” explanation with the factors/rules that fired. Keep the rule engine/data separated from UI so it can be explained in a viva. Include forward-chaining-style rules or explicit IF/THEN rules in code and an optional “How AI decided” expandable panel. Do not pretend the rule-based model is generative AI.

DESTINATION DATA: Seed a substantial India dataset (at least 35–50 destinations) across categories. Must include Goa, Lakshadweep, Andaman & Nicobar, Gokarna, Pondicherry/Puducherry, Varkala, Kovalam for beaches; Manali, Shimla, Mussoorie, Nainital, Darjeeling, Munnar, Ooty, Coorg, Kodaikanal, Gangtok for hill stations; Leh-Ladakh, Spiti Valley, Kashmir/Gulmarg/Pahalgam, Auli, Rishikesh and key Uttarakhand mountain destinations for mountains/adventure; Varanasi/Kashi, Ayodhya, Jaipur, Udaipur, Jodhpur, Jaisalmer, Agra, Hampi, Khajuraho, Amritsar, Mysuru, Sanchi and other heritage/spiritual options; plus popular nature/mind-refreshment places like Meghalaya/Shillong/Cherrapunji, Kaziranga, Rann of Kutch, Kerala/Alleppey, Wayanad. Each record should include state/UT, categories/vibes, climate tags, best months, approximate daily budget tiers per person, typical trip length, latitude/longitude, hero/photo URL or fallback, highlights, and weather suitability rules. Clearly label budget numbers as estimates, not live booking quotes.

RESULT EXPERIENCE: On submit, transition to a beautiful results section/page with top 3 hero recommendations plus additional matches. Each destination card should show image, destination/state, match %, current weather/temp if available, estimated total trip budget (for selected people/days), best time, suggested days, key experiences, and badges such as Beach / Heritage / Adventure / Relax. Add filters and sorting for match, budget, weather, and category. Provide a budget breakdown: stay, food, local transport, activities, intercity travel estimate. Use reasonable demo heuristics and visibly say “Estimated”. Add a simple day-wise itinerary generator using curated destination activities/rules. Add Save/Favorite using local storage.

PAGES/SECTIONS: immersive Home; AI Planner wizard; Explore India grid; Destination detail page; Weather-aware recommendations; Saved Trips; About/How it works. On home below hero, include a prominent conversational planner/search box (“Where should I go in India?”) and quick prompt pills such as “Beach escape under ₹20k”, “Cool mountains this weekend”, “3-day heritage trip”, “Peaceful spiritual break”, “Road trip from Pune”. Then category strips/cards for Beaches, Mountains, Heritage & Spiritual, Desert, Nature, Road Trips.

VISUAL DESIGN: premium editorial travel aesthetic, not generic Streamlit. Full-bleed media, black/cream typography, warm neutral surfaces, glassy overlay where appropriate, 24–32px rounded cards, large modern sans-serif headings, responsive mobile layout. Smooth hero media crossfade every ~7–10 seconds with pause/play and accessible reduced-motion behavior. Add subtle text transition synced to scenes: Beach → “Breathe by the blue.” Road trip → “Take the long way.” Desert → “Chase a different horizon.” Original wording only. Use Lucide icons. Avoid excessive gradients and dashboard-like clutter.

TECH: Lovable default React/TypeScript/Tailwind/shadcn stack. Organize components cleanly. Make all core demo functionality work without login or paid APIs. Add README/in-app developer note explaining where to put weather API key and hero mp4 files, how the scoring works, and which files contain destination data/rules. If a live weather key is missing, visibly mark weather as Demo/Estimated rather than fabricating live data. Provide robust loading/error states.

This is a college mini-project, so prioritize a working, impressive demonstration plus explainable AI. The site should feel production-quality and highly visual while remaining original and legally distinct from Mindtrip.





## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
