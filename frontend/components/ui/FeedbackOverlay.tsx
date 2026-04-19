'use client';

interface Props {
  type: 'ok' | 'bad' | 'timeout' | 'info';
  icon: string;
  title: string;
  body: string;
  onContinue: () => void;
  buttonLabel?: string;
}

export default function FeedbackOverlay({ type, icon, title, body, onContinue, buttonLabel = 'CONTINUE →' }: Props) {
  const btnClass = {
    ok: 'btn-success',
    bad: 'btn-danger',
    timeout: 'btn-warning',
    info: 'btn-outline',
  }[type];

  return (
    <div className="fb-overlay">
      <div className={`fb-card ${type}`}>
        <span className="fb-icon">{icon}</span>
        <div
          className="font-orb"
          style={{ fontSize: '1.15rem', marginBottom: 10, color: 'var(--white)' }}
        >
          {title}
        </div>
        <div
          style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.75, marginBottom: 20 }}
          dangerouslySetInnerHTML={{ __html: body }}
        />
        <button className={`btn ${btnClass} btn-full`} onClick={onContinue}>
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
