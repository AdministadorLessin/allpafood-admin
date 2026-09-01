// Tipografia. Escala tomada de Minimal Material Kit (core/typography.ts),
// con pxToRem y tamanos responsivos por breakpoint, pero con Inter,
// que es la fuente del mockup de marca.

import { createTheme } from '@mui/material/styles';
import { themeConfig } from '../theme-config';
import { pxToRem, setFont } from '../utils';

const defaultMuiTheme = createTheme();

function responsiveFontSizes(sizes) {
  return Object.entries(sizes).reduce((acc, [breakpoint, value]) => {
    acc[defaultMuiTheme.breakpoints.up(breakpoint)] = { fontSize: pxToRem(value) };
    return acc;
  }, {});
}

const primaryFont = setFont(themeConfig.fontFamily.primary);
const secondaryFont = setFont(themeConfig.fontFamily.secondary);

export const typography = {
  fontFamily: primaryFont,
  fontSecondaryFamily: secondaryFont,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,

  h1: {
    fontWeight: 800,
    lineHeight: 1.15,
    fontSize: pxToRem(32),
    letterSpacing: '-0.8px',
    ...responsiveFontSizes({ sm: 36, md: 40, lg: 44 }),
  },
  h2: {
    fontWeight: 800,
    lineHeight: 1.2,
    fontSize: pxToRem(26),
    letterSpacing: '-0.6px',
    ...responsiveFontSizes({ sm: 28, md: 30, lg: 32 }),
  },
  h3: {
    fontWeight: 700,
    lineHeight: 1.25,
    fontSize: pxToRem(21),
    letterSpacing: '-0.4px',
    ...responsiveFontSizes({ sm: 22, md: 24 }),
  },
  h4: { fontWeight: 700, lineHeight: 1.3, fontSize: pxToRem(18), letterSpacing: '-0.3px' },
  h5: { fontWeight: 600, lineHeight: 1.4, fontSize: pxToRem(16), letterSpacing: '-0.2px' },
  h6: { fontWeight: 600, lineHeight: 1.5, fontSize: pxToRem(15), letterSpacing: '-0.1px' },

  subtitle1: { fontWeight: 600, lineHeight: 1.5, fontSize: pxToRem(15) },
  subtitle2: { fontWeight: 600, lineHeight: 1.45, fontSize: pxToRem(13) },
  body1: { fontWeight: 400, lineHeight: 1.55, fontSize: pxToRem(14) },
  body2: { fontWeight: 400, lineHeight: 1.55, fontSize: pxToRem(13) },
  caption: { fontWeight: 400, lineHeight: 1.5, fontSize: pxToRem(12) },
  overline: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(11),
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  button: { fontWeight: 600, lineHeight: 1.5, fontSize: pxToRem(14), textTransform: 'none' },
};

export default typography;
