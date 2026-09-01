// Cabecera. La app no tenia ninguna: no habia forma de saber con que cuenta
// estabas dentro, ni de salir. Estructura tomada de Material Kit
// (layouts/core/header-section.tsx + components/account-popover.tsx).

import { useState } from 'react';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';

import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuthContext } from '../../context/authContext';

/** Etiqueta legible del rol que viene en el token. */
const ROLE_LABEL = {
  ADMIN: 'Administrador',
  DELIVERY: 'Motorizado',
  USER: 'Usuario',
};

export default function DashboardHeader({ onOpenNav }) {
  const navigate = useNavigate();
  const { planInfo, setToken, setPlanInfo } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState(null);

  const email = planInfo?.log || planInfo?.profile?.email || '';
  const role = planInfo?.role || '';
  const initial = (email || 'A').charAt(0).toUpperCase();

  const handleLogout = () => {
    setAnchorEl(null);
    window.localStorage.removeItem('aftkn');
    window.localStorage.removeItem('inf');
    setPlanInfo(null);
    setToken();
    navigate('/ingresar');
  };

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: { xs: 2, lg: 4 },
        py: 1.5,
        minHeight: 64,
      }}
    >
      <IconButton
        onClick={onOpenNav}
        aria-label="Abrir menú"
        sx={{ display: { lg: 'none' } }}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        onClick={(event) => setAnchorEl(event.currentTarget)}
        role="button"
        tabIndex={0}
        aria-label="Cuenta"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') setAnchorEl(event.currentTarget);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          pl: 0.75,
          pr: 2,
          py: 0.75,
          cursor: 'pointer',
          borderRadius: 999,
          bgcolor: 'background.paper',
          boxShadow: (theme) => theme.customShadows.z1,
          transition: 'background-color .18s ease',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.darker', fontSize: 15 }}>
          {initial}
        </Avatar>
        <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="subtitle2" noWrap sx={{ lineHeight: 1.3 }}>
            {email || 'Cuenta'}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
            {ROLE_LABEL[role] || role}
          </Typography>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 220, p: 1 } } }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {email || 'Cuenta'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {ROLE_LABEL[role] || role}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </Box>
  );
}
