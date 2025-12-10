# Royal Editions - Instructions pour Agents IA

Site e-commerce Next.js 16 (App Router) pour maison d'édition ivoirienne. Paiement à la livraison, dashboard admin Clerk, blog, chat. **Tout contenu utilisateur en français.**

## Architecture

```
app/
├── admin/          # Dashboard protégé (ClerkProvider + frFR)
├── api/            # Routes API (books, orders, chat, blog...)
├── boutique/       # Catalogue public
├── livre/[slug]/   # Pages produit dynamiques
components/
├── admin/          # Formulaires, tables admin (*-client.tsx = Client Components)
├── books/          # BookCard, AddToCart, ProductReviews
├── marketing/      # Chat widget, analytics, notifications
├── ui/             # Shadcn UI (ne pas modifier)
lib/
├── store/cart.ts   # Zustand avec persist (localStorage)
├── utils/parse-images.ts  # ⚠️ OBLIGATOIRE pour book.images
├── prisma.ts       # Singleton Prisma
├── constants.ts    # SITE_CONFIG, COLORS, ORDER_STATUS, PHONE_REGEX
```

## Commandes

```bash
npm run dev              # Dev server
npx prisma db push       # Sync schéma (PAS de migrations)
npm run db:seed          # Seed initial
npm run lint             # Obligatoire avant commit
npx prisma generate      # Si erreur "PrismaClient not generated"
```

## Règles Critiques

### 1. Images de livres - TOUJOURS parser
Le champ `book.images` est un JSON stringifié stocké en `@db.Text`. Ne jamais l'utiliser directement.
```typescript
// ❌ CRASH - images est une string
<Image src={book.images[0]} />

// ✅ CORRECT
import { parseBookImages } from '@/lib/utils/parse-images'
const urls = parseBookImages(book.images)
<Image src={urls[0]} />
```

### 2. Decimal → Number pour Client Components
Prisma retourne `Decimal` pour les prix. Convertir avant de passer aux composants client.
```typescript
// Dans une page serveur avant de passer au client
const books = booksRaw.map(book => ({
  ...book,
  price: Number(book.price),
  originalPrice: book.originalPrice ? Number(book.originalPrice) : null,
}))
```

### 3. Slugs français - Normalisation NFD
```typescript
const slug = title.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
```

### 4. Client vs Server Components
- **"use client"** requis pour: `useCart`, Framer Motion, TipTap, event handlers, hooks React
- Pattern admin: `*-client.tsx` pour la logique interactive, page serveur pour le data fetching
- Exemple: `components/admin/categories-client.tsx`

### 5. Routes protégées (middleware.ts)
- **Public**: tout ce qui est dans `isPublicRoute` (boutique, blog, panier, api publiques)
- **Protégé**: `/admin/*` (sauf sign-in/sign-up) → `auth.protect()` automatique

## Patterns API

```typescript
import { prisma } from '@/lib/prisma'

// POST - création avec slugification et JSON
export async function POST(request: NextRequest) {
  const body = await request.json()
  const book = await prisma.book.create({
    data: {
      ...body,
      slug: /* normalisation NFD */,
      images: JSON.stringify(body.images || []),
      price: parseFloat(body.price),
    }
  })
  return NextResponse.json(book, { status: 201 })
}

// Erreurs toujours en français
return NextResponse.json({ error: 'Erreur lors de...' }, { status: 500 })
```

## Conventions

| Élément | Format |
|---------|--------|
| Couleurs CSS | `text-gold`, `bg-royal-blue` (définis dans `globals.css` @theme) |
| Téléphone CI | `+225XXXXXXXXXX` - regex: `/^[0-9]{10}$/` |
| Numéro commande | `RE000001` (auto-incrémenté) |
| Panier | `clearCart()` après commande réussie |
| Prix affichés | `formatPrice()` → "X XXX FCFA" |

## Fichiers Clés

| Fichier | Rôle |
|---------|------|
| `middleware.ts` | Protection routes Clerk, liste `isPublicRoute` |
| `lib/utils/parse-images.ts` | Parser images multi-formats (JSON, double-stringify) |
| `lib/store/cart.ts` | Store Zustand + persist |
| `app/api/orders/route.ts` | Création commande + email + décrémentation stock |
| `globals.css` | Theme Tailwind v4 (`@theme inline`, `@import "tailwindcss"`) |
| `next.config.ts` | `remotePatterns` S3: `royale-edition-content.s3.eu-north-1.amazonaws.com` |

## Pièges Courants

- **Images S3 cassées**: Vérifier `next.config.ts` remotePatterns
- **Tailwind v4**: `@import "tailwindcss"` (PAS `@tailwind base`)
- **Clerk admin**: Toujours `<ClerkProvider localization={frFR}>`
- **Hydration mismatch**: Zustand persist avec SSR → utiliser `useEffect` pour hydrater
