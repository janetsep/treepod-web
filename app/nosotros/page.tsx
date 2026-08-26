'use client';

import TrackView from '../components/TrackView';
import CinematicSection from '../components/CinematicSection';
import SectionFolio from '../components/SectionFolio';
import TriBullet from '../components/deco/TriBullet';
import GeoDivider from '../components/deco/GeoDivider';

const objetivosSociales = [
  {
    numero: "01",
    titulo: "Encadenamiento Productivo Local",
    descripcion:
      "Compramos a productores del Valle Las Trancas y Ñuble: huevos, berries, pan de masa madre y verduras frescas. El 40% de nuestros insumos gastronómicos viene de manos locales.",
  },
  {
    numero: "02",
    titulo: "Empleo Local en Temporada",
    descripcion:
      "Contratamos preferentemente a personas de Las Trancas y Recinto para los períodos de temporada alta. Cien por ciento del personal temporal es reclutado en la comunidad.",
  },
  {
    numero: "03",
    titulo: "Gastronomía y Cultura Regional",
    descripcion:
      "Nuestros desayunos destacan recetas e ingredientes de la Región de Ñuble. Preservar la cocina local es parte de la experiencia que ofrecemos a cada huésped.",
  },
  {
    numero: "04",
    titulo: "Educación Ambiental",
    descripcion:
      "Informamos a cada huésped sobre nuestras prácticas de separación de residuos, energía solar y biodiversidad del Valle. La conciencia ambiental se construye en cada estadía.",
  },
  {
    numero: "05",
    titulo: "Turismo Inclusivo",
    descripcion:
      "Trabajamos para que más familias puedan vivir la experiencia TreePod, con tarifas accesibles en temporada baja y una oferta que contempla diversas necesidades.",
  },
  {
    numero: "06",
    titulo: "Huella Ambiental Mínima",
    descripcion:
      "Operamos con energía solar, compostaje activo, separación de residuos y productos de limpieza biodegradables. Cada decisión operativa considera su impacto en el entorno.",
  },
];

const fichaLegal: Array<[string, string]> = [
  ["Razón social", "Migryk Correa Ltda."],
  ["RUT", "76.286.428-2"],
  ["Marca comercial", "TreePod / Domos TreePod"],
  ["Sitio web", "domostreepod.cl"],
  ["Domicilio", "Ruta N-55, Km 72, Valle Las Trancas, Pinto, Región de Ñuble, Chile"],
  ["Correo de contacto", "info@domostreepod.cl"],
  ["Registro SERNATUR", "N° 36805"],
];

