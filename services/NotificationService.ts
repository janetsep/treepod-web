import { Resend } from 'resend';

// Inicializar Resend con la key del entorno
const resend = new Resend(process.env.RESEND_API_KEY || 're_123_placeholder');

export const NotificationService = {
  /**
   * Envía correo de bienvenida al huésped
   */
  async sendWelcomeEmail(to: string, guestName: string, bookingDates: string, googleMapsLink: string, shortId?: string, guestsCount?: number, extras?: string[], amountPaid?: number, totalAmount?: number) {
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

    const pendingAmount = totalAmount && amountPaid ? totalAmount - amountPaid : 0;
    const formatCLP = (n: number) => n.toLocaleString('es-CL');

    try {
      await resend.emails.send({
        from: 'Glamping Domos TreePod <info@domostreepod.cl>',
        to: [recipient],
        subject: testEmail ? `[TEST] Para: ${guestName}` : `¡Reserva Confirmada! Tu domo en Valle Las Trancas te espera`,
        html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; background: #ffffff;">
                ${testEmail ? `<p style="background: #ffecb3; padding: 10px; border-radius: 5px;">🚧 <strong>MODO TEST</strong><br>Este correo iba dirigido a: ${to}</p>` : ''}

                <div style="padding: 32px 20px 16px; text-align: center;">
                    <img src="https://domostreepod.cl/images/branding/logo-treepod.jpg" alt="Logo TreePod" style="width: 120px; height: auto;" />
                </div>

                <div style="background: #00ADEF; padding: 24px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0 0 4px 0; font-size: 22px; font-weight: 600;">Reserva Confirmada</h1>
                    <p style="color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 3px; font-size: 11px; margin: 0; font-weight: 600;">Glamping Domos TreePod</p>
                </div>

                <div style="padding: 32px 24px;">
                    <p style="font-size: 16px; line-height: 1.6;">Hola <strong>${guestName}</strong>,</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #555;">Estamos contentos de confirmar su estadía en nuestro glamping. Prepararemos todo para que su experiencia sea de un encuentro real con la naturaleza.</p>

                    <div style="background: #f5f5f5; padding: 24px; border-radius: 12px; margin: 28px 0; border: 1px solid #e5e5e5;">
                        <h4 style="margin: 0 0 16px 0; color: #00ADEF; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Datos de la reserva</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr><td style="padding: 8px 0; color: #64748b; width: 45%;">Código</td><td style="padding: 8px 0; font-weight: 700; color: #00ADEF; font-family: monospace; font-size: 16px;">#${shortId?.toUpperCase() || 'S/N'}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Fechas</td><td style="padding: 8px 0; font-weight: 600;">${bookingDates}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b;">Huéspedes</td><td style="padding: 8px 0; font-weight: 600;">${guestsCount || 1} ${guestsCount === 1 ? 'persona' : 'personas'}</td></tr>
                            ${extras && extras.length > 0 ? `<tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;">Extras</td><td style="padding: 8px 0; font-weight: 600;">${extras.join(', ')}</td></tr>` : ''}
                            <tr><td style="padding: 8px 0; color: #64748b;">Ubicación</td><td style="padding: 8px 0; font-weight: 600;">Valle Las Trancas, Km 72</td></tr>
                        </table>
                    </div>

                    ${totalAmount ? `
                    <div style="background: #f5f5f5; padding: 20px 24px; border-radius: 12px; margin: 0 0 28px 0; border: 1px solid #e5e5e5;">
                        <h4 style="margin: 0 0 12px 0; color: #00ADEF; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Detalle de pago</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr><td style="padding: 6px 0; color: #64748b;">Total reserva</td><td style="padding: 6px 0; font-weight: 700; color: #1a1a1a; text-align: right;">$${formatCLP(totalAmount)}</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;">Abono pagado (50%)</td><td style="padding: 6px 0; font-weight: 700; color: #00ADEF; text-align: right;">$${formatCLP(amountPaid || 0)}</td></tr>
                            ${pendingAmount > 0 ? `<tr><td style="padding: 8px 0; border-top: 1px solid #e5e5e5; color: #64748b;">Saldo pendiente</td><td style="padding: 8px 0; border-top: 1px solid #e5e5e5; font-weight: 700; text-align: right; color: #1a1a1a;">$${formatCLP(pendingAmount)}</td></tr>` : ''}
                        </table>
                        ${pendingAmount > 0 ? `<p style="font-size: 12px; color: #64748b; margin: 12px 0 0 0;">* El saldo pendiente se paga al momento del check-in.</p>` : ''}
                    </div>
                    ` : ''}

                    <div style="background: #f5f5f5; padding: 20px 24px; border-radius: 12px; margin: 0 0 28px 0; border: 1px solid #e5e5e5;">
                        <h4 style="margin: 0 0 12px 0; color: #00ADEF; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">Horarios</h4>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tr><td style="padding: 6px 0; color: #64748b; width: 45%;">Check-in</td><td style="padding: 6px 0; font-weight: 600;">A partir de las 16:00 hrs</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;">Check-out</td><td style="padding: 6px 0; font-weight: 600;">Hasta las 12:00 hrs</td></tr>
                        </table>
                        <p style="font-size: 12px; color: #64748b; margin: 10px 0 0 0;">
                            Revisa nuestras <a href="https://domostreepod.cl/terminos" style="color: #00ADEF; text-decoration: underline;">políticas de cancelación y condiciones</a>.
                        </p>
                    </div>

                    <h3 style="font-size: 17px; margin: 0 0 8px 0; color: #1e293b;">Cómo llegar</h3>
                    <p style="line-height: 1.6; color: #555; font-size: 14px; margin: 0 0 20px 0;">Sigue esta ruta directa en Google Maps para llegar sin problemas a nuestro acceso:</p>
                    <div style="text-align: center; margin: 0 0 28px 0;">
                        <a href="${googleMapsLink}" style="color: #fff; background-color: #00ADEF; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 14px;">Ver Ubicación en Maps</a>
                    </div>

                    <div style="text-align: center; margin: 28px 0 0 0;">
                        <p style="font-size: 14px; color: #555; margin: 0 0 16px 0;">¿Tienes preguntas? Escríbenos por WhatsApp:</p>
                        <a href="https://wa.me/56984643307" style="color: #fff; background-color: #25D366; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 14px;">WhatsApp +56 9 8464 3307</a>
                    </div>
                </div>

                <div style="background: #00ADEF; padding: 28px 24px; text-align: center; border-radius: 0 0 12px 12px;">
                    <p style="margin: 0 0 16px 0;">
                        <a href="https://instagram.com/domostreepod" style="text-decoration: none; margin: 0 8px; color: #ffffff; font-size: 13px;">Instagram</a>
                        <span style="color: rgba(255,255,255,0.4);">|</span>
                        <a href="https://facebook.com/domostreepod" style="text-decoration: none; margin: 0 8px; color: #ffffff; font-size: 13px;">Facebook</a>
                        <span style="color: rgba(255,255,255,0.4);">|</span>
                        <a href="https://domostreepod.cl" style="text-decoration: none; margin: 0 8px; color: #ffffff; font-size: 13px;">Web</a>
                    </p>
                    <p style="font-size: 11px; color: rgba(255,255,255,0.8); margin: 0 0 8px 0;">Glamping Domos TreePod · Valle Las Trancas, Km 72 · Pinto, Chile</p>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
                        <img src="https://domostreepod.cl/images/branding/sello-sernatur-sin-fecha.png" alt="Sello SERNATUR" style="width: 50px; height: auto; margin-bottom: 6px;" />
                        <p style="font-size: 10px; color: rgba(255,255,255,0.7); margin: 0;">Registro SERNATUR N° 36806</p>
                    </div>
                </div>
            </div>
        `
      });

      // 2. Correo de Alerta al Administrador
      const adminEmail = 'janetsep@gmail.com';
      await resend.emails.send({
        from: 'Glamping Domos TreePod <info@domostreepod.cl>',
        to: [adminEmail],
        subject: `NUEVA RESERVA WEB - ${guestName}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #00ADEF 0%, #008CBF 100%); padding: 24px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <img src="https://domostreepod.cl/images/branding/logo-white.png" alt="TreePod" style="width: 100px; height: auto; margin-bottom: 12px;" />
              <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Nueva Reserva via Webpay</h2>
            </div>
            <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              ${shortId ? `<div style="background: #f0f9ff; border-radius: 8px; padding: 12px; margin-bottom: 16px; text-align: center;"><span style="font-size: 12px; color: #64748b;">CÓDIGO</span><br/><span style="font-size: 22px; font-weight: bold; color: #00ADEF; font-family: monospace;">#${shortId.toUpperCase()}</span></div>` : ''}
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #64748b; width: 40%;">Huésped</td><td style="padding: 8px 0; font-weight: 600;">${guestName}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Email</td><td style="padding: 8px 0;">${to}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Fechas</td><td style="padding: 8px 0; font-weight: 600;">${bookingDates}</td></tr>
                <tr><td style="padding: 8px 0; color: #64748b;">Personas</td><td style="padding: 8px 0;">${guestsCount || 1}</td></tr>
                ${extras && extras.length > 0 ? `<tr><td style="padding: 8px 0; color: #64748b;">Extras</td><td style="padding: 8px 0;">${extras.join(', ')}</td></tr>` : ''}
                ${totalAmount ? `<tr><td style="padding: 8px 0; color: #64748b;">Total</td><td style="padding: 8px 0; font-weight: 600;">$${formatCLP(totalAmount)}</td></tr>` : ''}
                ${amountPaid ? `<tr><td style="padding: 8px 0; color: #16a34a;">Pagado</td><td style="padding: 8px 0; font-weight: 700; color: #16a34a;">$${formatCLP(amountPaid)}</td></tr>` : ''}
                ${pendingAmount > 0 ? `<tr><td style="padding: 8px 0; color: #ea580c;">Saldo pendiente</td><td style="padding: 8px 0; font-weight: 700; color: #ea580c;">$${formatCLP(pendingAmount)}</td></tr>` : ''}
              </table>
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://domostreepod.cl/admin" style="background: #00ADEF; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">Ver en Panel Admin</a>
              </div>
            </div>
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
    const adminEmail = 'janetsep@gmail.com';

    try {
      await resend.emails.send({
        from: 'Glamping Domos TreePod <info@domostreepod.cl>',
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
    } catch (error: any) {
      console.error('🔥 Error enviando notificación de contacto:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        details: error
      });
      return { success: false, error: error.message };
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
        from: 'TreePod <info@domostreepod.cl>',
        to: [recipient],
        subject: 'Tu Guía de Retiro en la Montaña + Regalo Especial',
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
                <h3 style="color: #00ADEF; margin-top: 0;">Tu Regalo de Bienvenida</h3>
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
  },

  /**
   * Envía notificación de reserva creada desde el admin, con ICS para el calendario
   */
  async sendAdminManualReservationNotification(data: {
    guestName: string;
    guestEmail: string;
    domoNombre: string;
    fechaInicio: string;
    fechaFin: string;
    adultos: number;
    total: number;
    montoPagado: number;
    estado: string;
    fuente: string;
    reservaId: string;
    adminEmail: string;
    sendGuestEmail: boolean;
    extras?: string[];
  }) {
    const adminTo = 'janetsep@gmail.com';
    const shortId = data.reservaId.slice(0, 8).toUpperCase();

    // Formatear fechas para mostrar
    const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const fechaInicioLabel = fmt(data.fechaInicio);
    const fechaFinLabel = fmt(data.fechaFin);

    // Calcular noches
    const msPerDay = 86400000;
    const noches = Math.round((new Date(data.fechaFin).getTime() - new Date(data.fechaInicio).getTime()) / msPerDay);

    // Generar ICS
    const icsDate = (d: string) => d.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TreePod Glamping//Admin//ES',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${icsDate(data.fechaInicio)}`,
      `DTEND;VALUE=DATE:${icsDate(data.fechaFin)}`,
      `SUMMARY:Reserva ${data.domoNombre} - ${data.guestName}`,
      `DESCRIPTION:Huésped: ${data.guestName}\\nEmail: ${data.guestEmail}\\nCódigo: #${shortId}\\nAdultos: ${data.adultos}\\nTotal: $${data.total.toLocaleString('es-CL')}\\nPagado: $${data.montoPagado.toLocaleString('es-CL')}\\nFuente: ${data.fuente}${data.extras && data.extras.length > 0 ? `\\nExtras: ${data.extras.join(', ')}` : ''}`,
      `LOCATION:Valle Las Trancas\\, Km 72\\, Región del Ñuble\\, Chile`,
      `UID:treepod-${data.reservaId}@domostreepod.cl`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const icsBase64 = Buffer.from(icsContent).toString('base64');

    const estadoLabel: Record<string, string> = {
      pagado: 'Pagado Total',
      confirmado: 'Confirmado',
      pendiente_pago: 'Abono Pendiente',
      pendiente: 'Pendiente',
      cancelada: 'Cancelada',
      bloqueado: 'Bloqueo Técnico',
    };

    try {
      // Email al admin con ICS
      await resend.emails.send({
        from: 'TreePod Admin <info@domostreepod.cl>',
        to: [adminTo],
        subject: `Nueva Reserva Manual: ${data.guestName} - ${data.domoNombre}`,
        attachments: [{ filename: `reserva-${shortId}.ics`, content: icsBase64 }],
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 24px 20px 16px;">
              <img src="https://domostreepod.cl/images/branding/logo-white.png" alt="TreePod" style="width: 120px; height: auto; margin-bottom: 16px;" />
            </div>
            <div style="background: #00ADEF; padding: 24px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 22px;">Nueva Reserva Creada</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 13px;">Creada manualmente desde el panel de administración</p>
            </div>
            <div style="padding: 30px 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 12px 12px;">
              <div style="background: #f9f9f9; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Código</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #00ADEF; font-family: monospace;">#${shortId}</p>
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 8px 0; color: #666; width: 40%;">Domo</td><td style="padding: 8px 0; font-weight: bold;">${data.domoNombre}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Huésped</td><td style="padding: 8px 0; font-weight: bold;">${data.guestName}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${data.guestEmail || '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Check-in</td><td style="padding: 8px 0; font-weight: bold;">${fechaInicioLabel}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Check-out</td><td style="padding: 8px 0; font-weight: bold;">${fechaFinLabel}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Noches</td><td style="padding: 8px 0;">${noches}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Adultos</td><td style="padding: 8px 0;">${data.adultos}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Total</td><td style="padding: 8px 0; font-weight: bold;">$${data.total.toLocaleString('es-CL')}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Pagado</td><td style="padding: 8px 0; color: #16a34a; font-weight: bold;">$${data.montoPagado.toLocaleString('es-CL')}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Estado</td><td style="padding: 8px 0;">${estadoLabel[data.estado] || data.estado}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Fuente</td><td style="padding: 8px 0;">${data.fuente}</td></tr>
              </table>
              <div style="background: #e0f7fa; border-radius: 8px; padding: 14px; margin-top: 20px; font-size: 13px; color: #006064;">
                Se adjunta un archivo <strong>.ics</strong> — ábrelo para agregar esta reserva a tu calendario de Google, Apple o Outlook.
              </div>
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://domostreepod.cl/admin" style="background: #1a1a1a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">Ver en Panel Admin</a>
              </div>
            </div>
          </div>
        `
      });

      // Email al huésped (si tiene email y se pidió enviarlo)
      if (data.sendGuestEmail && data.guestEmail && data.guestEmail.includes('@')) {
        await resend.emails.send({
          from: 'Glamping Domos TreePod <info@domostreepod.cl>',
          to: [data.guestEmail],
          subject: `¡Tu reserva en TreePod está confirmada! #${shortId}`,
          html: `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 30px 20px;">
                <img src="https://domostreepod.cl/images/branding/logo-white.png" alt="TreePod" style="width: 120px; height: auto; margin-bottom: 20px;" />
                <h1 style="color: #00ADEF; font-size: 20px; margin: 0;">¡Reserva Confirmada!</h1>
                <p style="color: #666; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 6px;">Glamping Domos TreePod · Valle Las Trancas</p>
              </div>
              <div style="padding: 0 20px 30px;">
                <p>Hola <strong>${data.guestName}</strong>,</p>
                <p>Nos alegra confirmar tu reserva en nuestro glamping. Aquí tienes el resumen:</p>
                <div style="background: #f9f9f9; border-radius: 12px; padding: 24px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>Código de Reserva:</strong> <span style="color: #00ADEF; font-family: monospace; font-size: 18px;">#${shortId}</span></p>
                  <p style="margin: 0 0 10px 0;"><strong>Domo:</strong> ${data.domoNombre}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Check-in:</strong> ${fechaInicioLabel}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Check-out:</strong> ${fechaFinLabel}</p>
                  <p style="margin: 0 0 10px 0;"><strong>Huéspedes:</strong> ${data.adultos} ${data.adultos === 1 ? 'persona' : 'personas'}</p>
                  ${data.extras && data.extras.length > 0 ? `
                  <p style="margin: 10px 0 0 0;"><strong>Servicios adicionales:</strong></p>
                  <ul style="margin: 5px 0 0 0; padding-left: 20px; font-size: 14px; color: #555;">
                    ${data.extras.map(ex => `<li>${ex}</li>`).join('')}
                  </ul>` : ''}
                </div>
                <p>Si tienes alguna consulta, puedes contactarnos por WhatsApp o responder este correo.</p>
                <p style="margin-top: 30px;">¡Nos vemos pronto en la montaña!<br/><strong>El equipo de TreePod</strong></p>
              </div>
              <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #999;">
                © ${new Date().getFullYear()} TreePod Glamping · Valle Las Trancas, Chile
              </div>
            </div>
          `
        });
      }

      console.log(`📧 Notificación de reserva manual enviada al admin y al huésped.`);
      return { success: true };
    } catch (error: any) {
      console.error('🔥 Error enviando notificación de reserva manual:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Envía alerta de seguridad al administrador
   */
  async sendSecurityAlert(type: string, data: { email: string, details?: any }) {
    const adminEmail = 'janetsep@gmail.com';
    try {
      await resend.emails.send({
        from: 'TreePod Security <info@domostreepod.cl>',
        to: [adminEmail],
        subject: `ALERTA DE SEGURIDAD: ${type}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #ef4444; padding: 30px 20px; text-align: center; color: white;">
               <h1 style="margin: 0; font-size: 24px;">Alerta de Seguridad</h1>
               <p style="margin-top: 5px; opacity: 0.9;">Actividad sospechosa detectada</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <p>Se ha detectado un evento que requiere su atención:</p>
              
              <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin-top: 0;"><strong>Tipo de Evento:</strong> ${type}</p>
                <p><strong>Email Relacionado:</strong> ${data.email}</p>
                <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString('es-CL')}</p>
              </div>

              ${data.details ? `
                <p><strong>Detalles adicionales:</strong></p>
                <pre style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 13px; overflow-x: auto;">${JSON.stringify(data.details, null, 2)}</pre>
              ` : ''}

              <div style="margin-top: 30px; text-align: center;">
                <a href="https://domostreepod.cl/admin" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Acceder al Panel Admin</a>
              </div>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 11px; color: #999;">
              Este es un mensaje automático del sistema de monitoreo de Glamping TreePod.
            </div>
          </div>
        `
      });
      console.log(`📧 Alerta de seguridad "${type}" enviada a ${adminEmail}`);
      return { success: true };
    } catch (error: any) {
      console.error('🔥 Error enviando alerta de seguridad:', error);
      return { success: false, error: error.message };
    }
  }
};
