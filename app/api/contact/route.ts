import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validation des champs requis
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Configuration du transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour les autres ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Contenu de l'email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #001F6D 0%, #003399 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Nouveau message de contact</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Royal Editions</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #001F6D; margin-top: 0;">Informations du contact</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #4b5563;">Nom complet :</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  ${name}
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #4b5563;">Email :</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  <a href="mailto:${email}" style="color: #FFD700; text-decoration: none;">${email}</a>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #4b5563;">Téléphone :</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  +225 ${phone}
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #4b5563;">Sujet :</strong>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  ${subject}
                </td>
              </tr>
            </table>

            <div style="margin-top: 25px;">
              <h3 style="color: #001F6D; margin-bottom: 10px;">Message :</h3>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #FFD700;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
          </div>
        </div>

        <div style="background: #001F6D; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0; opacity: 0.9;">
            Ce message a été envoyé depuis le formulaire de contact de Royal Editions
          </p>
          <p style="margin: 10px 0 0 0;">
            <a href="https://royaleditions.ci" style="color: #FFD700; text-decoration: none;">www.royaleditions.ci</a>
          </p>
        </div>
      </div>
    `

    // Envoi de l'email
    await transporter.sendMail({
      from: `"Royal Editions Contact" <${process.env.SMTP_FROM || 'admin@royaleditions.com'}>`,
      to: process.env.SMTP_TO || 'contact@royaleditions.com',
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: emailContent,
      text: `
Nouveau message de contact - Royal Editions

Nom: ${name}
Email: ${email}
${phone ? `Téléphone: +225 ${phone}` : ''}
Sujet: ${subject}

Message:
${message}
      `.trim(),
    })

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
    })
  } catch (error) {
    console.error('Error sending contact email:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
