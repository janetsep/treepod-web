import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import TrackView from '../../components/TrackView';
import SectionFolio from '../../components/SectionFolio';
import TriBullet from '../../components/deco/TriBullet';
import GeoDivider from '../../components/deco/GeoDivider';
import { btnPrimaryDark, linkLineDark, btnPrimary, linkLine } from '../../components/deco/cta';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// publishDate viene como 'YYYY-MM-DD'. new Date('YYYY-MM-DD') la interpreta como
// medianoche UTC: en un servidor/navegador con huso horario detrás de UTC (Chile,
// UTC-4) muestra el día anterior. Construimos la fecha local con sus componentes.
function formatFechaPublicacion(dateString: string) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Lista simple de artículos disponibles. Solo los que tienen contenido escrito:
// los demás quedaban como "Artículo en Desarrollo" (404) y no deben indexarse.
const availableArticles = [
    'que-hacer-valle-las-trancas-por-temporada',
    'como-llegar-valle-las-trancas-desde-santiago',
    'historia-valle-las-trancas-volcan-termas-pincheira',
    'senderos-cascadas-valle-las-trancas',
    'termas-chillan-por-el-dia-desde-las-trancas',
    'cueva-de-los-pincheira-visita',
    'carpintero-negro-bosque-las-trancas',
    'diguenes-hongo-bosque-las-trancas',
    'ananuca-flor-roja-bosque-las-trancas',
    'lupinos-verano-las-trancas',
    'glamping-invierno-chile-las-trancas',
    'escapada-romantica-glamping-chile'
];

