// Menu de acciones por fila. Reemplaza el onCellClick que abria tres modales
// distintos segun la columna que tocaras, sin nada que lo indicara.
// Los modales son los mismos: solo cambia el disparador.

import { useState } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Divider from '@mui/material/Divider';

import { whatsappLink } from './user-phone';

export default function UserRowActions({ row, onAction }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const run = (form) => (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    onAction(row, form);
  };

  // No abre un modal ni toca el servidor: solo lleva a la conversacion. Por eso
  // se resuelve aca y no pasa por onAction como el resto.
  const chat = whatsappLink(row.phone);
  const escribir = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    window.open(chat, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Acciones de ${row.name || 'usuario'}`}
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 208, p: 0.5 } } }}
      >
        {/* Primero de la lista porque es lo unico que sirve para la fila de
            alguien que se registro y nunca pago: no hay plan que editar ni que
            cambiarle, hay que escribirle. */}
        <MenuItem onClick={escribir} disabled={!chat}>
          <ListItemIcon><WhatsAppIcon fontSize="small" /></ListItemIcon>
          {chat ? 'Escribir por WhatsApp' : 'Sin telefono'}
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        {/* Todo lo del cliente en una pantalla: plan, envios que le quedan,
            direccion, alergias y su contraseña. Es la entrada por defecto
            porque casi siempre lo primero es mirar, no editar. */}
        <MenuItem onClick={run('ficha')}>
          <ListItemIcon><PersonSearchOutlinedIcon fontSize="small" /></ListItemIcon>
          Ver ficha
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        {/* Arriba del resto porque es lo que se hace todos los dias: el
            cliente paga por Yape o transferencia y hay que reiniciarle el
            plan. Las otras dos entradas corrigen datos, no renuevan. */}
        <MenuItem onClick={run('renovar')}>
          <ListItemIcon><CardMembershipIcon fontSize="small" /></ListItemIcon>
          Renovar plan
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={run(1)}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          Editar usuario
        </MenuItem>
        <MenuItem onClick={run(2)}>
          <ListItemIcon><AutorenewIcon fontSize="small" /></ListItemIcon>
          Actualizar plan
        </MenuItem>
        <MenuItem onClick={run(3)}>
          <ListItemIcon><SwapHorizIcon fontSize="small" /></ListItemIcon>
          Cambiar plan
        </MenuItem>

        {/* Lo que de verdad se usa cuando un cliente se va: deja de recibir,
            se le cancelan los pedidos que quedaban programados y se conserva
            su historial. Eliminar es para una cuenta basura, no para alguien
            que fue cliente. */}
        <Divider sx={{ my: 0.5 }} />
        {row.statusNum === 0 ? (
          <MenuItem onClick={run('reactivar')}>
            <ListItemIcon><ReplayIcon fontSize="small" /></ListItemIcon>
            Reactivar cliente
          </MenuItem>
        ) : (
          <MenuItem onClick={run('baja')} sx={{ color: 'warning.dark' }}>
            <ListItemIcon><PersonOffOutlinedIcon fontSize="small" sx={{ color: 'warning.dark' }} /></ListItemIcon>
            Dar de baja
          </MenuItem>
        )}

        {/* Separado del resto y en rojo: es la unica accion de este menu que
            no se puede deshacer. El servidor ademas se niega a borrar a quien
            tenga facturas, asi que un cliente que pago no se puede perder por
            un clic distraido. */}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={run('eliminar')} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          Eliminar usuario
        </MenuItem>
      </Menu>
    </>
  );
}
