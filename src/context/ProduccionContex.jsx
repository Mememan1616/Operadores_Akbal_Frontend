import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Creamos el contexto
export const ProduccionContext = createContext();

// 2. Creamos el Provider
export const ProduccionProvider = ({ children }) => {
  
  // INICIO SEGURO: Buscamos la clave en localStorage al encender la tablet
  const [claveProduccion, setClaveProduccion] = useState(() => {
    try {
      const claveGuardada = localStorage.getItem('clave_produccion_activa');
      // Si existe, la convertimos de vuelta (asumiendo que es un texto/string)
      return claveGuardada ? JSON.parse(claveGuardada) : null;
    } catch (error) {
      console.error("Error leyendo la clave de producción:", error);
      return null;
    }
  });

  const [tipo_cierreContext, setTipoCierreContext] = useState(() => {
    try {
      const cierreGuardado = localStorage.getItem('tipo_cierre');
      // Si existe, la convertimos de vuelta (asumiendo que es un texto/string)
      return cierreGuardado ? JSON.parse(cierreGuardado) : null;
    } catch (error) {
      console.error("Error leyendo el tipo de cierre:", error);
      return null;
    }
  });

  // SINCRONIZACIÓN AUTOMÁTICA: Si la clave cambia (inician lote o lo terminan), actualizamos el disco duro
  useEffect(() => {
    try {
      if (claveProduccion) {
        // Si hay una clave activa, la guardamos
        localStorage.setItem('clave_produccion_activa', JSON.stringify(claveProduccion));
      } else {
        // Si es null (significa que terminaron el lote), borramos el rastro
        localStorage.removeItem('clave_produccion_activa');
      }
      if (tipo_cierreContext) {
        // Si hay una clave activa, la guardamos
        localStorage.setItem('tipo_cierre', JSON.stringify(tipo_cierreContext));
      } else {
        // Si es null (significa que terminaron el lote), borramos el rastro
        localStorage.removeItem('tipo_cierre');
      }
    } catch (error) {
      console.error("Error guardando la clave de producción:", error);
    }
  }, [claveProduccion, tipo_cierreContext]); // <- Este useEffect vigila a la claveProduccion

  // Función extra (muy útil para el botón de "Finalizar Lote")
  const limpiarProduccion = () => {
    setClaveProduccion(null);
    setTipoCierreContext(null);
  };

  return (
    <ProduccionContext.Provider value={{ claveProduccion, setClaveProduccion, limpiarProduccion, tipo_cierreContext, setTipoCierreContext }}>
      {children}
    </ProduccionContext.Provider>
  );
};

// 3. Hook personalizado para usarlo más fácil
export const useProduccion = () => useContext(ProduccionContext);