# Architecture

```
rent-house-bd/
├── backend/                     NestJS REST API
│   ├── prisma/
│   │   ├── schema.prisma        Database schema
│   │   ├── migrations/          SQL migrations
│   │   └── seed.ts              Creates the admin account
│   ├── src/
│   │   ├── main.ts              Bootstrap (prefix /api/v1, Swagger at /api/docs, validation, CORS, helmet)
│   │   ├── app.module.ts        Root module + global guards (throttle → JWT → roles)
│   │   ├── config/              Typed configuration + env validation
│   │   ├── prisma/              PrismaService (global)
│   │   ├── common/              Decorators (@Public, @Roles, @CurrentUser), guards, filters, DTOs, utils
│   │   └── modules/
│   │       ├── auth/            Register / login / me (JWT)
│   │       ├── users/           User lookups
│   │       ├── owners/          Owner verification requests + document upload
│   │       ├── admin/           Review owner requests, moderate listings, stats
│   │       ├── listings/        Public search, details, contact reveal, owner CRUD, images, videos
│   │       ├── favorites/       Renter favourites
│   │       ├── storage/         AWS S3 service
│   │       ├── youtube/         YouTube upload service
│   │       └── health/          GET /health
│   ├── Dockerfile
│   └── .env.example
├── frontend/                    Next.js App Router
│   └── src/
│       ├── app/
│       │   ├── page.tsx                     Home (hero search + latest)
│       │   ├── (public)/listings/           Search (grid / map) and listing detail
│       │   ├── (auth)/login, register/      Auth screens
│       │   ├── (renter)/favorites/          Saved homes
│       │   ├── owner/                       Dashboard, verification, new / edit listing
│       │   └── admin/                       Overview, owner requests, listings moderation
│       ├── components/
│       │   ├── ui/              shadcn/ui primitives
│       │   ├── layout/          Header, footer, page header, auth guard
│       │   ├── listings/        Card, grid, skeletons, filters, map, gallery, contact panel…
│       │   ├── forms/           RHF + Zod forms (auth, verification, listing, media)
│       │   └── providers/       Auth + favourites context
│       ├── hooks/               useAuth, useFavorites, useApi, useDebounce
│       ├── lib/                 API client, constants, utils, validations/ (Zod schemas)
│       └── types/               Shared API types
├── docs/
└── docker-compose.yml           PostgreSQL + backend
```

## Request flow & access control

All routes require a JWT by default. Routes decorated with `@Public()` don't, and `@Roles()` restricts a route to particular roles.

| Who            | Can do                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------- |
| Anyone         | `GET /listings`, `GET /listings/:id` (contact details are excluded)                       |
| Any logged-in  | `GET /listings/:id/contact`, favourites                                                  |
| OWNER          | Submit verification; create/edit/delete **own** listings once APPROVED; upload media     |
| ADMIN          | Review owner requests (signed S3 links to documents), remove/restore listings, stats     |

## Media pipeline

- **Photos** go through `POST /listings/:id/images` (multipart), then into S3 under `listings/<id>/…`. The public URL is stored, and `AWS_S3_PUBLIC_URL` can point to a CDN.
- **Ownership documents** go into S3 under `documents/<userId>/…`. They are never public: admins view them through 5-minute presigned URLs.
- **Videos** go through `POST /listings/:id/videos`. Multer streams the file to a temp file and a `ListingVideo` row is created with status `PROCESSING`. A background task then uploads the file to YouTube as unlisted and sets the row to `READY` with a `youtubeId` (or to `FAILED` with an error). The temp file is deleted at the end. The frontend embeds READY videos with `youtube-nocookie.com`.

## API overview (`/api/v1`)

| Method | Path                                   | Auth          |
| ------ | -------------------------------------- | ------------- |
| POST   | /auth/register, /auth/login            | public        |
| GET    | /auth/me                               | user          |
| GET    | /listings                              | public        |
| GET    | /listings/:id                          | public        |
| GET    | /listings/:id/contact                  | user          |
| GET    | /listings/mine, /listings/:id/manage   | owner         |
| POST   | /listings                              | approved owner|
| PATCH  | /listings/:id, /listings/:id/status    | owner (own)   |
| DELETE | /listings/:id                          | owner (own)   |
| POST   | /listings/:id/images, /:id/videos      | owner (own)   |
| DELETE | /listings/:id/images/:imageId, /videos/:videoId | owner (own) |
| GET    | /owners/verification/me                | owner         |
| POST   | /owners/verification                   | owner         |
| GET    | /favorites, /favorites/ids             | user          |
| POST/DELETE | /favorites/:listingId             | user          |
| GET    | /admin/stats, /admin/owner-requests(/:id), /admin/listings | admin |
| PATCH  | /admin/owner-requests/:id/review, /admin/listings/:id/status | admin |

Full interactive docs: `http://localhost:4000/api/docs` (Swagger).

`GET /listings` query parameters: `q, propertyType, division, district, area, minRent, maxRent, bedrooms, bathrooms, furnished, north, south, east, west, sort (newest|rent_asc|rent_desc), page, limit`.
