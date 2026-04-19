# ANTIGRAVITY BUILD PROMPT
## IEEE GRSS FIELD ANALYST — Full-Stack Gamified Geoscience Platform

---

## PROJECT OVERVIEW

Build a **fully interactive, gamified geoscience web platform** for **IEEE GRSS (Geoscience and Remote Sensing Society)** designed for a **live event with 200–250 concurrent participants**. The platform is called **"GRSS Field Analyst"** — players take on the role of an Earth-monitoring agent on a mission to save the planet through 5 progressive levels.

---

## TECHNICAL STACK

### Frontend
- **Framework:** React (Next.js 14 with App Router)
- **Styling:** Tailwind CSS + custom CSS animations
- **State Management:** Zustand
- **Fonts:** Google Fonts — Orbitron (display/mono), Exo 2 (body)
- **Audio:** Web Audio API (synthesised tones — no audio file dependencies)
- **Animations:** Framer Motion
- **Charts/Results:** Recharts

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose (preferred for leaderboard flexibility)
- **Auth:** Session-based (name + USN — no passwords required)
- **Real-time:** Socket.io (for live leaderboard updates during event)
- **Deployment-ready:** Docker-compose file included

### File Structure
```
/grss-field-analyst
├── /frontend          ← Next.js React app
│   ├── /app
│   ├── /components
│   ├── /stores
│   └── /lib
├── /backend           ← Express API
│   ├── /routes
│   ├── /models
│   ├── /controllers
│   └── server.js
├── docker-compose.yml
├── .env.example
└── README.md          ← Full setup + deployment guide
```

---

## DESIGN SYSTEM

### Theme
- **Dark mode only** — background: `#03070f` (near-black deep space)
- **Primary accent:** `#00c8ff` (electric cyan)
- **Secondary accent:** `#00ff9d` (neon green)
- **Danger:** `#ff2d55` | **Warning:** `#ffaa00` | **Gold:** `#ffd700`
- **Cards:** `rgba(10,20,45,0.92)` with `backdrop-filter: blur(12px)`
- **Borders:** `rgba(0,180,255,0.18)` default, brighter on hover/active

### Animated Background
- Procedural starfield canvas (200 stars, slow drift, twinkling alpha)
- Decorative Earth globe (CSS radial-gradient sphere, slow rotation)
- Subtle particle effects on level completion

### Typography
- `font-family: 'Orbitron', monospace` — all headings, scores, HUD elements, timers
- `font-family: 'Exo 2', sans-serif` — body text, options, descriptions

---

## AUTHENTICATION SYSTEM

### Requirements
- **No passwords.** Login requires: **Full Name** + **USN (University/Registration Number)**
- Two tabs: **LOGIN** (returning players) and **REGISTER** (new players)
- On register: create MongoDB user document, store name + USN + timestamp
- On login: look up by USN, retrieve existing score state
- Session stored in HTTP-only cookie (7-day expiry)
- No email verification required

### User Schema (MongoDB)
```js
{
  name: String,
  usn: String (unique, indexed),
  scores: {
    level1: Number,
    level2: Number,
    level3: Number,
    level4: Number,
    level5: Number
  },
  totalScore: Number,
  powerups: { hint: Number, skip: Number, freeze: Number },
  completedLevels: [Number],
  unlockedLevels: [Number],
  rank: String,
  createdAt: Date,
  lastActive: Date
}
```

---

## LEVEL STRUCTURE & CONTENT

All question content, scenarios and tool data are specified below. Build all levels using exactly this content.

---

### LEVEL 1 — TRAINING MISSION (Word Scramble + Riddles)
**Timer:** 60 seconds per question | **Questions:** 10 total (5 scrambles + 5 riddles, randomised order)

#### Word Scrambles
| Scrambled | Answer | Hint | Points |
|-----------|--------|------|--------|
| RIDAL | LIDAR | Light Detection And Ranging — laser-based 3D mapping | 100 |
| ARRAD | RADAR | Radio Detection And Ranging — uses radio waves to detect objects | 100 |
| XELIP | PIXEL | Smallest discrete unit of a digital satellite image | 100 |
| LAHRMET | THERMAL | Related to heat energy — detected by infrared satellite sensors | 150 |
| TASLAND | LANDSAT | World's longest-running Earth observation programme since 1972 (NASA/USGS) | 200 |

