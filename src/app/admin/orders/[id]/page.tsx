import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiArrowLeft, FiDownload, FiFile } from 'react-icons/fi'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  SERVICE_LABELS,
  URGENCY_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/types'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import OrderMessaging from '@/components/orders/OrderMessaging'
import AdminOrderActions from '@/components/admin/AdminOrderActions'

function FileDownload({ url, label }: { url: string; label: string }) {
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
      ) : (
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
          <FiFile size={16} className="text-slate-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
        <p className="text-xs text-slate-500 truncate">{url.split('/').pop()}</p>
      </div>
      <a
        href={url}
        download
        className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl shrink-0"
        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
      >
        <FiDownload size={12} /> Télécharger
      </a>
    </div>
  )
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'GRAPHISTE')) {
    redirect('/dashboard')
  }

  const { id } = await params

  const [order, graphistes] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, nom: true, prenom: true, email: true, filiere: true, niveau: true, image: true } },
        flyerDetail: true,
        docDetail: true,
        pptDetail: true,
        invoice: true,
        deliverables: { orderBy: { createdAt: 'desc' } },
        messages: {
          include: { sender: { select: { id: true, nom: true, prenom: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'GRAPHISTE'] } },
      select: { id: true, nom: true, prenom: true, role: true },
    }),
  ])

  if (!order) notFound()

  const flyerJury = order.flyerDetail?.jury as { nom: string; role: string }[] | undefined
  const docElements = order.docDetail?.elements as Record<string, boolean> | undefined
  const pptFiles = order.pptDetail?.uploadedFiles as string[] | undefined
  const pptSpecial = order.pptDetail?.specialElements as Record<string, boolean> | undefined

  const ELEMENT_LABELS: Record<string, string> = {
    tdm: 'Table des matières', figures: 'Liste des figures', tableaux: 'Liste des tableaux',
    bibliographie: 'Bibliographie', annexes: 'Annexes', glossaire: 'Glossaire',
    numerotation: 'Numérotation des pages', styles: 'Styles de mise en page',
  }

  const SPECIAL_LABELS: Record<string, string> = {
    animations: 'Animations', infographies: 'Infographies',
    videos: 'Intégration vidéos', graphiques: 'Graphiques / Charts',
  }

  const CONTENT_OPTION_LABELS: Record<string, string> = {
    UPLOAD_RAPPORT: 'Rapport complet fourni',
    BRIEF_SLIDES: 'Brief écrit fourni',
    UPLOAD_STRUCTURED: 'Plan structuré fourni',
  }

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-6 font-medium">
        <FiArrowLeft size={14} /> Retour aux commandes
      </Link>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {SERVICE_LABELS[order.serviceType as keyof typeof SERVICE_LABELS]}
          </h1>
          <p className="text-sm text-slate-500">
            #{order.id.slice(-8).toUpperCase()} — {order.client?.prenom} {order.client?.nom} — {order.client?.email}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">

          {/* General info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="font-semibold text-slate-800 mb-4">Informations générales</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-slate-500">Filière</dt><dd className="font-medium mt-0.5">{order.filiere}</dd></div>
              <div><dt className="text-slate-500">Type de soutenance</dt><dd className="font-medium mt-0.5">{order.defenseType}</dd></div>
              <div><dt className="text-slate-500">Date de soutenance</dt><dd className="font-medium mt-0.5">{formatDate(order.defenseDate)}</dd></div>
              <div><dt className="text-slate-500">Urgence</dt><dd className="font-medium mt-0.5">{URGENCY_LABELS[order.urgencyLevel as keyof typeof URGENCY_LABELS]}</dd></div>
              <div><dt className="text-slate-500">Commande créée</dt><dd className="font-medium mt-0.5">{formatDateTime(order.createdAt)}</dd></div>
              {order.notes && (
                <div className="col-span-2"><dt className="text-slate-500">Notes client</dt><dd className="font-medium mt-0.5 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{order.notes}</dd></div>
              )}
            </dl>
          </div>

          {/* ── FLYER DETAILS ── */}
          {order.flyerDetail && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 className="font-semibold text-slate-800 mb-4">🎨 Détails du flyer</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
                <div><dt className="text-slate-500">Nom étudiant</dt><dd className="font-medium mt-0.5">{order.flyerDetail.studentName}</dd></div>
                <div className="col-span-2"><dt className="text-slate-500">Titre du mémoire</dt><dd className="font-medium mt-0.5">{order.flyerDetail.projectTitle}</dd></div>
                <div><dt className="text-slate-500">Heure</dt><dd className="font-medium mt-0.5">{order.flyerDetail.defenseHour || '—'}</dd></div>
                <div><dt className="text-slate-500">Salle</dt><dd className="font-medium mt-0.5">{order.flyerDetail.defenseRoom || '—'}</dd></div>
                <div><dt className="text-slate-500">Format</dt><dd className="font-medium mt-0.5">{order.flyerDetail.format}</dd></div>
                {order.flyerDetail.selectedTemplate && (
                  <div><dt className="text-slate-500">Template</dt><dd className="font-medium mt-0.5">{order.flyerDetail.selectedTemplate}</dd></div>
                )}
                {order.flyerDetail.modifType && (
                  <>
                    <div><dt className="text-slate-500">Type de modif</dt><dd className="font-medium mt-0.5">{order.flyerDetail.modifType}</dd></div>
                    {order.flyerDetail.modifDescription && (
                      <div className="col-span-2"><dt className="text-slate-500">Description modif</dt><dd className="font-medium mt-0.5 text-xs">{order.flyerDetail.modifDescription}</dd></div>
                    )}
                  </>
                )}
              </dl>

              {/* Jury table */}
              {flyerJury && flyerJury.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Membres du jury</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 rounded-lg">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 rounded-l-lg">Nom</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500 rounded-r-lg">Rôle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flyerJury.map((member, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2 font-medium">{member.nom}</td>
                          <td className="px-3 py-2 text-slate-600">{member.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Files */}
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Fichiers soumis</h3>
              <div className="space-y-2">
                {order.flyerDetail.photoUrl ? (
                  <FileDownload url={order.flyerDetail.photoUrl} label="Photo de l'étudiant(e)" />
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">⚠ Aucune photo fournie</p>
                )}
                {order.flyerDetail.logoUrl && (
                  <FileDownload url={order.flyerDetail.logoUrl} label="Logo établissement / filière" />
                )}
                {order.flyerDetail.modifSketchUrl && (
                  <FileDownload url={order.flyerDetail.modifSketchUrl} label="Esquisse / référence de modification" />
                )}
              </div>
            </div>
          )}

          {/* ── DOCUMENT DETAILS ── */}
          {order.docDetail && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 className="font-semibold text-slate-800 mb-4">📄 Détails de la mise en page</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
                <div><dt className="text-slate-500">Type de document</dt><dd className="font-medium mt-0.5">{order.docDetail.docType}</dd></div>
                <div><dt className="text-slate-500">Nombre de pages</dt><dd className="font-medium mt-0.5">{order.docDetail.pageCount}</dd></div>
                <div><dt className="text-slate-500">Normes</dt><dd className="font-medium mt-0.5">{order.docDetail.norms}</dd></div>
              </dl>

              {/* Elements checklist */}
              {docElements && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Éléments demandés</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(docElements).map(([key, val]) => (
                      <div key={key} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${val ? 'bg-green-50 text-green-800' : 'bg-slate-50 text-slate-400 line-through'}`}>
                        <span>{val ? '✓' : '○'}</span>
                        <span>{ELEMENT_LABELS[key] || key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Fichiers soumis</h3>
              <div className="space-y-2">
                {order.docDetail.uploadedDocUrl ? (
                  <FileDownload url={order.docDetail.uploadedDocUrl} label="Document Word à mettre en page" />
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">⚠ Aucun document Word fourni</p>
                )}
                {order.docDetail.guidelinesUrl && (
                  <FileDownload url={order.docDetail.guidelinesUrl} label="Guide / normes de mise en page" />
                )}
              </div>
            </div>
          )}

          {/* ── PPT DETAILS ── */}
          {order.pptDetail && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 className="font-semibold text-slate-800 mb-4">📊 Détails PowerPoint</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
                <div><dt className="text-slate-500">Nombre de slides</dt><dd className="font-medium mt-0.5">{order.pptDetail.slideCount}</dd></div>
                <div><dt className="text-slate-500">Durée présentation</dt><dd className="font-medium mt-0.5">{order.pptDetail.durationMin} min</dd></div>
                <div className="col-span-2">
                  <dt className="text-slate-500">Option de contenu</dt>
                  <dd className="font-medium mt-0.5">{CONTENT_OPTION_LABELS[order.pptDetail.contentOption] || order.pptDetail.contentOption}</dd>
                </div>
                {order.pptDetail.juryInstructions && (
                  <div className="col-span-2">
                    <dt className="text-slate-500">Instructions jury</dt>
                    <dd className="font-medium mt-0.5 text-xs bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">{order.pptDetail.juryInstructions}</dd>
                  </div>
                )}
              </dl>

              {/* Special elements */}
              {pptSpecial && Object.values(pptSpecial).some(Boolean) && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Éléments spéciaux demandés</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(pptSpecial).filter(([, v]) => v).map(([key]) => (
                      <span key={key} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
                        {SPECIAL_LABELS[key] || key}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded files */}
              {pptFiles && pptFiles.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Fichiers soumis ({pptFiles.length})</h3>
                  <div className="space-y-2">
                    {pptFiles.map((url, i) => {
                      const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
                      return (
                        <FileDownload
                          key={i}
                          url={url}
                          label={isImg ? `Image ${i + 1}` : `Document ${i + 1}`}
                        />
                      )
                    })}
                  </div>
                </>
              )}
              {(!pptFiles || pptFiles.length === 0) && (
                <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">Aucun fichier joint</p>
              )}
            </div>
          )}

          {/* Deliverables */}
          {order.deliverables.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 className="font-semibold text-slate-800 mb-3">Livrables soumis</h2>
              <div className="space-y-2">
                {order.deliverables.map((d) => (
                  <div key={d.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        Version {d.version}
                        {d.isFinal && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Final</span>}
                      </p>
                      <p className="text-xs text-slate-500">{formatDateTime(d.createdAt)}</p>
                    </div>
                    <a href={d.fileUrl} download className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                      <FiDownload size={12} /> Télécharger
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messaging */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800">Messagerie</h2>
            </div>
            <OrderMessaging
              orderId={order.id}
              initialMessages={order.messages as unknown as {
                id: string
                content: string
                senderId: string
                createdAt: Date
                sender: { id: string; nom: string; prenom: string; role: string }
              }[]}
              currentUserId={session.user.id}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Admin actions */}
          <AdminOrderActions
            orderId={order.id}
            currentStatus={order.status}
            currentGraphisteId={order.graphisteId}
            graphistes={graphistes}
            invoiceStatus={order.invoice?.paymentStatus}
          />

          {/* Client info */}
          {order.client && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 className="font-semibold text-slate-800 mb-3">Client</h2>
              <div className="flex items-center gap-3 mb-3">
                {order.client.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={order.client.image} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-bold">
                    {order.client.prenom[0]}{order.client.nom[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{order.client.prenom} {order.client.nom}</p>
                  <p className="text-xs text-slate-500">{order.client.email}</p>
                </div>
              </div>
              {order.client.filiere && <p className="text-xs text-slate-600"><span className="font-medium">Filière :</span> {order.client.filiere}</p>}
              {order.client.niveau && <p className="text-xs text-slate-600 mt-0.5"><span className="font-medium">Niveau :</span> {order.client.niveau}</p>}
            </div>
          )}

          {/* Invoice */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="font-semibold text-slate-800 mb-3">Paiement</h2>
            {order.invoice ? (
              <>
                <p className="text-2xl font-bold text-slate-800">{formatPrice(order.invoice.amount)}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {PAYMENT_METHOD_LABELS[order.invoice.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                </p>
                <p className="text-sm mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.invoice.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.invoice.paymentStatus === 'PAID' ? 'Payé' : 'En attente'}
                  </span>
                </p>
                {order.invoice.paidAt && (
                  <p className="text-xs text-slate-500 mt-1">Le {formatDateTime(order.invoice.paidAt)}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-500">Pas de facture</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

