// Utilidades del tema. Equivalen a lo que Material Kit importa de `minimal-shared`
// (varAlpha, pxToRem, setFont), reescritas aqui para no sumar una dependencia.

/** '#183A2A' -> '24 58 42'  (canal RGB, para usar con alpha en CSS) */
export function toChannel(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const int = parseInt(full, 16);
  // eslint-disable-next-line no-bitwise
  return `${(int >> 16) & 255} ${(int >> 8) & 255} ${int & 255}`;
}

/** varAlpha('#183A2A', 0.16) -> 'rgba(24 58 42 / 0.16)' */
export function varAlpha(color, opacity = 1) {
  const channel = color.includes('#') ? toChannel(color) : color;
  return `rgba(${channel} / ${opacity})`;
}

/** 14 -> '0.875rem' */
export function pxToRem(value) {
  return `${value / 16}rem`;
}

/** Anade la pila de respaldo del sistema a la fuente elegida. */
export function setFont(fontName) {
  return `"${fontName}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
}

/** Anade *Channel a cada tono de una rampa, como hace createPaletteChannel. */
export function createPaletteChannel(ramp) {
  return Object.entries(ramp).reduce((acc, [key, value]) => {
    acc[key] = value;
    if (typeof value === 'string' && value.startsWith('#')) {
      acc[`${key}Channel`] = toChannel(value);
    }
    return acc;
  }, {});
}
