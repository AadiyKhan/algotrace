# AlgoTrace 🧠✨

AlgoTrace is an interactive, Gen-Z funky algorithm visualizer and debugger. 

Instead of just staring at static code, AlgoTrace lets you scrub through execution traces step-by-step like a YouTube video. It supports dynamic trace generation via Google Gemini, allowing you to debug your own failing code or visualize any algorithmic problem instantly.

## Features
- **Dynamic AI Tracing**: Paste your own failing code, and Gemini will trace exactly how it executes step-by-step, visually revealing bugs or infinite loops.
- **Multi-Language Support**: Choose between Pseudocode, JavaScript, Python, Java, or C++.
- **Gamified Debugging**: XP bars, loot-rarity difficulty badges, and confetti bursts when you finish tracing a problem.
- **Multiple Visualizers**: Built-in support for Arrays, Linked Lists, Trees, Graphs, and Matrices.
- **Offline Mode**: Pre-generated registry of 700+ common problems available instantly.

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- Gemini API Key

### Installation

1. **Clone & Install Dependencies**
\`\`\`bash
npm install
cd server
npm install
\`\`\`

2. **Environment Variables**
Create a \`.env\` file in the root directory (see \`.env.example\`):
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
API_KEY=optional_key_to_bypass_rate_limits
\`\`\`

3. **Run the App**
Start the frontend and backend simultaneously:
\`\`\`bash
npm run dev
\`\`\`
- Frontend: \`http://localhost:5173\`
- Backend: \`http://localhost:3001\`

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Zustand, Framer Motion
- **Backend**: Express, Node.js, Google Gemini SDK
- **Design**: Duotone Hacker Aesthetic (Space Grotesk + JetBrains Mono)
