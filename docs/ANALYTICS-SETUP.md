# 🚀 Configuration Analytics - Guide Rapide

## Étape 1: Obtenir vos IDs

### Facebook Pixel

1. Allez sur [Meta Events Manager](https://business.facebook.com/events_manager)
2. Sélectionnez votre pixel ou créez-en un nouveau
3. Copiez l'**ID du pixel** (15 chiffres)

### Google Analytics 4

1. Allez sur [Google Analytics](https://analytics.google.com)
2. Créez une propriété GA4
3. Copiez l'**ID de mesure** (format `G-XXXXXXXXXX`)

---

## Étape 2: Configuration

Créez un fichier `.env.local` à la racine du projet :

```bash
# Facebook Pixel ID (15 chiffres)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345

# Google Analytics Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Étape 3: Redémarrer

```bash
npm run dev
```

---

## Événements Trackés Automatiquement

✅ **Page View**: Chaque page visitée  
✅ **View Product**: Page produit consultée  
✅ **Add to Cart**: Ajout au panier  
✅ **Initiate Checkout**: Page de commande  
✅ **Purchase**: Commande confirmée

---

## Vérification

### Extensions Chrome:
- [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
- [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)

### Test en direct:
1. Installez les extensions
2. Visitez votre site
3. Vérifiez les événements dans les extensions

---

## Tableaux de Bord

- **Facebook**: [Events Manager](https://business.facebook.com/events_manager)
- **Google**: [Analytics Real-Time](https://analytics.google.com)

---

## Problèmes courants

**Les événements ne s'affichent pas ?**
- Vérifiez que les IDs sont dans `.env.local`
- Redémarrez `npm run dev`
- Videz le cache du navigateur (Cmd+Shift+R)

**Erreur "fbq is not defined" ?**
- Vérifiez votre Facebook Pixel ID
- Attendez quelques secondes après le chargement

**Données GA4 manquantes ?**
- Les données peuvent prendre 24-48h pour apparaître
- Utilisez le rapport "Real-Time" pour voir les données instantanément
