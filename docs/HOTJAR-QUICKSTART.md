# Guide d'implémentation Hotjar - Royal Editions

## 🚀 Intégration rapide

Hotjar est maintenant installé ! Voici comment l'utiliser sur vos pages.

## 📦 Import des fonctions

```typescript
import { hotjarTracking } from '@/components/marketing/analytics-scripts'
```

## 🎯 Exemples d'implémentation

### 1. Page produit (livre/[slug]/page.tsx)

Ajoutez dans le composant client ou dans un useEffect :

```typescript
'use client'

import { useEffect } from 'react'
import { hotjarTracking } from '@/components/marketing/analytics-scripts'

export default function BookPage({ book }) {
  // Track la vue du produit
  useEffect(() => {
    hotjarTracking.events.viewProduct()
    
    // Si c'est pendant Black Friday
    if (hasBlackFridayPromo) {
      hotjarTracking.events.blackFridayPromo()
      hotjarTracking.tagRecording(['black_friday_visitor'])
    }
  }, [book.id])
  
  return (
    // Votre page...
  )
}
```

### 2. Bouton "Ajouter au panier"

```typescript
const handleAddToCart = (book) => {
  // Logique d'ajout au panier
  addToCart(book)
  
  // Track l'événement
  hotjarTracking.events.addToCart()
  
  // Tag si c'est un best-seller
  if (book.bestseller) {
    hotjarTracking.tagRecording(['bestseller_purchase'])
  }
}
```

### 3. Page de commande (commander/page.tsx)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { hotjarTracking } from '@/components/marketing/analytics-scripts'

export default function CheckoutPage() {
  const [orderCompleted, setOrderCompleted] = useState(false)
  
  // Track le début du checkout
  useEffect(() => {
    hotjarTracking.triggerEvent('checkout_started')
  }, [])
  
  // Track l'abandon du formulaire
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!orderCompleted) {
        hotjarTracking.events.formAbandonment()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [orderCompleted])
  
  const handleOrderComplete = async () => {
    // Logique de commande
    await createOrder()
    
    // Track la conversion
    hotjarTracking.events.purchase()
    hotjarTracking.tagRecording(['converted_customer', 'black_friday_buyer'])
    
    setOrderCompleted(true)
  }
  
  return (
    // Votre formulaire...
  )
}
```

### 4. Formulaire de contact

```typescript
const handleContactSubmit = async (data) => {
  // Envoi du formulaire
  await sendContact(data)
  
  // Track l'événement
  hotjarTracking.triggerEvent('contact_form_submitted')
  hotjarTracking.tagRecording(['interested_customer'])
}
```

### 5. Chat en direct

```typescript
const handleChatOpen = () => {
  setIsChatOpen(true)
  hotjarTracking.triggerEvent('chat_opened')
  hotjarTracking.tagRecording(['needs_support'])
}
```

### 6. Application d'un code promo

```typescript
const handlePromoCodeApply = (code) => {
  // Appliquer le code
  applyPromoCode(code)
  
  // Track l'événement
  hotjarTracking.triggerEvent('promo_code_applied')
  hotjarTracking.tagRecording(['promo_user', `promo_${code}`])
}
```

## 🏷️ Tags recommandés pour Royal Editions

Utilisez ces tags pour segmenter vos analyses :

### Comportement d'achat
```typescript
hotjarTracking.tagRecording(['first_time_visitor'])
hotjarTracking.tagRecording(['returning_customer'])
hotjarTracking.tagRecording(['high_value_cart']) // Panier > 10000 FCFA
hotjarTracking.tagRecording(['abandoned_cart'])
```

### Type de produit
```typescript
hotjarTracking.tagRecording(['romance_category'])
hotjarTracking.tagRecording(['bestseller_viewed'])
hotjarTracking.tagRecording(['new_release_viewed'])
```

### Campagnes marketing
```typescript
hotjarTracking.tagRecording(['black_friday_2025'])
hotjarTracking.tagRecording(['newsletter_subscriber'])
hotjarTracking.tagRecording(['social_media_traffic'])
```

### Engagement
```typescript
hotjarTracking.tagRecording(['blog_reader'])
hotjarTracking.tagRecording(['multiple_pages_viewed']) // > 5 pages
hotjarTracking.tagRecording(['long_session']) // > 5 minutes
```

## 🔧 Configuration avancée

### Identifier un utilisateur connecté (Admin Clerk)

```typescript
import { useUser } from '@clerk/nextjs'
import { hotjarTracking } from '@/components/marketing/analytics-scripts'

