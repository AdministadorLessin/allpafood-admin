import './assets/css/global.scss';

import { BrowserRouter, Routes, Route } from "react-router";
import DashboardPage from './pages/Dashboard/Dashboard';
import PageMenus from './pages/Menus/Menus';
import PageProgram from './pages/Program/Program';
import LoginPage from './pages/Auth/Login/Login';

import AuthContextProvider from './context/authContext';
import ProtectedRoutes from './components/util/ProtectedRoutes.js/ProtectedRoutes';
import ComandaPage from './pages/Comanda/Comanda';

import PageRutas from './pages/Rutas/Rutas';
import PageMotorizado from './pages/Motorizado/Motorizado';
import PageMotorizados from './pages/Motorizados/Motorizados';
import PageMotorizadoIrvin from './pages/Motorizado/MotorizadoIrvin';
import PageUsuarios from './pages/Usuarios/Usuarios';
import PagePlanes from './pages/Planes/Planes';
import PageVentas from './pages/Ventas/Ventas';
import NotFoundPage from './pages/NotFound/NotFound';
import CoberturaPage from './pages/Cobertura/Cobertura';
import PantallaError from './components/util/PantallaError';
import AccesosPage from './pages/Accesos/Accesos';
import EmpresasPage from './pages/Empresas/Empresas';
import TarjetasPage from './pages/Tarjetas/Tarjetas';

function App() {
  return (
    <PantallaError>
    <AuthContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path='' element={<ProtectedRoutes />}>
              <Route path="/" element={ <DashboardPage /> } />
              <Route path="/usuarios" element={ <PageUsuarios /> } />

              <Route path="/planes" element={ <PagePlanes /> } />
              <Route path="/ventas" element={ <PageVentas /> } />

              <Route path="/menu" element={ <PageMenus /> } />
              <Route path="/programar" element={ <PageProgram /> } />
              <Route path="/motorizado" element={ <PageMotorizado /> } />
              
              <Route path="/motorizados" element={ <PageMotorizados /> } /> } />
              <Route path="/rutas" element={ <PageRutas /> } /> } />
              <Route path="/cobertura" element={ <CoberturaPage /> } />
              <Route path="/accesos" element={ <AccesosPage /> } />
              <Route path="/empresas" element={ <EmpresasPage /> } />
              <Route path="/tarjetas" element={ <TarjetasPage /> } />
              
            </Route>
            <Route path="/ingresar" element={ <LoginPage/> } />
            <Route path="/comanda" element={ <ComandaPage/> } />
            <Route path="/irvin" element={ <PageMotorizadoIrvin /> } />

            {/* Comodin: cualquier ruta que no coincida. Sin esto, una URL
                desconocida no renderiza nada y deja la pantalla en blanco. */}
            <Route path="*" element={ <NotFoundPage /> } />
          </Routes>
        </BrowserRouter>
    </AuthContextProvider>
    </PantallaError>
  );
}

export default App;
