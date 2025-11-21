# Royal Editions Website - AI Coding Agent Instructions

## Project Overview
E-commerce platform for Royal Editions (Ivorian publishing company) built with Next.js 16 App Router. Features cash-on-delivery checkout, admin dashboard with Clerk authentication, blog system, and live chat. Production-ready with PM2 deployment scripts. **All user-facing content and error messages are in French.**

## Architecture & Tech Stack

### Core Stack
- **Framework**: Next.js 16.0.3 (App Router, React 19.2.0)
- **Database**: MySQL via Prisma ORM (6 models: Book, Category, Order, BlogPost, ChatConversation, Testimonial)
- **Auth**: Clerk (admin-only, French locale via `frFR` in `app/admin/layout.tsx`)
- **Storage**: AWS S3 + optional CloudFront (see `lib/aws-s3.ts`)
- **State**: Zustand with persist middleware (`lib/store/cart.ts`)
- **Styling**: Tailwind CSS v4 + Shadcn UI + `tw-animate-css`
- **Rich Text**: TipTap with Image/Link extensions (`components/admin/rich-text-editor.tsx`)

### Key Architectural Patterns
1. **Server-First by Default**: All components are Server Components unless explicitly using `"use client"` for hooks/interactivity
2. **Protected Admin Routes**: Clerk middleware (`middleware.ts`) protects `/admin/*` and `/api/upload/*` - all other routes public (see `isPublicRoute` matcher)
3. **Image Handling**: Books store images as JSON string arrays in DB (`Book.images`), parsed with `lib/utils/parse-images.ts` to handle various formats (stringified JSON, double-stringified, arrays)
4. **Order Flow**: No online payment - customers provide phone/address, admins manage via dashboard with ORDER_STATUS enum (PENDING, PROCESSING, DELIVERED, CANCELLED)

## Database Schema (Prisma)
```prisma
Book → Category (many-to-one, categoryId required)
Order → OrderItem[] → Book (cascade delete on order)
BlogPost (standalone with slug routing, published flag)
ChatConversation → ChatMessage[] (cascade delete, visitor-based)
Testimonial (active flag for filtering)
```
- **Critical**: `Book.images` is stored as JSON text - **always** parse with `parseBookImages()` from `lib/utils/parse-images.ts`
- Slugs auto-generated from titles with French character normalization (NFD → ASCII, see `app/api/books/route.ts` POST handler)
- **No migrations**: Use `npx prisma db push` for schema changes (direct sync to DB, no migration history)

## Development Workflow

### Essential Commands
```bash
npm run dev              # Dev server (port 3000)
npm run build            # Production build
npx prisma db push       # Sync schema to database (no migrations - IMPORTANT)
npm run db:seed          # Populate with sample data (includes legal pages via seed-legal.ts)
npx prisma studio        # Visual database browser (port 5555)
npm run lint             # ESLint check (must pass before commit)
```

### Database Setup
1. Create `.env` with `DATABASE_URL="mysql://user:pass@host:port/dbname"`
2. Add Clerk keys: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
3. Optional AWS: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME`, `AWS_REGION`, `AWS_CLOUDFRONT_DOMAIN`
4. Run `npx prisma db push` (no migrations - direct schema sync)
5. Run `npm run db:seed` to populate initial data

### Deployment
- **VPS**: PM2 config at `ecosystem.config.js` runs in cluster mode (max instances, 1GB memory limit, auto-restart max 10 times, min 10s uptime)
- **Vercel**: Add `SKIP_ENV_VALIDATION=true` for build, configure MySQL via PlanetScale/Railway
- **Images**: S3 domains **must** be added to `next.config.ts` remotePatterns (see existing eu-north-1 pattern) - images won't load otherwise
- **Production caveat**: Local file uploads won't persist on Vercel - S3 configuration required

## Styling System

### Tailwind v4 Specifics (Breaking from v3)
- **Import syntax**: `@import "tailwindcss"` in `globals.css` (NOT `@tailwind base/components/utilities`)
- **Theme definition**: Uses `@theme inline { }` block for custom variables
- **Brand colors**: `--color-gold: #ffd700` and `--color-royal-blue: #001f6d` (defined in `globals.css`, also in `lib/constants.ts` as `COLORS`)
- **Custom fonts**: Playfair Display (headings), Inter (body) loaded via Google Fonts `@import` in CSS

### Component Classes
- Use `container-custom` utility for max-width containers (defined in `globals.css`)
- Brand colors via Tailwind utilities: `text-gold`, `bg-royal-blue`, `text-royal-blue`
- Shadcn UI components in `components/ui/` follow standard patterns with Radix UI primitives

## Critical Developer Gotchas

### 1. Book Images Must Be Parsed
```typescript
// ❌ WRONG - images is a JSON string
<img src={book.images[0]} />

// ✅ CORRECT - use parseBookImages utility
import { parseBookImages } from '@/lib/utils/parse-images'
const imageUrls = parseBookImages(book.images)
<img src={imageUrls[0]} />
```
The parser handles stringified JSON, double-stringified JSON, arrays, and direct URLs. Always use it to avoid runtime errors.

### 2. Prisma Client Singleton Pattern
Always import from `lib/prisma.ts`, **never** instantiate new `PrismaClient()`:
```typescript
import { prisma } from '@/lib/prisma'  // ✓ Correct
```
The singleton uses `globalThis` caching to prevent multiple instances in development (hot reload safe).

### 3. Clerk Admin Protection
- Admin pages **must** be under `/app/admin/*` (auto-protected by `middleware.ts`)
- Admin layout at `app/admin/layout.tsx` wraps with `ClerkProvider` using French locale (`frFR` from `@clerk/localizations`)
- Check `middleware.ts` for public route patterns (uses `createRouteMatcher`)
- Sign-in/up pages are public: `/admin/sign-in`, `/admin/sign-up`