#### Riddles
| Riddle | Answer | Hint | Points |
|--------|--------|------|--------|
| "I have 8 spectral bands but can't play music. I've orbited Earth since 1972, and my latest version is number 9. What am I?" | LANDSAT | Oldest continuous Earth observation satellite programme | 150 |
| "Scientists love me when I'm between 0.6 and 0.9. Healthy forests make me high; concrete keeps me low. I compare red and near-infrared light. What am I?" | NDVI | Vegetation health index calculated from two spectral bands | 200 |
| "I was drilled from 3 km below Antarctic ice. I hold tiny air bubbles from 800,000 years ago. Climate scientists treasure me. What am I?" | ICE CORE | Cylindrical sample from glaciers containing ancient atmospheric records | 200 |
| "30 of my siblings orbit Earth at 20,200 km altitude. Together we help ships, pilots, and hikers know exactly where they are. What system are we?" | GPS | Satellite-based global navigation system | 150 |
| "I am a Copernicus mission launched by ESA. I see through clouds using C-band microwaves. Floods, earthquakes, and ship movements cannot hide from me. What am I?" | SENTINEL | ESA's Earth observation constellation — free and open data | 250 |

**Scoring:** Base points + up to 50% speed bonus. Perfect score bonus: +200 pts.

---

### LEVEL 2 — INTELLIGENCE GATHERING (Image Recognition)
**Timer:** 2 minutes per question | **Questions:** 5

| # | Image URL | Question | Options (correct = index 0 in list, adjust per below) | Correct | Points |
|---|-----------|----------|-------------------------------------------------------|---------|--------|
| 1 | `https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/500px-The_Earth_seen_from_Apollo_17.jpg` | This iconic photograph known as "The Blue Marble" was captured from space. What type of satellite imaging does it represent? | A) True Color Composite ✓, B) False Color Infrared, C) Synthetic Aperture Radar, D) Thermal Infrared Mosaic | A | 150 |
| 2 | `https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Hurricane_Isabel_from_ISS.jpg/500px-Hurricane_Isabel_from_ISS.jpg` | This photo was captured from the ISS. What extreme weather phenomenon is shown? | A) Tornado, B) Hurricane / Tropical Cyclone ✓, C) Dust Storm, D) Volcanic Ash Plume | B | 150 |
| 3 | `https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Amazon_deforestation.jpg/500px-Amazon_deforestation.jpg` | This satellite image of the Amazon Basin reveals a major environmental crisis. What is being shown? | A) River Flooding, B) Systematic Deforestation ✓, C) Agricultural Irrigation Grid, D) Oil Spill | B | 200 |
| 4 | `https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/NOAA-NASA_Suomi_NPP_satellite_image_of_northern_India_and_surrounding_countries_at_night.jpg/500px-NOAA-NASA_Suomi_NPP_satellite_image_of_northern_India_and_surrounding_countries_at_night.jpg` | This nighttime satellite composite from Suomi NPP is used by economists to measure what? | A) Lightning Activity, B) Human Settlement & Economic Activity ✓, C) Volcanic Hotspots, D) Aurora Distribution | B | 200 |
| 5 | `https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Aletschgletscher_mit_Jungfrau.jpg/500px-Aletschgletscher_mit_Jungfrau.jpg` | Multi-temporal satellite imagery of Alpine glaciers is used to track which environmental indicator? | A) Tectonic Uplift, B) Glacial Retreat due to Climate Change ✓, C) New Volcanic Formation, D) Increased Snowfall | B | 250 |

Each question includes a detailed **educational explanation** shown in feedback after answering.

---

### LEVEL 3 — CODE BREAKING (Emoji Hangman)
**Timer:** 2 minutes per challenge | **Lives:** 6 wrong guesses | **Auto-hint:** 1 letter revealed at 60s mark | **Questions:** 5

| Emoji Clue | Answer | Hint |
|------------|--------|------|
| 🛰️💡🌍 | LIDAR | Laser pulses measure precise distance to the ground surface |
| 🌊⚠️🌏 | TSUNAMI | Massive ocean wave triggered by submarine earthquake |
| ❄️🏔️📉 | GLACIER | Slow-moving river of ice shaping mountain valleys over millennia |
| 🌪️👁️🌀 | CYCLONE | Large rotating storm tracked by geostationary weather satellites |
| 🔥🌲🗺️ | WILDFIRE | Uncontrolled fire monitored by thermal infrared satellite sensors |

UI: Full A–Z clickable keyboard grid. Letters turn green (hit) or red (miss). Word displayed as blank slots that fill in on correct guesses.

---

### LEVEL 4 — RAPID ASSESSMENT (MCQ)
**Timer:** 90 seconds per question | **Questions:** 10 | Progressive difficulty 1→3

