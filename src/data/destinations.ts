/**
 * YatraAI destination knowledge base.
 * All costs are ESTIMATES in INR per person per day (stay + food + local travel + activities).
 * They are demo heuristics, NOT live booking quotes.
 */
export type Category =
  | "beach" | "mountain" | "heritage" | "spiritual" | "desert"
  | "nature" | "adventure" | "roadtrip" | "relax" | "wildlife";

/** Climate zone drives the demo (mock) weather model and weather rules. */
export type Zone = "coastal" | "hill" | "southhill" | "alpine" | "plains" | "desert" | "northeast";

export interface Destination {
  id: string;
  name: string;
  state: string;
  zone: Zone;
  categories: Category[];
  bestMonths: number[]; // 1-12
  daily: { budget: number; mid: number; luxury: number };
  days: [number, number];
  lat: number;
  lon: number;
  highlights: string[];
  activities: string[];
  image?: string; // optional custom photo URL; falls back to category art
}

const d = (
  id: string, name: string, state: string, zone: Zone, categories: Category[], bestMonths: number[],
  daily: [number, number, number], days: [number, number], lat: number, lon: number,
  highlights: string[], activities: string[],
): Destination => ({ id, name, state, zone, categories, bestMonths, daily: { budget: daily[0], mid: daily[1], luxury: daily[2] }, days, lat, lon, highlights, activities });

const winter = [10, 11, 12, 1, 2, 3];

