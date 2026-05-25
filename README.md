# Review & Rate MERN Task

Full-stack TypeScript MERN implementation of the provided Review & Rate Figma task.

## Apps

- `client` - React + Vite frontend
- `server` - Express + MongoDB backend

## Quick Start

```bash
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

## Environment

Create `server/.env` from `server/.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/review-rate
JWT_SECRET=replace-this-with-a-long-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Features

- JWT signup/login/logout-style client auth
- Profile update with avatar URL
- Company create/list/detail/search/city/sort APIs
- Review create/list/update/delete APIs
- Average rating and review counts maintained on companies
- Review likes and share count
- Protected add company and add/edit/delete review actions
- Login/signup modal shown when protected actions are clicked while logged out
- Toast feedback for backend success and error states
