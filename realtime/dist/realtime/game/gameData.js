"use strict";
// ============================================================
// GRSS FIELD ANALYST — Server-Side Game Data (WITH ANSWERS)
// This file lives on the realtime server only. Answers never
// leave the server — clients receive stripped question payloads.
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.REVIEW_TIME = exports.INTRO_TIME = exports.DISASTER_TIME = exports.AUCTION_TIME = exports.TIME_LIMITS = exports.LEVEL_INTROS = void 0;
const DATA = {
    level1: {
        scrambles: [
            { word: 'LIDAR', sc: 'RIDAL', hint: 'Light Detection And Ranging — uses laser pulses to measure distance to the ground surface', cat: 'Remote Sensing', pts: 100, type: 'scramble' },
            { word: 'RADAR', sc: 'ARRAD', hint: 'Radio Detection And Ranging — uses radio waves to detect objects and measure distances', cat: 'Remote Sensing', pts: 100, type: 'scramble' },
            { word: 'PIXEL', sc: 'XELIP', hint: 'The smallest discrete unit of a digital satellite image', cat: 'Image Basics', pts: 100, type: 'scramble' },
            { word: 'THERMAL', sc: 'LAHRMET', hint: 'Related to heat energy; infrared satellite sensors detect this to map surface temperatures', cat: 'Electromagnetics', pts: 150, type: 'scramble' },
            { word: 'LANDSAT', sc: 'TASLAND', hint: "The world's longest-running Earth observation satellite programme, operated since 1972", cat: 'Satellites', pts: 200, type: 'scramble' },
        ],
        riddles: [
            { q: "I have 8 spectral bands but can't play music. I've orbited Earth since 1972, and my latest version is number 9. What am I?", ans: 'LANDSAT', hint: 'A famous NASA/USGS satellite programme for continuous Earth observation since 1972', cat: 'Satellites', pts: 150, type: 'riddle' },
            { q: "Scientists love me when I'm between 0.6 and 0.9. Healthy forests make me high; concrete and deserts keep me low. I compare red and near-infrared light. What am I?", ans: 'NDVI', hint: 'A vegetation health index calculated from two spectral bands', cat: 'Vegetation', pts: 200, type: 'riddle' },
            { q: "I was drilled from 3 km below Antarctic ice. I hold tiny air bubbles from 800,000 years ago. What am I?", ans: 'ICE CORE', hint: 'A cylindrical sample extracted from glaciers', cat: 'Climate Science', pts: 200, type: 'riddle' },
            { q: "30 of my siblings orbit Earth at 20,200 km altitude. Together we help ships, pilots, and hikers know exactly where they are. What system are we?", ans: 'GPS', hint: 'A satellite-based navigation system originally developed by the US Department of Defense', cat: 'Navigation', pts: 150, type: 'riddle' },
            { q: "I am a Copernicus mission launched by ESA. I see through clouds using C-band microwaves. What am I?", ans: 'SENTINEL', hint: "ESA's Earth observation satellite constellation", cat: 'Satellites', pts: 250, type: 'riddle' },
        ],
    },
    level2: {
        qs: [
            { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/500px-The_Earth_seen_from_Apollo_17.jpg', q: 'This iconic photograph known as "The Blue Marble" was captured from space. What type of satellite imaging does it represent?', opts: ['True Color Composite', 'False Color Infrared', 'Synthetic Aperture Radar (SAR)', 'Thermal Infrared Mosaic'], ans: 0, expl: 'The Blue Marble is a true color composite — showing Earth as human eyes would see it.', pts: 150 },
            { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Hurricane_Isabel_from_ISS.jpg/500px-Hurricane_Isabel_from_ISS.jpg', q: 'This photo was captured from the ISS. What extreme weather phenomenon is shown?', opts: ['Tornado', 'Hurricane / Tropical Cyclone', 'Dust Storm', 'Volcanic Ash Plume'], ans: 1, expl: 'Hurricane Isabel (2003) shows the characteristic spiral bands and clear eye of a tropical cyclone.', pts: 150 },
            { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Amazon_deforestation.jpg/500px-Amazon_deforestation.jpg', q: 'This Landsat satellite image of the Amazon Basin reveals a major environmental crisis. What is being shown?', opts: ['River Flooding', 'Systematic Deforestation', 'Agricultural Irrigation Grid', 'Oil Spill from Pipeline'], ans: 1, expl: 'The geometric clearing pattern is a classic signature of systematic deforestation.', pts: 200 },
            { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/NOAA-NASA_Suomi_NPP_satellite_image_of_northern_India_and_surrounding_countries_at_night.jpg/500px-NOAA-NASA_Suomi_NPP_satellite_image_of_northern_India_and_surrounding_countries_at_night.jpg', q: 'This nighttime satellite composite from Suomi NPP is used by economists and geographers to measure what?', opts: ['Lightning Activity Patterns', 'Human Settlement Density & Economic Activity', 'Volcanic Hotspot Activity', 'Aurora Borealis Distribution'], ans: 1, expl: 'Night lights detected by the VIIRS instrument are a powerful proxy for economic activity.', pts: 200 },
            { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Aletschgletscher_mit_Jungfrau.jpg/500px-Aletschgletscher_mit_Jungfrau.jpg', q: 'Multi-temporal satellite imagery of Alpine glaciers like this one is used to track which critical environmental indicator?', opts: ['Tectonic Uplift of Mountain Ranges', 'Glacial Retreat due to Climate Change', 'New Volcanic Formation', 'Increased Snowfall from La Niña'], ans: 1, expl: 'Repeat satellite observations document Alpine glacier retreat at 50+ metres per year.', pts: 250 },
        ],
    },
    level3: {
        chs: [
            { em: '🛰️💡🌍', word: 'LIDAR', hint: 'Pulses of laser light measure precise distance to the ground surface', expl: 'Satellite + Laser light + Earth surface = LiDAR.', pts: 150 },
            { em: '🌊⚠️🌏', word: 'TSUNAMI', hint: 'A massive ocean wave triggered by a submarine earthquake', expl: 'Ocean wave + hazard warning + global coastline impact = TSUNAMI.', pts: 200 },
            { em: '❄️🏔️📉', word: 'GLACIER', hint: 'A slow-moving mass of compacted ice that shapes mountain valleys', expl: 'Ice + mountain terrain + shrinking over time = GLACIER.', pts: 200 },
            { em: '🌪️👁️🌀', word: 'CYCLONE', hint: 'A large rotating storm system tracked continuously by geostationary weather satellites', expl: 'Rotating winds + eye + spiral structure = CYCLONE.', pts: 250 },
            { em: '🔥🌲🗺️', word: 'WILDFIRE', hint: 'An uncontrolled fire spreading through vegetation, monitored by thermal infrared satellite sensors', expl: 'Fire + forest/vegetation + mapped from space = WILDFIRE.', pts: 250 },
        ],
    },
    level4: {
        qs: [
            { q: 'What does NDVI stand for in remote sensing?', opts: ['Normalized Difference Vegetation Index', 'National Digital Vegetation Interface', 'Natural Data Visualization Index', 'Normalized Distribution Visual Index'], ans: 0, expl: 'NDVI = (NIR − Red)/(NIR + Red). Values range from −1 to +1.', diff: 1, pts: 100 },
            { q: 'Which type of radar sensor does the ESA Sentinel-1 satellite carry?', opts: ['X-band Radar', 'L-band Radar', 'C-band SAR', 'P-band SAR'], ans: 2, expl: 'Sentinel-1 carries a C-band SAR operating at 5.4 GHz.', diff: 2, pts: 150 },
            { q: 'Which spectral band combination is BEST for delineating water bodies?', opts: ['Red + Green bands', 'NIR + SWIR bands', 'Blue + Green bands', 'Thermal + Panchromatic'], ans: 1, expl: 'Water strongly absorbs NIR and SWIR energy, appearing very dark.', diff: 2, pts: 150 },
            { q: 'IEEE GRSS is primarily focused on:', opts: ['GPS navigation and positioning systems', 'Geoscience and remote sensing science and technology', 'Geological rock formation studies', 'Ground robotics and spatial computing'], ans: 1, expl: 'IEEE GRSS is the premier professional society for Earth observation scientists.', diff: 1, pts: 100 },
            { q: 'What is the PRIMARY advantage of SAR over optical satellite sensors?', opts: ['Higher spatial resolution', 'All-weather, day-and-night imaging capability', 'More spectral bands available', 'Significantly lower cost per scene'], ans: 1, expl: 'SAR uses microwave energy that penetrates cloud cover and operates independently of sunlight.', diff: 2, pts: 150 },
            { q: 'Which programme provides FREE and OPEN access to the full Sentinel satellite data archive?', opts: ['NASA Earthdata', 'The Copernicus Programme (ESA)', 'JAXA EORC', 'ISRO Bhuvan'], ans: 1, expl: 'The EU Copernicus Programme provides completely free and open access to all Sentinel data.', diff: 2, pts: 150 },
            { q: 'In remote sensing, what does "temporal resolution" refer to?', opts: ['The pixel size on the ground', 'How often a satellite revisits the same location', 'The number of spectral bands a sensor records', 'The altitude of the satellite orbit'], ans: 1, expl: 'Temporal resolution = revisit time.', diff: 2, pts: 150 },
            { q: 'Which spectral band is MOST useful for highlighting vegetation health?', opts: ['Blue band (0.45–0.52 μm)', 'Green band (0.52–0.60 μm)', 'Near-Infrared band (0.76–0.90 μm)', 'Thermal Infrared band (10–12 μm)'], ans: 2, expl: 'Healthy vegetation strongly reflects NIR while absorbing Red light.', diff: 3, pts: 200 },
            { q: 'What is "orthorectification" in remote sensing image processing?', opts: ['Enhancing image brightness and contrast', 'Correcting geometric distortions caused by terrain relief and sensor geometry', 'Removing atmospheric scattering and haze', 'Classifying pixels into land cover categories'], ans: 1, expl: 'Orthorectification removes spatial distortions caused by terrain relief displacement.', diff: 3, pts: 200 },
            { q: 'The Landsat 9 satellite was launched in which year?', opts: ['2015', '2018', '2021', '2023'], ans: 2, expl: 'Landsat 9 launched on September 27, 2021.', diff: 3, pts: 200 },
        ],
    },
    level5: {
        tools: [
            { id: 'sar', name: 'SAR Satellite Feed', price: 2500, icon: '📡', desc: 'All-weather C-band radar imagery through cloud cover', eff: { flood: 10, wildfire: 6, earthquake: 8 } },
            { id: 'thermal', name: 'Thermal Camera Array', price: 1800, icon: '🌡️', desc: 'Infrared heat signature detection from orbit', eff: { flood: 5, wildfire: 10, earthquake: 4 } },
            { id: 'lidar', name: 'LiDAR Terrain Scanner', price: 2200, icon: '💡', desc: 'Precise 3D elevation models for flood depth analysis', eff: { flood: 9, wildfire: 5, earthquake: 9 } },
            { id: 'ndvi', name: 'NDVI Vegetation Analyzer', price: 800, icon: '🌿', desc: 'Vegetation health index and fire risk mapping', eff: { flood: 4, wildfire: 8, earthquake: 3 } },
            { id: 'gps', name: 'GPS Ground Network', price: 600, icon: '📍', desc: 'Millimetre-precision ground displacement tracking', eff: { flood: 6, wildfire: 3, earthquake: 10 } },
            { id: 'flood_ai', name: 'Flood Prediction AI', price: 1500, icon: '🌊', desc: 'ML-based flood extent and inundation depth forecasting', eff: { flood: 10, wildfire: 2, earthquake: 4 } },
            { id: 'comm', name: 'Emergency Comm Relay', price: 900, icon: '📻', desc: 'Satellite communications for connectivity-denied zones', eff: { flood: 7, wildfire: 7, earthquake: 8 } },
            { id: 'drone', name: 'Multispectral UAV', price: 1400, icon: '🚁', desc: 'Close-range aerial recon with real-time multispectral data', eff: { flood: 7, wildfire: 9, earthquake: 6 } },
            { id: 'seismic', name: 'Seismic Sensor Array', price: 1600, icon: '📊', desc: 'Ground motion monitoring and aftershock prediction', eff: { flood: 3, wildfire: 2, earthquake: 10 } },
            { id: 'optical', name: 'High-Res Optical Satellite', price: 2000, icon: '🔭', desc: '30 cm resolution imagery for detailed damage assessment', eff: { flood: 8, wildfire: 7, earthquake: 7 } },
        ],
        combos: [
            { tools: ['sar', 'lidar'], name: '3D Flood Intelligence Suite', bonus: 500, desc: 'SAR + LiDAR generates the most accurate flood depth maps!', icon: '🏆' },
            { tools: ['thermal', 'ndvi'], name: 'Fire Risk Sentinel System', bonus: 350, desc: 'Thermal + NDVI perfectly maps active fire perimeters!', icon: '🔥' },
            { tools: ['gps', 'seismic'], name: 'Earthquake Intelligence System', bonus: 450, desc: 'GPS + Seismic arrays predict aftershocks with high accuracy!', icon: '⚠️' },
            { tools: ['drone', 'comm'], name: 'Tactical Response Unit', bonus: 300, desc: 'UAV drones + Comm relay enable coordinated rescue ops!', icon: '📡' },
        ],
        disasters: [
            { id: 'flood', name: 'BANGLADESH MEGA-FLOOD', icon: '🌊', color: '#00c8ff', desc: 'Catastrophic monsoon flooding has inundated 30% of Bangladesh. 2.3 million people are displaced.', optTools: ['sar', 'flood_ai', 'lidar', 'comm'], metrics: ['Flood extent mapping accuracy', 'Population exposure quantification', 'Infrastructure damage detection', 'Evacuation route planning quality'] },
            { id: 'wildfire', name: 'CALIFORNIA MEGA-FIRE', icon: '🔥', color: '#ff6b35', desc: 'A rapidly spreading wildfire in Northern California has consumed 80,000 acres in 12 hours.', optTools: ['thermal', 'ndvi', 'drone', 'comm'], metrics: ['Active fire perimeter mapping', 'Fire spread direction forecast', 'Air quality hazard monitoring', 'Evacuation zone prioritisation'] },
            { id: 'earthquake', name: 'TURKEY M7.8 EARTHQUAKE', icon: '⚠️', color: '#ffaa00', desc: 'A catastrophic 7.8 magnitude earthquake has struck southeastern Turkey. Thousands of buildings collapsed.', optTools: ['sar', 'seismic', 'gps', 'optical'], metrics: ['Ground displacement mapping', 'Building collapse detection accuracy', 'Aftershock risk zone delineation', 'Search & rescue prioritisation score'] },
        ],
    },
};
exports.default = DATA;
exports.LEVEL_INTROS = {
    1: { icon: '🔤', badge: 'MISSION 01', title: 'WORD SCRAMBLE & RIDDLES', story: "Welcome Analyst. Your first mission is to decode encrypted field terminology. Unscramble the data and solve the geospatial riddles to proceed.", rules: '📋 Mission Rules\n• 10 challenges: 5 Scrambles + 5 Riddles\n• ⏱ 60 seconds per challenge\n• Speed is critical for high scores\n• Type and press Enter to submit' },
    2: { icon: '🛰️', badge: 'MISSION 02', title: 'IMAGE GUESSING', story: "The visual feed is incoming. You must identify terrain, satellites, and environmental phenomena from high-resolution orbital imagery.", rules: '📋 Mission Rules\n• 5 orbital image analysis tasks\n• ⏱ 60 seconds per image\n• Choose the correct identification\n• Precision and speed generate max points' },
    3: { icon: '🔐', badge: 'MISSION 03', title: 'EMOJI HANGMAN', story: "We've intercepted a series of emoji-encoded geoscience terms. Reconstruct the original terminology before the uplink times out.", rules: '📋 Mission Rules\n• 5 Emoji Hangman challenges\n• ⏱ 120 seconds per challenge\n• 6 wrong guesses allowed\n• Hints appear at the 60-second mark' },
    4: { icon: '⚡', badge: 'MISSION 04', title: 'RAPID FIRE', story: "A massive data cascade is flooding the terminal. You have seconds to classify incoming remote sensing data. NO ROOM FOR ERROR.", rules: '📋 Mission Rules\n• 10 High-speed MCQs\n• ⏱ 90 seconds per question\n• Progressive difficulty scaling\n• Base points increase with difficulty level' },
    5: { icon: '🌍', badge: 'MISSION 05', title: 'PRESSURE AUCTION', story: "This is the final simulation. Compete in a live auction to acquire critical monitoring tools, then deploy them to save a region in crisis.", rules: '📋 Mission Rules\n• Phase A: Auction — $10,000 budget, max 5 tools\n• Phase B: Deployment — use tools to mitigate the disaster\n• Score based on tool efficiency + combo bonuses' },
};
// Time limits per level type (seconds)
exports.TIME_LIMITS = {
    1: 60, // 60s per question
    2: 60, // 60s per image
    3: 120, // 120s per hangman
    4: 45, // 45s for Rapid Fire (increased intensity)
};
exports.AUCTION_TIME = 120; // 120s for tool auction
exports.DISASTER_TIME = 90; // 90s for disaster response
exports.INTRO_TIME = 7; // 7s level intro
exports.REVIEW_TIME = 6; // 6s answer review
