Assignment 3: Real-Time AI Code Review Bot | Hiring Assignment — AI-First Full Stack Developer

Confidential — For Candidate Use Only | Page 1
HIRING ASSIGNMENT
Assignment 3

Real-Time AI Code Review Bot

Role AI-First Full Stack Developer (Fresher)
Stack Node.js + TypeScript (Backend) · Python (AI Service) ·

WebSockets
Duration 4–5 Days
Difficulty Mid-Level Problem
Submission GitHub Repository + Live Demo Link

Overview
Build a real-time AI code review tool. A developer pastes or uploads a code snippet, and the
system streams back a structured review — categorising issues into bugs, style problems, and
security concerns — in real time. A Node.js/TypeScript backend manages sessions via
WebSockets, a Python microservice handles LLM communication, and a TypeScript frontend
renders streaming feedback in a split-pane editor.
This tests your understanding of real-time systems, microservice communication, TypeScript
discipline, and the ability to produce structured LLM outputs at speed.
Problem Statement
Code review is time-consuming and inconsistent. Your task is to build an AI-powered bot that
gives developers instant, structured feedback on any code snippet — streamed live as the
model generates it. Sessions should be persistent so a user can view past reviews.
Functional Requirements
1. Code Input UI (Frontend — TypeScript/React)
• Split-pane layout: left pane is a code editor (use CodeMirror or Monaco Editor), right
pane shows AI feedback
• Support paste or file upload (.js, .ts, .py, .go, .java, etc.)
• Language auto-detection (show detected language as a badge)
• &#39;Review Code&#39; button triggers a WebSocket connection for streaming
• Show a &#39;Reviewing...&#39; animated indicator while streaming
2. WebSocket Session Manager (Node.js / TypeScript)
• On connection, assign a unique session ID (UUID)

Assignment 3: Real-Time AI Code Review Bot | Hiring Assignment — AI-First Full Stack Developer

Confidential — For Candidate Use Only | Page 2
• Accept incoming code payload via WebSocket message
• Forward code to the Python AI service via HTTP POST
• Stream the AI response back to the client as chunks arrive
• Persist each review session to SQLite: session ID, code snippet, full review, timestamp
• Expose REST endpoints: GET /sessions (list all), GET /sessions/:id (get one review)
3. AI Review Service (Python / FastAPI)
• Accept POST /review with code and language
• Call LLM with a structured prompt that requests a JSON review object
• Review schema: { bugs: [...], style: [...], security: [...], summary: string, score: number }
• Stream the response back using Server-Sent Events (SSE) or chunked response
• The Node backend consumes this stream and forwards to the WebSocket client
4. Review History UI
• Sidebar listing past review sessions (language, date, score)
• Click a past session to reload the code and its review in the split pane
• Allow deleting a session

WebSocket Flow Diagram
Client → WS Connect → Node.js assigns session ID
Client → sends { code, language } via WS message
Node.js → POST /review to Python AI service
Python streams chunks → Node.js forwards each chunk → Client renders live
Node.js → saves completed review to SQLite
Client → receives done event → review finalised

Technical Specifications
Area Requirement
WebSockets Use ws or socket.io in Node.js; native WebSocket API in React
Streaming Python uses FastAPI StreamingResponse or SSE; Node.js pipes to

WS client

TypeScript Strict mode enabled; all WS message types must be typed interfaces
AI Prompting Prompt must enforce JSON schema output — use function calling or

JSON mode

Assignment 3: Real-Time AI Code Review Bot | Hiring Assignment — AI-First Full Stack Developer

Confidential — For Candidate Use Only | Page 3

Storage SQLite via better-sqlite3 (Node) — simple schema: sessions +

reviews tables

Error Handling Graceful WS disconnect handling; LLM timeout fallback message to

client

Bonus Features (Optional)
• GitHub PR URL input: fetch the diff automatically via GitHub API and review it
• Inline annotations: show bug and security markers on the code editor lines
• &#39;Fix this bug&#39; button on each issue — triggers a second LLM call to suggest a fix
• WebSocket reconnection logic with session restoration
Free Hosting Guide
Python AI Service — Render.com
• Push Python FastAPI service to GitHub
• Render → New Web Service → set start command: uvicorn main:app --host 0.0.0.0 --
port $PORT
• Add OPENAI_API_KEY (or equivalent) in Render environment variables
• Free tier: adequate for demo; note 50-second request timeout on free Render instances
Node.js + TypeScript Backend — Railway.app
• Railway handles Node.js + WebSocket servers better than Render&#39;s free tier (no timeout
on WS connections)
• railway.app → New Project → Deploy from GitHub → select backend subfolder
• Set start command: node dist/index.js; add PYTHON_SERVICE_URL in Railway env
vars
• SQLite file persists in Railway&#39;s ephemeral disk — note: resets on redeploy (acceptable
for demo)
Frontend — Vercel
• Connect React app repo to Vercel; set VITE_WS_URL to your Railway WebSocket URL
(ws://...)
• Note: Vercel serves HTTPS, so your WebSocket server must support WSS (Railway
provides this automatically)
• Auto-deploys on every push to main

Evaluation Criteria

Assignment 3: Real-Time AI Code Review Bot | Hiring Assignment — AI-First Full Stack Developer

Confidential — For Candidate Use Only | Page 4
Criteria Weight What We Look For
WebSocket + Streaming 30% Real-time chunks, session
management, reconnect handling
TypeScript Discipline 25% Strict types, WS message interfaces, no

implicit any

Prompt Engineering 20% JSON schema enforcement, category

separation, score logic

Microservice Design 15% Clean Python/Node boundary, error
propagation, SSE/stream piping
README + Architecture 10% Flow diagram, .env.example, clear

setup steps, demo link

Submission Instructions
1. Push all code to a public GitHub repository named ai-code-review-bot
2. Recommended structure: /ai-service (Python), /backend (Node.js/TS), /frontend
(React/TS)
3. Include a README.md with: WebSocket flow diagram, .env.example for both services,
setup steps, live demo URL
4. Deploy AI service to Render, Node backend to Railway, frontend to Vercel
5. Submit: GitHub URL + Live Demo URL via the provided form

Note: During the interview, we will review your TypeScript type definitions for WebSocket messages and
ask you to explain your streaming architecture. Ensure your WS message types are clean, well-named
interfaces — this will be a key discussion point."# ai-code-review-bot" 
