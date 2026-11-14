# Gatherly — Full-Stack Event Discovery & Ticketing Platform

Gatherly is a full-stack event platform built to help people discover events, reserve a seat, receive a digital ticket, and manage their bookings in one place. It also includes a role-based admin console for publishing events and tracking platform activity.

> Built and maintained by **Ananya**.

## Live demo

[Live demo — Gatherly](https://gatherly-event-platform.onrender.com)

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
| Database | MongoDB Atlas, Mongoose ODM |
| Deployment | Render Blueprint (`render.yaml`) |

## Architecture

```text
React SPA ── REST / JWT ── Express API ── MongoDB Atlas
   browser                    backend          users · events · tickets · feedback
```

## Run locally

Prerequisite: Node.js 18+.

Open two terminals in the repository root.

**Terminal 1 — API**

```bash
cd backend
npm install
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
Password: choose the value set in `ADMIN_PASSWORD`
```

Change these values in `backend/.env` before sharing the project publicly. The server creates the administrator from these settings when the MongoDB database is empty; run `npm run create-admin` only if you need to promote/recreate the configured administrator later.

Create a free MongoDB Atlas cluster, create a database user, allow the relevant network access, and put its connection string in `MONGODB_URI`. The backend starts only when it has a MongoDB connection; it seeds the admin and starter events on an empty database.

## Deploy on Render

1. Push this repository to your own GitHub account.
2. Visit [Render](https://render.com), sign in with GitHub, and choose **New → Blueprint**.
3. Select your Gatherly repository. Render detects `render.yaml`.
4. Set `MONGODB_URI` to your MongoDB Atlas connection string and set a strong value for `ADMIN_PASSWORD` before creating the service.
5. Click **Apply**. The deployed URL is shown after the build completes.

The application is designed as a single Render web service: Express serves the production React build and API from the same domain.

MongoDB Atlas stores users, events, tickets, and feedback independently of the Render service, so records persist across Render restarts and redeployments.

## Workflow to explain in interviews

1. A visitor browses and filters upcoming events without an account.
2. Registration validates input, hashes the password with bcrypt, and issues a signed JWT.
3. Authenticated attendees reserve an event. The server validates event availability, capacity, and duplicate reservations before creating a unique ticket.
4. The ticket wallet lists only the signed-in attendee's tickets. Cancelling a ticket changes ticket status and returns the event capacity.
5. Role middleware protects administrator endpoints. Admin users publish events, view the live counts of users/events/tickets, and read feedback.
6. The frontend uses protected routes and clear loading/error states, while the API centralizes the business rules.

## Resume bullets

- Built **Gatherly**, a MERN event discovery and ticketing platform using React, Node.js, Express, MongoDB, Mongoose, JWT, and bcrypt; delivered registration, role-based admin access, capacity-aware bookings, digital tickets, and cancellation workflows.
- Designed and integrated a responsive REST-driven user experience with protected routes, searchable event discovery, profile management, and a live admin event-publishing dashboard.
- Modelled users, events, tickets, and feedback in MongoDB with Mongoose; implemented atomic booking validation to prevent duplicate reservations and maintain accurate event capacity.

## Suggested resume project entry

**Gatherly | MERN Event Management Platform** — MongoDB, Express, React, Node.js, REST APIs, JWT, bcrypt

GitHub: `github.com/<your-username>/gatherly-event-platform` · Live: `<your-render-url>`

## Security

Do not commit `.env` files or MongoDB connection strings. The `.gitignore` already excludes local environment files.
