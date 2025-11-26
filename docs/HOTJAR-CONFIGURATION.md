# Configuration Hotjar - Royal Editions

## 📊 Présentation

Hotjar est un outil d'analyse comportementale qui permet de comprendre comment les visiteurs interagissent avec le site Royal Editions. Il offre :

- **Heatmaps** : Cartes de chaleur montrant où les utilisateurs cliquent, scrollent et bougent leur souris
- **Enregistrements de sessions** : Vidéos des parcours utilisateurs sur le site
- **Funnels de conversion** : Analyse des étapes de conversion et identification des points de friction
- **Formulaires** : Analyse des abandons de formulaires
- **Feedback widgets** : Collecte de retours utilisateurs directement sur le site
- **Sondages** : Questionnaires ciblés pour comprendre les besoins des visiteurs

## 🔧 Configuration

### Variables d'environnement

Dans le fichier `.env` :

```env
# Hotjar Configuration
NEXT_PUBLIC_HOTJAR_ID=5223971
NEXT_PUBLIC_HOTJAR_VERSION=6
```

### Installation

Le script Hotjar est automatiquement chargé via le composant `AnalyticsScripts` dans le layout principal de l'application.

## 📝 Utilisation

### 1. Tracking automatique

Hotjar enregistre automatiquement :
- Tous les clics et mouvements de souris
- Le scroll et la navigation
- Les interactions avec les formulaires
- Les sessions utilisateurs

### 2. Événements personnalisés

Pour tracker des événements spécifiques, utilisez les fonctions exportées :

```typescript
import { hotjarTracking } from '@/components/marketing/analytics-scripts'

// Déclencher un événement personnalisé
hotjarTracking.triggerEvent('custom_event_name')

// Utiliser les événements prédéfinis
hotjarTracking.events.addToCart()
hotjarTracking.events.purchase()
hotjarTracking.events.viewProduct()
hotjarTracking.events.blackFridayPromo()
hotjarTracking.events.formAbandonment()
```

### 3. Identifier les utilisateurs

Si vous souhaitez associer des sessions à des utilisateurs spécifiques :

```typescript
import { hotjarTracking } from '@/components/marketing/analytics-scripts'

// Identifier un utilisateur (pour les admins Clerk par exemple)
hotjarTracking.identify('user_id_123', {
  email: 'user@example.com',
  plan: 'premium',
  signup_date: '2025-01-15'
})
```

### 4. Tags pour segmentation

Ajoutez des tags aux enregistrements pour mieux segmenter vos analyses :

```typescript
import { hotjarTracking } from '@/components/marketing/analytics-scripts'

// Taguer un enregistrement
hotjarTracking.tagRecording(['high_value_customer', 'black_friday_visitor'])
```

## 🎯 Cas d'usage Royal Editions

### 1. Optimisation de la page produit

```typescript
// Dans app/livre/[slug]/page.tsx
import { hotjarTracking } from '@/components/marketing/analytics-scripts'

// Quand un utilisateur voit un livre
useEffect(() => {
  hotjarTracking.events.viewProduct()
}, [])

// Quand il voit la bannière Black Friday
useEffect(() => {
  hotjarTracking.events.blackFridayPromo()
}, [])
```

### 2. Analyse du tunnel de commande

```typescript
// Dans app/commander/page.tsx
import { hotjarTracking } from '@/components/marketing/analytics-scripts'

// Au début du formulaire
useEffect(() => {
  hotjarTracking.triggerEvent('checkout_form_started')
}, [])

// Si l'utilisateur quitte sans commander
useEffect(() => {
  const handleBeforeUnload = () => {
    if (!orderCompleted) {
      hotjarTracking.events.formAbandonment()
    }
  }
  
  window.addEventListener('beforeunload', handleBeforeUnload)
  return () => window.removeEventListener('beforeunload', handleBeforeUnload)
}, [orderCompleted])
```

### 3. Segmentation des visiteurs Black Friday

```typescript
// Si l'utilisateur a vu l'offre Black Friday
hotjarTracking.tagRecording(['black_friday_2025', 'promo_viewer'])

// Si l'utilisateur a commandé pendant Black Friday
hotjarTracking.tagRecording(['black_friday_buyer', 'converted'])
```

## 📈 Tableaux de bord recommandés

### 1. Heatmap de la page d'accueil
- Identifier les zones les plus cliquées
- Optimiser le placement des livres vedettes
- Comprendre le scroll moyen des visiteurs

### 2. Funnel de conversion
1. Page d'accueil
2. Page boutique / catégorie
3. Page produit (livre)
4. Panier
5. Formulaire de commande
6. Confirmation de commande

### 3. Enregistrements ciblés
- Filtrer par : "Utilisateurs qui ont abandonné au checkout"
- Filtrer par : "Visiteurs de la page Black Friday"
- Filtrer par : "Sessions avec erreur de formulaire"

