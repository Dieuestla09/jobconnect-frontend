# JobConnect Frontend

This repository contains the React frontend for JobConnect, a learning project that shows students how to build a role-based job marketplace user interface with React, React Router, Axios, Bootstrap, and Vite.

The backend lives in a separate repository named `jobconnect-backend`.

## What This Frontend Teaches

- How React components are organized into pages, layouts, and reusable UI pieces.
- How React Router creates public and protected routes.
- How Axios calls a backend API and attaches a JWT automatically.
- How React Context stores authentication state.
- How role-based navigation changes for admin, employer, and job seeker users.
- How forms send normal JSON and file uploads with `FormData`.
- How Bootstrap can be combined with custom CSS for a responsive interface.

## Folder Structure

```text
jobconnect-frontend/
  src/
    components/            # Reusable UI components
    context/               # AuthContext for login state
    layouts/               # Shared dashboard layout
    pages/                 # Route-level screens
    services/              # Axios API client
    utils/                 # Small shared helpers
    App.jsx                # Route definitions
    main.jsx               # React entry point
    styles.css             # App-specific styling
  index.html
  vite.config.js
  package.json
  .env.example
```

## How The Frontend Works

1. `main.jsx` renders the app and wraps it in `BrowserRouter` and `AuthProvider`.
2. `AuthContext.jsx` restores the saved JWT and user from `localStorage`.
3. `api.js` attaches the JWT to API requests with an Axios interceptor.
4. `App.jsx` defines public routes and protected role-specific route groups.
5. Pages load data from the backend and render forms, tables, cards, and dashboards.

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8; built and run on Node 24.19 / npm 11)
- npm
- Running JobConnect backend at `http://localhost:5000` with the new-feature migration applied (see the backend README: `npm run migrate`)

## Setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Default `.env` value:

```env
VITE_API_URL=http://localhost:5000/api
```

If your API uses another port, change this value and restart `npm run dev` (Vite reads it at start-up). The API must list the frontend's origin in its CORS settings (see the backend README).

Start the frontend:

```bash
npm run dev
```

The app runs at:

```text
http://localhost:5173
```

## Default Login Accounts

The backend seed data provides these accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@jobconnect.com` | `password123` |
| Employer | `employer1@jobconnect.com` | `password123` |
| Employer | `employer2@jobconnect.com` | `password123` |
| Job Seeker | `seeker1@jobconnect.com` | `password123` |
| Job Seeker | `seeker2@jobconnect.com` | `password123` |

## Main Screens

Public:

- Home
- Browse Jobs
- Job Details
- Login
- Register

Job seeker:

- Dashboard
- Profile and CV upload
- Apply for a job
- My Applications

Employer:

- Dashboard
- Company Profile
- Post Job
- My Jobs
- View Applicants

Admin:

- Dashboard
- Manage Users
- Manage Jobs
- Manage Applications

## New Screens (assignment extension)

| Role | Screen | Route |
| --- | --- | --- |
| Job seeker | Job Alerts (create, edit, pause, delete, ranked matches with "Why this score?") | `/job-seeker/alerts` |
| Job seeker | My Interviews (confirm a slot or decline with a reason) | `/job-seeker/interviews` |
| Job seeker | Recommended jobs on the dashboard | `/job-seeker` |
| Job seeker | "Your match" score ring on job details | `/jobs/:id` |
| Employer | Applicants page: Scorecard and Interview panels per applicant, "Rank by scorecard" switch | `/employer/jobs/:id/applicants` |

New components: `ScoreRing`, `MatchExplain`, `MatchList`, `InterviewPanel`, `ScorecardPanel`.
The backend must have the new migration applied (see the backend README) or these screens show an error message.

To try them: log in as `seeker1@jobconnect.com` (alerts, interview invitation) and `employer1@jobconnect.com` (job 1 applicants with scorecards), password `password123`, after running `npm run migrate` and `npm run seed:features` in the backend.

## Student Exercises

- Add client-side form validation messages for every required field.
- Add pagination and sorting to job browsing.
- Add a profile photo upload.
- Add toast notifications instead of inline alert messages.
- Add tests for protected route redirects.

## Useful Checks

```bash
npm run build
npm audit --omit=dev
```
