'use client';

import { useEffect, useState } from 'react';

function getGreeting(hour: number) {
  if (hour < 5) return 'Still up?';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Greeting() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div className="h-14" />;

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">{getGreeting(now.getHours())}</h1>
      <p className="text-muted text-sm mt-1">
        {date} · {time}
      </p>
    </div>
  );
}
