import { Link as RouterLink } from "react-router";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import LayoutPages from './../../components/LayoutPages/LayoutPages';
import KpiCard from '../../sections/dashboard/KpiCard';
import RetentionCard from '../../sections/dashboard/RetentionCard';
import BreakdownCard from '../../sections/dashboard/BreakdownCard';
import useMetricasNegocio from '../../sections/dashboard/useMetricasNegocio';
import AvisoRetraso from '../../sections/entregas/AvisoRetraso';

const soles = (value) => `S/${Number(value).toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;

const DashboardPage = () => {
  const { datos, cargando, error } = useMetricasNegocio();

  return (
    <LayoutPages>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Resumen</Typography>
          <Typography variant="h2">Panel de control</Typography>
        </Box>

        {/* Lo primero al entrar: si hoy el reparto va tarde, se avisa desde aqui
            y aparece al instante en la app de todos los clientes del dia. */}
        <AvisoRetraso />
      </Box>

      {error &&
        <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>
      }

      {cargando &&
        <Grid container spacing={2.5}>
          {[0,1,2,3].map((i)=>(
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
              <Skeleton variant="rounded" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      }

      {datos &&
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Ingreso activo (MRR)"
              value={soles(datos.mrr.value)}
              changePercent={datos.mrr.changePercent}
              caption={datos.mrr.changePercent === null ? 'sin histórico para comparar' : 'vs. mes anterior'}
              icon={<PaymentsRoundedIcon />}
              color="secondary"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Clientes activos"
              value={datos.activeClients.value}
              caption={`+${datos.activeClients.newThisMonth} nuevos este mes`}
              icon={<GroupsRoundedIcon />}
              color="primary"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              title="Por renovar"
              value={datos.renewalsDue.value}
              caption="vencen en los próximos 7 días"
              icon={<HistoryRoundedIcon />}
              color="warning"
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
              value={soles(datos.averageTicket.value)}
              caption="por suscripción activa"
              icon={<ReceiptLongRoundedIcon />}
              color="info"
            />
          </Grid>

          {/* La tendencia de ingresos necesita el historico que va guardando la
              tarea diaria en tbl_mrr_daily_snapshot. Hasta que junte semanas no
              hay curva que dibujar, y una linea inventada en un panel de
              ingresos es peor que un espacio vacio. */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Tendencia de ingresos</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Se dibuja con la foto diaria del MRR, que el sistema empieza a
                guardar desde hoy. En unas semanas habrá curva.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <RetentionCard data={datos.retention} />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <BreakdownCard title="Clientes por plan" items={datos.porPlan} />
          </Grid>

          {/* Antes aqui iba "Método de pago", que el endpoint no devuelve. El
              distrito si viene, y para la operacion vale mas: dice donde hay
              que repartir. */}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <BreakdownCard title="Clientes por distrito" items={datos.porDistrito} color="primary" />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <KpiCard
              title="Entregas pendientes"
              value={datos.pendingDeliveries.value}
              caption="por despachar de los planes activos"
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

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <BreakdownCard title="Clientes por objetivo" items={datos.porObjetivo} color="secondary" />
          </Grid>
        </Grid>
      }
    </LayoutPages>
  );
};

export default DashboardPage;
