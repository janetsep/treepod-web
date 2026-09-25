import React from 'react';

export const metadata = {
    title: 'Política de Privacidad | TreePod',
    description: 'Información sobre cómo TreePod recopila, utiliza y protege tus datos personales.',
    alternates: {
        canonical: '/privacidad',
    },
    // openGraph propio: sin esto la página hereda og:title y og:url del home,
    // mostrando datos equivocados al compartir el enlace.
    openGraph: {
        title: 'Política de Privacidad | TreePod',
        description: 'Información sobre cómo TreePod recopila, utiliza y protege tus datos personales.',
        url: '/privacidad',
        images: ['/images/hero/domo-treepod-camara-18-2.jpg'],
    },
};

export default function PrivacidadPage() {
    return (
        <main className="bg-surface-light font-sans text-text-main min-h-screen pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                {/* Cabecera editorial KM 72: folio + rótulo + filete, sin badge-píldora centrado */}
                <header className="mb-14 animate-fade-in-up">
                    <div className="flex items-baseline gap-4 mb-8">
                        <span className="font-display italic text-lg md:text-xl text-[#008CBF] tabular-nums" aria-hidden="true">Anexo</span>
                        <span className="font-sans font-semibold text-[11px] uppercase tracking-[0.14em] text-[#5B5348]">Legal</span>
                        <span className="flex-1 h-px self-center bg-[#1E1B16]/15" aria-hidden="true" />
                        <span className="hidden md:block font-display italic text-[12px] text-[#5B5348]/70">Valle Las Trancas · Ñuble</span>
                    </div>
                    <h1 className="h1-display"><span className="italic-display">Política de</span> Privacidad</h1>
                </header>

                <div className="prose prose-lg mx-auto bg-white p-8 md:p-12 rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] animate-fade-in text-text-sub">
                    <p className="lead font-bold text-text-main">
                        En TreePod valoramos tu confianza y estamos comprometidos con la protección de tu información personal. Esta política explica cómo recopilamos, usamos y resguardamos tus datos.
                    </p>

                    <div className="bg-surface-light/50 p-6 rounded-[2px] border border-[#1E1B16]/12 border-l-4 border-l-[#00ADEF] my-8 text-sm">
                        <p className="font-bold text-text-main mb-1">Responsable del tratamiento de datos</p>
                        <p className="mb-1"><strong>Razón social:</strong> Migryk Correa Ltda.</p>
                        <p className="mb-1"><strong>RUT:</strong> 76.286.428-2</p>
                        <p className="mb-1"><strong>Marca comercial:</strong> TreePod / Domos TreePod (domostreepod.cl)</p>
                        <p className="mb-1"><strong>Domicilio:</strong> Ruta N-55, Km 72, Valle Las Trancas, Pinto, Región de Ñuble, Chile</p>
                        <p><strong>Correo de contacto:</strong> info@domostreepod.cl</p>
                    </div>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">1. Información que Recopilamos</h2>
                    <p>
                        Recopilamos información personal solo cuando es estrictamente necesaria para gestionar tu reserva y mejorar tu experiencia con nosotros. Esto incluye:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Datos de contacto:</strong> Nombre, apellidos, correo electrónico y número de teléfono (WhatsApp).</li>
                        <li><strong>Datos de reserva:</strong> Fechas de estadía, cantidad de huéspedes y extras seleccionados.</li>
                        <li><strong>Datos de navegación y medición (Cookies):</strong> Información sobre cómo interactúas con nuestro sitio web (Google Analytics y Meta Pixel), incluidos identificadores de medición y el origen de una reserva cuando esté disponible. Esto nos permite entender qué funciona, mejorar el sitio y medir nuestras campañas de forma responsable.</li>
                        <li><strong>Datos agregados de reserva:</strong> Estadísticas no identificables sobre reservas, pagos y canal de origen —por ejemplo, sitio web, WhatsApp, Airbnb, Booking.com o CloudBeds— para comprender el desempeño comercial de TreePod.</li>
                    </ul>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">2. Uso de tu Información</h2>
                    <p>Tus datos son utilizados única y exclusivamente para los siguientes fines:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Procesar y confirmar reservas:</strong> Validar el estado del pago mediante Transbank/Webpay o transferencia bancaria y asegurar tu cupo.</li>
                        <li><strong>Comunicación directa:</strong> Contactarte vía WhatsApp o correo electrónico para coordinar tu llegada (check-in), enviar indicaciones, o confirmar detalles de tu alojamiento.</li>
                        <li><strong>Mejora del sitio:</strong> Entender el comportamiento de uso para optimizar la velocidad, claridad y accesibilidad de nuestro entorno digital.</li>
                        <li><strong>Medición publicitaria de reservas directas:</strong> Con autorización específica cuando corresponda, medir si una reserva directa pagada se relaciona con una campaña de Google o Meta. Este uso busca optimizar la publicidad para reservas reales y no vender ni perfilar públicamente a nuestros huéspedes.</li>
                        <li><strong>Publicidad y comunicaciones:</strong> Enviarte información o beneficios si decides suscribirte voluntariamente, siempre respetando tu decisión y ofreciendo opciones simples de cancelación en cualquier momento (cero SPAM).</li>
                    </ul>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">3. Protección de Medios de Pago</h2>
                    <p>
                        TreePod NO almacena datos de tarjetas de crédito o débito. Toda transacción web se realiza de manera segura mediante proveedores externos certificados (Transbank Webpay Plus), quienes manejan esta información sensible bajo los más altos estándares bancarios.
                    </p>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">4. Compartir Información y Medición Publicitaria</h2>
                    <p>
                        No vendemos ni alquilamos datos personales. Para medir la eficacia de publicidad de TreePod, y únicamente cuando exista una base válida y la autorización requerida, podemos transmitir a proveedores de medición publicitaria como Google y Meta datos de conversión limitados: el momento y valor de una reserva directa pagada, un identificador único de la operación y datos de contacto protegidos mediante cifrado de una sola vía. Estos proveedores pueden usar la información exclusivamente para medir conversiones y mejorar la atribución publicitaria de TreePod.
                    </p>
                    <p>
                        La decisión de autorizar esta medición no afecta la posibilidad de reservar ni la atención que recibes. Puedes solicitar información, oposición o retiro de autorización en cualquier momento escribiendo a info@domostreepod.cl.
                    </p>
                    <p>
                        Las reservas obtenidas por Airbnb, Booking.com, CloudBeds u otras plataformas externas se usan en forma agregada y no identificable para análisis interno de canales. TreePod no utiliza los datos personales recibidos desde esas plataformas para crear audiencias publicitarias ni los transmite a Google o Meta salvo que exista una autorización separada del huésped y que las condiciones de la plataforma lo permitan.
                    </p>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">5. Tus Derechos</h2>
                    <p>
                        Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales en nuestros registros. Para ejercer estos derechos o consultar dudas sobre nuestra política, puedes escribirnos directamente a:
                    </p>
                    <div className="bg-surface-light/50 p-6 rounded-[2px] border border-[#1E1B16]/12 border-l-4 border-l-[#00ADEF] mt-6 font-bold text-text-main">
                        <p className="mb-2">Correo: info@domostreepod.cl</p>
                        <p>WhatsApp: +56 9 8464 3307</p>
                    </div>

                    <p className="text-sm mt-12 text-text-sub/70">
                        Última actualización: Septiembre 2026. TreePod se reserva el derecho a actualizar esta política para cumplir con los estándares requeridos.
                    </p>
                </div>
            </div>
        </main>
    );
}
