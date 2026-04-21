// ======================================================
// GRSS FIELD ANALYST — GAME DATA
// All question content, tools, disasters from antigravity-prompt.md
// ======================================================

export interface ScrambleQ {
  word: string;
  sc: string;
  hint: string;
  cat: string;
  pts: number;
  type: 'scramble';
}

export interface RiddleQ {
  q: string;
  ans: string;
  hint: string;
  cat: string;
  pts: number;
  type: 'riddle';
}

export type Level1Q = ScrambleQ | RiddleQ;

export interface ImageQ {
  img: string;
  q: string;
  opts: string[];
  ans: number; // index into opts
  expl: string;
  pts: number;
}

export interface HangmanChallenge {
  em: string;
  word: string;
  hint: string;
  expl: string;
  pts: number;
}

export interface MCQQuestion {
  q: string;
  opts: string[];
  ans: number;
  expl: string;
  diff: 1 | 2 | 3;
  pts: number;
}

export interface Tool {
  id: string;
  name: string;
  price: number;
  icon: string;
  desc: string;
  eff: { flood: number; wildfire: number; earthquake: number };
}

export interface Combo {
  tools: string[];
  name: string;
  bonus: number;
  desc: string;
  icon: string;
}

export interface Disaster {
  id: 'flood' | 'wildfire' | 'earthquake';
  name: string;
  icon: string;
  color: string;
  desc: string;
  optTools: string[];
  metrics: string[];
}

export interface GameData {
  level1: { scrambles: ScrambleQ[]; riddles: RiddleQ[] };
  level2: { qs: ImageQ[] };
  level3: { chs: HangmanChallenge[] };
  level4: { qs: MCQQuestion[] };
  level5: { tools: Tool[]; combos: Combo[]; disasters: Disaster[] };
}