export default function NosotrosPage() {
  return (
    <div className="bg-white text-[#1E1B16] font-sans">
      <TrackView eventName="view_nosotros" />

      {/* HERO SECTION */}
      <CinematicSection
        image="/images/real/NOdomoaereo4.jpeg"
        alt="Domos geodésicos TreePod integrados en el Valle Las Trancas"
        folio="72"
        eyebrow="Quiénes somos"
        title={<>Glamping con propósito<br className="hidden md:block" /> en el Valle Las Trancas</>}
        text="Cuatro domos rodeados de montaña, con la calidez de lo local y el compromiso de operar en armonía con la naturaleza."
        priority
        titleAs="h1"
        photoCaption="Los domos desde el aire, Valle Las Trancas"
      />

      <GeoDivider left="18%" />

      {/* MISIÓN Y VISIÓN — página de texto impreso, sin tarjetas */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionFolio num="N° 01" label="Misión y visión" />
          <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-12">
            <div className="col-span-12 md:col-span-6 lg:col-span-5 border-t-2 border-[#1E1B16] pt-6">
              <h2 className="display-md text-[#1E1B16] mb-4">
                <span className="italic">Misión</span>
              </h2>
              <p className="text-[#5B5348] leading-relaxed">
                En Domos TreePod ofrecemos alojamiento en domos geodésicos en el Valle Las Trancas,
                en la Cordillera de la Región de Ñuble, junto a los Nevados de Chillán. Trabajamos con
                un servicio cercano, cocina con productos de la zona y un compromiso real con el
                medioambiente y la comunidad de montaña que nos rodea.
              </p>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-5 lg:col-start-8 border-t-2 border-[#1E1B16] pt-6">
              <h2 className="display-md text-[#1E1B16] mb-4">
                <span className="italic">Visión</span>
              </h2>
              <p className="text-[#5B5348] leading-relaxed">
                Ser un destino de glamping sustentable en el Valle Las Trancas, donde cada visita
                acerca a las personas a la naturaleza, apoya a la comunidad cordillerana y cuida el
                patrimonio natural que nos rodea.
              </p>
            </div>
          </div>
        </div>
      </section>

      <GeoDivider left="42%" />

      {/* OBJETIVOS SOCIALES — índice numerado de revista */}
      <section className="py-16 md:py-24 bg-[#F7F3EC]">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionFolio num="N° 02" label="Nuestro compromiso" />
          <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 mb-12 md:mb-16">
            <div className="col-span-12 lg:col-span-8">
              <h2 className="display-lg text-[#1E1B16] mb-6">
                Objetivos Sociales y{" "}
                <span className="italic underline decoration-[#00ADEF] decoration-[3px] underline-offset-[6px]">
                  Ambientales
                </span>
              </h2>
              <p className="lead text-[#5B5348] max-w-2xl">
                La sustentabilidad no es un certificado: es la forma en que
                tomamos cada decisión del negocio.
              </p>
            </div>
          </div>

          <div className="border-t border-[#1E1B16]/12">
            {objetivosSociales.map((obj) => (
              <div
                key={obj.numero}
                className="border-b border-[#1E1B16]/12 py-6 grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-2 items-baseline"
              >
                <span className="col-span-2 md:col-span-1 font-display italic text-lg text-[#008CBF] tabular-nums" aria-hidden="true">
                  {obj.numero}
                </span>
                <h3 className="col-span-10 md:col-span-4 display-md text-[#1E1B16]">
                  {obj.titulo}
                </h3>
                <p className="col-span-12 md:col-span-7 text-[#5B5348] leading-relaxed">
                  {obj.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GeoDivider left="68%" />

      {/* CERTIFICACIONES */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionFolio num="N° 03" label="Certificaciones" />
          <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
            <div className="col-span-12 lg:col-span-8">
              <h2 className="display-md text-[#1E1B16] mb-5">
                Registro Activo SERNATUR · Sello Impacta Sustentable
              </h2>
              <p className="text-[#5B5348] leading-relaxed max-w-3xl">
                Operamos bajo los estándares del Servicio Nacional de Turismo de
                Chile y contamos con la certificación del Sello Impacta
                Sustentable, que valida nuestra gestión ambiental, social y
                económica de forma independiente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <GeoDivider left="86%" />

      {/* INFORMACIÓN LEGAL — tabla de leyenda con líneas punteadas */}
      <section className="py-16 md:py-24 bg-[#F7F3EC]">
        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          <SectionFolio num="N° 04" label="Información legal" />
          <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10">
            <div className="col-span-12 lg:col-span-5">
              <h2 className="display-md text-[#1E1B16] mb-5">
                Empresa propietaria de TreePod
              </h2>
              <p className="text-[#5B5348] leading-relaxed">
                <strong className="text-[#1E1B16]">TreePod</strong> (también <strong className="text-[#1E1B16]">Domos TreePod</strong>) es la marca
                comercial bajo la cual <strong className="text-[#1E1B16]">Migryk Correa Ltda.</strong> opera su servicio
                de glamping en el Valle Las Trancas. Toda reserva, contrato y comunicación
                comercial es responsabilidad de esta entidad legal.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-6 lg:col-start-7">
              <div className="border-t border-[#1E1B16]/15">
                {fichaLegal.map(([k, v]) => (
                  <div key={k} className="flex items-baseline gap-3 py-3 border-b border-[#1E1B16]/10">
                    <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0 self-center" />
                    <span className="text-[14px] font-semibold text-[#1E1B16] whitespace-nowrap">{k}</span>
                    <span className="flex-1 border-b border-dotted border-[#1E1B16]/25 min-w-6" aria-hidden="true" />
                    <span className="text-sm text-[#1E1B16] text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