### 4. Server vs Client Components
- **Default**: Server Components (no `"use client"` needed)
- **Client needed for**: Hooks (useState, useEffect), Zustand (`useCart`), event handlers, TipTap editor, Framer Motion animations
- **API Routes**: Use `NextRequest`/`NextResponse` (see `app/api/books/route.ts` for pattern)
- **Example**: Cart buttons, forms, marketing widgets (purchase notifications, chat widget) are client components

### 5. French Character Slugification
When creating slugs from French titles (books, blog posts), use NFD normalization:
```typescript
const slug = title
  .toLowerCase()
  .normalize('NFD')                         // Decompose accented chars
  .replace(/[\u0300-\u036f]/g, '')          // Remove diacritics
  .replace(/[^a-z0-9]+/g, '-')              // Replace non-alphanumeric with hyphens
  .replace(/(^-|-$)/g, '');                 // Remove leading/trailing hyphens
```
See `app/api/books/route.ts` POST handler for reference.

## API Route Patterns

### Standard CRUD Example (Books)
```typescript
// app/api/books/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const books = await prisma.book.findMany({ 
    where: {...}, 
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(books)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const slug = body.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')... // French slugification
  const book = await prisma.book.create({ 
    data: { 
      ...body, 
      slug, 
      images: JSON.stringify(body.images || []),  // Store as JSON string
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null
    },
    include: { category: true }
  })
  return NextResponse.json(book, { status: 201 })
}
```

### Error Handling Pattern
All API routes follow consistent error handling with French messages:
```typescript
try {
  // Logic here
  return NextResponse.json(data)
} catch (error) {
  console.error('Context-specific error message:', error)
  return NextResponse.json(
    { error: 'Message d\'erreur en français pour l\'utilisateur' },
    { status: 500 }
  )
}
```
Always log errors with context and return user-friendly French messages.

### Image Upload Flow
1. Client component uploads to `/api/upload` (Clerk-protected)
2. Server uploads to S3 via `lib/aws-s3.ts` `uploadToS3()` with `ACL: 'public-read'`
3. Returns public URL (CloudFront if `AWS_CLOUDFRONT_DOMAIN` set, else S3 direct)
4. Client stores URL in form state, saves to DB as JSON array (stringified)

## Component Library Structure

### Layout Components (`components/layout/`)
- `header.tsx`: Main nav with cart counter (from Zustand `useCart`), search, category links
- `footer.tsx`: Site links, social media, legal pages

### Admin Components (`components/admin/`)
- `book-form.tsx`: Multi-image upload (S3), category select, price/originalPrice fields, TipTap description
- `rich-text-editor.tsx`: TipTap wrapper with Image/Link extensions, toolbar
- `image-upload-modal.tsx`: S3 upload interface with preview

### Marketing Components (`components/marketing/`)
- `purchase-notification.tsx`: Fake social proof popups (client component with setTimeout)
- `live-chat-widget.tsx`: Visitor chat interface (client component)
- `analytics-scripts.tsx`: Google Analytics/Meta Pixel injection (client component)

## Project-Specific Conventions

1. **Order Numbers**: Auto-generated as `"ORD-" + Date.now() + random` (see `app/api/orders/route.ts`)
2. **Phone Format**: Côte d'Ivoire format `+225XXXXXXXXXX` (validate with `PHONE_REGEX` from `lib/constants.ts`)
3. **Status Badges**: Use `ORDER_STATUS` constants from `lib/constants.ts` for consistent badge styling (bg-yellow-100, bg-blue-100, bg-green-100, bg-red-100)
4. **Cart Persistence**: Zustand persist to localStorage - **must** clear with `clearCart()` after successful order creation
5. **Decimal Handling**: Prisma stores prices as `Decimal(10, 2)` - parse with `parseFloat()` before saving
6. **Site Config**: Use `SITE_CONFIG` from `lib/constants.ts` for site name, description, social links

## Testing & Quality

### Before Committing
1. Run `npm run lint` - must pass with zero errors
2. Test production build: `npm run build` then `npm run start`
3. Verify Prisma schema: `npx prisma validate`
4. Check TypeScript: `tsc --noEmit` (if tsconfig strict mode)

### Common Build Errors
- **"Module not found @/"**: Check `tsconfig.json` paths config (`"@/*": ["./"]`)
- **Prisma client not generated**: Run `npx prisma generate`
- **Clerk errors in admin**: Ensure `ClerkProvider` wraps admin layout with `frFR` locale
- **Image domains**: Add S3/CloudFront domains to `next.config.ts` `remotePatterns` array (protocol: https, hostname: bucket.s3.region.amazonaws.com)
- **Tailwind not working**: Ensure `@import "tailwindcss"` in `globals.css` (NOT `@tailwind` directives)

## Documentation Reference
- Full setup: `DOCUMENTATION.md`
- VPS deployment: `DEPLOYMENT-EXISTING-VPS.md` or `QUICK-START-VPS.md`
- AWS S3 config: `docs/AWS-S3-CONFIGURATION.md`
- Marketing features: `docs/MARKETING-FEATURES.md`
- Deployment scripts: `DEPLOYMENT-SCRIPTS.md` (PM2, VPS setup)

## Key Files to Reference
- `middleware.ts` - Auth protection patterns
- `lib/prisma.ts` - Singleton pattern
- `lib/utils/parse-images.ts` - Image parsing logic
- `lib/constants.ts` - Site config, colors, order statuses
- `app/api/books/route.ts` - CRUD and slugification example
- `app/globals.css` - Tailwind v4 theme and custom variables
- `ecosystem.config.js` - PM2 production deployment config
