# 🛰️ ORBITAL SYSTEMS
### High-Score Neural Path Resume Laboratory & Tactical Audit Terminal

![ORBITAL Next.js](https://img.shields.io/badge/Next.js-24-000000?style=for-the-badge&logo=next.js)
![ORBITAL React](https://img.shields.io/badge/React-20-0f172a?style=for-the-badge&logo=react)
![ORBITAL Tailwind](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![ORBITAL Prisma](https://img.shields.io/badge/Prisma_DB-5A67D8?style=for-the-badge&logo=prisma)
![ORBITAL Razorpay](https://img.shields.io/badge/Pay_with_Razorpay-02042B?style=for-the-badge&logo=razorpay)

**ORBITAL SYSTEMS** is a premium, engineering-first career deployment platform. It leverages deep-context intelligence to bridge the gap between human talent and algorithmic gatekeepers. Built with a "Tactical Terminal" aesthetic, ORBITAL transforms the resume building process into a high-stakes engineering simulation where every data point is optimized for maximum impact.

---

![ORBITAL Landing Page](./public/docs-hero.png)

## 🛠️ Tactical Modules

### 1. The Resume Laboratory (Builder v2.0)
A high-performance workspace designed for precision data entry and real-time synchronization.

![Resume Laboratory](./public/docs-builder.png)

- **Intelligence Units**: Context-aware AI advisors (Expert AI Coach) providing step-by-step guidance.
- **Accordion-Driven Architecture**: Optimized form flow using Shadcn accordions to maximize vertical headspace and reduce scroll fatigue.
- **Dynamic Array Sequencing**: Intuitive drag-and-drop reordering of Work Experience, Education, and Projects.
- **Zero-Loss AutoSave**: Debounced synchronization (3.5s) with the ORBITAL core database ensuring data persistence.
- **Magic Baseline Generator**: Start from scratch with AI-generated templates tailored to your target role.

### 2. Audit Terminal (ATS Tracker)
A tactical interface for analyzing resume performance against high-priority Job Descriptions.

![Audit Terminal](./public/docs-audit.png)

- **Live ATS Score Meter**: HSL-based real-time feedback that reacts as you edit your resume content.
- **Neural Repair (Magic Fix)**: 1-click AI-powered data correction to harmonize your resume with target JDs, repairing social URLs and quantified metrics automatically.
- **Structural Deployment Logs**: Detailed historical audit scores and qualitative AI insights.
- **Keyword Extraction**: Automated identification of missing tactical keywords required for high-percentile matches.

### 3. Intelligence Dashboard & Portability
The central command hub for managing active deployments and token architecture.

![ORBITAL Dashboard](./public/docs-dashboard.png)

- **15+ Premium Templates**: Including Tech, Creative, Startup, Minimalist, and Executive variants.
- **Edge Template Streaming**: Dynamic SVG template previews streamed via Next.js Edge runtime for sub-200ms visual feedback.
- **Global Print Engine**: Robust PDF rendering abstraction that preserves HSL colors and premium typography across physical formats.
- **Public Uplink**: Secure, hash-based sharing links (`/r/[id]`) for direct recruitment access.

---

## ⚡ Technical Infrastructure (The Core)

### **Frontend Architecture**
- **Framework**: Next.js 15+ (App Router, Turbopack, React 19/20 Concurrent Mode).
- **Styling**: Tailwind CSS v4 (Clean-Sheet Implementation) with Shadcn "Dark London" design tokens.
- **Interactions**: Framer Motion micro-animations and Particle Swarm canvas backgrounds.
- **State Management**: Zustand with persistent storage and optimized selector mapping.
- **Data Fetching**: SWR (Layer 1 Client State Caching) for dashboard and profile views.

### **Backend & Intelligence**
- **Core API**: FastAPI (Python) & Next.js API Routes (Hybrid).
- **Intelligence Layer**: OpenAI & Gemini SDK integration with native semantic prompt caching via `lru-cache`.
- **Database**: PostgreSQL (Prisma ORM) with optimized indexing (`@@index`) for O(1) foreign key lookups.
- **Caching**: Local Redis for high-frequency prompt and session storage.

### **Security & Identity**
- **OAuth Infrastructure**: Social login popups for Google, GitHub, and LinkedIn with native Popup-to-Session bridging.
- **Session Security**: OWASP-compliant HTTP headers in `next.config.ts` (XSS & Clickjacking protection).
- **Audit Logic**: Full audit trails for token deployments and profile modifications.

---

## ⚙️ Deployment & Initialization

### 1. Environment Synchronization
Create a `.env.local` to bind your local instance to the ORBITAL core:

```env
# Database Link
DATABASE_URL="postgresql://user:password@host:port/defaultdb"

# Intelligence Keys
OPENAI_API_KEY="sk-..."
# GEMINI_API_KEY="..."

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="orbital_secure_hash"

# Social OAuth (Popup Mode)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# Deployment Finance (Razorpay)
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
```

### 2. Dependency Resolution
Initialize the node environment:
```bash
npm install
```

### 3. Database Harmonization
Push the strict Prisma schema to your target database:
```bash
npm run setup            # Generates CA certs and env checks
npx prisma db push       # Synchronizes tables
npx prisma generate      # Builds custom Prisma client
```

### 4. System Launch
```bash
npm run dev
```

---

## 📁 Repository Map

```text
├── prisma/                 # Database Schema (Users, Resumes, Transactions)
├── public/                 # Sector Assets & High-Res Logos
├── src/                    # System Source Code
│   ├── app/                # Next.js App Router Tree
│   │   ├── api/            # Backend Intelligence & Billing Endpoints
│   │   ├── ats-tracker/    # The Audit Terminal Interface
│   │   └── builder/        # The Resume Laboratory Interface
│   ├── components/         # Tactical UI Components
│   │   ├── form/           # Builder Accordions & Section Logic
│   │   └── templates/      # 15+ Neural Rendering Templates
│   ├── lib/                # Shared Intelligence & Security Core
│   ├── store/              # Global State (Zustand)
│   └── types/              # Strict TypeScript Definitions
└── next.config.ts          # Security Headers & System Config
```

---

## 📄 License & Access

Distributed under the **MIT License**. ORBITAL SYSTEMS is built for professionals who demand excellence.

*Developed by the DeepMind Advanced Agentic Coding Team.*
