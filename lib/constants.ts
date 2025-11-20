export const SITE_CONFIG = {
  name: 'Royal Editions',
  description: 'Des ouvrages qui forment, inspirent et transforment',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/assets/Logo-Royal-Editions.png',
  links: {
    facebook: 'https://facebook.com/royaleditions',
    instagram: 'https://instagram.com/royaleditions',
    twitter: 'https://twitter.com/royaleditions',
  },
}

export const COLORS = {
  gold: '#FFD700',
  royalBlue: '#001F6D',
}

export const ORDER_STATUS = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  DELIVERED: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
}

export const PHONE_REGEX = /^[0-9]{10}$/
export const PHONE_PREFIX = '+225'
