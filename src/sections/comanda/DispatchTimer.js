// Cuenta regresiva al despacho.
//
// En cocina el dato que ordena el trabajo no es la hora, es cuanto falta.
// Por eso el contador es el elemento mas grande de la cabecera y cambia de
// color al acercarse: verde con holgura, ambar en los ultimos 30 minutos,
// rojo en los ultimos 10.
//
// Se calcula contra el dia seleccionado, no contra hoy: si alguien revisa la
// comanda del miercoles, el contador apunta al despacho del miercoles.

import { useEffect, useState } from 'react';
import moment from 'moment';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DISPATCH_TIME, WARN_MINUTES, URGENT_MINUTES } from './comanda-config';

const COLORS = {
  ok: '#3CFB9F',
  warn: '#F0C9A0',
  urgent: '#FF8A6B',
  done: 'rgba(252,252,250,.45)',
};

function pad(value) {
  return String(Math.floor(Math.abs(value))).padStart(2, '0');
}

function readTimer(selectedDay) {
  const target = moment(`${selectedDay} ${DISPATCH_TIME}`, 'YYYY-MM-DD HH:mm');
  if (!target.isValid()) return null;

  const totalSeconds = target.diff(moment(), 'seconds');

  if (totalSeconds <= 0) {
    return { state: 'done', label: 'Despacho iniciado', detail: `Salida ${DISPATCH_TIME}` };
  }

  const days = Math.floor(totalSeconds / 86400);
  if (days >= 1) {
    return {
      state: 'ok',
      label: `${days} d ${pad((totalSeconds % 86400) / 3600)} h`,
      detail: `Despacho ${target.format('dddd')} ${DISPATCH_TIME}`,
    };
  }

  const minutesLeft = totalSeconds / 60;
  let state = 'ok';
  if (minutesLeft <= URGENT_MINUTES) state = 'urgent';
  else if (minutesLeft <= WARN_MINUTES) state = 'warn';

  const label = `${pad(totalSeconds / 3600)}:${pad((totalSeconds % 3600) / 60)}:${pad(totalSeconds % 60)}`;

  return { state, label, detail: `para el despacho · ${DISPATCH_TIME}` };
}

export default function DispatchTimer({ selectedDay }) {
  const [timer, setTimer] = useState(() => readTimer(selectedDay));

  useEffect(() => {
    setTimer(readTimer(selectedDay));
    const interval = setInterval(() => setTimer(readTimer(selectedDay)), 1000);
    return () => clearInterval(interval);
  }, [selectedDay]);

  if (!timer) return null;

  const color = COLORS[timer.state];
  const urgent = timer.state === 'urgent';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        px: 2.5,
        py: 1,
        borderRadius: 3,
        border: '1px solid',
        borderColor: urgent ? color : 'rgba(255,255,255,.12)',
        bgcolor: urgent ? 'rgba(255,138,107,.12)' : 'transparent',
        ...(urgent && {
          animation: 'dispatchPulse 1.4s ease-in-out infinite',
          '@keyframes dispatchPulse': {
            '0%, 100%': { borderColor: color },
            '50%': { borderColor: 'rgba(255,138,107,.3)' },
          },
        }),
      }}
    >
      <Typography
        sx={{
          fontSize: timer.state === 'done' ? 24 : 38,
          fontWeight: 800,
          lineHeight: 1.05,
          color,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-.5px',
        }}
      >
        {timer.label}
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'rgba(252,252,250,.55)' }}>
        {timer.detail}
      </Typography>
    </Box>
  );
}
