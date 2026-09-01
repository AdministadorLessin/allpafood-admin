// Pantalla para rutas que no existen.
//
// Sin una ruta comodin, React Router no encuentra coincidencia y no renderiza
// nada: el usuario se queda ante una pantalla vacia, sin mensaje y sin salida.
// Pasa con enlaces guardados, URLs mal escritas o secciones renombradas.
//
// Si hay sesion se muestra dentro del layout, para que el menu siga a mano.
// Si no la hay, se muestra suelta con un enlace a ingresar.

import { Link as RouterLink, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';

import LayoutPages from '../../components/LayoutPages/LayoutPages';
import StateMessage from '../../components/ui/StateMessage';
import { useAuthContext } from '../../context/authContext';

function NotFoundContent({ pathname, to, actionLabel }) {
  return (
    <StateMessage
      color="warning"
      icon={<TravelExploreRoundedIcon />}
      title="Esta página no existe"
      description={
        <>
          No encontramos nada en{' '}
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {pathname}
          </Box>
          . Puede que el enlace esté desactualizado o que la sección haya cambiado de nombre.
        </>
      }
      action={
        <Button component={RouterLink} to={to} variant="contained" color="inherit">
          {actionLabel}
        </Button>
      }
    />
  );
}

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const { token } = useAuthContext();

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 560 }}>
          <NotFoundContent pathname={pathname} to="/ingresar" actionLabel="Ir a ingresar" />
        </Box>
      </Box>
    );
  }

  return (
    <LayoutPages>
      <NotFoundContent pathname={pathname} to="/" actionLabel="Volver al panel" />
    </LayoutPages>
  );
}
