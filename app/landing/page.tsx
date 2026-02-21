export default function LandingPage() {
  return (
    <main>
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900">
            TreePod · Domos en Valle Las Trancas
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600">
            Comodidad y tranquilidad en la montaña.
          </p>

          <a
            href="/disponibilidad"
            className="inline-block mt-8 px-6 py-3 bg-black text-white rounded"
          >
            Ver disponibilidad
          </a>
        </div>
      </section>

      <section className="py-10 max-w-5xl mx-auto px-6">
        <div className="border rounded-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-gray-600">Valoración general</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">4.9</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Reseñas en</p>
              <p className="mt-1 text-gray-900 font-medium">
                Google · Airbnb · Booking
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-5xl mx-auto px-6">
        <h2 className="text-xl font-semibold mb-6">¿Qué incluye tu estadía?</h2>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 md:gap-x-10 text-gray-700">
          <li className="font-semibold text-gray-900">– Tinaja privada</li>
          <li>– Domo equipado</li>
          <li>– Calefacción</li>
          <li className="font-semibold text-gray-900">– Internet estable</li>
        </ul>
      </section>

      <section className="py-12 max-w-5xl mx-auto px-6">
        <h2 className="text-xl font-semibold mb-4">¿Cómo funciona la reserva?</h2>

        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Elige fechas</li>
          <li>Paga 50%</li>
          <li>Saldo al llegar</li>
        </ol>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-6 text-center">
        <p className="text-lg md:text-xl text-gray-800">
          Revisa disponibilidad y asegura tu estadía.
        </p>

        <a
          href="/disponibilidad"
          className="inline-block mt-6 px-6 py-3 bg-black text-white rounded"
        >
          Ver disponibilidad
        </a>
      </section>
    </main>
  );
}
