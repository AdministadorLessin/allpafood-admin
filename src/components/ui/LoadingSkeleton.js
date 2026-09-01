// Esqueleto de carga. Se prefiere sobre un spinner porque la pantalla aparece
// ya con su forma final en vez de saltar de vacio a lleno.
// Patron tomado de Material Kit / Minimal.

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

/** Fila de tabla simulada. */
function TableRows({ count }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Skeleton variant="rounded" height={44} sx={{ borderRadius: 2, opacity: 0.7 }} />
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          height={56}
          sx={{ borderRadius: 2, opacity: 1 - index * 0.06 }}
        />
      ))}
    </Box>
  );
}

/** Rejilla de tarjetas simulada. */
function Cards({ count }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2.5,
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={196} sx={{ borderRadius: 5 }} />
      ))}
    </Box>
  );
}

/** Lista simple simulada. */
function Rows({ count }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={72} sx={{ borderRadius: 3 }} />
      ))}
    </Box>
  );
}

export default function LoadingSkeleton({ variant = 'table', count = 5 }) {
  if (variant === 'cards') return <Cards count={count} />;
  if (variant === 'list') return <Rows count={count} />;
  return <TableRows count={count} />;
}
