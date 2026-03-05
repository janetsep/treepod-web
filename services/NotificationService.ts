import { Resend } from 'resend';

// Inicializar Resend con la key del entorno
const resend = new Resend(process.env.RESEND_API_KEY || 're_123_placeholder');

export const NotificationService = {
  /**
   * Envía correo de bienvenida al huésped
   */
  async sendWelcomeEmail(to: string, guestName: string, bookingDates: string, googleMapsLink: string, shortId?: string) {
    if (!to || !to.includes('@')) {
      console.warn('❌ Email inválido para notificación:', to);
      return;
    }

    // Lógica de Modo Test: Redirección de seguridad
    let recipient = to;
    const testEmail = process.env.TEST_EMAIL_RECIPIENT;

    if (testEmail) {
      console.log(`🧪 MODO TEST ACTIVO: Redirigiendo correo de ${to} a ${testEmail}`);
      recipient = testEmail;
    }

    try {
      // 1. Correo al Huésped - Usando el dominio de onboarding de Resend para pruebas
      await resend.emails.send({
        from: 'TreePod <onboarding@resend.dev>',
        to: [recipient],
        subject: testEmail ? `[TEST] Para: ${guestName}` : `¡Reserva Confirmada! Tu refugio en Las Trancas te espera 🌲`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            ${testEmail ? `<p style="background: #ffecb3; padding: 10px; border-radius: 5px;">🚧 <strong>MODO TEST</strong><br>Este correo iba dirigido a: ${to}</p>` : ''}
            <div style="text-align: center; margin-bottom: 20px;">
               <h1 style="color: #D4AF37; margin-bottom: 5px;">Bienvenido a TreePod</h1>
               <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #666;">Refugio de Montaña</p>
            </div>
            <p>Hola <strong>${guestName}</strong>,</p>
            <p>Estamos felices de confirmarte que tu estancia en el bosque está asegurada. Hemos preparado todo para que tu experiencia sea de encuentro real con la naturaleza.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
              ${shortId ? `<p style="margin: 0 0 10px 0;"><strong>🆔 Código de Reserva:</strong> <span style="color: #00ADEF; font-weight: bold;">#${shortId.toUpperCase()}</span></p>` : ''}
              <p style="margin: 0;"><strong>📅 Fechas:</strong> ${bookingDates}</p>
              <p style="margin: 10px 0 0;"><strong>📍 Ubicación:</strong> Valle Las Trancas, Km 72</p>
            </div>
            <h3>🗺️ Cómo llegar</h3>
            <p>Sigue esta ruta directa en Google Maps para llegar sin problemas a nuestro acceso:</p>
            <p><a href="${googleMapsLink}" style="color: #fff; background-color: #1a1a1a; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ubicación en Maps</a></p>
            <h3>📖 Guía del Huésped</h3>
            <p>Para asegurar tu confort, hemos preparado una guía digital completa con:</p>
            <ul>
              <li>Clave de acceso y WiFi de alta velocidad</li>
              <li>Instrucciones de uso de la tinaja</li>
              <li>Recomendaciones locales y restaurantes</li>
            </ul>
            <p><a href="https://domostreepod.cl/guia-huesped" style="color: #00ADEF; font-weight: bold; text-decoration: underline;">Ver Guía Digital del Huésped</a></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #888;">Si tienes alguna emergencia en ruta, contáctanos al WhatsApp de recepción.<br/>¡Nos vemos pronto en la montaña!</p>
          </div>
        `
      });

      // 2. Correo de Alerta al Administrador
      const adminEmail = process.env.ADMIN_EMAIL || 'info@domostreepod.cl';
      await resend.emails.send({
        from: 'TreePod <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `🚨 ¡NUEVA RESERVA WEB! - ${guestName}`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Nueva Reserva Confirmada via Webpay</h2>
            ${shortId ? `<p><strong>Código (5 dígitos):</strong> <span style="font-size: 1.2em; font-weight: bold; color: #00ADEF;">${shortId.toUpperCase()}</span></p>` : ''}
            <p><strong>Huésped:</strong> ${guestName} (${to})</p>
            <p><strong>Fechas:</strong> ${bookingDates}</p>
            <p><strong>Monto:</strong> Ver en panel admin</p>
            <hr />
            <p><a href="https://domostreepod.cl/admin" style="color: #00ADEF;">Ir al Panel de Administración</a></p>
          </div>
        `
      });

      console.log(`📧 Emails de bienvenida y alerta enviados (via onboarding@resend.dev).`);
    } catch (error) {
      console.error('🔥 Error enviando emails:', error);
    }
  },

  /**
   * Envía notificación de nuevo contacto al administrador
   */
  async sendContactNotification(data: { name: string, email: string, subject: string, message: string }) {
    const adminEmail = process.env.ADMIN_EMAIL || 'info@domostreepod.cl';

    try {
      await resend.emails.send({
        from: 'TreePod <onboarding@resend.dev>',
        to: [adminEmail],
        subject: `Nuevo Contacto: ${data.subject} - ${data.name}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px;">
            <h2>Nueva consulta desde la web</h2>
            <p><strong>De:</strong> ${data.name} (${data.email})</p>
            <p><strong>Asunto:</strong> ${data.subject}</p>
            <hr />
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap;">${data.message}</p>
          </div>
        `
      });
      console.log(`📧 Notificación de contacto enviada a ${adminEmail} (via onboarding@resend.dev)`);
      return { success: true };
    } catch (error) {
      console.error('🔥 Error enviando notificación de contacto:', error);
      return { success: false, error };
    }
  },

  /**
   * Envía la guía de retiro y el código de descuento del 10%
   */
  async sendGuideEmail(to: string) {
    if (!to || !to.includes('@')) {
      console.warn('❌ Email inválido para envío de guía:', to);
      return;
    }

    // Lógica de Modo Test
    let recipient = to;
    const testEmail = process.env.TEST_EMAIL_RECIPIENT;
    if (testEmail) {
      recipient = testEmail;
    }

    try {
      await resend.emails.send({
        from: 'TreePod <onboarding@resend.dev>',
        to: [recipient],
        subject: '🎁 Tu Guía de Retiro en la Montaña + Regalo Especial',
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #00ADEF; padding: 40px 20px; text-align: center; color: white;">
               <h1 style="margin: 0; font-size: 28px;">¡Tu aventura comienza aquí!</h1>
               <p style="margin-top: 10px; opacity: 0.9;">Gracias por unirte a la comunidad TreePod</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <p>Hola,</p>
              <p>Es un gusto saludarte. Tal como prometimos, aquí tienes el acceso a nuestra <strong>Guía de Retiro en la Montaña</strong>, diseñada para ayudarte a planificar una escapada perfecta al Valle Las Trancas.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://domostreepod.cl/guia" style="background-color: #1a1a1a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ver Guía Digital</a>
              </div>

              <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
              
              <div style="background-color: #f0faff; border: 2px dashed #00ADEF; padding: 25px; border-radius: 12px; text-align: center;">
                <h3 style="color: #00ADEF; margin-top: 0;">🎁 Tu Regalo de Bienvenida</h3>
                <p style="margin-bottom: 20px;">Utiliza este código en tu primera reserva y obtén un <strong>10% de descuento</strong> sobre la tarifa base:</p>
                <div style="background: white; padding: 10px 20px; display: inline-block; font-family: monospace; font-size: 24px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; border: 1px solid #ddd;">
                   TREEPOD10
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 15px;">*Válido para reservas directas en nuestra web.</p>
              </div>

              <div style="margin-top: 40px; text-align: center;">
                <p style="font-size: 14px; color: #666;">¿Tienes preguntas? Responde a este correo o escríbenos por WhatsApp.</p>
                <p><strong>Nos vemos en la montaña,</strong><br>El equipo de TreePod</p>
              </div>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} TreePod Glamping · Valle Las Trancas, Chile
            </div>
          </div>
        `
      });
      console.log(`📧 Guía enviada exitosamente a ${recipient} (via onboarding@resend.dev)`);
      return { success: true };
    } catch (error) {
      console.error('🔥 Error enviando guía:', error);
      return { success: false, error };
    }
  }
};
