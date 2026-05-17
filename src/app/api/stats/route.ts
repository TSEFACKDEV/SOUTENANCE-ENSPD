import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GRAPHISTE')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const [
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      totalRevenue,
      ordersByService,
      ordersByStatus,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.order.count({ where: { status: { in: ['PAID', 'IN_PROGRESS', 'IN_REVIEW'] } } }),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: 'PAID' },
      }),
      prisma.order.groupBy({
        by: ['serviceType'],
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { nom: true, prenom: true } },
          invoice: { select: { paymentStatus: true } },
        },
      }),
    ])

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
      ordersByService,
      ordersByStatus,
      recentOrders,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
