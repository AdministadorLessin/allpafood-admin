import { Link as RouterLink } from "react-router";

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import LayoutPages from './../../components/LayoutPages/LayoutPages';
import KpiCard from '../../sections/dashboard/KpiCard';
import RevenueTrendCard from '../../sections/dashboard/RevenueTrendCard';
import RetentionCard from '../../sections/dashboard/RetentionCard';
import BreakdownCard from '../../sections/dashboard/BreakdownCard';
import { DASHBOARD_MOCK } from '../../_mock/dashboard';

const soles = (value) => `S/${Number(value).toLocaleString('es-PE')}`;

const DashboardPage = () => {
  const data = DASHBOARD_MOCK;

  return (
    <LayoutPages>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Resumen</Typography>
          <Typography variant="h2">Panel de control</Typography>
        </Box>

        {/* Aviso permanente: estas cifras no son reales todavia. */}
        <Chip
          label="Datos de ejemplo · falta el endpoint"
          sx={{ fontWeight: 600, color: 'warning.dark', bgcolor: 'warning.lighter' }}
        />
      </Box>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Ingreso activo (MRR)"
            value={soles(data.mrr.value)}
            changePercent={data.mrr.changePercent}
            caption="vs. mes anterior"
            icon={<PaymentsRoundedIcon />}
            color="secondary"
            series={data.sparklines.mrr}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Clientes activos"
            value={data.activeClients.value}
            caption={`+${data.activeClients.newThisMonth} nuevos este mes`}
            icon={<GroupsRoundedIcon />}
            color="primary"
            series={data.sparklines.activeClients}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Por renovar"
            value={data.renewalsDue.value}
            icon={<HistoryRoundedIcon />}
            color="warning"
            series={data.sparklines.renewalsDue}
            action={
              <Button
                component={RouterLink}
                to="/usuarios?segmento=porVencer"
                size="small"
                variant="contained"
                color="inherit"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ mt: 1, whiteSpace: 'nowrap' }}
              >
                Ver lista
              </Button>
            }
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            title="Ticket promedio"
            value={soles(data.averageTicket.value)}
            caption="por suscripción activa"
            icon={<ReceiptLongRoundedIcon />}
            color="info"
            series={data.sparklines.averageTicket}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <RevenueTrendCard data={data.revenueTrend} />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <RetentionCard data={data.retention} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <BreakdownCard title="Clientes por plan" items={data.planDistribution} />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <BreakdownCard
            title="Método de pago"
            items={data.paymentMethods}
            suffix="%"
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <KpiCard
            title="Entregas pendientes"
            value={data.pendingDeliveries.value}
            caption="listas para asignar rutas hoy"
            icon={<LocalShippingRoundedIcon />}
            color="primary"
            action={
              <Button
                component={RouterLink}
                to="/asignar-rutas"
                size="small"
                variant="contained"
                color="inherit"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ mt: 1, whiteSpace: 'nowrap' }}
              >
                Asignar rutas
              </Button>
            }
          />
        </Grid>
      </Grid>
    </LayoutPages>
  );
};

export default DashboardPage;