const DATA: GameData = {
  level1: {
    scrambles: [
      { word: 'LIDAR', sc: 'RIDAL', hint: 'Light Detection And Ranging — uses laser pulses to measure distance to the ground surface', cat: 'Remote Sensing', pts: 100, type: 'scramble' },
      { word: 'RADAR', sc: 'ARRAD', hint: 'Radio Detection And Ranging — uses radio waves to detect objects and measure distances', cat: 'Remote Sensing', pts: 100, type: 'scramble' },
      { word: 'PIXEL', sc: 'XELIP', hint: 'The smallest discrete unit of a digital satellite image — think of it as one tiny square of colour data', cat: 'Image Basics', pts: 100, type: 'scramble' },
      { word: 'THERMAL', sc: 'LAHRMET', hint: 'Related to heat energy; infrared satellite sensors detect this to map surface temperatures', cat: 'Electromagnetics', pts: 150, type: 'scramble' },
      { word: 'LANDSAT', sc: 'TASLAND', hint: "The world's longest-running Earth observation satellite programme, operated since 1972 by NASA and USGS", cat: 'Satellites', pts: 200, type: 'scramble' },
    ],
    riddles: [
      { q: "I have 8 spectral bands but can't play music. I've orbited Earth since 1972, and my latest version is number 9. What am I?", ans: 'LANDSAT', hint: 'A famous NASA/USGS satellite programme for continuous Earth observation since 1972', cat: 'Satellites', pts: 150, type: 'riddle' },
      { q: "Scientists love me when I'm between 0.6 and 0.9. Healthy forests make me high; concrete and deserts keep me low. I compare red and near-infrared light. What am I?", ans: 'NDVI', hint: 'A vegetation health index calculated from two spectral bands captured by satellites', cat: 'Vegetation', pts: 200, type: 'riddle' },
      { q: "I was drilled from 3 km below Antarctic ice. I hold tiny air bubbles from 800,000 years ago. Climate scientists treasure me. What am I?", ans: 'ICE CORE', hint: 'A cylindrical sample extracted from glaciers — contains ancient atmospheric gas records', cat: 'Climate Science', pts: 200, type: 'riddle' },
      { q: "30 of my siblings orbit Earth at 20,200 km altitude. Together we help ships, pilots, and hikers know exactly where they are. What system are we?", ans: 'GPS', hint: 'A satellite-based navigation system originally developed by the US Department of Defense', cat: 'Navigation', pts: 150, type: 'riddle' },
      { q: "I am a Copernicus mission launched by ESA. I see through clouds using C-band microwaves. Floods, earthquakes, and ship movements cannot hide from me. What am I?", ans: 'SENTINEL', hint: "ESA's Earth observation satellite constellation — provides free open data globally", cat: 'Satellites', pts: 250, type: 'riddle' },
    ],
  },
  level2: {
    qs: [
      { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/500px-The_Earth_seen_from_Apollo_17.jpg', q: 'This iconic photograph known as "The Blue Marble" was captured from space. What type of satellite imaging does it represent?', opts: ['True Color Composite', 'False Color Infrared', 'Synthetic Aperture Radar (SAR)', 'Thermal Infrared Mosaic'], ans: 0, expl: 'The Blue Marble is a true color composite — showing Earth as human eyes would see it, using Red, Green and Blue spectral bands to produce natural-looking imagery.', pts: 150 },
      { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Hurricane_Isabel_from_ISS.jpg/500px-Hurricane_Isabel_from_ISS.jpg', q: 'This photo was captured from the International Space Station. What extreme weather phenomenon is shown?', opts: ['Tornado', 'Hurricane / Tropical Cyclone', 'Dust Storm', 'Volcanic Ash Plume'], ans: 1, expl: 'Hurricane Isabel (2003) shows the characteristic spiral bands and clear eye of a tropical cyclone. Geostationary satellites track these storms 24/7, enabling early warnings that save thousands of lives.', pts: 150 },
      { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Amazon_deforestation.jpg/500px-Amazon_deforestation.jpg', q: 'This Landsat satellite image of the Amazon Basin reveals a major environmental crisis. What is being shown?', opts: ['River Flooding', 'Systematic Deforestation', 'Agricultural Irrigation Grid', 'Oil Spill from Pipeline'], ans: 1, expl: 'The geometric clearing pattern is a classic signature of systematic deforestation. Satellites like Landsat and Sentinel-2 track global forest loss — Brazil lost over 11,000 km² in 2022 alone, primarily detected via satellite remote sensing.', pts: 200 },
      { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/NOAA-NASA_Suomi_NPP_satellite_image_of_northern_India_and_surrounding_countries_at_night.jpg/500px-NOAA-NASA_Suomi_NPP_satellite_image_of_northern_India_and_surrounding_countries_at_night.jpg', q: 'This nighttime satellite composite from Suomi NPP is used by economists and geographers to measure what?', opts: ['Lightning Activity Patterns', 'Human Settlement Density & Economic Activity', 'Volcanic Hotspot Activity', 'Aurora Borealis Distribution'], ans: 1, expl: 'Night lights detected by the VIIRS instrument are a powerful proxy for economic activity, electrification and urbanisation. The "light pollution index" correlates strongly with GDP per capita across nations.', pts: 200 },
      { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Aletschgletscher_mit_Jungfrau.jpg/500px-Aletschgletscher_mit_Jungfrau.jpg', q: 'Multi-temporal satellite imagery of Alpine glaciers like this one is used to track which critical environmental indicator?', opts: ['Tectonic Uplift of Mountain Ranges', 'Glacial Retreat due to Climate Change', 'New Volcanic Formation', 'Increased Snowfall from La Niña'], ans: 1, expl: 'Repeat satellite observations (Landsat archives go back to 1972!) document Alpine glacier retreat at 50+ metres per year. SAR interferometry can detect millimetre-scale surface changes from orbit, making it invaluable for climate science.', pts: 250 },
    ],
  },
  level3: {
    chs: [
      { em: '🛰️💡🌍', word: 'LIDAR', hint: 'Pulses of laser light measure precise distance to the ground surface — creates 3D terrain maps', expl: 'Satellite platform + Laser light + Earth surface = LiDAR. Creates 3D elevation models with centimetre accuracy — used for flood depth mapping and urban planning!', pts: 150 },
      { em: '🌊⚠️🌏', word: 'TSUNAMI', hint: 'A massive ocean wave triggered by a submarine earthquake or undersea landslide', expl: 'Ocean wave + hazard warning + global coastline impact = TSUNAMI. GRSS scientists use SAR satellites to measure wave run-up extents within minutes of a seismic event!', pts: 200 },
      { em: '❄️🏔️📉', word: 'GLACIER', hint: 'A slow-moving mass of compacted ice that shapes mountain valleys over millennia', expl: 'Ice + mountain terrain + shrinking over time = GLACIER. Monitoring glaciers from space is one of the most critical datasets in global climate science!', pts: 200 },
      { em: '🌪️👁️🌀', word: 'CYCLONE', hint: 'A large rotating storm system tracked continuously by geostationary weather satellites', expl: 'Rotating winds + eye + spiral structure = CYCLONE. Geostationary satellites like INSAT-3D provide 15-minute imagery of developing cyclones over the Indian Ocean!', pts: 250 },
      { em: '🔥🌲🗺️', word: 'WILDFIRE', hint: 'An uncontrolled fire spreading through vegetation, monitored by thermal infrared satellite sensors', expl: 'Fire + forest/vegetation + mapped from space = WILDFIRE. NASA FIRMS delivers near-real-time active fire data from MODIS and VIIRS instruments — updated every few hours!', pts: 250 },
    ],
  },
  level4: {
    qs: [
      { q: 'What does NDVI stand for in remote sensing?', opts: ['Normalized Difference Vegetation Index', 'National Digital Vegetation Interface', 'Natural Data Visualization Index', 'Normalized Distribution Visual Index'], ans: 0, expl: 'NDVI = (NIR − Red)/(NIR + Red). Values range from −1 (water/bare rock) to +1 (dense rainforest). It is the most widely used spectral index for monitoring vegetation health and land cover change from space.', diff: 1, pts: 100 },
      { q: 'Which type of radar sensor does the ESA Sentinel-1 satellite carry?', opts: ['X-band Radar', 'L-band Radar', 'C-band SAR', 'P-band SAR'], ans: 2, expl: 'Sentinel-1 carries a C-band Synthetic Aperture Radar operating at 5.4 GHz. C-band balances cloud-penetration capability with spatial resolution, making it ideal for flood mapping, ship detection and ground deformation monitoring.', diff: 2, pts: 150 },
      { q: 'Which spectral band combination is BEST for delineating water bodies from a satellite image?', opts: ['Red + Green bands', 'NIR + SWIR bands', 'Blue + Green bands', 'Thermal + Panchromatic'], ans: 1, expl: 'Water strongly absorbs Near-Infrared (NIR) and Short-Wave Infrared (SWIR) energy, appearing very dark in these bands. Combining NIR+SWIR creates high contrast between water and surrounding land, enabling accurate water body mapping.', diff: 2, pts: 150 },
      { q: 'IEEE GRSS (Geoscience and Remote Sensing Society) is primarily focused on:', opts: ['GPS navigation and positioning systems', 'Geoscience and remote sensing science and technology', 'Geological rock formation studies', 'Ground robotics and spatial computing'], ans: 1, expl: "IEEE GRSS is the premier professional society for Earth observation scientists. It publishes IEEE TGRS — one of the highest-impact journals in the field — and organises IGARSS, the world's largest annual remote sensing conference.", diff: 1, pts: 100 },
      { q: 'What is the PRIMARY advantage of SAR over optical satellite sensors?', opts: ['Higher spatial resolution', 'All-weather, day-and-night imaging capability', 'More spectral bands available', 'Significantly lower cost per scene'], ans: 1, expl: 'SAR uses microwave energy (1–30 GHz) that penetrates cloud cover and operates independently of sunlight. This makes it essential for monitoring floods under storm clouds, detecting ship movements in fog, and measuring post-earthquake ground deformation.', diff: 2, pts: 150 },
      { q: 'Which programme provides FREE and OPEN access to the full Sentinel satellite data archive?', opts: ['NASA Earthdata', 'The Copernicus Programme (ESA)', 'JAXA EORC', 'ISRO Bhuvan'], ans: 1, expl: 'The EU Copernicus Programme, implemented by ESA, provides completely free and open access to all Sentinel data. This open data policy has democratised Earth observation, enabling research in over 100 countries and spawning a multi-billion-dollar downstream services industry.', diff: 2, pts: 150 },
      { q: 'In remote sensing, what does "temporal resolution" refer to?', opts: ['The pixel size on the ground', 'How often a satellite revisits and images the same location', 'The number of spectral bands a sensor records', 'The altitude of the satellite orbit'], ans: 1, expl: 'Temporal resolution = revisit time. Geostationary satellites (e.g., GOES, Meteosat) image continuously every 10–15 minutes. Landsat revisits every 16 days; Sentinel-2 every 5 days. High temporal resolution is critical for tracking fast-changing events like floods and wildfires.', diff: 2, pts: 150 },
      { q: 'Which satellite spectral band is MOST useful for highlighting vegetation health in a false-color composite?', opts: ['Blue band (0.45–0.52 μm)', 'Green band (0.52–0.60 μm)', 'Near-Infrared band (0.76–0.90 μm)', 'Thermal Infrared band (10–12 μm)'], ans: 2, expl: 'Healthy vegetation strongly reflects Near-Infrared (NIR) while absorbing Red light. In a false-color composite displaying NIR as red, healthy vegetation appears bright red — instantly revealing forest health, crop stress and vegetation density from space.', diff: 3, pts: 200 },
      { q: 'What is "orthorectification" in remote sensing image processing?', opts: ['Enhancing image brightness and contrast levels', 'Correcting geometric distortions caused by terrain relief and sensor geometry', 'Removing atmospheric scattering and haze effects', 'Classifying pixels into land cover categories'], ans: 1, expl: 'Orthorectification removes spatial distortions caused by terrain relief displacement and sensor tilt. The result is a geometrically accurate orthophoto equivalent to a true map — essential for measuring distances, areas and overlaying multiple datasets in GIS.', diff: 3, pts: 200 },
      { q: 'The Landsat 9 satellite was launched in which year, continuing a 50-year Earth observation legacy?', opts: ['2015', '2018', '2021', '2023'], ans: 2, expl: 'Landsat 9 launched on September 27, 2021, carrying OLI-2 (Operational Land Imager) and TIRS-2 (Thermal Infrared Sensor). Together with Landsat 8, it achieves 8-day global coverage — the most scientifically valuable long-term Earth observation dataset ever collected.', diff: 3, pts: 200 },
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
      { tools: ['sar', 'lidar'], name: '3D Flood Intelligence Suite', bonus: 500, desc: 'SAR + LiDAR generates the most accurate flood depth maps in the world!', icon: '🏆' },
      { tools: ['thermal', 'ndvi'], name: 'Fire Risk Sentinel System', bonus: 350, desc: 'Thermal + NDVI perfectly maps active fire perimeters and burn severity!', icon: '🔥' },
      { tools: ['gps', 'seismic'], name: 'Earthquake Intelligence System', bonus: 450, desc: 'GPS + Seismic arrays predict aftershocks and ground failure with high accuracy!', icon: '⚠️' },
      { tools: ['drone', 'comm'], name: 'Tactical Response Unit', bonus: 300, desc: 'UAV drones + Comm relay enable coordinated real-time rescue operations!', icon: '📡' },
    ],
    disasters: [
      { id: 'flood', name: 'BANGLADESH MEGA-FLOOD', icon: '🌊', color: '#00c8ff', desc: 'Catastrophic monsoon flooding has inundated 30% of Bangladesh. 2.3 million people are displaced. Rising waters are cutting off villages and communication towers. The government needs a satellite-based damage assessment and evacuation corridor map within 6 hours.', optTools: ['sar', 'flood_ai', 'lidar', 'comm'], metrics: ['Flood extent mapping accuracy', 'Population exposure quantification', 'Infrastructure damage detection', 'Evacuation route planning quality'] },
      { id: 'wildfire', name: 'CALIFORNIA MEGA-FIRE', icon: '🔥', color: '#ff6b35', desc: 'A rapidly spreading wildfire in Northern California has consumed 80,000 acres in 12 hours. Dense smoke is grounding all aircraft. 80,000 residents may need emergency evacuation. Satellite-based monitoring is the only viable real-time assessment tool available.', optTools: ['thermal', 'ndvi', 'drone', 'comm'], metrics: ['Active fire perimeter mapping', 'Fire spread direction forecast', 'Air quality hazard monitoring', 'Evacuation zone prioritisation'] },
      { id: 'earthquake', name: 'TURKEY M7.8 EARTHQUAKE', icon: '⚠️', color: '#ffaa00', desc: 'A catastrophic 7.8 magnitude earthquake has struck southeastern Turkey. Thousands of buildings have collapsed. International rescue teams are mobilising but need ground displacement maps, structural damage grids and aftershock risk zones to prioritise search-and-rescue operations.', optTools: ['sar', 'seismic', 'gps', 'optical'], metrics: ['Ground displacement (InSAR) mapping', 'Building collapse detection accuracy', 'Aftershock risk zone delineation', 'Search & rescue prioritisation score'] },
    ],
  },
};

export default DATA;

export const LEVEL_INTROS = {
  1: { icon: '🔤', badge: 'MISSION 01', title: 'TRAINING MISSION', story: "You've just been deployed as a GRSS Field Analyst. Your first test: prove you understand the core language of geoscience. Unscramble classified satellite terminology and decode encrypted field riddles. Your accuracy and response speed are being evaluated.", rules: '📋 Mission Rules\n• 10 questions: 5 Word Scrambles + 5 Riddles (randomised)\n• ⏱ 60 seconds per question\n• Type your answer and press Enter or click Submit\n• Speed bonus awarded for fast correct answers\n• Power-ups (Hint / Skip / Freeze) available at any time' },
  2: { icon: '🛰️', badge: 'MISSION 02', title: 'INTELLIGENCE GATHERING', story: "Ground sensors are offline. Your only asset is a constellation of satellites. Analyse incoming imagery and correctly identify what Earth's orbit is revealing. Every second of hesitation costs lives.", rules: '📋 Mission Rules\n• 5 satellite image analysis questions\n• ⏱ 60 seconds per image\n• Select the correct interpretation from 4 options\n• Progressive difficulty — later images are harder\n• Speed bonus applies throughout' },
  3: { icon: '🔐', badge: 'MISSION 03', title: 'CODE BREAKING', story: "Intercepted transmissions contain encrypted geoscience terminology — but the enemy has replaced all text with emoji sequences. Your decoder unit must reconstruct the original words. Six wrong guesses and the mission fails.", rules: '📋 Mission Rules\n• 5 Emoji Hangman challenges\n• ⏱ 2 minutes per challenge\n• Click letters to guess — 6 wrong guesses allowed\n• 💡 A letter auto-reveals at the 1-minute mark\n• Use Hint power-up for an extra clue!' },
  4: { icon: '⚡', badge: 'MISSION 04', title: 'RAPID ASSESSMENT', story: "Incoming alert — decision time. A cascade of satellite data is flooding your terminal. You must rapidly assess and classify each data feed. There's no time for hesitation. Trust your training.", rules: '📋 Mission Rules\n• 10 multiple-choice questions\n• ⏱ 90 seconds per question\n• Progressive difficulty (⭐ → ⭐⭐⭐)\n• Higher difficulty questions = more base points\n• Time bonus on every correct answer' },
  5: { icon: '🌍', badge: 'MISSION 05', title: 'CORE SIMULATION', story: 'This is the final challenge. A real disaster is unfolding. First, acquire the best satellite monitoring tools from a live auction — but prices are rising. Then deploy your tools to respond to a real-world crisis scenario. The Earth is counting on your strategy.', rules: '📋 Mission Rules\n• Part A: Auction — $10,000 budget, max 5 tools, prices rise +10% every 20s\n• You can sell tools back at 70% value\n• Part B: Disaster Response — deploy tools to address the crisis\n• Scoring = tool effectiveness + budget efficiency + combo bonuses\n• Tool combo combinations earn big bonus points!' },
};
