import { useEffect, useState } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { useAuthContext } from '../../context/authContext';

/* Motivos que son culpa del cliente. El servidor ya decidio si devolver el
   envio; esto es solo para explicarlo aqui sin volver a preguntarle. */
const CULPA_CLIENTE = [
  'Nadie contestó',
  'El cliente no estaba',
  'El cliente rechazó el pedido',
  'No me dejaron entrar',
];

const hoy = () => new Date().toISOString().slice(0, 10);

/**
 * Las entregas que hoy no se pudieron dejar.
 *
 * Cierra el circulo del reporte del motorizado: sin esto, el dato se guardaba
 * y nadie lo miraba. Aparece solo cuando hay alguna —un panel con una tarjeta
 * vacia todos los dias es una tarjeta que se deja de mirar.
 */
export default function NoEntregadas() {
  const { token, baseUrl } = useAuthContext();
  const [fallidas, setFallidas] = useState([]);

  useEffect(() => {
    const d = hoy();
    axios.get(`${baseUrl}delivery/motorized/find-all-orders?startDate=${d}&endDate=${d}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        const lista = (r.data?.data || []).filter((o) => o.orderEntity?.status === 'FAILED');
        setFallidas(lista);
      })
      .catch(() => setFallidas([]));
  }, [token, baseUrl]);

  if (!fallidas.length) return null;

  return (
    <Card sx={{ p: 3, mb: 3, borderLeft: 4, borderColor: 'warning.main' }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <WarningAmberRoundedIcon sx={{ color: 'warning.main' }} />
        <Typography variant="h6">
          {fallidas.length === 1
            ? 'Una entrega no se pudo hacer hoy'
            : `${fallidas.length} entregas no se pudieron hacer hoy`}
        </Typography>
      </Stack>

      <Stack divider={<Divider />} spacing={0}>
        {fallidas.map((f) => {
          const p = f.userProfile || {};
          const o = f.orderEntity || {};
          const dp = o.deliveryPoint || {};
          const deCliente = CULPA_CLIENTE.includes(o.deliveryNote);
          const tel = (p.phoneNumber || '').replace(/\D/g, '');

          return (
            <Box key={o.id} sx={{ py: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {[p.name, p.lastname].filter(Boolean).join(' ')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {dp.address}{dp.district ? ` · ${dp.district}` : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: .5 }}>
                    {o.deliveryNote || 'Sin motivo'}
                    {o.arrivedAt &&
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                        · llegó {String(o.arrivedAt).slice(11, 16)}
                      </Typography>
                    }
                  </Typography>
                </Box>

                <Stack spacing={1} alignItems="flex-end" sx={{ flexShrink: 0 }}>
                  {/* Lo que de verdad hay que saber: si al cliente se le
                      descontó el envío o se le devolvió. */}
                  <Chip
                    size="small"
                    label={deCliente ? 'Se le descontó' : 'Envío devuelto'}
                    sx={{
                      fontWeight: 600,
                      color: deCliente ? 'warning.dark' : 'secondary.dark',
                      bgcolor: deCliente ? 'warning.lighter' : 'secondary.lighter',
                    }}
                  />
                  {tel &&
                    <Button size="small" variant="outlined" color="inherit"
                      startIcon={<WhatsAppIcon />}
                      href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer">
                      Escribirle
                    </Button>
                  }
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