| # | Question | A | B | C | D | Correct | Diff | Pts |
|---|----------|---|---|---|---|---------|------|-----|
| 1 | What does NDVI stand for? | Normalized Difference Vegetation Index | National Digital Vegetation Interface | Natural Data Visualization Index | Normalized Distribution Visual Index | A | 1 | 100 |
| 2 | Which radar type does ESA Sentinel-1 carry? | X-band Radar | L-band Radar | C-band SAR | P-band SAR | C | 2 | 150 |
| 3 | Best spectral bands for mapping water bodies? | Red + Green | NIR + SWIR | Blue + Green | Thermal + Panchromatic | B | 2 | 150 |
| 4 | IEEE GRSS is primarily focused on? | GPS navigation systems | Geoscience and remote sensing science | Geological rock formation studies | Ground robotics | B | 1 | 100 |
| 5 | Primary advantage of SAR over optical sensors? | Higher spatial resolution | All-weather, day-and-night imaging | More spectral bands | Lower cost | B | 2 | 150 |
| 6 | Which programme offers free open Sentinel data? | NASA Earthdata | The Copernicus Programme (ESA) | JAXA EORC | ISRO Bhuvan | B | 2 | 150 |
| 7 | What is "temporal resolution" in remote sensing? | Pixel size on ground | How often a satellite revisits a location | Number of spectral bands | Orbital altitude | B | 2 | 150 |
| 8 | Best band for highlighting vegetation in false-color? | Blue (0.45–0.52 μm) | Green (0.52–0.60 μm) | Near-Infrared (0.76–0.90 μm) | Thermal (10–12 μm) | C | 3 | 200 |
| 9 | What is "orthorectification"? | Enhancing brightness | Correcting terrain/sensor geometric distortions | Removing atmospheric haze | Classifying land cover | B | 3 | 200 |
| 10 | Landsat 9 launch year? | 2015 | 2018 | 2021 | 2023 | C | 3 | 200 |

Each question shows a detailed explanation in the feedback overlay after answering.

---

### LEVEL 5A — TOOL AUCTION
**Budget:** $10,000 | **Max tools:** 5 | **Price increase:** +10% every 20 seconds | **Sell back:** 70% of current price | **Auction duration:** 3 minutes

#### Available Tools (10 tools)
| ID | Name | Base Price | Icon | Description | Flood Eff | Wildfire Eff | Quake Eff |
|----|------|-----------|------|-------------|-----------|--------------|-----------|
| sar | SAR Satellite Feed | $2,500 | 📡 | All-weather C-band radar through cloud cover | 10 | 6 | 8 |
| thermal | Thermal Camera Array | $1,800 | 🌡️ | Infrared heat signature detection from orbit | 5 | 10 | 4 |
| lidar | LiDAR Terrain Scanner | $2,200 | 💡 | Precise 3D elevation models for flood depth | 9 | 5 | 9 |
| ndvi | NDVI Vegetation Analyzer | $800 | 🌿 | Vegetation health index and fire risk mapping | 4 | 8 | 3 |
| gps | GPS Ground Network | $600 | 📍 | Millimetre-precision ground displacement tracking | 6 | 3 | 10 |
| flood_ai | Flood Prediction AI | $1,500 | 🌊 | ML-based flood extent and inundation forecasting | 10 | 2 | 4 |
| comm | Emergency Comm Relay | $900 | 📻 | Satellite comms for connectivity-denied disaster zones | 7 | 7 | 8 |
| drone | Multispectral UAV | $1,400 | 🚁 | Close-range aerial recon with multispectral imaging | 7 | 9 | 6 |
| seismic | Seismic Sensor Array | $1,600 | 📊 | Ground motion monitoring and aftershock prediction | 3 | 2 | 10 |
| optical | High-Res Optical Satellite | $2,000 | 🔭 | 30cm resolution imagery for damage assessment | 8 | 7 | 7 |

#### Tool Combo Bonuses
| Combo | Tools Required | Bonus | Description |
|-------|---------------|-------|-------------|
| 3D Flood Intelligence Suite 🏆 | sar + lidar | +500 pts | SAR + LiDAR = most accurate flood depth maps |
| Fire Risk Sentinel System 🔥 | thermal + ndvi | +350 pts | Thermal + NDVI maps active fire perimeters perfectly |
| Earthquake Intelligence System ⚠️ | gps + seismic | +450 pts | GPS + Seismic predict aftershocks with high accuracy |
| Tactical Response Unit 📡 | drone + comm | +300 pts | UAV + Comm relay = coordinated rescue operations |

