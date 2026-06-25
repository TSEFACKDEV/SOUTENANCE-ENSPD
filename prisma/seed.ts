import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Nettoyage (ordre important pour les contraintes FK)
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

  // Mot de passe commun (modifiable)
  const ADMIN_PASSWORD = 'GIT@ENSPD2024!'
  const GRAPHISTE_PASSWORD = 'Graphiste@2024!'

  // --- Création des 2 admins ---
  const adminEmails = [
    'admin1@git-enspd.cm',
    'admin2@git-enspd.cm'
  ]
  const adminNames = [
    { nom: 'TSEFACK', prenom: 'Calvin' },
    { nom: 'KAMGA', prenom: 'Jean' } // exemple pour le second
  ]

  const admins = []
  for (let i = 0; i < adminEmails.length; i++) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    const admin = await prisma.user.create({
      data: {
        nom: adminNames[i].nom,
        prenom: adminNames[i].prenom,
        email: adminEmails[i],
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true,
        filiere: 'GI',
        niveau: 'Ingénieur 5',
      },
    })
    admins.push(admin)
    console.log(`✅ Admin créé : ${admin.email}`)
  }

  // --- Création des 10 graphistes ---
  const graphistes = []
  for (let i = 1; i <= 10; i++) {
    const hashedPassword = await bcrypt.hash(GRAPHISTE_PASSWORD, 12)
    const graphiste = await prisma.user.create({
      data: {
        nom: `Graphiste${i}`,
        prenom: `Prénom${i}`,
        email: `graphiste${i}@git-enspd.cm`,
        password: hashedPassword,
        role: 'GRAPHISTE',
        emailVerified: true,
        filiere: 'GI',
        niveau: 'Master 2',
      },
    })
    graphistes.push(graphiste)
    console.log(`✅ Graphiste créé : ${graphiste.email}`)
  }

  console.log('\n🎉 Base de données seedée avec succès !')
  console.log('─────────────────────────────────────────────────')
  console.log('👥 Administrateurs :')
  admins.forEach(admin => {
    console.log(`   📧 ${admin.email}  🔑 ${ADMIN_PASSWORD}`)
  })
  console.log('─────────────────────────────────────────────────')
  console.log('🎨 Graphistes :')
  graphistes.forEach(g => {
    console.log(`   📧 ${g.email}  🔑 ${GRAPHISTE_PASSWORD}`)
  })
  console.log('─────────────────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })