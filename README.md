# Gatherly — Full-Stack Event Discovery & Ticketing Platform

Gatherly is a full-stack event platform built to help people discover events, reserve a seat, receive a digital ticket, and manage their bookings in one place. It also includes a role-based admin console for publishing events and tracking platform activity.

> Built and maintained by **Ananya**.

## Live demo

Deployment link: add the Render URL here after your first deployment.

## Highlights

- Secure registration, sign-in, JWT sessions, profile updates, and password changes
- Responsive event discovery with search and category filtering
- Capacity-aware reservation flow that prevents duplicate bookings
- Unique digital ticket numbers, ticket wallet, and booking cancellation
- Protected administrator console for publishing events and viewing platform metrics
- Contact/feedback workflow persisted with the application data
- Demo event seeding for an immediately polished first run
- One-command local backend and production-ready single-service deployment setup

## Tech stack

| Layer | Technology |
| --- | --- |
| Client | React, React Router, CSS, Lucide icons |
| Server | Node.js, Express, JWT, bcrypt |
| Persistence | JSON-backed local persistent store for reliable offline development |
| Deployment | Render Blueprint (`render.yaml`) |

## Architecture

```text
React SPA ── REST / JWT ── Express API ── persistent application data
   browser                    backend          users · events · tickets · feedback
```

## Run locally

Prerequisite: Node.js 18+.

Open two terminals in the repository root.

**Terminal 1 — API**

```bash
cd backend
npm install
npm run create-admin
npm run dev
```

**Terminal 2 — client**

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Local admin login

```text
Email: ananya@example.com
Password: EventoraAdmin!2026
```

Change these values in `backend/.env` before sharing the project publicly. Local data is stored in `backend/data/gatherly.json`; it is deliberately excluded from Git.

## Deploy on Render

1. Push this repository to your own GitHub account.
2. Visit [Render](https://render.com), sign in with GitHub, and choose **New → Blueprint**.
3. Select your Gatherly repository. Render detects `render.yaml`.
4. Set a strong value for `ADMIN_PASSWORD` before creating the service.
5. Click **Apply**. The deployed URL is shown after the build completes.

The application is designed as a single Render web service: Express serves the production React build and API from the same domain.

> Note: Render's free web service has ephemeral disk storage. For a portfolio demo, the included sample events are recreated when a fresh service starts. For permanent production records, attach a paid persistent disk or migrate `backend/data` to MongoDB/Postgres.

## Workflow to explain in interviews

1. A visitor browses and filters upcoming events without an account.
2. Registration validates input, hashes the password with bcrypt, and issues a signed JWT.
3. Authenticated attendees reserve an event. The server validates event availability, capacity, and duplicate reservations before creating a unique ticket.
4. The ticket wallet lists only the signed-in attendee's tickets. Cancelling a ticket changes ticket status and returns the event capacity.
5. Role middleware protects administrator endpoints. Admin users publish events, view the live counts of users/events/tickets, and read feedback.
6. The frontend uses protected routes and clear loading/error states, while the API centralizes the business rules.

## Resume bullets

- Built **Gatherly**, a full-stack event discovery and ticketing platform using React, Node.js, Express, JWT, and bcrypt; delivered registration, role-based admin access, capacity-aware bookings, digital tickets, and cancellation workflows.
- Designed and integrated a responsive REST-driven user experience with protected routes, searchable event discovery, profile management, and a live admin event-publishing dashboard.
- Implemented server-side booking validation and persistent ticket records to prevent duplicate reservations and maintain accurate event capacity.

## Suggested resume project entry

**Gatherly | Full-Stack Event Management Platform** — React, Node.js, Express, REST APIs, JWT, bcrypt

GitHub: `github.com/<your-username>/gatherly-event-platform` · Live: `<your-render-url>`

## Security

Do not commit `.env` files or `backend/data/`. The `.gitignore` already excludes them.
