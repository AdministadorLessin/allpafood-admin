// Retencion del mes: cuantos renovaron, cuantos se fueron y cuantos siguen
// pendientes de decidir. El anillo da la lectura rapida; el desglose explica.

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

function Row({ color, label, value, strong }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: strong || 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function RetentionCard({ data }) {
  return (
    <Card sx={{ p: 3, height: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 1 }}>Retención del mes</Typography>

      {/* Sin nadie cuyo plan haya vencido todavia no hay retencion que medir:
          un 0% ahi diria que se fueron todos, que es falso. Por eso el guion. */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
        <Gauge
          width={168}
          height={168}
          value={data.percent ?? 0}
          startAngle={-110}
          endAngle={110}
          innerRadius="72%"
          outerRadius="100%"
          cornerRadius="50%"
          text={() => (data.percent === null || data.percent === undefined ? '—' : `${data.percent}%`)}
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 30,
              fontWeight: 800,
              fill: theme.palette.grey[800],
            },
            [`& .${gaugeClasses.valueArc}`]: { fill: theme.palette.secondary.main },
            [`& .${gaugeClasses.referenceArc}`]: { fill: theme.palette.grey[200] },
          })}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 'auto' }}>
        <Row color="secondary.main" label="Renovaron" value={data.renewed} />
        <Row color="error.main" label="Bajas" value={data.churned} strong="error.main" />
        <Row color="grey.500" label="Pendientes" value={data.pending} />
      </Box>
    </Card>
  );
}
