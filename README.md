# Shrinath Water Distributors — Management System

A full-stack MERN application for managing water delivery operations — trips, drivers, customers, and payments.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT
- **Frontend**: React 18, Vite, React Router v6, React Hot Toast

## Setup

### 1. Backend
```bash
cd backend
cp .env.example .env
# Edit .env — generate JWT_SECRET with: openssl rand -hex 32
npm install
npm run seed    # seed demo data
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Login Credentials (after seeding)
| Role   | Phone       | Password  |
|--------|-------------|-----------|
| Owner  | 9999999999  | owner123  |
| Driver | 9876543210  | driver123 |
| Driver | 9876543211  | driver456 |

## Features
- **Owner Portal**: Dashboard KPIs, trip management, payment collection, driver & customer management, reports
- **Driver Portal**: Today's trips, earnings chart, trip history

## Production Notes
- MongoDB transactions are used for payments — requires a replica set or MongoDB Atlas
- Set `NODE_ENV=production` in your deployment environment
- JWT_SECRET must be at least 32 characters
- Demo credentials panel is hidden in production builds automatically
