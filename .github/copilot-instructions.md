# Royal Editions Website - AI Coding Agent Instructions

## Project Overview
E-commerce platform for Royal Editions (publishing company) built with Next.js 16 App Router. Features cash-on-delivery checkout, admin dashboard with Clerk authentication, blog system, and live chat. Production-ready with PM2 deployment scripts.

## Architecture & Tech Stack

### Core Stack
- **Framework**: Next.js 16.0.3 (App Router, React 19.2.0)
- **Database**: MySQL via Prisma ORM (5 models: Book, Category, Order, BlogPost, ChatConversation)
- **Auth**: Clerk (admin-only, French locale via `frFR`)
- **Storage**: AWS S3 + optional CloudFront (see `lib/aws-s3.ts`)
- **State**: Zustand with persist middleware (`lib/store/cart.ts`)
- **Styling**: Tailwind CSS v4 + Shadcn UI + `tw-animate-css`
- **Rich Text**: TipTap with Image/Link extensions (`components/admin/rich-text-editor.tsx`)

### Key Architectural Patterns
1. **Server-First by Default**: All components are Server Components unless explicitly using `"use client"` for hooks/interactivity
2. **Protected Admin Routes**: Clerk middleware (`middleware.ts`) protects `/admin/*` and `/api/upload/*` - all other routes public
3. **Image Handling**: Books store images as JSON string arrays in DB (`Book.images`), parsed with `lib/utils/parse-images.ts` to handle various formats
4. **Order Flow**: No online payment - customers provide phone/address, admins manage via dashboard

## Database Schema (Prisma)
```prisma
Book → Category (many-to-one)
Order → OrderItem[] → Book (cascade delete)
BlogPost (standalone with slug routing)
ChatConversation → ChatMessage[] (cascade delete, visitor-based)
```
- **Important**: `Book.images` is stored as JSON text - always parse with `parseBookImages()` from `lib/utils/parse-images.ts`
- Slugs auto-generated from titles with French character normalization (see `app/api/books/route.ts` POST handler)

## Development Workflow

### Essential Commands
```bash
npm run dev              # Dev server (port 3000)
npm run build            # Production build
npx prisma db push       # Sync schema to database (no migrations)
npm run db:seed          # Populate with sample data
npx prisma studio        # Visual database browser
```

### Database Setup
1. Create `.env` with `DATABASE_URL="mysql://user:pass@host:port/dbname"`
2. Add Clerk keys: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
3. Optional AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_REGION`, `AWS_CLOUDFRONT_DOMAIN`
4. Run `npx prisma db push` (no migrations - direct schema sync)

### Deployment
- **VPS**: PM2 config at `ecosystem.config.js` - see `DEPLOYMENT-EXISTING-VPS.md` or `QUICK-START-VPS.md`
- **Vercel**: Add `SKIP_ENV_VALIDATION=true` for build, configure MySQL via PlanetScale/Railway
- Images require S3 configuration in production (local files won't persist on Vercel)

## Styling System

### Tailwind v4 Specifics (Breaking from v3)
- **Import syntax**: `@import "tailwindcss"` in `globals.css` (NOT `@tailwind base/components/utilities`)
- **Theme definition**: Uses `@theme inline { }` block for custom variables
- **Brand colors**: `--color-gold: #ffd700` and `--color-royal-blue: #001f6d` (defined in `globals.css`)

### Typography
- **Headings**: Playfair Display (loaded from Google Fonts via `@import` in CSS)
- **Body**: Inter (same)
- **Monospace**: Geist Mono (via `next/font` in layout)

### Component Classes
- Use `container-custom` utility for max-width containers (defined in `globals.css`)
- Brand colors via Tailwind utilities: `text-gold`, `bg-royal-blue`
- Shadcn UI components in `components/ui/` follow standard patterns

## Critical Developer Gotchas

