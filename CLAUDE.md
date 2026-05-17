# Prompt de développement — Plateforme GIT Soutenances (Club GIT ENSPD Douala)

## Contexte du projet

Tu es un développeur senior Next.js. Tu dois développer une plateforme web complète pour le Club GIT (Génie Informatique et Télécommunications) de l'ENSPD (École Nationale Supérieure Polytechnique de Douala, Cameroun). Cette plateforme permet aux étudiants de commander des services graphiques pour leurs soutenances de fin d'études.

## Architecture existante

```
src/
├── app/
│   ├── [locale]/          # Internationalisation (fr par défaut)
│   ├── api/
│   │   ├── auth/
│   │   ├── notifications/
│   │   ├── orders/
│   │   ├── profile/
│   │   ├── services/
│   │   ├── stats/
│   │   ├── upload/
│   │   └── users/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── forms/
│   ├── layout/
│   └── ui/
├── generated/prisma/      # Client Prisma 7 généré
├── lib/prisma.ts
├── middleware/
├── store/
└── types/
```

## Stack technique OBLIGATOIRE

- **Framework** : Next.js 16 (App Router, Server Actions)
- **Base de données** : PostgreSQL via Prisma 7 (`@prisma/adapter-pg`)
- **Auth** : NextAuth.js v5 (credentials + Google OAuth)
- **État global** : Zustand
- **Formulaires** : React Hook Form + Zod
- **Style** : Tailwind CSS v4 UNIQUEMENT (pas de v3)
- **Icons** : react-icons
- **Emails** : Nodemailer
- **Notifications in-app** : toast (sonner recommandé)
- **Upload fichiers** : Next.js API routes + stockage local ou Cloudinary
- **Langage** : TypeScript strict

## Palette de couleurs (Tailwind CSS v4 — variables CSS)

Dans `globals.css`, définir :
```css
@theme {
  --color-primary: #1F4E79;      /* Bleu foncé — titres principaux */
  --color-accent: #E67E22;       /* Orange — accent, thème */
  --color-text-dark: #2C3E50;    /* Gris foncé — texte normal */
  --color-text-muted: #7F8C8D;   /* Gris clair — texte secondaire */
  --color-foreground: #000000;   /* Noir — texte courant */
  --color-background: #FFFFFF;   /* Blanc — fond principal */
}
```

## Schéma Prisma (prisma/schema.prisma)

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/prisma"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CLIENT
  ADMIN
  GRAPHISTE
}

enum OrderStatus {
  PENDING_PAYMENT
  PAID
  IN_PROGRESS
  IN_REVIEW
  COMPLETED
  CANCELLED
}

enum ServiceType {
  FLYER
  DOCUMENT_LAYOUT
  POWERPOINT
}

enum UrgencyLevel {
  STANDARD
  EXPRESS
  IMMEDIATE
}

enum PaymentMethod {
  ORANGE_MONEY
  MTN_MONEY
  CASH
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
}

