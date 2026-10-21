# ⚡ Campus Bridge — Campus Placement Technicals Suite

> **An ultra-fast, full-featured coding platform specifically engineered for training final-year engineering students for campus technical placement rounds (TCS NQT, Infosys DPhi / HackWithInfy, Amazon OA, Microsoft, Google, Wipro Turbo, Cognizant GenC).**

---

## 🖥️ 1080p Widescreen Design System

- **Native 1920x1080 Edge-to-Edge Layout**: Full viewport canvas utilization without artificial narrow column restrictions.
- **Cohesive Dark Palette**:
  - Obsidian Core: `#0a0b0f`
  - Deep Panel Backgrounds: `#12131b` & `#161822`
  - Subtle Frosted Borders: `#202334`
  - High-Tech Accents: Indigo (`#6366f1`), Cyan (`#06b6d4`), Amber (`#f59e0b`), Emerald (`#10b981`), Rose (`#f43f5e`).

---

## 🚀 Tech Stack

- **Frontend**: **Next.js 14** (App Router), **React 18**, **Tailwind CSS**, **Monaco Editor** (VS Code in Browser), **Lucide Icons**, **Canvas Confetti**.
- **Backend**: **NestJS 10** (TypeScript, Modular Architecture, JWT Authentication, Multi-Language Sandbox Judge).
- **Database**: **SQLite** via **Prisma ORM** (`backend/prisma/dev.db` - zero config, fast, file-based).
- **Execution Judge**: Native multi-language runner supporting **Python 3**, **C++ (GCC 16)**, **Java 25**, and **JavaScript (Node 22)** with sandboxed execution, 4-second timeout protection, and testcase diffing.

---

## 🎯 Final-Year Placement Training Features

1. **Campus Bridge Coding Workspace (`/problems/[slug]`)**:
   - Native split workspace with Monaco Editor.
   - Multi-language code editor with starter templates for **Python 3**, **C++**, **Java**, and **JavaScript**.
   - **Interactive Console Drawer**:
     - *Testcase Tab*: Case 1, 2, 3 toggle + editable custom input box.
     - *Test Result Tab*: Real-time evaluation, Passed/Failed status, Runtime ms, Memory KB, stdout, and expected vs actual diff.
   - **Submissions Tab**: Personal submission history with runtime, memory, and code.
   - **Editorial Tab**: Optimal time & space complexity analysis ($O(N)$ vs $O(N^2)$).
   - **Interview Notes Tab**: Persistent note-taking for quick revision before interview day.
   - **Celebration Confetti**: Visual burst on accepted code submissions.

2. **Placement Problem Directory (`/problems`)**:
   - Filter by Company Recruitment Drives: **TCS NQT**, **Infosys DPhi**, **Amazon**, **Google**, **Microsoft**, **Wipro Turbo**, **Cognizant**, **Goldman Sachs**.
   - Filter by DSA Patterns: **Arrays**, **Two Pointers**, **Sliding Window**, **Dynamic Programming**, **Graphs**, **Stack**, **Intervals**, **Heap**, **Strings**.
   - Filter by Difficulty: Easy, Medium, Hard.
   - Solved / Attempted / Todo progress tracking.

3. **Curated Placement SDE Sheets (`/sheets`)**:
   - **Placement Technicals 100**: Core questions frequently repeated in campus hiring.
   - **Service MNC High Frequency**: TCS NQT, Infosys DPhi, Wipro Turbo, and Cognizant essentials.
   - **Blind 75 Placement Essentials**: Universal pattern checklist.
   - **Product & FinTech Track**: Amazon, Google, Microsoft, and Morgan Stanley.
   - Interactive checklist with real-time percentage progress bars.

4. **Timed Placement Mock Assessments (`/assessments`)**:
   - **TCS NQT Coding Mock (45 Mins)**: 2 questions.
   - **Amazon SDE Online Assessment (70 Mins)**: 2 questions.
   - **Infosys Specialist Programmer Mock (90 Mins)**: 3 questions.
   - Real-time countdown timer, automated score calculation across private test cases, and pass/fail scorecard report!

5. **Campus Leaderboard & Analytics (`/leaderboard` & `/profile`)**:
   - Student rankings by problems solved and mock test scores.
   - Solved breakdown donut (Easy / Medium / Hard), mastered company tags, and daily submission streak.
   - Profile editor to update College, Graduation Year (e.g. 2026), and Target Companies.

---

## 💻 Running the Platform Locally

### 1. Backend (NestJS + SQLite)
```bash
cd backend
npm run start:prod   # runs on http://localhost:4000/api
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm run start        # runs on http://localhost:3000
```

---

## 🔑 Demo Account (1-Click Login)

The platform includes a 1-click student demo login in the navigation bar:
- **Email**: `student@placement.edu`
- **Password**: `placement2026`
- **Role**: Final Year Candidate
- **Target**: Amazon / Microsoft / TCS Prime
