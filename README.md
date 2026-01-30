# PorkVision: AI-Powered Legislative Transparency Auditor

**Audit government legislation with AI. Expose hidden spending and lobbyist influence.**

PorkVision is a browser-based forensic auditor that uses Google's Gemini 2.5 Flash AI to analyze bills and legislation, identifying potential "pork barrel" spending, lobbyist fingerprints, and policy contradictions. It leverages real-time Google Search grounding to cross-reference bill language with public records and corporate donor data.

## Overview

PorkVision empowers citizens, journalists, and researchers to perform deep forensic audits on legislative documents. Instead of relying on manual research, PorkVision's AI engine automatically scans text for tell-tale signs of special interest influence, economic impact, and contradictory statements.

The tool operates entirely client-side. Your Google API key is stored only in your browser's local storage, ensuring your credentials are never sent to any server.

## Features

*   **AI-Powered Forensic Analysis:** Uses Gemini 2.5 Flash to identify pork-barrel spending, lobbyist language, and policy contradictions.
*   **Real-Time Grounding:** Integrates with Google Search to verify claims and cross-reference beneficiaries with public data.
*   **Client-Side Security:** Your API key is stored locally in your browser. No data is sent to external servers.
*   **Comprehensive Audit Report:** Generates a detailed JSON report with risk scores, summaries, and evidence.
*   **Intuitive Interface:** Simple, terminal-inspired UI designed for quick, focused audits.
*   **Retry Logic:** Automatic backoff and fallback to base model if Google's API quota is exceeded.

## How It Works

1.  **Connect:** Enter your Google Gemini API key in the settings.
2.  **Ingest:** Provide a URL to a bill or paste the full text of legislation.
3.  **Audit:** Click "Execute Forensic Audit." The AI will:
    *   Use Google Search to fetch and analyze the bill content (if a URL is provided).
    *   Identify specific clauses that appear to benefit specific corporations or lobbyists.
    *   Detect contradictions between the bill's current language and past public statements.
    *   Assess the potential long-term economic impact and debt burden.
4.  **Review:** View a detailed, categorized report on the findings.
5.  **Download:** Save the full audit report as a JSON file for further analysis or sharing.

## Installation & Usage

### Prerequisites

*   A Google Cloud Platform account with the **Generative AI API** enabled.
*   An API key for the **Gemini 2.5 Flash** model.

### Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/tomwolfe/pork-vision.git
    cd pork-vision
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:3000`.

5.  **Configure API Key:**
    *   Click the "Neural Link" button in the top-right corner.
    *   Paste your Google Gemini API key into the input field.
    *   Click "Initialize" to save your key locally.

### Usage

1.  On the main page, choose to input a bill via URL or paste raw text.
2.  Click "Execute Forensic Audit."
3.  Wait for the AI to process the information and generate your audit report.

## Technologies Used

*   **Frontend:** Next.js 16 (React 19), Tailwind CSS 4, TypeScript
*   **AI:** Google Generative AI (Gemini 2.5 Flash)
*   **State & Validation:** Zod, Zustand (via custom hook)
*   **Testing:** Vitest, @testing-library/react, jsdom
*   **Styling:** Tailwind CSS, Tailwind CSS Animate
*   **Icons:** Lucide React
*   **Build & Tooling:** ESLint, Vite, PostCSS

## Development

The project is structured using Next.js App Router conventions.

*   **`app/`**: Main application routes and layout.
*   **`components/`**: Reusable UI components (ApiKeyInput, BillUploader, RedFlagCard, AnalysisView).
*   **`hooks/`**: Custom React hooks for state and logic (useGemini).
*   **`lib/`**: Core business logic and AI integration (gemini.ts, parser.ts, schema.ts).
*   **`tests/`**: Unit and integration tests for the core logic.
*   **`public/`**: Static assets.
*   **`styles/`**: Global CSS (tailwind base, components, utilities).

### Testing

Run the test suite:
```bash
npm run test
```

The tests cover the core AI parsing logic (`parser.test.ts`), the custom hook (`useGemini.test.ts`), and end-to-end integration scenarios (`integration.test.ts`).

## Security & Privacy

PorkVision prioritizes user privacy:

*   **No Server-Side Processing:** All analysis happens in your browser.
*   **Local Storage Only:** Your Google API key is stored exclusively in your browser's `localStorage`. It is never transmitted to any server.
*   **Client-Side Validation:** The app validates the API key format locally before use.
*   **No Data Collection:** No user data, bill content, or audit results are logged or stored by the application.

## License

MIT License. See the `LICENSE` file for details.

## Acknowledgments

*   Google AI for providing the Gemini API.
*   The open-source community for the libraries used in this project.
*   The concept of civic technology and government transparency.

---

**Disclaimer:** PorkVision is an experimental tool for educational and journalistic purposes. It does not guarantee the accuracy of its findings and should not be used as legal or financial advice. Always verify AI-generated insights with primary sources.
