import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import axios from 'axios';
import { useAuthContext } from '../../context/authContext';

const HORAS = ['2:00 p.m.', '2:30 p.m.', '3:00 p.m.', '3:30 p.m.', '4:00 p.m.'];

const textoPorDefecto = (hora) =>
  `Hoy tuvimos un retraso y el reparto salió más tarde de lo previsto. ` +
  `Tu almuerzo va en camino y llega antes de las ${hora}. Lo sentimos mucho.`;

/**
 * Aviso de retraso del reparto.
 *
 * Publica un mensaje que aparece de inmediato en la pantalla de TODOS los
 * clientes con entrega hoy. Existe porque el equipo suele saber que va tarde
 * horas antes que el cliente, y hasta ahora la unica forma de decirlo era
 * responder uno por uno por WhatsApp.
 *
 * El aviso caduca solo al terminar el dia: lleva su fecha y el servidor no lo
 * devuelve si no es de hoy.
 */
const AvisoRetraso = () => {

  const { token, baseUrl } = useAuthContext();
  const cabecera = { headers: { Authorization: `Bearer ${token}` } };

  const [aviso, setAviso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const [hora, setHora] = useState(HORAS[2]);
  const [mensaje, setMensaje] = useState(textoPorDefecto(HORAS[2]));

  const consultar = () => {
    axios.get(`${baseUrl}delivery/notice`, cabecera)
      .then((r) => setAviso(r.data?.data || null))
      .catch(() => setAviso(null))
      .finally(() => setCargando(false));
  };

  useEffect(consultar, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cambiarHora = (nueva) => {
    setHora(nueva);
    // Solo se reescribe si el texto seguia siendo el automatico: si el
    // operador ya lo edito, no se le pisa lo que escribio.
    setMensaje((actual) =>
      HORAS.some((h) => actual === textoPorDefecto(h)) ? textoPorDefecto(nueva) : actual);
  };

  const publicar = () => {
    setEnviando(true);
    setError('');
    axios.put(`${baseUrl}delivery/notice`, { nuevaHora: hora, mensaje }, cabecera)
      .then(() => { setAbierto(false); consultar(); })
      .catch((e) => setError(e?.response?.data?.message || 'No se pudo publicar el aviso.'))
      .finally(() => setEnviando(false));
  };

  const retirar = () => {
    setEnviando(true);
    axios.delete(`${baseUrl}delivery/notice`, cabecera)
      .then(consultar)
      .catch((e) => setError(e?.response?.data?.message || 'No se pudo retirar el aviso.'))
      .finally(() => setEnviando(false));
  };

  return (
    <>
      <Card sx={{ p: 2.5, mb: 3, borderLeft: 3, borderColor: aviso ? 'warning.main' : 'transparent' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
               alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <CampaignRoundedIcon sx={{ color: aviso ? 'warning.main' : 'text.disabled', mt: .2 }} />
            <Box>
              <Typography variant="subtitle2">
                {aviso ? 'Aviso de retraso publicado' : 'Entregas del día'}
              </Typography>

              {cargando &&
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Consultando…</Typography>}

              {!cargando && aviso &&
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 560 }}>
                  Tus clientes de hoy ven <strong>«llega hasta las {aviso.nuevaHora}»</strong> en su app.
                </Typography>}

              {!cargando && !aviso &&
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 560 }}>
                  Todo marcha en el horario normal. Si hoy vas tarde, avísales desde aquí
                  y lo verán en su app al instante.
                </Typography>}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            {aviso &&
              <Tooltip title="Los clientes vuelven a ver el horario normal">
                <Button variant="outlined" color="inherit" onClick={retirar} disabled={enviando}>
                  Retirar
                </Button>
              </Tooltip>}
            <Button
              variant={aviso ? 'outlined' : 'contained'}
              color={aviso ? 'inherit' : 'warning'}
              startIcon={<CampaignRoundedIcon />}
              onClick={() => setAbierto(true)}
            >
              {aviso ? 'Cambiar aviso' : 'Avisar retraso'}
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>{error}</Alert>}
      </Card>

      <Dialog open={abierto} onClose={() => setAbierto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Avisar retraso a los clientes de hoy</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Esto aparece de inmediato en la app de <strong>todos los clientes con entrega hoy</strong>.
            Se retira solo al terminar el día.
          </Typography>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>¿Hasta qué hora vas a entregar?</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {HORAS.map((h) => (
              <Button key={h} size="small"
                variant={hora === h ? 'contained' : 'outlined'}
                color={hora === h ? 'primary' : 'inherit'}
                onClick={() => cambiarHora(h)}>
                {h}
              </Button>
            ))}
          </Stack>

          <TextField
            label="Lo que va a leer el cliente"
            multiline rows={4} fullWidth
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            helperText="Sé concreto y reconoce el retraso. Suavizarlo molesta más que admitirlo."
          />

          <Alert icon={<CheckCircleRoundedIcon fontSize="inherit" />} severity="info" sx={{ mt: 2.5 }}>
            La app también les ofrece devolver el envío a su saldo si ya no lo necesitan hoy.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setAbierto(false)}>Cancelar</Button>
          <Button variant="contained" color="warning" onClick={publicar}
            disabled={enviando || !mensaje.trim()}
            startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : null}>
            {enviando ? 'Publicando…' : 'Publicar aviso'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AvisoRetraso;
