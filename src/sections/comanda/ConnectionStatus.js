// Estado del canal en vivo.
//
// Antes, si el WebSocket se caia la pantalla seguia mostrando datos viejos sin
// ninguna senal: la cocina preparaba con informacion obsoleta sin saberlo.
// Aqui se ve si el canal esta abierto y hace cuanto llegaron datos.

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function agoLabel(date) {
  if (!date) return 'sin datos aun';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'recien actualizado';
  if (seconds < 60) return `hace ${seconds} s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;

  return `hace ${Math.floor(minutes / 60)} h`;
}

export default function ConnectionStatus({ connected, lastUpdate }) {
  const [, forceTick] = useState(0);

  // Refresca la etiqueta "hace X" sin depender de que lleguen pedidos.
  useEffect(() => {
    const timer = setInterval(() => forceTick((value) => value + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  const color = connected ? '#3CFB9F' : '#F0C9A0';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.35 }}>
      <Box
        sx={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          bgcolor: color,
          flexShrink: 0,
          ...(connected && {
            animation: 'comandaPulse 2s ease-in-out infinite',
            '@keyframes comandaPulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.35 },
            },
          }),
        }}
      />
      <Typography sx={{ fontSize: 14, color: 'rgba(252,252,250,.6)' }}>
        {connected ? 'En vivo' : 'Sin conexión'} · {agoLabel(lastUpdate)}
      </Typography>
    </Box>
  );
}
