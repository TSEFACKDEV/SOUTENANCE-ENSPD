export type Role = 'CLIENT' | 'ADMIN' | 'GRAPHISTE'

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'

export type ServiceType = 'FLYER' | 'DOCUMENT_LAYOUT' | 'POWERPOINT'

export type UrgencyLevel = 'STANDARD' | 'EXPRESS' | 'IMMEDIATE'

export type PaymentMethod = 'ORANGE_MONEY' | 'MTN_MONEY' | 'CASH'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'

export interface User {
  id: string
  nom: string
  prenom: string
  email: string
  role: Role
  filiere?: string | null
  niveau?: string | null
  image?: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  serviceType: ServiceType
  status: OrderStatus
  urgencyLevel: UrgencyLevel
  totalPrice: number
  defenseDate: Date
  defenseType: string
  filiere: string
  notes?: string | null
  clientId: string
  graphisteId?: string | null
  createdAt: Date
  updatedAt: Date
  client?: User
  flyerDetail?: FlyerOrder | null
  docDetail?: DocumentOrder | null
  pptDetail?: PptOrder | null
  invoice?: Invoice | null
  deliverables?: Deliverable[]
  messages?: Message[]
}

export interface FlyerOrder {
  id: string
  orderId: string
  studentName: string
  projectTitle: string
  defenseHour: string
  defenseRoom: string
  jury: JuryMember[]
  selectedTemplate?: string | null
  modifType?: string | null
  modifDescription?: string | null
  modifSketchUrl?: string | null
  photoUrl?: string | null
  logoUrl?: string | null
  format: string
}

export interface JuryMember {
  nom: string
  role: string
}

export interface DocumentOrder {
  id: string
  orderId: string
  docType: string
  pageCount: number
  norms: string
  uploadedDocUrl: string
  guidelinesUrl?: string | null
  elements: DocumentElements
}

export interface DocumentElements {
  tdm?: boolean
  figures?: boolean
  tableaux?: boolean
  bibliographie?: boolean
  annexes?: boolean
  glossaire?: boolean
  numerotation?: boolean
  styles?: boolean
}

export interface PptOrder {
  id: string
  orderId: string
  slideCount: number
  durationMin: number
  contentOption: 'UPLOAD_RAPPORT' | 'BRIEF_SLIDES' | 'UPLOAD_STRUCTURED'
  uploadedFiles?: string[] | null
  specialElements?: PptSpecialElements | null
  juryInstructions?: string | null
}

export interface PptSpecialElements {
  animations?: boolean
  infographies?: boolean
  videos?: boolean
  graphiques?: boolean
}

export interface Invoice {
  id: string
  orderId: string
  amount: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paidAt?: Date | null
  createdAt: Date
}

export interface Message {
  id: string
  content: string
  orderId: string
  senderId: string
  attachments?: string[] | null
  isRead: boolean
  createdAt: Date
  sender?: User
}

export interface Deliverable {
  id: string
  orderId: string
  fileUrl: string
  fileType: string
  version: number
  isFinal: boolean
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  orderId?: string | null
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  createdAt: Date
}

export type NotificationType =
  | 'ORDER_CONFIRMED'
  | 'STATUS_CHANGED'
  | 'MESSAGE_RECEIVED'
  | 'DELIVERY_READY'
  | 'URGENT_ALERT'

export interface Template {
  id: string
  name: string
  filiere: string
  previewUrl: string
  sourceFileUrl: string
  isActive: boolean
  createdAt: Date
}

// Form types
export interface FlyerOrderFormData {
  // Étape 1 — Infos soutenance
  defenseDate: string
  defenseType: string
  filiere: string
  urgencyLevel: UrgencyLevel
  paymentMethod: PaymentMethod
  // Étape 2 — Infos flyer
  studentName: string
  projectTitle: string
  defenseHour: string
  defenseRoom: string
  jury: JuryMember[]
  // Étape 3 — Template & options
  selectedTemplate?: string
  modifType?: string
  modifDescription?: string
  format: string
  // Étape 4 — Fichiers
  photoUrl?: string
  logoUrl?: string
  modifSketchUrl?: string
  notes?: string
}

