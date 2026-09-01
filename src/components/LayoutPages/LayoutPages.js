// Shell de la aplicacion. Mantiene la misma API que antes ({children, cssClass})
// para que las 7 paginas que lo consumen no cambien ni una linea.
//
// Estructura tomada de Material Kit (layouts/core/layout-section.tsx):
// el riel de navegacion y la cabecera son slots, el contenido es el hijo.

import { useState } from 'react';

import Box from '@mui/material/Box';

import './LayoutPages.scss';
import BackdropApp from './../util/backdrop/backdrop';
import DashboardNav, { NAV_WIDTH } from '../../layouts/dashboard/DashboardNav';
import DashboardHeader from '../../layouts/dashboard/DashboardHeader';
import { useAuthContext } from '../../context/authContext';

const LayoutPages = ({ children, cssClass }) => {
    const { planInfo } = useAuthContext();
    const [navOpen, setNavOpen] = useState(false);

    return (
        <main className={cssClass ? 'pageBox ' + cssClass : ' pageBox'}>

            <BackdropApp />

            <DashboardNav
                role={planInfo?.role}
                open={navOpen}
                onClose={() => setNavOpen(false)}
            />

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: '100%',
                    pl: { xs: 0, lg: `${NAV_WIDTH}px` },
                }}
            >
                <DashboardHeader onOpenNav={() => setNavOpen(true)} />

                <div className="pageContent">
                    {children}
                </div>
            </Box>
        </main>
    )
};

export default LayoutPages;
