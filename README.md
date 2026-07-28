<div align="center">
  <img src="./src/assets/hero.png" alt="AlgoTrace Hero" width="600" />

  # 🧠✨ ALGOTRACE
  
  **Stop staring at static code.** <br/>
  AlgoTrace is an interactive, AI-powered algorithm visualizer that lets you scrub through execution traces step-by-step like a YouTube video. 

  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Express](https://img.shields.io/badge/Express-5-black?style=for-the-badge&logo=express)](https://expressjs.com/)
</div>

---

## ⚡ The Vibe
AlgoTrace isn't your professor's boring DSA tool. Built with a **Duotone Hacker Aesthetic** (Bricolage Grotesque + Electric Cyan/Crimson clash), it turns debugging into a gamified experience. Complete a trace? Get a confetti burst. Solving a hard problem? It's badged with animated rainbow loot-rarity.

## 🚀 Features

- **🤖 Interactive AI Debugger**: Paste your own failing code. Gemini 3.1 Flash Lite will trace exactly how it executes step-by-step, visually revealing logic bugs, infinite loops, and state changes.
- **🌐 Multi-Language Support**: Trace your code in **Pseudocode, JavaScript, Python, Java, or C++**.
- **🎮 Gamified UX**: Bouncy spring-physics UI, loot-rarity difficulty badges, and meme-coded microcopy (*"cooking your trace 🍳"*).
- **🧩 Universal Visualizers**: Built-in support for rendering **Arrays, Linked Lists, Trees, Graphs, and Matrices** dynamically based on the algorithm's state.
- **📚 700+ Pre-Generated Problems**: Comes with a massive, instantly searchable local registry of classic algorithmic problems out-of-the-box (no API key needed for the offline registry).

---

## 💻 Tech Stack
- **Frontend**: React 19, Vite, TailwindCSS v4, Framer Motion, Zustand, Canvas Confetti
- **Backend**: Express v5, Node.js, Google Gemini SDK, Node-Fetch
- **Testing**: Vitest
- **CI/CD**: GitHub Actions, unified static serving for zero-config Render/Railway deployments.

---

## 🛠️ Local Setup

### Prerequisites
- Node.js (v20+)
- Gemini API Key (Grab one free from [Google AI Studio](https://aistudio.google.com/))

### 1. Install Dependencies
\`\`\`bash
# Install frontend deps
npm install

# Install backend deps
cd server && npm install
\`\`\`

### 2. Configure Environment
Create a \`.env\` file in the root directory (you can copy \`.env.example\`):
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
API_KEY=optional_key_to_bypass_rate_limits
\`\`\`

### 3. Run the App
Start both the React frontend and the Express backend simultaneously:
\`\`\`bash
npm run dev
\`\`\`
- Frontend runs on: \`http://localhost:5173\`
- Backend API runs on: \`http://localhost:3001\`

---

## 🚀 Deployment (Unified Node.js App)
AlgoTrace is configured to be deployed as a unified Node.js app!
1. Connect your repo to **Render** or **Railway**.
2. Set the build command to: \`npm run build\`
3. Set the start command to: \`npm start\`
4. Add your \`GEMINI_API_KEY\` to the environment variables.

The backend automatically serves the compiled frontend and routes all unrecognized requests to \`index.html\` for React Router to handle!

---
<div align="center">
  <i>Cooked up with 💻 and ☕</i>
</div>
