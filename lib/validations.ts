import { z } from 'zod'

export const bookSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  author: z.string().min(1, 'L\'auteur est requis'),
  summary: z.string().min(1, 'Le résumé est requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.number().min(0, 'Le prix doit être positif'),
  originalPrice: z.number().optional(),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  featured: z.boolean().default(false),
  bestseller: z.boolean().default(false),
  images: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export const orderSchema = z.object({
  customerName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  customerEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  customerPhone: z.string().regex(/^[0-9]{10}$/, 'Le numéro doit contenir exactement 10 chiffres'),
  shippingCity: z.string().min(2, 'La ville est requise'),
  shippingArea: z.string().min(2, 'Le quartier est requis'),
  shippingAddress: z.string().min(5, 'L\'adresse complète est requise'),
  observations: z.string().optional(),
})

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  author: z.string().default('Royal Editions'),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export const testimonialSchema = z.object({
  name: z.string().min(2, 'Le nom est requis'),
  role: z.string().optional(),
  content: z.string().min(10, 'Le contenu doit contenir au moins 10 caractères'),
  rating: z.number().int().min(1).max(5),
  active: z.boolean().default(true),
})
