import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/Auth';
import { ApiService } from '../services/ApiService';
import { useProduccion } from '../context/ProduccionContex';
import { LogOut } from 'lucide-react';
import LogoutModal from './ModalCierre'; // Ajusta la ruta a tu estructura

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { logout } = useContext(AuthContext);
  const { claveProduccion } = useProduccion();
  const location = useLocation();
  const [lote, setLote] = useState(null);
  const [hora_inicio, setHoraInicio] = useState(null);
  const [piezasBuenasAnteriores, setPiezasBuenasAnteriores] = useState(0);

  // Estado para controlar la visibilidad del modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Ejecuta el cierre de sesión enviando usuario y contraseña recibidos desde el modal
  const handleConfirmLogout = async ({ username, password }) => {
    // Si tu contexto recibe parámetros: logout(username, password) o logout({ username, password })
    await logout({ username, password });
  };

  useEffect(() => {
    getProduccion();
  }, [claveProduccion, location.pathname]);

  const getProduccion = async () => {
    try {
      if (!claveProduccion) {
        setLote(null);
        return;
      }
      const response = await ApiService.getProduccion(claveProduccion);
      if (response && response.result) {
        setLote(response.result.lote || null);
        setHoraInicio(response.result.hora_inicio || null);

        if (response.result.id_lote && response.result.id_maquina) {
          const total = await getProduccionActiveByLoteMaquina(
            response.result.id_lote,
            response.result.id_maquina
          );
          setPiezasBuenasAnteriores(total);
        }
      } else {
        setLote(null);
        setHoraInicio(null);
        setPiezasBuenasAnteriores(0);
      }
    } catch (error) {
      console.error('Error al obtener producción:', error);
      setLote(null);
    }
  };

  const getProduccionActiveByLoteMaquina = async (id_lote, id_maquina) => {
    const response = await ApiService.getProduccionActiveByLoteMaquina(id_lote, id_maquina);
    const resultado = response.result;
    if (!Array.isArray(resultado) || resultado.length === 0) {
      return 0;
    }

    const total_piezas_buenas = resultado.reduce((acumulador, registro) => {
      const piezas = Number(registro.piezas_buenas) || 0;
      return acumulador + piezas;
    }, 0);

    return total_piezas_buenas;
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-300 shadow-sm">
        {/* Título e Icono del Header */}
        <div className="flex items-center gap-3">
          <img
            src="https://drive.google.com/thumbnail?id=1zyFODVeM0PNpjJV9uqKIWWKJE67aCFaZ&sz=w800"
            alt="Dankel Logo"
            className="h-10 md:h-12 w-auto object-contain"
          />
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md"></div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
            Panel de Control
          </h1>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 md:gap-6">
          <h2 className="text-lg md:text-2xl font-bold">
            Producción ID: {claveProduccion ? claveProduccion : <span className="text-slate-400 italic">Sin asignar</span>}
          </h2>
          <div className="w-px h-8 bg-slate-300 hidden md:block"></div>
          <h2 className="text-lg md:text-2xl font-bold text-blue-700">
            Lote: {lote ? lote : <span className="text-slate-400 italic">Sin asignar</span>}
          </h2>
          <div className="w-px h-8 bg-slate-300 hidden md:block"></div>
          <h2 className="text-lg md:text-2xl font-bold text-blue-700">
            Hora Inicio: {hora_inicio ? hora_inicio : <span className="text-slate-400 italic">Sin asignar</span>}
          </h2>
          <div className="w-px h-8 bg-slate-300 hidden md:block"></div>
          <h2 className="text-lg md:text-2xl font-bold text-green-700">
            Piezas buenas anteriores: {piezasBuenasAnteriores}
          </h2>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-red-500/30 active:scale-95 border border-transparent hover:border-red-200"
          >
            <LogOut size={22} />
            <span className="hidden sm:block">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Componente Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}