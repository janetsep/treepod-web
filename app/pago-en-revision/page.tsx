import type { Metadata } from 'next';

export const metadata: Metadata = {title:'Pago en revisión | TreePod',robots:{index:false,follow:false}};

export default function PaymentReviewPage() {
  return <main className="min-h-[70vh] px-5 py-16 flex items-center justify-center">
    <section className="max-w-lg border bg-white p-6 md:p-10 space-y-5">
      <h1 className="text-3xl font-semibold">Estamos verificando tu pago</h1>
      <p>No pudimos confirmar el resultado en este momento. Si viste un cargo en tu banco, no vuelvas a pagar.</p>
      <p>Escríbenos para revisar tu reserva y la transacción. No compartas los datos de tu tarjeta.</p>
      <a className="block text-center bg-[#00aeef] text-black font-semibold px-5 py-4" href="https://wa.me/56984643307?text=Hola%20TreePod%2C%20mi%20pago%20qued%C3%B3%20en%20revisi%C3%B3n.%20Necesito%20ayuda%20para%20confirmar%20mi%20reserva.">Consultar mi pago con TreePod</a>
      <p className="text-sm text-gray-600">Esta pantalla no confirma ni rechaza un cobro. TreePod debe comprobarlo antes de pedirte otro pago.</p>
    </section>
  </main>;
}
