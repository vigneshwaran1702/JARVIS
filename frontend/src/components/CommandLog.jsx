import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2, ShieldCheck, Wrench, User, Bot } from 'lucide-react';

export default function CommandLog({ messages, onClearMemory }) {
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="hud-panel" style={{ padding: '1.25rem', width: '100%', display: 'flex', flexDirection: 'column', height: '340px' }}>
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* Log Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
          paddingBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="var(--primary-cyan)" />
          <span className="hud-title" style={{ fontSize: '0.85rem' }}>
            PROTOCOL & MEMORY LOG
          </span>
        </div>
        <button
          onClick={onClearMemory}
          title="Purge Memory Banks"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <Trash2 size={13} />
          PURGE MEMORY
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingRight: '6px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            &gt; Awaiting initial command sequence...
          </div>
        ) : (
          messages.map((item, idx) => {
            const isUser = item.role === 'user';
            return (
              <div
                key={item.id || idx}
                style={{
                  background: isUser ? 'rgba(0, 242, 254, 0.05)' : 'rgba(79, 172, 254, 0.08)',
                  borderLeft: `3px solid ${isUser ? 'var(--primary-cyan)' : 'var(--accent-gold)'}`,
                  padding: '8px 12px',
                  borderRadius: '0 6px 6px 0',
                  fontSize: '0.9rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3px',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: isUser ? 'var(--primary-cyan)' : 'var(--accent-gold)' }}>
                    {isUser ? <User size={13} /> : <Bot size={13} />}
                    {isUser ? 'USER COMMAND' : 'J.A.R.V.I.S'}
                  </span>
                  <span>{item.timestamp || 'RECENT'}</span>
                </div>

                <div style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>
                  {item.message}
                </div>

                {item.tool_used && (
                  <div
                    style={{
                      marginTop: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(0, 242, 254, 0.1)',
                      color: 'var(--primary-cyan)',
                      padding: '2px 6px',
                      borderRadius: '3px',
                    }}
                  >
                    <Wrench size={10} />
                    EXECUTED: {item.tool_used}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
