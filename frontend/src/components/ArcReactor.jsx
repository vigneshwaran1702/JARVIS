import React from 'react';

export default function ArcReactor({ status = 'idle', isListening = false, isSpeaking = false }) {
  // Speed variations based on state
  const getSpinClass = () => {
    if (isListening) return 'animate-spin-fast';
    if (isSpeaking) return 'animate-spin-fast';
    if (status === 'processing') return 'animate-spin-fast';
    return 'animate-spin-slow';
  };

  const getStatusText = () => {
    if (isListening) return 'LISTENING...';
    if (isSpeaking) return 'VOCALIZING...';
    if (status === 'processing') return 'PROCESSING...';
    return 'STANDBY';
  };

  const getStatusColor = () => {
    if (isListening) return '#00f2fe';
    if (isSpeaking) return '#ffbe0b';
    if (status === 'processing') return '#a855f7';
    return '#4facfe';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      {/* Outer Housing */}
      <div
        style={{
          width: '280px',
          height: '280px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '50%',
          border: '2px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 0 35px rgba(0, 242, 254, 0.25), inset 0 0 25px rgba(0, 242, 254, 0.15)',
        }}
      >
        {/* Outer Ring with segments */}
        <div
          className={getSpinClass()}
          style={{
            position: 'absolute',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            border: '2px dashed rgba(0, 242, 254, 0.6)',
            borderSpacing: '8px',
          }}
        />

        {/* Counter Rotating Ring */}
        <div
          className="animate-spin-counter-slow"
          style={{
            position: 'absolute',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            border: '1px solid rgba(79, 172, 254, 0.4)',
            borderTopColor: '#00f2fe',
            borderBottomColor: '#00f2fe',
          }}
        />

        {/* Inner Segment Markers (12 Nodes) */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '10px',
              height: '18px',
              background: i % 3 === 0 ? 'var(--primary-cyan)' : 'rgba(0, 242, 254, 0.3)',
              transform: `rotate(${i * 30}deg) translateY(-88px)`,
              boxShadow: i % 3 === 0 ? '0 0 10px var(--primary-cyan)' : 'none',
              borderRadius: '2px',
            }}
          />
        ))}

        {/* Core Glowing Orb */}
        <div
          className="animate-pulse-glow"
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #ffffff 15%, #00f2fe 60%, #032035 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.3s ease',
          }}
        >
          {/* Inner Monogram */}
          <span
            style={{
              fontFamily: 'var(--font-orbitron)',
              fontSize: '2rem',
              fontWeight: '900',
              color: '#030d17',
              textShadow: '0 0 8px rgba(255,255,255,0.8)',
            }}
          >
            J
          </span>
        </div>
      </div>

      {/* State Label */}
      <div
        style={{
          marginTop: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-orbitron)',
          fontSize: '0.9rem',
          letterSpacing: '3px',
          color: getStatusColor(),
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            boxShadow: `0 0 8px ${getStatusColor()}`,
            display: 'inline-block',
          }}
        />
        {getStatusText()}
      </div>
    </div>
  );
}
