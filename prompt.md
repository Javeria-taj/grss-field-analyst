🚀 MASTER PROMPT: GRSS FIELD ANALYST V2.2 (GAMIFICATION & ANTI-CHEAT)

Context: You are a Principal Full-Stack Engineer working on the Next.js/Socket.io platform "GRSS Field Analyst". The goal is to implement advanced gamification mechanics, strict anti-cheat focus tracking, comprehensive telemetry, and an upgraded Admin drag-and-drop workflow.

Execution Rules:



Execute step-by-step. Do not remove existing logic unless explicitly instructed.

Ensure all UI components maintain the existing "Neo-Brutalist / Glassmorphism" aesthetic defined in globals.css.

Use the existing SFX module from lib/sfx.ts.

Please implement the following phases:



📊 PHASE 1: TELEMETRY & SMART LEADERBOARD (Backend + Frontend)

Files: realtime/game/GameEngine.ts, realtime/game/types.ts, components/game/LevelCompletePhase.tsx



Backend Telemetry Logging: In GameEngine.ts inside handleAnswer(), every time a user answers, construct a telemetry object: { qIndex: number, timeTaken: number, correct: boolean, points: number }. Push this object to the player's session state.

Include in Sync: Ensure this telemetry array is included in the myScore or myAnswer payload returned in GameStateSync.

Smart Leaderboard UI: In LevelCompletePhase.tsx, if the current user is NOT in the top 15 (which are mapped out), append a visual separator (...) and render their exact rank at the bottom of the list using a distinct glowing border (e.g., box-shadow: var(--glow)).

Telemetry Tab: In LevelCompletePhase.tsx, add a toggle button group: ["Global Ranks", "My Performance"]. If "My Performance" is selected, render the telemetry data in a sleek <table className="w-full text-left"> showing Question #, Time Taken, Result (✅/❌), and Points.

🔊 PHASE 2: AUDIO-VISUAL FEEDBACK & SUSPENSE

Files: components/game/QuestionPhase.tsx



Auto-Trigger SFX: In QuestionPhase.tsx, set up a useEffect that watches the myAnswer object.

If myAnswer.correct is true, trigger SFX.correct().

If myAnswer.correct is false, trigger SFX.wrong().

Result Animation: Enhance the myAnswer overlay div. Make the emoji (✅ or ❌) scale up dramatically (scale: [0.5, 1.5, 1]) using Framer Motion when it appears.

🚨 PHASE 3: ANTI-CHEAT (FOCUS LOSS PENALTY)

Files: components/ClientShell.tsx, components/ui/Toast.tsx



Visibility Tracking: In ClientShell.tsx, expand the visibilitychange event listener.

The Penalty Logic: If document.visibilityState === 'hidden' AND the game phase is 'question_active', log a flag.

The Alert: When document.visibilityState returns to 'visible' during an active question, immediately fire SFX.urgency(). Trigger a custom danger toast: toast('WARNING: Focus lost. Ensure you remain on this screen during active missions.', 'err').

🖼️ PHASE 4: ADMIN DRAG-AND-DROP UPLOAD

Files: components/admin/QuestionBankPanel.tsx



Drag-and-Drop Zone: Replace the standard <input type="file" /> with a Drag-and-Drop div zone for the image_mcq type also choose images from the gallery on mobile

Event Handlers: Implement onDragOver, onDragLeave, and onDrop to handle the file visually.

State Indication: When a file is dragged over, change the border of the zone to var(--accent). When dropped, instantly trigger the existing handleUpload flow and show a thumbnail preview of the uploaded image inside the drop zone. give a option to choose images from the files/gallery in the mobile.