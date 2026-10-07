/**
 * Global Location Resolution Service
 * 
 * Two-Stage Location Search Architecture:
 * - STAGE 1: Curated Destination Dataset (globeData, destinations)
 * - STAGE 2: Global Geocoding & Place Resolution (Nominatim + Instant Global Knowledge Base)
 * 
 * Ensures any resolvable location on Earth (e.g. Bangalore, Munnar, Tawang,
 * Ooty, Rishikesh, Hallstatt, Interlaken, etc.) can be found, viewed on the 3D globe,
 * and launched into the Agentic AI Trip Planner.
 */

import { COUNTRIES, CITIES } from '../components/globe/globeData.js';
import { DESTINATIONS_DATA, WORLD_DESTINATIONS } from '../data/destinations.js';

// Cache to prevent redundant network lookups
const searchCache = new Map();

/**
 * Pre-calibrated Instant Global & Regional Travel Knowledge Base
 * Guarantees instantaneous (0ms) resolution for popular travel locations
 * even if offline or if external geocoding experiences latency.
 */
const KNOWN_GLOBAL_DESTINATIONS = [
  {
    name: 'Bengaluru',
    aliases: ['bangalore', 'bengaluru', 'blr'],
    country: 'India',
    countryId: 'india',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    travelStyle: 'Urban Innovation, Heritage & Garden City',
    weather: { tempC: 27, condition: 'Pleasant & Breezy' },
    startingBudget: 12000,
    bestSeason: 'September – March',
    shortDescription: 'Known as the Silicon Valley of India and the Garden City, Bengaluru combines historic landmarks like Bangalore Palace with lush parks, vibrant craft breweries, and pleasant climate.',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    tags: ['Garden City', 'Bangalore Palace', 'Craft Breweries', 'Cubbon Park', 'Tech Hub'],
  },
  {
    name: 'Munnar',
    aliases: ['munnar', 'munar'],
    country: 'India',
    countryId: 'india',
    state: 'Kerala',
    lat: 10.0889,
    lng: 77.0595,
    travelStyle: 'Tea Plantations & Misty Hills',
    weather: { tempC: 18, condition: 'Misty & Cool' },
    startingBudget: 14000,
    bestSeason: 'September – May',
    shortDescription: 'Nestled in the Western Ghats of Kerala, Munnar is famous for sprawling emerald tea plantations, misty valleys, waterfalls, and the endangered Nilgiri Tahr at Eravikulam.',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    tags: ['Tea Gardens', 'Western Ghats', 'Eravikulam', 'Attukal Waterfalls', 'Misty Hills'],
  },
  {
    name: 'Tawang',
    aliases: ['tawang'],
    country: 'India',
    countryId: 'india',
    state: 'Arunachal Pradesh',
    lat: 27.5860,
    lng: 91.8594,
    travelStyle: 'Himalayan Monasteries & High Passes',
    weather: { tempC: 11, condition: 'Crisp Mountain Breeze' },
    startingBudget: 22000,
    bestSeason: 'March – October',
    shortDescription: 'Perched in the Eastern Himalayas of Arunachal Pradesh, Tawang is renowned for the 17th-century Tawang Monastery, scenic Sela Pass, glacial lakes, and vibrant Monpa culture.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    tags: ['Tawang Monastery', 'Sela Pass', 'Madhuri Lake', 'High Himalayas', 'Monpa Culture'],
  },
  {
    name: 'Ooty',
    aliases: ['ooty', 'udhagamandalam', 'ootacamund'],
    country: 'India',
    countryId: 'india',
    state: 'Tamil Nadu',
    lat: 11.4102,
    lng: 76.6950,
    travelStyle: 'Nilgiri Mountain Railways & Botanical Escapes',
    weather: { tempC: 16, condition: 'Chilly & Fresh' },
    startingBudget: 13000,
    bestSeason: 'October – June',
    shortDescription: 'The Queen of Hill Stations in the Nilgiri Hills features historic toy train rides, the Government Botanical Garden, Ooty Lake, and rolling tea-carpeted slopes.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    tags: ['Toy Train', 'Nilgiris', 'Botanical Gardens', 'Doddabetta Peak', 'Tea Estates'],
  },
  {
    name: 'Rishikesh',
    aliases: ['rishikesh', 'hrishikesh'],
    country: 'India',
    countryId: 'india',
    state: 'Uttarakhand',
    lat: 30.0869,
    lng: 78.2676,
    travelStyle: 'Yoga Capital & River Rafting Adventures',
    weather: { tempC: 24, condition: 'Sunny & River Breeze' },
    startingBudget: 11000,
    bestSeason: 'September – April',
    shortDescription: 'Located at the foothills of the Himalayas along the holy Ganges, Rishikesh is world-renowned as the Yoga Capital, famous for Lakshman Jhula, Ganga Aarti, and whitewater rafting.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    tags: ['Ganges River', 'White Water Rafting', 'Yoga Ashrams', 'Lakshman Jhula', 'Ganga Aarti'],
  },
  {
    name: 'Hallstatt',
    aliases: ['hallstatt', 'halstatt'],
    country: 'Austria',
    countryId: 'austria',
    state: 'Upper Austria',
    lat: 47.5622,
    lng: 13.6493,
    travelStyle: 'Alpine Lake & 16th-Century Timber Architecture',
    weather: { tempC: 15, condition: 'Crisp Alpine Air' },
    startingBudget: 75000,
    bestSeason: 'May – October',
    shortDescription: 'A fairytale UNESCO village set between Lake Hallstatt and the Dachstein Alps, known for 16th-century Alpine houses, prehistoric salt mines, and scenic lake promenades.',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    tags: ['Lake Hallstatt', 'Salt Mines', 'Dachstein Alps', 'Alpine Architecture', 'UNESCO World Heritage'],
  },
  {
    name: 'Interlaken',
    aliases: ['interlaken'],
    country: 'Switzerland',
    countryId: 'switzerland',
    state: 'Bern',
    lat: 46.6863,
    lng: 7.8632,
    travelStyle: 'Bernese Oberland Adventure & Jungfrau Glaciers',
    weather: { tempC: 14, condition: 'Clear Mountain Air' },
    startingBudget: 95000,
    bestSeason: 'May – October / December – March',
    shortDescription: 'Situated between Lake Thun and Lake Brienz beneath the Jungfrau massif, Interlaken is Switzerland’s capital of outdoor adventures, glacier railways, and alpine hiking.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    tags: ['Jungfrau', 'Lake Thun', 'Lake Brienz', 'Glacier Railways', 'Paragliding'],
  },
  {
    name: 'Leh Ladakh',
    aliases: ['leh', 'ladakh', 'leh ladakh'],
    country: 'India',
    countryId: 'india',
    state: 'Ladakh',
    lat: 34.1526,
    lng: 77.5771,
    travelStyle: 'High-Altitude Cold Desert & Tibetan Monasteries',
    weather: { tempC: 12, condition: 'Dry Alpine Sun' },
    startingBudget: 28000,
    bestSeason: 'May – September',
    shortDescription: 'A stark high-altitude desert kingdom known for dramatic mountain passes like Khardung La, turquoise Pangong Lake, and historic cliffside gompas like Thiksey Monastery.',
    image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&w=1200&q=80',
    tags: ['Pangong Lake', 'Khardung La', 'Thiksey Monastery', 'Nubra Valley', 'Himalayan Passes'],
  },
  {
    name: 'Coorg',
    aliases: ['coorg', 'kodagu', 'madikeri'],
    country: 'India',
    countryId: 'india',
    state: 'Karnataka',
    lat: 12.4244,
    lng: 75.7382,
    travelStyle: 'Coffee Plantations & Misty Western Ghats',
    weather: { tempC: 22, condition: 'Lush & Pleasant' },
    startingBudget: 13000,
    bestSeason: 'October – March',
    shortDescription: 'Often called the Scotland of India, Coorg is renowned for sprawling arabica coffee estates, spice plantations, Abbey Falls, and rich Kodava cultural traditions.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    tags: ['Coffee Estates', 'Abbey Falls', 'Raja Seat', 'Western Ghats', 'Kodava Culture'],
  },
  {
    name: 'Shimla',
    aliases: ['shimla', 'simla'],
    country: 'India',
    countryId: 'india',
    state: 'Himachal Pradesh',
    lat: 31.1048,
    lng: 77.1734,
    travelStyle: 'Colonial Hill Station & Himalayan Ridges',
    weather: { tempC: 16, condition: 'Crisp Pine Breeze' },
    startingBudget: 15000,
    bestSeason: 'March – June / November – February',
    shortDescription: 'The former British summer capital features the scenic Mall Road, neo-Gothic Christ Church, the Kalka-Shimla heritage toy train, and pine-forested Himalayan panoramas.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    tags: ['The Mall Road', 'Toy Train', 'Christ Church', 'Jakhoo Hill', 'Colonial Heritage'],
  },
  {
    name: 'Varanasi',
    aliases: ['varanasi', 'banaras', 'kashi'],
    country: 'India',
    countryId: 'india',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    travelStyle: 'Spiritual Riverfront & Ancient Silk Traditions',
    weather: { tempC: 28, condition: 'Warm & Historic' },
    startingBudget: 10000,
    bestSeason: 'October – March',
    shortDescription: 'One of the world’s oldest continuously inhabited cities, Varanasi is famed for sunrise boat rides along sacred Ganga ghats, evening Dashashwamedh Aarti, and Banarasi silk weaving.',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    tags: ['Ganges Ghats', 'Ganga Aarti', 'Kashi Vishwanath', 'Silk Weaving', 'Spiritual Heritage'],
  },
  {
    name: 'Queenstown',
    aliases: ['queenstown'],
    country: 'New Zealand',
    countryId: 'new_zealand',
    state: 'Otago',
    lat: -45.0312,
    lng: 168.6626,
    travelStyle: 'Adventure Capital & Glacial Fjords',
    weather: { tempC: 15, condition: 'Crisp Alpine Sun' },
    startingBudget: 110000,
    bestSeason: 'December – March / June – August',
    shortDescription: 'Set on the shores of Lake Wakatipu against the dramatic Southern Alps, Queenstown is the adventure capital of the world, with access to Milford Sound and bungy jumping.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tags: ['Lake Wakatipu', 'Milford Sound', 'Southern Alps', 'Bungy Jumping', 'Ski Fields'],
  },
  {
    name: 'Zermatt',
    aliases: ['zermatt'],
    country: 'Switzerland',
    countryId: 'switzerland',
    state: 'Valais',
    lat: 45.9765,
    lng: 7.7491,
    travelStyle: 'Matterhorn Alpine Majesty & Car-Free Skiing',
    weather: { tempC: 10, condition: 'Crisp Mountain Air' },
    startingBudget: 105000,
    bestSeason: 'June – September / December – April',
    shortDescription: 'A car-free Alpine village nestled at the foot of the iconic pyramid-shaped Matterhorn peak, famous for world-class skiing, cogwheel railways, and mountaineering history.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    tags: ['Matterhorn', 'Gornergrat Railway', 'Car-free Village', 'Alpine Skiing', 'Glacier Paradise'],
  },
  {
    name: 'Indian Ocean',
    aliases: ['indian ocean'],
    country: 'International Waters',
    countryId: 'global',
    state: 'Indo-Pacific',
    lat: -10.0,
    lng: 75.0,
    type: 'ocean',
    cameraDistance: 6.8,
    travelStyle: 'Transoceanic Basin & Island Archipelagos',
    weather: { tempC: 28, condition: 'Tropical Maritime' },
    startingBudget: 50000,
    bestSeason: 'Year-Round',
    shortDescription: 'The third-largest ocean in the world, bounded by Asia, Africa, and Australia, spanning historic spice trade routes and tropical coral archipelagos.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tags: ['Ocean', 'Natural Feature', 'Coral Reefs', 'Maritime Expedition'],
  },
  {
    name: 'Pacific Ocean',
    aliases: ['pacific ocean', 'pacific'],
    country: 'International Waters',
    countryId: 'global',
    state: 'Circum-Pacific',
    lat: 0.0,
    lng: -160.0,
    type: 'ocean',
    cameraDistance: 7.2,
    travelStyle: 'Polynesian Atolls & Marine Exploration',
    weather: { tempC: 27, condition: 'Equatorial Ocean Breeze' },
    startingBudget: 60000,
    bestSeason: 'Year-Round',
    shortDescription: 'The largest and deepest ocean on Earth, covering more than 30% of the planets surface, stretching from the Americas to Asia.',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    tags: ['Ocean', 'Natural Feature', 'Polynesia', 'Deep Sea Exploration'],
  },
  {
    name: 'Atlantic Ocean',
    aliases: ['atlantic ocean', 'atlantic'],
    country: 'International Waters',
    countryId: 'global',
    state: 'Transatlantic',
    lat: 14.0,
    lng: -38.0,
    type: 'ocean',
    cameraDistance: 7.0,
    travelStyle: 'Maritime Navigation & Gulf Stream Waters',
    weather: { tempC: 24, condition: 'Atlantic Trade Winds' },
    startingBudget: 55000,
    bestSeason: 'May – October',
    shortDescription: 'The second-largest ocean separating the Old World from the Americas, historic passage of global voyagers and marine currents.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tags: ['Ocean', 'Natural Feature', 'Trade Winds', 'Transatlantic'],
  },
  {
    name: 'Arabian Sea',
    aliases: ['arabian sea'],
    country: 'International Waters',
    countryId: 'global',
    state: 'Northern Indian Ocean',
    lat: 16.0,
    lng: 65.0,
    type: 'sea',
    cameraDistance: 5.4,
    travelStyle: 'Historic Dhow Routes & Coastal Ecosystems',
    weather: { tempC: 29, condition: 'Warm Coastal Breeze' },
    startingBudget: 30000,
    bestSeason: 'November – March',
    shortDescription: 'A region of the northern Indian Ocean bounded by India, Pakistan, Iran, and the Arabian Peninsula, steeped in ancient maritime trading history.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    tags: ['Sea', 'Natural Feature', 'Konkan Coast', 'Maritime History'],
  },
  {
    name: 'Bay of Bengal',
    aliases: ['bay of bengal'],
    country: 'International Waters',
    countryId: 'global',
    state: 'South & Southeast Asia',
    lat: 15.0,
    lng: 88.0,
    type: 'sea',
    cameraDistance: 5.4,
    travelStyle: 'Mangrove Estuaries & Coastal Waters',
    weather: { tempC: 28, condition: 'Tropical Maritime' },
    startingBudget: 28000,
    bestSeason: 'November – February',
    shortDescription: 'The largest water region called a bay in the world, bordered by India, Bangladesh, Myanmar, and the Andaman and Nicobar Islands.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    tags: ['Sea', 'Natural Feature', 'Sundarbans', 'Andaman Sea'],
  },
  {
    name: 'Himalayas',
    aliases: ['himalayas', 'himalaya', 'himalayan range'],
    country: 'India / Nepal / Bhutan',
    countryId: 'india',
    state: 'Himalayan Ridge',
    lat: 28.5,
    lng: 84.0,
    type: 'mountain',
    cameraDistance: 4.8,
    travelStyle: 'High-Altitude Alpine Passes & Glacial Peaks',
    weather: { tempC: 8, condition: 'Crisp Mountain Breeze' },
    startingBudget: 35000,
    bestSeason: 'April – June / September – November',
    shortDescription: 'The highest mountain range on Earth, spanning five countries and housing the worlds highest peaks including Mount Everest and K2.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    tags: ['Mountain Range', 'Natural Feature', 'Alpine Trekking', 'Himalayas'],
  },
  {
    name: 'Mount Everest',
    aliases: ['mount everest', 'everest', 'sagarmatha', 'chomolungma'],
    country: 'Nepal / China',
    countryId: 'global',
    state: 'Mahalangur Himal',
    lat: 27.9881,
    lng: 86.9250,
    type: 'landmark',
    cameraDistance: 3.85,
    travelStyle: 'Roof of the World & Alpine Mountaineering',
    weather: { tempC: -12, condition: 'Extreme Alpine Glaciers' },
    startingBudget: 150000,
    bestSeason: 'April – May / October – November',
    shortDescription: 'Earths highest point at 8,848.86 metres above sea level, situated in the Mahalangur Himal sub-range of the Himalayas.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    tags: ['Summit', 'Mount Everest', 'Himalayas', 'World Wonder'],
  },
  {
    name: 'Sahara Desert',
    aliases: ['sahara', 'sahara desert'],
    country: 'North Africa',
    countryId: 'global',
    state: 'North Africa',
    lat: 23.4,
    lng: 12.6,
    type: 'desert',
    cameraDistance: 5.2,
    travelStyle: 'Desert Dunes & Stargazing Expeditions',
    weather: { tempC: 34, condition: 'Arid & Sunny' },
    startingBudget: 40000,
    bestSeason: 'October – April',
    shortDescription: 'The largest hot desert in the world, spanning across 11 North African countries with dramatic sand dunes, oases, and ancient camel caravan routes.',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    tags: ['Desert', 'Natural Feature', 'Sand Dunes', 'Sahara'],
  },
  {
    name: 'Eiffel Tower',
    aliases: ['eiffel tower', 'eiffel'],
    country: 'France',
    countryId: 'france',
    state: 'Paris',
    lat: 48.8584,
    lng: 2.2945,
    type: 'landmark',
    cameraDistance: 3.85,
    travelStyle: 'Iconic Parisian Architecture & Romantic Horizons',
    weather: { tempC: 18, condition: 'Mild European Climate' },
    startingBudget: 60000,
    bestSeason: 'April – October',
    shortDescription: 'The world-famous wrought-iron lattice monument on the Champ de Mars in Paris, designed by Gustave Eiffel for the 1889 Worlds Fair.',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80',
    tags: ['Eiffel Tower', 'Paris', 'Iconic Landmark', 'UNESCO'],
  },
  {
    name: 'Taj Mahal',
    aliases: ['taj mahal', 'taj'],
    country: 'India',
    countryId: 'india',
    state: 'Uttar Pradesh',
    lat: 27.1751,
    lng: 78.0421,
    type: 'landmark',
    cameraDistance: 3.85,
    travelStyle: 'Mughal Architectural Masterpiece & Seven Wonders',
    weather: { tempC: 28, condition: 'Warm & Sunny' },
    startingBudget: 15000,
    bestSeason: 'October – March',
    shortDescription: 'An ivory-white marble mausoleum on the south bank of the Yamuna river in Agra, commissioned in 1631 by Mughal emperor Shah Jahan.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    tags: ['Taj Mahal', 'Seven Wonders', 'Mughal Architecture', 'Agra'],
  },
  {
    name: 'Dubai',
    aliases: ['dubai', 'dxb'],
    country: 'United Arab Emirates',
    countryId: 'uae',
    state: 'Dubai Emirate',
    lat: 25.2048,
    lng: 55.2708,
    type: 'city',
    cameraDistance: 4.3,
    travelStyle: 'Futuristic Skyline, Luxury Shopping & Desert Dunes',
    weather: { tempC: 32, condition: 'Sunny & Desert Warmth' },
    startingBudget: 65000,
    bestSeason: 'November – March',
    shortDescription: 'A futuristic metropolis renowned for luxury shopping, ultramodern architecture including Burj Khalifa, and vibrant nightlife.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Burj Khalifa', 'Futuristic Skyline', 'Desert Safari', 'Luxury Stays'],
  },
  {
    name: 'Maldives',
    aliases: ['maldives', 'male'],
    country: 'Maldives',
    countryId: 'maldives',
    state: 'Indian Ocean Atolls',
    lat: 3.2028,
    lng: 73.2207,
    type: 'island',
    cameraDistance: 5.0,
    travelStyle: 'Overwater Bungalows & Crystal Coral Lagoons',
    weather: { tempC: 30, condition: 'Tropical Turquoise Sun' },
    startingBudget: 85000,
    bestSeason: 'November – April',
    shortDescription: 'A nation of islands in the Indian Ocean, famous for luxury overwater villas, powder-white beaches, and world-class scuba diving.',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80',
    tags: ['Overwater Villas', 'Coral Reefs', 'Turquoise Waters', 'Tropical Paradise'],
  },
  {
    name: 'New York',
    aliases: ['new york', 'nyc', 'manhattan'],
    country: 'United States',
    countryId: 'usa',
    state: 'New York',
    lat: 40.7128,
    lng: -74.0060,
    type: 'city',
    cameraDistance: 4.3,
    travelStyle: 'Global Metropolis, Broadway & Central Park',
    weather: { tempC: 19, condition: 'Brisk Urban Atmosphere' },
    startingBudget: 90000,
    bestSeason: 'April – June / September – November',
    shortDescription: 'The city that never sleeps, home to the Empire State Building, Times Square, Broadway, world-renowned museums, and Central Park.',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
    tags: ['Manhattan', 'Central Park', 'Broadway', 'Skyline', 'Metropolis'],
  },
];

