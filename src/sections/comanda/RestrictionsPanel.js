// Panel de restricciones alimentarias.
//
// Es informacion de seguridad: una alergia mal leida es un problema real.
// Por eso va en ambar, con el nombre y la restriccion en alto contraste,
// y no comparte el verde con el resto de la comanda.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ACCENT = '#F0C9A0';

export default function RestrictionsPanel({ list, abreviarNombre, ancho = 1 }) {
  const items = (list || []).filter((item) => item.restriction !== 'ninguna');

  return (
    <Box
      sx={{
        flex: ancho,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        bgcolor: '#2A2318',
        border: '1px solid rgba(240,201,160,.22)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(240,201,160,.18)',
          borderTop: `3px solid ${ACCENT}`,
        }}
      >
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#FCFCFA', letterSpacing: '-.3px' }}>
          Restricciones
        </Typography>
        <Box
          sx={{
            minWidth: 46,
            px: 1.5,
            py: 0.4,
            borderRadius: 999,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 800,
            color: '#2A2318',
            bgcolor: ACCENT,
          }}
        >
          {items.length}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
        {items.length === 0 ? (
          <Typography sx={{ fontSize: 17, color: 'rgba(252,252,250,.45)', py: 2 }}>
            Ninguna restricción hoy
          </Typography>
        ) : (
          /* En columnas, no en una lista larga.
             En un monitor de 32" la lista de una sola columna obligaba a
             bajar, y en cocina nadie scrollea: lo que no se ve, no existe.
             Se reparte en columnas segun el ancho disponible y cada persona
             queda entera en la suya. */
          <Box
            component="ul"
            sx={{
              m: 0, p: 0, listStyle: 'none',
              columnCount: { xs: 1, xl: 2 },
              columnGap: 3,
              columnRule: '1px solid rgba(240,201,160,.14)',
            }}
          >
            {items.map((item) => (
              <Box
                component="li"
                key={item.id}
                sx={{
                  breakInside: 'avoid',
                  pb: 1.5,
                  mb: 1.5,
                  borderBottom: '1px solid rgba(240,201,160,.14)',
                }}
              >
                {/* El nombre y la restriccion en la misma linea: es un par que
                    se lee junto, y partirlo en dos gastaba media pantalla. */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 0.75 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#FCFCFA', lineHeight: 1.2 }}>
                    {abreviarNombre(item.fullName)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      px: 1,
                      py: 0.15,
                      borderRadius: 999,
                      fontSize: 13.5,
                      fontWeight: 700,
                      lineHeight: 1.35,
                      color: '#2A2318',
                      bgcolor: ACCENT,
                    }}
                  >
                    {item.restriction}
                  </Typography>
                </Box>

                {item.menus && item.menus.length > 0 && (
                  <Typography sx={{ mt: 0.4, fontSize: 14.5, color: 'rgba(252,252,250,.62)', lineHeight: 1.35 }}>
                    {item.menus.map((menu) => menu.name).join(' · ')}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
