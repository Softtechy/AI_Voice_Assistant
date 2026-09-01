# 🎙️ AI Voice Assistant (React & Gemini API)

A full-stack React application with real-time **Voice Input (Speech-to-Text)** and **Voice Output (Text-to-Speech)** powered by the Google Gemini API. Ready for **1-click deployment on Vercel**.

---

## ✨ Features

- **🎙️ Dual Input (Voice & Text)**: Click the microphone to speak with real-time speech recognition or type your question.
- **🔊 Visual & Spoken Answers (TTS)**: View answers formatted in markdown and hear them read aloud automatically via speech synthesis.
- **🌊 Voice Waveform Visualizer**: Dynamic animated sound waves when speaking or listening.
- **🎛️ Audio & Voice Controls**:
  - Auto-Speak toggle (Voice On / Muted).
  - Stop Speaking & Replay speech buttons on every message bubble.
  - Settings modal with pitch, speed rate, voice model, and language options.
- **⚡ Vercel Ready**: Built with Next.js App Router and serverless `/api/ask` route to keep your `GEMINI_API_KEY` secure.

---

## 🚀 Quick Start (Local)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure your API Key**:
   Create or edit `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Get your free API key at [Google AI Studio](https://aistudio.google.com/))*

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 How to Deploy to Vercel

### Method 1: Deploy with Vercel CLI (Fastest)

1. Run Vercel deployment command:
   ```bash
   npx vercel
   ```
2. Follow the quick terminal prompts (log in if asked, press Enter for defaults).
3. Add your environment variable on Vercel:
   ```bash
   npx vercel env add GEMINI_API_KEY
   ```
4. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

### Method 2: Deploy with GitHub + Vercel Web Dashboard

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AI Voice Assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New" > "Project"**.
   - Select your GitHub repository.
   - Under **Environment Variables**, add:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: `Your Gemini API key`
   - Click **"Deploy"**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Next.js (App Router), Lucide Icons, React Markdown
- **Voice APIs**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Backend / API**: Next.js Serverless API Route (`/api/ask`)
- **AI Model**: Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`)
- **Hosting**: Vercel
