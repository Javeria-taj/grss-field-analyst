'use client';

interface Props {
  total: number;
  current: number;
}

export default function ProgressDots({ total, current }: Props) {
  return (
    <div className="prog-dots">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`prog-dot ${i < current ? 'done' : i === current ? 'cur' : ''}`}
        />
      ))}
    </div>
  );
}
