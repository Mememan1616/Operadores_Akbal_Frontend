import React, { createContext, useState, useContext, useEffect } from 'react';
import { enviarReporteParo } from './CorreoFuncion';
import { ApiService } from '../services/ApiService';
import { useParo } from '../context/ParoContext';
import { AuthContext } from '../auth/Auth';

export const EnviarCorreoxHora = createContext(null);

export const EnviarCorreoxHoraProvider = ({ children }) => {
    console.log("hola desde el provider contextto");
    const { claveParo } = useParo();
    const { user } = useContext(AuthContext);

    const [registroParo, setRegistroParo] = useState(null);
    const [produccion, setProduccion] = useState(null);
    const [horasReportadas, setHorasReportadas] = useState(0);

    // --- EFECTO 1: Traer los datos de la API cuando cambie la clave del paro ---
    useEffect(() => {
        console.log("Cambiando la clave del paro:", claveParo);
        const obtenerDatosParo = async () => {
            if (!claveParo) {
                setRegistroParo(null);
                setProduccion(null);
                setHorasReportadas(0); // Reiniciar el contador si el paro finaliza
                return;
            }

            try {
                const datos = await ApiService.getRegistroParoById(claveParo);
                console.log("Datos obtenidos de la API:", datos);
                
                const registro_prod = await ApiService.getProduccion(datos.result.id_produccion);
                console.log("Producción obtenida de la API:", registro_prod);

                setRegistroParo(datos.result);
                setProduccion(registro_prod.result);
            } catch (error) {
                console.error("Error al consultar el registro del paro mediante la API:", error);
            }
        };

        obtenerDatosParo();
    }, [claveParo]);

    // --- EFECTO 2: Controlar el temporizador recurrente cada 2 horas ---
    useEffect(() => {
        // No hacer nada si faltan datos esenciales
        if (!claveParo || !registroParo || !produccion) return;

        const revisarTiempo = async () => {
            const ahora = new Date();
            
            // 1. Separar y asegurar formato de dos dígitos para día y mes
            const [dia, mes, anio] = registroParo.fecha_produccion.split('/');
            const diaPad = dia.padStart(2, '0');
            const mesPad = mes.padStart(2, '0');

            // 2. Fusionar en formato estándar ISO
            const formatoISO = `${anio}-${mesPad}-${diaPad}T${registroParo.hora_inicio}`;
            const inicio = new Date(formatoISO);

            // 3. Validar que la fecha sea válida
            if (isNaN(inicio.getTime())) return;

            // 4. Calcular horas transcurridas reales (diferencia ms / ms en 1 hora)
            const diferenciaMs = ahora - inicio;
            const horasTranscurridas = diferenciaMs / (1000 * 60 * 60);

            // 5. Determinar la siguiente meta de reporte (2h, 4h, 6h, etc.)
            const tiempo_reporte = 2;
            const siguienteMeta = horasReportadas + tiempo_reporte;

            console.log(`Horas transcurridas: ${horasTranscurridas.toFixed(2)}h | Siguiente meta: ${siguienteMeta}h`);

            if (horasTranscurridas >= siguienteMeta) {
                try {
                    console.log(`¡Alerta! El paro alcanzó/superó las ${siguienteMeta} horas. Enviando reporte...`);
                    
                    const operador = user ? `${user.nombre || ''} ${user.apellidoP || ''} ${user.apellidoM || ''}`.trim() : "No asignado";

                    await enviarReporteParo({
                        operador: operador || "No asignado",
                        horas: horasTranscurridas.toFixed(1),
                        id_produccion: registroParo.id_produccion || claveParo,
                        maquina: produccion.maquina,
                        turno: produccion.turno,
                        lote: produccion.lote,
                        paro: registroParo.paro
                    });

                    // Actualizamos el hito alcanzado para esperar las siguientes 2 horas
                    setHorasReportadas(siguienteMeta);
                    console.log(`Correo enviado con éxito. Próximo aviso a las ${siguienteMeta + 2} horas.`);
                } catch (error) {
                    console.error("Error al enviar el correo automático:", error);
                }
            }
        };

        // Ejecutar revisión inmediata
        revisarTiempo();

        // Configurar revisión continua cada minuto
        const intervalo = setInterval(revisarTiempo, 60000);

        return () => clearInterval(intervalo);
    }, [claveParo, registroParo, produccion, horasReportadas, user]);

    return (
        <EnviarCorreoxHora.Provider value={{ registroParo, horasReportadas }}>
            {children}
        </EnviarCorreoxHora.Provider>
    );
};