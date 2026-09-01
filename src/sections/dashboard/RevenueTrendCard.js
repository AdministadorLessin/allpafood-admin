// Tendencia de ingresos: renovaciones contra clientes nuevos.
// Tarjeta oscura como acento de la pagina, igual que en el mockup de marca.

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';

const RENEWALS = '#3CFB9F';
const NEW_CLIENTS = '#EAF4EE';

function Legend({ color, label }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color }} />
      <Typography sx={{ fontSize: 12.5, color: 'rgba(252,252,250,.6)' }}>{label}</Typography>
    </Box>
  );
}

export default function RevenueTrendCard({ data }) {
  return (
    <Card
      sx={{
        p: 3,
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'grey.800',
        border: 'none',
        boxShadow: (theme) => theme.customShadows.z16,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#FCFCFA' }}>
          Tendencia de ingresos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Legend color={RENEWALS} label="Renovación" />
          <Legend color={NEW_CLIENTS} label="Nuevos" />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 240 }}>
        <LineChart
          height={240}
          series={[
            { data: data.renewals, label: 'Renovación', color: RENEWALS, curve: 'natural', showMark: false },
            { data: data.newClients, label: 'Nuevos', color: NEW_CLIENTS, curve: 'natural', showMark: false },
          ]}
          xAxis={[{ scaleType: 'point', data: data.months }]}
          yAxis={[{ width: 58 }]}
          margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
          hideLegend
          sx={{
            '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: 'rgba(255,255,255,.14)' },
            '& .MuiChartsAxis-tickLabel': { fill: 'rgba(252,252,250,.5) !important', fontSize: 12 },
            '& .MuiChartsGrid-line': { stroke: 'rgba(255,255,255,.07)' },
          }}
          grid={{ horizontal: true }}
        />
      </Box>
    </Card>
  );
}
