// Generated from verified Wikimedia Commons files (each checked to resolve to a real image).
const commons = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1200`;

export interface CommonsPhoto { url: string; label: string }

/** Extra verified Commons photos per destination (attraction name as label). */
export const COMMONS_EXTRA: Record<string, CommonsPhoto[]> = {
  "agra": [{ url: commons("Buland Darwaza, Fatehpur Sikri.jpg"), label: "Buland Darwaza" }, { url: commons("Itmad-ud-Daulah, Agra.jpg"), label: "Itimad-ud-Daulah" }],
  "alleppey": [{ url: commons("Vembanad Lake.jpg"), label: "Vembanad Lake" }, { url: commons("Marari Beach.jpg"), label: "Marari Beach" }, { url: commons("Alleppey backwaters.jpg"), label: "Backwaters" }],
  "amritsar": [{ url: commons("Golden Temple at night.jpg"), label: "Golden Temple at night" }],
  "andaman": [{ url: commons("Cellular Jail, Port Blair.jpg"), label: "Cellular Jail" }, { url: commons("Neil Island, Andaman.jpg"), label: "Neil Island" }],
  "bodhgaya": [{ url: commons("Great Buddha Statue, Bodh Gaya.jpg"), label: "Great Buddha Statue" }, { url: commons("Mahabodhi Temple, Bodh Gaya.jpg"), label: "Mahabodhi Temple" }],
  "chopta": [{ url: commons("Tungnath temple (3530983196).jpg"), label: "Tungnath Temple" }, { url: commons("Chandrashila summit (1 of 1).jpg"), label: "Chandrashila Summit" }, { url: commons("Deoria Tal Chandrashila Chaukamba reflection.jpg"), label: "Deoria Tal" }],
  "coorg": [{ url: commons("Raja's Seat, Madikeri.jpg"), label: "Raja's Seat" }],
  "gokarna": [{ url: commons("Kudle Beach, Gokarna.jpg"), label: "Kudle Beach" }],
  "hampi": [{ url: commons("Virupaksha Temple, Hampi.jpg"), label: "Virupaksha Temple" }],
  "jaipur": [{ url: commons("City Palace, Jaipur.jpg"), label: "City Palace" }, { url: commons("Nahargarh Fort, Jaipur.jpg"), label: "Nahargarh Fort" }, { url: commons("Jal Mahal, Jaipur.jpg"), label: "Jal Mahal" }],
  "jaisalmer": [{ url: commons("Gadisar Lake, Jaisalmer.jpg"), label: "Gadisar Lake" }, { url: commons("Jaisalmer Fort.jpg"), label: "Sonar Quila" }],
  "jodhpur": [{ url: commons("Blue City Jodhpur.jpg"), label: "Blue City" }, { url: commons("Umaid Bhawan Palace.jpg"), label: "Umaid Bhawan" }, { url: commons("Jaswant Thada, Jodhpur.jpg"), label: "Jaswant Thada" }, { url: commons("Mehrangarh Fort, Jodhpur.jpg"), label: "Mehrangarh Fort" }],
  "khajuraho": [{ url: commons("Kandariya Mahadev Temple, Khajuraho.jpg"), label: "Kandariya Mahadeva" }, { url: commons("Lakshmana Temple, Khajuraho.jpg"), label: "Lakshmana Temple" }],
  "kovalam": [{ url: commons("Vizhinjam Harbour.jpg"), label: "Vizhinjam Harbour" }],
  "leh": [{ url: commons("Pangong Tso.jpg"), label: "Pangong Tso" }, { url: commons("Thiksey Monastery.jpg"), label: "Thiksey Monastery" }],
  "madurai": [{ url: commons("Meenakshi Amman Temple, Madurai.jpg"), label: "Meenakshi Amman Temple" }],
  "manali": [{ url: commons("Hidimba Devi Temple, Manali.jpg"), label: "Hadimba Devi Temple" }, { url: commons("Atal Tunnel.jpg"), label: "Atal Tunnel" }, { url: commons("Solang Valley.jpg"), label: "Solang Valley" }],
  "mysuru": [{ url: commons("Brindavan Gardens, Mysore.jpg"), label: "Brindavan Gardens" }, { url: commons("St. Philomena's Church, Mysore.jpg"), label: "St. Philomena's Cathedral" }],
  "ooty": [{ url: commons("Nilgiri Mountain Railway.jpg"), label: "Nilgiri Mountain Railway" }, { url: commons("Doddabetta Peak.jpg"), label: "Doddabetta Peak" }],
  "ranthambore": [{ url: commons("Tiger in Ranthambore.jpg"), label: "Bengal tiger" }],
  "rishikesh": [{ url: commons("Rafting in Rishikesh.jpg"), label: "Ganga rafting" }],
  "sanchi": [{ url: commons("Sanchi Stupa from Eastern gate, Madhya Pradesh.jpg"), label: "Great Stupa" }, { url: commons("Udayagiri Caves.jpg"), label: "Udayagiri Caves" }, { url: commons("Sanchi Stupa No 2.jpg"), label: "Stupa No. 2" }],
  "shillong": [{ url: commons("Dawki River, Meghalaya.jpg"), label: "Dawki River" }, { url: commons("Ward's Lake, Shillong.jpg"), label: "Ward's Lake" }],
  "shimla": [{ url: commons("Christ Church, Shimla.jpg"), label: "Christ Church, The Ridge" }, { url: commons("Mall Road, Shimla.jpg"), label: "Mall Road" }],
  "spiti": [{ url: commons("Chandra Taal.jpg"), label: "Chandra Taal" }],
  "tawang": [{ url: commons("Sela Pass, Arunachal Pradesh.jpg"), label: "Sela Pass" }, { url: commons("Tawang War Memorial.jpg"), label: "War Memorial" }],
  "udaipur": [{ url: commons("City Palace, Udaipur.jpg"), label: "City Palace" }, { url: commons("Lake Pichola, Udaipur.jpg"), label: "Lake Pichola" }],
  "valley-of-flowers": [{ url: commons("(A) Valley of flowers, Garhwal Uttarakhand India.jpg"), label: "Valley of Flowers" }, { url: commons("Hemkund Sahib and Lokpal Lake.jpg"), label: "Hemkund Sahib" }, { url: commons("Ghangaria to Govindghat trek - during LGFC - VOF 2019 (275).jpg"), label: "Ghangaria trek" }],
  "varanasi": [{ url: commons("Aarti, Ganga Aarti at Dashashwamedh Ghat, Varanasi.jpg"), label: "Ganga Aarti, Dashashwamedh Ghat" }],
  "wayanad": [{ url: commons("Banasura Sagar Dam.jpg"), label: "Banasura Sagar Dam" }],
};