const articleContent: Record<string, any> = {
    'que-hacer-valle-las-trancas-por-temporada': {
        title: 'Qué Hacer en Valle Las Trancas por Temporada',
        excerpt: 'Guía general de actividades en Valle Las Trancas según la época del año.',
        metaDescription: 'Qué hacer en Valle Las Trancas en cada temporada: ski en Nevados de Chillán, termas, trekking y colores de otoño. Planifica tu visita y reserva tu domo.',
        image: '/images/Galeria/Las Trancas Bosque Nativo.jpeg',
        content: `
Valle Las Trancas, en plena cordillera de la Región de Ñuble, ofrece experiencias muy distintas según la temporada. Esta guía te ayuda a elegir cuándo venir según lo que buscas vivir.

## Invierno (junio a septiembre)

### Ski y snowboard en Nevados de Chillán
A 8 km del valle se encuentra el centro de ski **Nevados de Chillán**, con pistas para todos los niveles, escuela de ski y arriendo de equipos. La temporada parte usualmente en junio y se extiende hasta septiembre, dependiendo de las condiciones de nieve.

### Termas de Chillán
Las **Termas de Chillán** ofrecen piscinas termales rodeadas de cordillera. Es un panorama relajante después de un día en la nieve, y especialmente atractivo en invierno.

### Otros panoramas
- Caminatas suaves por senderos cercanos al valle (consultar condiciones de nieve antes de salir)
- Restaurantes locales con cocina de montaña
- Fotografía de paisajes nevados

## Primavera (septiembre a diciembre)

### Trekking y caminatas
La nieve empieza a retirarse y se abren los senderos por el bosque nativo. Hay varias rutas en la zona — recomendamos consultar con tu hospedaje o **Sernatur Ñuble** sobre los senderos abiertos según la fecha de tu visita.

### Flora y fauna
La primavera trae floración de especies nativas y mayor actividad de aves. Es buena época para fotografía de naturaleza.

## Verano (diciembre a marzo)

### Río Renegado y entorno
El **Río Renegado** atraviesa la zona y ofrece paisajes preciosos para caminatas y fotografía. Algunas pozas son aptas para refrescarse.

### Mountain bike y ciclismo
Existen circuitos de mountain bike en el área de Nevados de Chillán durante temporada de verano.

### Camping y caminatas
Días largos y temperaturas agradables para recorrer el valle a pie.

## Otoño (marzo a junio)

### Espectáculo de colores
El bosque nativo se llena de tonos rojos, dorados y ocres. Es la temporada favorita de fotógrafos y de quienes buscan tranquilidad: hay menos visitantes y los paisajes están en su mejor momento.

### Descanso junto a la estufa
Las noches frescas son perfectas para un asado con la parrilla en tu domo o un libro junto a la estufa. La tinaja al aire libre es un servicio de temporada: consúltanos si estará disponible en la fecha de tu visita.

## Resumen rápido

| Buscas... | Mejor temporada |
|---|---|
| Ski y nieve | Julio – agosto |
| Trekking sin nieve | Diciembre – marzo |
| Termas | Todo el año |
| Fotografía y colores | Marzo – mayo |
| Tranquilidad y poco turismo | Mayo – junio |

> **Nota:** Las actividades, precios y operadores cambian según la temporada y el operador. Te recomendamos verificar disponibilidad con cada centro (Nevados de Chillán, Termas de Chillán, etc.) antes de tu viaje.

---

¿Listo para venir? Conoce nuestros [domos en Las Trancas](/glamping-valle-las-trancas) y reserva directo: pagas el 50% de abono y el saldo en el check-in.
`,
        category: 'Guías',
        readTime: '4 min',
        publishDate: '2026-04-15'
    },
    'como-llegar-valle-las-trancas-desde-santiago': {
        title: 'Cómo Llegar a Valle Las Trancas desde Santiago',
        excerpt: 'Las opciones más comunes para llegar a Valle Las Trancas desde Santiago y otras ciudades.',
        metaDescription: 'Cómo llegar a Valle Las Trancas desde Santiago: en auto, bus o avión, con tiempos, rutas y consejos. Planifica tu viaje y reserva tu domo en TreePod.',
        image: '/images/Galeria/Las Trancas Bosque Nativo 2.jpeg',
        content: `
Valle Las Trancas se ubica en la Región de Ñuble, a unos 72 km al oriente de la ciudad de **Chillán**. La forma más común de llegar es por carretera. Aquí están las alternativas principales.

## En auto (la más cómoda)

### Ruta general desde Santiago
- **Distancia aproximada:** 480 km
- **Tiempo estimado:** entre 6 y 7 horas, dependiendo del tráfico
- **Ruta:** Santiago → Ruta 5 Sur hasta Chillán → Ruta N-55 hasta Valle Las Trancas

### Tramos
1. **Santiago a Chillán:** ~5 horas por la Ruta 5 Sur (autopista con peajes)
2. **Chillán a Valle Las Trancas:** ~1 hora a 1 hora 15 por la Ruta N-55 (camino pavimentado)

### Antes de viajar
- **Combustible:** hay bencineras en el camino (Pinto, Recinto), pero conviene salir de Chillán con tanque lleno por seguridad
- **Peajes:** suman varios miles de pesos en la Ruta 5 Sur — los valores cambian, consulta el sitio del **Ministerio de Obras Públicas** o las concesionarias antes del viaje
- **Neumáticos en buen estado:** especialmente importante en invierno
- **Cadenas:** pueden ser exigidas en invierno cuando hay nieve en la ruta hacia Nevados

## En tren

EFE opera trenes **Santiago–Chillán** desde Estación Central, con varias salidas al día y un viaje de alrededor de 4 horas y media. Es la opción más cómoda de transporte público: horarios y tarifas en [efe.cl](https://www.efe.cl). Desde la estación de Chillán, sigue con transfer, bus rural o auto arrendado hasta el valle.

## En bus

Las líneas que cubren la ruta Santiago–Chillán incluyen **Tur Bus**, **Pullman Bus** y **Buses Bío Bío**, entre otras. Los horarios y precios varían según día y temporada — consulta en pasajebus.com o directamente en cada empresa.

Una vez en Chillán, las opciones para llegar a Valle Las Trancas son:
- **Buses rurales** con frecuencia limitada (generalmente algunas salidas al día)
- **Transfer privado** o radiotaxi (precio sujeto a temporada)
- **Auto arrendado** desde Chillán

> **Tip:** En Las Trancas no hay servicio de Uber ni taxis disponibles las 24 horas, así que es buena idea coordinar el transfer de vuelta con anticipación.

## En avión + auto

Si vienes desde el norte y quieres ahorrar horas de manejo:

- **Vuelo a Concepción:** operado por Sky, JetSmart y LATAM. Alrededor de 1 hora de vuelo desde Santiago. Precios y disponibilidad varían — consulta directo en cada aerolínea.
- **Desde Concepción a Valle Las Trancas:** ~3 horas en auto vía Chillán

Hay servicios de arriendo de auto en el aeropuerto de Concepción.

## Una vez en TreePod

Te enviaremos las **instrucciones detalladas de cómo llegar al domo** una vez confirmes tu reserva. Tienes acceso a estacionamiento privado dentro del recinto. Si aún no eliges dónde alojar, mira nuestros [domos en Las Trancas](/glamping-valle-las-trancas).

---

> **Nota:** los tiempos, precios y servicios mencionados son referenciales y pueden cambiar. Recomendamos verificar valores actualizados con cada operador (peajes, buses, aerolíneas) antes de tu viaje.

[Reserva tu estadía →](/disponibilidad)
`,
        category: 'Logística',
        readTime: '4 min',
        publishDate: '2026-04-12'
    },
    'historia-valle-las-trancas-volcan-termas-pincheira': {
        title: 'Historia del Valle Las Trancas: Volcán, Termas y Pincheira',
        excerpt: 'El volcán, las termas y los hermanos Pincheira: tres historias que se cruzan en el camino a tu domo.',
        metaDescription: 'Historia del Valle Las Trancas: el complejo volcánico Nevados de Chillán, la fama de sus termas desde 1869 y la Cueva de los Pincheira en el km 67.',
        image: '/images/real/NOdomoaereo5.jpeg',
        content: `
El Valle Las Trancas no es solo bosque y nieve. Está construido sobre tres capas de historia: un volcán que lleva cientos de miles de años activo, aguas calientes famosas desde hace más de 150 años, y una banda de hermanos que resistió aquí el final de un imperio. Esta es la historia del camino que recorres para llegar a tu domo.

## Un volcán que no es un volcán

Los Nevados de Chillán que ves desde el valle no son un solo volcán: son un **complejo volcánico con 17 centros de emisión** alineados, agrupados en dos zonas (Cerro Blanco al noroeste y Las Termas al sureste). Llevan unos 650.000 años de actividad y su punto más alto marca 3.212 metros.

El volcán ha escrito su propia historia. Entre 1861 y 1865 una erupción formó el cono Santa Gertrudis y generó grandes lahares —flujos de barro por deshielo— hacia el norte. En 1906 comenzó el ciclo que formó el llamado Volcán Nuevo, y entre 1973 y 1986 nació el Volcán Arrau. El ciclo más reciente fue entre 2016 y 2018.

Hoy SERNAGEOMIN lo monitorea todos los días. Puedes revisar el estado actual del complejo en [sernageomin.cl](https://rnvv.sernageomin.cl/complejo-volcanico-nevados-de-chillan/).

## Las aguas que hicieron famoso al Chillán

El mismo calor del volcán calienta agua bajo la cordillera: pozos de exploración geotérmica midieron 198 °C a solo 240 metros de profundidad, y unos 220 °C a un kilómetro. Las termas que hoy visitas son la cara visible de ese sistema.

La fama de estas aguas es antigua. Crónicas coloniales del siglo XVII ya las mencionaban, y las fuentes históricas señalan que los pueblos originarios fueron los primeros en usarlas. En 1869 ya circulaba la tercera edición de un libro médico dedicado por completo a ellas: *Baños de la cordillera: estudios médicos sobre las aguas termales del Chillán*, del doctor Pelegrín Martín. Con los hoteles termales de fines del siglo XIX y la promoción de Ferrocarriles del Estado en los años 30, las termas se convirtieron en un clásico del turismo chileno.

## Los Pincheira: la última resistencia

Entre 1819 y 1832, en plena Guerra a Muerte, los hermanos Juan Antonio, Santos, Pablo y José Antonio Pincheira —originarios de la zona de Parral— lideraron una montonera leal a la Corona española. Operaron entre Chillán, la cordillera de Ñuble y el otro lado de los Andes, y saquearon ciudades como Chillán, Linares, San Carlos y Parral en la década de 1820.

Fueron el último foco realista de Sudamérica. Su historia terminó la madrugada del 14 de enero de 1832, cuando el general Manuel Bulnes los derrotó en las lagunas de Epulafquen, en el actual Neuquén. José Antonio, el último líder, se rindió en Chillán dos meses después, fue indultado y murió anciano, décadas más tarde, trabajando en su hacienda.

## La cueva que puedes visitar hoy

En el km 67 del camino Chillán–Termas —el mismo que te trae a TreePod, en el km 72— está la **Cueva de los Pincheira**: un alero rocoso de origen volcánico junto a una cascada y un estero. La tradición local la señala como refugio de la banda en la década de 1820.

Hoy es un paseo familiar: senderos con flora nativa señalizada, un antiguo molino de agua, la cascada y, en temporada alta, recreaciones teatrales de la vida de los Pincheira. Según la leyenda local, junto a la cascada aparece de noche una mula blanca que indica dónde quedaron enterrados los tesoros de la banda.

## Cómo conocer todo esto desde TreePod

Un itinerario simple de un día:

1. **Mañana:** Cueva de los Pincheira (km 67, a minutos del domo)
2. **Mediodía:** almuerzo en los restaurantes del valle
3. **Tarde:** termas o, en invierno, nieve en Nevados de Chillán
4. **Noche:** de vuelta al domo, bajo el cielo estrellado del valle

Valle Las Trancas está a unos 70 km de Chillán por la Ruta N-55. Si quieres armar tu visita según la época del año, revisa nuestra [guía por temporada](/blog/que-hacer-valle-las-trancas-por-temporada).

[Reserva tu domo →](/disponibilidad)

---

### Fuentes

- SERNAGEOMIN, Red Nacional de Vigilancia Volcánica: [Complejo Volcánico Nevados de Chillán](https://rnvv.sernageomin.cl/complejo-volcanico-nevados-de-chillan/)
- Memoria Chilena: [Pelegrín Martín, "Baños de la cordillera" (1869)](https://www.memoriachilena.gob.cl/602/w3-printer-349923.html)
- Memoria Chilena: [Las termas en Chile](https://www.memoriachilena.gob.cl/602/w3-article-543971.html)
- Wikipedia: [Batalla de las lagunas de Epulafquen](https://es.wikipedia.org/wiki/Batalla_de_las_lagunas_de_Epulafquen)
- trancas.cl: [Cueva de los Pincheira](https://trancas.cl/cueva-de-los-pincheira/)
`,
        category: 'Historia',
        readTime: '6 min',
        publishDate: '2026-07-06'
    },
    'senderos-cascadas-valle-las-trancas': {
        title: 'Senderos y Cascadas del Valle Las Trancas',
        excerpt: 'Las caminatas del valle: desde la cascada más fácil hasta los trekkings de montaña, todas a minutos de tu domo.',
        metaDescription: 'Senderos y cascadas en Valle Las Trancas: Velo de la Novia, Shangri-La, Garganta del Diablo y Laguna del Huemul. Rutas para familias y montañistas.',
        image: '/images/Galeria/IMG_8992.JPG',
        content: `
El Valle Las Trancas es un punto de partida, no solo un lugar donde dormir. Según el mapa turístico del valle hay **más de 20 rutas de trekking** entre cascadas, saltos, cuevas y miradores. Aquí van las más conocidas, ordenadas de la más fácil a la más exigente.

## Cascada Velo de la Novia: para todas las edades

También llamada **Cascada del Soldado**, es la ruta más corta y accesible de todo el valle. Sirve para familias con niños y para quienes prefieren caminar poco: en un rato estás frente a la caída de agua, rodeado de bosque.

Es la caminata ideal para el día de llegada o para una mañana tranquila antes del check-out.

## Mirador Valle Las Trancas: el valle a tus pies

Un sendero corto que sube hasta una vista panorámica del valle completo. Es de los más populares en las aplicaciones de trekking. Buena luz para fotos en la tarde.

## Valle de Shangri-La: bosque e historia

Una caminata que llega hasta las ruinas del **refugio Shangri-La, construido en los años 20**, cuando era parada de montañistas y esquiadores. Hoy es un paseo gratuito entre bosque nativo, con el encanto de las ruinas de piedra como destino.

## Garganta del Diablo: bosque de lengas

Una ruta de unas **3 horas** que atraviesa un bosque de lengas, robles y ñirres hasta el sector del antiguo refugio de 1937. Exigencia media: se disfruta con calzado de trekking y agua.

## Laguna del Huemul: el clásico de montaña

El trekking más buscado del valle. Es una ruta de montaña de mayor exigencia, con recompensa: una laguna cordillerana rodeada de roca y nieve buena parte del año. Antes de subir, consulta el estado del sendero según la época — en invierno la nieve puede cubrir la ruta.

## Más rutas para explorar

- **Salto Los Pellines** — caída de agua entre bosque
- **Cascada Las Turbinas** — otra cascada clásica del valle
- **Gruta Los Pangues** — formación rocosa entre vegetación nativa
- **Cueva de los Pincheira** (km 67) — historia y leyenda a minutos del valle: te la contamos en [este artículo](/blog/historia-valle-las-trancas-volcan-termas-pincheira)

## Consejos antes de salir

- **Temporada:** de primavera a otoño los senderos están despejados; en invierno varios quedan bajo nieve. Pregúntanos por el estado antes de salir.
- **Agua y abrigo:** el clima de cordillera cambia rápido, incluso en verano.
- **Avisa** a alguien tu ruta si vas a un sendero largo.
- **Basura de vuelta:** el bosque nativo se cuida entre todos.

Si quieres armar el panorama completo según la época del año, revisa nuestra [guía por temporada](/blog/que-hacer-valle-las-trancas-por-temporada). Y si aún no tienes dónde quedarte, los domos están en el km 72, en medio de este mismo bosque.

[Reserva tu domo →](/disponibilidad)

---

### Fuentes

- trancas.cl: [Rutas de trekking y senderismo](https://trancas.cl/rutas-baja-media-intensidad/), [Valle de Shangri-La](https://trancas.cl/valle-de-shangrila/), [Cascada Velo de la Novia](https://trancas.cl/la-cascada-velo-de-la-novia/)
- PTI Turismo Valle Las Trancas: [Garganta del Diablo](https://www.turismovallelastrancas.com/atractivos/garganta-del-diablo/)
- AllTrails: [Sendero Mirador Valle Las Trancas](https://www.alltrails.com/trail/chile/bio-bio/sendero-mirador-valle-las-trancas)
`,
        category: 'Guías',
        readTime: '5 min',
        publishDate: '2026-07-06'
    },
    'termas-chillan-por-el-dia-desde-las-trancas': {
        title: 'Termas de Chillán por el Día desde Valle Las Trancas',
        excerpt: 'Cómo ir a las termas por el día desde el valle: cuándo conviene, qué llevar y dónde ver las entradas vigentes.',
        metaDescription: 'Termas de Chillán por el día desde Valle Las Trancas: a minutos en auto, qué llevar, cuándo ir y dónde revisar precios y horarios actualizados.',
        image: '/images/wellness/Tinaja1.jpg',
        content: `
Ir a las termas es el panorama clásico del valle, y desde Las Trancas se hace fácil por el día: las piscinas termales están a unos **12 minutos en auto**, subiendo por la misma Ruta N-55.

## Por qué hay termas aquí

El agua caliente no es casualidad: las termas son la cara visible del sistema geotermal del complejo volcánico Nevados de Chillán. Pozos de exploración midieron hasta 220 °C bajo la cordillera. Si te interesa esa historia —y la de los libros médicos que hicieron famosas estas aguas desde 1869—, la contamos completa en [este artículo](/blog/historia-valle-las-trancas-volcan-termas-pincheira).

## Cómo funciona ir por el día

- **Desde el valle:** subes en auto por la Ruta N-55 hasta el sector de las termas. En invierno revisa el estado de la ruta y lleva cadenas.
- **Cuándo conviene:** en invierno, la combinación clásica es mañana de nieve y tarde de termas. En primavera y verano, las piscinas al aire libre se disfrutan con la cordillera a la vista y menos gente.
- **Cuánto tiempo:** medio día alcanza para las piscinas; el día completo da para sumar almuerzo en la montaña.

## Precios y horarios: dónde verlos

Los valores de entrada y los horarios **cambian según temporada** (alta de invierno, fines de semana, verano). Para no darte un dato vencido, revísalos siempre en el canal oficial:

- [Sitio oficial de Nevados de Chillán](https://www.nevadosdechillan.com) — entradas y horarios de las piscinas termales
- [Guía del valle en trancas.cl](https://trancas.cl) — panoramas termales del sector

Si estás alojando con nosotros, pregúntanos por WhatsApp y te orientamos según la fecha de tu visita.

## Qué llevar

- Traje de baño y toalla
- Sandalias o hawaianas (el suelo puede estar caliente o mojado)
- Agua para hidratarte: el agua termal y la altura deshidratan
- Bloqueador y gorro en días de sol; gorro de lana en invierno (la cabeza afuera, el cuerpo en el agua caliente)
- Bolsa para el traje mojado

## Termas con niños

Las piscinas termales del sector reciben familias. Los niños suelen aguantar menos tiempo en el agua caliente: planifica pausas y considera ir más temprano, cuando hay menos público.

## El plan completo

Termas + una caminata corta como la [Cascada Velo de la Novia](/blog/senderos-cascadas-valle-las-trancas) + cena en los restaurantes del valle: ese es un día redondo en Las Trancas. Y a la vuelta, tu domo cálido en el bosque.

[Reserva tu domo →](/disponibilidad)
`,
        category: 'Termas',
        readTime: '4 min',
        publishDate: '2026-07-06'
    },
    'cueva-de-los-pincheira-visita': {
        title: 'Cueva de los Pincheira: Cómo Llegar y Qué Ver',
        excerpt: 'La visita a la cueva del km 67: cómo llegar, qué hay en el recorrido y dónde confirmar la entrada.',
        metaDescription: 'Cueva de los Pincheira en Pinto, Ñuble: cómo llegar desde Chillán y Valle Las Trancas, qué ver en el recorrido, la leyenda de la mula blanca y dónde ver la entrada.',
        image: '/images/Galeria/Las Trancas Bosque Nativo.jpeg',
        content: `
En el **km 67 del camino Chillán–Termas** (Ruta N-55, comuna de Pinto) está uno de los paseos con más historia de Ñuble: la Cueva de los Pincheira, un alero rocoso de origen volcánico junto a una cascada y un estero, que la tradición local señala como refugio de los hermanos Pincheira en la década de 1820.

## Cómo llegar

- **Desde Chillán:** por la Ruta N-55 hacia las termas, aproximadamente una hora de viaje. La cueva está señalizada en el km 67, con estacionamiento.
- **Desde Valle Las Trancas:** está a solo 5 km bajando el valle — unos minutos en auto desde los domos.

## Qué hay en la visita

- El **alero rocoso** (la "cueva") junto a la cascada y el estero
- **Senderos con flora nativa señalizada**, para recorrer con calma
- Un **antiguo molino de agua**
- En **temporada alta**, recreaciones teatrales de la vida de la banda: montoneros a caballo incluidos

Es un paseo familiar, de baja exigencia, que se hace en un par de horas.

## Entrada y horarios

El recinto cobra una entrada que se paga en el lugar. Los valores y horarios **cambian por temporada**, así que confírmalos antes de ir:

- [Ficha de la cueva en trancas.cl](https://trancas.cl/cueva-de-los-pincheira/)
- [Guía Ñuble](https://guianuble.cl/sitios/cueva-de-los-pincheira/)

Consejo: lleva **efectivo**, como en muchos atractivos rurales de la zona.

## La historia y la leyenda

Los hermanos Pincheira fueron el último foco realista de Sudamérica: resistieron entre 1819 y 1832 en esta cordillera. La historia completa —con el volcán y las termas incluidos— la contamos en [Historia del Valle Las Trancas](/blog/historia-valle-las-trancas-volcan-termas-pincheira).

Y según la leyenda local, junto a la cascada aparece de noche una **mula blanca** que indica dónde quedaron enterrados los tesoros de la banda. Nadie los ha encontrado. Todavía.

## El plan redondo

Cueva por la mañana, almuerzo en el valle y termas por la tarde: un día completo de historia, bosque y agua caliente, durmiendo a minutos de todo.

[Reserva tu domo →](/disponibilidad)
`,
        category: 'Guías',
        readTime: '4 min',
        publishDate: '2026-07-06'
    },
    'carpintero-negro-bosque-las-trancas': {
        title: 'Una Pareja de Carpintero Negro en el Bosque de TreePod',
        excerpt: 'Filmamos algo poco común: una pareja de carpintero negro y, entre ellos, al macho alimentando a la hembra. Qué es esta ave, por qué una pareja importa tanto y cómo reconocerla.',
        metaDescription: 'Pareja de carpintero negro (Campephilus magellanicus) en el bosque nativo de Valle Las Trancas: el macho alimenta a la hembra, una escena de cortejo rara de filmar. Qué es el ave, por qué indica un bosque sano y cómo reconocer al macho y a la hembra. Video real.',
        image: '/images/Galeria/Las Trancas Bosque Nativo.jpeg',
        video: '/videos/carpintero-negro.mp4',
        videoPoster: '/images/blog/carpintero-poster.jpg',
        videoCaption: 'Pareja de carpintero negro: el macho (cabeza roja) y la hembra (penacho negro). Bosque de TreePod, Valle Las Trancas',
        content: `
Una mañana, entre los robles de nuestro bosque, aparecieron dos: una **pareja de carpintero negro**. Alcanzamos a grabarlos, y en el video quedó una escena poco común de ver y más difícil aún de filmar: el **macho dándole de comer a la hembra**. No es un ave cualquiera, y no es una imagen cualquiera.

## Quién es

El **carpintero negro** (*Campephilus magellanicus*) es el **carpintero más grande de Sudamérica**: mide alrededor de 40 centímetros. Vive solo en los bosques templados del sur de Chile y Argentina, y es una especie protegida.

Macho y hembra se distinguen a simple vista:

- El **macho** tiene toda la cabeza de un **rojo intenso**, con el cuerpo negro brillante.
- La **hembra** es negra, con un **penacho curvado** hacia adelante y un poco de rojo solo en la base del pico.

En el video están los dos: el de la cabeza roja es el macho; la del penacho negro que se inclina hacia él es la hembra.

## Lo raro: el macho alimentando a la hembra

Lo que se ve en el video —el macho pasándole alimento a la hembra pico a pico— es **alimentación de cortejo**. Es parte del vínculo de pareja de estas aves y de la época de reproducción. No es fácil de presenciar y menos de grabar, porque son aves esquivas que se mueven alto entre los árboles.

Que ocurra aquí dice dos cosas: que hay una **pareja establecida** y que el bosque les da lo que necesitan para quedarse.

## Por qué una pareja importa tanto

El carpintero negro no vive en cualquier parte: necesita **bosque nativo maduro**, con árboles grandes y troncos viejos donde encontrar las larvas de las que se alimenta y donde excavar sus nidos. Por eso los especialistas lo consideran un **indicador de bosque sano**: donde hay carpintero negro, hay un ecosistema que funciona.

Y una **pareja** es una señal todavía más fuerte que un individuo solo: significa que el bosque no es solo un lugar de paso, sino un sitio donde estas aves pueden vivir y criar. Que estén entre nuestros árboles es la consecuencia de estar insertos en el bosque nativo del Valle Las Trancas —dominado por el **roble** (*Nothofagus obliqua*)— y de cuidarlo.

## No son los únicos que viven en estos árboles

En los mismos robles donde trabajan los carpinteros brota otro habitante del bosque en primavera: el **digüeñe**, el hongo comestible que los antiguos llamaban "pan de indio". Le dedicamos su propia nota: [Los digüeñes, el hongo del bosque de TreePod](/blog/diguenes-hongo-bosque-las-trancas).

## Cómo reconocer al carpintero cuando estés aquí

- **El sonido primero:** su golpeteo fuerte y pausado en los troncos se escucha antes de verlo.
- **Mira hacia arriba:** suele trabajar en los troncos altos y las ramas gruesas.
- **La mancha roja:** contra el verde del bosque, la cabeza del macho es inconfundible; la hembra, más discreta, lleva el penacho negro curvado.
- **Paciencia y silencio:** si lo escuchas, acércate despacio y sin ruido.

No podemos prometerte que los verás —son aves silvestres y libres, van y vienen—, pero están por aquí. Y parte de la gracia de dormir en el bosque es justamente eso: nunca sabes qué vas a encontrar al abrir la cortina.

## Un bosque que vale la pena cuidar

Ver una pareja de carpintero negro es un recordatorio de por qué hacemos las cosas como las hacemos: menos intervención, más bosque. Si te interesa la naturaleza del valle, te va a gustar nuestra [guía de senderos y cascadas](/blog/senderos-cascadas-valle-las-trancas).

[Reserva tu domo en el bosque →](/disponibilidad)

---

### Sobre la especie

- Nombre científico: *Campephilus magellanicus*. Nombres comunes: carpintero negro, carpintero magallánico.
- Distribución: bosques templados de Chile y Argentina. Especie protegida en Chile.
- Referencia: [Aves de Chile](https://www.avesdechile.cl), Ministerio del Medio Ambiente.
`,
        category: 'Naturaleza',
        readTime: '4 min',
        publishDate: '2026-07-06'
    },
    'diguenes-hongo-bosque-las-trancas': {
        title: 'Los Digüeñes: el Hongo Comestible del Bosque de TreePod',
        excerpt: 'Racimos anaranjados que brotan en los robles del bosque en primavera. Qué son los digüeñes, cómo se comen y por qué crecen justo donde están los domos.',
        metaDescription: 'Los digüeñes (Cyttaria espinosae), el "pan de indio": hongo comestible que crece en los robles del bosque nativo de Valle Las Trancas. Qué son, cómo se comen y cuándo salen. Fotos reales en TreePod.',
        image: '/images/blog/diguenes-domo.jpg',
        imageAspect: '4 / 3',
        content: `
Si vienes a TreePod en primavera y miras las ramas de los robles, quizás los veas: unos racimos de bolitas color crema que cuelgan de los árboles. Son **digüeñes**, uno de los tesoros del bosque nativo del sur de Chile. Y sí, se comen.

## Qué son

El **digüeñe** (*Cyttaria espinosae*), también llamado **dihueñe** o **"pan de indio"**, es un hongo comestible que crece exclusivamente en los bosques de *Nothofagus* del centro-sur de Chile y Argentina. En nuestro bosque brota sobre el **roble** (*Nothofagus obliqua*), el árbol dominante del Valle Las Trancas.

Su relación con el roble es antiquísima: el hongo y el árbol han evolucionado juntos durante millones de años. El digüeñe forma unos nudos o abultamientos en las ramas, y de ahí brotan sus bolitas —crema con puntitos anaranjados— entre la primavera y comienzos del verano. Es un parásito suave: no mata al árbol.

![Primer plano de un digüeñe en la rama, en el bosque de TreePod](/images/blog/diguene-fruto.jpg)

*Un digüeñe de cerca: bolitas color crema con poros anaranjados. Cuelgan de las ramas del roble en primavera.*

## Cómo se comen

El digüeñe es parte de la **cocina tradicional del sur de Chile** desde tiempos de los pueblos originarios. Se come **crudo**, y su textura es gelatinosa y su sabor suave, apenas dulzón. La forma más típica es en **ensalada de digüeñes**: cortados, con cebolla, cilantro, sal y limón.

Como todo hongo silvestre, la regla de oro es simple: **solo se recolecta y se come lo que se conoce con certeza**. Si estás con nosotros y ves digüeñes en temporada, pregúntanos.

## Cuándo salen

Los digüeñes son de **primavera** (aproximadamente septiembre a noviembre, según el año y la altura). Es una ventana corta: brotan, maduran y caen en pocas semanas. Verlos es una de esas cosas que solo pasan si estás en el bosque en el momento justo.

## Por qué crecen donde están los domos

Los digüeñes no salen en cualquier bosque: necesitan robles nativos sanos. Que broten entre nuestros árboles —a metros de los domos— es una señal más de que el bosque del Valle Las Trancas está vivo. Es el mismo bosque donde también aparece el [carpintero negro](/blog/carpintero-negro-bosque-las-trancas), otra especie que solo vive donde el *Nothofagus* está bien.

Dormir aquí es dormir dentro de ese bosque. Los digüeñes son solo uno de sus regalos de temporada.

[Reserva tu domo en el bosque →](/disponibilidad)

---

### Sobre la especie

- Nombre científico: *Cyttaria espinosae*. Nombres comunes: digüeñe, dihueñe, pan de indio.
- Hospedero: roble (*Nothofagus obliqua*) y otros *Nothofagus* del centro-sur. En el coigüe crece un pariente, el "llao llao".
- Temporada: primavera a inicios de verano.
`,
        category: 'Naturaleza',
        readTime: '3 min',
        publishDate: '2026-07-07'
    },
    'ananuca-flor-roja-bosque-las-trancas': {
        title: 'La Añañuca: la Flor del Verano en el Bosque de TreePod',
        excerpt: 'En verano, entre los árboles, brotan del suelo unas flores en forma de estrella: las añañucas. Qué son, de qué colores vienen, cuándo aparecen y la leyenda que les dio el nombre.',
        metaDescription: 'La añañuca, flor roja nativa de Chile que brota en verano en el bosque de Valle Las Trancas (Nevados de Chillán). Qué es, cuándo florece y la leyenda de la Añañuca. Fotos reales en TreePod.',
        image: '/images/blog/ananuca-flor.jpg',
        imageAspect: '3 / 2',
        content: `
Un día de verano, entre los árboles del bosque, aparecen de la nada: unas flores rojas en forma de estrella que brotan directamente del suelo, sin apenas hojas. Son **añañucas**, una de las flores más queridas de Chile, y por unas semanas encienden de rojo el suelo del bosque.

## Qué es la añañuca

La **añañuca** es una flor bulbosa nativa de Chile, de la familia de las amarilis (parientes de esa flor). Bajo el nombre "añañuca" se agrupan varias especies —de los géneros *Rhodophiala* y *Phycella*—, desde el norte hasta la cordillera del sur. En la zona de los **Nevados de Chillán**, donde estamos, la añañuca es una de las cientos de especies del bosque nativo.

Lo más característico es su ritmo: florece en **pleno verano**, sobre un tallo desnudo. Y después, tan rápido como apareció, se retira: la parte de arriba se seca y la planta sobrevive bajo tierra como un **bulbo**, esperando el próximo verano para volver a brotar.

Aunque la más conocida es la roja, la añañuca **no es solo roja**: según la especie va del rojo intenso al **rosado, el salmón y casi el blanco**. En un mismo sector del bosque puedes encontrar más de un tono.

![La añañuca completa, brotando del suelo del bosque de TreePod](/images/blog/ananuca-planta.jpg)

*La añañuca brota directamente del suelo, con su tallo desnudo y sus flores en estrella.*

![Una añañuca de tono más claro, casi salmón](/images/blog/ananuca-clara.jpg)

*No todas son rojas: esta variante más clara, casi salmón, en el mismo bosque.*

## La leyenda de la Añañuca

Su nombre viene de una de las leyendas más conocidas de Chile. Cuenta la historia —originaria del **norte del país**— que Añañuca era una joven muy hermosa que se enamoró de un forastero. Él partió y no volvió, y ella murió de pena esperándolo. Al día siguiente, su tumba amaneció cubierta de flores rojas. Desde entonces, esas flores llevan su nombre.

Es una leyenda del norte, pero la flor tiene parientes a lo largo de todo Chile, incluida nuestra cordillera. Verlas florecer en el bosque es una de esas pequeñas sorpresas del verano.

## Cuándo y dónde verlas

Las añañucas son flores de **verano**: aparecen por unas pocas semanas y luego desaparecen. Si vienes en esa temporada, mantén los ojos en el suelo del bosque: brotan entre la hojarasca, a veces solas, a veces en pequeños grupos.

Como todo en el bosque nativo, no las cortes ni las arranques: su gracia es justamente verlas donde crecen. Son parte del mismo bosque vivo donde también aparecen el [carpintero negro](/blog/carpintero-negro-bosque-las-trancas) y los [digüeñes](/blog/diguenes-hongo-bosque-las-trancas).

[Reserva tu domo en el bosque →](/disponibilidad)

---

### Sobre la especie

- "Añañuca" es el nombre común de varias flores bulbosas nativas (géneros *Rhodophiala* y *Phycella*, familia Amaryllidaceae).
- En los Nevados de Chillán crecen especies cordilleranas de añañuca, entre las más de 600 plantas del bosque nativo.
- Floración: verano. Luego sobrevive como bulbo bajo tierra.
`,
        category: 'Naturaleza',
        readTime: '3 min',
        publishDate: '2026-07-07'
    },
    'glamping-invierno-chile-las-trancas': {
        title: 'Glamping en Invierno en Chile: Despertar en un Domo con Nieve',
        excerpt: 'Cómo es pasar el invierno en un domo geodésico en Las Trancas: calefacción automática, camas tibias y la nieve a 12 minutos.',
        metaDescription: 'Glamping en invierno en Chile: domos geodésicos calefaccionados en Valle Las Trancas, a 12 minutos de Nevados de Chillán. Qué incluye, cómo llegar con nieve y qué llevar.',
        image: '/images/Galeria/domoinvierno.jpeg',
        content: `
Hay dos formas de conocer la nieve en Chile: mirarla desde la ventana de un hotel, o dormir dentro de ella — en un domo geodésico calefaccionado, en medio de un bosque nativo nevado. Esta guía es para lo segundo.

## Por qué el invierno es la mejor temporada para el glamping

En verano el glamping es bosque, piscina y estrellas. En invierno se transforma: el domo se convierte en un refugio tibio y, cuando la nieve llega al valle, el bosque amanece blanco y el plan del día es **Nevados de Chillán**, a unos 12 minutos en auto.

Un consejo honesto antes de reservar por la nieve: la fecha y cantidad de nieve varía cada año. Antes de tu viaje revisa el parte de nieve del centro de ski o escríbenos y te contamos cómo está el valle esa semana, sin adornos.

La gracia del domo en invierno es simple: su forma geodésica distribuye el calor de manera uniforme, así que no existen las esquinas heladas de una cabaña tradicional.

## Qué se siente el invierno dentro del domo

- La estufa a pellet es **automática y funciona las 24 horas**: mantiene el domo completo temperado, de la cama al baño, sin cargar leña ni humo. Es lo que más mencionan las reseñas de invierno: "llegamos y el domo estaba calentito".
- Las panorámicas del domo dan directo al bosque: tomar el café de la mañana mirando los robles es el momento de la estadía.

## Ski, termas y el plan de cada día

- **Nevados de Chillán**: temporada usualmente de junio a septiembre. Ahí está "Tres Marías", la pista más larga de Sudamérica (13 km). Arriendo de equipos y escuela en el mismo centro.
- **Termas de Chillán**: piscinas termales de origen volcánico, un panorama perfecto para el día después del ski.
- **El valle**: restaurantes de montaña y cafeterías a minutos del glamping. Te dejamos recomendaciones al llegar.

Una aclaración honesta: nuestra **tinaja de exterior es un servicio de temporada y no opera en invierno** (vuelve en primavera). Si vienes por la combinación tinaja + nieve, escríbenos antes para confirmar fechas de temporada.

## ¿Es seguro llegar en invierno con auto?

Sí, con preparación:

1. La ruta N-55 desde Chillán está pavimentada hasta el valle.
2. Con nieve o escarcha es **obligatorio portar cadenas** — Carabineros lo fiscaliza en la subida.
3. En fines de semana de alta demanda rigen horarios de tránsito hacia el centro de ski: subida en la mañana y bajada en la tarde. Al glamping (KM 72 del valle) se llega sin ese tránsito.
4. Nuestro acceso interior de ~750 metros desde la ruta se mantiene transitable; si llegas más tarde de lo previsto, avísanos y te esperamos.

Si prefieres no manejar: tren o bus Santiago–Chillán y desde ahí bus rural o transfer al valle. Los detalles están en nuestra [guía para llegar desde Santiago](/blog/como-llegar-valle-las-trancas-desde-santiago).

## Qué incluye el domo en invierno

Cama king (y dos camas de 1 plaza en el segundo nivel), estufa a pellet automática que mantiene el domo completo temperado, baño privado, cocina equipada con cafetera Nespresso, WiFi Starlink — sí, internet de verdad en la montaña — y estacionamiento en la parcela. El desayuno con productos del valle es un adicional opcional que se coordina con horario al reservar. Check-in desde las 16:00, check-out hasta las 12:00.

## Qué llevar

- Ropa en capas y una capa exterior impermeable
- Botas o zapatos con suela para nieve
- Lentes de sol (la nieve refleja fuerte)
- Cadenas para el auto
- Traje de baño si vas a las termas

---

Reserva directo y paga solo el 50% de abono; el saldo se paga en el check-in. [Ver disponibilidad de invierno](/disponibilidad).
`,
        category: 'Guías',
        readTime: '5 min',
        publishDate: '2026-07-10'
    },
    'escapada-romantica-glamping-chile': {
        title: 'Escapada Romántica en Chile: un Domo en el Bosque para Dos',
        excerpt: 'Por qué un domo geodésico en Las Trancas le gana al hotel de siempre: cielo desde la cama, bosque privado y cero logística.',
        metaDescription: 'Escapada romántica en Chile: glamping para dos en un domo geodésico en Valle Las Trancas. Tinaja de temporada, desayuno en el bosque y cielo estrellado desde la cama.',
        image: '/images/Galeria/Domo3noche.jpeg',
        content: `
El plan romántico de siempre — hotel, cena, spa — está bien. Pero no sorprende a nadie. Si lo que buscas es un fin de semana que se recuerde, cambia la habitación por un domo geodésico en un bosque nativo de la cordillera.

## Por qué un domo y no un hotel

En un hotel, la naturaleza es el paisaje del pasillo. En el domo, es la habitación: las panorámicas dan al bosque, el techo deja pasar la luz del amanecer y en la noche —sin televisores de por medio— el plan es mirar las estrellas y escuchar el bosque.

Cada domo es un refugio privado para dos (con capacidad hasta 4): cama king, estufa a pellet automática que mantiene el domo completo temperado, baño privado y cocina equipada con cafetera Nespresso. Nadie al otro lado de la pared.

## Los momentos que hacen la escapada

- **El amanecer desde la cama**: la luz entra por la cúpula y el bosque aparece de a poco. Nadie se levanta temprano en vacaciones, hasta que amanece así.
- **La tinaja de ciprés para dos** (servicio de temporada, con reserva): agua caliente mineralizada de vertientes del río Chillán, al aire libre, rodeados de robles. No opera en invierno; en primavera y verano es el momento estrella de la estadía.
- **Desayuno en el domo** (adicional opcional): productos locales del valle servidos en tu domo, coordinando el horario al reservar.
- **El asado en el domo**: pídenos la parrilla, te la llevamos al domo y cierras el día con un asado entre los árboles.

## Qué hacer los dos días

Depende de la temporada, y esa es la gracia del valle:

- **Invierno**: Nevados de Chillán a 12 minutos (con nieve según la temporada — pregúntanos cómo está el valle) y piscinas termales.
- **Primavera y verano**: senderos y cascadas — el [Velo de la Novia, Shangri-La y la Laguna del Huemul](/blog/senderos-cascadas-valle-las-trancas) —, piscina de montaña en el glamping y atardeceres largos.
- **Otoño**: el bosque completo se pone dorado y hay menos gente. La escapada más tranquila del año.

Y para el hambre: el valle tiene una ruta gastronómica de montaña real, con restaurantes a minutos del glamping. Te recomendamos nuestros favoritos al llegar.

## Cómo funciona la reserva

Se reserva directo en el sitio pagando el 50% de abono; el saldo se paga en el check-in. Check-in desde las 16:00, check-out hasta las 12:00. Estamos a ~1 hora de Chillán y ~5 horas de Santiago por la Ruta 5 Sur ([cómo llegar, paso a paso](/blog/como-llegar-valle-las-trancas-desde-santiago)).

---

Regálense un fin de semana distinto: [ver disponibilidad para dos](/disponibilidad).
`,
        category: 'Guías',
        readTime: '4 min',
        publishDate: '2026-07-10'
    },
    'lupinos-verano-las-trancas': {
        title: 'Los Lupinos: el Morado del Verano en Las Trancas',
        excerpt: 'A fines de la primavera el valle se llena de torres moradas y rosadas: los lupinos. Son hermosos y fotogénicos, pero hay algo honesto que contar sobre ellos.',
        metaDescription: 'Los lupinos que pintan de morado el Valle Las Trancas a fines de noviembre y comienzos de diciembre: hermosos, pero una especie introducida (no nativa). Qué son, cuándo florecen y por qué lo contamos.',
        image: '/images/blog/lupinos-domo.jpg',
        imageAspect: '3 / 2',
        video: '/videos/lupinos.mp4',
        videoPoster: '/images/blog/lupinos-poster.jpg',
        videoCaption: 'Los lupinos en flor en el bosque de TreePod, a fines de la primavera.',
        videoLandscape: true,
        videoPosition: 'end',
        content: `
A fines de la primavera pasa algo con el valle: entre los árboles y a orillas de los caminos brotan unas **torres de flores moradas y rosadas** que llegan casi a la altura de una persona. Son los **lupinos**, y por unas pocas semanas —más o menos entre **fines de noviembre y la primera quincena de diciembre**— pintan el bosque de color. Son de las flores más fotografiadas de Las Trancas, y aquí crecen justo alrededor de los domos y el invernadero.

Pero antes de enamorarte del todo, hay algo honesto que queremos contarte.

## No son nativos (y lo decimos)

Aunque parezcan parte de siempre del paisaje, los grandes lupinos morados **no son una planta nativa de Chile**. Son *Lupinus polyphyllus*, originarios de Norteamérica, que se introdujeron como planta ornamental y se **naturalizaron** en el sur. De hecho, están catalogados como una **especie invasora** en los bosques del centro-sur, porque pueden desplazar a la flora nativa.

Te lo contamos por una razón simple: cuando en TreePod decimos "nativo" —como con el [carpintero negro](/blog/carpintero-negro-bosque-las-trancas), los [digüeñes](/blog/diguenes-hongo-bosque-las-trancas) o la [añañuca](/blog/ananuca-flor-roja-bosque-las-trancas)— es de verdad. Y los lupinos, por hermosos que sean, no lo son.

## Hermosos igual

Nada de esto les quita lo bonitos. Los lupinos son leguminosas (parientes lejanos de las arvejas), y florecen a **fines de la primavera** en tonos que van del morado profundo al rosado y, a veces, al blanco. Con el sol de la tarde, sus torres encendidas entre el verde del bosque son una postal.

Si vienes a fines de noviembre o comienzos de diciembre, los vas a ver por todas partes. Míralos, fotografíalos, disfrútalos. Solo que ahora sabes su historia completa: son visitantes que se quedaron, no habitantes originales del bosque.

[Reserva tu domo en el bosque →](/disponibilidad)

---

### Sobre la especie

- Nombre científico: *Lupinus polyphyllus*. Familia Fabaceae (leguminosas).
- Origen: Norteamérica. Introducida y naturalizada en el sur de Chile y Argentina; catalogada como especie invasora en los bosques del centro-sur.
- Floración: fines de la primavera (aprox. fines de noviembre a la primera quincena de diciembre en Las Trancas).
`,
        category: 'Naturaleza',
        readTime: '3 min',
        publishDate: '2026-07-07'
    }
    // Agregar más artículos según necesidad
};

