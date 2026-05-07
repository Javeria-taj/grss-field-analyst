import { GameEngine } from './realtime/game/GameEngine';
import { TIME_LIMITS } from './realtime/game/gameData';

const engine = new GameEngine();
engine.startLevel(1);
const qs = (engine as any).questions;
console.log("Q1:", qs[0]);

engine.startCountdown(25, () => {});
engine.registerPlayer("socket1", "USER1", "User One", "team_sentinel");

setTimeout(() => {
  const result = engine.handleAnswer("USER1", qs[0].answer);
  console.log("Result:", result);
}, 2000);
