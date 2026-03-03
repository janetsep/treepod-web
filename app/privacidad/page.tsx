import React from 'react';

export const metadata = {
    title: 'Política de Privacidad | TreePod',
    description: 'Información sobre cómo TreePod recopila, utiliza y protege tus datos personales.',
};

export default function PrivacidadPage() {
    return (
        <main className="bg-surface-light font-sans text-text-main min-h-screen pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase mb-4 block bg-primary/10 w-fit mx-auto px-4 py-1.5 rounded-full">Legal</span>
                    <h1 className="h1-display pt-2"><span className="italic-display">Política de</span> Privacidad</h1>
                </div>

                <div className="prose prose-lg mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-black/5 animate-fade-in text-text-sub">
                    <p className="lead font-bold text-text-main">
                        En TreePod valoramos tu confianza y estamos comprometidos con la protección de tu información personal. Esta política explica cómo recopilamos, usamos y resguardamos tus datos.
                    </p>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">1. Información que Recopilamos</h2>
                    <p>
                        Recopilamos información personal solo cuando es estrictamente necesaria para gestionar tu reserva y mejorar tu experiencia con nosotros. Esto incluye:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Datos de contacto:</strong> Nombre, apellidos, correo electrónico y número de teléfono (WhatsApp).</li>
                        <li><strong>Datos de reserva:</strong> Fechas de estadía, cantidad de huéspedes y extras seleccionados.</li>
                        <li><strong>Datos de navegación y medición (Cookies):</strong> Información anónima sobre cómo interactúas con nuestro sitio web (Google Analytics y Meta Pixel) para entender qué funciona mejor, qué te interesa y ofrecer de forma responsable contenido relevante. Promovemos una medición confiable y sin duplicados de nuestras métricas.</li>
                    </ul>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">2. Uso de tu Información</h2>
                    <p>Tus datos son utilizados única y exclusivamente para los siguientes fines:</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Procesar y confirmar reservas:</strong> Validar el estado del pago mediante Transbank/Webpay o transferencia bancaria y asegurar tu cupo.</li>
                        <li><strong>Comunicación directa:</strong> Contactarte vía WhatsApp o correo electrónico para coordinar tu llegada (check-in), enviar indicaciones, o confirmar detalles de tu alojamiento.</li>
                        <li><strong>Mejora del sitio:</strong> Entender el comportamiento de uso para optimizar la velocidad, claridad y accesibilidad de nuestro entorno digital.</li>
                        <li><strong>Publicidad y comunicaciones:</strong> Enviarte información o beneficios si decides suscribirte voluntariamente, siempre respetando tu decisión y ofreciendo opciones simples de cancelación en cualquier momento (cero SPAM).</li>
                    </ul>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">3. Protección de Medios de Pago</h2>
                    <p>
                        TreePod NO almacena datos de tarjetas de crédito o débito. Toda transacción web se realiza de manera segura mediante proveedores externos certificados (Transbank Webpay Plus), quienes manejan esta información sensible bajo los más altos estándares bancarios.
                    </p>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">4. Compartir Información</h2>
                    <p>
                        No vendemos, alquilamos ni cedemos tus datos a terceros bajo ninguna circunstancia. Solo compartimos datos si existiera un requerimiento legal por parte de las autoridades competentes.
                    </p>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">5. Tus Derechos</h2>
                    <p>
                        Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales en nuestros registros. Para ejercer estos derechos o consultar dudas sobre nuestra política, puedes escribirnos directamente a:
                    </p>
                    <div className="bg-surface-light/50 p-6 rounded-2xl border border-black/5 mt-6 font-bold text-text-main">
                        <p className="mb-2">Correo: info@domostreepod.cl</p>
                        <p>WhatsApp: +56 9 8464 3307</p>
                    </div>

                    <p className="text-sm mt-12 text-text-sub/70">
                        Última actualización: Marzo 2026. TreePod se reserva el derecho a actualizar esta política para cumplir con los estándares requeridos.
                    </p>
                </div>
            </div>
        </main>
    );
}
