'use client';
import { useTimerStore } from '@/stores/useTimerStore';

export default function TimerBar() {
  const timeVal = useTimerStore(s => s.timeVal);
  const timeMax = useTimerStore(s => s.timeMax);

  const pct = timeMax > 0 ? (timeVal / timeMax) * 100 : 100;
  const state = pct < 25 ? 'crit' : pct < 50 ? 'warn' : '';

  const mins = Math.floor(timeVal / 60);
  const secs = timeVal % 60;
  const label = timeMax > 60
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${timeVal}s`;

  return (
    <>
      <div className="timer-wrap">
        <div className="timer-track">
          <div
            className={`timer-fill ${state}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className={`timer-txt ${state}`}>{label}</div>
    </>
  );
}
