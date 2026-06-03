# 🏥 MediCare Pro — Healthcare Management System

> A modern, full-stack web application for digitizing and streamlining healthcare facility operations.  
> Built for the **Advanced Software Engineering Project** — YAOUNDE INTERNATIONAL BUSINESS SCHOOL (YIBS)  
> Academic Year 2025–2026 | Course Coordinator: **Prof. Yongho Louis**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Role-Based Access](#role-based-access)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

MediCare Pro is a comprehensive, web-based Healthcare Management System designed to digitize and centralize operations in small-to-medium healthcare facilities. It addresses the critical inefficiencies of paper-based record-keeping common in healthcare facilities across Sub-Saharan Africa by providing:

- **Centralized patient records** with complete medical history
- **Automated appointment scheduling** with real-time conflict detection
- **Digital prescription management** with dispensing workflows
- **Role-based staff access** ensuring data security and privacy
- **Admin analytics dashboard** with key performance metrics
- **Fully responsive design** accessible on desktop and mobile

---

## ✨ Features

### 👤 Patient Management
- Register and manage patient profiles with auto-generated patient numbers (PAT-YYYY-XXXX)
- Complete medical history tracking (chronic conditions, allergies, surgeries, medications)
- Search and filter patients by name, phone, or patient number
- Emergency contact information management

### 📅 Appointment Scheduling
- Book appointments with real-time doctor conflict detection
- Multiple appointment types: Consultation, Follow-up, Emergency, Routine Checkup
- Appointment status tracking: Scheduled → Confirmed → Completed / Cancelled
- Today's appointments view for quick daily overview

### 💊 Prescription Management
- Doctors issue digital prescriptions linked to appointments
- Multiple medication items per prescription with dosage and instructions
- Dispensing workflow for nurses
- Prescription status tracking: Issued → Dispensed / Expired / Cancelled

### 👨‍⚕️ Doctor Management
- Doctor profiles with specialization and availability schedules
- License number tracking
- Availability checking before booking appointments

### 📊 Admin Dashboard
- Real-time statistics: total patients, doctors, appointments, prescriptions
- Today's appointments overview
- Recently registered patients
- Role-specific views and controls

### 🔐 Security
- JWT-based authentication with httpOnly cookies
- Role-Based Access Control (RBAC) — Admin, Doctor, Nurse, Receptionist
- bcrypt password hashing (12 salt rounds)
- Helmet.js security headers
- CORS protection
- Rate limiting on authentication endpoints
- Input validation with Joi

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React.js + TypeScript | 18 + 5.x |
| **Build Tool** | Vite | 5.x |
| **Styling** | Tailwind CSS | 3.x |
| **Icons** | Lucide React | Latest |
| **HTTP Client** | Axios | 1.x |
| **Forms** | React Hook Form | 7.x |
| **Routing** | React Router DOM | 6.x |
| **Charts** | Recharts | Latest |
| **Backend** | Node.js + Express.js | 20 LTS + 4.x |
| **Database** | MySQL 8.0 | 8.0 |
| **ORM** | Sequelize | 6.x |
| **Authentication** | JWT + bcryptjs | 9.x + 5.x |
| **Validation** | Joi | 17.x |
| **Email** | Nodemailer | 6.x |
| **API Docs** | Swagger UI | 5.x |
| **Testing** | Jest + Supertest + Cypress | Latest |
| **Containerization** | Docker + Docker Compose | Latest |
| **Deployment** | Render + Vercel + Railway | Free tier |

> ✅ **8 distinct frameworks** used — exceeds the minimum requirement of 4.

---

## 📁 Project Structure

```
medicare-pro/
├── medicare-backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js           # Sequelize MySQL connection
│   │   │   └── email.js              # Nodemailer SMTP configuration
│   │   ├── controllers/              # Business logic handlers
│   │   │   ├── authController.js
│   │   │   ├── patientController.js
│   │   │   ├── doctorController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── prescriptionController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── rbac.js               # Role-based access control
│   │   │   ├── validate.js           # Joi request validation
│   │   │   └── error.js              # Global error handler
│   │   ├── models/                   # Sequelize ORM models
│   │   │   ├── index.js              # Models + associations
│   │   │   ├── User.js
│   │   │   ├── Doctor.js
│   │   │   ├── Patient.js
│   │   │   ├── MedicalHistory.js
│   │   │   ├── Appointment.js
│   │   │   ├── Prescription.js
│   │   │   └── PrescriptionItem.js
│   │   ├── routes/                   # Express route definitions
│   │   ├── services/                 # Email + conflict detection
│   │   └── utils/                    # ID generators + API response helpers
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── .env.example                  # Environment variables template
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── server.js                     # Application entry point
│
└── medicare-frontend/                # React.js + TypeScript SPA
    ├── src/
    │   ├── api/                      # Axios API call functions
    │   ├── components/
    │   │   ├── ui/                   # Button, Input, Modal, Badge, Table, Card
    │   │   └── layout/               # Sidebar, Header, PageWrapper
    │   ├── context/
    │   │   └── AuthContext.tsx       # JWT + user role state management
    │   ├── hooks/                    # useAuth, usePagination
    │   ├── pages/                    # All application pages
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Patients/
    │   │   ├── Appointments/
    │   │   ├── Prescriptions/
    │   │   └── Doctors/
    │   ├── types/                    # TypeScript interfaces
    │   └── utils/                    # Date/time/status formatters
    ├── cypress/                      # End-to-end tests
    ├── Dockerfile
    └── vite.config.ts
```

---

## ✅ Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) |
| npm | 10+ | Included with Node.js |
| MySQL | 8.0 | [XAMPP](https://www.apachefriends.org) (recommended for local dev) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/medicare-pro.git
cd medicare-pro
```

### 2. Set up the database

- Start XAMPP and ensure **MySQL** is running on port **3306**
- Open **phpMyAdmin** at `http://localhost/phpmyadmin`
- Create a new database named `medicare_pro` with collation `utf8mb4_unicode_ci`

### 3. Set up the Backend

```bash
cd medicare-backend
npm install
cp .env.example .env
```

Edit the `.env` file with your configuration (see [Environment Variables](#environment-variables) below).

Start the backend server:

```bash
node server.js
```

You should see:
```
Database connected successfully
All models were synchronized successfully
MediCare Pro server running on port 5000
```

### 4. Set up the Frontend

Open a new terminal:

```bash
cd medicare-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Login with the default admin account

After registering your first admin via the API:

```bash
# Register admin (PowerShell)
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"full_name":"Admin User","email":"admin@medicare.com","password":"Admin1234!","role":"admin"}'
```

Then log in at `http://localhost:3000/login` with:
- **Email:** `admin@medicare.com`
- **Password:** `Admin1234!`

---

## 🔧 Environment Variables

Create a `.env` file in `medicare-backend/` using `.env.example` as a template:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (XAMPP local development)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medicare_pro
DB_USER=root
DB_PASS=

# JWT Authentication
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Email (Nodemailer — use Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 📖 API Documentation

Interactive API documentation is available via **Swagger UI** when the backend is running:

```
http://localhost:5000/api/docs
```

### API Endpoints Summary

| Group | Endpoints | Auth Required |
|---|---|---|
| **Auth** | POST /register, POST /login, POST /logout, GET /me | Partial |
| **Patients** | GET, POST, GET /:id, PUT /:id, DELETE /:id, GET /:id/history, PUT /:id/history | Yes |
| **Doctors** | GET, POST, GET /:id, PUT /:id, GET /:id/availability | Yes |
| **Appointments** | GET, POST, GET /:id, PUT /:id, DELETE /:id, GET /check-conflict | Yes |
| **Prescriptions** | GET, POST, GET /:id, PUT /:id/dispense | Yes |
| **Dashboard** | GET /stats, GET /appointments-today, GET /recent-patients | Admin only |

**Total: 27 REST API endpoints**

All responses follow the standard format:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

---

## 🗄️ Database Schema

MediCare Pro uses **7 relational MySQL tables** designed in Third Normal Form (3NF):

```
users ──────────── doctors
  │                   │
  │              appointments ──── patients ──── medical_history
  │                   │               │
  └───────────── prescriptions ───────┘
                      │
               prescription_items
```

| Table | Description |
|---|---|
| `users` | Staff accounts (Admin, Doctor, Nurse, Receptionist) |
| `doctors` | Doctor profiles linked to user accounts |
| `patients` | Patient demographic and contact information |
| `medical_history` | Clinical records per patient (1:1) |
| `appointments` | Scheduled visits with conflict detection |
| `prescriptions` | Digital prescriptions issued by doctors |
| `prescription_items` | Individual medications per prescription |

> All primary keys are **UUID** (VARCHAR 36) — industry standard for healthcare data security.

---

## 🔐 Role-Based Access

| Feature | Admin | Doctor | Nurse | Receptionist |
|---|---|---|---|---|
| Dashboard & Analytics | ✅ | ❌ | ❌ | ❌ |
| Register Patients | ✅ | ❌ | ❌ | ✅ |
| View Patients | ✅ | ✅ | ✅ | ✅ |
| Medical History | ✅ | ✅ | Read only | ❌ |
| Manage Appointments | ✅ | Own only | ✅ | ✅ |
| Issue Prescriptions | ❌ | ✅ | ❌ | ❌ |
| Dispense Prescriptions | ✅ | ❌ | ✅ | ❌ |
| Manage Staff | ✅ | ❌ | ❌ | ❌ |
| Manage Doctors | ✅ | Own profile | ❌ | ❌ |

---

## ☁️ Deployment

### Production URLs
- **Frontend:** Deployed on [Vercel](https://vercel.com)
- **Backend API:** Deployed on [Render](https://render.com)
- **Database:** Hosted on [Railway](https://railway.app) (MySQL 8.0)

### Deploy with Docker (local)

```bash
# From the root directory
cd medicare-backend
docker-compose up --build
```

### Deploy to Production

**Backend (Render):**
1. Connect your GitHub repo to Render
2. Set environment variables in Render dashboard
3. Build command: `npm install`
4. Start command: `node server.js`

**Frontend (Vercel):**
1. Connect your GitHub repo to Vercel
2. Set `VITE_API_URL` to your Render backend URL
3. Vercel auto-deploys on every push to `main`

**Database (Railway):**
1. Create a MySQL instance on Railway
2. Copy the connection string to your Render environment variables

---

## 🧪 Testing

### Run Unit & Integration Tests

```bash
cd medicare-backend
npm test
```

### Run End-to-End Tests

```bash
cd medicare-frontend
npx cypress open
```

### Test Coverage

```bash
cd medicare-backend
npm run test:coverage
```

> Target: minimum **60% code coverage** as required by course specifications.

---

## 📅 Project Timeline

| Phase | Days | Status |
|---|---|---|
| Phase 1: Planning & Design | Days 1–5 | ✅ Complete |
| Phase 2: Setup & Foundation | Days 6–10 | ✅ Complete |
| Phase 3: Core Development | Days 11–20 | 🔄 In Progress |
| Phase 4: Testing & Refinement | Days 21–25 | ⏳ Pending |
| Phase 5: Deployment & Presentation | Days 26–30 | ⏳ Pending |

---

## 👨‍💻 Author

**[YOUR FULL NAME]**  
Matriculation Number: [YOUR MATRIC NUMBER]  
Master of Science in Software Engineering  
YAOUNDE INTERNATIONAL BUSINESS SCHOOL (YIBS)  
Academic Year 2025–2026

---

## 🙏 Acknowledgements

- **Prof. Yongho Louis** — Course Coordinator, Advanced Software Engineering Project
- YIBS Department of Software Engineering
- The open-source community for the tools and libraries used in this project

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for YIBS Advanced Software Engineering Project 2025–2026</p>
</div>
