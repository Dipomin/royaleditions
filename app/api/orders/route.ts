import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
