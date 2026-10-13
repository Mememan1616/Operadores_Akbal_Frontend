import React, { createContext, useState, useContext } from 'react';
import { ApiService, validarClave, estaCerrado } from '../services/ApiService';

// 1. Creamos el contexto
export const ParoContext = createContext(null);

// 2. Creamos el Provider que envolverá tu aplicación
export const ParoProvider = ({ children }) => {
  // Inicializamos leyendo el localStorage para que sobreviva si recargan la página
  const [claveParo, setClaveParo] = useState(() => {
    try {
      const paroGuardado = localStorage.getItem('clave_paro_activo');
      // Usamos JSON.parse por si decides guardar un objeto completo en lugar de solo un string
      return paroGuardado ? JSON.parse(paroGuardado) : null; 
    } catch (error) {
      console.error("Error leyendo la clave del paro de localStorage", error);
      return null;
    }
  });

  // 3. Función para activar el paro (guarda en estado y localStorage)
  const iniciarParo = (clave) => {
    setClaveParo(clave);
    localStorage.setItem('clave_paro_activo', JSON.stringify(clave));
  };

  // 4. Función para limpiar el paro (cuando se reanuda la producción)
  const terminarParo = () => {
    setClaveParo(null);
    localStorage.removeItem('clave_paro_activo');
  };

  // 5. Cierre seguro: cierra el paro y verifica por lectura que quedó cerrado
  const cerrarParo = async (data) => {
    validarClave(claveParo, 'cerrarParo');

    const MAX_INTENTOS = 3;
    for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
      await ApiService.updateRegistroParo(claveParo, data);

      if (await verificarCierre(claveParo)) {
        terminarParo();
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error('No se pudo confirmar el cierre del paro. Reintenta.');
  };

  // 6. Actualiza el tipo de paro en la BD apenas se elige, sin cerrar el paro
  const actualizarTipoParo = async (data) => {
    validarClave(claveParo, 'actualizarTipoParo');
    return await ApiService.updateRegistroParo(claveParo, data);
  };

  return (
    <ParoContext.Provider value={{ claveParo, iniciarParo, terminarParo, cerrarParo, actualizarTipoParo }}>
      {children}
    </ParoContext.Provider>
  );
};

// 5. Hook personalizado (Opcional, pero hace el código más limpio al usarlo)
export const useParo = () => {
  return useContext(ParoContext);
};

// Verificación por lectura: confirma que un registro quedó cerrado en la BD.
// Reusado para producción y paros (estatus false + hora de término real).
// Si la lectura falla (red), se trata como no confirmado para reintentar.
const verificarCierre = async (clave) => {
  try {
    const registro = await ApiService.getRegistroParoById(clave);
    return estaCerrado(registro?.result);
  } catch {
    return false;
  }
};