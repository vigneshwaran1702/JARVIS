import React, { useEffect, useState } from 'react';

export default function Waveform({ active = false, mode = 'idle' }) {
  const [bars, setBars] = useState([15, 25, 45, 20, 60, 30, 75, 40, 50, 30, 20, 10]);

  useEffect(() => {
    let interval;
    if (active) {
      interval = setInterval(() => {
        setBars((prev) =>
          prev.map(() => {
            const min = mode === 'speaking' ? 30 : 15;
            const max = mode === 'speaking' ? 95 : 65;
            return Math.floor(Math.random() * (max - min + 1)) + min;
          })
        );
      }, 90);
    } else {
      setBars([10, 15, 20, 25, 30, 25, 20, 15, 10, 8, 5, 5]);
    }

    return () => clearInterval(interval);
  }, [active, mode]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        height: '45px',
        padding: '0 15px',
      }}
    >
      {bars.map((height, idx) => (
        <div
          key={idx}
          style={{
            width: '4px',
            height: `${height}%`,
            backgroundColor: active ? 'var(--primary-cyan)' : 'rgba(0, 242, 254, 0.3)',
            boxShadow: active ? '0 0 10px var(--primary-cyan)' : 'none',
            borderRadius: '2px',
            transition: 'height 0.08s ease, background-color 0.2s ease',
          }}
        />
      ))}
    </div>
  );
}
