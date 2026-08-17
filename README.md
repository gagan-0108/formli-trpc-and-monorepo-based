<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-000?logo=nextdotjs&logoColor=fff" alt="Next.js" />
  <img src="https://img.shields.io/badge/tRPC-398CCB?logo=trpc&logoColor=fff" alt="tRPC" />
  <img src="https://img.shields.io/badge/Drizzle-C5F74F?logo=drizzle&logoColor=000" alt="Drizzle" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo&logoColor=fff" alt="Turborepo" />
</div>

<br />

<div align="center">
  <h1>🎨 Formli</h1>
  <p><strong>Build beautiful forms people actually enjoy filling out.</strong></p>
  <p>A production-grade, Typeform-style form builder SaaS built with <b>Turborepo</b>, <b>tRPC</b>, <b>Zod</b>, <b>Drizzle ORM</b>, and <b>Scalar</b>.</p>
</div>

---

## 🚀 Live Demo

| Resource | URL |
|----------|-----|
| **Web App** | `http://localhost:3000` |
| **API Server** | `http://localhost:8000` |
| **API Docs (Scalar)** | `http://localhost:8000/docs` |
| **OpenAPI JSON** | `http://localhost:8000/openapi.json` |

### Demo Credentials

```
Email:    demo@formli.com
Password: demo123
```

### Sample Public Forms

| Form | URL | Theme |
|------|-----|-------|
| 🎬 Ultimate Movie Buff Survey | `/f/movie-survey` | Hollywood |
| 🌸 Anime Fan Poll 2025 | `/f/anime-poll` | Anime Pop |
| 🚀 Startup Product Feedback | `/f/startup-feedback` | Startup Launch |

---

## ✨ Features

### Core
- ✅ **Email/Password Authentication** — JWT-based with protected routes
- ✅ **Form CRUD** — Create, edit, publish, unpublish, archive, delete
- ✅ **9 Field Types** — Short text, Long text, Email, Number, Single select, Multi select, Checkbox, Rating, Date
- ✅ **Dynamic Validation** — Zod-powered server-side validation
- ✅ **Visibility Controls** — Public or Unlisted forms

### Form Experience
- ✅ **Typeform-style Renderer** — One question per page, smooth animations, keyboard navigation
- ✅ **12 Visual Themes** — Anime Pop, Shonen Battle, Racing Red, Hollywood, Retro Arcade, Neon Cyberpunk, and more
- ✅ **Welcome & Ending Screens** — Customizable intro and thank-you pages
- ✅ **Email Collection** — Optional respondent email capture
- ✅ **Public Submissions** — No login required

### Analytics & Responses
- ✅ **Responses Dashboard** — Paginated table with slide-over detail view
- ✅ **Analytics Charts** — Responses over time, per-field breakdowns (Recharts)
- ✅ **CSV Export** — Download all responses as CSV

### Email Flows
- ✅ **New Response Notification** — Creator receives email on new response
- ✅ **Submission Confirmation** — Respondent receives thank-you email
- 📧 Simulated in dev (console). Integrate Resend/SendGrid for production.

### Security
- ✅ **Rate Limiting** — 20 submissions/15min per IP, 100 req/min general
- ✅ **JWT Auth** — Secure Bearer token authentication
- ✅ **Input Validation** — Zod schemas on every tRPC endpoint

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo |
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui |
| **Backend** | Express.js, tRPC, trpc-to-openapi |
| **Database** | PostgreSQL, Drizzle ORM |
| **Validation** | Zod |
| **Auth** | bcryptjs + JWT |
| **API Docs** | Scalar (OpenAPI) |
| **Charts** | Recharts |

---

## 📦 Project Structure

```
formli/
├── apps/
│   ├── api/             — Express API server (tRPC + OpenAPI + Scalar)
│   └── web/             — Next.js frontend
├── packages/
│   ├── database/        — Drizzle ORM schema, migrations, seed data
│   ├── services/        — Business logic (Auth, Form, Field, Response, Theme, Email)
│   ├── trpc/            — tRPC routers, middleware, context
│   ├── logger/          — Logging utility
│   ├── eslint-config/   — Shared ESLint configuration
│   └── typescript-config/ — Shared TypeScript configuration
├── turbo.json
├── docker-compose.yml
└── .env.example
```

---

## 🏁 Local Setup

### Prerequisites
- Node.js >= 18
- pnpm 9+
- PostgreSQL 15+ (local or Docker)

### 1. Clone & Install

```bash
git clone <repository-url>
cd formli
pnpm install
```

### 2. Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/formli_dev
JWT_SECRET=your-secret-key-min-32-chars-long
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
LOGGER_LEVEL=debug
```

### 3. Database Setup

```bash
docker compose up -d          # Start PostgreSQL
pnpm db:generate              # Generate migrations
pnpm db:migrate               # Run migrations
pnpm db:seed                  # Seed demo data
```

### 4. Start Development

```bash
pnpm dev
```

---

## 📊 API Documentation

Scalar API docs: http://localhost:8000/docs

### API Routes

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `auth.signup` | Mutation | Public | Create account |
| `auth.login` | Mutation | Public | Sign in (JWT) |
| `auth.me` | Query | Protected | Current user |
| `form.create` | Mutation | Protected | Create form |
| `form.list` | Query | Protected | List forms |
| `form.getById` | Query | Protected | Get form + fields |
| `form.update` | Mutation | Protected | Update form |
| `form.delete` | Mutation | Protected | Delete form |
| `form.publish` | Mutation | Protected | Publish form |
| `form.unpublish` | Mutation | Protected | Unpublish |
| `form.getBySlug` | Query | Public | Get by slug |
| `form.listPublic` | Query | Public | Public forms |
| `field.add` | Mutation | Protected | Add field |
| `field.update` | Mutation | Protected | Update field |
| `field.delete` | Mutation | Protected | Remove field |
| `field.reorder` | Mutation | Protected | Reorder fields |
| `response.submit` | Mutation | Public | Submit response |
| `response.listByForm` | Query | Protected | Response list |
| `response.getAnalytics` | Query | Protected | Analytics |
| `response.exportCSV` | Query | Protected | CSV export |
| `theme.list` | Query | Public | List themes |

---

## 🎨 Themes

| Theme | Category | Emoji |
|-------|----------|-------|
| Anime Pop | Anime | 🌸 |
| Shonen Battle | Anime | ⚔️ |
| Racing Red | Cars | 🏎️ |
| Midnight Drive | Cars | 🌃 |
| Retro Arcade | Gaming | 🕹️ |
| Neon Cyberpunk | Gaming | 💜 |
| Startup Launch | Startups | 🚀 |
| Product Hunt | Startups | 🔥 |
| Hollywood | Movies | 🎬 |
| Film Noir | Movies | 🎞️ |
| Minimal Snow | Minimal | ❄️ |
| Deep Space | Space | 🌌 |

---

## 📐 Architecture

```
┌──────────────┐     tRPC (type-safe)     ┌──────────────┐
│   Next.js    │ ◄───────────────────────► │  Express.js  │
│  (Frontend)  │                           │  (Backend)   │
│  port 3000   │                           │  port 8000   │
└──────────────┘                           └──────┬───────┘
                                                  │
                                           ┌──────▼───────┐
                                           │  PostgreSQL   │
                                           │  (Drizzle)    │
                                           │  port 5432    │
                                           └──────────────┘
```

---

Built with ❤️ using Turborepo + tRPC + Drizzle + Next.js