UI: Tool cards with animated price ticker, rising price indicator (red flash), budget bar, combo detection with live display, sell-back button on owned tools.

---

### LEVEL 5B — DISASTER RESPONSE
Three possible scenarios (randomly selected per session):

#### Scenario 1: Bangladesh Mega-Flood 🌊
**Optimal tools:** SAR + Flood AI + LiDAR + Comm Relay  
**Description:** "Catastrophic monsoon flooding has inundated 30% of Bangladesh. 2.3 million people are displaced. Rising waters are cutting off villages and communication towers. The government needs a satellite-based damage assessment and evacuation corridor map within 6 hours."  
**Metrics to evaluate:** Flood extent mapping, Population exposure quantification, Infrastructure damage detection, Evacuation route planning quality

#### Scenario 2: California Mega-Fire 🔥
**Optimal tools:** Thermal + NDVI + Drone + Comm Relay  
**Description:** "A rapidly spreading wildfire in Northern California has consumed 80,000 acres in 12 hours. Dense smoke is grounding all aircraft. 80,000 residents may need emergency evacuation. Satellite-based monitoring is the only viable real-time assessment tool."  
**Metrics:** Active fire perimeter mapping, Fire spread direction forecast, Air quality hazard monitoring, Evacuation zone prioritisation

#### Scenario 3: Turkey M7.8 Earthquake ⚠️
**Optimal tools:** SAR + Seismic + GPS + High-Res Optical  
**Description:** "A catastrophic 7.8 magnitude earthquake has struck southeastern Turkey. Thousands of buildings have collapsed. International rescue teams need ground displacement maps, structural damage grids and aftershock risk zones to prioritise search-and-rescue operations."  
**Metrics:** Ground displacement (InSAR) mapping, Building collapse detection, Aftershock risk zone delineation, Search & rescue prioritisation

**Scoring:** Each tool applied scores `tool_effectiveness_for_disaster × 12` points. Using an optimal tool earns +100 bonus pts each. Budget efficiency from 5A is added. Combo bonuses carry forward.

---

## GAMIFICATION FEATURES

### Power-Ups (per session)
| Power-Up | Count | Effect |
|----------|-------|--------|
| 💡 Hint | 2 | Reveals contextual clue for current question |
| ⏭ Skip | 1 | Skip question, no points awarded or deducted |
| ❄️ Freeze | 1 | Pauses timer for exactly 15 seconds |

Store remaining power-ups in user session. Do not replenish mid-game.

### Timer Visual States
- **>50% remaining** — Green/cyan gradient bar, normal display
- **25–50% remaining** — Orange/amber gradient, mild pulse
- **<25% remaining** — Red gradient, rapid CSS flash animation on bar and timer text
- Synthesised audio tick at <10 seconds, urgency pulse at <5 seconds

### Scoring Formula
```
Level Score = Σ(base_points × (1 + 0.5 × time_remaining/time_max)) per correct answer
            + perfect_accuracy_bonus (if applicable)

Level 5 Score = disaster_tool_score + optimal_tool_bonus + budget_efficiency_bonus + combo_bonus

Total Score = Σ all level scores
```

### Rank Titles (based on total score)
| Score | Title |
|-------|-------|
| ≥ 3000 | Disaster Strategist |
| ≥ 2500 | Climate Guardian |
| ≥ 2000 | Resource Optimizer |
| ≥ 1500 | Earth Observer |
| ≥ 1000 | Field Analyst |
| < 1000 | GRSS Trainee |

### Rewards
- **Confetti animation** on every level completion
- **Badge display** on results screen (level-specific icon + score)
- **Leaderboard rank reveal** on final screen
- **Dynamic feedback overlays** — correct: green themed card with explanation; wrong: red themed card with correct answer + explanation; timeout: amber themed card

---

## REAL-TIME LEADERBOARD

### Requirements
- **Persistent across all sessions** (MongoDB)
- **Socket.io live updates** — leaderboard refreshes automatically as scores come in during the event
- Display: Rank | Name | USN | Total Score | Levels Completed | Date
- Top 3 get medal icons (🥇🥈🥉)
- Current user row highlighted
- **Admin endpoint** (`/api/admin/leaderboard`) to export full CSV for event organisers

### API Endpoints
```
POST   /api/auth/register       — Register new user (name + USN)
POST   /api/auth/login          — Login by USN
GET    /api/user/me             — Get current user state
PUT    /api/user/score          — Update score after each level
GET    /api/leaderboard         — Get top 50 scores
GET    /api/leaderboard/full    — Get all scores (admin)
GET    /api/admin/export        — CSV export (admin)
```