export function AdminLayout() {
  const { user } = useUser()
  
  useEffect(() => {
    if (user) {
      hotjarTracking.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        role: 'admin',
        firstName: user.firstName,
      })
    }
  }, [user])
  
  return (
    // Votre layout admin...
  )
}
```

### Exclure des données sensibles

Ajoutez l'attribut `data-hj-suppress` pour empêcher Hotjar d'enregistrer :

```tsx
{/* Champ de numéro de téléphone - masqué */}
<input 
  type="tel" 
  data-hj-suppress 
  placeholder="Numéro de téléphone"
/>

{/* Section avec informations sensibles */}
<div data-hj-suppress>
  <p>Informations confidentielles ici</p>
</div>
```

## 📊 Événements automatiquement trackés

Ces événements sont déjà intégrés dans `trackEvent` :

```typescript
import { trackEvent } from '@/components/marketing/analytics-scripts'

// Ces fonctions trackent à la fois GA4, Facebook Pixel ET Hotjar
trackEvent.addToCart(bookId, title, price)
trackEvent.purchase(orderId, total, items)
trackEvent.viewProduct(bookId, title, price)
trackEvent.initiateCheckout(total, itemCount)
```

## ✅ Checklist d'implémentation

- [x] Script Hotjar chargé dans `analytics-scripts.tsx`
- [x] Variables d'environnement configurées dans `.env`
- [ ] **TODO** : Ajouter `hotjarTracking.events.viewProduct()` dans `app/livre/[slug]/page.tsx`
- [ ] **TODO** : Ajouter tracking d'abandon dans `app/commander/page.tsx`
- [ ] **TODO** : Ajouter tags Black Friday sur les pages promo
- [ ] **TODO** : Configurer le funnel de conversion dans le dashboard Hotjar
- [ ] **TODO** : Activer les heatmaps sur les pages clés
- [ ] **TODO** : Créer des segments d'utilisateurs dans Hotjar

## 🎯 Pages prioritaires à instrumenter

1. **Page d'accueil** (`app/page.tsx`)
   - Track : `homepage_visit`
   - Tags : Type de trafic (organic, social, direct)

2. **Page produit** (`app/livre/[slug]/page.tsx`)
   - Track : `viewProduct()`, `blackFridayPromo()`
   - Tags : Catégorie, bestseller, nouveau

3. **Page panier** (`app/panier/page.tsx`)
   - Track : `cart_viewed`
   - Tags : Nombre d'items, valeur panier

4. **Page commande** (`app/commander/page.tsx`)
   - Track : `checkout_started`, `formAbandonment()`, `purchase()`
   - Tags : Type de livraison, code promo utilisé

5. **Pages blog** (`app/blog/*`)
   - Track : `blog_post_viewed`
   - Tags : Catégorie d'article, engagement (scroll depth)

## 🚨 Erreurs courantes à éviter

### ❌ Erreur : Appeler Hotjar trop tôt

```typescript
// MAUVAIS - window.hj peut ne pas être chargé
hotjarTracking.triggerEvent('my_event')
```

```typescript
// BON - Vérifier que window est défini
useEffect(() => {
  if (typeof window !== 'undefined') {
    hotjarTracking.triggerEvent('my_event')
  }
}, [])
```

### ❌ Erreur : Tagger avec des données sensibles

```typescript
// MAUVAIS - Données personnelles dans les tags
hotjarTracking.tagRecording([`user_${userEmail}`])
```

```typescript
// BON - Utiliser des identifiants anonymes
hotjarTracking.tagRecording([`user_type_premium`])
```

### ❌ Erreur : Trop d'événements

```typescript
// MAUVAIS - Track chaque scroll
onScroll={() => hotjarTracking.triggerEvent('scroll')}
```

```typescript
// BON - Track les événements significatifs
onScrollToBottom={() => hotjarTracking.triggerEvent('reached_bottom')}
```

## 📞 Besoin d'aide ?

Consultez la documentation complète : `docs/HOTJAR-CONFIGURATION.md`

## 🎉 C'est tout !

Hotjar est maintenant prêt à l'emploi. Commencez à tracker les événements importants et connectez-vous au dashboard Hotjar pour voir les données !

**Lien dashboard** : https://insights.hotjar.com/sites/5223971