export const DESTINATIONS: Destination[] = [
  d("goa", "Goa", "Goa", "coastal", ["beach", "relax", "roadtrip"], [11, 12, 1, 2, 3], [2000, 4500, 12000], [3, 5], 15.3, 74.12,
    ["Palolem & Anjuna beaches", "Old Goa churches", "Fontainhas Latin quarter"],
    ["Sunset at Chapora Fort", "Scooter ride along the north coast", "Spice plantation lunch", "Dudhsagar falls trip", "Night market at Arpora", "Kayaking at Sal backwaters"]),
  d("lakshadweep", "Lakshadweep", "Lakshadweep (UT)", "coastal", ["beach", "relax", "nature"], [10, 11, 12, 1, 2, 3, 4], [5000, 9000, 18000], [4, 6], 10.57, 72.64,
    ["Agatti lagoon", "Bangaram island", "Coral reefs"],
    ["Snorkel the Agatti reef", "Glass-bottom boat ride", "Lagoon kayaking", "Island-hop to Bangaram", "Beach sunset picnic"]),
  d("andaman", "Andaman & Nicobar", "Andaman & Nicobar (UT)", "coastal", ["beach", "adventure", "nature"], [11, 12, 1, 2, 3, 4], [3000, 6000, 14000], [5, 7], 11.62, 92.73,
    ["Radhanagar beach", "Cellular Jail", "Neil island"],
    ["Scuba dive at Havelock", "Light & sound show at Cellular Jail", "Ferry to Neil island", "Sea walk at North Bay", "Mangrove kayaking"]),
  d("gokarna", "Gokarna", "Karnataka", "coastal", ["beach", "relax", "spiritual"], winter, [1200, 2800, 7000], [2, 4], 14.55, 74.32,
    ["Om beach", "Mahabaleshwar temple", "Half Moon beach"],
    ["Beach trek: Kudle to Paradise", "Mahabaleshwar temple visit", "Sunset at Om beach", "Cliffside café hopping"]),
  d("puducherry", "Puducherry", "Puducherry (UT)", "coastal", ["beach", "heritage", "relax"], winter, [1500, 3500, 8000], [2, 4], 11.94, 79.81,
    ["French Quarter", "Auroville", "Promenade beach"],
    ["Cycle the French Quarter", "Auroville Matrimandir view", "Surf lesson at Serenity beach", "Paradise beach boat"]),
  d("varkala", "Varkala", "Kerala", "coastal", ["beach", "relax", "spiritual"], winter, [1500, 3200, 8000], [3, 4], 8.73, 76.72,
    ["North Cliff", "Janardhana Swamy temple", "Papanasam beach"],
    ["Cliff-top sunset walk", "Ayurvedic massage", "Yoga by the sea", "Kappil backwater boating"]),
  d("kovalam", "Kovalam", "Kerala", "coastal", ["beach", "relax"], winter, [1700, 3500, 9000], [2, 4], 8.4, 76.98,
    ["Lighthouse beach", "Hawa beach", "Vizhinjam harbour"],
    ["Climb the Vizhinjam lighthouse", "Catamaran ride", "Ayurveda spa day", "Seafood dinner on the promenade"]),
  d("manali", "Manali", "Himachal Pradesh", "hill", ["mountain", "adventure", "roadtrip"], [3, 4, 5, 6, 10, 11, 12, 1], [1500, 3500, 9000], [4, 6], 32.24, 77.19,
    ["Solang valley", "Old Manali", "Atal Tunnel & Sissu"],
    ["Paragliding at Solang", "Hadimba temple walk", "Drive through Atal Tunnel", "River rafting on the Beas", "Old Manali café crawl", "Jogini falls hike"]),
  d("shimla", "Shimla", "Himachal Pradesh", "hill", ["mountain", "heritage", "relax"], [3, 4, 5, 6, 10, 11, 12], [1600, 3500, 9000], [3, 4], 31.1, 77.17,
    ["The Ridge & Mall Road", "Kalka–Shimla toy train", "Kufri"],
    ["Toy train ride", "Mall Road evening stroll", "Jakhoo temple hike", "Day trip to Kufri"]),
  d("mussoorie", "Mussoorie", "Uttarakhand", "hill", ["mountain", "relax"], [3, 4, 5, 6, 9, 10, 11], [1500, 3200, 8500], [2, 3], 30.46, 78.07,
    ["Gun Hill", "Kempty falls", "Landour"],
    ["Ropeway to Gun Hill", "Landour bakehouse walk", "Kempty falls dip", "Camel's Back Road sunset"]),
  d("nainital", "Nainital", "Uttarakhand", "hill", ["mountain", "relax", "nature"], [3, 4, 5, 6, 10, 11], [1500, 3200, 8000], [2, 4], 29.38, 79.46,
    ["Naini lake", "Snow View point", "Bhimtal"],
    ["Boating on Naini lake", "Cable car to Snow View", "Bhimtal & Sattal drive", "Tiffin Top hike"]),
  d("darjeeling", "Darjeeling", "West Bengal", "hill", ["mountain", "heritage", "nature"], [3, 4, 5, 10, 11], [1400, 3000, 8000], [3, 4], 27.04, 88.26,
    ["Tiger Hill sunrise", "Toy train", "Tea estates"],
    ["Tiger Hill sunrise over Kanchenjunga", "Himalayan toy train joyride", "Tea-tasting at Happy Valley", "Peace Pagoda visit"]),
  d("munnar", "Munnar", "Kerala", "southhill", ["mountain", "nature", "relax"], [9, 10, 11, 12, 1, 2, 3], [1500, 3200, 8500], [2, 4], 10.09, 77.06,
    ["Tea gardens", "Eravikulam park", "Mattupetty dam"],
    ["Tea museum tour", "Eravikulam Nilgiri tahr spotting", "Top Station viewpoint", "Jeep safari to Kolukkumalai"]),
  d("ooty", "Ooty", "Tamil Nadu", "southhill", ["mountain", "relax", "nature"], [3, 4, 5, 6, 10, 11], [1400, 3000, 8000], [2, 4], 11.41, 76.7,
    ["Nilgiri mountain railway", "Botanical garden", "Doddabetta peak"],
    ["Nilgiri toy train", "Botanical garden walk", "Doddabetta sunrise", "Pykara lake boating"]),
  d("coorg", "Coorg", "Karnataka", "southhill", ["nature", "relax", "mountain", "roadtrip"], [10, 11, 12, 1, 2, 3, 4], [1800, 4000, 10000], [2, 4], 12.42, 75.74,
    ["Abbey falls", "Coffee estates", "Dubare elephant camp"],
    ["Coffee plantation walk", "Abbey falls", "Dubare elephant camp", "Raja's Seat sunset", "Namdroling monastery"]),
  d("kodaikanal", "Kodaikanal", "Tamil Nadu", "southhill", ["mountain", "relax", "nature"], [3, 4, 5, 6, 9, 10], [1400, 3000, 8000], [2, 4], 10.24, 77.49,
    ["Kodai lake", "Coaker's Walk", "Pillar rocks"],
    ["Cycle around Kodai lake", "Coaker's Walk at dawn", "Pine forest walk", "Pillar rocks viewpoint"]),
  d("gangtok", "Gangtok", "Sikkim", "northeast", ["mountain", "nature", "spiritual"], [3, 4, 5, 10, 11, 12], [1600, 3500, 9000], [4, 5], 27.33, 88.61,
    ["Tsomgo lake", "Rumtek monastery", "Nathula pass"],
    ["Day trip to Tsomgo lake", "Rumtek monastery", "MG Marg evening", "Ropeway over Gangtok", "Nathula pass (permit)"]),
  d("leh", "Leh-Ladakh", "Ladakh (UT)", "alpine", ["mountain", "adventure", "roadtrip"], [5, 6, 7, 8, 9], [2000, 4500, 11000], [6, 8], 34.15, 77.58,
    ["Pangong Tso", "Nubra valley", "Khardung La"],
    ["Acclimatise in Leh market", "Shanti Stupa sunset", "Ride over Khardung La", "Camel safari in Nubra", "Camp at Pangong Tso", "Thiksey monastery morning prayer"]),
  d("spiti", "Spiti Valley", "Himachal Pradesh", "alpine", ["mountain", "adventure", "roadtrip"], [5, 6, 7, 8, 9, 10], [1500, 3200, 7000], [6, 8], 32.25, 78.03,
    ["Key monastery", "Chandratal lake", "Langza fossils"],
    ["Key monastery visit", "Hike to Chandratal", "Fossil hunting at Langza", "Stargazing in Kaza", "World's highest post office at Hikkim"]),
  d("gulmarg", "Gulmarg", "Jammu & Kashmir", "alpine", ["mountain", "adventure", "nature"], [12, 1, 2, 3, 4, 5, 6], [2000, 4500, 12000], [3, 4], 34.05, 74.38,
    ["Gondola", "Ski slopes", "Alpather lake"],
    ["Gulmarg Gondola phase 2", "Skiing or snowboarding", "Meadow pony ride", "Strawberry valley walk"]),
  d("pahalgam", "Pahalgam", "Jammu & Kashmir", "hill", ["mountain", "nature", "relax"], [4, 5, 6, 7, 8, 9, 10], [1800, 4000, 10000], [3, 4], 34.01, 75.32,
    ["Betaab valley", "Aru valley", "Lidder river"],
    ["Betaab valley picnic", "Aru valley hike", "Trout fishing on the Lidder", "Baisaran meadow ride"]),
  d("srinagar", "Srinagar", "Jammu & Kashmir", "hill", ["heritage", "relax", "nature"], [4, 5, 6, 9, 10], [1800, 4000, 10000], [3, 4], 34.08, 74.8,
    ["Dal lake houseboats", "Mughal gardens", "Old city"],
    ["Shikara ride at dawn", "Nishat & Shalimar gardens", "Houseboat stay", "Old-city walk & kahwa"]),
  d("auli", "Auli", "Uttarakhand", "alpine", ["mountain", "adventure"], [12, 1, 2, 3, 4, 5, 6], [1800, 3800, 9000], [3, 4], 30.53, 79.57,
    ["Auli ropeway", "Gorson Bugyal", "Nanda Devi views"],
    ["Ride the Auli ropeway", "Ski lessons (winter)", "Gorson Bugyal meadow trek", "Artificial lake viewpoint"]),
  d("rishikesh", "Rishikesh", "Uttarakhand", "plains", ["spiritual", "adventure", "relax"], [2, 3, 4, 5, 9, 10, 11], [1000, 2500, 7000], [2, 4], 30.09, 78.27,
    ["Ganga aarti", "Laxman Jhula", "Rafting"],
    ["White-water rafting", "Triveni Ghat aarti", "Morning yoga class", "Beatles ashram visit", "Neer Garh waterfall hike"]),
  d("chopta", "Chopta–Tungnath", "Uttarakhand", "alpine", ["mountain", "adventure", "nature"], [3, 4, 5, 9, 10, 11, 12], [1200, 2500, 5000], [3, 4], 30.48, 79.21,
    ["Tungnath temple", "Chandrashila summit", "Deoria Tal"],
    ["Trek to Tungnath", "Chandrashila sunrise summit", "Camp at Deoria Tal", "Birdwatching in the meadows"]),
  d("valley-of-flowers", "Valley of Flowers", "Uttarakhand", "alpine", ["nature", "adventure"], [7, 8, 9], [1200, 2500, 5000], [4, 6], 30.72, 79.6,
    ["Alpine flower meadows", "Hemkund Sahib", "Ghangaria"],
    ["Trek to Ghangaria", "Full day in the Valley", "Hemkund Sahib climb", "Govindghat river walk"]),
  d("varanasi", "Varanasi (Kashi)", "Uttar Pradesh", "plains", ["spiritual", "heritage"], winter, [1200, 2800, 8000], [2, 3], 25.32, 83.01,
    ["Dashashwamedh aarti", "Kashi Vishwanath", "Sarnath"],
    ["Sunrise boat on the Ganga", "Ganga aarti at Dashashwamedh", "Kashi Vishwanath darshan", "Sarnath day trip", "Old-city food walk"]),
  d("ayodhya", "Ayodhya", "Uttar Pradesh", "plains", ["spiritual", "heritage"], winter, [1200, 2500, 6000], [1, 2], 26.8, 82.2,
    ["Shri Ram Janmabhoomi Mandir", "Saryu ghats", "Hanuman Garhi"],
    ["Ram Mandir darshan", "Saryu aarti", "Hanuman Garhi visit", "Kanak Bhawan"]),
  d("jaipur", "Jaipur", "Rajasthan", "desert", ["heritage", "roadtrip"], winter, [1500, 3500, 10000], [2, 3], 26.91, 75.79,
    ["Amer Fort", "Hawa Mahal", "City Palace"],
    ["Amer Fort at opening hour", "Hawa Mahal photo stop", "Nahargarh sunset", "Bazaar shopping at Johari", "Chokhi Dhani dinner"]),
  d("udaipur", "Udaipur", "Rajasthan", "desert", ["heritage", "relax"], [9, 10, 11, 12, 1, 2, 3], [1800, 4000, 12000], [2, 4], 24.59, 73.71,
    ["Lake Pichola", "City Palace", "Sajjangarh"],
    ["Boat ride on Lake Pichola", "City Palace museum", "Bagore ki Haveli dance show", "Monsoon Palace sunset"]),
  d("jodhpur", "Jodhpur", "Rajasthan", "desert", ["heritage", "desert"], winter, [1400, 3200, 9000], [2, 3], 26.24, 73.02,
    ["Mehrangarh Fort", "Blue city", "Umaid Bhawan"],
    ["Mehrangarh Fort audio tour", "Blue-city walk", "Zipline over the fort", "Clock tower market"]),
  d("jaisalmer", "Jaisalmer", "Rajasthan", "desert", ["desert", "heritage", "adventure"], [10, 11, 12, 1, 2], [1500, 3500, 9000], [2, 3], 26.92, 70.91,
    ["Sonar Quila", "Sam dunes", "Patwon ki Haveli"],
    ["Golden fort walk", "Camel safari at Sam dunes", "Night in a desert camp", "Kuldhara ghost village"]),
  d("agra", "Agra", "Uttar Pradesh", "plains", ["heritage"], winter, [1300, 3000, 9000], [1, 2], 27.18, 78.01,
    ["Taj Mahal", "Agra Fort", "Fatehpur Sikri"],
    ["Taj Mahal at sunrise", "Agra Fort", "Mehtab Bagh sunset", "Fatehpur Sikri"]),
  d("hampi", "Hampi", "Karnataka", "plains", ["heritage", "adventure"], [10, 11, 12, 1, 2], [1000, 2500, 7000], [2, 3], 15.34, 76.46,
    ["Virupaksha temple", "Vittala stone chariot", "Boulder landscapes"],
    ["Cycle the ruins", "Vittala temple", "Coracle ride on the Tungabhadra", "Matanga Hill sunrise", "Bouldering at Hippie island"]),
  d("khajuraho", "Khajuraho", "Madhya Pradesh", "plains", ["heritage"], winter, [1200, 2800, 7500], [1, 2], 24.85, 79.93,
    ["Western group temples", "Light & sound show", "Panna NP"],
    ["Western temples guided tour", "Light & sound show", "Raneh falls", "Panna safari"]),
  d("amritsar", "Amritsar", "Punjab", "plains", ["spiritual", "heritage"], [10, 11, 12, 1, 2, 3], [1200, 2800, 7500], [2, 3], 31.63, 74.87,
    ["Golden Temple", "Wagah border", "Jallianwala Bagh"],
    ["Golden Temple langar", "Wagah border ceremony", "Jallianwala Bagh", "Kulcha food trail"]),
  d("mysuru", "Mysuru", "Karnataka", "plains", ["heritage", "relax"], winter, [1300, 3000, 8000], [2, 3], 12.3, 76.64,
    ["Mysore Palace", "Chamundi Hills", "Brindavan gardens"],
    ["Mysore Palace (illuminated Sunday)", "Chamundi Hills temple", "Devaraja market", "Srirangapatna day trip"]),
  d("sanchi", "Sanchi", "Madhya Pradesh", "plains", ["heritage", "spiritual"], winter, [1000, 2200, 6000], [1, 2], 23.48, 77.74,
    ["Great Stupa", "Ashokan pillar", "Udayagiri caves"],
    ["Great Stupa at sunrise", "Archaeological museum", "Udayagiri caves", "Bhimbetka rock shelters"]),
  d("bodhgaya", "Bodh Gaya", "Bihar", "plains", ["spiritual", "heritage"], winter, [1000, 2300, 6000], [1, 2], 24.7, 84.99,
    ["Mahabodhi temple", "Bodhi tree", "Great Buddha statue"],
    ["Meditation under the Bodhi tree", "Mahabodhi temple", "Monastery circuit", "Rajgir day trip"]),
  d("madurai", "Madurai", "Tamil Nadu", "plains", ["spiritual", "heritage"], winter, [1200, 2800, 7000], [2, 3], 9.93, 78.12,
    ["Meenakshi Amman temple", "Thirumalai Nayak palace"],
    ["Meenakshi temple evening ceremony", "Nayak palace", "Jigarthanda food walk", "Gandhi museum"]),
  d("shillong", "Shillong & Meghalaya", "Meghalaya", "northeast", ["nature", "mountain", "relax"], [10, 11, 12, 1, 2, 3, 4], [1500, 3200, 8000], [3, 4], 25.58, 91.89,
    ["Umiam lake", "Dawki river", "Mawlynnong village"],
    ["Umiam lake kayaking", "Crystal-clear Dawki boat ride", "Mawlynnong clean village", "Police Bazaar café evening"]),
  d("cherrapunji", "Cherrapunji (Sohra)", "Meghalaya", "northeast", ["nature", "adventure"], [6, 7, 8, 9, 10], [1300, 3000, 7000], [2, 3], 25.3, 91.7,
    ["Living root bridges", "Nohkalikai falls", "Mawsmai caves"],
    ["Double-decker root bridge trek", "Nohkalikai falls viewpoint", "Mawsmai cave walk", "Seven Sisters falls"]),
  d("kaziranga", "Kaziranga", "Assam", "northeast", ["wildlife", "nature"], [11, 12, 1, 2, 3, 4], [2000, 4500, 11000], [2, 3], 26.58, 93.17,
    ["One-horned rhino", "Elephant grass plains", "Tea gardens"],
    ["Morning jeep safari", "Elephant-back safari", "Tea garden walk", "Orchid park visit"]),
  d("rann-of-kutch", "Rann of Kutch", "Gujarat", "desert", ["desert", "nature", "heritage"], [11, 12, 1, 2], [1500, 3500, 9000], [2, 3], 23.73, 69.86,
    ["White Rann", "Rann Utsav", "Kalo Dungar"],
    ["Full-moon night on the white salt desert", "Rann Utsav tent stay", "Kalo Dungar sunset", "Bhujodi craft village"]),
  d("alleppey", "Alleppey (Alappuzha)", "Kerala", "coastal", ["nature", "relax"], [9, 10, 11, 12, 1, 2, 3], [1800, 4500, 11000], [2, 3], 9.49, 76.34,
    ["Backwater houseboats", "Marari beach", "Vembanad lake"],
    ["Overnight houseboat cruise", "Village canoe ride", "Marari beach sunset", "Toddy-shop Kerala meal"]),
  d("wayanad", "Wayanad", "Kerala", "southhill", ["nature", "adventure", "relax"], [10, 11, 12, 1, 2, 3, 4, 5], [1500, 3500, 9000], [2, 4], 11.69, 76.13,
    ["Edakkal caves", "Chembra peak", "Banasura dam"],
    ["Edakkal caves petroglyphs", "Chembra heart-lake trek", "Banasura dam boating", "Treehouse stay"]),
  d("ranthambore", "Ranthambore", "Rajasthan", "plains", ["wildlife", "heritage"], [10, 11, 12, 1, 2, 3, 4], [2000, 4500, 14000], [2, 3], 26.02, 76.5,
    ["Tiger safari", "Ranthambore Fort"],
    ["Zone safari for tigers", "Ranthambore Fort & Ganesh temple", "Village pottery visit"]),
  d("tawang", "Tawang", "Arunachal Pradesh", "alpine", ["mountain", "spiritual", "adventure"], [3, 4, 5, 9, 10], [1500, 3200, 7000], [5, 6], 27.59, 91.86,
    ["Tawang monastery", "Sela pass", "Madhuri lake"],
    ["Tawang monastery prayers", "Drive over Sela pass", "Madhuri lake", "War memorial"]),
];