---

## DEMO MODE (Interactive Tutorial)

5-step guided walkthrough accessible **before login**. Each step is an interactive preview:

1. **Welcome** — Introduction to the mission, game overview
2. **The HUD** — Live preview of the mission HUD: timer bar, progress dots, power-ups, score display. Animate the timer bar draining to show urgency states.
3. **Tool Auction** — Static but realistic preview of the auction interface with two tool cards (one owned, one available), budget bar at 68%, price rise countdown at 9s
4. **Geoscience Glossary** — 5 key terms (SAR, NDVI, LiDAR, InSAR, GRSS) with plain-English definitions
5. **Scoring & Ranks** — Score breakdown table + rank title list

Navigation: Step indicator dots (clickable), Next/Back buttons, "Start Playing!" button on final step → redirects to auth screen.

---

## AUDIO (Web Audio API — No External Files)

Synthesise all sounds using the Web Audio API `OscillatorNode` + `GainNode`. No MP3/WAV files.

| Sound | Trigger | Synthesis |
|-------|---------|-----------|
| Click | Button press | Short 700Hz square wave, 40ms |
| Correct | Right answer | C5→E5→G5 sine arpeggio, 400ms total |
| Wrong | Wrong answer | Descending sawtooth 200→150Hz, 400ms |
| Level Up | Level complete | 7-note ascending sine scale, 700ms |
| Tick | Timer <10s | 1000Hz square, 30ms |
| Urgency | Timer <5s | 440Hz square, 100ms |
| Buy | Tool purchased | 400→600Hz sine rise, 300ms |
| Power-up | Power-up used | 3-tone sine rise 1000→1200→1400Hz |
| Final | Game complete | 4-note chord + octave, 700ms |

---

## RESPONSIVE DESIGN

Build for **both desktop and mobile**:
- Desktop (≥768px): Full multi-column layouts, larger cards, side-by-side panels
- Mobile (<768px): Single column, larger tap targets, stacked HUD, smaller letter grid keys (30×30px)
- Minimum touch target: 44×44px
- Fonts scale with `clamp()`

---

## LEVEL UNLOCK SYSTEM

- Level 1 is always unlocked
- Each level unlocks the next upon completion (client-side check + server-side validation)
- Dashboard shows: locked (🔒, greyed out), available (icon, glowing), completed (✅, green glow + score displayed)
- Clicking a locked level shows toast: "Complete previous levels first!"

---

## RESULTS SCREENS

### Per-Level Results
After each level completion, show:
- Level name + icon
- Score earned (animated counter)
- Correct answers / total
- Accuracy percentage
- Bonus points (if any)
- Navigation: Back to Dashboard | Next Mission →

### Final Results (after Level 5)
- Total score (animated count-up)
- Rank title (large badge)
- Per-level score breakdown table
- Confetti burst
- Navigation: View Leaderboard | Play Again

---

## PERFORMANCE REQUIREMENTS

- Target: **200–250 concurrent users** during live event
- MongoDB indexes on: `usn` (unique), `totalScore` (descending for leaderboard)
- Socket.io rooms for leaderboard broadcasts (emit on score update, max 1/sec per user)
- API response time target: <200ms for score updates
- Static assets: serve via CDN or Next.js static optimisation

---

## DEPLOYMENT

Provide:
1. `docker-compose.yml` with services: `frontend`, `backend`, `mongodb`
2. `.env.example` with all required variables:
   ```
   MONGODB_URI=mongodb://mongo:27017/grss
   NEXT_PUBLIC_API_URL=http://localhost:4000
   SESSION_SECRET=change_me_in_production
   PORT=4000
   ```
3. `README.md` with:
   - Local development setup (npm install, npm run dev)
   - Docker deployment steps
   - How to seed/clear database
   - Admin CSV export instructions

---

## ADDITIONAL NOTES

- **No passwords** — authentication is name + USN only, sessions via HTTP-only cookie
- **No email** — this is a live event tool, not a long-term account system
- **Question order randomised** in Level 1 (scrambles + riddles shuffled together each session)
- **Disaster scenario randomised** per session in Level 5
- **All explanations** shown in feedback overlays after every question (win or lose) — educational content is embedded in feedback, not as a separate screen
- **No ads, no tracking** — pure game experience
- The platform should feel like a **polished game**, not a quiz app — prioritise animation, sound feedback and visual polish over minimalism

---

*This prompt was generated from a full design session specifying all game mechanics, content, scoring, and technical requirements for the IEEE GRSS Field Analyst live event platform.*
