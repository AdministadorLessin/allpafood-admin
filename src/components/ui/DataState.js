// Envoltorio de estados para cualquier vista que traiga datos del API.
//
// Resuelve las tres situaciones que la aplicacion no distinguia: mientras carga,
// cuando el API falla y cuando no hay registros. Antes las tres se veian igual:
// una pantalla en blanco.
//
// Uso:
//   <DataState status={status} isEmpty={!lista.length} onRetry={getLista} variant="cards">
//     ...la tabla o la rejilla de siempre...
//   </DataState>

import Button from '@mui/material/Button';

import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';

import StateMessage from './StateMessage';
import LoadingSkeleton from './LoadingSkeleton';

export const STATUS = {
  loading: 'loading',
  error: 'error',
  ready: 'ready',
};

export default function DataState({
  status,
  isEmpty,
  onRetry,
  children,
  variant = 'table',
  skeletonCount = 5,
  emptyTitle = 'Aún no hay nada aquí',
  emptyDescription = 'Cuando se registren datos aparecerán en esta pantalla.',
  emptyAction,
  errorTitle = 'No pudimos cargar la información',
  errorDescription = 'Revisa tu conexión y vuelve a intentarlo. Si el problema sigue, avisa al equipo técnico.',
}) {
  if (status === STATUS.loading) {
    return <LoadingSkeleton variant={variant} count={skeletonCount} />;
  }

  if (status === STATUS.error) {
    return (
      <StateMessage
        color="error"
        icon={<CloudOffRoundedIcon />}
        title={errorTitle}
        description={errorDescription}
        action={
          onRetry && (
            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={onRetry}>
              Reintentar
            </Button>
          )
        }
      />
    );
  }

  if (isEmpty) {
    return (
      <StateMessage
        color="primary"
        icon={<InboxRoundedIcon />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return children;
}