### 4. Analyse des formulaires
- Taux d'abandon du formulaire de commande
- Champs problématiques (taux d'abandon élevé)
- Temps moyen de remplissage

## 🔒 Confidentialité et RGPD

### Données anonymisées par défaut

Hotjar anonymise automatiquement :
- Les données sensibles dans les formulaires
- Les numéros de téléphone
- Les adresses email
- Les informations de paiement

### Configuration supplémentaire

Pour supprimer des éléments spécifiques de l'enregistrement :

```html
<!-- Ne pas enregistrer ce champ -->
<input type="text" data-hj-suppress />

<!-- Ne pas enregistrer ce conteneur -->
<div data-hj-suppress>
  Contenu sensible ici
</div>
```

### Consentement utilisateur

Si vous implémentez une bannière de cookies, conditionnez le chargement de Hotjar :

```typescript
// Dans components/marketing/analytics-scripts.tsx
const [consentGiven, setConsentGiven] = useState(false)

useEffect(() => {
  const consent = localStorage.getItem('analytics_consent')
  setConsentGiven(consent === 'true')
}, [])

{consentGiven && <Script id="hotjar" ... />}
```

## 📱 Accès au tableau de bord Hotjar

1. Connectez-vous sur : https://insights.hotjar.com/
2. Sélectionnez le site "Royal Editions" (ID: 5223971)
3. Accédez aux différentes sections :
   - **Heatmaps** : Vue d'ensemble des interactions
   - **Recordings** : Enregistrements de sessions
   - **Funnels** : Analyse du tunnel de conversion
   - **Forms** : Analyse des formulaires
   - **Feedback** : Retours utilisateurs
   - **Surveys** : Résultats des sondages

## 🎓 Bonnes pratiques

### 1. Définir des objectifs clairs

Avant de plonger dans les données :
- Que voulez-vous optimiser ? (taux de conversion, temps sur site, etc.)
- Quelles pages sont critiques ?
- Quels comportements voulez-vous encourager ?

### 2. Combiner avec Google Analytics

- GA4 pour les **données quantitatives** (combien de visiteurs, taux de rebond, etc.)
- Hotjar pour les **données qualitatives** (comment les visiteurs naviguent, pourquoi ils partent, etc.)

### 3. Segmenter intelligemment

Créez des segments pertinents :
- Nouveaux visiteurs vs visiteurs récurrents
- Mobile vs Desktop
- Visiteurs qui achètent vs qui abandonnent
- Trafic organique vs trafic publicitaire

### 4. Analyser régulièrement

- Consultez les heatmaps après chaque changement majeur
- Regardez 10-15 enregistrements de sessions par semaine
- Configurez des alertes pour les événements importants

### 5. Itérer et tester

- Identifiez les problèmes avec Hotjar
- Créez des hypothèses d'amélioration
- Testez les changements (A/B testing si possible)
- Re-analysez avec Hotjar pour valider

## 🚀 Événements clés à tracker

Pour Royal Editions, voici les événements critiques :

```typescript
// Événements de navigation
hotjarTracking.triggerEvent('homepage_visit')
hotjarTracking.triggerEvent('category_viewed')
hotjarTracking.triggerEvent('search_used')

// Événements produit
hotjarTracking.events.viewProduct() // Livre consulté
hotjarTracking.events.addToCart() // Ajout au panier
hotjarTracking.triggerEvent('book_preview_clicked') // Aperçu livre

// Événements promotionnels
hotjarTracking.events.blackFridayPromo() // Bannière Black Friday vue
hotjarTracking.triggerEvent('promo_code_applied') // Code promo utilisé

// Événements de conversion
hotjarTracking.triggerEvent('checkout_started') // Début commande
hotjarTracking.triggerEvent('shipping_info_entered') // Info livraison
hotjarTracking.events.purchase() // Achat confirmé

// Événements d'engagement
hotjarTracking.triggerEvent('blog_post_read') // Article blog lu
hotjarTracking.triggerEvent('contact_form_submitted') // Contact envoyé
hotjarTracking.triggerEvent('chat_opened') // Chat ouvert
```

## 🔍 Exemples d'analyses

### Analyse 1 : Optimisation de la page Black Friday

**Question** : Pourquoi certains visiteurs ne commandent pas malgré la promo ?

**Méthode** :
1. Créer un filtre : "Visiteurs ayant vu la bannière Black Friday"
2. Regarder les heatmaps de la page produit
3. Visionner 20 enregistrements de sessions
4. Identifier les points de friction (formulaire complexe ? prix pas clair ?)

**Actions possibles** :
- Simplifier le formulaire de commande
- Rendre le prix avec réduction plus visible
- Ajouter plus de réassurance (témoignages, garanties)

### Analyse 2 : Taux d'abandon au checkout

**Question** : À quelle étape les utilisateurs abandonnent-ils le plus ?

**Méthode** :
1. Configurer un funnel dans Hotjar :
   - Étape 1 : Page panier
   - Étape 2 : Page commander
   - Étape 3 : Confirmation commande
2. Identifier l'étape avec le plus gros drop-off
3. Analyser les enregistrements de cette étape spécifique
4. Examiner l'analyse de formulaire pour les champs problématiques

**Actions possibles** :
- Supprimer les champs non essentiels
- Ajouter des indices visuels (progress bar)
- Améliorer les messages d'erreur
- Ajouter du click-to-call pour assistance

## 📞 Support et ressources

- Documentation officielle : https://help.hotjar.com/
- Académie Hotjar : https://academy.hotjar.com/
- Centre d'aide : https://help.hotjar.com/hc/en-us
- Support : support@hotjar.com

## 🎉 Résumé

Hotjar est maintenant configuré sur Royal Editions et permettra de :

✅ Comprendre le comportement des visiteurs sur le site
✅ Identifier les points de friction dans le parcours d'achat
✅ Optimiser les pages pour augmenter les conversions
✅ Mesurer l'efficacité de la campagne Black Friday
✅ Améliorer continuellement l'expérience utilisateur

**Prochaines étapes recommandées :**

1. Créer un compte et se connecter au tableau de bord Hotjar
2. Configurer les premiers funnels de conversion
3. Activer les heatmaps sur les pages critiques (accueil, produit, checkout)
4. Commencer à visionner des enregistrements de sessions
5. Configurer des sondages pour collecter des feedbacks qualitatifs
