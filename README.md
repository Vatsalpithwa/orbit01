# Orbit Mentor AI 🚀
**Production-Ready AI Learning, Productivity, Coding & Career Platform**

Orbit Mentor AI is an all-in-one dark-themed web application designed as an autonomous AI mentor, real-time chatbot, daily task manager, multi-language coding lab, exam certification platform, progress scoreboard, and career roadmap assistant.

---

## 🌟 Key Features

1. **Futuristic Landing Page**:
   - Celestial glassmorphism design with responsive gradients and accessibility.
   - One-click Google OAuth sign-in and instant live demo exploration.

2. **Google OAuth & Secure Persistent Sessions**:
   - Google sign-in powered by Supabase Auth with zero password collection.
   - Persistent user profile with avatar, interests, career goal, and study preferences.
   - PostgreSQL Row-Level Security (RLS) ensuring strict user data isolation.

3. **Autonomous AI Chatbot with Streaming & Citations**:
   - Streaming responses with Markdown formatting, syntax highlighting, and copy buttons.
   - Two selectable mentor personalities:
     - **Astra**: Female persona, inspiring, structured, empathetic, deep-tech guide.
     - **Orion**: Male persona, analytical, pragmatic, veteran software architect.
   - Explanation depth toggles: **Beginner**, **Intermediate**, and **Expert / Architectural**.
   - Drag-and-drop / file upload with AI vision and diagram analysis.
   - Voice note recording with live waveform, transcription, and speech-to-text.
   - Real-time Web Search mode citing live technical sources and references.

4. **Daily Task Manager & Pomodoro Focus Timer**:
   - Task CRUD with categories, priorities, due dates, and recurring patterns.
   - List and Weekly Calendar views.
   - Integrated Pomodoro focus timer (25m Focus, 5m Short Break, 15m Long Break, Custom).
   - Melodic Web Audio API synthesized alert chimes and in-app notifications on timer completion.

5. **Cognitive Scoreboard & Telemetry**:
   - Daily, weekly, monthly, and all-time performance metrics.
   - GitHub-style 365-day practice heatmap.
   - Visual focus velocity bar chart and unlocked achievement badges.
   - Identification of strongest competencies and personalized areas to improve.

6. **Adaptive AI Quiz Generator**:
   - Instant quiz generation from any topic, subject, or pasted study notes.
   - Supports Multiple-Choice, True/False, Short Answer, and Coding questions.
   - Post-submission scoring, complete solutions, and historical improvement analytics.

7. **Voice Mentors Stage**:
   - Lifelike vocal narration using Web Speech Synthesis and Speech Recognition.
   - Speech rate controls (0.8x to 1.5x), pitch tuning, and mute options.
   - Step-by-step explainer mode and audio image analysis.

8. **Multi-Language Sandboxed Code Lab**:
   - Full code workspace supporting **JavaScript, Python 3, HTML5/CSS3, SQL, and C++ 20**.
   - Line numbers, syntax styling, starter templates, and run time benchmarking.
   - **Safe Sandboxed Execution**: untrusted code never executes directly on the server host:
     - JavaScript runs in an isolated client-side worker context.
     - Python runs in client WebAssembly.
     - HTML/CSS renders in a secure, sandboxed iframe.
     - SQL executes in an in-memory relational sandbox with sample schemas.
   - "Ask Mentor" & "Get Hint" educational debug assistant for progressive clues without spoiling solutions.

9. **Timed Certification Exams**:
   - Timed exams with countdown timer, question navigator, and flag for review.
   - 3 progressive hint tokens per test session.
   - Score breakdown and AI-generated revision recommendations.

10. **Step-by-Step Career Roadmap**:
    - Phased engineering roadmaps (Foundations -> Intermediate -> Advanced -> Capstone Projects -> Interview Prep).
    - Interactive milestone checkboxes and curated resource links.
    - Senior & Staff interview questions for each milestone.
    - Custom career roadmap generator for any specialized role.

11. **Frontier Tech News**:
    - Fresh daily global updates across AI, Software, Cybersecurity, Science, and Open Source.
    - Category filters, article summaries, bookmarks, and instant "AI Brief" summaries.

12. **3D Interactive Tech Globe**:
    - Three.js rotating 3D Earth with atmospheric glow and star field.
    - Interactive pulsing markers pinpointing global AI breakthroughs, tech summits, and quantum labs.
    - Click-to-inspect cards with verified source attributions.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Frontend**: React 18, TypeScript, Vanilla CSS Design System with CSS Tokens & Glassmorphism
- **Icons**: Lucide React
- **Graphics & 3D**: Three.js
- **Audio**: Web Audio API (Synthesized procedural chimes)
- **Database & Auth**: Supabase (PostgreSQL with Row-Level Security, Google OAuth)
- **AI Engine**: Google Gemini API integration with intelligent fallback reasoning engine

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**

### 2. Installation
```bash
# Clone the repository and enter directory
cd "chat bot"

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration keys:
```env
# Supabase Configuration (Optional - app automatically falls back to secure Local Demo mode if empty)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# AI API Key (Optional - app includes intelligent fallback mentor AI engine if empty)
GEMINI_API_KEY=your-google-gemini-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note**: Even without external API keys, the application is **100% interactive and fully functional** out of the box with persistent local session storage and simulated Google Auth!

### 4. Setting up Supabase (Optional for Cloud Sync)
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Authentication -> Providers -> Google** and enable Google OAuth by supplying your Google Cloud Client ID and Secret.
3. In **Authentication -> URL Configuration**, set the Redirect URL to:
   ```
   https://your-domain.com/auth/callback
   # Or for local development:
   http://localhost:3000/auth/callback
   ```
4. Open the Supabase **SQL Editor** and paste the contents of `supabase_schema.sql` included in this repository. Click **Run** to generate all tables, triggers, and Row-Level Security (RLS) policies.

### 5. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Architecture

1. **Google OAuth 2.0 Only**: Never collects or stores Google passwords. Sessions are managed through secure tokens.
2. **Database Row-Level Security (RLS)**: Every table enforces `auth.uid() = user_id`, guaranteeing zero cross-tenant leakage.
3. **Sandboxed Code Execution**: User code in JavaScript, Python, C++, HTML, and SQL runs client-side in sandboxed workers, iframes, and WebAssembly—never on the backend node server.
4. **Attribution & Transparency**: Web search results and news items cite their source publisher, publication date, and domain.

---

## 📦 Deployment (Vercel / Netlify / Node)

### Deploy to Vercel:
1. Push the code to a GitHub repository.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_APP_URL`).
4. Click **Deploy**.

---

© 2026 Orbit Mentor AI. Empowering developers, students, and engineers globally.
