# MGA Rendering Engine (MVP)

Internal AI-powered rendering web application for MGA architecture staff.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- Azure AD auth (NextAuth)
- Azure Blob Storage for secure image storage
- Mock AI image-to-image service layer

## MVP Features

- Azure AD sign-in gated pages
- Upload pipeline for:
  - Clay render (required)
  - Linework (optional)
  - Material ID map (optional)
  - Viewport screenshot (optional)
- File validation (PNG/JPG, max 20MB)
- Render job records in PostgreSQL
- Style presets stored in DB (seeded)
- Mock AI generation returning 4 placeholder outputs from a generated SVG endpoint
- Job history and job details pages
- Re-render action using original inputs

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Populate all Azure AD / Blob / DB values.

3. Run Prisma migrations and seed style presets:

```bash
npx prisma migrate dev --name init
npm run prisma:seed
```

4. Start app:

```bash
npm run dev
```

## Project Structure

- `app/` - App Router pages and API routes
- `components/` - UI components
- `lib/` - shared modules and service layer
- `lib/services/blob-storage.ts` - Azure Blob integration + SAS generation
- `lib/services/ai-render.ts` - mock AI provider abstraction
- `app/api/mock-image/[index]/route.ts` - binary-free SVG placeholder image endpoint
- `prisma/schema.prisma` - database schema
- `prisma/seed.ts` - style preset seeds

## Notes

- Blob URLs should be served through SAS signed links for private access.
- AI provider call is mocked and isolated for easy replacement.
- This is scoped to internal MGA users only.
