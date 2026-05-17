import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FiArrowLeft, FiDownload, FiMessageSquare, FiFile } from 'react-icons/fi'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SERVICE_LABELS, URGENCY_LABELS, PAYMENT_METHOD_LABELS } from '@/types'
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils'
import OrderMessaging from '@/components/orders/OrderMessaging'
import OrderStatusTimeline from '@/components/orders/OrderStatusTimeline'
import ConfirmPaymentButton from '@/components/orders/ConfirmPaymentButton'

function FileDownload({ url, label }: { url: string; label: string }) {
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={label} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
      ) : (
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
          <FiFile size={14} className="text-slate-500" />
        </div>
      )}
      <span className="text-sm text-slate-700 flex-1 truncate">{label}</span>
      <a
        href={url}
        download
        className="flex items-center gap-1 text-xs font-semibold text-white px-2.5 py-1.5 rounded-xl shrink-0"
        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
      >
        <FiDownload size={11} /> Télécharger
      </a>
    </div>
  )
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, nom: true, prenom: true, email: true } },
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
  })

  if (!order) notFound()
  if (session.user.role === 'CLIENT' && order.clientId !== session.user.id) {
    redirect('/orders')
  }

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'GRAPHISTE'

  const flyerJury = order.flyerDetail?.jury as { nom: string; role: string }[] | undefined
  const docElements = order.docDetail?.elements as Record<string, boolean> | undefined
  const pptFiles = order.pptDetail?.uploadedFiles as string[] | undefined
  const pptSpecial = order.pptDetail?.specialElements as Record<string, boolean> | undefined

  const ELEMENT_LABELS: Record<string, string> = {
    tdm: 'Table des matières', figures: 'Liste des figures', tableaux: 'Liste des tableaux',
    bibliographie: 'Bibliographie', annexes: 'Annexes', glossaire: 'Glossaire',
    numerotation: 'Numérotation des pages', styles: 'Styles de mise en page',
  }
  const CONTENT_OPTION_LABELS: Record<string, string> = {
    UPLOAD_RAPPORT: 'Rapport complet fourni',
    BRIEF_SLIDES: 'Brief écrit fourni',
    UPLOAD_STRUCTURED: 'Plan structuré fourni',
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href={isAdmin ? '/admin/orders' : '/orders'}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6"
      >
        <FiArrowLeft size={14} /> Retour
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {SERVICE_LABELS[order.serviceType as keyof typeof SERVICE_LABELS]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Commande #{order.id.slice(-8).toUpperCase()} • {formatDate(order.createdAt)}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
            ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]
          }`}
        >
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status timeline */}
          <OrderStatusTimeline currentStatus={order.status} />

          {/* General info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Détails de la commande</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Filière</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{order.filiere}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Type de soutenance</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{order.defenseType}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Date de soutenance</dt>
                <dd className="font-medium text-slate-800 mt-0.5">{formatDate(order.defenseDate)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Urgence</dt>
                <dd className="font-medium text-slate-800 mt-0.5">
                  {URGENCY_LABELS[order.urgencyLevel as keyof typeof URGENCY_LABELS]}
                </dd>
              </div>
            </dl>
          </div>

          {/* ── FLYER DETAILS ── */}
          {order.flyerDetail && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-800 mb-4">🎨 Informations du flyer</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
                <div>
                  <dt className="text-slate-500">Nom étudiant(e)</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.flyerDetail.studentName}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-500">Titre du mémoire</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.flyerDetail.projectTitle}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Heure</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.flyerDetail.defenseHour || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Salle</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.flyerDetail.defenseRoom || '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Format</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.flyerDetail.format}</dd>
                </div>
              </dl>

              {flyerJury && flyerJury.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Membres du jury</h3>
                  <div className="space-y-1.5">
                    {flyerJury.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
                        <span className="font-medium text-slate-800">{m.nom}</span>
                        <span className="text-slate-500 text-xs">{m.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(order.flyerDetail.photoUrl || order.flyerDetail.logoUrl) && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Fichiers soumis</h3>
                  <div className="space-y-2">
                    {order.flyerDetail.photoUrl && (
                      <FileDownload url={order.flyerDetail.photoUrl} label="Ma photo" />
                    )}
                    {order.flyerDetail.logoUrl && (
                      <FileDownload url={order.flyerDetail.logoUrl} label="Logo filière" />
                    )}
                    {order.flyerDetail.modifSketchUrl && (
                      <FileDownload url={order.flyerDetail.modifSketchUrl} label="Esquisse de modification" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DOCUMENT DETAILS ── */}
          {order.docDetail && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-800 mb-4">📄 Informations de mise en page</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
                <div>
                  <dt className="text-slate-500">Type de document</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.docDetail.docType}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Nombre de pages</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.docDetail.pageCount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Normes</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.docDetail.norms}</dd>
                </div>
              </dl>

              {docElements && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Éléments demandés</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(docElements).filter(([, v]) => v).map(([key]) => (
                      <div key={key} className="flex items-center gap-2 text-xs bg-green-50 text-green-800 px-3 py-1.5 rounded-lg">
                        <span>✓</span><span>{ELEMENT_LABELS[key] || key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-2">Fichiers soumis</h3>
                <div className="space-y-2">
                  {order.docDetail.uploadedDocUrl && (
                    <FileDownload url={order.docDetail.uploadedDocUrl} label="Document Word à mettre en page" />
                  )}
                  {order.docDetail.guidelinesUrl && (
                    <FileDownload url={order.docDetail.guidelinesUrl} label="Guide de mise en page" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PPT DETAILS ── */}
          {order.pptDetail && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-800 mb-4">📊 Informations PowerPoint</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
                <div>
                  <dt className="text-slate-500">Nombre de slides</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.pptDetail.slideCount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Durée présentation</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">{order.pptDetail.durationMin} min</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-500">Option de contenu</dt>
                  <dd className="font-medium text-slate-800 mt-0.5">
                    {CONTENT_OPTION_LABELS[order.pptDetail.contentOption] || order.pptDetail.contentOption}
                  </dd>
                </div>
                {order.pptDetail.juryInstructions && (
                  <div className="col-span-2">
                    <dt className="text-slate-500">Instructions jury</dt>
                    <dd className="font-medium text-slate-800 mt-0.5 text-xs">{order.pptDetail.juryInstructions}</dd>
                  </div>
                )}
              </dl>

              {pptFiles && pptFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Fichiers soumis ({pptFiles.length})</h3>
                  <div className="space-y-2">
                    {pptFiles.map((url, i) => {
                      const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
                      return (
                        <FileDownload key={i} url={url} label={isImg ? `Image ${i + 1}` : `Document ${i + 1}`} />
                      )
                    })}
                  </div>
                </div>
              )}

              {pptSpecial && Object.values(pptSpecial).some(Boolean) && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Éléments spéciaux</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(pptSpecial).filter(([, v]) => v).map(([key]) => (
                      <span key={key} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full capitalize">{key}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deliverables */}
          {order.deliverables.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-800 mb-4">Livrables</h2>
              <div className="space-y-2">
                {order.deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Version {d.version}
                        {d.isFinal && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Final
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(d.createdAt)}</p>
                    </div>
                    <a
                      href={d.fileUrl}
                      download
                      className="flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-1.5 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                    >
                      <FiDownload size={14} /> Télécharger
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messaging */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
              <FiMessageSquare size={16} className="text-blue-500" />
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
          {/* Invoice */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Paiement</h2>
            {order.invoice ? (
              <>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {formatPrice(order.invoice.amount)}
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Mode :{' '}
                  {PAYMENT_METHOD_LABELS[order.invoice.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                </p>
                {order.invoice.paymentStatus === 'PENDING' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
                    <p className="font-semibold text-yellow-800 mb-2">Paiement en attente</p>
                    {order.invoice.paymentMethod === 'ORANGE_MONEY' && (
                      <p className="text-yellow-700">
                        Envoyez <strong>{formatPrice(order.invoice.amount)}</strong> au{' '}
                        <strong>6XX XXX XXX</strong> (Orange Money)
                      </p>
                    )}
                    {order.invoice.paymentMethod === 'MTN_MONEY' && (
                      <p className="text-yellow-700">
                        Envoyez <strong>{formatPrice(order.invoice.amount)}</strong> au{' '}
                        <strong>6XX XXX XXX</strong> (MTN MoMo)
                      </p>
                    )}
                    {order.invoice.paymentMethod === 'CASH' && (
                      <p className="text-yellow-700">Remise en espèces en personne à l&apos;ENSPD.</p>
                    )}
                    <p className="text-xs text-yellow-600 mt-2">
                      Indiquez le numéro de commande :{' '}
                      <strong>#{order.id.slice(-8).toUpperCase()}</strong>
                    </p>
                  </div>
                )}
                {order.invoice.paymentStatus === 'PAID' && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
                    <p className="font-semibold text-green-700">✓ Paiement confirmé</p>
                    {order.invoice.paidAt && (
                      <p className="text-green-600 text-xs mt-0.5">
                        Le {formatDateTime(order.invoice.paidAt)}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-500 text-sm">Facture non disponible</p>
            )}
          </div>

          {/* Client info (admin only) */}
          {isAdmin && order.client && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-800 mb-3">Client</h2>
              <p className="text-sm font-medium text-slate-800">
                {order.client.prenom} {order.client.nom}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{order.client.email}</p>
              {isAdmin && order.status === 'PENDING_PAYMENT' && (
                <div className="mt-4">
                  <ConfirmPaymentButton orderId={order.id} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
