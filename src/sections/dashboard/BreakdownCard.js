// Desglose en barras proporcionales. Se usa para clientes por plan y para
// metodo de pago: misma forma, distinta unidad.
//
// Las barras se miden contra el mayor valor de la lista (no contra el total),
// que es lo que permite comparar de un vistazo cual domina.

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

export default function BreakdownCard({ title, items, suffix = '', color = 'secondary' }) {
  const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);

  return (
    <Card sx={{ p: 3, height: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2.5 }}>{title}</Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        {items.map((item) => (
          <Box key={item.label}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.75 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item.label}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                {item.value}
                {suffix}
              </Typography>
            </Box>
            <Box sx={{ height: 9, borderRadius: 999, bgcolor: 'grey.200', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: 1,
                  borderRadius: 999,
                  bgcolor: `${color}.main`,
                  width: `${(Number(item.value) / max) * 100}%`,
                  transition: 'width .6s cubic-bezier(.16,1,.3,1)',
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