/**
 * Stage 1: Curated Search
 * Search within existing COUNTRIES, CITIES, and curated destinations.
 */
export function searchCuratedDataset(query) {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  const matchedCountries = (COUNTRIES || [])
    .filter((c) => c?.name?.toLowerCase().includes(q))
    .map((c) => ({
      ...c,
      itemType: 'country',
      source: 'curated',
      badge: 'Curated Country',
    }));

  const matchedCities = (CITIES || [])
    .filter(
      (c) =>
        c?.name?.toLowerCase().includes(q) ||
        c?.country?.toLowerCase().includes(q) ||
        c?.countryName?.toLowerCase().includes(q)
    )
    .map((c) => ({
      ...c,
      itemType: 'city',
      source: 'curated',
      badge: 'Curated City',
    }));

  return [...matchedCountries, ...matchedCities];
}

/**
 * Estimate climate and typical seasonal information based on latitude
 */
function estimateLocationIntel(lat, country, name) {
  const absLat = Math.abs(lat);
  let condition = 'Pleasant & Moderate';
  let tempC = 22;
  let bestSeason = 'October – April';
  let travelStyle = 'Scenic Discovery & Local Culture';
  let budget = 25000;

  if (absLat < 18) {
    condition = 'Warm Tropical';
    tempC = 29;
    bestSeason = 'November – February';
    travelStyle = 'Tropical Discovery & Cultural Heritage';
    budget = 18000;
  } else if (absLat < 35) {
    condition = 'Sunny & Warm';
    tempC = 25;
    bestSeason = 'October – March';
    travelStyle = 'Regional Heritage & Scenic Landscapes';
    budget = 22000;
  } else if (absLat < 55) {
    condition = 'Mild Continental';
    tempC = 18;
    bestSeason = 'May – October';
    travelStyle = 'Historic Architecture & Nature Walks';
    budget = 45000;
  } else {
    condition = 'Crisp Subpolar Air';
    tempC = 11;
    bestSeason = 'June – August';
    travelStyle = 'Northern Wilderness & Mountain Vistas';
    budget = 65000;
  }

  // Adjust for Indian locations
  if (country && /india/i.test(country)) {
    budget = 14000;
    travelStyle = 'Heritage, Cuisine & Local Experiences';
  }

  return { condition, tempC, bestSeason, travelStyle, startingBudget: budget };
}

