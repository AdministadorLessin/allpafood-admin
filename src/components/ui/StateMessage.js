// Bloque centrado que usan el estado vacio y el de error.
// Un badge circular tintado con el rol de color, titulo, descripcion y accion.

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function StateMessage({ icon, title, description, action, color = 'primary', dense }) {
  return (
    <Box
      sx={{
        width: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1,
        py: dense ? 5 : 8,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: `${color}.dark`,
          bgcolor: `${color}.lighter`,
          '& svg': { fontSize: 30 },
        }}
      >
        {icon}
      </Box>

      <Typography variant="h6">{title}</Typography>

      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380 }}>
          {description}
        </Typography>
      )}

      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}
