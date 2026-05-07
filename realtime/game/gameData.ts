// ============================================================
// GRSS FIELD ANALYST — Server-Side Game Data (WITH ANSWERS)
// This file lives on the realtime server only. Answers never
// leave the server — clients receive stripped question payloads.
// ============================================================

export interface ScrambleQ {
  word: string; sc: string; hint: string; hint2?: string; expl: string; cat: string; pts: number; type: 'scramble';
}
export interface RiddleQ {
  q: string; ans: string; hint: string; hint2?: string; expl: string; cat: string; pts: number; type: 'riddle';
}
export type Level1Q = ScrambleQ | RiddleQ;

export interface ImageQ {
  img: string; q: string; opts: string[]; ans: string; expl: string; pts: number; hint?: string; hint2?: string;
}
export interface HangmanChallenge {
  em: string; word: string; hint: string; hint2?: string; expl: string; pts: number;
}
export interface MCQQuestion {
  q: string; opts: string[]; ans: string; expl: string; diff: 1 | 2 | 3; pts: number;
}
export interface Tool {
  id: string; name: string; price: number; icon: string; desc: string;
  eff: { flood: number; wildfire: number; earthquake: number };
}
export interface Combo {
  tools: string[]; name: string; bonus: number; desc: string; icon: string;
}
export interface Disaster {
  id: 'flood' | 'wildfire' | 'earthquake'; name: string; icon: string; color: string;
  desc: string; optTools: string[]; metrics: string[];
}

export interface ServerGameData {
  level1: { scrambles: ScrambleQ[]; riddles: RiddleQ[] };
  level2: { qs: ImageQ[] };
  level3: { chs: HangmanChallenge[] };
  level4: { qs: MCQQuestion[] };
  level5: { tools: Tool[]; combos: Combo[]; disasters: Disaster[] };
}

