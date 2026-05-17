import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Clean existing data (order matters for FK constraints) ───
  await prisma.notification.deleteMany()
  await prisma.deliverable.deleteMany()
  await prisma.message.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.flyerOrder.deleteMany()
  await prisma.documentOrder.deleteMany()
  await prisma.pptOrder.deleteMany()
  await prisma.order.deleteMany()
  await prisma.template.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // ─── Admin ─────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('GIT@ENSPD2024!', 12)
  const admin = await prisma.user.create({
    data: {
      nom: 'TSEFACK CALVIN KLEIN',
      prenom: 'Calvin',
      email: 'tsefackcalvinklein@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      filiere: 'GI',
      niveau: 'Ingénieur 5',
    },
  })
  console.log(`✅ Admin created: ${admin.email}`)

  // ─── Graphiste ─────────────────────────────────────────────────
  const graphistePassword = await bcrypt.hash('Graphiste@2024!', 12)
  const graphiste = await prisma.user.create({
    data: {
      nom: 'NGUEMA',
      prenom: 'Patrick',
      email: 'patrick.nguema@git-enspd.cm',
      password: graphistePassword,
      role: 'GRAPHISTE',
      emailVerified: true,
      filiere: 'GI',
      niveau: 'Master 2',
    },
  })
  console.log(`✅ Graphiste created: ${graphiste.email}`)

  // ─── Clients ───────────────────────────────────────────────────
  const clientPassword = await bcrypt.hash('Client@12345', 12)
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        nom: 'MBARGA',
        prenom: 'Sophie',
        email: 'sophie.mbarga@enspd.cm',
        password: clientPassword,
        role: 'CLIENT',
        emailVerified: true,
        filiere: 'GT',
        niveau: 'Ingénieur 5',
      },
    }),
    prisma.user.create({
      data: {
        nom: 'FOKO',
        prenom: 'Marc',
        email: 'marc.foko@enspd.cm',
        password: clientPassword,
        role: 'CLIENT',
        emailVerified: true,
        filiere: 'GE',
        niveau: 'Master 2',
      },
    }),
    prisma.user.create({
      data: {
        nom: 'BIYONG',
        prenom: 'Estelle',
        email: 'estelle.biyong@enspd.cm',
        password: clientPassword,
        role: 'CLIENT',
        emailVerified: true,
        filiere: 'GC',
        niveau: 'Ingénieur 4',
      },
    }),
    prisma.user.create({
      data: {
        nom: 'NDEM',
        prenom: 'Kevin',
        email: 'kevin.ndem@enspd.cm',
        password: clientPassword,
        role: 'CLIENT',
        emailVerified: false,
        filiere: 'GM',
        niveau: 'Licence 3',
      },
    }),
    prisma.user.create({
      data: {
        nom: 'ATANGANA',
        prenom: 'Laure',
        email: 'laure.atangana@enspd.cm',
        password: clientPassword,
        role: 'CLIENT',
        emailVerified: true,
        filiere: 'MP',
        niveau: 'Master 1',
      },
    }),
  ])
  console.log(`✅ ${clients.length} clients created`)

  // ─── Templates ─────────────────────────────────────────────────
  const templateData = [
    { name: 'GI Modern Blue', filiere: 'GI' },
    { name: 'GT Professional', filiere: 'GT' },
    { name: 'GE Élégance', filiere: 'GE' },
    { name: 'GC Ingénieur', filiere: 'GC' },
    { name: 'GM Mécanique', filiere: 'GM' },
  ]
  const templates = await Promise.all(
    templateData.map((t) =>
      prisma.template.create({
        data: {
          name: t.name,
          filiere: t.filiere,
          previewUrl: `/public/templates/${t.filiere.toLowerCase()}-preview.png`,
          sourceFileUrl: `/public/templates/${t.filiere.toLowerCase()}-source.psd`,
          isActive: true,
        },
      })
    )
  )
  console.log(`✅ ${templates.length} templates created`)

  // ─── Orders ────────────────────────────────────────────────────

  // Order 1 — Flyer COMPLETED (Sophie)
  const order1 = await prisma.order.create({
    data: {
      serviceType: 'FLYER',
      status: 'COMPLETED',
      urgencyLevel: 'STANDARD',
      totalPrice: 5000,
      defenseDate: new Date('2026-05-20T09:00:00'),
      defenseType: 'Soutenance de fin d\'études',
      filiere: 'GT',
      notes: 'Merci de respecter les couleurs ENSPD.',
      clientId: clients[0].id,
      graphisteId: graphiste.id,
    },
  })
  await prisma.flyerOrder.create({
    data: {
      orderId: order1.id,
      studentName: 'MBARGA Sophie',
      projectTitle: 'Optimisation des Réseaux 5G au Cameroun',
      defenseHour: '09h00',
      defenseRoom: 'Amphithéâtre B',
      jury: [
        { nom: 'Prof. NJOYA', role: 'Président' },
        { nom: 'Dr. MBOUENDA', role: 'Encadreur' },
        { nom: 'Dr. ETOA', role: 'Examinateur' },
      ],
      selectedTemplate: templates[1].id,
      photoUrl: '/public/uploads/sample-photo.jpg',
      format: 'A4',
    },
  })
  await prisma.invoice.create({
    data: {
      orderId: order1.id,
      amount: 5000,
      paymentMethod: 'MTN_MONEY',
      paymentStatus: 'PAID',
      paidAt: new Date('2026-05-10T14:30:00'),
    },
  })
  await prisma.deliverable.create({
    data: {
      orderId: order1.id,
      fileUrl: '/public/deliverables/flyer-mbarga.pdf',
      fileType: 'PDF',
      version: 1,
      isFinal: true,
    },
  })

  // Order 2 — Document IN_PROGRESS (Marc)
  const order2 = await prisma.order.create({
    data: {
      serviceType: 'DOCUMENT_LAYOUT',
      status: 'IN_PROGRESS',
      urgencyLevel: 'EXPRESS',
      totalPrice: 25000,
      defenseDate: new Date('2026-05-22T14:00:00'),
      defenseType: 'Soutenance Master',
      filiere: 'GE',
      notes: 'Normes ENSPD strictes à respecter, bibliographie incluse.',
      clientId: clients[1].id,
      graphisteId: graphiste.id,
    },
  })
  await prisma.documentOrder.create({
    data: {
      orderId: order2.id,
      docType: 'MASTER',
      pageCount: 75,
      norms: 'ECOLE',
      uploadedDocUrl: '/public/uploads/memoire-foko.docx',
      elements: { tdm: true, figures: true, tableaux: true, biblio: true, annexes: false },
    },
  })
  await prisma.invoice.create({
    data: {
      orderId: order2.id,
      amount: 25000,
      paymentMethod: 'ORANGE_MONEY',
      paymentStatus: 'PAID',
      paidAt: new Date('2026-05-12T09:00:00'),
    },
  })

  // Order 3 — PowerPoint PAID, waiting graphiste (Estelle)
  const order3 = await prisma.order.create({
    data: {
      serviceType: 'POWERPOINT',
      status: 'PAID',
      urgencyLevel: 'IMMEDIATE',
      totalPrice: 15000,
      defenseDate: new Date('2026-05-18T10:00:00'),
      defenseType: 'Soutenance Ingénieur',
      filiere: 'GC',
      notes: 'Urgence ! Soutenance dans 2 jours.',
      clientId: clients[2].id,
    },
  })
  await prisma.pptOrder.create({
    data: {
      orderId: order3.id,
      slideCount: 20,
      durationMin: 20,
      contentOption: 'UPLOAD_RAPPORT',
      uploadedFiles: { rapport: '/public/uploads/rapport-biyong.pdf' },
      specialElements: { animations: true, infographies: false, videos: false },
      juryInstructions: 'Le jury est très pointilleux sur la clarté des schémas.',
    },
  })
  await prisma.invoice.create({
    data: {
      orderId: order3.id,
      amount: 15000,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      paidAt: new Date('2026-05-16T08:00:00'),
    },
  })

  // Order 4 — Flyer PENDING_PAYMENT (Laure)
  const order4 = await prisma.order.create({
    data: {
      serviceType: 'FLYER',
      status: 'PENDING_PAYMENT',
      urgencyLevel: 'STANDARD',
      totalPrice: 5000,
      defenseDate: new Date('2026-06-05T08:30:00'),
      defenseType: 'Soutenance de fin d\'études',
      filiere: 'MP',
      clientId: clients[4].id,
    },
  })
  await prisma.flyerOrder.create({
    data: {
      orderId: order4.id,
      studentName: 'ATANGANA Laure',
      projectTitle: 'Modélisation mathématique des phénomènes de diffusion thermique',
      defenseHour: '08h30',
      defenseRoom: 'Salle C12',
      jury: [
        { nom: 'Prof. BELINGA', role: 'Président' },
        { nom: 'Dr. TSALA', role: 'Encadreur' },
      ],
      selectedTemplate: templates[0].id,
      format: 'A4',
    },
  })
  await prisma.invoice.create({
    data: {
      orderId: order4.id,
      amount: 5000,
      paymentMethod: 'MTN_MONEY',
      paymentStatus: 'PENDING',
    },
  })

  // Order 5 — Document IN_REVIEW (Sophie) — second order
  const order5 = await prisma.order.create({
    data: {
      serviceType: 'DOCUMENT_LAYOUT',
      status: 'IN_REVIEW',
      urgencyLevel: 'STANDARD',
      totalPrice: 30000,
      defenseDate: new Date('2026-05-28T15:00:00'),
      defenseType: 'Soutenance Ingénieur',
      filiere: 'GT',
      clientId: clients[0].id,
      graphisteId: graphiste.id,
    },
  })
  await prisma.documentOrder.create({
    data: {
      orderId: order5.id,
      docType: 'INGENIEUR',
      pageCount: 100,
      norms: 'ECOLE',
      uploadedDocUrl: '/public/uploads/rapport-mbarga-2.docx',
      elements: { tdm: true, figures: true, tableaux: true, biblio: true, annexes: true },
    },
  })
  await prisma.invoice.create({
    data: {
      orderId: order5.id,
      amount: 30000,
      paymentMethod: 'ORANGE_MONEY',
      paymentStatus: 'PAID',
      paidAt: new Date('2026-05-08T11:00:00'),
    },
  })
  await prisma.deliverable.create({
    data: {
      orderId: order5.id,
      fileUrl: '/public/deliverables/rapport-mbarga-v1.docx',
      fileType: 'DOCX',
      version: 1,
      isFinal: false,
    },
  })

  console.log(`✅ 5 orders with details and invoices created`)

  // ─── Messages ──────────────────────────────────────────────────
  await prisma.message.createMany({
    data: [
      {
        content: 'Bonjour, avez-vous reçu mes fichiers ? Merci',
        orderId: order2.id,
        senderId: clients[1].id,
        isRead: true,
        createdAt: new Date('2026-05-12T10:00:00'),
      },
      {
        content: 'Oui, j\'ai bien reçu vos fichiers. Je commence la mise en page dès demain. Livraison prévue dans 48h.',
        orderId: order2.id,
        senderId: graphiste.id,
        isRead: true,
        createdAt: new Date('2026-05-12T11:30:00'),
      },
      {
        content: 'Merci beaucoup ! J\'ai hâte de voir le résultat.',
        orderId: order2.id,
        senderId: clients[1].id,
        isRead: false,
        createdAt: new Date('2026-05-12T12:00:00'),
      },
      {
        content: 'Bonjour ! Mon flyer est prêt pour relecture. Pouvez-vous valider ?',
        orderId: order5.id,
        senderId: graphiste.id,
        isRead: false,
        createdAt: new Date('2026-05-15T09:00:00'),
      },
    ],
  })
  console.log('✅ Messages created')

  // ─── Notifications ─────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: clients[0].id,
        orderId: order1.id,
        type: 'DELIVERY_READY',
        title: 'Votre flyer est prêt !',
        body: 'Le graphiste a finalisé votre flyer. Téléchargez-le dès maintenant.',
        isRead: true,
      },
      {
        userId: clients[1].id,
        orderId: order2.id,
        type: 'STATUS_CHANGED',
        title: 'Commande en cours',
        body: 'Votre mise en page est en cours de traitement par notre graphiste.',
        isRead: true,
      },
      {
        userId: clients[2].id,
        orderId: order3.id,
        type: 'ORDER_CONFIRMED',
        title: 'Commande confirmée',
        body: 'Votre paiement a été reçu. Un graphiste sera assigné sous peu.',
        isRead: false,
      },
      {
        userId: admin.id,
        orderId: order3.id,
        type: 'URGENT_ALERT',
        title: '🚨 Commande urgente',
        body: 'Nouvelle commande IMMÉDIATE de Estelle BIYONG — soutenance dans 2 jours !',
        isRead: false,
      },
      {
        userId: admin.id,
        orderId: order4.id,
        type: 'ORDER_CONFIRMED',
        title: 'Nouvelle commande en attente',
        body: 'Laure ATANGANA vient de créer une commande flyer (paiement en attente).',
        isRead: false,
      },
      {
        userId: clients[0].id,
        orderId: order5.id,
        type: 'MESSAGE_RECEIVED',
        title: 'Nouveau message du graphiste',
        body: 'Patrick NGUEMA vous a envoyé un message concernant votre commande.',
        isRead: false,
      },
    ],
  })
  console.log('✅ Notifications created')

  console.log('\n🎉 Database seeded successfully!')
  console.log('─────────────────────────────────────────────────')
  console.log('👤 Admin   : tsefackcalvinklein@gmail.com')
  console.log('🔑 Password: GIT@ENSPD2024!')
  console.log('─────────────────────────────────────────────────')
  console.log('🎨 Graphiste: patrick.nguema@git-enspd.cm')
  console.log('🔑 Password : Graphiste@2024!')
  console.log('─────────────────────────────────────────────────')
  console.log('👥 Clients (password: Client@12345):')
  console.log('   sophie.mbarga@enspd.cm')
  console.log('   marc.foko@enspd.cm')
  console.log('   estelle.biyong@enspd.cm')
  console.log('   kevin.ndem@enspd.cm')
  console.log('   laure.atangana@enspd.cm')
  console.log('─────────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
