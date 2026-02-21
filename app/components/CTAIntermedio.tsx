import TrackedLink from "./TrackedLink";

export default function CTAIntermedio() {
  return (
    <section className="py-12 md:py-16 max-w-4xl mx-auto text-center px-6">
      <p className="text-lg md:text-xl text-gray-800">
        Revisa disponibilidad.
      </p>

      <TrackedLink
        href="/disponibilidad"
        className="inline-block mt-6 px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-opacity-90 transition-all shadow-md"
        eventName="click_ver_disponibilidad_home"
      >
        Ver disponibilidad
      </TrackedLink>
    </section>
  );
}
