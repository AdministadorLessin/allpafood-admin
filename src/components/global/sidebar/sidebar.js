import {useEffect,useState} from "react";
import './sidebar.scss';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ContentPaste from '@mui/icons-material/ContentPaste';
import RouteIcon from '@mui/icons-material/Route';
import MopedIcon from '@mui/icons-material/Moped';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PeopleIcon from '@mui/icons-material/People';
import DateRangeIcon from '@mui/icons-material/DateRange';

import { Link,useLocation  } from "react-router";

import logoAllpa from '../../../assets/img/allpafood_logo.png';
import { useAuthContext } from './../../../context/authContext';

const Sidebar = (props) => {
  const location = useLocation();

  const { token, planInfo } = useAuthContext();
  const [dataUser,setDataUser] = useState();
  
  useEffect(()=>{
    //console.log('sidebar',planInfo.role)
    if(token){
      setDataUser(token);
    }
  },[])

  return (
    <div className="sidebarBox">
      <div className="logoBox">
        <img src={logoAllpa} alt="" />
      </div>

      {planInfo && planInfo.role !== 'DELIVERY' ?
        <div className="inlineFlex menuList">
          <MenuList>

            <MenuItem className={location.pathname === '/usuarios' ? 'active': null}>
              <Link to={'/usuarios'}>
                <ListItemIcon>
                  <PeopleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Usuarios</ListItemText>
              </Link>
            </MenuItem>

            <MenuItem className={location.pathname === '/planes' ? 'active': null}>
              <Link to={'/planes'}>
                <ListItemIcon>
                  <PeopleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Planes</ListItemText>
              </Link>
            </MenuItem>

            <MenuItem className={location.pathname === '/menu' ? 'active': null}>
              <Link to={'/menu'}>
                <ListItemIcon>
                  <RestaurantMenuIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Menus</ListItemText>
              </Link>
            </MenuItem>

            <MenuItem className={location.pathname === '/programar' ? 'active': null}>
              <Link to={'/programar'}>
                <ListItemIcon>
                  <DateRangeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Programar</ListItemText>
              </Link>
            </MenuItem>


            <MenuItem className={location.pathname === '/motorizados' ? 'active': null}>
              <Link to={'/motorizados'}>
                <ListItemIcon>
                  <MopedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Motorizados</ListItemText>
              </Link>
            </MenuItem>

            <MenuItem className={location.pathname === '/mis-rutas' ? 'active': null}>
              <Link to={'/asignar-rutas'}>
                <ListItemIcon>
                  <RouteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Asignar rutas</ListItemText>
              </Link>
            </MenuItem>
            
            <MenuItem className={location.pathname === '/comanda' ? 'active': null}>
              <Link to={'/comanda'}>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Comanda</ListItemText>
              </Link>
            </MenuItem>
            
          </MenuList>
        </div>
      :
        <div className="inlineFlex menuList">
          <MenuList fullWidth>
            <MenuItem className={location.pathname === '/mis-rutas' ? 'active': null}>
              <Link to={'/motorizado'}>
                <ListItemIcon>
                  <RouteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Ver mis rutas</ListItemText>
              </Link>
            </MenuItem>
          </MenuList>
        </div>
      }



    </div>
  )
};

export default Sidebar;
