import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderNotificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customer } = body
    
    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `RE${String(orderCount + 1).padStart(6, '0')}`
    
    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    )
    
    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customer.customerName,
        customerEmail: customer.customerEmail || null,
        customerPhone: customer.customerPhone,
        shippingCity: customer.shippingCity,
        shippingArea: customer.shippingArea,
        shippingAddress: customer.shippingAddress,
        observations: customer.observations || null,
        totalAmount,
        status: 'PENDING',
        items: {
          create: items.map((item: { id: string; quantity: number; price: number }) => ({
            bookId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    })
    
    // Update book stock
    for (const item of items) {
      await prisma.book.update({
        where: { id: item.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // Envoyer l'email de notification (ne pas bloquer la réponse si l'email échoue)
    sendOrderNotificationEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingCity: order.shippingCity,
      shippingArea: order.shippingArea,
      shippingAddress: order.shippingAddress,
      observations: order.observations,
      totalAmount: parseFloat(order.totalAmount.toString()),
      items: order.items.map((item) => ({
        book: {
          title: item.book.title,
          price: parseFloat(item.book.price.toString()),
        },
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
      })),
      createdAt: order.createdAt,
    }).catch((error) => {
      console.error('Erreur lors de l\'envoi de l\'email de notification:', error)
      // On ne fait pas échouer la commande si l'email échoue
    })
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    const where: Record<string, unknown> = {}
    
    if (status) {
      where.status = status
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}
