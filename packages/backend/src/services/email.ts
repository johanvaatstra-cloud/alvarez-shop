import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Alvarez Catalunya <noreply@alvarezcat.com>'
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

export async function sendActivationEmail(to: string, contactName: string, token: string) {
  const link = `${FRONTEND_URL}/activar/${token}`
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Active su cuenta en Alvarez Catalunya',
    html: `
      <div style="font-family: 'Source Sans Pro', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 24px; text-align: center;">
          <h1 style="color: #fff; font-family: Georgia, serif; font-weight: 300; margin: 0;">Alvarez Catalunya</h1>
        </div>
        <div style="padding: 40px 32px; background: #fafafa;">
          <h2 style="color: #252525; font-weight: 400;">Bienvenido, ${contactName}</h2>
          <p style="color: #555; line-height: 1.6;">
            Su cuenta de empresa ha sido creada en nuestra plataforma B2B.
            Para activarla y establecer su contraseña, haga clic en el botón:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: #ab1642; color: #fff; padding: 14px 32px; text-decoration: none; font-weight: 600; display: inline-block;">
              Activar mi cuenta
            </a>
          </div>
          <p style="color: #888; font-size: 13px;">
            Este enlace es válido durante 7 días. Si no solicitó esta cuenta, ignore este mensaje.
          </p>
        </div>
        <div style="background: #252525; padding: 20px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            Alvarez Catalunya · Tarragona y Barcelona · Selec Mardis Group
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  to: string,
  companyName: string,
  orderNumber: string,
  totalAmount: number,
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Confirmación de pedido ${orderNumber} — Alvarez Catalunya`,
    html: `
      <div style="font-family: 'Source Sans Pro', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 24px; text-align: center;">
          <h1 style="color: #fff; font-family: Georgia, serif; font-weight: 300; margin: 0;">Alvarez Catalunya</h1>
        </div>
        <div style="padding: 40px 32px; background: #fafafa;">
          <h2 style="color: #252525; font-weight: 400;">Pedido recibido</h2>
          <p style="color: #555;">Estimado cliente de <strong>${companyName}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">
            Hemos recibido su pedido <strong>${orderNumber}</strong> por un importe de
            <strong>€${totalAmount.toFixed(2)}</strong>. Le confirmaremos el envío en breve.
          </p>
          <p style="color: #888; font-size: 13px;">Alvarez Catalunya · Selec Mardis Group</p>
        </div>
      </div>
    `,
  })
}

export async function sendInvoiceEmail(
  to: string,
  companyName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: Date,
  pdfUrl?: string,
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Factura ${invoiceNumber} — Alvarez Catalunya`,
    html: `
      <div style="font-family: 'Source Sans Pro', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 24px; text-align: center;">
          <h1 style="color: #fff; font-family: Georgia, serif; font-weight: 300; margin: 0;">Alvarez Catalunya</h1>
        </div>
        <div style="padding: 40px 32px; background: #fafafa;">
          <h2 style="color: #252525; font-weight: 400;">Factura ${invoiceNumber}</h2>
          <p style="color: #555;">Estimado cliente de <strong>${companyName}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">
            Adjuntamos la factura <strong>${invoiceNumber}</strong> por importe de
            <strong>€${amount.toFixed(2)}</strong> con vencimiento el
            <strong>${dueDate.toLocaleDateString('es-ES')}</strong>.
          </p>
          ${pdfUrl ? `<p><a href="${pdfUrl}" style="color: #ab1642;">Descargar factura PDF</a></p>` : ''}
        </div>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, contactName: string, token: string) {
  const link = `${FRONTEND_URL}/cambiar-contrasena/${token}`
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Restablezca su contraseña — Alvarez Catalunya',
    html: `
      <div style="font-family: 'Source Sans Pro', sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #000; padding: 24px; text-align: center;">
          <h1 style="color: #fff; font-family: Georgia, serif; font-weight: 300; margin: 0;">Alvarez Catalunya</h1>
        </div>
        <div style="padding: 40px 32px; background: #fafafa;">
          <h2 style="color: #252525; font-weight: 400;">Restablecer contraseña</h2>
          <p style="color: #555;">Hola ${contactName},</p>
          <p style="color: #555; line-height: 1.6;">Haga clic a continuación para establecer una nueva contraseña:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: #ab1642; color: #fff; padding: 14px 32px; text-decoration: none; font-weight: 600; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #888; font-size: 13px;">Válido 24 horas.</p>
        </div>
      </div>
    `,
  })
}
