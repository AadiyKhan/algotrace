<div align="center">
  <img src="./src/assets/hero.png" alt="AlgoTrace Hero" width="600" />

<pre>
    ___    __               ______                     
   /   |  / /___ _____     /_  __/________ _________ 
  / /| | / / __ `/ __ \     / / / ___/ __ `/ ___/ _ \
 / ___ |/ / /_/ / /_/ /    / / / /  / /_/ / /__/  __/
/_/  |_/_/\__, /\____/    /_/ /_/   \__,_/\___/\___/ 
         /____/                                      
</pre>

  **[ STOP STARING AT STATIC CODE ]** <br/>
  AlgoTrace is an interactive, AI-powered algorithm visualizer that lets you scrub through execution traces step-by-step like a YouTube video. 

  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Express](https://img.shields.io/badge/Express-5-black?style=for-the-badge&logo=express)](https://expressjs.com/)
</div>

---

## [0x00] THE VIBE
AlgoTrace isn't your professor's boring DSA tool. Built with a **Duotone Hacker Aesthetic** (Bricolage Grotesque + Electric Cyan/Crimson clash), it turns debugging into a gamified experience. Complete a trace? Get a confetti burst. Solving a hard problem? It's badged with animated rainbow loot-rarity.

## [0x01] SYSTEM FEATURES

- **[ INTERACTIVE AI DEBUGGER ]**: Paste your own failing code. Gemini 3.1 Flash Lite will trace exactly how it executes step-by-step, visually revealing logic bugs, infinite loops, and state changes.
- **[ MULTI-LANGUAGE PARSER ]**: Trace your code in **Pseudocode, JavaScript, Python, Java, or C++**.
- **[ GAMIFIED UI ]**: Bouncy spring-physics UI, loot-rarity difficulty badges, and meme-coded microcopy ("cooking your trace", "server is sleeping").
- **[ UNIVERSAL VISUALIZERS ]**: Built-in support for rendering **Arrays, Linked Lists, Trees, Graphs, and Matrices** dynamically based on the algorithm's state.
- **[ 700+ OFFLINE REGISTRY ]**: Comes with a massive, instantly searchable local registry of classic algorithmic problems out-of-the-box (no API key needed for the offline registry).

---

## [0x02] TECH STACK
- **[ CORE ]**: React 19, Vite, TailwindCSS v4, Framer Motion, Zustand, Canvas Confetti
- **[ ENGINE ]**: Express v5, Node.js, Google Gemini SDK, Node-Fetch
- **[ DIAGNOSTICS ]**: Vitest
- **[ PIPELINE ]**: GitHub Actions, unified static serving for zero-config Render/Railway deployments.

---

## [0x03] LOCAL INITIALIZATION

### [ DEPENDENCIES ]
- Node.js (v20+)
- Gemini API Key (Grab one free from Google AI Studio)

### [ BOOT SEQUENCE ]
\`\`\`bash
# Install frontend core
npm install

# Install backend engine
cd server && npm install
\`\`\`

### [ ENVIRONMENT CONFIG ]
Create a \`.env\` file in the root directory (you can copy \`.env.example\`):
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
API_KEY=optional_key_to_bypass_rate_limits
\`\`\`

### [ IGNITION ]
Start both the React frontend and the Express backend simultaneously:
\`\`\`bash
npm run dev
\`\`\`
- Frontend terminal: \`http://localhost:5173\`
- Backend API node: \`http://localhost:3001\`

---

## [0x04] PRODUCTION DEPLOYMENT
AlgoTrace is configured to be deployed as a unified Node.js app!
1. Connect your repo to **Render** or **Railway**.
2. Set the build command to: \`npm run build\`
3. Set the start command to: \`npm start\`
4. Inject your \`GEMINI_API_KEY\` to the environment variables.

The backend automatically serves the compiled frontend and routes all unrecognized requests to \`index.html\` for React Router to handle!

---
<div align="center">
  <i>END OF LINE</i>
</div>
