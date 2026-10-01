import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TwoWheelerRoundedIcon from '@mui/icons-material/TwoWheelerRounded';

import { useAuthContext } from '../../context/authContext';

const n = (v) => Number(v || 0);

// Hora de Lima. toISOString adelantaba el día después de las 7 p.m.
const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const hace = (iso) => {
  if (!iso) return null;
  const min = Math.round((Date.now() - new Date(String(iso).replace(' ', 'T')).getTime()) / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  return `hace ${h} h ${min % 60} min`;
};

/**
 * Cómo va el reparto, moto por moto.
 *
 * La pregunta de media mañana es siempre la misma —"¿a quién le falta?"— y
 * hasta ahora se contestaba abriendo el tablero de rutas y contando tarjetas,
 * o llamando a los motorizados uno por uno.
 *
 * Se ordena por lo que falta, no por nombre: arriba está siempre quien
 * necesita que lo llamen. Y se refresca solo cada minuto, porque la respuesta
 * cambia mientras hay gente en la calle.
 */
export default function AvanceMotorizados() {
  const { token, baseUrl } = useAuthContext();

  const [filas, setFilas] = useState(null);
  const [actualizado, setActualizado] = useState(null);

  const cargar = useCallback(() => {
    axios.get(`${baseUrl}admin/avance?fecha=${hoy()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        setFilas(r.data?.data || []);
        setActualizado(new Date());
      })
      .catch(() => setFilas([]));
  }, [token, baseUrl]);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 60000);
    return () => clearInterval(t);
  }, [cargar]);

  // Antes de las 10 de la mañana no hay reparto que mirar, y una tarjeta
  // vacía todos los días es una tarjeta que se deja de mirar.
  if (!filas || !filas.length) return null;

  const total = filas.reduce((a, f) => a + n(f.total), 0);
  const entregados = filas.reduce((a, f) => a + n(f.entregados), 0);
  const pendientes = filas.reduce((a, f) => a + n(f.pendientes), 0);
  const fallidos = filas.reduce((a, f) => a + n(f.fallidos), 0);
  const terminaron = filas.filter((f) => n(f.pendientes) === 0).length;

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start"
             flexWrap="wrap" spacing={1.5} sx={{ mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TwoWheelerRoundedIcon sx={{ color: 'text.secondary' }} />
          <Box>
            <Typography variant="h6">Reparto de hoy</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {entregados} de {total} entregados
              {pendientes > 0 ? ` · faltan ${pendientes}` : ' · ruta terminada'}
              {fallidos > 0 &&
                <Typography component="span" variant="body2" sx={{ color: 'warning.dark', fontWeight: 600 }}>
                  {` · ${fallidos} sin entregar`}
                </Typography>
              }
            </Typography>
          </Box>
        </Stack>

        <Stack alignItems="flex-end" spacing={.5}>
          <Chip
            size="small"
            label={`${terminaron} de ${filas.length} motos libres`}
            sx={{ fontWeight: 600, bgcolor: 'background.neutral' }}
          />
          {actualizado &&
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              actualizado {actualizado.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' })}
            </Typography>
          }
        </Stack>
      </Stack>

      <Stack divider={<Divider />} spacing={0}>
        {filas.map((f) => {
          const t = n(f.total);
          const ent = n(f.entregados);
          const fal = n(f.fallidos);
          const pen = n(f.pendientes);
          const sinSalir = n(f.sinSalir);
          const listo = pen === 0;
          const pct = t ? (ent / t) * 100 : 0;
          const pctFal = t ? (fal / t) * 100 : 0;
          // Salió con pedidos y no ha marcado ni uno: o no está usando el app
          // o algo le pasó. En cualquier caso hay que llamarlo.
          const trabado = !listo && ent === 0 && fal === 0;

          return (
            <Box key={f.motorizadoId ?? f.motorizado} sx={{ py: 1.75 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ width: { xs: 120, sm: 170 }, flexShrink: 0, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 700, color: listo ? 'success.dark' : 'text.primary' }}>
                    {f.motorizado || 'Sin asignar'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: trabado ? 'warning.dark' : 'text.secondary' }}>
                    {listo
                      ? (fal > 0 ? `terminó · ${fal} sin entregar` : 'terminó su ruta')
                      : trabado
                        ? 'no ha marcado ninguna'
                        : `le faltan ${pen}`}
                  </Typography>
                </Box>

                {/* La barra dice de un vistazo lo que el número tarda en decir. */}
                <Tooltip
                  arrow
                  title={`${ent} entregados · ${sinSalir} sin salir · ${n(f.enRuta)} en ruta${fal ? ` · ${fal} fallidos` : ''}${f.ultimaEntrega ? ` · última ${hace(f.ultimaEntrega)}` : ''}`}
                >
                  <Box sx={{
                    flexGrow: 1, minWidth: 0, display: 'flex', height: 12,
                    borderRadius: 99, overflow: 'hidden', bgcolor: 'background.neutral',
                  }}>
                    <Box sx={{ width: `${pct}%`, bgcolor: 'secondary.main', transition: 'width .4s ease' }} />
                    <Box sx={{ width: `${pctFal}%`, bgcolor: 'warning.main', transition: 'width .4s ease' }} />
                  </Box>
                </Tooltip>

                <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {ent}
                    <Typography component="span" variant="body2" sx={{ color: 'text.disabled' }}>/{t}</Typography>
                  </Typography>
                  <Box sx={{
                    minWidth: 26, height: 26, px: .75, borderRadius: 99,
                    display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    color: listo ? 'success.dark' : 'common.white',
                    bgcolor: listo ? 'success.lighter' : 'text.primary',
                  }}>
                    {listo ? '✓' : pen}
                  </Box>
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
