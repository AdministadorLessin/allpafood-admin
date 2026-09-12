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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
