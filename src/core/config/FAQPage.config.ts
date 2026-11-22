import type { IFaqItems } from "../interfaces/IFaqItems"

export interface IFaqCategory {
  id: string
  label: string
  items: IFaqItems[]
}

const faqCategories: IFaqCategory[] = [
  {
    id: 'basicos',
    label: 'Conceptos básicos',
    items: [
      {
        question: '¿Cómo funciona LiquidChofer?',
        answer:
          'Ingresá el total del día, los gastos, si el auto es alquilado y los vales. La app calcula cuánto va para la agencia, el auto y vos.',
      },
      {
        question: '¿Aplica a todos los choferes de cualquier agencia?',
        answer:
          'Es flexible y sirve para la mayoría de las agencias. Probala con tus datos y comprobá si se ajusta a tu caso.',
      },
    ],
  },
  {
    id: 'cuenta',
    label: 'Cuenta y privacidad',
    items: [
      {
        question: '¿Tengo que crear una cuenta?',
        answer:
          'Sí. Para usar la calculadora necesitás crear una cuenta gratuita, con tu correo o con Google. Es un proceso de unos segundos y así tu jornada queda guardada, lista para continuar desde cualquier dispositivo.',
      },
      {
        question: '¿Qué pasa con mis datos? ¿Son seguros?',
        answer:
          'Tus datos se guardan asociados a tu cuenta y solo vos podés verlos. La conexión es segura y podés borrar una jornada del historial o eliminar tu cuenta cuando quieras. Si querés más detalle, consultá nuestra Política de Privacidad.',
      },
      {
        question: '¿Cómo cambio mi nombre, correo o contraseña?',
        answer:
          'Podés cambiar tu nombre desde Ajustes. El correo y la contraseña también se cambian desde ahí, pero solo si tu cuenta tiene contraseña. Si creaste la cuenta solo con Google, no vas a poder cambiar el correo desde la app.',
      },
      {
        question: '¿Cómo elimino mi cuenta?',
        answer:
          'Desde Ajustes, en la sección de cuenta, podés solicitar la eliminación. La app te pide una confirmación porque la acción no se puede deshacer: se borra tu cuenta y los datos asociados.',
      },
    ],
  },
  {
    id: 'vales',
    label: 'Vales',
    items: [
      {
        question: '¿Cómo maneja los vales?',
        answer:
          'Cargá cada vale con nombre, valor y cantidad de viajes. La app los suma y descuenta lo que corresponde de la agencia.',
      },
      {
        question: '¿Qué tipos de vales existen?',
        answer:
          'Están pensados para cubrir lo que más se usa en el día a día de las agencias. Para darte flexibilidad, tenés dos opciones: "Fábrica" u "Otro".',
      },
      {
        question: '¿Qué sucede al elegir un vale de tipo "Fábrica"?',
        answer:
          'Se usan para viajes de contratos o empresas que tienen una tarifa fija acordada con la agencia (que suele ser más barata). Ponés el precio real del viaje y el precio fijado por la agencia, y la app se encarga de acomodar la diferencia en los números.',
      },
      {
        question: '¿Qué sucede al elegir un vale de tipo "Otro"?',
        answer:
          'Son para los vales comunes de todos los días, donde el viaje no tiene ningún descuento ni tarifa especial. Solo ponés el valor real del viaje y listo.',
      },
    ],
  },
  {
    id: 'calculo',
    label: 'Cálculo y ajustes',
    items: [
      {
        question: '¿Puedo modificar los porcentajes?',
        answer:
          'Sí. En la sección de configuración podés cambiar los porcentajes que se llevan la agencia, el conductor y el auto (si es alquilado). Lo único importante es que la suma dé exactamente 100%. La misma pantalla te avisa si te falta o te pasás de ese total.',
      },
      {
        question: '¿Qué es el "Dueño del auto"?',
        answer:
          'Si el auto no es alquilado, elegí si es de la agencia o tuyo: eso define a quién se descuenta el combustible. Si es alquilado, la opción no aparece.',
      },
      {
        question: '¿Cómo se descuenta el combustible?',
        answer:
          'Si el auto es alquilado, se resta del porcentaje del vehículo. Si no, del dueño que elijas. Lo ves en los resultados.',
      },
      {
        question: '¿Cómo guardo mis porcentajes por defecto?',
        answer:
          'En Ajustes podés definir tus porcentajes habituales, si el auto suele estar alquilado y quién es el dueño. Esos valores se aplican cuando la jornada está vacía. Si ya tenés una jornada cargada, se usan cuando la reinicies.',
      },
    ],
  },
  {
    id: 'historial',
    label: 'Historial y recibos',
    items: [
      {
        question: '¿Puedo descargar el resumen?',
        answer:
          'Sí. Una vez que cargues tus datos, podés armar un recibo en PDF para descargar o compartir directo por WhatsApp. El documento viene con todos los detalles de tu día organizados de forma clara.',
      },
      {
        question: '¿Qué es el historial?',
        answer:
          'Es el lugar donde quedan tus jornadas guardadas. Podés ver la lista, abrir el detalle de cada una, descargar el recibo o compartirlo por WhatsApp. También podés eliminar una jornada si ya no la necesitás.',
      },
      {
        question: '¿Puedo editar una jornada guardada?',
        answer:
          'No. Una jornada guardada queda como registro de ese día y no se puede modificar. Si necesitás corregir algo, guardá una jornada nueva con los datos correctos.',
      },
    ],
  },
  {
    id: 'chofia',
    label: 'ChófIA',
    items: [
      {
        question: '¿Qué es ChófIA?',
        answer:
          'ChófIA responde dudas y arma el cálculo desde tus datos o una foto. Revisá su propuesta antes de confirmarla.',
      },
      {
        question: '¿Qué imágenes puedo enviar a ChófIA?',
        answer:
          'Podés enviar hasta 3 imágenes por mensaje en formato JPG, PNG o WEBP, con un máximo de 8 MB cada una. La app las achica automáticamente antes de enviarlas para que el mensaje sea más liviano.',
      },
      {
        question: '¿ChófIA puede equivocarse?',
        answer:
          'Sí. ChófIA es una ayuda y puede interpretar mal un dato o una imagen. Siempre revisá la propuesta antes de confirmarla y verificá los números antes de guardar la jornada o presentarlos a tu agencia.',
      },
    ],
  },
  {
    id: 'acceso',
    label: 'Acceso y ayuda',
    items: [
      {
        question: '¿Funciona sin internet?',
        answer:
          'La app puede abrir sin conexión si ya la visitaste antes, pero para entrar a tu cuenta necesitás conexión. Guardar una jornada, ver el historial, usar ChófIA y cambiar tus ajustes también necesita internet.',
      },
      {
        question: '¿Puedo instalarla en el teléfono?',
        answer:
          'Sí. LiquidChofer se puede instalar como una app desde el navegador. Una vez instalada, se abre como una aplicación más y se actualiza automáticamente cuando hay una versión nueva.',
      },
      {
        question: '¿Hay límites de uso?',
        answer:
          'La calculadora y el historial no tienen límite. ChófIA tiene una cuota diaria de mensajes; la app te muestra cuántos te quedan para que sepas cuándo esperar al día siguiente.',
      },
      {
        question: '¿Cómo reporto un problema?',
        answer:
          'Podés contactarnos a través de nuestras redes sociales. Contanos qué estabas haciendo y qué pasó, así podemos revisarlo y ayudarte más rápido.',
      },
    ],
  },
]

export default faqCategories
