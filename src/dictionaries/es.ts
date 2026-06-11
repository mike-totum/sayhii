import type { en } from "./en";

// Spanish translation. The English version is the canonical source for legal
// copy (privacy policy in particular) — the translation here is provided for
// readability and may not be authoritative for legal interpretation.
export const es: typeof en = {
  meta: {
    home: {
      title: "sayhii | Datos más profundos. Empleados más felices. Menos rotación.",
      description:
        "Información de empleados en tiempo real, en 3 segundos al día. sayhii saca a la superficie la confianza, la carga de trabajo, la seguridad psicológica, la claridad y la pertenencia, para que los líderes actúen antes de que la gente se vaya.",
    },
    notes: {
      title: "Notas del Terreno | sayhii",
      description:
        "Workforce Navigator: ideas de CIOs, líderes de RR. HH. y expertos del sector para optimizar tu estrategia frente a un equipo en constante cambio.",
    },
    blog: {
      title: "Blog | sayhii",
      description:
        "Ensayos de sayhii sobre talento, escucha y liderazgo.",
    },
    contact: {
      title: "Comienza hoy | sayhii",
      description:
        "Contacta a sayhii. hi@sayhii.io · 100 S. Clinton Ave, Rochester, NY 14604.",
    },
    privacy: {
      title: "Política de Privacidad | sayhii",
      description:
        "Cómo sayhii recopila, utiliza y protege la información personal en nuestro sitio web y aplicaciones.",
    },
  },
  nav: {
    notes: "Notas del Terreno",
    blog: "Blog",
    contact: "Contacto",
    cta: "Agenda una charla de 30 min",
    toggleMenu: "Abrir menú",
    languageLabel: "Idioma",
  },
  footer: {
    motto: "*sayhii* todos los días.",
    address: "100 S. Clinton Ave\nRochester, NY 14604",
    columns: {
      read: {
        title: "Lee",
        items: [
          { label: "Notas del Terreno", href: "/notes" },
          { label: "Blog", href: "/blog" },
        ],
      },
      connect: {
        title: "Conecta",
        items: [
          { label: "Contacto", href: "/contact" },
          { label: "hi@sayhii.io", href: "mailto:hi@sayhii.io" },
          {
            label: "LinkedIn",
            href: "https://www.linkedin.com/company/sayhii",
          },
        ],
      },
    },
    subscribe: {
      title: "Suscríbete",
      body: "Regístrate con tu correo para recibir noticias y actualizaciones. Respetamos tu privacidad.",
      placeholder: "tu@empresa.com",
      ariaEmail: "Correo electrónico",
      ariaSubmit: "Suscribirme",
    },
    copyright: "Copyright © {year} sayhii, inc. Todos los derechos reservados.",
    trademark:
      "El nombre y el logotipo de sayhii son marcas registradas y propiedad de sayhii inc.",
    privacy: "Privacidad",
  },
  home: {
    hero: {
      eyebrow: "Todo comienza con sayhii",
      greetings: [
        "hii",
        "hola",
        "bonjour",
        "ciao",
        "hallo",
        "olá",
        "hej",
        "namaste",
        "こんにちは",
        "안녕",
        "salut",
        "habari",
      ],
      title: "Datos más profundos.\n*Empleados* más felices.\nMenos rotación.",
      body: "sayhii es una plataforma de retroalimentación e información en tiempo real que ayuda a los líderes a identificar, priorizar y resolver preocupaciones de los empleados e ineficiencias operativas antes de que se conviertan en problemas sistémicos.",
      ctaPrimary: "Agenda una charla de 30 min",
      ctaSecondary: "Mira cómo funciona",
      adoption: "*90%+* de adopción diaria",
      checkin: {
        prompt:
          "Me mantienen adecuadamente al tanto de los temas importantes dentro de mi empresa",
        morePrompts: [
          "Mi carga de trabajo de esta semana se siente sostenible",
          "Sé exactamente qué quiere lograr mi equipo este trimestre",
          "Me siento cómodo planteando una inquietud a mi manager",
        ],
        agree: "De acuerdo",
        disagree: "En desacuerdo",
        skip: "Omitir",
        tryIt: "Demo en vivo: toca una",
        thanksTitle: "Eso es todo. *{s} segundos*.",
        thanksBody:
          "Ahora imagina a cada empleado, todos los días. Esa es la señal.",
        another: "Prueba otra",
      },
      v2: {
        eyebrow: "Señal del equipo, a diario",
        title: "Un millón de respuestas diminutas.\n*Una imagen clara.*",
        sub: "sayhii le hace a cada empleado una pregunta de tres segundos al día. Las respuestas suman la imagen viva más clara de la confianza, la carga y la pertenencia que tu organización haya tenido.",
        questionLabel: "La pregunta de hoy",
        timeLabel: "0:03",
        counterLabel: "respuestas esta semana",
        joined: "Tu respuesta acaba de unirse a la imagen.",
      },
      floatA: { eyebrow: "Lente", body: "*Individual*, equipo, organización" },
      floatB: {
        eyebrow: "La señal",
        body: "Confianza · Carga · Seguridad · Claridad · Pertenencia",
      },
      floatC: { eyebrow: "Confianza del equipo", body: "+4.2% este trimestre" },
      scrollCue: "Tres segundos, explicados",
    },
    tagline: {
      eyebrow: "La promesa",
      body: "Empodera a tu equipo. *Elimina* los puntos ciegos.",
    },
    stats: [
      {
        prefix: "",
        value: 90,
        suffix: "%+",
        label: "Adopción diaria",
        sub: "La gente realmente responde, porque cuesta tres segundos, no cuarenta minutos.",
      },
      {
        prefix: "",
        value: 3,
        suffix: " seg",
        label: "Al día, por empleado",
        sub: "Son 12.5 minutos al año. Menos que una sola encuesta anual.",
      },
      {
        prefix: "< ",
        value: 4,
        suffix: " hrs",
        label: "Para implementar en toda la organización",
        sub: "De tiempo técnico total. En marcha antes de tu próxima reunión general.",
      },
    ],
    how: {
      eyebrow: "Cómo funciona",
      title: "Tres segundos de entrada. *Claridad* de salida.",
      sub: "Sin encuestas que lanzar. Sin campañas que coordinar. sayhii vive dentro del día que tu gente ya tiene.",
      steps: [
        {
          time: "9:02 am",
          tag: "Cada empleado, cada día",
          title: "Una pregunta. Un toque.",
          body: "Cada persona recibe una sola pregunta adaptativa elegida para ella, no sacada de una plantilla. Responde en tres segundos y sigue con su día.",
        },
        {
          time: "9:02:03 am",
          tag: "Anónimo · agregado a partir de 5",
          title: "Las señales se actualizan en tiempo real.",
          body: "Cada respuesta afina la imagen en vivo de la confianza, la carga, la seguridad, la claridad y la pertenencia a nivel individual, de equipo y de organización.",
        },
        {
          time: "Viernes",
          tag: "Información → acción",
          title: "Los líderes actúan antes de que sea sistémico.",
          body: "sayhii convierte las señales de la semana en acciones priorizadas e informes en lenguaje claro, para que los líderes sepan exactamente dónde intervenir, y cuándo.",
        },
      ],
    },
    product: {
      eyebrow: "La plataforma",
      title: "De una respuesta de 3 segundos a la *historia completa*.",
      sub: "Signos vitales, scorecards, temas, acciones e informes trimestrales en vivo: un portal que convierte micro-señales diarias en la imagen más clara de tu equipo que hayas tenido.",
      capabilities: ["Vitales", "Scorecard", "Temas", "Acciones", "Informes"],
      mock: {
        greeting: "Buenos días, *Jamie*.",
        insightEyebrow: "La señal de esta semana · Requiere atención",
        insightTitle: "La carga de trabajo bajó −3.1%",
        insightBody:
          "Concentrado en dos equipos. Abre el tema para ver las preguntas con menor puntaje y qué líderes deberían saberlo.",
        insightCta: "Abrir tema",
        tiles: [
          { label: "Bienestar org", sub: "Estable · últimos 6 meses" },
          { label: "Compromiso", sub: "vs 6 meses anteriores" },
          { label: "Participación", sub: "Check-ins diarios" },
        ],
        actionEyebrow: "La acción de esta semana",
        actionTitle:
          "Agenda 1:1s con los dos líderes de equipo que cargan más peso",
        actionMeta: "Sugerido para ti · 20 min",
        floatCard: {
          eyebrow: "Informe trimestral",
          body: "En vivo · se escribe solo",
        },
      },
    },
    listenAgain: {
      eyebrow: "Una nota de sayhii",
      body: "Si los correos no funcionan, el problema no es la bandeja de entrada. Es cómo nos comunicamos. *sayhii* ayuda a los equipos a escuchar de nuevo.",
    },
    signals: {
      eyebrow: "Las señales",
      title: "Lo que cuesta ver suele ser lo que *más importa*.",
      sub: "sayhii transforma micro-señales diarias de 3 segundos en información clara y accionable a nivel individual, de equipo y de organización, dando a los líderes visibilidad sobre las necesidades fundamentales que en silencio dan forma al desempeño, la cultura y la retención.",
      items: [
        {
          name: "Confianza",
          desc: "¿La gente cree lo que dice el liderazgo, y dice lo que cree?",
        },
        {
          name: "Carga de trabajo",
          desc: "Quién carga demasiado en silencio, semanas antes de que se lea como burnout.",
        },
        {
          name: "Seguridad psicológica",
          desc: "Si las verdades difíciles salen en las reuniones, o en las entrevistas de salida.",
        },
        {
          name: "Claridad",
          desc: "¿Todos saben qué es lo más importante ahora mismo, y por qué importa?",
        },
        {
          name: "Pertenencia",
          desc: "La diferencia entre un trabajo que la gente tiene y un lugar donde la gente se queda.",
        },
      ],
      outro:
        "sayhii saca esas señales a la superficie en tiempo real, permitiendo decisiones más rápidas, mejores resultados y un equipo más sano y resiliente.",
    },
    compare: {
      eyebrow: "Jubila la encuesta anual",
      title: "Una vez al año es *demasiado tarde*.",
      sub: "Para cuando llegan los resultados anuales, la persona que más necesitabas escuchar ya decidió irse.",
      oldTitle: "La encuesta anual",
      oldPoints: [
        "Cuarenta minutos, una vez al año",
        "Los resultados llegan seis semanas después, ya obsoletos",
        "Los promedios organizacionales esconden al equipo que sufre",
        "Planes de acción que se apagan para el Q2",
      ],
      oldNote: "Pregunta 14 de 60",
      newTitle: "sayhii, todos los días",
      newPoints: [
        "Tres segundos al día, 12.5 minutos al año",
        "Señales que se actualizan en tiempo real, todos los días",
        "Lentes individual, de equipo y de organización",
        "Acciones priorizadas e informes, cada semana",
      ],
      newDone: "Listo. Tres segundos.",
    },
    uniquely: {
      eyebrow: "Únicamente sayhii",
      title: "Tres razones por las que *no* es como las demás.",
      pillars: [
        {
          eyebrow: "Porque tu tiempo vale",
          title: "Te devolvemos tu tiempo.",
          body: "El tiempo extra que tienen tus líderes, y el que quieres dedicar a tecnología redundante. Sí, te damos la información y las acciones que necesitas para empoderar a todo tu equipo, pero también les devolvemos a ti y a tus empleados algo mucho más finito: tu tiempo.",
        },
        {
          eyebrow: "Porque la ciencia importa",
          title: "Patente en trámite, por diseño.",
          body: "Solo hay una solución que combina múltiples perspectivas de datos humanos (patente en trámite) para guiar los planes de tus líderes y las prioridades humanas. Esa solución es sayhii.",
        },
        {
          eyebrow: "Porque lo único para todos no le queda a nadie",
          title: "El 100% de tus empleados son únicos.",
          body: "Con solo una pregunta al día, sayhii aprende a cada una de tus personas como individuos y les pregunta lo que necesitan para convertirse en su mejor versión, dentro y fuera de la oficina.",
        },
      ],
    },
    stories: {
      eyebrow: "Lo que dice la gente",
      title: "En palabras de quienes *ya* usan sayhii.",
      quotes: [
        "Hay muchas cosas únicas sobre sayhii, pero sobre todo, que toca todo el ciclo de vida del empleado.",
        "Esta es la pieza que nos faltaba.",
        "No hay nada como esto allá afuera… ¡Nada!",
        "Sayhii es un canal de alta tecnología, fácil de usar, hacia los niveles de motivación, compromiso y dedicación que de otra forma serían un misterio.",
        "Escucho esto y mi primer pensamiento es: '¡Es genial!'",
        "Sayhii lo lleva de ser un evento a una parte integrada de tu día en la que no tienes que pensar.",
        "Que el programa no dependa del éxito de un solo grupo es fundamental.",
        "La vista de equipo me pareció súper interesante y me dio ganas de explorar más.",
      ],
    },
    cta: {
      eyebrow: "Todo comienza con sayhii",
      title: "Crea un lugar de trabajo donde *todos ganan*.",
      sub: "Las personas son el corazón de tu negocio. Te ayudamos a ayudarles a prosperar. Cuando estés listo para decir sayhii, estamos listos para responder.",
      primary: "Agenda una charla de 30 min",
    },
  },
  notes: {
    eyebrow: "Notas del Terreno",
    title: "*Workforce* Navigator.",
    sub: "Bienvenido a Notas del Terreno, tu recurso de confianza para navegar el panorama cambiante de la gestión del capital humano. En cada edición reunimos las ideas de CIOs, líderes de RR. HH. y expertos del sector para ayudarte a optimizar tu estrategia frente a un equipo en constante cambio.",
    available: "Ediciones disponibles",
    open: "Abrir el PDF en sayhii.io",
    issueLabels: {
      "Summer / Fall 2025": "Verano / Otoño 2025",
      "Spring 2025": "Primavera 2025",
      "Winter 2025": "Invierno 2025",
      "Fall 2024": "Otoño 2024",
    },
    issueNumberPrefix: "Edición",
  },
  blog: {
    eyebrow: "Blog",
    title: "Ensayos de *sayhii*.",
    sub: "Publicados en el blog de sayhii. Haz clic en cualquier ensayo para leerlo en sayhii.io.",
    latest: "Último ensayo",
    cta: "Leer en sayhii.io",
    pullQuote: '"sayhii *todos los días*."',
  },
  contact: {
    eyebrow: "Contáctanos",
    title: "Comienza *hoy*.",
    sub: "Cuéntanos un poco sobre tu equipo y nos pondremos en contacto.",
    sidebar: {
      emailEyebrow: "Escríbenos directamente",
      visitEyebrow: "Visítanos",
      readyEyebrow: "Cuando estés listo",
      readyBody:
        "Cuando estés listo para decir sayhii, estamos listos para responder.",
    },
    form: {
      stepLabel: "Paso 1 de 1",
      heading: "Cuéntanos un poco sobre ti.",
      sub: "Cinco campos. Te enviaremos un enlace de calendario en menos de una hora.",
      labels: {
        name: "Tu nombre",
        email: "Correo de trabajo",
        company: "Empresa",
        headcount: "Tamaño del equipo",
        message: "¿Qué te gustaría ver?",
      },
      placeholders: {
        name: "Jamie Rivera",
        email: "jamie@empresa.com",
        company: "Northwind, Inc.",
        headcount: "220",
        message: "Estamos considerando reemplazar nuestra encuesta anual...",
      },
      submit: "Solicitar una demostración",
      submitting: "Enviando…",
      footnote:
        "No hacemos secuencias de marketing. Te responderá una persona real.",
      errors: {
        name: "Por favor ingresa tu nombre.",
        email: "Por favor usa un correo de trabajo válido.",
        company: "Por favor ingresa el nombre de tu empresa.",
        headcount:
          "El tamaño del equipo nos ayuda a prepararnos. Un número aproximado está bien.",
      },
      delivery: {
        delivered:
          "No pudimos entregar tu solicitud. Por favor escríbenos directamente a hi@sayhii.io. Disculpa el inconveniente.",
        network:
          "Hubo un problema de red. Por favor escríbenos directamente a hi@sayhii.io.",
      },
    },
    success: {
      eyebrowPrefix: "Listo,",
      heading: "Te contactaremos en menos de una hora.",
      bodyPrefix:
        "Una persona real del equipo de sayhii te responderá desde",
      bodyLink: "hi@sayhii.io",
      bodyAfter: ".",
      meanwhile: "Mientras tanto, hojea las últimas",
      notesLink: "Notas del Terreno",
      or: "o",
      essaysLink: "ensayos de sayhii",
      end: ".",
    },
  },
  privacy: {
    eyebrow: "Privacidad",
    title: "Política de *privacidad*.",
    note: "Esta es una traducción de cortesía. La versión autoritativa es el original en inglés.",
    sections: [
      {
        h: "Política de Privacidad",
        p: [
          'sayhii ("nosotros" o "nuestro/a") opera el sitio web https://sayhii.io, la aplicación sayhii y la aplicación móvil sayhii (el "Servicio"). Esta página te informa sobre nuestras políticas de recopilación, uso y divulgación de Información Personal cuando utilizas nuestro Servicio. No usaremos ni compartiremos tu información con nadie excepto como se describe en esta Política de Privacidad. Usamos tu Información Personal para proporcionar y mejorar el Servicio. Al usar el Servicio, aceptas la recopilación y el uso de información de acuerdo con esta política.',
        ],
      },
      {
        h: "Recopilación y uso de información",
        p: [
          'Mientras usas nuestro Servicio, podemos pedirte que nos proporciones cierta información personal identificable que se puede utilizar para contactarte o identificarte. La información personal identificable puede incluir, entre otros, tu correo electrónico, nombre ("Información Personal").',
          "Perfil de miembro: Tu perfil de miembro permanecerá confidencial y privado.",
          {
            quote:
              "Respuestas a las preguntas: Todas las respuestas recopiladas permanecerán anónimas para la organización y se agregarán con un tamaño muestral de 5 o más.",
          },
        ],
      },
      {
        h: "Datos de registro",
        p: [
          "Cuando accedes al Servicio mediante un dispositivo móvil, podemos recopilar cierta información automáticamente, incluyendo, entre otros, el tipo de dispositivo móvil que utilizas, tu sistema operativo móvil y otras estadísticas.",
          "Además, podemos utilizar servicios de terceros como Google Analytics que recopilan, monitorean y analizan este tipo de información para aumentar la funcionalidad de nuestro Servicio. Estos proveedores de servicios externos tienen sus propias políticas de privacidad sobre cómo usan dicha información.",
        ],
      },
      {
        h: "Información de ubicación",
        p: [
          "NO usamos información de ubicación para rastrear a nuestros usuarios. La información de ubicación se utiliza únicamente para limitar los resultados de búsqueda a un área específica.",
          "Podemos usar y almacenar información sobre tu ubicación si nos das permiso para hacerlo. Usamos esta información para proporcionar funciones de nuestro Servicio y para mejorarlo y personalizarlo. Puedes habilitar o deshabilitar los servicios de ubicación cuando uses nuestro Servicio en cualquier momento, a través de la configuración de tu dispositivo móvil.",
        ],
      },
      {
        h: "Cookies y balizas web",
        p: [
          "Como muchos otros sitios web, sayhii utiliza cookies para almacenar información, incluidas las preferencias de los visitantes y las páginas del sitio que el visitante accedió o visitó. La información se utiliza para optimizar la experiencia de los usuarios al personalizar el contenido de nuestra página web según el tipo de navegador del visitante u otra información.",
        ],
      },
      {
        h: "Proveedores de servicios",
        p: [
          "Podemos contratar a empresas e individuos externos para facilitar nuestro Servicio, brindar el Servicio en nuestro nombre, realizar servicios relacionados con el Servicio o ayudarnos a analizar cómo se utiliza nuestro Servicio.",
          "Estos terceros tienen acceso a tu Información Personal solo para realizar estas tareas en nuestro nombre y están obligados a no divulgarla ni utilizarla para ningún otro propósito.",
        ],
      },
      {
        h: "Transacciones comerciales",
        p: [
          "Si sayhii participa en una fusión, adquisición o venta de activos, tu Información Personal puede ser transferida. Te avisaremos antes de que tu Información Personal sea transferida y quede sujeta a una Política de Privacidad diferente.",
        ],
      },
      {
        h: "Seguridad",
        p: [
          "La seguridad de tu Información Personal es importante para nosotros, pero recuerda que ningún método de transmisión por Internet, ni de almacenamiento electrónico, es 100% seguro. Si bien nos esforzamos por usar medios comercialmente aceptables para proteger tu Información Personal, no podemos garantizar su seguridad absoluta.",
        ],
      },
      {
        h: "Transferencia internacional",
        p: [
          "Tu información, incluida la Información Personal, puede ser transferida y mantenida en computadoras ubicadas fuera de tu estado, provincia, país u otra jurisdicción gubernamental, donde las leyes de protección de datos pueden diferir de las de tu jurisdicción.",
          "Si te encuentras fuera de los Estados Unidos y eliges proporcionarnos información, ten en cuenta que transferimos la información, incluida la información personal, a los Estados Unidos y la procesamos allí.",
          "Tu consentimiento a esta Política de Privacidad seguido de tu envío de dicha información representa tu acuerdo con esa transferencia.",
        ],
      },
      {
        h: "Enlaces a otros sitios",
        p: [
          "Nuestro Servicio puede contener enlaces a otros sitios que no son operados por nosotros. Si haces clic en un enlace de un tercero, serás dirigido al sitio de ese tercero. Te recomendamos encarecidamente revisar la Política de Privacidad de cada sitio que visites.",
          "No tenemos control ni asumimos responsabilidad por el contenido, las políticas de privacidad o las prácticas de cualquier sitio o servicio de terceros.",
        ],
      },
      {
        h: "Privacidad de los menores",
        p: [
          "Nuestro Servicio no está dirigido a menores de 13 años. No recopilamos a sabiendas información personal identificable de menores de 13 años. Si eres padre, madre o tutor y sabes que tus hijos nos han proporcionado Información Personal, por favor contáctanos.",
          "Si descubrimos que menores de 13 años nos han proporcionado Información Personal, eliminaremos dicha información de nuestros servidores de inmediato.",
        ],
      },
      {
        h: "Cambios a esta Política de Privacidad",
        p: [
          "Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página.",
          "Te recomendamos revisar esta Política de Privacidad periódicamente para detectar cambios. Los cambios a esta Política de Privacidad son efectivos cuando se publican en esta página.",
        ],
      },
      {
        h: "Contáctanos",
        p: [
          "Si tienes preguntas sobre esta Política de Privacidad, contáctanos en hi@sayhii.io.",
        ],
      },
    ],
  },
};
