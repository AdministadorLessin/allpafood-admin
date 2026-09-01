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

export default function UserRowActions({ row, onAction }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const run = (form) => (event) => {
    event.stopPropagation();
    setAnchorEl(null);
    onAction(row, form);
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
      </Menu>
    </>
  );
}
