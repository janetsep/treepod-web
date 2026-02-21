import TrackedLink from "./TrackedLink";

export default function CTA() {
  return (
    <section className="py-20 text-center">
      <p className="text-xl font-semibold mb-6">
        Si buscas tranquilidad y comodidad real, TreePod puede ser para ti.
      </p>

      <TrackedLink
        href="/disponibilidad"
        className="inline-block px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-opacity-90 transition-all shadow-md"
        eventName="click_ver_disponibilidad_home"
      >
        Ver disponibilidad
      </TrackedLink>
    </section>
  );
}
