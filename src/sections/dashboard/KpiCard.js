// Tarjeta de indicador. Estructura tomada de Material Kit
// (AnalyticsWidgetSummary): icono, etiqueta, valor grande, tendencia y una
// miniatura de la serie. El degradado sale de la rampa del color, por eso
// la paleta del tema tiene cinco pasos por rol.

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';

import { varAlpha } from '../../theme/utils';

export default function KpiCard({
  title,
  value,
  icon,
  color = 'primary',
  changePercent,
  caption,
  series,
  action,
}) {
  const theme = useTheme();
  const ramp = theme.palette[color];
  const negative = Number(changePercent) < 0;

  return (
    <Card
      sx={{
        p: 3,
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'none',
        border: '1px solid',
        borderColor: varAlpha(ramp.main, 0.16),
        backgroundImage: `linear-gradient(135deg, ${varAlpha(ramp.lighter, 0.9)}, ${varAlpha(ramp.lighter, 0.35)})`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            color: `${color}.darker`,
            bgcolor: varAlpha(ramp.light, 0.5),
            '& svg': { fontSize: 22 },
          }}
        >
          {icon}
        </Box>

        {changePercent !== undefined && changePercent !== null && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.4,
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 700,
              color: negative ? 'error.dark' : `${color}.darker`,
              bgcolor: negative ? 'error.lighter' : varAlpha(ramp.light, 0.55),
            }}
          >
            {negative ? (
              <TrendingDownRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <TrendingUpRoundedIcon sx={{ fontSize: 16 }} />
            )}
            {negative ? '' : '+'}
            {changePercent}%
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ color: `${color}.darker`, opacity: 0.75 }}>
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            color: `${color}.darker`,
          }}
        >
          {value}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, mt: 'auto' }}>
        <Box sx={{ minWidth: 0 }}>
          {caption && (
            <Typography variant="caption" sx={{ color: `${color}.darker`, opacity: 0.65, display: 'block' }}>
              {caption}
            </Typography>
          )}
          {action}
        </Box>

        {series && series.length > 1 && (
          <Box sx={{ width: 86, height: 44, flexShrink: 0 }}>
            <SparkLineChart
              data={series}
              height={44}
              curve="natural"
              color={ramp.dark}
              showHighlight={false}
              showTooltip={false}
              margin={{ top: 6, bottom: 6, left: 2, right: 2 }}
            />
          </Box>
        )}
      </Box>
    </Card>
  );
}
