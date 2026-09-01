// Configuracion unica del tema. Arquitectura tomada de Minimal Material Kit
// (theme-config.ts): un solo objeto con la paleta, la tipografia y las variables.
//
// Cada rol de color es una rampa de 5 pasos — lighter / light / main / dark / darker.
// Eso es lo que permite degradados suaves en tarjetas, chips tintados y sombras
// de color sin inventar valores sueltos por pantalla.
//
// Los colores son los de la marca Allpa Food, tomados del logotipo y del mockup
// "Dashboard KPIs": verde tinta #183A2A y menta #3CFB9F.

export const themeConfig = {
  fontFamily: {
    primary: 'Inter',
    secondary: 'Inter',
  },

  palette: {
    // Verde de marca. main es el tono seguro bajo texto blanco.
    primary: {
      lighter: '#DFFBEE',
      light: '#6BF2B4',
      main: '#0F8B54',
      dark: '#0A6B41',
      darker: '#183A2A',
      contrastText: '#FFFFFF',
    },
    // Menta de acento. Siempre con texto tinta encima, nunca blanco.
    secondary: {
      lighter: '#EAFEF3',
      light: '#9BFDCE',
      main: '#3CFB9F',
      dark: '#16C97A',
      darker: '#0B7A48',
      contrastText: '#183A2A',
    },
    info: {
      lighter: '#D8F3F6',
      light: '#7FD8E3',
      main: '#1B92A8',
      dark: '#125C6D',
      darker: '#0A3542',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#DCF3E6',
      light: '#7FD9A6',
      main: '#1B7A4C',
      dark: '#125537',
      darker: '#0A3322',
      contrastText: '#FFFFFF',
    },
    warning: {
      lighter: '#FBEEE1',
      light: '#F0C9A0',
      main: '#B5773B',
      dark: '#8A5726',
      darker: '#573716',
      contrastText: '#FFFFFF',
    },
    error: {
      lighter: '#F9E5E1',
      light: '#EDA294',
      main: '#C2452E',
      dark: '#93301F',
      darker: '#5C1D12',
      contrastText: '#FFFFFF',
    },
    // Neutros con sesgo verde: elegidos, no grises puros.
    grey: {
      50: '#FCFDFC',
      100: '#F5F8F6',
      200: '#E9EFEA',
      300: '#D8E2DB',
      400: '#C2D1C8',
      500: '#99A5A0',
      600: '#66736C',
      700: '#3E5348',
      800: '#183A2A',
      900: '#0F2A1E',
    },
    common: { black: '#000000', white: '#FFFFFF' },
  },
};

export default themeConfig;
