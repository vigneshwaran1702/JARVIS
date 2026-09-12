import React from 'react';
import { Cpu, HardDrive, BatteryCharging, Battery, Wifi, Activity } from 'lucide-react';

export default function SystemStats({ stats, backendOnline }) {
  const cpuPercent = stats?.cpu_percent ?? 18;
  const ramPercent = stats?.ram_percent ?? 42;
  const ramUsed = stats?.ram_used_gb ?? 6.7;
  const ramTotal = stats?.ram_total_gb ?? 16.0;
  const batteryPercent = stats?.battery_percent ?? 95;
  const isCharging = stats?.is_charging ?? true;

  const getProgressColor = (percent) => {
    if (percent > 85) return '#ef4444';
    if (percent > 65) return 'var(--accent-gold)';
    return 'var(--primary-cyan)';
  };

  return (
    <div className="hud-panel" style={{ padding: '1.25rem', width: '100%' }}>
      <div className="hud-corner-tl" />
      <div className="hud-corner-tr" />
      <div className="hud-corner-bl" />
      <div className="hud-corner-br" />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(0, 242, 254, 0.15)',
          paddingBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--primary-cyan)" />
          <span className="hud-title" style={{ fontSize: '0.85rem' }}>
            CORE TELEMETRY
          </span>
        </div>
        <span
          className="hud-tag"
          style={{
            color: backendOnline ? 'var(--primary-cyan)' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Wifi size={14} />
          {backendOnline ? 'BACKEND LINKED' : 'OFFLINE'}
        </span>
      </div>

      {/* Metric 1: CPU */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <Cpu size={15} /> CPU LOAD
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: getProgressColor(cpuPercent) }}>
            {cpuPercent}%
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${cpuPercent}%`,
              height: '100%',
              backgroundColor: getProgressColor(cpuPercent),
              boxShadow: `0 0 8px ${getProgressColor(cpuPercent)}`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Metric 2: RAM */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <HardDrive size={15} /> MEMORY
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: getProgressColor(ramPercent) }}>
            {ramPercent}% ({ramUsed}/{ramTotal} GB)
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${ramPercent}%`,
              height: '100%',
              backgroundColor: getProgressColor(ramPercent),
              boxShadow: `0 0 8px ${getProgressColor(ramPercent)}`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Metric 3: Battery / Power */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            {isCharging ? <BatteryCharging size={15} color="var(--primary-cyan)" /> : <Battery size={15} />}
            POWER CELL
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--primary-cyan)' }}>
            {batteryPercent}% {isCharging ? '(CHARGING)' : ''}
          </span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${batteryPercent}%`,
              height: '100%',
              backgroundColor: 'var(--primary-cyan)',
              boxShadow: '0 0 8px var(--primary-cyan)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
