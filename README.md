# IEEE GRSS Field Analyst Mission

![Banner](https://img.shields.io/badge/IEEE-GRSS-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Mission-Live-green?style=for-the-badge)

A high-stakes geoscience game platform designed for live events. Help save the Earth across 5 specialized remote sensing missions.

## 🚀 Getting Started

This is a full-stack Next.js and Node.js application organized into a monorepo.

### Prerequisites
- Node.js 18+
- MongoDB (Optional - fallback to In-Memory mode is automatic)

### Installation
Run the following from the root directory:
```bash
npm run install:all
```

### Development
Start both the Frontend and Backend simultaneously:
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 🛰️ Mission Briefing
- **Level 1: Training Mission** — Word scrambles and field riddles.
- **Level 2: Intel Gathering** — High-resolution satellite imagery identification.
- **Level 3: Code Breaking** — Emoji-based Hangman for technical field terms.
- **Level 4: Rapid Assessment** — Advanced remote sensing multiple-choice.
- **Level 5: Core Simulation** — Strategic tool auction and disaster response response.

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js/Express, Socket.io (Real-time Leaderboard), MongoDB (Optional Persistence).
- **Design**: Dark-mode Neo-Brutalist aesthetic.

## 📁 Project Structure
- `/frontend`: Next.js application.
- `/backend`: Node.js/Express API.
- `/docs`: Documentation and original mission prompt.
- `/legacy`: Original monolithic source for reference.

## 🚀 CRITICAL DEPLOYMENT ARCHITECTURE
> [!IMPORTANT]
> This application follows a hybrid architecture to ensure maximum stability for 250+ concurrent users.

- **Frontend & API**: Should be deployed to a **Serverless** provider (e.g., Vercel, Netlify, or AWS Amplify).
- **Realtime Socket Server**: MUST be deployed to a **Stateful, Long-Running Instance** (e.g., Render, Railway, AWS EC2, or DigitalOcean Droplet).
- **Environment Variables**:
  - `NEXT_PUBLIC_SOCKET_URL`: Set this on the **Frontend** to point to your dedicated Socket Server URL (e.g., `https://realtime-server.up.railway.app`).
  - `SESSION_SECRET`: Must be identical across both environments.

---
*Created for the IEEE GRSS community.*
