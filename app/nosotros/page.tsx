'use client';

import TrackView from '../components/TrackView';

const objetivosSociales = [
  {
    numero: "01",
    titulo: "Encadenamiento Productivo Local",
    descripcion:
      "Compramos a productores del Valle Las Trancas y Ñuble: huevos, berries, pan de masa madre y verduras frescas. El 40% de nuestros insumos gastronómicos vienen de manos locales.",
    icono: "🌿",
  },
  {
    numero: "02",
    titulo: "Empleo Local en Temporada",
    descripcion:
      "Contratamos preferentemente a personas de Las Trancas y Recinto para los períodos de temporada alta. Cien por ciento del personal temporal es reclutado en la comunidad.",
    icono: "🤝",
  },
  {
    numero: "03",
    titulo: "Gastronomía y Cultura Regional",
    descripcion:
      "Nuestros desayunos destacan recetas e ingredientes de la Región de Ñuble. Preservar la cocina local es parte de la experiencia que ofrecemos a cada huésped.",
    icono: "🍳",
  },
  {
    numero: "04",
    titulo: "Educación Ambiental",
    descripcion:
      "Informamos a cada huésped sobre nuestras prácticas de separación de residuos, energía solar y biodiversidad del Valle. La conciencia ambiental se construye en cada estadía.",
    icono: "🌱",
  },
  {
    numero: "05",
    titulo: "Turismo Inclusivo",
    descripcion:
      "Trabajamos para que más familias puedan vivir la experiencia TreePod, con tarifas accesibles en temporada baja y una oferta que contempla diversas necesidades.",
    icono: "🏡",
  },
  {
    numero: "06",
    titulo: "Huella Ambiental Mínima",
    descripcion:
      "Operamos con energía solar, compostaje activo, separación de residuos y productos de limpieza biodegradables. Cada decisión operativa considera su impacto en el entorno.",
    icono: "☀️",
  },
];

export default function NosotrosPage() {
  return (
    <div className="bg-surface text-text-main transition-colors duration-300">
      <TrackView eventName="view_nosotros" />

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20"></div>

      {/* HERO SECTION */}
      <section className="py-20 md:py-28 bg-background-light">
        <div className="container mx-auto px-6 md:px-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 bg-primary/10 backdrop-blur-md border border-primary/20 px-6 py-2 rounded-full">
              <span className="text-primary text-sm font-black tracking-[0.2em] uppercase">
                Quiénes Somos
              </span>
            </div>

            <h1 className="h1-display mb-6 text-text-main leading-tight">
              Glamping con propósito en el <br />
              <span className="text-primary italic-display">Valle Las Trancas</span>
            </h1>

            <p className="text-xl text-text-sub font-bold leading-relaxed max-w-3xl mx-auto">
              Cuatro domos geodésicos rodeados de montaña, con la calidez de lo
              local y el compromiso de operar en armonía con la naturaleza.
            </p>
          </div>
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Misión */}
              <div className="bg-primary/5 rounded-[2.5rem] p-8 md:p-12 border border-primary/10">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6">
                  <span className="text-white font-black text-2xl">M</span>
                </div>
                <h2 className="h2-display text-text-main mb-6">Misión</h2>
                <p className="text-text-sub text-lg leading-relaxed">
                  Ofrecer experiencias de alojamiento únicas en domos geodésicos
                  integrados en la naturaleza del Valle Las Trancas, con
                  hospitalidad cálida, gastronomía local y operación sustentable
                  de bajo impacto ambiental. A través de cada estadía, impulsamos
                  el desarrollo económico de la comunidad del Valle y preservamos
                  el entorno natural para las generaciones futuras.
                </p>
              </div>

              {/* Visión */}
              <div className="bg-background-light rounded-[2.5rem] p-8 md:p-12 border border-black/5">
                <div className="w-16 h-16 rounded-full bg-primary-dark flex items-center justify-center mb-6">
                  <span className="text-white font-black text-2xl">V</span>
                </div>
                <h2 className="h2-display text-text-main mb-6">Visión</h2>
                <p className="text-text-sub text-lg leading-relaxed">
                  Ser el referente de glamping sustentable y turismo de impacto
                  positivo en la Región de Ñuble al año 2028, reconocidos por
                  nuestra calidad de experiencia, nuestro compromiso activo con
                  el desarrollo socioeconómico de la comunidad local y nuestra
                  gestión ambiental responsable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OBJETIVOS SOCIALES */}
      <section className="py-20 md:py-28 bg-background-light">
        <div className="container mx-auto px-6 md:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-6 bg-primary/10 backdrop-blur-md border border-primary/20 px-6 py-2 rounded-full">
                <span className="text-primary text-sm font-black tracking-[0.2em] uppercase">
                  Nuestro Compromiso
                </span>
              </div>
              <h2 className="h2-display text-text-main mb-6">
                Objetivos Sociales y Ambientales
              </h2>
              <p className="text-xl text-text-sub font-bold max-w-2xl mx-auto">
                La sustentabilidad no es un certificado: es la forma en que
                tomamos cada decisión del negocio.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {objetivosSociales.map((obj) => (
                <div
                  key={obj.numero}
                  className="bg-white rounded-[2rem] p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-black/5"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-2xl">{obj.icono}</div>
                    <div className="flex-1">
                      <span className="text-primary text-xs font-black tracking-[0.2em] uppercase block mb-2">
                        {obj.numero}
                      </span>
                      <h3 className="text-xl font-display font-bold text-text-main mb-4">
                        {obj.titulo}
                      </h3>
                    </div>
                  </div>
                  <p className="text-text-sub leading-relaxed">
                    {obj.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICACIONES */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary/5 rounded-[2.5rem] p-12 text-center border border-primary/10">
              <div className="inline-block mb-6 bg-primary/10 backdrop-blur-md border border-primary/20 px-6 py-2 rounded-full">
                <span className="text-primary text-sm font-black tracking-[0.2em] uppercase">
                  Certificaciones
                </span>
              </div>
              <h2 className="h2-display text-text-main mb-6">
                Registro Activo SERNATUR · Sello Impacta Sustentable
              </h2>
              <p className="text-text-sub text-lg leading-relaxed max-w-3xl mx-auto">
                Operamos bajo los estándares del Servicio Nacional de Turismo de
                Chile y estamos en proceso de certificación del Sello Impacta
                Sustentable, que valida nuestra gestión ambiental, social y
                económica de forma independiente.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}