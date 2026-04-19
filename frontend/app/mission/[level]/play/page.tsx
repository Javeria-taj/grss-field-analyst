'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import Level1Play from './level1';
import Level2Play from './level2';
import Level3Play from './level3';
import Level4Play from './level4';

export default function PlayPage() {
  const { level } = useParams<{ level: string }>();
  const router = useRouter();
  const { user, unlocked } = useGameStore();
  const lvl = parseInt(level);

  useEffect(() => {
    if (!user) router.replace('/');
    else if (!unlocked.includes(lvl)) router.replace('/dashboard');
    else if (lvl === 5) router.replace('/auction');
  }, [user, unlocked, lvl, router]);

  if (!user) return null;

  switch (lvl) {
    case 1: return <Level1Play />;
    case 2: return <Level2Play />;
    case 3: return <Level3Play />;
    case 4: return <Level4Play />;
    default: return null;
  }
}