/**
 * Format a dynamic location into a standard City object compatible with
 * the 3D Globe, LocationPanel, and AI Trip Planner.
 */
export function formatGlobalLocationAsCity(location) {
  const intel = estimateLocationIntel(location.lat, location.country, location.name);

  return {
    id: `global-${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: location.name,
    country: location.country || 'Global',
    countryId: (location.country || 'world').toLowerCase().replace(/[^a-z0-9]/g, '_'),
    lat: Number(location.lat),
    lng: Number(location.lng),
    itemType: 'city',
    source: 'global',
    isGlobalResolved: true,
    state: location.state || '',
    displayName: location.displayName || `${location.name}, ${location.country}`,
    cityImage: location.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    image: location.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    fallbackImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    objectPosition: 'center',
    travelStyle: location.travelStyle || intel.travelStyle,
    weather: location.weather || { tempC: intel.tempC, condition: intel.condition },
    bestSeason: location.bestSeason || intel.bestSeason,
    startingBudget: location.startingBudget || intel.startingBudget,
    shortDescription:
      location.shortDescription ||
      `${location.name} in ${location.country} resolved via global location search. Calibrated for autonomous AI itinerary routing and seasonal planning.`,
    description:
      location.description ||
      `${location.name} in ${location.country} is ready for exploration. Autonomous travel agents will formulate custom itineraries, transport connections, and stay recommendations.`,
    attractions: [],
    badge: 'Global Location',
  };
}

/**
 * Real Relatable Place Photo Resolver via English Wikipedia / Wikimedia
 * Returns high-resolution real place photos for any town, city, or landmark worldwide.
 */
export async function fetchWikipediaPlacePhoto(name) {
  if (!name || typeof name !== 'string') return null;
  const cleanName = encodeURIComponent(name.trim().replace(/\s+/g, '_'));
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${cleanName}&prop=pageimages&format=json&pithumbsize=1280&origin=*`
    );
    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages || {};
      for (const key of Object.keys(pages)) {
        const thumb = pages[key]?.thumbnail?.source;
        if (thumb) return thumb;
      }
    }
  } catch (e) {
    // Graceful fallback
  }
  return null;
}

