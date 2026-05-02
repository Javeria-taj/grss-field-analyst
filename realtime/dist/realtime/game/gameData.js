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
            { word: 'PENGUIN', sc: 'GNIUNEP', hint: "A bird that can't fly.", hint2: "Looks like it's wearing a tuxedo.", cat: 'Fun', pts: 100, type: 'scramble' },
            { word: 'CHOCOLATE', sc: 'CCOAHTOEL', hint: 'A sweet treat.', hint2: 'Made from cocoa beans.', cat: 'Fun', pts: 100, type: 'scramble' },
            { word: 'CINEMA', sc: 'NMEACIN', hint: 'Get your popcorn ready.', hint2: 'A place to watch blockbuster movies.', cat: 'Fun', pts: 100, type: 'scramble' },
            { word: 'VAMPIRE', sc: 'VIMRAEP', hint: 'A mythical creature.', hint2: 'Hates garlic and sunlight.', cat: 'Fun', pts: 100, type: 'scramble' },
            { word: 'BACKPACK', sc: 'KPABCACK', hint: 'Something you wear on your shoulders.', hint2: 'Students carry books in it.', cat: 'Fun', pts: 100, type: 'scramble' },
        ],
        riddles: [
            { q: "I measure but have no ruler. I fly but have no wings. I can see everything, yet I have no eyes. What am I?", ans: 'SATELLITE', hint: 'I am far above you most of the time.', hint2: 'I orbit the Earth.', cat: 'GRSS', pts: 100, type: 'riddle' },
            { q: "I shave every day, but my beard stays the exact same. What am I?", ans: 'BARBER', hint: "Think of a profession.", hint2: "I work on other people's hair.", cat: 'Fun', pts: 100, type: 'riddle' },
            { q: "I have keys but open no doors. I have space but no room. You can enter but can’t go outside. What am I?", ans: 'KEYBOARD', hint: 'You use me to write.', hint2: 'QWERTY.', cat: 'Fun', pts: 100, type: 'riddle' },
            { q: "I send out signals you cannot see, and I listen for their return. From silence, I build a picture of what surrounds you. What am I?", ans: 'RADAR', hint: 'Used in weather and aviation.', hint2: 'Works using radio waves.', cat: 'GRSS', pts: 100, type: 'riddle' },
            { q: "I have cities but no houses, forests but no trees, and oceans but no water. What am I?", ans: 'MAP', hint: 'I help you navigate.', hint2: 'Google makes a digital version of me.', cat: 'Fun', pts: 100, type: 'riddle' },
        ],
    },
    level2: {
        qs: [
            { img: '/images/level2/cyclone.jpeg', q: 'What are you looking at? (The Spinning Monster)', opts: ['Tornado', 'Cyclone', 'Whirlpool', 'Alien portal'], ans: 'Cyclone', expl: 'Cyclones are massive rotating storm systems that form over warm tropical waters.', pts: 150, hint: 'Big, organized storm system', hint2: 'Born over warm seas' },
            { img: '/images/level2/drought.jpeg', q: "What's happening? (The Thirsty Earth)", opts: ['Flood party', 'Forest growth', 'Drought', 'Snowfall'], ans: 'Drought', expl: 'Droughts occur when a region receives significantly less rain than normal for a long period.', pts: 150, hint: 'Too much sun, not enough rain', hint2: 'Water = missing' },
            { img: '/images/level2/vegetation_health.jpeg', q: 'What is being analyzed? (The Color Code Mystery)', opts: ['Volcano heat', 'Vegetation health', 'Ocean depth', 'Airplanes'], ans: 'Vegetation health', expl: 'Vegetation health is measured using NDVI, where healthy plants reflect more near-infrared light.', pts: 150, hint: 'Farmers love this data', hint2: 'NDVI is involved' },
            { img: '/images/level2/landslide.jpeg', q: 'Identify the disaster: (The Mountain Collapse)', opts: ['Earthquake', 'Landslide', 'Avalanche', 'Tsunami'], ans: 'Landslide', expl: 'Landslides involve the downward movement of rock or earth from a mountain or cliff.', pts: 150, hint: 'Gravity is the villain', hint2: 'Things get buried' },
            { img: '/images/level2/sar.jpeg', q: 'What tech is this? (The Night Vision Satellite)', opts: ['Normal camera', 'Thermal sensor', 'Synthetic Aperture Radar (SAR)', 'Drone footage'], ans: 'Synthetic Aperture Radar (SAR)', expl: 'SAR uses microwave signals to see through clouds, rain, and darkness, providing clear imagery 24/7.', pts: 150, hint: 'Clouds? No problem', hint2: 'Sends its own signals' },
        ],
    },
    level3: {
        chs: [
            { em: '🕷️👨🕸️', word: 'SPIDERMAN', hint: 'A friendly neighborhood hero.', hint2: 'Word Length: 10 Letters', expl: 'Spider + Man + Web = SPIDERMAN.', pts: 150 },
            { em: '🌊⚠️🌏', word: 'TSUNAMI', hint: 'A massive ocean wave triggered by a submarine earthquake', expl: 'Ocean wave + hazard warning + global coastline impact = TSUNAMI.', pts: 200 },
            { em: '❄️🏔️📉', word: 'GLACIER', hint: 'A slow-moving mass of compacted ice that shapes mountain valleys', expl: 'Ice + mountain terrain + shrinking over time = GLACIER.', pts: 200 },
            { em: '🌪️👁️🌀', word: 'CYCLONE', hint: 'A large rotating storm system tracked continuously by geostationary weather satellites', expl: 'Rotating winds + eye + spiral structure = CYCLONE.', pts: 250 },
            { em: '🧊🚢💔', word: 'TITANIC', hint: 'A tragic, blockbuster romance movie from 1997.', hint2: 'Word Length: 7 Letters', expl: 'Ice + Ship + Heartbreak = TITANIC.', pts: 250 },
        ],
    },
    level4: {
        qs: [
            { q: 'In what sport is the word "love" considered a score?', opts: ['Volleyball', 'Badminton', 'Tennis', 'Table Tennis'], ans: 'Tennis', expl: '[Tennis / Love]: "Love" comes from the French word for egg (l\'œuf), meaning zero!', diff: 1, pts: 100 },
            { q: 'How many bones do sharks have in their bodies?', opts: ['0', '100', '206', '300'], ans: '0', expl: '[Sharks / Bones]: Zero bones! Their entire skeleton is made of flexible cartilage.', diff: 1, pts: 100 },
            { q: 'Which iconic Bollywood movie features the legendary villain dialogue, "Kitne aadmi the?"', opts: ['Don', 'Sholay', 'Deewaar', 'Agneepath'], ans: 'Sholay', expl: '[Sholay / Dialogue]: The legendary Gabbar Singh says this in the 1975 classic, Sholay.', diff: 2, pts: 150 },
            { q: 'Which planet in our solar system is known as the "Morning Star" or "Evening Star"?', opts: ['Mars', 'Jupiter', 'Venus', 'Mercury'], ans: 'Venus', expl: "[Venus / Morning Star]: It's the brightest planet in our sky just before sunrise and after sunset.", diff: 2, pts: 150 },
            { q: 'Which animal has fingerprints so similar to human beings that they have actually confused investigators at crime scenes?', opts: ['Chimpanzee', 'Koala', 'Sloth', 'Raccoon'], ans: 'Koala', expl: "[Koalas / Fingerprints]: Their fingerprints are so human-like they've actually confused police at crime scenes!", diff: 2, pts: 150 },
            { q: 'In the blockbuster movie 3 Idiots, what is Rancho’s actual real name revealed at the end of the film?', opts: ['Chatur Ramalingam', 'Viru Sahastrabuddhe', 'Phunsukh Wangdu', 'Farhan Qureshi'], ans: 'Phunsukh Wangdu', expl: '[3 Idiots / Rancho]: The climax reveals Rancho is actually the genius inventor, Phunsukh Wangdu.', diff: 2, pts: 150 },
            { q: 'What is the only food that is known to practically never spoil or go bad, even after thousands of years?', opts: ['White Rice', 'Honey', 'Dark Chocolate', 'Salted Butter'], ans: 'Honey', expl: '[Honey / Spoiling]: Its unique chemistry makes it impossible for bacteria to survive inside it.', diff: 3, pts: 200 },
            { q: 'Which country is credited with the original invention of Tea?', opts: ['India', 'United Kingdom', 'China', 'Japan'], ans: 'China', expl: '[Tea / China]: Legend says a Chinese Emperor accidentally discovered it in 2737 BC!', diff: 3, pts: 200 },
            { q: "Which layer of Earth's atmosphere protects us from harmful UV rays?", opts: ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'], ans: 'Stratosphere', expl: "[Stratosphere / UV Rays]: This layer contains the ozone, which acts as Earth's ultimate natural sunscreen.", diff: 3, pts: 200 },
            { q: 'Synthetic Aperture Radar (SAR) is powerful because it can:', opts: ['Work only in bright sunlight', 'Measure Earth\'s core temperature', 'See through clouds, day and night', 'Stop hurricanes from forming'], ans: 'See through clouds, day and night', expl: '[SAR / Clouds]: SAR uses microwaves that easily pierce right through thick clouds and rain.', diff: 3, pts: 200 },
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
    5: { icon: '🌍', badge: 'MISSION 05', title: 'THE FINAL SEGREGATION', story: "This is the ultimate field test. You will analyze real geoscience disaster scenarios, compete in a live tool marketplace under dynamic pricing, then deploy your resources with surgical precision. Every decision counts — and every second costs.", rules: '📋 Mission Rules\n• Phase A: Analyse 4 field reports, classify each threat\n• Phase B: Live auction — budget = your total score + 100\n• Tool prices increase every 10 seconds — act fast!\n• Phase C: Evaluation — score based on threat ID accuracy + correct tool deployment tier' },
};
// Time limits per level type (seconds)
exports.TIME_LIMITS = {
    1: 25, // 25s per question
    2: 25, // 25s per image
    3: 25, // 25s per hangman
    4: 12, // 12s for Rapid Fire (increased intensity)
};
exports.AUCTION_TIME = 120; // 120s for tool auction
exports.DISASTER_TIME = 90; // 90s for disaster response
exports.INTRO_TIME = 7; // 7s level intro
exports.REVIEW_TIME = 6; // 6s answer review
