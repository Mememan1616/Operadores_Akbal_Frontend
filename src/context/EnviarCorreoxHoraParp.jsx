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
    const [tiempoSegundos, setTiempoSegundos] = useState(null);

    // --- EFECTO 1: Traer los datos de la API cuando cambie la clave del paro ---
    useEffect(() => {
        console.log("Cambiando la clave del paro:", claveParo);
        const obtenerDatosParo = async () => {
            if (!claveParo) {
                setRegistroParo(null);
                setProduccion(null);
                setHorasReportadas(0);
                setTiempoSegundos(null);
                return;
            }

            try {
                const datos = await ApiService.getRegistroParoById(claveParo);
                const tiempo = await ApiService.getCorreoDuracion();
                
                console.log("Datos del tiempo:", tiempo);
                setTiempoSegundos(tiempo.result.duracion_segundos);
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

    // --- EFECTO 2: Controlar el temporizador recurrente ---
    useEffect(() => {
        // Validación estricta: No continuar si falta algún dato fundamental
        if (!claveParo || !registroParo || !produccion || tiempoSegundos === null) return;

        const revisarTiempo = async () => {
            const ahora = new Date();
            
            // 1. Parsear fecha
            const [dia, mes, anio] = registroParo.fecha_produccion.split('/');
            const diaPad = dia.padStart(2, '0');
            const mesPad = mes.padStart(2, '0');

            const formatoISO = `${anio}-${mesPad}-${diaPad}T${registroParo.hora_inicio}`;
            const inicio = new Date(formatoISO);

            if (isNaN(inicio.getTime())) return;

            // 2. Horas transcurridas
            const diferenciaMs = ahora - inicio;
            const horasTranscurridas = diferenciaMs / (1000 * 60 * 60);

            // 3. Siguiente meta (segundos a horas)
            const tiempoReporteHoras = tiempoSegundos / 3600;
            const siguienteMeta = horasReportadas + tiempoReporteHoras;

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

                    setHorasReportadas(siguienteMeta);
                    console.log(`Correo enviado con éxito. Próximo aviso en +${tiempoReporteHoras} horas.`);
                } catch (error) {
                    console.error("Error al enviar el correo automático:", error);
                }
            }
        };

        revisarTiempo();
        const intervalo = setInterval(revisarTiempo, 60000);

        return () => clearInterval(intervalo);
    }, [claveParo, registroParo, produccion, horasReportadas, user, tiempoSegundos]);

    return (
        <EnviarCorreoxHora.Provider value={{ registroParo, horasReportadas }}>
            {children}
        </EnviarCorreoxHora.Provider>
    );
};