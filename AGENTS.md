# MediCare Pro — Agent Guide

## Repository structure

Two independent packages (no monorepo tool):

| Path | Stack | Entry | Port |
|------|-------|-------|------|
| `medicare-backend/` | Node/Express, Sequelize, MySQL, CommonJS (`require`) | `server.js` → `src/app.js` | 5000 |
| `medicare-frontend/` | React 18, TypeScript, Vite, Tailwind, ESM (`import`) | `src/main.tsx` | 3000 |

## Commands

### Backend (`cd medicare-backend`)
- `npm run dev` — nodemon hot-reload
- `npm start` — node server.js
- `npm test` — Jest (supertest available)
- `.env` required (see `.env.example`)

### Frontend (`cd medicare-frontend`)
- `npm run dev` — Vite dev server port 3000
- `npm run build` — `tsc && vite build`
- `npm run preview` — Vite preview server

## Architecture facts

- Backend has **7 models** fully defined: User, Doctor, Patient, MedicalHistory, Appointment, Prescription, PrescriptionItem. All use UUID primary keys set via `beforeCreate` hooks. Patient, Appointment, and Prescription auto-generate sequential numbers (`PAT-2025-XXXX`, `APT-...`, `RX-...`).
- Database auto-syncs on server start: `sequelize.sync({ alter: true })` — no manual migrations yet.
- Routes are wired in `src/app.js`: `/api/auth`, `/api/doctors`, `/api/patients`, `/api/appointments`, `/api/prescriptions`, `/api/dashboard`, plus `GET /api/health`.
- Middleware: JWT auth (`authenticate`), RBAC (`authorize('admin', 'doctor', ...)`), Joi validation (`validate(schema)`), global error handler, and rate limiting (100 req/15min per IP).
- Controllers and services are fully implemented: auth (register/login/me), CRUD for doctors/patients, appointments with conflict detection, prescriptions with line items, dashboard stats.
- `migrations/`, `seeders/`, `tests/`, and `cypress/` directories are empty (`gitkeep` only).
- Docker: `docker-compose up` in `medicare-backend/` starts backend + MySQL 8.0.
- Swagger docs planned via `swagger-ui-express` + `yamljs`.
- Frontend uses Axios (stub at `src/api/axios.ts`), React Router, React Hook Form, Recharts — all implementation files are stubs.