### 1. Book Images Must Be Parsed
```typescript
// WRONG - images is a JSON string
<img src={book.images[0]} />

// CORRECT - use parseBookImages utility
import { parseBookImages } from '@/lib/utils/parse-images'
const imageUrls = parseBookImages(book.images)
<img src={imageUrls[0]} />
```

### 2. Prisma Client Singleton Pattern
Always import from `lib/prisma.ts`, never instantiate new `PrismaClient()`:
```typescript
import { prisma } from '@/lib/prisma'  // ✓ Correct
```

### 3. Clerk Admin Protection
- Admin pages MUST be under `/app/admin/*` (auto-protected by middleware)
- Use nested layout at `app/admin/layout.tsx` for ClerkProvider with French locale
- Check `middleware.ts` for public route patterns

### 4. Server vs Client Components
- **API Routes**: Use `NextRequest`/`NextResponse` (see `app/api/books/route.ts`)
- **Client interactions**: Cart buttons, forms, TipTap editor need `"use client"`
- **Marketing widgets**: Purchase notifications, chat widget are client components

## API Route Patterns

### Standard CRUD Example (Books)
```typescript
// app/api/books/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const books = await prisma.book.findMany({ where: {...}, include: { category: true } })
  return NextResponse.json(books)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // Auto-generate slug from title with French normalization
  const slug = body.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')...
  const book = await prisma.book.create({ data: { ...body, slug, images: JSON.stringify(body.images) } })
  return NextResponse.json(book, { status: 201 })
}
```

### Image Upload Flow
1. Client uploads to `/api/upload` (Clerk-protected)
2. Server uploads to S3 via `lib/aws-s3.ts` `uploadToS3()`
3. Returns public URL (CloudFront if configured, else S3 direct)
4. Client stores URL in form, saves to DB as JSON array

## Component Library Structure

### Layout Components (`components/layout/`)
- `header.tsx`: Main nav with cart counter (Zustand), search
- `footer.tsx`: Site links, social media

### Admin Components (`components/admin/`)
- `book-form.tsx`: Multi-image upload, category select, price fields
- `rich-text-editor.tsx`: TipTap wrapper with image/link toolbar
- `image-upload-modal.tsx`: S3 upload interface

### Marketing Components (`components/marketing/`)
- `purchase-notification.tsx`: Fake social proof popups (client component)
- `live-chat-widget.tsx`: Visitor chat interface
- `analytics-scripts.tsx`: Google Analytics/Meta Pixel injection

## Testing & Quality

### Before Committing
1. Run `npm run lint` - must pass with zero errors
2. Test both Server and Client builds: `npm run build` then `npm run start`
3. Verify Prisma schema sync: `npx prisma validate`

### Common Build Errors
- **"Module not found @/"**: Check `tsconfig.json` paths config
- **Prisma client not generated**: Run `npx prisma generate`
- **Clerk errors in admin**: Ensure `ClerkProvider` wraps admin layout with `frFR` locale
- **Image domains**: Add S3/CloudFront domains to `next.config.ts` images.domains

## Project-Specific Conventions

1. **Order Numbers**: Auto-generated as `"ORD-" + timestamp + random` (see `app/api/orders/route.ts`)
2. **Phone Format**: Côte d'Ivoire format `+225XXXXXXXXXX` (validate with `PHONE_REGEX` from `lib/constants.ts`)
3. **Slugification**: French characters normalized (NFD) then converted to ASCII (see book creation logic)
4. **Status Colors**: Use constants from `lib/constants.ts` ORDER_STATUS for consistent badge styling
5. **Cart Persistence**: Zustand persist to localStorage - clear with `clearCart()` after order creation

## Documentation Reference
- Full setup: `DOCUMENTATION.md`
- VPS deployment: `DEPLOYMENT-EXISTING-VPS.md` or `QUICK-START-VPS.md`
- AWS S3 config: `docs/AWS-S3-CONFIGURATION.md`
- Marketing features: `docs/MARKETING-FEATURES.md`
