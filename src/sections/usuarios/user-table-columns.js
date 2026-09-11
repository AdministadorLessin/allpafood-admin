// Columnas de la tabla de usuarios.
//
// Antes eran 16 columnas y ~1.950px de ancho: mas de la mitad vivia en scroll
// horizontal. Aqui se agrupan los datos relacionados en una sola celda
// (patron de Material Kit), y la tabla entra completa en pantalla.
//
// El detalle que ya no cabe —direccion, fecha de registro, metodo de pago—
// sigue disponible en el modal de edicion.

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

import UserRowActions from './UserRowActions';
import { formatDate, parseDate } from './user-date';
import { planStatus, remainingOrders, SOON_ORDERS, TONE, customerStatus, CUSTOMER } from './user-status';

const TONE_COLOR = {
  expired: 'error',
  exhausted: 'error',
  soon: 'warning',
  exhausting: 'warning',
  ok: 'success',
  none: 'default',
};

const TONE_LABEL = {
  expired: 'Vencido',
  exhausted: 'Agotado',
  soon: 'Por vencer',
  exhausting: 'Por agotarse',
  ok: 'Vigente',
  none: 'Sin fecha',
};

/* Tres estados, no dos. "Sin compras" es quien se registro y nunca pago:
   antes salia como "Activo" y se confundia con un cliente. */
const CUSTOMER_LABEL = {
  customer: 'Cliente',
  prospect: 'Sin compras',
  disabled: 'Inactivo',
};

function initials(name, lastName) {
  const a = (name || '').trim().charAt(0);
  const b = (lastName || '').trim().charAt(0);
  return (a + b).toUpperCase() || '?';
}

/** Dato secundario con icono, para la celda de contacto. */
function MetaLine({ icon, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Box sx={{ display: 'flex', color: 'grey.500', '& svg': { fontSize: 15 } }}>{icon}</Box>
      <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
        {children || '—'}
      </Typography>
    </Box>
  );
}

export default function buildUserColumns({ onAction }) {
  return [
    {
      field: 'name',
      headerName: 'Usuario',
      flex: 1.4,
      minWidth: 220,
      valueGetter: (value, row) => `${row.name || ''} ${row.lastName || ''}`.trim(),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, height: 1 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              fontSize: 13,
              fontWeight: 600,
              color: 'primary.darker',
              bgcolor: 'primary.lighter',
            }}
          >
            {initials(params.row.name, params.row.lastName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {`${params.row.name || ''} ${params.row.lastName || ''}`.trim() || 'Sin nombre'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
              {params.row.mail || '—'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'Contacto',
      flex: 0.9,
      minWidth: 150,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            height: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0.25,
          }}
        >
          <MetaLine icon={<PhoneIphoneIcon />}>{params.row.phone}</MetaLine>
          <MetaLine icon={<BadgeOutlinedIcon />}>{params.row.dni}</MetaLine>
        </Box>
      ),
    },
    {
      field: 'plan',
      headerName: 'Plan',
      flex: 0.9,
      minWidth: 130,
      renderCell: (params) => (
        <Box sx={{ height: 1, display: 'flex', alignItems: 'center' }}>
          {params.row.plan ? (
            <Chip size="small" label={params.row.plan} sx={{ bgcolor: 'grey.200' }} />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>Sin plan</Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'expira',
      headerName: 'Vence',
      flex: 0.9,
      minWidth: 150,
      // Ordena por fecha real, no alfabeticamente: asi funciona sea cual sea
      // el formato en que venga del API.
      valueGetter: (value) => {
        const parsed = parseDate(value);
        return parsed ? parsed.valueOf() : null;
      },
      renderCell: (params) => {
        const tone = planStatus(params.row);
        return (
          <Box
            sx={{
              height: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.25,
            }}
          >
            <Typography variant="body2">{formatDate(params.row.expira)}</Typography>
            <Box
              component="span"
              sx={{
                // display e flex-basis explicitos: como hijo de un contenedor
                // flex, un span sin display propio se estiraba a todo el alto
                // de la fila y empujaba la fecha fuera de la celda.
                display: 'inline-flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                flex: '0 0 auto',
                height: 18,
                px: 0.9,
                borderRadius: 999,
                fontSize: 10.5,
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: '.02em',
                color: tone === TONE.none ? 'text.disabled' : `${TONE_COLOR[tone]}.dark`,
                bgcolor: tone === TONE.none ? 'grey.200' : `${TONE_COLOR[tone]}.lighter`,
              }}
            >
              {TONE_LABEL[tone]}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'consumedHide',
      headerName: 'Consumo',
      flex: 0.9,
      minWidth: 140,
      renderCell: (params) => {
        const used = Number(params.row.consumedCount);
        const total = Number(params.row.consumedTotal);
        const valid = Number.isFinite(used) && Number.isFinite(total) && total > 0;
        const percent = valid ? Math.min((used / total) * 100, 100) : 0;

        const remaining = remainingOrders(params.row);
        let barColor = null;
        if (remaining === 0) barColor = 'error';
        else if (remaining !== null && remaining <= SOON_ORDERS) barColor = 'warning';

        return (
          <Box sx={{ width: 1, height: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.6 }}>
            <Typography
              variant="caption"
              sx={{ color: barColor ? `${barColor}.dark` : 'text.secondary', fontWeight: barColor ? 600 : 400 }}
            >
              {!valid
                ? '—'
                : remaining === 0
                  ? `${used} de ${total} · sin envíos`
                  : remaining <= SOON_ORDERS
                    ? `${used} de ${total} · quedan ${remaining}`
                    : `${used} de ${total} envíos`}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 6,
                borderRadius: 999,
                ...(barColor && {
                  '& .MuiLinearProgress-bar': { bgcolor: `${barColor}.main` },
                }),
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'state',
      headerName: 'Estado',
      width: 124,
      // Ordena por lo que significa, no por el texto: primero los clientes,
      // despues los registrados sin compra, al final las cuentas apagadas.
      valueGetter: (value, row) => {
        const kind = customerStatus(row);
        if (kind === CUSTOMER.customer) return 0;
        if (kind === CUSTOMER.prospect) return 1;
        return 2;
      },
      renderCell: (params) => {
        const kind = customerStatus(params.row);
        const color =
          kind === CUSTOMER.customer
            ? { color: 'success.dark', bgcolor: 'success.lighter' }
            : kind === CUSTOMER.prospect
              ? { color: 'warning.dark', bgcolor: 'warning.lighter' }
              : { color: 'grey.700', bgcolor: 'grey.200' };

        return (
          <Box sx={{ height: 1, display: 'flex', alignItems: 'center' }}>
            <Chip size="small" label={CUSTOMER_LABEL[kind]} sx={color} />
          </Box>
        );
      },
    },
    {
      field: 'acciones',
      headerName: '',
      width: 64,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'right',
      renderCell: (params) => <UserRowActions row={params.row} onAction={onAction} />,
    },
  ];
}