/**
 * Stage 2: Global Geocoding & Location Resolution
 * Resolves locations not present in curated dataset via:
 * 1. Pre-calibrated Instant Global Knowledge Base (0ms latency)
 * 2. OpenStreetMap Nominatim Geocoding API (Worldwide coverage)
 */
export async function searchGlobalLocations(query, signal) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  // Check in-memory cache
  if (searchCache.has(q)) {
    return searchCache.get(q);
  }

  const results = [];
  const seenKeys = new Set();

  // 1. Instant Global Knowledge Base lookup
  for (const item of KNOWN_GLOBAL_DESTINATIONS) {
    const matchesName = item.name.toLowerCase().includes(q);
    const matchesAlias = item.aliases?.some((a) => a.includes(q) || q.includes(a));
    const matchesCountry = item.country.toLowerCase().includes(q);
    const matchesState = item.state?.toLowerCase().includes(q);

    if (matchesName || matchesAlias || matchesCountry || matchesState) {
      const cityObj = formatGlobalLocationAsCity(item);
      const key = `${cityObj.name.toLowerCase()}-${cityObj.country.toLowerCase()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push(cityObj);
      }
    }
  }

  // 2. Query OpenStreetMap Nominatim for complete worldwide coverage in ENGLISH
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query.trim()
    )}&limit=5&addressdetails=1&namedetails=1&accept-language=en,en-US;q=0.9`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: signal || controller.signal,
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en,en-US;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          if (isNaN(lat) || isNaN(lng)) continue;

          // Extract best available English place name
          const address = item.address || {};
          const namedetails = item.namedetails || {};
          const rawName =
            namedetails['name:en'] ||
            address.city_en ||
            address['name:en'] ||
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            address.hamlet ||
            address.suburb ||
            item.name ||
            item.display_name.split(',')[0];

          const country = namedetails['country:en'] || address['country:en'] || address.country || 'Global';
          const state = namedetails['state:en'] || address['state:en'] || address.state || address.region || '';
          const key = `${rawName.toLowerCase()}-${country.toLowerCase()}`;

          if (!seenKeys.has(key)) {
            seenKeys.add(key);

            // Fetch relatable Wikipedia photo for that exact place
            const wikiPhoto = await fetchWikipediaPlacePhoto(rawName);

            const globalItem = formatGlobalLocationAsCity({
              name: rawName,
              country,
              state,
              lat,
              lng,
              displayName: item.display_name,
              image: wikiPhoto || undefined,
            });

            results.push(globalItem);
          }
        }
      }
    }
  } catch (err) {
    // If network / timeout occurs, gracefully fall back to knowledge base results
    if (err.name !== 'AbortError') {
      console.warn('Global geocoding lookup notice:', err.message);
    }
  }

  // Cache results
  searchCache.set(q, results);
  return results;
}

/**
 * Combined Two-Stage Search Function:
 * 1. Curated search executed synchronously.
 * 2. If curated matches exist, they take priority.
 * 3. Global search executes asynchronously to resolve any missing destination.
 */
export async function twoStageLocationSearch(query, onUpdate, signal) {
  if (!query || !query.trim()) {
    if (onUpdate) onUpdate({ curated: [], global: [], isLoadingGlobal: false });
    return { curated: [], global: [] };
  }

  // Stage 1: Curated Search (Instant)
  const curated = searchCuratedDataset(query);

  if (onUpdate) {
    onUpdate({
      curated,
      global: [],
      isLoadingGlobal: true,
    });
  }

  // Stage 2: Global Location Search
  const global = await searchGlobalLocations(query, signal);

  // Filter out any global result that duplicates a curated city
  const curatedCityNames = new Set(
    curated.map((c) => c.name?.toLowerCase().trim())
  );
  const deduplicatedGlobal = global.filter(
    (g) => !curatedCityNames.has(g.name?.toLowerCase().trim())
  );

  const payload = {
    curated,
    global: deduplicatedGlobal,
    isLoadingGlobal: false,
  };

  if (onUpdate) {
    onUpdate(payload);
  }

  return payload;
}