export const getDestination = (id: string) => DESTINATIONS.find((x) => x.id === id);

export const CATEGORY_META: Record<Category, { label: string }> = {
  beach: { label: "Beach" }, mountain: { label: "Mountains" }, heritage: { label: "Heritage" },
  spiritual: { label: "Spiritual" }, desert: { label: "Desert" }, nature: { label: "Nature" },
  adventure: { label: "Adventure" }, roadtrip: { label: "Road Trip" }, relax: { label: "Relax" },
  wildlife: { label: "Wildlife" },
};

export interface City { name: string; lat: number; lon: number }
export const ORIGIN_CITIES: City[] = [
  { name: "Delhi", lat: 28.61, lon: 77.21 }, { name: "Mumbai", lat: 19.08, lon: 72.88 },
  { name: "Bengaluru", lat: 12.97, lon: 77.59 }, { name: "Chennai", lat: 13.08, lon: 80.27 },
  { name: "Kolkata", lat: 22.57, lon: 88.36 }, { name: "Hyderabad", lat: 17.39, lon: 78.49 },
  { name: "Pune", lat: 18.52, lon: 73.86 }, { name: "Ahmedabad", lat: 23.02, lon: 72.57 },
  { name: "Jaipur", lat: 26.91, lon: 75.79 }, { name: "Lucknow", lat: 26.85, lon: 80.95 },
  { name: "Chandigarh", lat: 30.73, lon: 76.78 }, { name: "Kochi", lat: 9.93, lon: 76.27 },
  { name: "Bhopal", lat: 23.26, lon: 77.41 }, { name: "Indore", lat: 22.72, lon: 75.86 },
  { name: "Patna", lat: 25.59, lon: 85.14 }, { name: "Guwahati", lat: 26.14, lon: 91.74 },
  { name: "Bhubaneswar", lat: 20.3, lon: 85.82 }, { name: "Nagpur", lat: 21.15, lon: 79.09 },
  { name: "Dehradun", lat: 30.32, lon: 78.03 }, { name: "Varanasi", lat: 25.32, lon: 83.01 },
];