export async function generateStaticParams() {
    return availableArticles.map((slug) => ({
        slug: slug,
    }));
}

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const article = articleContent[slug];
    if (!article) return {};
    return {
        // Sufijo corto "| TreePod": con "| Blog TreePod" el title de
        // como-llegar-... superaba los 60 caracteres y Google lo truncaba.
        title: `${article.title} | TreePod`,
        description: article.metaDescription ?? article.excerpt,
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: article.title,
            description: article.metaDescription ?? article.excerpt,
            images: [article.image],
            type: 'article',
            locale: 'es_CL',
        },
        // Sin este bloque, el artículo hereda el twitter:* del layout de /blog
        // (título e imagen del listado) y al compartir en X se ve la card equivocada.
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.metaDescription ?? article.excerpt,
            images: [article.image],
        },
    };
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;

    if (!availableArticles.includes(slug)) {
        notFound();
    }

    const article = articleContent[slug];

    // Si el artículo no tiene contenido desarrollado, mostrar placeholder
    if (!article) {
        return (
            <div className="bg-[#F7F3EC] text-[#1E1B16] font-sans min-h-screen">
                <TrackView eventName="view_blog_post_placeholder" params={{ slug }} />

                <section className="py-24 md:py-32">
                    <div className="mx-auto max-w-[720px] px-5 md:px-10">
                        <div className="bg-white rounded-[2px] border border-[#1E1B16]/12 border-t-4 border-t-[#00ADEF] p-8 md:p-12">
                            <p className="dato text-[#5B5348] mb-5">Editorial TreePod</p>
                            <h1 className="display-md text-[#1E1B16] mb-5">
                                Artículo en Desarrollo
                            </h1>
                            <p className="text-[#5B5348] leading-relaxed mb-8">
                                Este artículo está siendo escrito por nuestro equipo.
                                Vuelve pronto para leer el contenido completo.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
                                <Link href="/disponibilidad" className={btnPrimary}>
                                    Reservar estadía
                                </Link>
                                <Link href="/blog" className={`${linkLine} !text-sm`}>
                                    Volver al blog <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // JSON-LD BlogPosting con datos ya presentes en articleContent: describe el
    // artículo (titular, fecha, imagen) que el LodgingBusiness global no cubre.
    const blogPostingJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.metaDescription ?? article.excerpt,
        "image": `https://domostreepod.cl${encodeURI(article.image)}`,
        "datePublished": article.publishDate,
        "inLanguage": "es-CL",
        "mainEntityOfPage": `https://domostreepod.cl/blog/${slug}`,
        "author": { "@type": "Organization", "name": "TreePod Glamping", "url": "https://domostreepod.cl" },
        "publisher": {
            "@type": "Organization",
            "name": "TreePod Glamping",
            "logo": { "@type": "ImageObject", "url": "https://domostreepod.cl/icon-192.png" },
        },
    };

    return (
        <div className="bg-white text-text-main min-h-screen">
            <TrackView eventName="view_blog_post" params={{ slug }} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
            />

            {/* Cabecera editorial KM 72: folio + filete, titular a la izquierda */}
            <section className="pt-32 pb-10 bg-white">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Bitácora" label={article.category} note={`${article.readTime} de lectura`} />

                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6">
                        <div className="col-span-12 lg:col-span-9">
                            <h1 className="display-lg text-[#1E1B16]">
                                {article.title}
                            </h1>
                            <p className="lead text-[#5B5348] mt-6 max-w-2xl font-display italic">
                                {article.excerpt}
                            </p>
                            <p className="mt-8 flex items-center gap-2 dato text-[#5B5348]">
                                <TriBullet className="w-2 h-1.5 text-[#00ADEF] shrink-0" />
                                {formatFechaPublicacion(article.publishDate)} · TreePod Editorial
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOTO DE APERTURA con pie de foto editorial */}
            <section className="relative w-full">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <figure>
                        <div
                            className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden rounded-[2px]"
                            style={article.imageAspect ? { aspectRatio: article.imageAspect } : undefined}
                        >
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                priority
                                className="object-cover"
                                style={{ objectPosition: article.imagePosition || 'center' }}
                                sizes="100vw"
                            />
                        </div>
                        <figcaption className="mt-2 flex items-center gap-2">
                            <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                            <span className="caption-editorial">Valle Las Trancas, Ñuble</span>
                        </figcaption>
                    </figure>
                </div>
            </section>

            {/* VIDEO — arriba por defecto (reel/landscape). Con videoPosition:'end' va tras el texto. */}
            {article.video && article.videoPosition !== 'end' && (
                <section className="pt-10">
                    <div className={`mx-auto ${article.videoLandscape ? 'max-w-[860px] px-5 md:px-10' : 'max-w-[420px] px-5'}`}>
                        <figure>
                            <video
                                className="w-full rounded-[2px] border border-[#1E1B16]/15 bg-[#1E1B16]"
                                controls
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                poster={article.videoPoster}
                            >
                                <source src={article.video} type="video/mp4" />
                            </video>
                            {article.videoCaption && (
                                <figcaption className="mt-2 flex items-center gap-2">
                                    <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                    <span className="caption-editorial">{article.videoCaption}</span>
                                </figcaption>
                            )}
                        </figure>
                    </div>
                </section>
            )}

            {/* CONTENIDO — narrow column editorial */}
            <article className="py-16 md:py-24">
                <div className="container mx-auto px-6 md:px-10">
                    <div className="max-w-2xl mx-auto">
                        <div className="prose prose-lg max-w-none text-text-main
                            prose-headings:font-display prose-headings:text-text-main prose-headings:tracking-tight
                            prose-h1:hidden
                            prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:font-black prose-h2:mb-6 prose-h2:mt-16 prose-h2:leading-tight
                            prose-h3:text-xl md:prose-h3:text-2xl prose-h3:font-bold prose-h3:mb-4 prose-h3:mt-10 prose-h3:text-text-main
                            prose-p:text-lg md:prose-p:text-xl prose-p:mb-7 prose-p:leading-[1.8] prose-p:text-text-main prose-p:font-normal
                            prose-p:first-of-type:first-letter:font-display prose-p:first-of-type:first-letter:text-7xl prose-p:first-of-type:first-letter:font-black prose-p:first-of-type:first-letter:float-left prose-p:first-of-type:first-letter:mr-3 prose-p:first-of-type:first-letter:mt-1 prose-p:first-of-type:first-letter:leading-[0.85] prose-p:first-of-type:first-letter:text-primary-dark
                            prose-ul:mb-8 prose-ul:list-none prose-ul:pl-0
                            prose-ol:mb-8 prose-ol:list-decimal prose-ol:pl-6
                            prose-li:mb-3 prose-li:text-lg md:prose-li:text-xl prose-li:text-text-main prose-li:leading-relaxed
                            prose-ul>li:relative prose-ul>li:pl-6 prose-ul>li:before:content-[''] prose-ul>li:before:absolute prose-ul>li:before:left-0 prose-ul>li:before:top-[0.85em] prose-ul>li:before:w-3 prose-ul>li:before:h-px prose-ul>li:before:bg-primary
                            prose-strong:text-text-main prose-strong:font-bold
                            prose-em:italic prose-em:font-display
                            prose-a:text-primary-dark prose-a:font-bold prose-a:no-underline prose-a:border-b prose-a:border-primary/40 hover:prose-a:border-primary
                            prose-blockquote:border-0 prose-blockquote:my-12 prose-blockquote:px-0 prose-blockquote:py-0
                            prose-blockquote:font-display prose-blockquote:italic prose-blockquote:text-2xl md:prose-blockquote:text-3xl prose-blockquote:font-medium prose-blockquote:text-text-main prose-blockquote:text-center prose-blockquote:leading-snug prose-blockquote:relative
                            prose-table:w-full prose-table:border-collapse prose-table:my-10
                            prose-th:border-b-2 prose-th:border-text-main/20 prose-th:p-4 prose-th:font-display prose-th:font-bold prose-th:text-left prose-th:text-base prose-th:uppercase prose-th:tracking-wide
                            prose-td:border-b prose-td:border-black/5 prose-td:p-4 prose-td:text-text-main
                            prose-hr:my-16 prose-hr:border-0 prose-hr:h-px prose-hr:bg-gradient-to-r prose-hr:from-transparent prose-hr:via-text-sub/30 prose-hr:to-transparent
                        ">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Las tablas del markdown se envuelven en un contenedor con
                                    // scroll horizontal propio: sin esto desbordan la página en móvil.
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto">
                                            <table {...props} />
                                        </div>
                                    ),
                                }}
                            >
                                {article.content}
                            </ReactMarkdown>
                        </div>

                        {/* Separador triangulado: el motivo geodésico, no la tilde curva */}
                        <div className="flex items-center gap-4 my-16" aria-hidden="true">
                            <span className="flex-1 h-px bg-[#1E1B16]/15"></span>
                            <TriBullet className="w-2.5 h-2 text-[#00ADEF] shrink-0" />
                            <span className="flex-1 h-px bg-[#1E1B16]/15"></span>
                        </div>

                        {/* DISCLAIMER — estilo editorial sutil */}
                        <div className="border-l-2 border-[#00ADEF] pl-6 py-2 my-12">
                            <p className="text-sm md:text-base text-text-sub italic font-display leading-relaxed">
                                <strong className="not-italic font-semibold text-[#1E1B16] dato block mb-2">Nota editorial</strong>
                                Los precios, horarios y disponibilidad de operadores externos cambian con frecuencia. Te recomendamos verificar valores actualizados directamente con cada operador antes de tu viaje.
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            {/* VIDEO al final (videoPosition:'end'): va tras el texto, no arriba. */}
            {article.video && article.videoPosition === 'end' && (
                <section className="pb-4 -mt-6 md:-mt-10">
                    <div className={`mx-auto ${article.videoLandscape ? 'max-w-[860px] px-5 md:px-10' : 'max-w-[420px] px-5'}`}>
                        <figure>
                            <video
                                className="w-full rounded-[2px] border border-[#1E1B16]/15 bg-[#1E1B16]"
                                controls
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                poster={article.videoPoster}
                            >
                                <source src={article.video} type="video/mp4" />
                            </video>
                            {article.videoCaption && (
                                <figcaption className="mt-2 flex items-center gap-2">
                                    <span className="w-5 h-px bg-[#00ADEF]" aria-hidden="true" />
                                    <span className="caption-editorial">{article.videoCaption}</span>
                                </figcaption>
                            )}
                        </figure>
                    </div>
                </section>
            )}

            <GeoDivider left="84%" />

            {/* CTA FINAL — banda charcoal editorial, composición asimétrica */}
            <section className="py-20 md:py-28 bg-[#1E1B16] text-[#F7F3EC]">
                <div className="mx-auto max-w-[1280px] px-5 md:px-10">
                    <SectionFolio num="Km 72" label="Tu refugio en Valle Las Trancas" dark />
                    <div className="grid grid-cols-12 gap-x-4 md:gap-x-6 gap-y-10 items-end">
                        <div className="col-span-12 lg:col-span-8">
                            <h2 className="display-lg !text-[#F7F3EC]">
                                Domos geodésicos{' '}
                                <span className="italic text-[#00ADEF]">en bosque nativo</span>
                            </h2>
                            <p className="lead text-[#F7F3EC]/80 mt-6 max-w-2xl font-display italic">
                                Calefacción a pellet las 24 horas, WiFi Starlink y tinaja privada en temporada. Reserva directa con abono del 50%.
                            </p>
                        </div>
                        <div className="col-span-12 lg:col-span-4 flex flex-col lg:items-end gap-6">
                            <Link href="/disponibilidad" className={btnPrimaryDark}>
                                Ver disponibilidad
                            </Link>
                            <Link href="/blog" className={`${linkLineDark} !text-sm`}>
                                Volver al blog <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
