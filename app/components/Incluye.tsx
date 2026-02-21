export default function Incluye() {
  return (
    <section className="py-12 max-w-5xl mx-auto px-6">
      <h2 className="text-xl font-semibold mb-4">¿Qué incluye tu estadía?</h2>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-8 md:gap-x-10 text-gray-700">
        <li>– Domo completamente equipado</li>
        <li>– Cama cómoda y calefacción</li>
        <li className="font-semibold text-gray-900">– Tinaja exclusiva</li>
        <li>– Cocina equipada</li>
        <li className="font-semibold text-gray-900">– Internet estable</li>
        <li>– Estacionamiento</li>
        <li className="font-semibold text-gray-900">– Quincho (Próximamente / Consultar)</li>
      </ul>
    </section>
  );
}
