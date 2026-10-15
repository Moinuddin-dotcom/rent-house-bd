# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Rent House BD is a free house/flat rental platform for Bangladesh. Two independent npm projects live side by side: `backend/` (NestJS 11 + Prisma + PostgreSQL) and `frontend/` (Next.js 15 App Router + shadcn/ui + Tailwind 3). Each has its own `package.json` and lockfile; there is no workspace tooling. Product spec: `docs/project-overview.md`. Folder map and full API table: `docs/architecture.md`.

## Commands

Root shortcuts (wrappers around `npm --prefix`): `npm run install:all`, `db:up` (Postgres via docker compose), `db:migrate`, `db:seed`, `dev:backend`, `dev:frontend`, `build`.

Backend (`cd backend`, needs `.env` copied from `.env.example`):
- `npm run start:dev`: API at `http://localhost:4000/api/v1`, Swagger at `/api/docs`. `/health` has no prefix.
- `npm run lint`: this is only `tsc --noEmit`. There is no ESLint.
- `npx prisma migrate dev --name <name>`: create a migration after editing `prisma/schema.prisma`. `npm run prisma:generate` regenerates the client.
- `npm run prisma:seed`: creates the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Frontend (`cd frontend`, needs `.env.local` with `NEXT_PUBLIC_API_URL`):
- `npm run dev`, `npm run build`, `npm run typecheck`.

Neither project has a test suite or test runner yet. Use the typecheck/lint scripts to verify changes.

`docker compose up --build` runs Postgres and the backend. The backend reads `backend/.env` and runs `prisma migrate deploy` on start. The frontend is not part of compose.

## Backend architecture

- **Auth is deny-by-default.** `app.module.ts` registers three global guards in order: `ThrottlerGuard` → `JwtAuthGuard` → `RolesGuard`. Every route needs a JWT unless it is marked `@Public()`. Restrict routes by role with `@Roles(Role.X)` and get the user with `@CurrentUser()`; all three live in `src/common/decorators/`. Roles are `RENTER | OWNER | ADMIN`.
- **The owner-verification gate is checked in services, not guards.** An OWNER can create listings only once their `OwnerProfile` verification status is `APPROVED`. `ListingsService` enforces this by calling `OwnersService.assertApprovedOwner()`. Admins approve or reject verification requests in the `admin` module. Ownership checks ("own listing") are done in `listings.service.ts`.
- **Validation:** the global `ValidationPipe` uses `whitelist` + `forbidNonWhitelisted` + `transform`, so every request field must be declared on a class-validator DTO, or the request is rejected. Paginated queries extend `common/dto/pagination.dto.ts`.
- **Prisma errors** are mapped to HTTP errors by `common/filters/prisma-exception.filter.ts`. `PrismaService` is global.
- **Config:** `src/config/configuration.ts` holds typed defaults and `env.validation.ts` validates them at startup. Read config with `ConfigService.get('aws.bucket')`-style keys.
- **External services are optional.** If the AWS/YouTube env vars are missing, `StorageService` / `YoutubeService` throw `ServiceUnavailableException` (503) at call time instead of failing at boot.
- **Media pipeline:**
  - Photos go to S3 under `listings/<id>/` and are public.
  - Ownership documents go to `documents/<userId>/`. They are private and served to admins as 5-minute presigned URLs.
  - Videos are written to a temp file and a `ListingVideo` row is created as `PROCESSING`. A background upload to YouTube (unlisted) then sets the row to `READY` with a `youtubeId`, or to `FAILED`.
  - Upload validation helpers are in `common/utils/file-validation.ts`.
- **Owner verification rules:** `REQUIRED_DOCUMENTS` in `owners.service.ts` lists the required document types for each `OwnershipType`. It is mirrored in `frontend/src/lib/constants.ts`, so keep the two in sync. A submission also needs the user's phone verified by SMS code through the `phone` module. In development without `SMS_API_URL`, the code is always `123456` (`TEST_CODE` in `phone.service.ts`). This test mode is disabled when `NODE_ENV=production`.
- **`ListingPurpose.SALE`** exists in the schema for a future premium feature. `listings.service.ts` currently rejects it on purpose.
- **Contact details are excluded** from `GET /listings/:id`. They are only returned by the authenticated `GET /listings/:id/contact`.

## Frontend architecture

- **API access:** all requests go through `src/lib/api-client.ts`.
  - Use `api<T>()` in client components. It attaches the JWT from localStorage (`rhbd_token`), sends JSON or `FormData`, and throws `ApiError` with the Nest error message.
  - Use `serverApi<T>()` in Server Components for public data. It uses ISR (`revalidate`) and returns `null` on failure.
- **Auth is client-side only.** There is no middleware. `AuthProvider` / `FavoritesProvider` live in `components/providers/` and are exposed through `hooks/use-auth.ts` and `use-favorites.ts`. Protected sections (`owner/`, `admin/`, `(renter)/`) wrap their layout or page in `<RequireAuth roles={[...]}>`, which redirects to `/login?next=…`.
- **Shared types are hand-maintained.** `src/types/index.ts` mirrors the Prisma enums and the API response shapes. Update it whenever the backend schema or DTOs change, because nothing generates it.
- **Forms** use React Hook Form with Zod schemas from `src/lib/validations/`. Keep these in sync with the backend DTO rules.
- **Maps:** Leaflet only works in the browser. It is loaded through `listing-map-lazy.tsx` (dynamic import) and must not be imported directly into server-rendered code.
- **UI:** `components/ui/` contains shadcn/ui primitives (`components.json`). Use the `@/` path alias for `src/`.

## Conventions

`.editorconfig`: 2-space indentation, LF line endings, UTF-8.
