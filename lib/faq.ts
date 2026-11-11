// Preguntas frecuentes del catálogo (/#faq). Los plazos, cambios, vigencia y
// formas de pago salen de lib/negocio.ts; los precios no se escriben aquí.

import { CAMBIOS_INCLUIDOS, FORMAS_DE_PAGO, PLAZO_ENTREGA, VIGENCIA_ENLACE } from "./negocio";

export interface Pregunta {
  pregunta: string;
  respuesta: string;
}

export const FAQ: Pregunta[] = [
  {
    pregunta: "¿Qué es una invitación digital?",
    respuesta:
      "Es una página web personalizada con toda la información de tu evento. La compartes con un enlace por WhatsApp y tus invitados la ven en su celular, con música, cuenta regresiva, mapa de ubicación y confirmación de asistencia.",
  },
  {
    pregunta: "¿Cómo hago mi pedido?",
    respuesta:
      "Elige un diseño en el catálogo, toca Solicitar y completa tu nombre, tu WhatsApp y la fecha del evento. Se abrirá WhatsApp con el mensaje listo para enviarnos. Luego te escribimos para pedirte los datos de tu invitación.",
  },
  {
    pregunta: "¿Qué datos debo enviarte?",
    respuesta:
      "Los nombres, la fecha y hora, la dirección con una referencia del lugar, el número de WhatsApp donde quieres recibir las confirmaciones y tus fotos. Si lo deseas, también la canción de fondo y los textos que prefieres.",
  },
  {
    pregunta: "¿Cuánto demora en estar lista?",
    respuesta: `El plazo habitual es de ${PLAZO_ENTREGA}, desde que recibimos todos tus datos. Si tu evento está cerca, avísanos al hacer el pedido y vemos cómo ayudarte.`,
  },
  {
    pregunta: "¿Cuánto cuesta y cómo se paga?",
    respuesta: `El precio de cada diseño aparece en el catálogo. Aceptamos ${FORMAS_DE_PAGO}. Te confirmamos todo por WhatsApp antes de empezar.`,
  },
  {
    pregunta: "¿Puedo ver cómo queda antes de pedirla?",
    respuesta:
      "Sí. Cada diseño tiene una demo con datos de ejemplo. Toca Ver demo para recorrerla completa en tu celular.",
  },
  {
    pregunta: "¿Puedo cambiar textos, fotos o música?",
    respuesta: `Sí. Personalizamos los nombres, textos, fotos, música y datos del evento. Incluye ${CAMBIOS_INCLUIDOS}. Si quieres cambios de colores o de diseño, consúltanos y te decimos qué es posible.`,
  },
  {
    pregunta: "¿Mis invitados necesitan instalar algo?",
    respuesta:
      "No. Solo abren el enlace desde su celular y la invitación se ve en el navegador, sin descargar ninguna aplicación.",
  },
  {
    pregunta: "¿Cómo confirman su asistencia?",
    respuesta:
      "Con un botón que abre WhatsApp con el mensaje ya escrito. Solo agregan su nombre y cuántas personas vendrán, y la confirmación llega directo a tu WhatsApp.",
  },
  {
    pregunta: "¿Qué es la galería de fotos de las invitaciones de boda?",
    respuesta:
      "Es una sección donde tus invitados suben fotos y videos durante el evento, para que tengas todos los recuerdos en un solo lugar. Se habilita el día de la boda y los archivos se conservan 15 días después del evento; antes de que se eliminen te los entregamos juntos.",
  },
  {
    pregunta: "¿Cuánto tiempo estará activa mi invitación?",
    respuesta: `Tu invitación estará activa hasta ${VIGENCIA_ENLACE}.`,
  },
  {
    pregunta: "¿Tienen invitaciones para otros eventos?",
    respuesta:
      "Por ahora tenemos bodas y cumpleaños infantiles. Bautizos y quinceañeros llegarán pronto. Si tienes otra idea, escríbenos y la conversamos.",
  },
];
