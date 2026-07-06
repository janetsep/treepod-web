export default function LandingPage() {
  return (
    <main className="bg-white text-text-main">
      <section className="py-20 max-w-5xl mx-auto px-6">
        <div className="max-w-3xl">
          <h1 className="h2-display text-text-main">
            TreePod · Domos en Valle Las Trancas
          </h1>
          <p className="mt-4 text-lg md:text-xl text-text-sub">
            Domos geodésicos en bosque nativo, a minutos de las pistas de Nevados de Chillán.
          </p>

          <a
            href="/disponibilidad"
            className="inline-block mt-8 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md active:scale-95 transition-all"
          >
            Ver disponibilidad
          </a>
        </div>
      </section>

      <section className="py-10 max-w-5xl mx-auto px-6">
        <div className="bg-background-light border border-black/5 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-text-sub">Valoración general</p>
              <p className="mt-1 text-2xl font-semibold text-text-main">4,9</p>
            </div>

            <div>
              <p className="text-sm text-text-sub">Reseñas verificadas</p>
              <p className="mt-1 text-text-main font-medium">
                59 reseñas en Google
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 max-w-5xl mx-auto px-6">
        <h2 className="text-xl font-display font-semibold mb-6 text-text-main">¿Qué incluye tu estadía?</h2>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 md:gap-x-10 text-text-sub">
          <li className="font-semibold text-text-main">– Domo equipado</li>
          <li>– Calefacción a pellet</li>
          <li>– WiFi Starlink</li>
          <li className="font-semibold text-text-main">– Tinaja privada (servicio de temporada)</li>
        </ul>
      </section>

      <section className="py-12 max-w-5xl mx-auto px-6">
        <h2 className="text-xl font-display font-semibold mb-4 text-text-main">¿Cómo funciona la reserva?</h2>

        <ol className="list-decimal list-inside space-y-2 text-text-sub">
          <li>Elige tus fechas</li>
          <li>Reserva con el 50% de abono</li>
          <li>El saldo lo pagas en el check-in</li>
        </ol>
      </section>

      <section className="py-16 max-w-5xl mx-auto px-6 text-center">
        <p className="text-lg md:text-xl text-text-main">
          Revisa disponibilidad y asegura tu estadía.
        </p>

        <a
          href="/disponibilidad"
          className="inline-block mt-6 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full shadow-md active:scale-95 transition-all"
        >
          Ver disponibilidad
        </a>
      </section>
    </main>
  );
}
