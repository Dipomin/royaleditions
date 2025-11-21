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
