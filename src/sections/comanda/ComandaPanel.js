// Panel de la comanda de cocina.
//
// Pensado para una TV a menos de 2 metros: fondo oscuro, texto claro y la
// cantidad como dato dominante — en cocina primero se lee "cuantos" y despues
// "de que". Densidad parecida a la version anterior, contraste muy superior.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { groupByType } from './comanda-groups';

export default function ComandaPanel({ title, list, accent = '#3CFB9F', emptyText, numbered = false }) {
  const groups = groupByType(list);
  const total = groups.reduce((sum, group) => sum + group.total, 0);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        bgcolor: '#163226',
        border: '1px solid rgba(255,255,255,.08)',
        overflow: 'hidden',
      }}
    >
      {/* Cabecera del panel: nombre y total de unidades */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255,255,255,.08)',
          borderTop: `3px solid ${accent}`,
        }}
      >
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#FCFCFA', letterSpacing: '-.3px' }}>
          {title}
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
            color: '#0F2A1E',
            bgcolor: accent,
          }}
        >
          {total}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {groups.length === 0 ? (
          <Typography sx={{ fontSize: 17, color: 'rgba(252,252,250,.45)', py: 2 }}>
            {emptyText}
          </Typography>
        ) : (
          groups.map((group) => (
            <Box key={group.type} sx={{ mb: 3.5, '&:last-child': { mb: 0 } }}>
              {/* Con un solo tipo el encabezado no aporta nada: el titulo del
                  panel ya lo dice. Solo se muestra cuando hay que separar. */}
              <Box
                sx={{
                  display: groups.length > 1 ? 'flex' : 'none',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 1.25,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: accent,
                  }}
                >
                  {group.label}
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'rgba(252,252,250,.4)' }}>
                  {group.total}
                </Typography>
              </Box>

              <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {group.items.map((item, index) => (
                  <Box
                    component="li"
                    key={`${item.menuType}-${item.menuName}-${index}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1.5,
                      borderBottom: '1px solid rgba(255,255,255,.06)',
                      '&:last-child': { borderBottom: 0 },
                    }}
                  >
                    {/* El numero de opcion es como la cocina identifica el plato,
                        asi que va primero y como bloque solido de color. */}
                    {numbered && (
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 2.5,
                          fontSize: 26,
                          fontWeight: 800,
                          lineHeight: 1,
                          color: '#0F2A1E',
                          bgcolor: accent,
                        }}
                      >
                        {index + 1}
                      </Box>
                    )}

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {numbered && (
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: '.12em',
                            textTransform: 'uppercase',
                            color: 'rgba(252,252,250,.45)',
                            lineHeight: 1.2,
                          }}
                        >
                          Opción {index + 1}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          fontSize: 21,
                          fontWeight: 500,
                          color: '#FCFCFA',
                          lineHeight: 1.25,
                        }}
                      >
                        {item.menuName}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: accent,
                        lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
