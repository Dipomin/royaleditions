# Guide de Configuration Clerk et Dashboard Admin

## 🔐 Étape 1 : Configuration Clerk

### 1.1 Créer un compte Clerk
1. Allez sur [clerk.com](https://clerk.com)
2. Créez un compte gratuit
3. Créez une nouvelle application "Royal Editions"

### 1.2 Obtenir les clés API
Dans le dashboard Clerk :
1. Allez dans **API Keys**
2. Copiez :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 1.3 Configurer `.env`
Ajoutez dans votre fichier `.env` :

\`\`\`env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/dashboard
\`\`\`

### 1.4 Créer le Middleware
Créez `middleware.ts` à la racine :

\`\`\`typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/boutique(.*)',
  '/blog(.*)',
  '/a-propos',
  '/contact',
  '/faq',
  '/panier',
  '/commander',
  '/api/books(.*)',
  '/api/categories(.*)',
  '/api/orders(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
\`\`\`

### 1.5 Mettre à jour le Layout Admin
Créez `app/admin/layout.tsx` :

\`\`\`typescript
import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from '@clerk/localizations'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={frFR}>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ClerkProvider>
  )
}
\`\`\`

### 1.6 Pages d'authentification
Créez `app/admin/sign-in/[[...sign-in]]/page.tsx` :

\`\`\`typescript
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
\`\`\`

Créez `app/admin/sign-up/[[...sign-up]]/page.tsx` :

\`\`\`typescript
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  )
}
\`\`\`

## 🎛️ Étape 2 : Dashboard Admin

### 2.1 Structure de Navigation
Créez `components/admin/admin-nav.tsx` :

\`\`\`typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  BookOpen, 
  ShoppingCart, 
  FileText,
  FolderOpen 
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Livres', href: '/admin/livres', icon: BookOpen },
  { name: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Catégories', href: '/admin/categories', icon: FolderOpen },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-royal-blue text-white">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="text-xl font-heading font-bold">
              Royal Editions Admin
            </Link>
            
            <div className="flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-gold text-royal-blue' 
                        : 'hover:bg-white/10'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  )
}
\`\`\`

### 2.2 Dashboard Principal
Créez `app/admin/dashboard/page.tsx` :

\`\`\`typescript
import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { BookOpen, ShoppingCart, Package, TrendingUp } from 'lucide-react'

async function getStats() {
  const [totalBooks, totalOrders, pendingOrders, totalRevenue] = await Promise.all([
    prisma.book.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
  ])

  return {
    totalBooks,
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.totalAmount?.toNumber() || 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      title: 'Total Livres',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Commandes',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'En Attente',
      value: stats.pendingOrders,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Chiffre d\\'Affaires',
      value: \`\${stats.totalRevenue.toLocaleString('fr-FR')} FCFA\`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-royal-blue">
          Dashboard
        </h1>
        <p className="text-gray-600">Vue d\\'ensemble de votre boutique</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={\`\${card.bgColor} p-3 rounded-lg\`}>
                  <Icon className={\`h-6 w-6 \${card.color}\`} />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-royal-blue">{card.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Ajouter ici : Graphiques, Commandes récentes, etc. */}
    </div>
  )
}
\`\`\`

### 2.3 Mise à jour du Layout Admin
Modifiez `app/admin/layout.tsx` :

\`\`\`typescript
import { ClerkProvider } from '@clerk/nextjs'
import { frFR } from '@clerk/localizations'
import { AdminNav } from '@/components/admin/admin-nav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={frFR}>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="container-custom py-8">
          {children}
        </main>
      </div>
    </ClerkProvider>
  )
}
\`\`\`

## 🎨 Étape 3 : Composants Admin Réutilisables

### 3.1 Éditeur Riche (TipTap)
Créez `components/admin/rich-text-editor.tsx` :

\`\`\`typescript
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading2,
  Image as ImageIcon,
  Link as LinkIcon 
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b p-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading') ? 'bg-gray-200' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  )
}
\`\`\`

## 📋 Checklist Étape par Étape

### Configuration Initiale
- [ ] Créer compte Clerk
- [ ] Obtenir les clés API
- [ ] Ajouter les clés dans `.env`
- [ ] Créer `middleware.ts`
- [ ] Tester la protection des routes

### Pages d'Authentification
- [ ] Créer page sign-in
- [ ] Créer page sign-up
- [ ] Tester le flux de connexion

### Dashboard
- [ ] Créer AdminNav component
- [ ] Créer page dashboard
- [ ] Afficher les statistiques
- [ ] Tester l'accès admin

### Gestion des Livres
- [ ] Page liste des livres
- [ ] Page création livre
- [ ] Page édition livre
- [ ] Upload d'images
- [ ] Éditeur riche pour descriptions

### Gestion des Commandes
- [ ] Page liste des commandes
- [ ] Page détail commande
- [ ] Changement de statut
- [ ] Export CSV

### Gestion du Blog
- [ ] Page liste articles
- [ ] Page création article
- [ ] Page édition article
- [ ] Éditeur TipTap

## 🚀 Commandes pour Démarrer

\`\`\`bash
# 1. Vérifier que tout fonctionne
npm run dev

# 2. Accéder au site
# Front: http://localhost:3000
# Admin: http://localhost:3000/admin/dashboard

# 3. Gérer la base de données
npm run db:studio

# 4. Ajouter des données de test
npm run db:seed
\`\`\`

## 📞 Besoin d'aide ?

Consultez :
- [Documentation Clerk](https://clerk.com/docs)
- [Documentation TipTap](https://tiptap.dev)
- DOCUMENTATION.md pour plus de détails
- RECAPITULATIF.md pour vue d'ensemble

Bon développement ! 🎉
\`\`\`
