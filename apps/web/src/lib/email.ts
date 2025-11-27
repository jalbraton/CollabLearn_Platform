import nodemailer from 'nodemailer';
import type { Notification } from '@prisma/client';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create reusable transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"CollabLearn Platform" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Email templates
export const emailTemplates = {
  notification: (notification: Notification, userName: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .notification { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CollabLearn Platform</h1>
          <p>Nueva notificación</p>
        </div>
        <div class="content">
          <p>Hola <strong>${userName}</strong>,</p>
          <div class="notification">
            <h3>${notification.title}</h3>
            <p>${notification.message}</p>
            <p style="color: #666; font-size: 14px;">Tipo: ${notification.type}</p>
          </div>
          <a href="${process.env.NEXTAUTH_URL}/notifications" class="button">Ver todas las notificaciones</a>
          <div class="footer">
            <p>Este es un correo automático. Por favor no respondas a este mensaje.</p>
            <p>&copy; 2025 CollabLearn Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  workspaceInvitation: (workspaceName: string, inviterName: string, invitationUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .invitation { background: white; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Invitación a Workspace</h1>
        </div>
        <div class="content">
          <div class="invitation">
            <h2>Has sido invitado</h2>
            <p><strong>${inviterName}</strong> te ha invitado a colaborar en:</p>
            <h3 style="color: #667eea; margin: 20px 0;">${workspaceName}</h3>
            <p>Únete para empezar a colaborar en documentos, compartir ideas y trabajar en equipo.</p>
            <a href="${invitationUrl}" class="button">Aceptar Invitación</a>
          </div>
          <div class="footer">
            <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
            <p>&copy; 2025 CollabLearn Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  commentMention: (pageName: string, commenterName: string, commentContent: string, pageUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .comment { background: white; padding: 20px; border-left: 4px solid #764ba2; margin: 20px 0; border-radius: 5px; }
        .button { display: inline-block; padding: 12px 30px; background: #764ba2; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 Te han mencionado</h1>
        </div>
        <div class="content">
          <p><strong>${commenterName}</strong> te ha mencionado en un comentario:</p>
          <div class="comment">
            <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 10px;">En: ${pageName}</p>
            <p style="margin: 0;">${commentContent}</p>
          </div>
          <a href="${pageUrl}" class="button">Ver Comentario</a>
          <div class="footer">
            <p>Puedes desactivar las notificaciones de menciones en tu configuración.</p>
            <p>&copy; 2025 CollabLearn Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  weeklyDigest: (userName: string, stats: { pages: number; comments: number; collaborators: number }, recentPages: Array<{ name: string; url: string }>) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .stats { display: flex; justify-content: space-around; margin: 30px 0; }
        .stat { text-align: center; background: white; padding: 20px; border-radius: 10px; flex: 1; margin: 0 10px; }
        .stat-number { font-size: 36px; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
        .pages-list { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .page-item { padding: 15px; border-bottom: 1px solid #eee; }
        .page-item:last-child { border-bottom: none; }
        .page-link { color: #667eea; text-decoration: none; font-weight: 500; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Tu Resumen Semanal</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${userName}</strong>,</p>
          <p>Aquí está tu actividad de esta semana en CollabLearn Platform:</p>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-number">${stats.pages}</div>
              <div class="stat-label">Páginas editadas</div>
            </div>
            <div class="stat">
              <div class="stat-number">${stats.comments}</div>
              <div class="stat-label">Comentarios</div>
            </div>
            <div class="stat">
              <div class="stat-number">${stats.collaborators}</div>
              <div class="stat-label">Colaboradores</div>
            </div>
          </div>

          ${recentPages.length > 0 ? `
            <div class="pages-list">
              <h3>Páginas recientes:</h3>
              ${recentPages.map(page => `
                <div class="page-item">
                  <a href="${page.url}" class="page-link">${page.name}</a>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Ir al Dashboard</a>
          </div>

          <div class="footer">
            <p>¿No quieres recibir estos resúmenes? Puedes desactivarlos en tu configuración.</p>
            <p>&copy; 2025 CollabLearn Platform. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
};
