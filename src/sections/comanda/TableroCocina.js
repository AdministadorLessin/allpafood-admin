// Comanda para la pantalla de cocina (32", a unos 2 metros).
//
// Tres columnas y nada que bajar: cuanto cocinar de cada olla, cuantas bebidas
// van sin azucar, y quien lleva algo distinto. Las medidas van en vw para que
// se lea igual en la TV de cocina que en una laptop.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const C = {
  panel: '#132B20',
  line: 'rgba(255,255,255,.08)',
  ink: '#F4F7F2',
  soft: 'rgba(244,247,242,.62)',
  mint: '#3CFB9F',
  mintInk: '#07261A',
  amber: '#F5C451',
  amberInk: '#3A2A00',
  coral: '#FF8F6B',
};

/* Tamaño que escala con la pantalla, con piso para laptops chicas. */
/* Escala con el ancho Y con el alto: si la TV muestra barras del navegador o
   tiene otra proporcion, todo se achica para seguir entrando en pantalla. */
const vw = (valor, minimo) => `max(${Math.round(minimo * 0.75)}px, min(${valor}vw, ${(valor * 1.62).toFixed(2)}vh))`;

const Panel = ({ titulo, total, acento = C.mint, tinta = C.mintInk, ancho, children }) => (
  <Box sx={{
    flex: ancho, minWidth: 0, display: 'flex', flexDirection: 'column',
    bgcolor: C.panel, border: `1px solid ${C.line}`, borderRadius: '1.2vw', overflow: 'hidden',
  }}>
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: '1.3vw', py: '.9vw', borderBottom: `1px solid ${C.line}`, borderTop: `3px solid ${acento}`,
    }}>
      <Typography sx={{ fontSize: vw(1.8, 18), fontWeight: 800, color: C.ink }}>{titulo}</Typography>
      {total !== undefined && (
        <Box sx={{
          fontSize: vw(1.7, 16), fontWeight: 900, px: '.9vw', py: '.15vw', borderRadius: 999,
          bgcolor: acento, color: tinta, fontVariantNumeric: 'tabular-nums',
        }}>{total}</Box>
      )}
    </Box>
    <Box sx={{ flex: 1, minHeight: 0, px: '1.3vw', py: '.6vw', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {children}
    </Box>
  </Box>
);

const Chip = ({ children, fondo, color }) => (
  <Box component="span" sx={{
    fontSize: vw(1.1, 12), fontWeight: 800, px: '.65vw', py: '.2vw', borderRadius: 999,
    bgcolor: fondo, color, whiteSpace: 'nowrap',
  }}>{children}</Box>
);

export default function TableroCocina({ cocina }) {
  const { platos, totalPlatos, bebidas, totalBebidas, sinAzucar, otros, restricciones } = cocina;

  /* Si un dia hay muchas restricciones, la lista se achica para seguir
     entrando en pantalla en vez de cortarse. */
  const escala = restricciones.length > 30 ? 0.78 : restricciones.length > 22 ? 0.88 : 1;

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: '1vw' }}>

      <Panel titulo="Platos" total={totalPlatos} ancho={0.95}>
        {platos.length === 0 ? (
          <Typography sx={{ color: C.soft, fontSize: vw(1.2, 14), py: 2 }}>Sin platos programados</Typography>
        ) : (
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', overflowY: 'auto' }}>
            {platos.map((p) => (
              <Box key={p.op} sx={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '1vw', alignItems: 'center',
                py: 'min(1vw, 1.4vh)', borderBottom: `1px solid ${C.line}`, '&:last-child': { borderBottom: 0 },
              }}>
                <Box sx={{
                  width: 'min(4.4vw, 7vh)', height: 'min(4.4vw, 7vh)', minWidth: 34, minHeight: 34, borderRadius: '.9vw',
                  bgcolor: C.mint, color: C.mintInk, display: 'grid', placeItems: 'center',
                  fontSize: vw(2.8, 24), fontWeight: 900,
                }}>{p.op}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: vw(1.4, 15), fontWeight: 600, color: C.ink, lineHeight: 1.2 }}>
                    {p.nombre}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '.45vw', flexWrap: 'wrap', mt: '.5vw' }}>
                    {p.doble > 0 && <Chip fondo={C.coral} color="#3A1205">{p.doble} doble proteína</Chip>}
                    {p.conRestriccion > 0 && (
                      <Chip fondo="rgba(245,196,81,.18)" color={C.amber}>{p.conRestriccion} con restricción</Chip>
                    )}
                  </Box>
                </Box>
                <Typography sx={{
                  fontSize: vw(5, 40), fontWeight: 900, color: C.mint, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                }}>{p.cantidad}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Panel>

      <Panel titulo="Bebidas" total={totalBebidas} ancho={0.72}>
        {bebidas.map((b) => (
          <Typography key={b.nombre} sx={{ fontSize: vw(1.5, 15), fontWeight: 600, color: C.ink, my: '.6vw' }}>
            {b.nombre}
          </Typography>
        ))}
        {totalBebidas > 0 && (
          <Box sx={{ display: 'grid', gap: '.6vw', mt: '.4vw' }}>
            {[['Con azúcar', totalBebidas - sinAzucar, false], ['Sin azúcar', sinAzucar, true]].map(([t, n, sin]) => (
              <Box key={t} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: '1.1vw', py: '1vw', borderRadius: '.8vw',
                bgcolor: sin ? C.amber : 'rgba(255,255,255,.04)', color: sin ? C.amberInk : C.ink,
              }}>
                <Typography sx={{ fontSize: vw(1.35, 14), fontWeight: 800, whiteSpace: 'nowrap', color: 'inherit' }}>{t}</Typography>
                <Typography sx={{
                  fontSize: vw(3.4, 30), fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                  color: sin ? 'inherit' : C.mint,
                }}>{n}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {otros.length > 0 && (
          <>
            <Box sx={{ height: '1px', bgcolor: C.line, mt: '1.2vw' }} />
            {otros.map((o) => (
              <Box key={`${o.tipo}-${o.nombre}`} sx={{ mt: '.9vw' }}>
                <Typography sx={{
                  fontSize: vw(.85, 11), fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: C.soft,
                }}>{o.tipo === 'snacks' ? 'Snacks' : o.tipo === 'breakfast' ? 'Desayunos' : o.tipo}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: vw(1.5, 15), fontWeight: 600, color: C.ink }}>{o.nombre}</Typography>
                  <Typography sx={{ fontSize: vw(3.4, 28), fontWeight: 900, color: C.mint }}>{o.cantidad}</Typography>
                </Box>
              </Box>
            ))}
          </>
        )}
      </Panel>

      <Panel titulo="Restricciones" total={`${restricciones.length}`} acento={C.amber} tinta={C.amberInk} ancho={2}>
        {restricciones.length === 0 ? (
          <Typography sx={{ color: C.soft, fontSize: vw(1.2, 14), py: 2 }}>Nadie con restricciones este día.</Typography>
        ) : (
          <Box sx={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '1.4vw', alignContent: 'start',
            fontSize: `${escala}em`,
          }}>
            {restricciones.map((r, i) => (
              <Box key={`${r.op}-${r.nombre}-${i}`} sx={{
                display: 'grid', gridTemplateColumns: '2.3vw 8.8vw 1fr', gap: '.6vw', alignItems: 'center',
                py: `${0.42 * escala}vw`, borderBottom: `1px solid ${C.line}`,
              }}>
                <Box sx={{
                  width: '2.3vw', height: '2.3vw', minWidth: 22, minHeight: 22, borderRadius: '.5vw',
                  bgcolor: C.mint, color: C.mintInk, display: 'grid', placeItems: 'center',
                  fontSize: vw(1.3 * escala, 12), fontWeight: 900,
                }}>{r.op}</Box>
                <Typography noWrap sx={{ fontSize: vw(1.35 * escala, 13), fontWeight: 800, color: C.ink }}>
                  {r.nombre}{r.veces > 1 && <Box component="span" sx={{ color: C.coral }}> ×{r.veces}</Box>}
                </Typography>
                <Typography sx={{ fontSize: vw(1.12 * escala, 12), fontWeight: 700, color: C.amber, lineHeight: 1.25 }}>
                  {r.tags.join(' · ')}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Panel>
    </Box>
  );
}
