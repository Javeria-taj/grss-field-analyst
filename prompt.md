🚀 THE ANTIGRAVITY PLAN: GRSS Field Analyst 10/10 Upgrade Prompts
Context for Developer/AI Agent:
You are an elite full-stack Next.js and Socket.io developer. We are polishing a real-time multiplayer game called "GRSS Field Analyst". Your task is to execute the following architectural, bug-fixing, and UX improvements exactly as described, without generating any code until explicitly requested step-by-step.

PHASE 1: Critical Bug Fixes (Level 3 Projector Blackout)
Target File: app/projector/page.tsx & realtime/game/gameData.ts
The Issue: Level 3 (Emoji Hangman) questions do not appear on the projector page. The projector displays the fallback text "Loading question data from orbital uplink..."
The Instruction:

Analyze the data structure in realtime/game/gameData.ts. Notice that Level 3 questions (HangmanChallenge) use the property em for the emoji sequence, not question or scrambled.

Navigate to app/projector/page.tsx and locate the #phase-question render block.

Update the conditional rendering inside the <div className="q-text"> element. It currently only checks currentQuestion?.question and currentQuestion?.scrambled. Add logic to check for currentQuestion?.em.

If currentQuestion?.em exists, render the emojis at a massively scaled font size (e.g., 5rem) with a glowing text-shadow to make it readable from the back of the room.

Below the emojis, add conditional rendering to display currentQuestion?.hint if the phase has progressed past the 60-second mark (you will need to derive this from timeLeft).

PHASE 2: Core Engine & Security Polish
Target File: realtime/sockets/game.ts
The Issue: Current rate limiting and session management have edge-case vulnerabilities.
The Instruction:

Rate Limiting Flaw: The rateLimitMap currently uses socket.id. If a user spams a refresh or drops connection, they get a new socket.id and bypass the rate limit. Change the rate limiting mechanism to use the player's usn (Unique Student Number) or user.id so limits persist across reconnects.

Database BulkWrite Safety: In the setInterval block for DB sync, add a check to ensure leaderboard actually has entries before calling User.bulkWrite. Furthermore, wrap the write in a timeout or use a queue to prevent overlapping write operations if the DB stalls.

Ghost Player Cleanup: Implement a garbage collection routine in GameEngine.ts (via the socket file) that flags players as "inactive" if they disconnect, and automatically removes them from the active scoring pool if they don't reconnect within 3 minutes, preventing dead slots on the projector UI.

PHASE 3: The 10/10 Projector UI/UX Enhancements
Target File: app/projector/page.tsx
The Issue: A 10/10 game needs a spectator experience that feels like a live e-sports event.
The Instruction:

Level 3 Hangman Visualizer: When it is Level 3, the projector shouldn't just show the Emojis. Create a dynamic visual component that shows the "blanks" of the word (e.g., _ _ _ _ _). You will need to ensure the server sends the word length (but NOT the word itself) to the client state so the projector can render the correct number of empty underscore slots.

Reaction Overload: The current floating emojis (adminLiveStats?.reactions) spawn randomly. Update the CSS keyframes so that if more than 10 reactions happen per second, they trigger a "combo burst" effect, spawning from the bottom center and fanning outwards like a geyser, rather than just floating straight up.

Podium Polish: In the #phase-levelend block, the podium bars for the top 5 players currently snap into place. Add framer-motion layout animations or CSS transition-delay staggers so the 5th place bar rises first, followed by 4th, ending with a dramatic pause before the 1st place bar shoots up with a particle confetti effect.

PHASE 4: Gameplay Mechanics (Auction & Rapid Fire)
Target File: components/game/AuctionPhase.tsx & realtime/game/gameData.ts
The Issue: The auction UI lacks the "panic" factor of a live trading floor.
The Instruction:

Dynamic Price Flashing: In AuctionPhase.tsx, track the previous value of auctionPrices. If a price goes up, flash the price text in red (var(--danger)) for 500ms before settling.

Budget Progress Bar: Add a visual "wallet" progress bar at the top of the Auction UI that shrinks as the user buys tools. Change its color gradient from green to yellow to flashing red as their budget drops below 20%.

Rapid Fire Scaling: For Level 4 (Rapid Fire), ensure the TIME_LIMITS configuration handles the progression accurately. Implement a visual "combo meter" on the client-side that multipliers their score locally if they answer 3 Rapid Fire questions correctly in under 5 seconds each.