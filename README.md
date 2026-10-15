# Rent House BD

A free house and flat rental platform for Bangladesh. Owners post rentals once an admin has verified them. Renters browse for free and register only when they want to contact an owner.

- **Frontend:** Next.js 15 · TypeScript · shadcn/ui · Tailwind · React Hook Form + Zod · Leaflet maps
- **Backend:** NestJS 11 · TypeScript · Prisma · PostgreSQL · AWS S3 · YouTube Data API · Docker

See [`docs/project-overview.md`](docs/project-overview.md) for the product spec and [`docs/architecture.md`](docs/architecture.md) for the folder structure and API.

## Repository layout

```
rent-house-bd/
├── backend/     NestJS API (Prisma schema, modules, Dockerfile)
├── frontend/    Next.js web app (App Router, shadcn/ui components)
├── docs/        Project overview & architecture
└── docker-compose.yml
```

## Getting started

Prerequisites: Node.js 20+ and Docker (or a local PostgreSQL).

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Backend
cd backend
cp .env.example .env            # fill in JWT_SECRET, AWS + YouTube credentials
npm install
npx prisma migrate dev          # create tables
npm run prisma:seed             # create the admin account (ADMIN_EMAIL / ADMIN_PASSWORD)
npm run start:dev               # http://localhost:4000/api/v1  (Swagger: /api/docs)

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                     # http://localhost:3000
```

The backend can also run fully in Docker: `docker compose up --build`. It uses `backend/.env` and applies migrations on start.

### External services

| Service | Used for | Env vars |
| ------- | -------- | -------- |
| AWS S3  | Listing photos (public) and ownership documents (private, signed URLs) | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_S3_PUBLIC_URL` |
| YouTube Data API v3 | Owner videos are uploaded to the platform channel as *unlisted* and embedded | `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`, `YOUTUBE_REFRESH_TOKEN` |

If S3 or YouTube is not configured the API still runs, but upload endpoints return `503`. The listing bucket prefix `listings/` must be publicly readable, or served through a CDN. `documents/` must stay private.

To get a YouTube refresh token, create an OAuth client (type "Desktop" or "Web") in Google Cloud and enable YouTube Data API v3. Then authorise the channel with the `https://www.googleapis.com/auth/youtube.upload` scope, for example through the OAuth 2.0 Playground, and copy the refresh token.

## User flows

1. **Renter:** browse `/listings` with filters or the map → open a listing → register or log in → see the phone numbers, WhatsApp and email → save favourites.
2. **Owner:** register as an owner → submit verification with NID and ownership documents → wait for admin approval → post a listing → add photos and videos.
3. **Admin:** log in with the seeded account → `/admin/owner-requests` → open the documents → approve or reject with a note → moderate listings.

## Scripts

| Location | Command | Purpose |
| -------- | ------- | ------- |
| backend  | `npm run start:dev` | API with watch mode |
| backend  | `npm run build` / `start:prod` | Production build / run |
| backend  | `npm run prisma:migrate` / `prisma:deploy` | Dev / prod migrations |
| frontend | `npm run dev` / `build` / `start` | Next.js |
| frontend | `npm run typecheck` | TypeScript check |

## Roadmap / open items

- Choose a hosting provider.
- Premium membership for **sale** listings (land / flats). The schema is ready (`ListingPurpose.SALE`) but the API blocks it for now.
- Refine the screen designs and the admin review workflow.
