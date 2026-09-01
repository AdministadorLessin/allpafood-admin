// Riel de navegacion. Se alimenta de nav-config-dashboard y se pinta con el
// tema, sin hoja de estilos propia. Estructura tomada de Material Kit
// (layouts/dashboard/nav.tsx): permanente en escritorio, Drawer en movil.

import { Link, useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import logoAllpa from '../../assets/img/allpafood_logo.png';
import { getNavData } from '../nav-config-dashboard';

export const NAV_WIDTH = 264;

function NavContent({ role, onNavigate }) {
  const location = useLocation();
  const navData = getNavData(role);

  return (
    <Box
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        px: 2,
        py: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ px: 1, mb: 3.5 }}>
        <Box component="img" src={logoAllpa} alt="Allpa Food" sx={{ width: 160 }} />
      </Box>

      <MenuList sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navData.map((item) => {
          const active = location.pathname === item.path;

          return (
            <MenuItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={onNavigate}
              disableRipple
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 999,
                color: active ? 'grey.800' : 'text.secondary',
                bgcolor: active ? 'secondary.main' : 'transparent',
                fontWeight: active ? 600 : 500,
                '& .MuiListItemIcon-root': { color: active ? 'grey.800' : 'grey.500' },
                '&:hover': {
                  bgcolor: active ? 'secondary.main' : 'grey.100',
                  color: 'grey.800',
                  '& .MuiListItemIcon-root': { color: 'grey.800' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  fontSize: 14.5,
                  fontWeight: 'inherit',
                  letterSpacing: '-0.1px',
                }}
              >
                {item.title}
              </ListItemText>
            </MenuItem>
          );
        })}
      </MenuList>
    </Box>
  );
}

export default function DashboardNav({ role, open, onClose }) {
  return (
    <>
      {/* Escritorio: riel fijo */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: NAV_WIDTH,
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          borderRight: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.appBar - 1,
        }}
      >
        <NavContent role={role} />
      </Box>

      {/* Movil: cajon temporal */}
      <Drawer
        open={open}
        onClose={onClose}
        sx={{ display: { lg: 'none' } }}
        PaperProps={{ sx: { width: NAV_WIDTH } }}
      >
        <NavContent role={role} onNavigate={onClose} />
      </Drawer>
    </>
  );
}
