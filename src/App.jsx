import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import './App.css';
//import MenuInferior from './components/MenuInferior';
import Header from './components/Header';
import InicioProduccion from './pages/InicioProduccion';
import Catalogos from './pages/MenuCatalogos';
import Operadores from './pages/Operadores';
import FinProduccion from './pages/FinProduccion';
import LoginScreen, { AuthProvider, AuthContext } from './auth/Auth';
import { ProduccionProvider } from './context/ProduccionContex';
import { ParoProvider } from './context/ParoContext';
import { EnviarCorreoxHoraProvider } from './context/EnviarCorreoxHoraParp';

// --- COMPONENTE RASTREADOR (Sobrevive al F5) ---
// Este componente invisible guarda la página actual en localStorage cada vez que cambias de pantalla
const RouteTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // No queremos guardar el login ni la raíz como "última ruta"
    if (location.pathname !== '/login' && location.pathname !== '/') {
      localStorage.setItem('ultimaPantalla', location.pathname);
    }
  }, [location]);

  return null; // No dibuja nada en la pantalla
};

// --- COMPONENTE GUARDIÁN (Rutas Protegidas) ---
const ProtectedRoute = () => {
  const { user } = useContext(AuthContext);

  // Si "user" es nulo, significa que no está logueado. Lo mandamos al login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si SÍ está logueado, renderiza la pantalla que pidió Y el menú inferior
  return (
    <>
      <header><Header /></header>
      <main className="mx-4 md:mx-8 xl:mx-auto xl:max-w-7xl bg-white shadow-md rounded-2xl p-4 md:p-6 min-h-[75vh] border border-gray-100">
        <Outlet />
      </main>
      <footer>
      </footer>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProduccionProvider>
        <ParoProvider>
          <EnviarCorreoxHoraProvider>
          <HashRouter>
            {/* RASTREADOR INVISIBLE */}
            <RouteTracker />

            {/* EL CONTENEDOR MÁGICO */}
            <div className="min-h-screen w-full bg-gray-50 pb-20">

              {/* Área dinámica donde se inyectan las pantallas */}
              <Routes>
                {/* 1. RUTA PÚBLICA: El login (Lector QR) */}
                <Route path="/login" element={<LoginScreen />} />
                
                {/* 2. RUTAS PRIVADAS: Envueltas por el guardián */}
                <Route element={<ProtectedRoute />}>
                  
                  {/* TRAMPOLÍN: Si entras a la raíz (/), lee el localStorage.
                      Si no hay nada guardado (ej. primera vez), te manda a /operadores por defecto */}
                  <Route 
                    path="/" 
                    element={<Navigate to={localStorage.getItem('ultimaPantalla') || "/operadores"} replace />} 
                  />
                  
                  <Route path="/operadores" element={<Operadores />} />
                  <Route path="/catalogos" element={<Catalogos />} />
                  <Route path="/inicio-produccion" element={<InicioProduccion />} />
                  <Route path="/fin-produccion" element={<FinProduccion />} />
                  <Route path="/fin-produccion/:tipoCierre" element={<FinProduccion />} />
                </Route>

                {/* 3. COMODÍN: Si escriben una URL rara, mándalos a la raíz (y el trampolín hará el resto) */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

            </div>
          </HashRouter>
          </EnviarCorreoxHoraProvider>
        </ParoProvider>
      </ProduccionProvider>
    </AuthProvider>
  );
}