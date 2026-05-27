import React, { createContext, useState, useContext, useEffect } from 'react';
import { enviarReporteParo } from './CorreoFuncion';
import { ApiService } from '../services/ApiService';
import { useParo } from '../context/ParoContext'; // El contexto que tiene la clave

export const EnviarCorreoxHora = createContext(null);

export const EnviarCorreoxHoraProvider = ({ children }) => {
    console.log("hola desde el provider contextto");
    const { claveParo } = useParo();
    // 1. Corregido el useState y usando minúsculas para seguir buenas prácticas
    const [registroParo, setRegistroParo] = useState(null);
    const [correoEnviado, setCorreoEnviado] = useState(false);
    const [horasReportadas, setHorasReportadas] = useState(0);
    // --- EFECTO 1: Traer los datos de la API cuando cambie la clave del paro ---
    useEffect(() => {
        console.log("hola");
        console.log("Cambiando la clave del paro:", claveParo);
        const obtenerDatosParo = async () => {
            if (!claveParo) {
                setRegistroParo(null);
                setCorreoEnviado(false); // Resetear si el paro se termina
                return;
            }

            try {
                const datos = await ApiService.getRegistroParoById(claveParo);
                console.log("Datos del paro cargados de la API:", datos);
                setRegistroParo(datos.result);
            } catch (error) {
                console.error("Error al consultar el registro del paro mediante la API:", error);
            }
        };

        obtenerDatosParo();
    }, [claveParo]);


    // --- EFECTO 2: Controlar el temporizador de 1 hora ---
    useEffect(() => {
        // No hacer nada si: no hay clave, no han llegado los datos de la API, o el correo ya se envió
        console.log("Correo enviado:", correoEnviado);
        console.log("Clave paro:", claveParo);
        console.log("Registro paro:", registroParo);
        if (!claveParo || !registroParo || correoEnviado) return;

        const revisarTiempo = async () => {
            const ahora = new Date();
            console.log("Hora actual:", ahora);
            console.log("Registro paro:", registroParo);
            console.log("Hora de inicio del paro:", registroParo.hora_inicio);
            // const inicio = new Date(registroParo.hora_inicio);
            const unaHora = 60 * 60 * 1000;
            // 1. Separamos el día, mes y año que vienen como '22/05/2026'
            const [dia, mes, anio] = registroParo.fecha_produccion.split('/');

            // 2. Tomamos tu string de hora '13:13:29'
            const horaCompleta = registroParo.hora_inicio;

            // 3. Fucionamos todo en el formato estándar ISO (YYYY-MM-DDTHH:mm:ss)
            const formatoISO = `${anio}-${mes}-${dia}T${horaCompleta}`;

            // 4. Ahora sí, creamos el objeto Date real de JavaScript
            const inicio = new Date(formatoISO);

            console.log("Hora de inicio del paro formateada correctamente:", inicio);

            // Validar que la fecha de inicio sea válida
            if (isNaN(inicio.getTime())) return;
            console.log("Hora de inicio del paro formateada:", inicio);
            const diferencia = ahora - inicio;

            console.log("diferencia de horas:", diferencia);
            
            if (diferencia >= unaHora) {
                try {
                    console.log("¡Alerta de producción! El paro superó 1 hora. Enviando...");

                    // Enviamos el reporte usando las llaves correctas de tu objeto de la API
                    await enviarReporteParo({
                        operador: registroParo.nombre_operador || "No asignado",
                        horas: ((ahora - inicio) / unaHora).toFixed(1),
                        id_produccion: claveParo, // Ya que claveParo es el ID/Clave en sí
                        maquina: registroParo.maquina,
                        turno: registroParo.turno,
                        lote: registroParo.lote,
                        paro: registroParo.paro
                    });

                    // Marcamos como enviado para destruir el bucle y evitar spam de correos
                    setCorreoEnviado(true);
                    console.log("Correo enviado con éxito desde el Contexto.");
                } catch (error) {
                    console.error("Error al enviar el correo automático:", error);
                }
            }
        };

        // Ejecutar inmediatamente al tener los datos
        revisarTiempo();

        // Configurar revisión cada minuto
        const intervalo = setInterval(revisarTiempo, 60000);

        return () => clearInterval(intervalo);
    }, [claveParo, registroParo, correoEnviado]); // Dependencias sincronizadas

    return (
        <EnviarCorreoxHora.Provider value={{ registroParo, correoEnviado }}>
            {children}
        </EnviarCorreoxHora.Provider>
    );
};