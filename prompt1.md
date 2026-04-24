Context: You are a Principal Full-Stack Engineer working on the "GRSS Field Analyst" platform. The application uses Next.js, Socket.io, Zustand, and MongoDB. It must flawlessly support 250 concurrent users in a live event setting.

Objective: Implement a suite of critical backend resilience upgrades, "God Mode" admin controls, clock-skew mitigation, and anti-cheat measures based on the V2.1 architectural review.

Execution Rules:

Execute the implementation step-by-step, modifying the specific files requested.

Do not remove or break existing functionality (especially the dynamic question bank and image preloading).

Ensure all new Socket.io events are properly typed in realtime/game/types.ts.

Please process and implement the following phases exactly as specified:

🛠️ PHASE 1: TYPES & CORE ENGINE (Backend)
Files to modify: realtime/game/types.ts, realtime/game/GameEngine.ts

Clock Skew Types: In types.ts, update TimerStartPayload and GameStateSync to include serverTime: number.

Live Stats Types: Add an AdminLiveStatsPayload type to track real-time answer distribution (e.g., Record<string, number> for A/B/C/D or text answers).

Engine Clock Skew: In GameEngine.ts, whenever you emit timer_start or game_state_sync, attach serverTime: Date.now() to the payload.

Engine Force End: In GameEngine.ts, add a public forceEndQuestion() method that immediately clears the timer and calls this.endQuestion() so admins can trigger it manually.

Engine Player Kick: In GameEngine.ts, add a public kickPlayer(usn: string) method that removes the user from playerScores, connectedPlayers, and deletes their ongoing data.

Engine Live Stats: Add a getLiveAnswerStats() method to GameEngine.ts that calculates the current answer distributions for the active question (how many people guessed A, B, C, etc.) and returns it.

🛡️ PHASE 2: SOCKET LAYER & DB RESILIENCE
Files to modify: realtime/sockets/game.ts

Global Rate Limiting: In game.ts, the rateLimitMap currently only protects submit_answer. Extend this logic to create a reusable checkRateLimit(socketId, ms) function. Apply a 150ms rate limit to guess_letter, buy_tool, and sell_tool.

MongoDB Connection Guard: Locate the setInterval block running the DB bulkWrites at the bottom. Wrap the User.bulkWrite call in an if (mongoose.connection.readyState === 1) check to prevent query build-ups if the DB temporarily disconnects.

Admin Listeners: Add new socket listeners:

admin_force_end: Calls engine.forceEndQuestion().

admin_kick_player: Calls engine.kickPlayer(usn), deletes the user from the DB using User.deleteOne({ usn }), and emits a targeted force_disconnect to that user's socket ID.

Admin Emit Live Stats: In the submit_answer listener, after a user successfully submits, emit an updated live answer distribution stats payload exclusively to connected admins.

🔄 PHASE 3: ZUSTAND STATE MANAGEMENT
Files to modify: stores/useGameSyncStore.ts

Clock Skew Offset: * Add serverTimeOffset: number to the state (default 0).

In the timer_start and game_state_sync socket listeners, calculate and store the offset: offset = Date.now() - data.serverTime.

Admin Actions: Add adminForceEnd() and adminKickPlayer(usn: string) to the store actions and emit them via the socket.

Live Stats State: Add an adminLiveStats object to the store to catch the real-time answer distribution broadcasts.

Offline Queue: Add a queuedAnswer: string | number | null to the state. If submitAnswer is called but !get().connected, set queuedAnswer. In the connect listener, if queuedAnswer exists, emit it immediately and clear it.

🎨 PHASE 4: FRONTEND PLAYER UX
Files to modify: components/game/GameHUD.tsx, components/game/LevelIntroPhase.tsx, components/game/QuestionPhase.tsx

Perfect Timer Sync: In GameHUD.tsx and LevelIntroPhase.tsx, update the requestAnimationFrame loop to utilize the offset. Calculate remaining time as: Math.max(0, timerEndTime - (Date.now() - serverTimeOffset)).

Image CLS Fix: In QuestionPhase.tsx, locate the ImageMCQ component. Update the <img src={q.imageUrl} /> tag to include style={{ minHeight: '250px', objectFit: 'cover' }} to prevent layout shift. Add an onLoad state to show a CSS skeleton loader while the image is downloading.

👑 PHASE 5: GOD-MODE ADMIN PANEL
Files to modify: app/admin/page.tsx

Force End Button: In the "Game Control" section, add a prominent "⚠️ FORCE END QUESTION" button (disabled unless phase === 'question_active'). Hook it up to adminForceEnd.

Live Clairvoyance Panel: Create a new card titled "👁️ LIVE ANSWER DISTRIBUTION" (visible only during question_active). Render the data from adminLiveStats showing a mini bar-chart or list of what players are guessing in real-time.

Player Roster & Kick: In the "LIVE LEADERS" section, add a small "🚫 KICK" button next to each player's name. When clicked, confirm via window.confirm, then trigger adminKickPlayer(usn).