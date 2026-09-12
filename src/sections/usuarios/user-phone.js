/**
 * El numero listo para abrir un chat de WhatsApp.
 *
 * En la base conviven dos formatos: unos guardados con el codigo de pais
 * —51987654321— y otros sin el, tal como el cliente los escribio en el
 * registro —943764730—. wa.me necesita siempre el internacional, asi que un
 * numero sin prefijo abre un chat con nadie.
 *
 * Solo se agrega el 51 cuando el numero tiene la forma de un celular peruano:
 * nueve digitos empezando en 9. Cualquier otra cosa se deja como esta, porque
 * adivinarle el pais a un numero raro es peor que no abrirlo.
 *
 * @returns el numero en formato internacional, o null si no hay con que.
 */
export function whatsappNumber(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('51') && digits.length === 11) return digits;
  if (digits.length === 9 && digits.startsWith('9')) return `51${digits}`;

  return digits;
}

/** El enlace de chat, o null si el usuario no tiene telefono utilizable. */
export function whatsappLink(phone) {
  const numero = whatsappNumber(phone);
  return numero ? `https://wa.me/${numero}` : null;
}