export interface DocumentOrderFormData {
  // Étape 1 — Infos soutenance
  defenseDate: string
  defenseType: string
  filiere: string
  urgencyLevel: UrgencyLevel
  paymentMethod: PaymentMethod
  // Étape 2 — Détails document
  docType: string
  pageCount: number
  norms: string
  elements: DocumentElements
  // Étape 3 — Upload
  uploadedDocUrl: string
  guidelinesUrl?: string
  notes?: string
}

export interface PptOrderFormData {
  // Étape 1 — Infos soutenance
  defenseDate: string
  defenseType: string
  filiere: string
  urgencyLevel: UrgencyLevel
  paymentMethod: PaymentMethod
  // Étape 2 — Détails présentation
  slideCount: number
  durationMin: number
  contentOption: 'UPLOAD_RAPPORT' | 'BRIEF_SLIDES' | 'UPLOAD_STRUCTURED'
  specialElements: PptSpecialElements
  juryInstructions?: string
  // Étape 3 — Upload fichiers
  uploadedFiles?: string[]
  notes?: string
}

// Tarification
export const PRICING = {
  FLYER: {
    STANDARD: 3000,
    EXPRESS: 5000,
    IMMEDIATE: 8000,
  },
  DOCUMENT_LAYOUT: {
    BASE: 500, // par page
    MIN_PAGES: 30,
    EXPRESS_MULTIPLIER: 1.5,
    IMMEDIATE_MULTIPLIER: 2,
  },
  POWERPOINT: {
    PER_SLIDE: 500,
    MIN_SLIDES: 10,
    EXPRESS_MULTIPLIER: 1.5,
    IMMEDIATE_MULTIPLIER: 2,
  },
} as const

export const FILIERES = [
{ value: 'GCI', label: 'GCI — Génie Civil' },
  { value: 'GLO', label: 'GLO — Génie Logiciel (Filière GIT)' },
  { value: 'GRT', label: 'GRT — Génie Réseau & Télécommunications (Filière GIT)' },
  { value: 'GESI', label: 'GESI — Génie Électrique & Systèmes Intelligents' },
  { value: 'GM', label: 'GM — Génie Mécanique' },
  { value: 'GE', label: 'GE — Génie Énergétique' },
  { value: 'GP', label: 'GP — Génie des Procédés' },
  { value: 'GMP', label: 'GMP — Génie Maritime & Portuaire' },
  { value: 'GAM', label: 'GAM — Génie Automobile & Mécatronique' },
  { value: 'QHSE', label: 'QHSE — Qualité, Hygiène, Sécurité & Environnement' },
  { value: 'METEO', label: 'METEO — Météorologie' },
] as const

export const NIVEAUX = [

  'Ingénieur 1', 'Ingénieur 2', 'Ingénieur 3', 'Ingénieur 4', 'Ingénieur 5',
  'Master 1', 'Master 2',
  'Doctorat',
  'Licence 1', 'Licence 2', 'Licence 3',
  
] as const

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'En attente de paiement',
  PAID: 'Payé',
  IN_PROGRESS: 'En cours',
  IN_REVIEW: 'En révision',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  IN_REVIEW: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  FLYER: 'Flyer de soutenance',
  DOCUMENT_LAYOUT: 'Mise en page document',
  POWERPOINT: 'Présentation PowerPoint',
}

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  STANDARD: 'Standard (3-5 jours)',
  EXPRESS: 'Express (24-48h)',
  IMMEDIATE: 'Immédiat (< 24h)',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ORANGE_MONEY: 'Orange Money',
  MTN_MONEY: 'MTN Mobile Money',
  CASH: 'Espèces',
}
