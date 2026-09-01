// Panel de restricciones alimentarias.
//
// Es informacion de seguridad: una alergia mal leida es un problema real.
// Por eso va en ambar, con el nombre y la restriccion en alto contraste,
// y no comparte el verde con el resto de la comanda.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ACCENT = '#F0C9A0';

export default function RestrictionsPanel({ list, abreviarNombre }) {
  const items = (list || []).filter((item) => item.restriction !== 'ninguna');

  return (
    <Box
      sx={{
        flex: 1,
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

      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {items.length === 0 ? (
          <Typography sx={{ fontSize: 17, color: 'rgba(252,252,250,.45)', py: 2 }}>
            Ninguna restricción hoy
          </Typography>
        ) : (
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {items.map((item) => (
              <Box
                component="li"
                key={item.id}
                sx={{
                  py: 1.75,
                  borderBottom: '1px solid rgba(240,201,160,.14)',
                  '&:last-child': { borderBottom: 0 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1 }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#FCFCFA' }}>
                    {abreviarNombre(item.fullName)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 999,
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#2A2318',
                      bgcolor: ACCENT,
                    }}
                  >
                    {item.restriction}
                  </Typography>
                </Box>

                {item.menus && item.menus.length > 0 && (
                  <Typography sx={{ mt: 0.75, fontSize: 17, color: 'rgba(252,252,250,.7)', lineHeight: 1.4 }}>
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
