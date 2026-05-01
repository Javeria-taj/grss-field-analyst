// ─── Level 5 Data ─── (client-side, no answers exposed until Phase 5C)
// Matches the reference: online_viewer_net.html

export interface CaseStudy {
  id: 'cs1' | 'cs2' | 'cs3' | 'cs4';
  label: string;
  title: string;
  desc: string;
  opts: string[];
  correct: number;      // index into opts — only used in Phase 5C
  correctName: string;
}

export interface L5Tool {
  id: string;
  name: string;
  icon: string;
  cs: number | null;    // 1-4 = correct case study; null = decoy
  tier: number | null;  // 0=Primary, 1=Secondary, 2=Tertiary; null = decoy
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs1',
    label: 'Case Study 1',
    title: 'Alpine River Basin Anomaly',
    desc: 'A low-lying river basin is experiencing sudden, violent overflow. Local meteorological data shows zero rainfall for the past 72 hours. The river originates from a glaciated mountain range 300 km upstream. Downstream communities report walls of debris-laden water arriving with absolutely no warning.',
    opts: ['GLOF (Glacial Lake Outburst Flood)', 'Tsunami', 'Normal River Flooding', 'Dam Release'],
    correct: 0,
    correctName: 'GLOF',
  },
  {
    id: 'cs2',
    label: 'Case Study 2',
    title: 'Urban Air Stratification Event',
    desc: 'A major metropolitan area reports severe low-altitude signal disruptions. Ground-level sensors register dangerously high particulate matter while aircraft above 800 m confirm clean air. Conditions worsen sharply overnight and during early morning cold spells, then partially clear by early afternoon.',
    opts: ['Temperature Inversion', 'Urban Smog', 'Fog', 'Gas Leakage'],
    correct: 0,
    correctName: 'Temperature Inversion',
  },
  {
    id: 'cs3',
    label: 'Case Study 3',
    title: 'Pacific Atoll Health Crisis',
    desc: 'A remote Pacific island community reports unusual skin lesions and eye irritation despite clear skies and no obvious pollution source. Synthetic materials — plastic containers, rubber seals — are becoming brittle at an accelerated rate. UV-sensitive marine wildlife populations are in sharp decline. Air quality sensors show entirely normal readings.',
    opts: ['Ozone Layer Depletion', 'Factory Contamination', 'Radioactive Air', 'AQI 500'],
    correct: 0,
    correctName: 'Ozone Layer Depletion',
  },
  {
    id: 'cs4',
    label: 'Case Study 4',
    title: 'Coastal Industrial Zone Incident',
    desc: 'A coastal town adjacent to a heavy-industry port reports sudden onset of respiratory distress among the population. Fish and marine life within 5 km of the coast are dying in large numbers. A distinctive yellowish-brown haze hovers at low altitude over the port area. The incident began overnight, correlating with offshore wind patterns.',
    opts: ['Industrial Gas Leak', 'Volcanic Activity', 'Radioactive Disaster', 'Air Pollution'],
    correct: 0,
    correctName: 'Industrial Gas Leak',
  },
];

export const TOOLS: L5Tool[] = [
  { id: 'sar',   name: 'Synthetic Aperture Radar (SAR)',   icon: '📡', cs: 1, tier: 0 },
  { id: 'rgm',   name: 'River Gauge Monitoring',            icon: '🌊', cs: 1, tier: 1 },
  { id: 'sas',   name: 'Seismic Activity Systems',          icon: '📊', cs: 1, tier: 2 },
  { id: 'lap',   name: 'LIDAR Atmospheric Profiling',       icon: '💡', cs: 2, tier: 0 },
  { id: 'gaqs',  name: 'Ground-Based Air Quality Sensors',  icon: '🌬️', cs: 2, tier: 1 },
  { id: 'soi',   name: 'Satellite Optical Imaging',         icon: '🔭', cs: 2, tier: 2 },
  { id: 'guvs',  name: 'Ground-Based UV Spectroradiometer', icon: '☀️', cs: 3, tier: 0 },
  { id: 'aura',  name: 'Aura (OMI Instrument)',             icon: '🛸', cs: 3, tier: 1 },
  { id: 'uvifs', name: 'UV Index Forecasting System',       icon: '🌡️', cs: 3, tier: 2 },
  { id: 'doas',  name: 'DOAS Air Monitoring',               icon: '🔬', cs: 4, tier: 0 },
  { id: 's5p',   name: 'Sentinel-5P (TROPOMI)',             icon: '🛰️', cs: 4, tier: 1 },
  { id: 'aloha', name: 'ALOHA Dispersion Software',         icon: '💻', cs: 4, tier: 2 },
  // Decoys
  { id: 'bwb',   name: 'Basic Weather Balloon',             icon: '🎈', cs: null, tier: null },
  { id: 'sgc',   name: 'Standard Geiger Counter',           icon: '☢️', cs: null, tier: null },
  { id: 'nrn',   name: 'Nexus Relay Node',                  icon: '📶', cs: null, tier: null },
  { id: 'sp',    name: 'Signal Proxy',                      icon: '📟', cs: null, tier: null },
];

export const TIERS = ['🥇', '🥈', '🥉'];
export const TIER_LABELS = ['Primary', 'Secondary', 'Tertiary'];

export const HIKE_INTERVAL = 10; // seconds
export const HIKE_AMT = 10;      // points per hike
export const BASE_PRICE = 200;   // starting tool price

// Scoring constants
export const PHASE_A_CORRECT_PTS = 500;
export const PHASE_B_PERFECT_PTS = 1000;    // right tool, right cs, right tier
export const PHASE_B_PARTIAL_PTS = 400;     // right tool, right cs, wrong tier
export const PHASE_B_DECOY_PTS = 0;
export const PHASE_B_WRONG_PTS = 0;
