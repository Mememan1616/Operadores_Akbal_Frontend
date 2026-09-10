import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/Auth';
import { ApiService } from '../services/ApiService';
import { useProduccion } from '../context/ProduccionContex';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { logout } = useContext(AuthContext);
  const { claveProduccion } = useProduccion();
  const location = useLocation();
  const [lote, setLote] = useState(null);
  const [hora_inicio, setHoraInicio] = useState(null);
  const [piezasBuenasAnteriores, setPiezasBuenasAnteriores] = useState(0);


  const handleLogout = () => {
    try {
      // Lógica para cerrar sesión
      //localStorage.removeItem('userData');
      //localStorage.removeItem('token');
      //setIsLoggingOut(true);
      logout();
      //window.location.href = '/login';
      //window.location.reload();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  useEffect(() => {
    getProduccion();

  }, [claveProduccion, location.pathname]);

  const getProduccion = async () => {
    try {
      if (!claveProduccion) {
        setLote(null); // Limpiar si no hay clave
        return;
      }
      const response = await ApiService.getProduccion(claveProduccion);
      // 2. IMPORTANTE: Guardar el dato en el estado
      // Asumiendo que el objeto result tiene una propiedad llamada 'lote' o similar
      //const result = response.result
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

    // 2. Sumar directamente las piezas_buenas recorriendo el arreglo
    const total_piezas_buenas = resultado.reduce((acumulador, registro) => {
      // Convertimos a Number por si viene como flotante/string (ej: 0.0)
      const piezas = Number(registro.piezas_buenas) || 0;
      return acumulador + piezas;
    }, 0);

    // 3. Retornar el total sumado
    return total_piezas_buenas;
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-300 shadow-sm">

      {/* Título e Icono del Header */}
      <div className="flex items-center gap-3">

        {/* 1. Imagen movida al inicio con ajustes de tamaño */}

        <img
          src="https://drive.google.com/thumbnail?id=1zyFODVeM0PNpjJV9uqKIWWKJE67aCFaZ&sz=w800"
          alt="Dankel Logo"
          className="h-10 md:h-12 w-auto object-contain"
        />
        {/* 2. Div azul (Nota: actualmente está vacío. Si no lleva un icono, puedes eliminarlo) */}
        <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md">
        </div>

        {/* 3. Título */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
          Panel de Control
        </h1>
      </div>

      {/* Acciones: Tema y Cerrar Sesión */}
      <div className="flex items-center gap-3 md:gap-6">
        <h2 className="text-lg md:text-2xl font-bold ">
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

        {/* Botón Cerrar Sesión 
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 text-base font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-red-500/30 active:scale-95 border border-transparent hover:border-red-200"
        >
          <LogOut size={22} />
          <span className="hidden sm:block">Cerrar Sesión</span>
        </button>*/}
      </div>
    </header>
  );
}