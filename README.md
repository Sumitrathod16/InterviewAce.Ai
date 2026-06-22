# InterviewAce AI 🚀

InterviewAce AI is a premium, modern, AI-powered interview preparation platform. Designed with a clean, high-end SaaS styling scheme using a strictly dark, white, and subtle slate color palette, it offers candidate workspace tools to master behavioral, technical, and coding interview rounds.

---

## ✨ Core Features

*   **🎙️ Interactive AI Mock Interview Simulator:** 
    *   Choose from HR Behavioral, Frontend Technical, or Backend Technical tracks.
    *   Select the exact number of questions (**3, 5, or 10 questions**) per round to adapt to your level.
    *   Speech-to-text voice dictation is supported (using browser-native SpeechRecognition) with live, animated CSS audio waveforms.
*   **📄 Interactive ATS Resume Analyzer:** Drag & drop your resume or check suggestions (quantifying results, replacing weak action verbs, layout optimization) which update the circular ATS score metrics in real-time.
*   **💻 Interactive Coding Assessment Sandbox:** Solve 6 algorithmic challenges (Two Sum, Reverse String, Valid Palindrome, Fizz Buzz, Fibonacci, and Merge Sorted Array) inside a code compiler editor complete with line numbers, console outputs, and optimization diagnostics.
*   **🤖 OpenRouter LLM Service Integration:** Calls models like Google Gemini 2.5 Flash via OpenRouter for high-speed, keyless, and structured response evaluations.
*   **⚡ Keyless Wandbox Compiler Service:** Code execution is backed by Wandbox APIs, providing a 100% keyless and fast online compilation sandbox for multiple languages (Python, JavaScript, C++, C, Java).
*   **💳 Razorpay Payments Integration:** Seamless checkout using Razorpay payment links and signature callback validations. Includes a local developer mock payment gateway fallback.
*   **🔄 15-Day Free Student Limits & Refills:** Free tier student accounts receive **3 mock interviews** and **2 resume scans** every 15 days. Limits automatically refill when a request is made 15 days or more after their `freeRefillDate`.
*   **🔒 Stateful SaaS Authentication:** Custom email/password signup and login synced dynamically to a MongoDB database.
*   **🌐 Navigation Active Tab Synchronization:** The navbar links are synchronized to dashboard tabs when logged in, preventing accidental logouts and keeping navigation fluid.

---

## 🛠️ Tech Stack & Requirements

### Frontend:
*   **Library:** React (JS ES6)
*   **Routing:** React Router DOM v6
*   **Styling Engine:** Tailwind CSS v3
*   **Animations:** Framer Motion
*   **Icons:** Lucide React

### Backend:
*   **Server:** Node.js, Express
*   **Database:** MongoDB, Mongoose
*   **Authentication:** Firebase Admin SDK & JWT Sessions
*   **Payments:** Razorpay Node.js SDK
*   **Services:** Axios, Multer, PDF-Parse, Cloudinary SDK

---

## ⚙️ Local Development Setup

To boot the developer environment locally:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Sumitrathod16/InterviewAce.Ai.git
    cd InterviewAce.Ai
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the `server` directory matching the variables in `server/.env.template`.

3.  **Install dependencies:**
    *   **Root Workspace (Frontend):**
        ```bash
        npm install
        ```
    *   **Server Workspace (Backend):**
        ```bash
        cd server
        npm install
        cd ..
        ```

4.  **Run Development Servers:**
    *   **Frontend Client:**
        ```bash
        npm run dev
        ```
    *   **Backend Server:**
        ```bash
        cd server
        npm run dev
        ```

5.  **Production build compilation:**
    ```bash
    npm run build
    ```
