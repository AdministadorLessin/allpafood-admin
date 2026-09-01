// Paleta. Estructura tomada de Minimal Material Kit (core/palette.ts):
// cada rol expone su rampa y ademas los canales RGB, para poder tintar
// con alpha sin recalcular colores.

import { themeConfig } from '../theme-config';
import { varAlpha, createPaletteChannel } from '../utils';

export const primary = createPaletteChannel(themeConfig.palette.primary);
export const secondary = createPaletteChannel(themeConfig.palette.secondary);
export const info = createPaletteChannel(themeConfig.palette.info);
export const success = createPaletteChannel(themeConfig.palette.success);
export const warning = createPaletteChannel(themeConfig.palette.warning);
export const error = createPaletteChannel(themeConfig.palette.error);
export const common = createPaletteChannel(themeConfig.palette.common);
export const grey = createPaletteChannel(themeConfig.palette.grey);

export const text = {
  primary: grey[800],
  secondary: grey[600],
  disabled: grey[500],
};

export const background = {
  paper: '#FCFCFA',
  default: grey[200],
  neutral: grey[100],
};

export const baseAction = {
  hover: varAlpha(grey[500], 0.08),
  selected: varAlpha(grey[500], 0.16),
  focus: varAlpha(grey[500], 0.24),
  disabled: varAlpha(grey[500], 0.8),
  disabledBackground: varAlpha(grey[500], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

export const palette = {
  mode: 'light',
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  text,
  background,
  action: { ...baseAction, active: grey[600] },
  divider: grey[300],
};

export default palette;
