import './assets/css/global.scss';

import { BrowserRouter, Routes, Route } from "react-router";
import DashboardPage from './pages/Dashboard/Dashboard';
import PageMenus from './pages/Menus/Menus';
import PageProgram from './pages/Program/Program';
import LoginPage from './pages/Auth/Login/Login';

import AuthContextProvider from './context/authContext';
import ProtectedRoutes from './components/util/ProtectedRoutes.js/ProtectedRoutes';
import ComandaPage from './pages/Comanda/Comanda';

import PageAsignarRutas from './pages/Asignar-rutas/Asignar-rutas';
import PageRutas from './pages/Rutas/Rutas';
import PageMotorizado from './pages/Motorizado/Motorizado';
import PageMotorizados from './pages/Motorizados/Motorizados';
import PageMotorizadoIrvin from './pages/Motorizado/MotorizadoIrvin';
import PageUsuarios from './pages/Usuarios/Usuarios';
import PagePlanes from './pages/Planes/Planes';
import NotFoundPage from './pages/NotFound/NotFound';

function App() {
  return (
    <AuthContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path='' element={<ProtectedRoutes />}>
              <Route path="/" element={ <DashboardPage /> } />
              <Route path="/usuarios" element={ <PageUsuarios /> } />

              <Route path="/planes" element={ <PagePlanes /> } />

              <Route path="/menu" element={ <PageMenus /> } />
              <Route path="/programar" element={ <PageProgram /> } />
              <Route path="/motorizado" element={ <PageMotorizado /> } />
              
              <Route path="/motorizados" element={ <PageMotorizados /> } />
              <Route path="/asignar-rutas" element={ <PageAsignarRutas /> } />
              <Route path="/rutas" element={ <PageRutas /> } />
              <Route path="/ver-mis-rutas" element={ <PageAsignarRutas /> } />
              
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
  );
}

export default App;
