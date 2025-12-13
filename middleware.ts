import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/livre(.*)',
  '/blog(.*)',
  '/a-propos',
  '/contact',
  '/faq',
  '/panier',
  '/commander',
  '/commande',
  '/commande/confirmation',
  '/conditions-generales',
  '/politique-confidentialite',
  '/mentions-legales',
  '/admin/sign-in(.*)',
  '/admin/sign-up(.*)',
  '/api/books(.*)',
  '/api/categories(.*)',
  '/api/orders(.*)',
  '/api/legal(.*)',
  '/api/contact',
  '/api/chat(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  const res = NextResponse.next()
  try {
    const url = new URL(request.url)
    const pathname = url.pathname
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      // Avoid clients caching HTML/SSR; force reload on new build
      res.headers.set('cache-control', 'no-store, max-age=0, must-revalidate')
    }
  } catch (e) {
    // ignore
  }
  return res
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
