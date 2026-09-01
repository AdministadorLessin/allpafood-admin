// Overrides de componente. Deliberadamente cortos: siguiendo el criterio de
// Minimal Material Kit, el look sale de la paleta, la tipografia y las sombras,
// no de sobrescribir cada componente.
//
// Solo se toca lo que la plantilla da por hecho y esta app no tenia:
// estados de foco visibles, jerarquia de boton y el estilo de tabla.

import { varAlpha } from '../utils';
import { grey, primary, secondary, background } from './palette';

const focusRing = {
  outline: `2px solid ${secondary.main}`,
  outlineOffset: '2px',
};

const MuiCssBaseline = {
  styleOverrides: {
    '*::-webkit-scrollbar': { width: 10, height: 10 },
    '*::-webkit-scrollbar-thumb': {
      borderRadius: 8,
      backgroundColor: varAlpha(grey[500], 0.32),
      border: '2px solid transparent',
      backgroundClip: 'content-box',
    },
    '*::-webkit-scrollbar-thumb:hover': { backgroundColor: varAlpha(grey[500], 0.48) },
  },
};

const MuiBackdrop = {
  styleOverrides: {
    root: { backgroundColor: varAlpha(grey[900], 0.6) },
    invisible: { background: 'transparent' },
  },
};

const MuiButton = {
  defaultProps: { disableElevation: true },
  styleOverrides: {
    root: {
      borderRadius: 999,
      letterSpacing: 0,
      '&.Mui-focusVisible': focusRing,
    },
    // La accion principal neutra: tinta solida, como el gris 800 de Material Kit.
    containedInherit: {
      color: '#FCFCFA',
      backgroundColor: grey[800],
      '&:hover': { backgroundColor: grey[700] },
      '&:active': { backgroundColor: grey[900] },
    },
    containedPrimary: { boxShadow: 'none' },
    outlined: {
      borderColor: grey[300],
      backgroundColor: background.paper,
      '&:hover': { borderColor: grey[800], backgroundColor: grey[100] },
    },
    sizeSmall: { minHeight: 34, paddingInline: 16 },
    sizeMedium: { minHeight: 42, paddingInline: 22 },
    sizeLarge: { minHeight: 48, paddingInline: 30 },
  },
};

const MuiIconButton = {
  styleOverrides: {
    root: { '&.Mui-focusVisible': focusRing },
  },
};

const MuiCard = {
  styleOverrides: {
    root: ({ theme }) => ({
      zIndex: 0,
      position: 'relative',
      boxShadow: theme.customShadows.card,
      borderRadius: theme.shape.borderRadius * 2,
      backgroundColor: background.paper,
    }),
  },
};

const MuiCardHeader = {
  defaultProps: {
    titleTypographyProps: { variant: 'h6' },
    subheaderTypographyProps: { variant: 'body2' },
  },
  styleOverrides: {
    root: ({ theme }) => ({ padding: theme.spacing(3, 3, 0) }),
  },
};

const MuiPaper = {
  defaultProps: { elevation: 0 },
  styleOverrides: {
    root: { backgroundImage: 'none' },
    outlined: { borderColor: grey[300] },
  },
};

const MuiDialog = {
  styleOverrides: {
    paper: ({ theme }) => ({ borderRadius: 20, boxShadow: theme.customShadows.dialog }),
  },
};

const MuiMenu = {
  styleOverrides: {
    paper: ({ theme }) => ({ borderRadius: 12, boxShadow: theme.customShadows.dropdown }),
  },
};

const MuiMenuItem = {
  styleOverrides: {
    root: ({ theme }) => ({ ...theme.typography.body2, borderRadius: 999 }),
  },
};

const MuiTableCell = {
  styleOverrides: {
    root: { borderColor: grey[300] },
    head: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: grey[600],
      backgroundColor: background.neutral,
    },
  },
};

const MuiDataGrid = {
  styleOverrides: {
    root: ({ theme }) => ({
      border: 'none',
      borderRadius: theme.shape.borderRadius * 2,
      backgroundColor: background.paper,
      '--DataGrid-rowBorderColor': grey[300],
    }),
    columnHeader: {
      backgroundColor: background.neutral,
      color: grey[600],
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
    },
    row: {
      '&:hover': { backgroundColor: grey[100] },
      '&.Mui-selected': {
        backgroundColor: secondary.lighter,
        '&:hover': { backgroundColor: secondary.lighter },
      },
    },
    cell: { '&:focus, &:focus-within': { outline: 'none' } },
  },
};

const MuiOutlinedInput = {
  styleOverrides: {
    root: {
      borderRadius: 999,
      backgroundColor: background.paper,
    },
    notchedOutline: { borderColor: grey[300] },
  },
};

const MuiChip = {
  styleOverrides: {
    root: { borderRadius: 999, fontWeight: 600 },
  },
};

const MuiAlert = {
  styleOverrides: {
    root: { borderRadius: 12, alignItems: 'center' },
  },
};

const MuiLink = { defaultProps: { underline: 'hover' } };

const MuiFormControlLabel = {
  styleOverrides: {
    label: ({ theme }) => ({ ...theme.typography.body2 }),
  },
};

const MuiLinearProgress = {
  styleOverrides: {
    root: { borderRadius: 999, backgroundColor: grey[200] },
    bar: { borderRadius: 999, backgroundColor: primary.main },
  },
};

const MuiTab = {
  styleOverrides: {
    root: { textTransform: 'none', fontWeight: 600, fontSize: 14 },
  },
};

export const components = {
  MuiTab,
  MuiCard,
  MuiChip,
  MuiLink,
  MuiMenu,
  MuiAlert,
  MuiPaper,
  MuiButton,
  MuiDialog,
  MuiBackdrop,
  MuiMenuItem,
  MuiDataGrid,
  MuiTableCell,
  MuiCardHeader,
  MuiIconButton,
  MuiCssBaseline,
  MuiOutlinedInput,
  MuiLinearProgress,
  MuiFormControlLabel,
};

export default components;
