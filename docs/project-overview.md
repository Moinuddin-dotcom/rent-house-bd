# Rent House BD — Project Overview

A free platform for renting houses and flats, aimed mainly at Bangladesh but open to anyone. Building and flat owners post their properties, and renters browse them freely. The name is deliberately literal so it matches what people search for ("house for rent", "flat for rent").

## Tech stack

| Layer         | Choice                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| Frontend      | Next.js (App Router), TypeScript, shadcn/ui, React Hook Form + Zod        |
| Backend       | NestJS + TypeScript                                                       |
| Database      | PostgreSQL + Prisma ORM                                                   |
| Image storage | AWS S3                                                                    |
| Video         | Owner uploads from phone gallery → backend pushes to YouTube → embed link |
| Containers    | Docker (backend; frontend Dockerfile also provided)                       |
| Hosting       | Not decided yet                                                           |

## Owner side
- Owners register with an **Owner** account, then fill in a verification form.
- They confirm their identity (NID / passport) and prove ownership of the building, flat or land with supporting documents (deed, land tax receipt, utility bill…).
- An admin reviews each request in the admin panel. Only **approved** owners can post listings.
- Approved owners post flats and houses with photos (S3) and videos (YouTube).
- Each listing has 1–4 contact phone numbers, a WhatsApp number and an email address.

## Renter side
- Anyone can browse every listing, with no account needed.
- An account is only required to see an owner's contact details.
- Renters contact owners by phone, WhatsApp or email.
- Renters pay no fees.

## Pricing
- **Now:** completely free for both owners and renters.
- **Future (not implemented):** a premium membership that lets owners post land or flats **for sale**. The schema already includes `ListingPurpose.SALE`, but the API rejects it for now. Rental listings will stay free.

## Frontend features implemented
- Map-based search with listings pinned by price (Leaflet + OpenStreetMap). Moving the map searches the visible area.
- Image galleries with lazy loading
- Skeleton loading states
- Pagination
- Favourites for registered users
- Real-time filtering by price, bedrooms, area, division, property type and keyword. Filters are debounced and synced to the URL so searches can be shared.

## Open items
- Choose a hosting provider.
- Refine the detailed screen designs (the first versions of owner registration, listing and browsing screens are implemented).
- Finalise the admin review workflow. Today it is approve or reject with a note, and a rejected owner can resubmit.
