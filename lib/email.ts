import nodemailer from 'nodemailer'

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Type pour les informations de commande
export interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string | null
  customerPhone: string
  shippingCity: string
  shippingArea: string
  shippingAddress: string
  observations: string | null
  totalAmount: number
  items: Array<{
    book: {
      title: string
      price: number
    }
    quantity: number
    price: number
  }>
  createdAt: Date
}

// Fonction pour formater le montant en FCFA
function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA'
}

// Fonction pour formater la date
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))
}

// Template HTML pour l'email de notification de commande
function generateOrderEmailHTML(order: OrderEmailData): string {
  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.book.title}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle commande - Royal Editions</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #001f6d 0%, #0038b8 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Royal Editions</h1>
              <p style="margin: 10px 0 0 0; color: #ffd700; font-size: 16px;">Nouvelle commande reçue</p>
            </td>
          </tr>

          <!-- Order Info -->
          <tr>
            <td style="padding: 30px;">
              <div style="background-color: #f9fafb; border-left: 4px solid #ffd700; padding: 15px; margin-bottom: 25px;">
                <h2 style="margin: 0 0 10px 0; color: #001f6d; font-size: 20px;">Commande #${order.orderNumber}</h2>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Reçue le ${formatDate(order.createdAt)}</p>
              </div>

              <!-- Customer Information -->
              <h3 style="color: #001f6d; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                📋 Informations client
              </h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="color: #6b7280; width: 140px;"><strong>Nom :</strong></td>
                  <td style="color: #111827;">${order.customerName}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280;"><strong>Téléphone :</strong></td>
                  <td style="color: #111827;">${order.customerPhone}</td>
                </tr>
                ${
                  order.customerEmail
                    ? `
                <tr>
                  <td style="color: #6b7280;"><strong>Email :</strong></td>
                  <td style="color: #111827;">${order.customerEmail}</td>
                </tr>
                `
                    : ''
                }
              </table>

              <!-- Shipping Information -->
              <h3 style="color: #001f6d; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                🚚 Adresse de livraison
              </h3>
              <table width="100%" cellpadding="8" cellspacing="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="color: #6b7280; width: 140px;"><strong>Ville :</strong></td>
                  <td style="color: #111827;">${order.shippingCity}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280;"><strong>Commune :</strong></td>
                  <td style="color: #111827;">${order.shippingArea}</td>
                </tr>
                <tr>
                  <td style="color: #6b7280;"><strong>Adresse :</strong></td>
                  <td style="color: #111827;">${order.shippingAddress}</td>
                </tr>
                ${
                  order.observations
                    ? `
                <tr>
                  <td style="color: #6b7280; vertical-align: top;"><strong>Observations :</strong></td>
                  <td style="color: #111827;">${order.observations}</td>
                </tr>
                `
                    : ''
                }
              </table>

              <!-- Order Items -->
              <h3 style="color: #001f6d; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                📚 Articles commandés
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; border: 1px solid #e5e7eb; border-radius: 4px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 12px; text-align: left; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Livre</th>
                    <th style="padding: 12px; text-align: center; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Qté</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Prix unitaire</th>
                    <th style="padding: 12px; text-align: right; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
                <tfoot>
                  <tr style="background-color: #fef3c7;">
                    <td colspan="3" style="padding: 15px; text-align: right; font-weight: 700; color: #001f6d; font-size: 16px;">TOTAL</td>
                    <td style="padding: 15px; text-align: right; font-weight: 700; color: #001f6d; font-size: 18px;">${formatPrice(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Action Buttons -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://royaleditions.com'}/admin/commandes" 
                   style="display: inline-block; background: linear-gradient(135deg, #001f6d 0%, #0038b8 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  Voir la commande dans l'admin
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Royal Editions - Librairie et éditions en Côte d'Ivoire
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Fonction pour envoyer l'email de notification de commande
export async function sendOrderNotificationEmail(
  order: OrderEmailData
): Promise<boolean> {
  try {
    // Destinataires de la notification
    const recipients = [
      'kd_landry@yahoo.fr',
      'bkone.andre@gmail.com',
      'support@royaleditions.com',
    ]

    const mailOptions = {
      from: `"Royal Editions" <${process.env.SMTP_FROM || 'support@royaleditions.com'}>`,
      to: recipients.join(', '),
      subject: `🎉 Nouvelle commande #${order.orderNumber} - ${order.customerName}`,
      html: generateOrderEmailHTML(order),
      text: `
Nouvelle commande reçue sur Royal Editions

Commande #${order.orderNumber}
Date : ${formatDate(order.createdAt)}

CLIENT
------
Nom : ${order.customerName}
Téléphone : ${order.customerPhone}
${order.customerEmail ? `Email : ${order.customerEmail}` : ''}

LIVRAISON
---------
Ville : ${order.shippingCity}
Commune : ${order.shippingArea}
Adresse : ${order.shippingAddress}
${order.observations ? `Observations : ${order.observations}` : ''}

ARTICLES
--------
${order.items.map((item) => `- ${item.book.title} x${item.quantity} : ${formatPrice(item.price * item.quantity)}`).join('\n')}

TOTAL : ${formatPrice(order.totalAmount)}

Voir la commande : ${process.env.NEXT_PUBLIC_BASE_URL || 'https://royaleditions.com'}/admin/commandes
      `.trim(),
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Email de commande #${order.orderNumber} envoyé avec succès`)
    return true
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de commande:', error)
    return false
  }
}

// Fonction pour vérifier la configuration SMTP
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify()
    console.log('✅ Configuration SMTP vérifiée avec succès')
    return true
  } catch (error) {
    console.error('❌ Erreur de configuration SMTP:', error)
    return false
  }
}
