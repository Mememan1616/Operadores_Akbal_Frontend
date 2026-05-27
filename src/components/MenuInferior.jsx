import { NavLink } from 'react-router-dom';
import { Users, Settings, Clock, AlertOctagon,ListChecks } from 'lucide-react';
export default function MenuInferior() {
  // Función para aplicar estilos dinámicos dependiendo de si la pestaña está activa
  const obtenerClases = ({ isActive }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
      isActive ? 'text-blue-600' : 'text-gray-400 hover:text-blue-400'
    }`;

  return (
    // fixed bottom-0 ancla el menú en la parte inferior de la pantalla
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex justify-around items-center h-16">
        
        {/* Botón Inicio */}
        <NavLink to="/" className={obtenerClases}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Inicio</span>
        </NavLink>

        {/* Botón Lector QR */}
        <NavLink to="/catalogos" className={obtenerClases}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <ListChecks />
          </svg>
          <span className="text-xs font-medium">Catalogos</span>
        </NavLink>
        {/* Botón para operadores*/}
        <NavLink to="/operadores" className={obtenerClases}>
          <svg className="w-6 h-6" 
          fill="none" stroke="currentColor"
           viewBox="0 0 24 24">
            <path strokeLinecap="round" 
            strokeLinejoin="round"
             strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="text-xs font-medium">Operadores</span>
        </NavLink>
         <NavLink to="/inicio-produccion" className={obtenerClases}>
          <svg className="w-6 h-6" 
          fill="none" stroke="currentColor"
           viewBox="0 0 24 24">
             <ListChecks />
          </svg>
          <span className="text-xs font-medium">Inicio Produccion</span>
        </NavLink>
         <NavLink to="/fin-produccion" className={obtenerClases}>
          <svg className="w-6 h-6" 
          fill="none" stroke="currentColor"
           viewBox="0 0 24 24">
             <ListChecks />
          </svg>
          <span className="text-xs font-medium">Fin Produccion</span>
        </NavLink>

      </div>
    </nav>
  );
}
