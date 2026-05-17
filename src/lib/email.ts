import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function emailBase(title: string, content: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1F4E79;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🎓 Club GIT — ENSPD Douala
              </h1>
              <p style="margin:4px 0 0;color:#93c5fd;font-size:14px;">Services graphiques pour soutenances</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#7F8C8D;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} Club GIT ENSPD Douala — Tous droits réservés<br/>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#E67E22;">git-soutenance.cm</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendWelcomeEmail(to: string, prenom: string) {
  const content = `
    <h2 style="color:#1F4E79;margin-top:0;">Bienvenue, ${prenom} !</h2>
    <p style="color:#2C3E50;line-height:1.6;">
      Votre compte sur la plateforme de services graphiques du Club GIT ENSPD a été créé avec succès.
    </p>
    <p style="color:#2C3E50;line-height:1.6;">
      Vous pouvez désormais commander vos services graphiques pour votre soutenance :
    </p>
    <ul style="color:#2C3E50;line-height:2;">
      <li>🎨 <strong>Flyer de soutenance</strong> — Annonce visuelle professionnelle</li>
      <li>📄 <strong>Mise en page</strong> — Mise en forme de votre rapport</li>
      <li>📊 <strong>Présentation PowerPoint</strong> — Diaporama de soutenance</li>
    </ul>
    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
         style="display:inline-block;background:#E67E22;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Accéder à mon espace
      </a>
    </div>
  `
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: '✅ Bienvenue sur la plateforme GIT Soutenances',
    html: emailBase('Bienvenue', content),
  })
}

export async function sendOrderConfirmationEmail(
  to: string,
  prenom: string,
  orderId: string,
  serviceLabel: string,
  totalPrice: number
) {
  const content = `
    <h2 style="color:#1F4E79;margin-top:0;">Commande confirmée, ${prenom} !</h2>
    <p style="color:#2C3E50;line-height:1.6;">
      Votre commande a bien été reçue et est en attente de paiement.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:20px;margin:20px 0;">
      <table width="100%" cellpadding="6" cellspacing="0">
        <tr>
          <td style="color:#7F8C8D;font-size:13px;">Service</td>
          <td style="color:#2C3E50;font-weight:600;text-align:right;">${serviceLabel}</td>
        </tr>
        <tr>
          <td style="color:#7F8C8D;font-size:13px;">Référence</td>
          <td style="color:#2C3E50;font-weight:600;text-align:right;">#${orderId.slice(0, 8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="color:#7F8C8D;font-size:13px;border-top:1px solid #e2e8f0;padding-top:12px;">Montant total</td>
          <td style="color:#E67E22;font-weight:700;font-size:18px;text-align:right;border-top:1px solid #e2e8f0;padding-top:12px;">${totalPrice.toLocaleString('fr-FR')} FCFA</td>
        </tr>
      </table>
    </div>
    <p style="color:#2C3E50;line-height:1.6;">
      Pour finaliser votre commande, effectuez le paiement via Mobile Money ou en espèces et notre équipe vous contactera.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" 
         style="display:inline-block;background:#1F4E79;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Voir ma commande
      </a>
    </div>
  `
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `✅ Commande confirmée — ${serviceLabel}`,
    html: emailBase('Commande confirmée', content),
  })
}

export async function sendStatusUpdateEmail(
  to: string,
  prenom: string,
  orderId: string,
  serviceLabel: string,
  statusLabel: string
) {
  const content = `
    <h2 style="color:#1F4E79;margin-top:0;">Mise à jour de votre commande</h2>
    <p style="color:#2C3E50;line-height:1.6;">
      Bonjour ${prenom}, le statut de votre commande a été mis à jour.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#7F8C8D;font-size:13px;">Service</p>
      <p style="margin:0 0 16px;color:#2C3E50;font-weight:600;">${serviceLabel}</p>
      <p style="margin:0 0 8px;color:#7F8C8D;font-size:13px;">Nouveau statut</p>
      <p style="margin:0;color:#E67E22;font-weight:700;font-size:16px;">${statusLabel}</p>
    </div>
    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" 
         style="display:inline-block;background:#1F4E79;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Voir ma commande
      </a>
    </div>
  `
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `🔔 Commande mise à jour — ${statusLabel}`,
    html: emailBase('Mise à jour commande', content),
  })
}

export async function sendDeliveryEmail(
  to: string,
  prenom: string,
  orderId: string,
  serviceLabel: string
) {
  const content = `
    <h2 style="color:#1F4E79;margin-top:0;">Votre livrable est prêt !</h2>
    <p style="color:#2C3E50;line-height:1.6;">
      Bonjour ${prenom}, bonne nouvelle ! Votre ${serviceLabel} est prêt à être téléchargé.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}" 
         style="display:inline-block;background:#E67E22;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Télécharger mon livrable
      </a>
    </div>
  `
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `🎉 Votre ${serviceLabel} est prêt !`,
    html: emailBase('Livrable prêt', content),
  })
}

export async function sendPasswordResetEmail(to: string, prenom: string, resetUrl: string) {
  const content = `
    <h2 style="color:#1F4E79;margin-top:0;">Réinitialisation de mot de passe</h2>
    <p style="color:#2C3E50;line-height:1.6;">
      Bonjour ${prenom}, vous avez demandé la réinitialisation de votre mot de passe.
    </p>
    <p style="color:#2C3E50;line-height:1.6;">
      Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable pendant <strong>1 heure</strong>.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${resetUrl}" 
         style="display:inline-block;background:#1F4E79;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="color:#7F8C8D;font-size:13px;margin-top:20px;">
      Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe ne sera pas modifié.
    </p>
  `
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: '🔐 Réinitialisation de votre mot de passe',
    html: emailBase('Réinitialisation mot de passe', content),
  })
}
