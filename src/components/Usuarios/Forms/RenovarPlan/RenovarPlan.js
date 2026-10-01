// Renovar el plan de un cliente que ya existe.
//
// Hasta ahora el panel solo tenia "Actualizar plan" y "Cambiar plan", y ninguno
// renueva: el primero pide escribir a mano cuantos envios lleva y hasta cuando
// vence, el segundo intercambia el plan dejando el consumo donde estaba. Quien
// pagaba por Yape o por transferencia terminaba con las fechas corregidas a
// dedo y el contador sin reiniciar.
//
// Esto llama al mismo camino que usa la pasarela: reinicia el contador, corre
// el vencimiento, guarda como saldo a favor lo que el cliente todavia no
// consumio y deja la renovacion registrada en el historial —de ahi salen los
// numeros de renovaciones del panel.

import { useState } from "react";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import axios from 'axios';
import { useAuthContext } from "../../../../context/authContext";
import SelectorVendedor from '../../../Vendedores/SelectorVendedor';

/* Como entro la plata. No cambia nada del plan: queda en el log de la
   operacion para poder cuadrar despues contra el banco o el Yape. */
const CANALES = [
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'pos', label: 'Tarjeta (POS)' },
  { value: 'otro', label: 'Otro' },
];

/* "2026-09-21" con new Date() se lee como medianoche UTC, que en Lima es
   todavia el 20: todas las fechas salian con un dia menos. */
const fecha = (valor) => {
  if (!valor) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(valor));
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(valor);
  if (Number.isNaN(d.valueOf())) return valor;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const UsuarioFormRenovarPlan = ({ data, handleClose, getUsuarios, planList }) => {

  const { token, baseUrl } = useAuthContext();

  const planes = [...(planList || [])].sort((a, b) => Number(a.price) - Number(b.price));

  // Arranca con el plan que ya tiene: renovar lo mismo es el caso comun.
  const actual = planes.find((p) => p.description === data?.plan);

  const [planSelect, setPlanSelect] = useState(actual ? String(actual.id) : '');
  const [canal, setCanal] = useState('yape');
  const [vendedor, setVendedor] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const pendientes = Number(data?.consumedTotal) - Number(data?.consumedCount);
  const quedan = Number.isFinite(pendientes) && pendientes > 0 ? pendientes : 0;

  const renovar = (event) => {
    event.preventDefault();
    if (!planSelect) { setError('Elige el plan que pagó el cliente.'); return; }
    if (!vendedor) { setError('Elige quién hizo la venta.'); return; }

    setEnviando(true);
    setError('');

    axios.post(`${baseUrl}admin/user-plan/assign-plan`,
      {
        userId: data.id,
        planId: parseInt(planSelect, 10),
        paymentMethodType: canal,
        paymentMethodId: canal,
        sellerId: vendedor,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => {
      if (handleClose) handleClose();
      if (getUsuarios) getUsuarios();
    }).catch((e) => {
      /* El servidor se niega a renovar cuando el cliente ya tiene un saldo
         a favor sin consumir, y explica que hacer. Ese texto sirve mas que
         un "no se pudo": se muestra tal cual. */
      const cuerpo = e?.response?.data;
      setError(
        cuerpo?.data?.message || cuerpo?.message ||
        'No pudimos renovar el plan. Inténtalo de nuevo.'
      );
      setEnviando(false);
    });
  };

  return (
    <div className="inlineBlock">
      <form onSubmit={renovar}>
        <Grid container spacing={2}>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ p: 1.75, borderRadius: 1.5, bgcolor: 'grey.100' }}>
              <Typography variant="subtitle2">
                {`${data?.name || ''} ${data?.lastName || ''}`.trim() || 'Cliente'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Plan actual: {data?.plan || 'sin plan'} · vence {fecha(data?.expira)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Consumo: {data?.consumed || '—'}
              </Typography>
            </Box>
          </Grid>

          {quedan > 0 && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                Le quedan {quedan} envíos del plan actual. No se pierden: primero
                termina esos y después entra el plan nuevo.
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <FormControl>
              <FormLabel id="renovar-plan-label">Plan que pagó</FormLabel>
              <RadioGroup
                aria-labelledby="renovar-plan-label"
                value={planSelect}
                onChange={(e) => setPlanSelect(e.target.value)}
              >
                {planes.map((item) => (
                  <FormControlLabel
                    key={item.id}
                    value={String(item.id)}
                    control={<Radio />}
                    label={`${item.description} · S/ ${item.price}`}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
              <TextField
                select
                fullWidth
                variant="filled"
                label="Cómo pagó"
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
              >
                {CANALES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
            </div>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <div className="inlineFlex textFieldAdmin textFieldAdmin2">
              <SelectorVendedor value={vendedor} onChange={setVendedor} />
            </div>
          </Grid>

          {error && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">{error}</Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <button
              type="submit"
              disabled={enviando}
              className={enviando ? "btnPrimary btnDisabled" : "btnPrimary"}
            >
              {enviando ? 'Renovando…' : 'Renovar plan'}
            </button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default UsuarioFormRenovarPlan;
