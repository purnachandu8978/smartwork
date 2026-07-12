# SmartWork Hub 🚀

SmartWork Hub is a production-ready, enterprise-grade Workspace & Human Resource Management Platform designed for modern engineering, design, and operations teams. Replicated from commercial SaaS patterns (Microsoft Teams, Jira, Monday.com, and Notion), this platform implements robust role-based access control (RBAC), real-time collaborative chat, task management boards, audit logging, and data-rich analytics.

## 🛠️ Technology Stack
- **Frontend**: React 18, React Router v6, Redux Toolkit, Tailwind CSS, Recharts, Framer Motion, Axios
- **Backend**: Node.js, Express.js, Socket.io, Mongoose, Passport.js, Winston, Swagger UI
- **Database**: MongoDB Atlas / Local MongoDB
- **Security**: JWT Rotation, Secure Cookies, Granular RBAC, Audit Trails

---

## 🏗️ Folder Architecture

```
smartwork-hub/
├── backend/                  # Express.js Server
│   ├── src/
│   │   ├── config/           # Database, Passport, & JWT configurations
│   │   ├── controllers/      # Route controllers
│   │   ├── middlewares/      # Security, Validation, & Authentication
│   │   ├── models/           # 12 Mongoose database schemas
│   │   ├── routes/           # Versioned API routes (v1)
│   │   ├── services/         # Business logic services
│   │   ├── sockets/          # Socket.io live updates & rooms
│   │   └── utils/            # Winston logger, ApiError helpers
│   ├── scripts/              # Database seeder scripts
│   ├── .env.example          # Server environment template
│   └── package.json
└── frontend/                 # Vite + React Client
    ├── src/
    │   ├── components/       # Layouts, sidebar, loading state
    │   ├── features/         # Redux state slices
    │   ├── hooks/            # useSocket real-time integration hook
    │   ├── lib/              # Axios instance configuration
    │   ├── pages/            # Modules (Dashboard, Tasks, Chat, Employees)
    │   ├── routes/           # Protected routes and guards
    │   └── store/            # Redux central store configuration
    ├── tailwind.config.js    # Custom Tailwind styling theme
    ├── vite.config.js        # Vite build and proxy settings
    └── package.json
```

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org) (v18+)
- [MongoDB](https://www.mongodb.com) (Local Community Edition or MongoDB Atlas cluster connection string)

### 2. Environment Variables Configuration
Create a `.env` file in the `backend/` directory and populate it:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartwork-hub
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies & Seed Database
In your terminal, run:

```bash
# Install backend dependencies
cd backend
npm install --legacy-peer-deps --ignore-scripts

# Populate database with reference data (projects, tasks, employees, chat history)
npm run seed

# Run the backend dev server
npm run dev
```

Next, open a new terminal tab/window:

```bash
# Install frontend dependencies
cd frontend
npm install

# Run the Vite React client
npm run dev
```

Visit the application at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Seeder Credentials
The database seeder registers **10 employees** and configurations. You can log in using:
- **Super Admin**: `rockstarpurna80@gmail.com` / `password123`
- **Employee**: `purnac2004@gmail.com` / `password123`
- **Manager**: `sarah@smartwork.dev` / `password123`

---

## 🛡️ Key Features Implemented

### 📊 Interactive Analytics & Dashboard
Multiple Recharts widgets display real-time **Task Distribution** across backlog, todo, in progress, review, testing, done stages, **Project Progress status** pie configurations, and **Weekly shifts/attendance log** trends.

### 🧩 Kanban Board & Tasks Management
A complete dnd-ready Kanban board presenting all task stages with priority badges (critical, high, medium, low) and estimated hours, with links to detailed task specs.

### 💬 Real-time Sockets Messaging
An integrated team chat service supporting real-time rooms (`#general`, `#engineering`, `#design`, `#random`), active member counts, typing statuses, online updates, and full database persistence.

### 🕒 Shift Attendance & Leaves
Self-service checking in and checking out with active session counters, half-day detection, leave balance requests, and manager review logs.
