import React from 'react';
import { Play, Globe, Calculator, FileText, Clock, Github, ShieldAlert } from 'lucide-react';

export default function QuickActions({ onExecute }) {
  const actions = [
    { label: 'System Diagnostics', cmd: 'system status', icon: ShieldAlert },
    { label: 'Check Time & Date', cmd: "what's the time?", icon: Clock },
    { label: 'Open Calculator', cmd: 'open calculator', icon: Calculator },
    { label: 'Open Notepad', cmd: 'open notepad', icon: FileText },
    { label: 'Open GitHub', cmd: 'open github', icon: Github },
    { label: 'Open YouTube', cmd: 'open youtube', icon: Globe },
  ];

  return (
    <div className="hud-panel" style={{ padding: '1rem', width: '100%' }}>
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      <div className="hud-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        QUICK ACCESS DIRECTIVES
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        {actions.map((act, i) => {
          const IconComponent = act.icon;
          return (
            <button
              key={i}
              onClick={() => onExecute(act.cmd)}
              style={{
                background: 'rgba(0, 242, 254, 0.05)',
                border: '1px solid rgba(0, 242, 254, 0.2)',
                color: 'var(--text-main)',
                padding: '8px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-rajdhani)',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-cyan)';
                e.currentTarget.style.background = 'rgba(0, 242, 254, 0.15)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 242, 254, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.2)';
                e.currentTarget.style.background = 'rgba(0, 242, 254, 0.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <IconComponent size={14} color="var(--primary-cyan)" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