const DATA: ServerGameData = {
  level1: {
    scrambles: [
      { word: 'EARTH', sc: 'HTRAE', hint: 'Our home planet.', hint2: 'Third planet from the Sun.', expl: 'Earth is the planet where we live.', cat: 'GRSS', pts: 100, type: 'scramble' },
      { word: 'SENSOR', sc: 'EROSNES', hint: 'Used on satellites.', hint2: 'Collects data remotely.', expl: 'Sensors onboard satellites collect remote sensing data from Earth.', cat: 'GRSS', pts: 100, type: 'scramble' },
      { word: 'PIXEL', sc: 'LEXPI', hint: 'Smallest unit in satellite imagery.', hint2: 'Images contain millions of these.', expl: 'Pixels are the smallest image units in digital and satellite imagery.', cat: 'GRSS', pts: 100, type: 'scramble' },
      { word: 'CANYON', sc: 'NAYNCO', hint: 'A deep natural valley.', hint2: 'Usually carved by rivers over time.', expl: 'Canyons are major geological landforms studied in Earth science and terrain analysis.', cat: 'GRSS', pts: 100, type: 'scramble' },
      { word: 'DELTA', sc: 'AETLD', hint: 'Formed where rivers meet larger water bodies.', hint2: 'Often triangular and rich in sediment.', expl: 'Deltas are important geological and environmental regions studied in hydrology and remote sensing.', cat: 'GRSS', pts: 100, type: 'scramble' },
    ],
    riddles: [
      { q: "I am motion born from surrender. Endless descent without arrival. A path carved by attraction, yet never reaching its center. What am I?", ans: 'ORBIT', hint: 'The Moon has been locked in me for billions of years.', hint2: 'Too slow and you fall. Too fast and you flee.', expl: 'An orbit is the curved path of a satellite around Earth — a perfect balance between gravitational pull and forward velocity. Too slow and gravity wins; too fast and the object escapes. It is the foundation of all satellite-based remote sensing.', cat: 'GRSS', pts: 100, type: 'riddle' },
      { q: "The more humans take, the less of me remains. I am measured from space, yet rooted to the ground. My condition is revealed in color from above. What am I?", ans: 'VEGETATION', hint: 'Satellites track my health from above.', hint2: 'Farmers and scientists watch me closely from orbit.', expl: 'Vegetation health is monitored from space using NDVI (Normalized Difference Vegetation Index). Healthy vegetation appears green in satellite data while stressed or lost areas appear red — a core application in IEEE Geoscience and Remote Sensing.', cat: 'GRSS', pts: 100, type: 'riddle' },
      { q: "I divide the Earth without walls or fences. Invisible to humans, yet nations obey me. What am I?", ans: 'LATITUDE', hint: 'Found using coordinates.', hint2: 'Used in mapping and navigation.', expl: 'Latitude lines are essential in mapping, GPS, and geospatial systems.', cat: 'GRSS', pts: 100, type: 'riddle' },
      { q: "I measure but have no ruler. I fly but have no wings. I can see everything, yet I have no eyes. What am I?", ans: 'SATELLITE', hint: 'I am far above you most of the time.', hint2: 'I am used in observation and data collection.', expl: 'Satellites measure Earth, orbit (fly), and observe without human features.', cat: 'GRSS', pts: 100, type: 'riddle' },
      { q: "I speak in invisible pulses and listen for echoes in return. Through clouds and darkness, I reveal what eyes cannot see. What am I?", ans: 'RADAR', hint: 'Used in weather forecasting.', hint2: 'Uses radio waves.', expl: 'Radar uses radio waves and reflected signals to detect storms, terrain, and moving objects.', cat: 'GRSS', pts: 100, type: 'riddle' },
    ],
  },
  level2: {
    qs: [
      { img: '/images/level2/cyclone.jpeg', q: 'What are you looking at? (The Spinning Monster)', opts: ['Tornado', 'Cyclone', 'Whirlpool', 'Alien portal'], ans: 'Whirlpool', expl: 'Whirlpool are massive rotating storm systems that form over warm tropical waters.', pts: 150, hint: 'Big, organized storm system', hint2: 'Born over warm seas' },
      { img: '/images/level2/drought.jpeg', q: "What's happening? (The Thirsty Earth)", opts: ['Flood party', 'Forest growth', 'Drought', 'Snowfall'], ans: 'Drought', expl: 'Droughts occur when a region receives significantly less rain than normal for a long period.', pts: 150, hint: 'Too much sun, not enough rain', hint2: 'Water = missing' },
      { img: '/images/level2/vegetation_health.jpeg', q: 'What is being analyzed? (The Color Code Mystery)', opts: ['Volcano heat', 'Vegetation health', 'Ocean depth', 'Airplanes'], ans: 'Vegetation health', expl: 'Vegetation health is measured using NDVI, where healthy plants reflect more near-infrared light.', pts: 150, hint: 'Farmers love this data', hint2: 'NDVI is involved' },
      { img: '/images/level2/landslide.jpeg', q: 'Identify the disaster: (The Mountain Collapse)', opts: ['Earthquake', 'Landslide', 'Avalanche', 'Tsunami'], ans: 'Landslide', expl: 'Landslides involve the downward movement of rock or earth from a mountain or cliff.', pts: 150, hint: 'Gravity is the villain', hint2: 'Things get buried' },
      { img: '/images/level2/sar.jpeg', q: 'What tech is this? (The Night Vision Satellite)', opts: ['Normal camera', 'Thermal sensor', 'Synthetic Aperture Radar (SAR)', 'Drone footage'], ans: 'Synthetic Aperture Radar (SAR)', expl: 'SAR uses microwave signals to see through clouds, rain, and darkness, providing clear imagery 24/7.', pts: 150, hint: 'Clouds? No problem', hint2: 'Sends its own signals' },
    ],
  },
  level3: {
    chs: [
      { em: '🌋🔥💨🪨', word: 'VOLCANO', hint: 'Explodes with lava.', hint2: 'Found in tectonic regions.', expl: 'Volcanoes are mountains that erupt, spewing lava and ash.', pts: 150 },
      { em: '🌊⚠️🌏', word: 'TSUNAMI', hint: 'A massive ocean wave triggered by a submarine earthquake', expl: 'Ocean wave + hazard warning + global coastline impact = TSUNAMI.', pts: 200 },
      { em: '❄️🏔️📉', word: 'GLACIER', hint: 'A slow-moving mass of compacted ice that shapes mountain valleys', expl: 'Ice + mountain terrain + shrinking over time = GLACIER.', pts: 200 },
      { em: '🌪️👁️🌀', word: 'CYCLONE', hint: 'A large rotating storm system tracked continuously by geostationary weather satellites', expl: 'Rotating winds + eye + spiral structure = CYCLONE.', pts: 250 },
      { em: '💡🛩🗺📐', word: 'LIDAR', hint: 'Uses lasers to measure distance.', hint2: 'Used in mapping and terrain analysis.', expl: 'Light + Detection + Ranging.', pts: 250 },
      { em: '🌀💨🌧🌊', word: 'HURRICANE', hint: 'A powerful storm.', hint2: 'Forms over warm oceans.', expl: 'Hurricanes are massive tropical storms with high winds and heavy rain.', pts: 250 },
      { em: '🛰🌍📡🔭', word: 'SATELLITE', hint: 'Orbits Earth.', hint2: 'Used for communication and imaging.', expl: 'Satellites orbit Earth to collect data and provide communications.', pts: 200 },
      { em: '🌊🏖☀🦀', word: 'BEACH', hint: 'A relaxing vacation spot.', hint2: 'Sand, sea, and sunshine.', expl: 'A beach is a landform alongside a body of water which consists of loose particles.', pts: 150 },
    ],
  },
  level4: {
    qs: [
      { q: 'A satellite detects large swirling clouds over the ocean. What is most likely forming?', opts: ['Earthquake', 'Cyclone', 'Landslide', 'Volcano'], ans: 'Cyclone', expl: '[Cyclone]: A cyclone forms over warm ocean water and is characterized by its spiral cloud pattern.', diff: 1, pts: 100 },
      { q: 'Which atmospheric gas contributes most to anthropogenic warming?', opts: ['Methane', 'Nitrogen', 'Carbon dioxide', 'Ozone'], ans: 'Carbon dioxide', expl: '[Carbon dioxide]: CO2 is a major greenhouse gas released primarily from vehicles and industry.', diff: 1, pts: 100 },
      { q: 'Which satellite imaging method is most useful during floods with heavy cloud cover?', opts: ['Optical imagery', 'Infrared imagery', 'SAR imagery', 'RGB photography'], ans: 'SAR imagery', expl: '[SAR imagery]: Synthetic Aperture Radar (SAR) is an active remote sensing method that works in bad weather and sees through clouds.', diff: 2, pts: 150 },
      { q: 'Remote sensing satellites mainly collect data using:', opts: ['Touch sensors', 'Cameras & sensors', 'Sound waves only', 'Heat from Earth core'], ans: 'Cameras & sensors', expl: '[Cameras & sensors]: Satellites orbit in space and detect reflected radiation using specialized cameras and sensors.', diff: 1, pts: 100 },
      { q: 'Deforestation mainly leads to:', opts: ['More rainfall', 'Soil erosion', 'Less oxygen use', 'Reduced pollution'], ans: 'Soil erosion', expl: '[Soil erosion]: When trees are removed, the lack of roots causes soil to wash away easily.', diff: 2, pts: 150 },
      { q: 'Which disaster is caused by sudden movement of tectonic plates?', opts: ['Flood', 'Cyclone', 'Earthquake', 'Drought'], ans: 'Earthquake', expl: '[Earthquake]: An earthquake is measured on the Richter scale and happens due to underground tectonic movement.', diff: 1, pts: 100 },
      { q: 'NDVI (Normalized Difference Vegetation Index) is used to:', opts: ['Vegetation density', 'Vegetation health', 'Surface temperature', 'Atmospheric moisture'], ans: 'Vegetation health', expl: '[Vegetation health]: NDVI is a satellite-derived index widely used in agriculture to monitor vegetation health.', diff: 2, pts: 150 },
      { q: 'Which satellite dataset is most useful for monitoring urban heat islands?', opts: ['Thermal imagery', 'Elevation maps', 'Rainfall data', 'Ocean currents'], ans: 'Thermal imagery', expl: '[Thermal imagery]: It detects temperature variations, making it essential for urban planning and monitoring heat.', diff: 3, pts: 200 },
      { q: 'Synthetic Aperture Radar (SAR) is useful because it:', opts: ['Works only in sunlight', 'Cannot see through clouds', 'Works day and night, even through clouds', 'Only measures temperature'], ans: 'Works day and night, even through clouds', expl: '[SAR]: SAR is an active remote sensing technology that penetrates clouds and works equally well in day and night.', diff: 3, pts: 200 },
      { q: 'A sudden rise in sea level threatens coastal cities. What is the main cause?', opts: ['Earth rotation', 'Climate change', 'Moon shrinking', 'Soil formation'], ans: 'Climate change', expl: '[Climate change]: Global temperature increases and melting glaciers directly contribute to rising sea levels.', diff: 3, pts: 200 },
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

export default DATA;

export const LEVEL_INTROS: Record<number, { icon: string; badge: string; title: string; story: string; rules: string }> = {
  1: { icon: '🔤', badge: 'MISSION 01', title: 'WORD SCRAMBLE & RIDDLES', story: "Welcome Analyst. Your first mission is to decode encrypted field terminology. Unscramble the data and solve the geospatial riddles to proceed.", rules: '📋 Mission Rules\n• 10 challenges: 5 Scrambles + 5 Riddles\n• ⏱ 60 seconds per challenge\n• Speed is critical for high scores\n• Type and press Enter to submit' },
  2: { icon: '🛰️', badge: 'MISSION 02', title: 'IMAGE GUESSING', story: "The visual feed is incoming. You must identify terrain, satellites, and environmental phenomena from high-resolution orbital imagery.", rules: '📋 Mission Rules\n• 5 orbital image analysis tasks\n• ⏱ 60 seconds per image\n• Choose the correct identification\n• Precision and speed generate max points' },
  3: { icon: '🔐', badge: 'MISSION 03', title: 'EMOJI HANGMAN', story: "We've intercepted a series of emoji-encoded geoscience terms. Reconstruct the original terminology before the uplink times out.", rules: '📋 Mission Rules\n• 5 Emoji Hangman challenges\n• ⏱ 120 seconds per challenge\n• 6 wrong guesses allowed\n• Hints appear at the 60-second mark' },
  4: { icon: '⚡', badge: 'MISSION 04', title: 'RAPID FIRE', story: "A massive data cascade is flooding the terminal. You have seconds to classify incoming remote sensing data. NO ROOM FOR ERROR.", rules: '📋 Mission Rules\n• 10 High-speed MCQs\n• ⏱ 90 seconds per question\n• Progressive difficulty scaling\n• Base points increase with difficulty level' },
  5: { icon: '🌍', badge: 'MISSION 05', title: 'THE FINAL SEGREGATION', story: "This is the ultimate field test. You will analyze real geoscience disaster scenarios, compete in a live tool marketplace under dynamic pricing, then deploy your resources with surgical precision. Every decision counts — and every second costs.", rules: '📋 Mission Rules\n• Phase A: Analyse 4 field reports, classify each threat\n• Phase B: Live auction — budget = your total score + 100\n• Tool prices increase every 10 seconds — act fast!\n• Phase C: Evaluation — score based on threat ID accuracy + correct tool deployment tier' },
};

// Time limits per level type (seconds)
export const TIME_LIMITS: Record<number, number> = {
  1: 25,   // 25s per question
  2: 25,   // 25s per image
  3: 25,   // 25s per hangman
  4: 15,   // 15s for Rapid Fire (increased intensity)
};
export const AUCTION_TIME = 420;  // 420s for tool auction
export const DISASTER_TIME = 300; // 300s for disaster response
export const INTRO_TIME = 15;     // 15s level intro
export const REVIEW_TIME = 10;    // 10s answer review
