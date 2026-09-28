// Page content for the pre-rendered Spanish pages. Only the site generator
// (scripts/build-site.js) reads this file; it is not shipped to browsers.
// Every locale file in this directory has exactly the same keys.

module.exports = {
  home: {
    name: 'Código QR de URL y texto',
    title: 'Generador de códigos QR gratis que no caducan | QRTurbo.app',
    description:
      'Crea códigos QR gratis para enlaces, WiFi, vCards y más. Sin registro, sin pruebas, sin rastreo: se generan en tu navegador y nunca dejan de funcionar.',
    eyebrow: 'Generador de códigos QR gratis',
    display: 'Códigos QR gratis que nunca dejan de funcionar.',
    lead:
      'Crea códigos QR para enlaces, WiFi, contactos y mucho más, directamente en tu navegador. Sin registro, sin periodo de prueba y sin redirecciones: tu contenido va dentro del código, así que funciona para siempre. Añade logotipos, colores y un marco con «ESCANÉAME».'
  },
  types: {
    wifi: {
      name: 'Código QR WiFi',
      title: 'Generador de código QR WiFi gratis y privado | QRTurbo.app',
      description:
        'Crea gratis un código QR WiFi para que tus invitados se conecten con un solo escaneo. Tu contraseña no sale del navegador. Sin registro y sin caducidad.',
      eyebrow: 'Generador de código QR WiFi',
      display: 'Tus invitados se conectan al WiFi con un solo escaneo.',
      lead:
        'Escribe el nombre de tu red y la contraseña para crear un código QR WiFi. La contraseña nunca sale de tu dispositivo y el código funciona mientras no cambies la configuración de la red.',
      aboutTitle: 'Cómo funcionan los códigos QR WiFi',
      about: [
        'Un código QR WiFi contiene el nombre de la red (SSID), el tipo de seguridad y la contraseña en un formato estándar que entienden las apps de cámara de iPhone y Android. Al escanearlo, el móvil ofrece conectarse a la red, así que nadie tiene que teclear una contraseña larga.',
        'Imprime el código para tu casa, tu oficina, tu cafetería o tu alojamiento turístico y colócalo donde los invitados puedan verlo. Si cambias la contraseña o el nombre de la red, crea un código nuevo.',
        'Muchos generadores online envían tu contraseña a sus servidores. QRTurbo.app crea el código en tu navegador, así que tu contraseña nunca se sube ni se guarda en ningún sitio.'
      ]
    },
    vcard: {
      name: 'Código QR vCard',
      title: 'Código QR vCard gratis para tarjetas de visita | QRTurbo.app',
      description:
        'Crea gratis un código QR vCard para tu tarjeta de visita. Un escaneo guarda tu nombre, teléfono, correo y dirección en los contactos. Sin registro.',
      eyebrow: 'Generador de código QR vCard',
      display: 'Comparte tus datos de contacto con un solo escaneo.',
      lead:
        'Añade tu nombre, teléfono, correo electrónico y dirección para crear un código QR vCard para tarjetas de visita, acreditaciones y firmas de correo. Los datos se guardan en el propio código, no en un servidor.',
      aboutTitle: 'Cómo funcionan los códigos QR vCard',
      about: [
        'Un código QR vCard contiene una tarjeta de visita digital en formato vCard. Cuando alguien lo escanea, su móvil le ofrece guardar los datos como un contacto nuevo, sin tener que escribir nada a mano.',
        'Rellena solo los campos que quieras compartir. Cuantos más datos añadas, más denso será el código, así que imprímelo con al menos 2,5 cm de ancho y pruébalo antes de encargar una tirada grande de tarjetas.',
        'Como los datos van codificados directamente en el código, no se pueden cambiar después. Si cambia tu número de teléfono o tu cargo, crea un código nuevo para la siguiente impresión.'
      ]
    },
    sms: {
      name: 'Código QR de SMS y llamada',
      title: 'Generador de código QR para SMS y llamadas gratis | QRTurbo.app',
      description:
        'Crea gratis un código QR que abre un SMS o inicia una llamada. Añade un mensaje de texto predefinido. Se genera en tu navegador, sin registro y sin caducidad.',
      eyebrow: 'Generador de código QR para SMS y llamadas',
      display: 'Envía un SMS o haz una llamada con un solo escaneo.',
      lead:
        'Crea un código QR que abre un mensaje de texto ya escrito o marca un número de teléfono. Es ideal para atención al cliente, reservas, sorteos y pegatinas de servicio técnico.',
      aboutTitle: 'Cómo funcionan los códigos QR de SMS y llamada',
      about: [
        'Un código QR de SMS abre la app de mensajes con el número de teléfono y tu mensaje ya escritos, así que quien lo escanea solo tiene que pulsar enviar. Un código QR de llamada abre el teclado del teléfono con el número listo para llamar.',
        'Escribe siempre el número en formato internacional, por ejemplo +34 612 34 56 78, para que el código también funcione con teléfonos de otros países.',
        'El teléfono nunca envía el mensaje ni hace la llamada automáticamente. Quien escanea el código siempre tiene que confirmarlo antes.'
      ]
    },
    email: {
      name: 'Código QR de correo electrónico',
      title: 'Generador de código QR de correo electrónico gratis | QRTurbo.app',
      description:
        'Crea gratis un código QR de email que abre un mensaje nuevo con el destinatario, el asunto y el texto ya escritos. Sin registro, sin rastreo y sin caducidad.',
      eyebrow: 'Generador de código QR de correo electrónico',
      display: 'Abre un correo listo para enviar con un solo escaneo.',
      lead:
        'Añade un destinatario, un asunto y un mensaje para crear un código QR de correo electrónico para opiniones, solicitudes de soporte, pedidos e inscripciones.',
      aboutTitle: 'Cómo funcionan los códigos QR de correo electrónico',
      about: [
        'Un código QR de correo electrónico contiene un enlace mailto. Al escanearlo se abre la app de correo con el destinatario, el asunto y el mensaje ya escritos, y quien lo escanea decide si lo envía.',
        'Mantén breve el mensaje predefinido. Los textos largos hacen que el código sea más denso y más difícil de escanear a distancia.',
        'Usa un asunto claro, como «Opinión: mesa 12», para poder ordenar fácilmente los mensajes que recibas.'
      ]
    },
    event: {
      name: 'Código QR de evento de calendario',
      title: 'Código QR de evento gratis: añadir al calendario | QRTurbo.app',
      description:
        'Crea gratis un código QR de evento. Un escaneo añade el título, la hora, el lugar y los detalles al calendario. Se genera en tu navegador y no caduca nunca.',
      eyebrow: 'Generador de código QR de eventos',
      display: 'Pon tu evento en su calendario con un solo escaneo.',
      lead:
        'Escribe el título, la hora y el lugar del evento para crear un código QR para invitaciones, carteles, entradas y salas de reuniones.',
      aboutTitle: 'Cómo funcionan los códigos QR de eventos',
      about: [
        'Un código QR de evento contiene una cita de calendario en formato iCalendar. Al escanearlo, se puede añadir el evento al calendario con la fecha, la hora y el lugar correctos.',
        'La compatibilidad con los códigos QR de calendario varía según el móvil y la app de escaneo. Prueba el código con un iPhone y con un Android antes de imprimir las invitaciones.',
        'Rellena el campo de ubicación para que los invitados encuentren la dirección directamente desde su calendario.'
      ]
    },
    location: {
      name: 'Código QR de ubicación',
      title: 'Generador de código QR de ubicación gratis | QRTurbo.app',
      description:
        'Crea gratis un código QR de ubicación que abre una dirección o unas coordenadas en una app de mapas. Ideal para invitaciones y carteles. Sin registro.',
      eyebrow: 'Generador de código QR de ubicación',
      display: 'Indica el camino con un solo escaneo.',
      lead:
        'Escribe una dirección o unas coordenadas para crear un código QR que abre la ubicación en una app de mapas. Úsalo en invitaciones, folletos, señalización e instrucciones de entrega.',
      aboutTitle: 'Cómo funcionan los códigos QR de ubicación',
      about: [
        'Una dirección crea un código QR con un enlace de búsqueda de Google Maps, que se abre en el navegador o en una app de mapas en cualquier móvil. Las coordenadas crean un enlace geo que se abre directamente en la app de mapas predeterminada del móvil.',
        'Las coordenadas son la opción más precisa para lugares sin dirección postal, como una casa de campo, el inicio de una ruta de senderismo o la entrada al recinto de un evento.',
        'Prueba el código con tu propio móvil para comprobar que apunta exactamente al lugar correcto.'
      ]
    },
    social: {
      name: 'Código QR para redes sociales',
      title: 'Código QR para redes sociales, Instagram y TikTok | QRTurbo.app',
      description:
        'Crea gratis un código QR para tu perfil de Instagram, TikTok, YouTube, LinkedIn y más. Solo escribe tu usuario. Sin registro, sin rastreo y sin caducidad.',
      eyebrow: 'Generador de código QR para redes sociales',
      display: 'Convierte a tus visitantes en seguidores.',
      lead:
        'Elige una plataforma y escribe tu nombre de usuario para crear un código QR que abre tu perfil. Funciona con Instagram, TikTok, YouTube, Facebook, X, LinkedIn, Threads, Bluesky y muchas más.',
      aboutTitle: 'Cómo funcionan los códigos QR para redes sociales',
      about: [
        'Un código QR para redes sociales contiene un enlace a tu perfil. Al escanearlo, el perfil se abre en la app, si está instalada, o en el navegador.',
        'Escribe tu nombre de usuario y QRTurbo.app crea la dirección de perfil correcta para la plataforma elegida. También puedes pegar la URL completa de tu perfil.',
        'Pon el código en envases, tarjetas de visita, carteles y stands de eventos. Añade un marco con una llamada a la acción breve, como «Síguenos», para que la gente sepa qué va a encontrar.'
      ]
    },
    whatsapp: {
      name: 'Código QR de WhatsApp',
      title: 'Código QR de WhatsApp gratis para iniciar un chat | QRTurbo.app',
      description:
        'Crea gratis un código QR de WhatsApp que abre un chat con tu número y un mensaje ya escrito. Se genera en tu navegador. Sin registro y sin caducidad.',
      eyebrow: 'Generador de código QR de WhatsApp',
      display: 'Empieza un chat de WhatsApp con un solo escaneo.',
      lead:
        'Escribe tu número de teléfono o tu usuario de WhatsApp y, si quieres, un mensaje. Tus clientes pueden escribirte sin tener que guardar antes tu número.',
      aboutTitle: 'Cómo funcionan los códigos QR de WhatsApp',
      about: [
        'Un código QR de WhatsApp contiene un enlace wa.me. Al escanearlo se abre un chat contigo, con tu mensaje predefinido listo para enviar.',
        'Escribe el número en formato internacional con el prefijo del país, por ejemplo +34 612 34 56 78. Los espacios y los guiones se eliminan automáticamente.',
        'El código contiene el propio enlace wa.me, no una redirección, así que sigue funcionando mientras el número use WhatsApp.'
      ]
    },
    app: {
      name: 'Código QR para descargar una app',
      title: 'Código QR gratis para App Store y Google Play | QRTurbo.app',
      description:
        'Crea gratis un código QR para la página de descarga de tu app o su enlace de App Store o Google Play. Se genera en tu navegador. Sin registro ni redirecciones.',
      eyebrow: 'Generador de código QR para descargar apps',
      display: 'Lleva a la gente directamente a tu app.',
      lead:
        'Añade la página web de tu app, su enlace de App Store y su enlace de Google Play para crear un código QR de descarga.',
      aboutTitle: 'Cómo funcionan los códigos QR para descargar apps',
      about: [
        'Un código QR contiene un único enlace, y QRTurbo.app nunca añade una redirección. Si tienes una página web que envía a los usuarios de iPhone a la App Store y a los de Android a Google Play, úsala como URL web para obtener el mejor resultado en cualquier móvil.',
        'Si no tienes una página así, elige qué enlace de tienda abre el código o imprime códigos separados para la App Store y para Google Play.',
        'Comprueba que los enlaces de las tiendas sean públicos y no incluyan parámetros de seguimiento que no quieras compartir.'
      ]
    }
  },
  comparison: {
    title: 'Códigos QR gratis que nunca dejan de funcionar',
    intro:
      'Muchos generadores de códigos QR «gratis» crean códigos dinámicos que apuntan a su propio servidor de redirección. Cuando termina la prueba, desactivan el código, a menudo cuando ya está impreso en cartas de restaurante, tarjetas de visita o envases. QRTurbo.app funciona de otra manera.',
    headers: {
      feature: 'Pregunta',
      dynamic: 'Código QR típico de «prueba gratis»',
      qrturbo: 'QRTurbo.app'
    },
    rows: [
      {
        feature: '¿Dónde se guarda tu contenido?',
        dynamic: 'En el servidor del proveedor, detrás de un enlace corto de redirección',
        qrturbo: 'Dentro del propio código QR'
      },
      {
        feature: '¿Qué pasa cuando termina la prueba?',
        dynamic: 'El código se desactiva hasta que pagas',
        qrturbo: 'Nada. No hay periodo de prueba y el código sigue funcionando'
      },
      {
        feature: '¿Necesitas una cuenta?',
        dynamic: 'Normalmente, sí',
        qrturbo: 'No'
      },
      {
        feature: '¿Quién ve tus escaneos?',
        dynamic: 'Cada escaneo pasa por el proveedor',
        qrturbo: 'Nadie. Los escaneos nunca llegan a nosotros'
      },
      {
        feature: '¿Cuánto cuesta?',
        dynamic: 'Una suscripción mensual o anual',
        qrturbo: 'Nada, ni siquiera para uso comercial'
      }
    ],
    note:
      'La única contrapartida: un código QR estático no se puede editar después de imprimirlo. Si es posible que necesites cambiar el destino más adelante, crea el código para una página que controles y actualiza esa página.'
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Caducan los códigos QR creados con QRTurbo.app?',
        a: 'No. QRTurbo.app crea códigos QR estáticos: tu enlace, tu texto o tus datos de contacto se codifican directamente en el código. No hay ningún servidor de por medio, así que no hay nada que pueda caducar o desactivarse. Un código sigue funcionando mientras su contenido sea válido, por ejemplo, mientras exista la web a la que enlaza.'
      },
      {
        q: '¿Por qué ha dejado de funcionar mi código QR de otra web?',
        a: 'Muchos generadores crean códigos QR dinámicos por defecto. Contienen un enlace corto al servidor del proveedor, que redirige cada escaneo a tu dirección real. Cuando termina la prueba gratuita o la suscripción, el proveedor desactiva la redirección y el código impreso deja de funcionar. Los códigos de QRTurbo.app contienen tu contenido real y nunca dependen de nosotros.'
      },
      {
        q: '¿QRTurbo.app es gratis de verdad? ¿Puedo usar los códigos con fines comerciales?',
        a: 'Sí. No hay registro, ni periodo de prueba, ni marca de agua, ni límite de escaneos. Puedes usar los códigos QR que crees para fines personales y comerciales, como tarjetas de visita, cartas de restaurante, envases y publicidad.'
      },
      {
        q: '¿Puedo cambiar un código QR después de imprimirlo?',
        a: 'No. Un código QR estático no se puede editar, porque el contenido forma parte del propio patrón. Si crees que vas a cambiar el destino, crea el código para una dirección que controles, como una página de tu propia web, y actualiza esa página.'
      },
      {
        q: '¿De qué tamaño debo imprimir un código QR?',
        a: 'Imprímelo con al menos 2 × 2 cm. Como regla general, el código debe medir al menos una décima parte de la distancia de escaneo: un cartel que se lee a 2 metros necesita un código de unos 20 cm. Para imprimir, descarga un SVG o un PNG grande y deja vacía la zona tranquila alrededor del código.'
      },
      {
        q: '¿Por qué no se escanea mi código QR?',
        a: 'Las causas más habituales son un contraste bajo entre el código y el fondo, una zona tranquila demasiado pequeña, un logotipo que tapa demasiado el código o demasiado contenido para el tamaño de impresión. QRTurbo.app te avisa de estos riesgos. Prueba siempre el código con varios móviles distintos antes de imprimirlo.'
      },
      {
        q: '¿Están seguros mis datos? ¿Alguien puede ver mi contraseña WiFi?',
        a: 'Tus datos se quedan en tu dispositivo. El código QR se genera con código que se ejecuta en tu navegador, y nada de lo que escribes o subes se envía a un servidor, así que nadie puede ver tu contraseña WiFi ni tus datos de contacto. Después de la primera visita, el generador también funciona sin conexión.'
      }
    ]
  },
  typeLinks: {
    title: 'Generadores de códigos QR gratis'
  }
};