model User {
  id            String   @id @default(uuid())
  nom           String
  prenom        String
  email         String   @unique
  password      String?
  emailVerified Boolean  @default(false)
  role          Role     @default(CLIENT)
  filiere       String?
  niveau        String?
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  orders        Order[]
  sentMessages  Message[]
  notifications Notification[]
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model Order {
  id            String       @id @default(uuid())
  serviceType   ServiceType
  status        OrderStatus  @default(PENDING_PAYMENT)
  urgencyLevel  UrgencyLevel @default(STANDARD)
  totalPrice    Float
  defenseDate   DateTime
  defenseType   String
  filiere       String
  notes         String?
  clientId      String
  graphisteId   String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  client        User         @relation(fields: [clientId], references: [id])
  flyerDetail   FlyerOrder?
  docDetail     DocumentOrder?
  pptDetail     PptOrder?
  messages      Message[]
  invoice       Invoice?
  notifications Notification[]
  deliverables  Deliverable[]
}

model FlyerOrder {
  id               String  @id @default(uuid())
  orderId          String  @unique
  studentName      String
  projectTitle     String
  defenseHour      String
  defenseRoom      String
  jury             Json
  selectedTemplate String?
  modifType        String? // MINOR | MEDIUM | MAJOR
  modifDescription String?
  modifSketchUrl   String?
  photoUrl         String?
  logoUrl          String?
  format           String  @default("A4")
  order            Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model DocumentOrder {
  id             String  @id @default(uuid())
  orderId        String  @unique
  docType        String  // MASTER | INGENIEUR
  pageCount      Int
  norms          String  @default("ECOLE")
  uploadedDocUrl String
  guidelinesUrl  String?
  elements       Json    // éléments cochés (TDM, figures, biblio, etc.)
  order          Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model PptOrder {
  id              String  @id @default(uuid())
  orderId         String  @unique
  slideCount      Int
  durationMin     Int
  contentOption   String  // UPLOAD_RAPPORT | BRIEF_SLIDES | UPLOAD_STRUCTURED
  uploadedFiles   Json?
  specialElements Json?   // animations, infographies, vidéos
  juryInstructions String?
  order           Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model Template {
  id           String  @id @default(uuid())
  name         String
  filiere      String
  previewUrl   String
  sourceFileUrl String
  isActive     Boolean @default(true)
  createdAt    DateTime @default(now())
}

model Message {
  id          String   @id @default(uuid())
  content     String
  orderId     String
  senderId    String
  attachments Json?
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  sender      User     @relation(fields: [senderId], references: [id])
}

model Deliverable {
  id        String   @id @default(uuid())
  orderId   String
  fileUrl   String
  fileType  String   // PDF | PNG | DOCX | PPTX
  version   Int      @default(1)
  isFinal   Boolean  @default(false)
  createdAt DateTime @default(now())

  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model Invoice {
  id            String        @id @default(uuid())
  orderId       String        @unique
  amount        Float
  paymentMethod PaymentMethod
  paymentStatus PaymentStatus @default(PENDING)
  paidAt        DateTime?
  createdAt     DateTime      @default(now())

  order         Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  orderId   String?
  type      String   // ORDER_CONFIRMED | STATUS_CHANGED | MESSAGE_RECEIVED | DELIVERY_READY | URGENT_ALERT
  title     String
  body      String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  order     Order?   @relation(fields: [orderId], references: [id])
}
```

## Pages à développer (App Router)

### Pages publiques (sans auth)
- `/` — Landing page avec présentation des 3 services, galerie templates, tarifs, CTA
- `/services/flyer` — Description détaillée + galerie de templates par filière
- `/services/mise-en-page` — Description + exemples + tarification au nombre de pages
- `/services/powerpoint` — Description + structure type soutenance
- `/auth/login` — Connexion email/password + Google OAuth
- `/auth/register` — Inscription avec validation champs
- `/auth/forgot-password` — Demande réinitialisation
- `/auth/reset-password/[token]` — Nouveau mot de passe

### Pages client (auth requise, role: CLIENT)
- `/dashboard` — Tableau de bord : commandes en cours, compte à rebours soutenance, notifications
- `/orders` — Liste de toutes les commandes avec filtres/tri
- `/orders/[id]` — Détail commande : timeline statut, messagerie, livrables, facture
- `/orders/new/flyer` — Formulaire complet commande flyer (multi-étapes)
- `/orders/new/document` — Formulaire commande mise en page
- `/orders/new/powerpoint` — Formulaire commande PowerPoint
- `/profile` — Profil utilisateur + infos soutenance + préférences notifs
- `/soutenances` — Vue groupée par soutenance (checklist préparation)

### Pages admin (auth requise, role: ADMIN | GRAPHISTE)
- `/admin` — Dashboard : stats, commandes urgentes, activité récente
- `/admin/orders` — Toutes les commandes avec filtres avancés
- `/admin/orders/[id]` — Détail + changer statut + assigner graphiste + upload livrable
- `/admin/users` — Gestion utilisateurs (ADMIN seulement)
- `/admin/templates` — Gérer les templates flyer (ADMIN seulement)
- `/admin/pricing` — Modifier les tarifs (ADMIN seulement)
- `/admin/stats` — Statistiques détaillées (revenus, services populaires, filières)

## Règles de développement à respecter

### Sécurité
- Middleware Next.js dans `src/middleware/` pour protéger toutes les routes `/dashboard`, `/orders`, `/profile`, `/soutenances`, `/admin`
- Vérification du rôle côté serveur dans chaque route API
- Hash des mots de passe avec bcrypt (min 12 rounds)
- Validation Zod sur tous les inputs (client ET serveur)
- Rate limiting sur les routes auth (max 5 tentatives/minute)
- Variables d'environnement : jamais de secrets côté client

### Formulaires (React Hook Form + Zod)
- Chaque formulaire de commande est multi-étapes (stepper)
- Validation en temps réel avec messages d'erreur en français
- Sauvegarde automatique du brouillon dans Zustand (pour ne pas perdre la saisie)
- Upload de fichiers avec aperçu et limite de taille (50 Mo max)

### Tailwind CSS v4
- Utiliser UNIQUEMENT la syntaxe v4 (`@theme`, `@utility`, `@layer`)
- PAS de `tailwind.config.js` — configuration dans `globals.css` uniquement
- Classes utilitaires : `text-primary`, `bg-accent`, `border-primary`, etc. basées sur les variables CSS définies

### Notifications
- Email (Nodemailer) : confirmation inscription, confirmation commande, changement statut, livraison
- In-app (sonner) : toast sur toutes les actions importantes
- Template email HTML professionnel avec couleurs de la charte (#1F4E79, #E67E22)

### Prisma 7 + PostgreSQL
- Utiliser `@prisma/adapter-pg` avec pool de connexions
- Toutes les queries dans des Server Actions ou Route Handlers
- Transactions Prisma pour les opérations multi-tables (ex: créer Order + FlyerOrder + Invoice)

## Flux de commande à implémenter

```
[Client remplit formulaire] 
  → [Validation Zod côté client]
  → [POST /api/orders] 
  → [Prisma crée Order + détail spécifique + Invoice PENDING]
  → [Affichage récapitulatif/facture] 
  → [Client clique Valider]
  → [POST /api/orders/{id}/confirm]
  → [Prisma UPDATE Invoice status=PAID + Order status=PAID]
  → [Nodemailer email confirmation client]
  → [Notification in-app créée pour Admin/Graphiste]
  → [Toast de confirmation]
  → [Redirect vers /orders/{id}]
```

## Variables d'environnement (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/git_soutenance"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@git-soutenance.cm"
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=52428800
```

## Instructions d'implémentation par priorité

### Phase 1 — Foundation (commencer ici)
1. Configurer `auth.ts` (NextAuth v5) avec providers credentials + Google
2. Implémenter le middleware de protection des routes
3. Créer les pages d'auth (login, register, forgot-password)
4. Layout principal : Header avec nav, notification bell, avatar menu
5. Landing page publique avec les 3 services

### Phase 2 — Commandes clients
6. Formulaire multi-étapes flyer (`/orders/new/flyer`)
7. Formulaire mise en page (`/orders/new/document`)
8. Formulaire PowerPoint (`/orders/new/powerpoint`)
9. Page liste commandes + détail commande
10. Système de messagerie par commande

### Phase 3 — Administration
11. Dashboard admin avec statistiques
12. Gestion des commandes (changement statut, upload livrable)
13. Gestion des templates flyer
14. Gestion des utilisateurs et tarifs

### Phase 4 — Notifications et finitions
15. Emails Nodemailer avec templates HTML
16. Système de notifications in-app
17. Alertes urgence soutenance (J-7, J-3, J-1)
18. Page "Mes soutenances" avec checklist

## Conventions de nommage

- Composants : PascalCase (`OrderCard.tsx`, `FlyerForm.tsx`)
- Hooks : camelCase avec préfixe `use` (`useOrders.ts`, `useNotifications.ts`)
- Store Zustand : `useXxxStore.ts` dans `src/store/`
- Types : dans `src/types/index.ts`
- Server actions : dans des fichiers `actions.ts` colocalisés avec les pages
- Route handlers : `src/app/api/[resource]/route.ts`

## Textes de l'interface

- Langue principale : Français
- Filières disponibles : GI (Génie Informatique), GT (Génie des Télécommunications), GE (Génie Électrique), GC (Génie Civil), GM (Génie Mécanique), GCH (Génie Chimique), GIM (Génie Industriel et Maintenance), MP (Mathématiques et Physique)
- Niveaux : Licence 1, Licence 2, Licence 3, Master 1, Master 2, Ingénieur 1, Ingénieur 2, Ingénieur 3, Ingénieur 4, Ingénieur 5, Doctorat

## Notes importantes

- Le système de paiement Mobile Money (Orange Money, MTN) sera intégré PLUS TARD — pour l'instant, afficher une page de confirmation avec instructions de paiement manuel et bouton "Marquer comme payé" côté admin
- Les graphistes travaillent sur Photoshop hors plateforme — la plateforme gère uniquement l'upload des livrables finaux
- Chaque commande est soumise avec toutes les informations EN UNE SEULE FOIS avant paiement — pas de confirmation admin préalable
- La prévisualisation des templates flyer est statique (images PNG des templates) — pas de génération dynamique