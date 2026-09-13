import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Shield, Zap, Sparkles, RefreshCw, Play, Sparkle, UserCheck } from 'lucide-react';
import ArcReactor from './components/ArcReactor';
import Waveform from './components/Waveform';
import SystemStats from './components/SystemStats';
import CommandLog from './components/CommandLog';
import QuickActions from './components/QuickActions';

const BACKEND_URL = 'http://127.0.0.1:8000';
const JENNY_VOICE_ID = 'en-US-JennyNeural';

export default function App() {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('Good day, Sir. Jenny voice neural matrix is active and online. Standing by for instructions.');
  const [status, setStatus] = useState('idle'); // idle | processing | error
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceAudioEnabled, setVoiceAudioEnabled] = useState(true);
  const [stats, setStats] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [messages, setMessages] = useState([]);
  const [firstInteractionDone, setFirstInteractionDone] = useState(false);
  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const handleFirstClick = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('Speech Recognition not supported');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };
      recognition.onresult = (event) => {
        console.log('Speech result', event);
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          console.log('Recognized transcript:', transcript);
          sendCommand(transcript);
        }
      };
      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.warn('Microphone permission denied; user must click mic button to start');
        }
      };
      recognition.onend = () => {
        console.log('Speech recognition ended, restarting');
        setIsListening(false);
        try { recognition.start(); } catch (e) { console.warn('Restart error', e); }
      };
      recognitionRef.current = recognition;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => { try { recognition.start(); } catch (e) { console.warn('Initial start error:', e); } })
          .catch((err) => { console.warn('Microphone permission denied:', err); });
      } else {
        try { recognition.start(); } catch (e) { console.warn('Initial start error:', e); }
      }

      setFirstInteractionDone(true);
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, []);

  // Poll backend health, system telemetry, and memory
  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/system-stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    }
  };

  const fetchMemory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/memory?limit=25`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      }
    } catch (e) {
      console.warn('Memory fetch failed:', e);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    fetchMemory();
    const interval = setInterval(() => fetchTelemetry(), 4000);
    return () => clearInterval(interval);
  }, []);

  // Studio Neural Voice Synthesizer exclusively with Jenny's Voice
  const speakText = async (text) => {
    if (!voiceAudioEnabled) return;

    // Stop any existing playback
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    try {
      setIsSpeaking(true);
      const res = await fetch(`${BACKEND_URL}/synthesize-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: JENNY_VOICE_ID,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          currentAudioRef.current = null;
        };

        await audio.play();
        return;
      }
    } catch (e) {
      console.warn('Neural audio synthesis failed, using browser fallback:', e);
    }

    // Fallback if backend network fails
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.15;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const testJennyVoice = () => {
    const testPhrase = 'Good day, Sir. Jenny voice profile is fully online and crystal clear.';
    setResponse(testPhrase);
    speakText(testPhrase);
  };

  // Dispatch Command to Backend
  const sendCommand = async (customMessage) => {
    const textToSend = customMessage || command;
    if (!textToSend || !textToSend.trim()) return;

    setStatus('processing');
    setCommand('');

    try {
      const res = await fetch(`${BACKEND_URL}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          voice_feedback: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.response);
        setStatus('idle');
        fetchMemory();
        speakText(data.response);
      } else {
        const fallback = 'Interface error communicating with core mainframe, sir.';
        setResponse(fallback);
        setStatus('error');
        speakText(fallback);
      }
    } catch {
      const fallback = `Command registered: '${textToSend}'.`;
      setResponse(fallback);
      setStatus('idle');
      setMessages((prev) => [
        ...prev,
        { role: 'user', message: textToSend, timestamp: new Date().toLocaleTimeString() },
        { role: 'jarvis', message: fallback, timestamp: new Date().toLocaleTimeString() },
      ]);
      speakText(fallback);
    }
  };

  // toggleMic is retained for manual control but auto-listening is enabled.
  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser or microphone access is restricted.');
      return;
    }

    // Manual toggle: stop if listening, otherwise start.
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  const handleClearMemory = async () => {
    try {
      await fetch(`${BACKEND_URL}/memory`, { method: 'DELETE' });
      setMessages([]);
      const purgeMsg = 'Memory banks cleared and re-initialized, sir.';
      setResponse(purgeMsg);
      speakText(purgeMsg);
    } catch {
      setMessages([]);
    }
  };

  return (
    <>
      {!firstInteractionDone && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.0)',
            cursor: 'pointer',
            zIndex: 9999,
          }}
        />
      )}
      <div
        style={{
          minHeight: '100vh',
          padding: '1.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
      {/* Top HUD Header */}
      <header
        className="hud-panel"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: backendOnline ? 'var(--primary-cyan)' : '#ef4444',
              boxShadow: `0 0 10px ${backendOnline ? 'var(--primary-cyan)' : '#ef4444'}`,
            }}
          />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary-cyan)', margin: 0, textShadow: '0 0 12px rgba(0, 242, 254, 0.5)' }}>
              J.A.R.V.I.S
            </h1>
            <div className="hud-tag" style={{ fontSize: '0.7rem' }}>
              STARK INDUSTRIES &bull; JENNY VOCAL CORE &bull; V1.0.0
            </div>
          </div>
        </div>

        {/* Dedicated Jenny Voice Badge & Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Active Voice Indicator */}
          <div
            className="hud-tag"
            style={{
              background: 'rgba(0, 242, 254, 0.1)',
              border: '1px solid var(--border-active)',
              padding: '6px 12px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--primary-cyan)',
              fontWeight: 'bold',
            }}
          >
            <Sparkles size={14} color="var(--accent-gold)" />
            VOICE: JENNY (STUDIO NEURAL)
          </div>

          {/* Test Jenny Voice Button */}
          <button
            onClick={testJennyVoice}
            title="Preview Jenny's Studio Neural Voice"
            style={{
              background: 'rgba(0, 242, 254, 0.18)',
              border: '1px solid var(--primary-cyan)',
              color: 'var(--primary-cyan)',
              padding: '6px 14px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-orbitron)',
              fontWeight: 'bold',
              boxShadow: '0 0 12px rgba(0, 242, 254, 0.25)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 242, 254, 0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 242, 254, 0.18)')}
          >
            <Play size={14} fill="var(--primary-cyan)" />
            TEST JENNY VOICE
          </button>

          {/* Audio Mute / Unmute Toggle */}
          <button
            onClick={() => setVoiceAudioEnabled(!voiceAudioEnabled)}
            style={{
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid var(--border-cyan)',
              color: voiceAudioEnabled ? 'var(--primary-cyan)' : 'var(--text-muted)',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {voiceAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {voiceAudioEnabled ? 'AUDIO ON' : 'MUTED'}
          </button>
        </div>
      </header>

      {/* Main Grid: Left Telemetry | Center Reactor & Interaction | Right Command History */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr 340px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Diagnostics & Quick Directives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SystemStats stats={stats} backendOnline={backendOnline} />
          <QuickActions onExecute={(cmd) => sendCommand(cmd)} />
        </div>

        {/* Center Column: Arc Reactor Core & Command Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          {/* Reactor */}
          <div style={{ marginTop: '1rem' }}>
            <ArcReactor status={status} isListening={isListening} isSpeaking={isSpeaking} />
          </div>

          {/* Waveform */}
          <Waveform active={isListening || isSpeaking || status === 'processing'} mode={isSpeaking ? 'speaking' : 'listening'} />

          {/* JARVIS Vocal / Intelligence Response Display */}
          <div
            className="hud-panel"
            style={{
              width: '100%',
              padding: '1.5rem',
              textAlign: 'center',
              minHeight: '90px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              lineHeight: '1.6',
              border: '1px solid var(--border-active)',
              boxShadow: '0 0 25px rgba(0, 242, 254, 0.15)',
            }}
          >
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />
            <div className="hud-corner-br" />

            <p style={{ margin: 0, color: 'var(--text-main)', textShadow: '0 0 8px rgba(0, 242, 254, 0.2)' }}>
              &ldquo;{response}&rdquo;
            </p>
          </div>

          {/* Command Input Bar */}
          <div
            className="hud-panel"
            style={{
              width: '100%',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <button
              onClick={toggleMic}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '6px',
                border: `1px solid ${isListening ? '#ef4444' : 'var(--primary-cyan)'}`,
                background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 242, 254, 0.1)',
                color: isListening ? '#ef4444' : 'var(--primary-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.5)' : '0 0 10px rgba(0, 242, 254, 0.2)',
                transition: 'all 0.2s ease',
              }}
              title={isListening ? 'Stop Listening' : 'Speak to JARVIS'}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
              placeholder="Speak or type a command... (e.g. 'what is the time', 'system status', 'open calculator')"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '1rem',
                fontFamily: 'var(--font-rajdhani)',
                fontWeight: '600',
                padding: '10px 12px',
              }}
            />

            <button
              onClick={() => sendCommand()}
              disabled={status === 'processing'}
              style={{
                background: 'rgba(0, 242, 254, 0.15)',
                border: '1px solid var(--primary-cyan)',
                color: 'var(--primary-cyan)',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-orbitron)',
                fontWeight: '700',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 12px rgba(0, 242, 254, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 242, 254, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0, 242, 254, 0.15)')}
            >
              <Send size={16} />
              EXECUTE
            </button>
          </div>
        </div>

        {/* Right Column: Protocol History & Conversation Audit */}
        <div>
          <CommandLog messages={messages} onClearMemory={handleClearMemory} />
        </div>
      </main>
      </div>
    </>
    );
  }
