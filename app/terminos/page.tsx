import React from 'react';

export const metadata = {
    title: 'Términos y Condiciones | TreePod',
    description: 'Políticas de reserva, cancelación y convivencia de TreePod, tu glamping en Valle Las Trancas.',
};

export default function TerminosPage() {
    return (
        <main className="bg-surface-light font-sans text-text-main min-h-screen pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="text-primary text-[11px] font-black tracking-[0.3em] uppercase mb-4 block bg-primary/10 w-fit mx-auto px-4 py-1.5 rounded-full">Legal</span>
                    <h1 className="h1-display pt-2"><span className="italic-display">Términos y</span> Condiciones</h1>
                </div>

                <div className="prose prose-lg mx-auto bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-black/5 animate-fade-in text-text-sub">
                    <p className="lead font-bold text-text-main">
                        Al realizar una reserva en TreePod, aceptas las siguientes condiciones establecidas para asegurar el orden, respeto ambiental y correcto funcionamiento de nuestros servicios.
                    </p>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">1. Política de Reserva y Pago</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Confirmación de Reserva:</strong> Una reserva solo se considera <strong>confirmada una vez procesado y verificado el 100% del pago</strong> asociado. El envío de formularios, correos de intención, solicitudes vía WhatsApp o inicios de pago fallidos NO garantizan ni bloquean fechas en nuestro calendario.</li>
                        <li><strong>Medios de Pago:</strong> Aceptamos pagos mediante Transbank/Webpay y Transferencia Electrónica. </li>
                        <li><strong>Tarifas:</strong> Los valores indicados en la web están sujetos a modificación sin previo aviso. Sin embargo, para reservas confirmadas, se respetará íntegramente el valor acordado al momento del pago exitoso correspondiente a esa estadía.</li>
                    </ul>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">2. Política de Cancelación y Modificación</h2>
                    <p>Comprendemos que los planes pueden cambiar, sin embargo nuestras políticas protegen la disponibilidad limitada de nuestros domos.</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Cancelaciones por parte del huésped:</strong> Con más de 15 días de antelación al check-in, se reembolsará o permitirá reprogramar según el contacto directo y las condiciones contratadas. Cancelaciones dentro de los 14 días previos o "No-Show" no aplican para devolución. El detalle final estará visible en tu comprobante de reserva de acuerdo a cada tarifa.</li>
                        <li><strong>Rebaja de noches:</strong> Cuentan como cancelación sobre esas noches en específico.</li>
                        <li><strong>Casos de fuerza mayor:</strong> Te pedimos contactarnos a través de los canales oficiales. Evaluaremos cada solicitud bajo nuestra exclusiva consideración y política interna.</li>
                    </ul>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">3. Horarios y Estadía</h2>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li><strong>Check-in:</strong> Desde las 15:00 hrs. de la fecha de llegada. Por favor avisa si estimas llegar más tarde para coordinar acceso.</li>
                        <li><strong>Check-out:</strong> Hasta las 11:00 hrs. de la fecha de salida. El recargo por "Late Check-out" sin autorización previa tendrá cobro adicional.</li>
                    </ul>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">4. Respeto por el Espacio y Convivencia</h2>
                    <p>TreePod es un entorno inserto en la naturaleza, enfocado en el descanso respetuoso del entorno.</p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>Te pedimos mantener un volumen de voz y música acorde a un ambiente sereno. Especialmente en las noches (a partir de las 22:00 hrs), debes velar por no alterar el descanso de los demás ni afectar la fauna local circundante con estruendos excesivos.</li>
                        <li>El cuidado estructural y limpieza interior moderada del domo es de responsabilidad del huésped durante su estadía. Todo cobro por rotura, daño o destrucción de implementos e infraestructura por dolo o descuido inexcusable recaerá sobre el titular de la reserva.</li>
                        <li>En relación al consumo, te instamos a promover prácticas sostenibles del uso del agua y la energía, recordando que estamos en un entorno cordillerano.</li>
                    </ul>

                    <h2 className="text-text-main font-display font-bold mt-10 mb-4 text-2xl">5. Exención de Responsabilidad y Riesgos Naturales</h2>
                    <p>
                        TreePod se ubica en plena montaña de Valle Las Trancas, zona expuesta a las variables intrínsecas del clima silvestre (ej. nevazones, temporales, cortes repentinos del suministro de la red pública general).
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>TreePod no se hace responsable por accidentes, caídas o situaciones físicas provocadas por factores inherentes a la actividad al aire libre. Todos los huéspedes asumen la condición agreste que rodea temporalmente las pasarelas o el bosque nativo. El actuar responsable y seguro es tu escudo principal.</li>
                        <li>En caso de pérdida de pertenencias personales, te sugerimos cerrar apropiadamente tu domo al salir de excursión, puesto que no podemos responsabilizarnos de eventualidades por descuido humano comprobable en el entorno del predio.</li>
                    </ul>

                    <div className="bg-surface-light/50 p-6 rounded-2xl border border-black/5 mt-6 font-bold text-text-main">
                        <p className="mb-2">¿Tienes alguna duda sobre nuestras condiciones?</p>
                        <p>Escríbenos y estaremos dispuestos a ayudarte y aclarar cada detalle a través de <strong>info@domostreepod.cl</strong></p>
                    </div>

                    <p className="text-sm mt-12 text-text-sub/70">
                        Última actualización: Marzo 2026.
                    </p>
                </div>
            </div>
        </main>
    );
}
