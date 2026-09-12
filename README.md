# 🤖 J.A.R.V.I.S — Autonomous Personal AI Assistant (v1.0)

> *A voice-controlled, multimodal AI assistant inspired by Tony Stark's J.A.R.V.I.S., engineered with a modular Python/FastAPI backend, persistent SQLite memory, hardware telemetry, tool execution router, and an animated Iron-Man Arc Reactor HUD in React.*

---

## 🏛️ Architecture

```text
JARVIS/
├── backend/
│   ├── main.py                     # FastAPI server with CORS & endpoints
│   ├── config.py                   # Settings & system prompt
│   ├── core/
│   │   ├── brain.py                # Gemini/OpenAI integration + offline fallback
│   │   ├── memory.py               # SQLite persistent memory layer
│   │   └── router.py               # Intent detector & safe tool router
│   ├── tools/
│   │   ├── system.py               # Windows apps allowlist & hardware stats (CPU/RAM/Power)
│   │   ├── browser.py              # Safe web navigator & Google search
│   │   ├── files.py                # Local workspace inspector
│   │   └── github.py               # GitHub repository tools
│   ├── voice/
│   │   ├── listener.py             # Desktop microphone voice capture
│   │   └── speaker.py              # pyttsx3 speech synthesis
│   ├── api/
│   │   └── routes.py               # REST API (/command, /system-stats, /memory, /status)
│   └── voice_assistant.py         # Standalone desktop voice loop
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArcReactor.jsx      # Multi-ring rotating glowing Arc Reactor
│   │   │   ├── Waveform.jsx        # Dynamic soundwave audio visualizer
│   │   │   ├── SystemStats.jsx     # Live CPU, RAM, Battery HUD gauges
│   │   │   ├── CommandLog.jsx      # Scrolling terminal memory & audit log
│   │   │   └── QuickActions.jsx    # Stark protocol action directives
│   │   ├── App.jsx                 # Master HUD orchestrator with Web Speech API
│   │   ├── main.jsx
│   │   └── index.css               # Stark Industries Cyan & CRT scanline styling
│   └── package.json
├── data/
│   └── memory.db                   # SQLite persistent database (auto-created)
├── .env.example
├── requirements.txt
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. (Optional) Configure your LLM API Key in .env
# Copy .env.example to .env and set AI_API_KEY
# If left blank, JARVIS operates in offline heuristic mode!

# 3. Start the FastAPI backend
cd backend
python -m uvicorn main:app --reload --port 8000
```

Backend endpoints will be live at `http://127.0.0.1:8000`.

---

### 2. Frontend React HUD Setup

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173` to experience the Iron-Man HUD.

---

### 3. Standalone Voice Mode (Optional Desktop Daemon)

To run JARVIS directly from your terminal as a continuous voice assistant:

```bash
cd backend
python voice_assistant.py
```

---

## 🛡️ Key Features

- ⚛️ **Iron-Man Arc Reactor Core**: Animated SVG/CSS reactor that speeds up dynamically during listening, vocalizing, and thinking states.
- 🎙️ **Dual-Mode Voice System**:
  - **Browser HUD**: Zero-install Web Speech API for instantaneous voice recognition & browser voice synthesis out-of-the-box.
  - **Desktop Assistant**: PyAudio / SpeechRecognition + pyttsx3 continuous desktop loop.
- 🧠 **Persistent SQLite Memory**: Automatically records conversation history and tool executions across sessions with full purging capability.
- 📊 **Real-time Hardware Telemetry**: Live CPU load, RAM usage (GB used/total), power cell / battery level, and charging status.
- 🔒 **Safe Tool Execution**: Strict allowlists for desktop apps (Notepad, Calculator, VS Code, Paint, Chrome) and web navigation to avoid unsafe command injection.
- 🌐 **LLM Brain & Fallback**: Integrates Google Gemini / OpenAI with conversational history injection and offline fallback heuristics.

---

## 🚀 Future Roadmap (v2 & Beyond)

- [ ] **Vision Intelligence**: Webcam screenshot analysis & document OCR.
- [ ] **Computer Agent Automation**: PyAutoGUI desktop automation.
- [ ] **Custom Skills & Plugins**: Pluggable skill directory for extended developer workflows.
