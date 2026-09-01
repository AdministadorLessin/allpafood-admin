// Ensamblado del tema. Equivale a create-theme.ts de Minimal Material Kit.
//
// Estructura:
//   theme-config.js  -> el objeto de configuracion (paleta en rampas, fuentes)
//   core/palette     -> roles de color + canales RGB
//   core/typography  -> escala tipografica responsiva
//   core/custom-shadows -> sombras tintadas (card, dialog, dropdown, z1..z24)
//   core/components  -> overrides minimos
//
// `customShadows` se cuelga del tema, asi cualquier componente puede hacer
// sx={{ boxShadow: 'customShadows.card' }} o theme.customShadows.z8.

import { createTheme } from '@mui/material/styles';

import { palette } from './core/palette';
import { typography } from './core/typography';
import { components } from './core/components';
import { customShadows } from './core/custom-shadows';

const theme = createTheme({
  palette,
  typography,
  components,
  customShadows,
  shape: { borderRadius: 10 },
  spacing: 8,
});

export default theme;
