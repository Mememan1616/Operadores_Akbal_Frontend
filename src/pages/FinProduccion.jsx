import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { data, useLocation } from 'react-router-dom';
import { AuthContext } from '../auth/Auth';
import { useProduccion } from '../context/ProduccionContex';
import { Navigate, useNavigate } from 'react-router-dom';
import { useParo } from '../context/ParoContext';
import {
  CheckCircle,
  AlertTriangle,
  Settings,
  User,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle2,
  Calendar,
  Save,
  Activity,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { ApiService, validarClave } from '../services/ApiService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';



export default function FinProduccion() {
  const { user } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);
  const { claveProduccion, limpiarProduccion, tipo_cierreContext } = useProduccion();
  const { claveParo, iniciarParo, cerrarParo } = useParo();
  const location = useLocation();
  const tipoCierre = location.state;
  const isOnline = useOnlineStatus();
  // Estados para el formulario
  const [piezasProducidas, setPiezasProducidas] = useState('');
  const [piezasDanadas, setPiezasDanadas] = useState('');
  const [turno, setTurno] = useState('Matutino');
  const [operador, setOperador] = useState({});
  //const [showModal, setShowModal] = useState(false);
  //obtener la clave del paro
  const [clave, setClaveParo] = useState('');
  // Estado para la fecha y hora actual
  const [currentTime, setCurrentTime] = useState(new Date());
  // Estado para simular guardado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [title, setTitle] = useState('');
  const [claveLote, setClaveLote] = useState('');
  const [claveMaquina, setClaveMaquina] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cierreLote, setcierreLote] = useState(true);
  const [showModalDespeje, setShowModalDespeje] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showModalConteo, setShowModalConteo] = useState(false);
  const [isClosingDespeje, setIsClosingDespeje] = useState(false);
  const [isSavingConteo, setIsSavingConteo] = useState(false);
  const [cierreError, setCierreError] = useState(null);
  const [initError, setInitError] = useState(null);
  const navigate = useNavigate();
  const inicializadoRef = useRef(false);
  // Actualizar el reloj cada minuto
  useEffect(() => {
    // Si ya se ejecutó una vez, abortamos para no saturar a Google
    if (inicializadoRef.current) return;

    const inicializarCierre = async () => {
      try {
        inicializadoRef.current = true;
        setInitError(null);

        await iniciaParo();

        setOperador(user);
        if (tipoCierre?.tipoCierre === "FIN_TURNO") {
          setcierreLote(false);
        }

        const titulo = tipoCierre?.title || 'Cierre';
        setTitle(titulo);

      } catch (error) {
        console.error("Error al inicializar el cierre:", error);
        setInitError(error.message || 'Error al inicializar el cierre');
        inicializadoRef.current = false;
      }
    };

    inicializarCierre();

    // Reloj
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let interval = null;

    // Si el setup está activo, el tiempo cuenta hacia arriba
    if (showModalDespeje) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000); // Asegurarse de que esté en 1000ms (1 segundo)
    }

    // Limpieza del intervalo: fundamental para evitar que avance de 2 en 2
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showModalDespeje]);

  // Cálculos automáticos
  const producidasNum = parseInt(piezasProducidas) || 0;
  const danadasNum = parseInt(piezasDanadas) || 0;
  const totalPiezas = producidasNum + danadasNum;

  // Calcular porcentaje de calidad (yield)
  const porcentajeCalidad = totalPiezas > 0
    ? ((producidasNum / totalPiezas) * 100).toFixed(1)
    : '0.0';
  const obtenerHoraActual = () => {
    const ahora = new Date();

    // Extraemos horas, minutos y segundos, forzando a que tengan 2 dígitos
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${horas}:${minutos}:${segundos}`; // Ejemplo de salida: "14:30:05"
  };
  const hoy = () => {
    const hora = obtenerHoraActual();
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return fechaFormateada
  }


  const procesarCierre = (e) => {
    // setIsSubmitting(true);
    e.preventDefault(); // Evita que la página se recargue

    if (producidasNum === 0 && danadasNum === 0) {
      alert("Por favor, ingrese la cantidad de piezas.");
      return;
    }

    // Si hay más dañadas que buenas, abrimos el modal para confirmar
    if (danadasNum > producidasNum) {
      setShowModalConteo(true);
    } else {
      Guardar();
    }
    //setIsSubmitting(false);
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatearFecha = (fecha) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }).format(fecha);
  };

  const formatearHora = (fecha) => {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit', minute: '2-digit'
    }).format(fecha);
  };

  const guardarProduccion = async () => {
    const proudccionData = {
      piezas_buenas: producidasNum,
      piezas_producidas: totalPiezas,
      estatus: true,
      piezas_malas: danadasNum,
      hora_termino: "00:00:00",
      tipo_cierre: tipo_cierreContext,
    };
    const response = await ApiService.updateProduccion(claveProduccion, proudccionData);
  }
  const iniciaParo = async () => {
    const dataRegistro = await ApiService.getProduccion(claveProduccion);
    setClaveLote(dataRegistro.result.id_lote);
    setClaveMaquina(dataRegistro.result.id_maquina);

    // Si ya hay un paro activo para esta producción (ej. recarga/remount de la
    // pantalla de cierre), se reutiliza en vez de crear uno duplicado.
    if (claveParo) {
      return;
    }

    const hora = obtenerHoraActual();
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const paro = await getParoProgramado();
    const dataParo = {
      id_turno: dataRegistro.result.id_turno,
      id_producto: dataRegistro.result.id_producto,
      id_lote: dataRegistro.result.id_lote,
      id_maquina: dataRegistro.result.id_maquina,
      id_operador: user.id,
      nombre_operador: user.nombre + " " + user.apellidoP + " " + user.apellidoM,
      id_produccion: claveProduccion,
      id_paro: paro.id_paro,
      descripcion_paro: paro.descripcion,
      paro: paro.nombre,
      turno: dataRegistro.result.turno,
      lote: dataRegistro.result.lote,
      maquina: dataRegistro.result.maquina,
      producto: dataRegistro.result.producto,
      hora_inicio: hora,
      hora_termino: "00:00:00",
      fecha_produccion: fechaFormateada,
      estatus: true,
      id_semana: dataRegistro.result.id_semana,
    };
    const response = await ApiService.insertRegistroParo(dataParo);
    const claveParoNombre = response?.result?.name;
    if (!claveParoNombre) {
      throw new Error('El servidor no devolvió una clave para el paro de despeje');
    }
    iniciarParo(claveParoNombre);
  }
  const cierre = async () => {
    // SEGURO: sin clave de paro DESPEJE activa no se procede
    validarClave(claveParo, 'cerrarParo DESPEJE');
    const hora = obtenerHoraActual();
    const fecha = hoy();
    const data = { hora_termino: hora, fecha_termino: fecha, estatus: false };

    // Primero se cierra la producción y luego el paro (con verificación por lectura).
    // Si la producción falla, el paro no se toca y el reintento es consistente.
    await ApiService.updateProduccion(claveProduccion, data);
    await cerrarParo(data);
  }

  const cierreLoteData = async (id_lote, id_maquina) => {
    await ApiService.cerrarLote(id_lote, id_maquina);
  }

  /*const submit = async () => {
    if (producidasNum === 0 && danadasNum === 0) {
      alert("Por favor, ingrese la cantidad de piezas.");
      return;
    }
    if (danadasNum > producidasNum) {
      setShowModalConteo(true);
    } else {
      Guardar();
    }

  }*/
  const Guardar = async () => {
    try {
      setIsSubmitting(true);
      setCierreError(null);
      await guardarProduccion();
      setShowModalDespeje(true);
      setShowModalConteo(false);
    }
    catch (error) {
      console.error("Error al guardar la producción:", error);
      setCierreError(error.message || 'Error al guardar. Verifica tu conexión.');
    } finally {
      setIsSavingConteo(false);
      setIsSubmitting(false);
    }
  }
  const getParoProgramado = async () => {
    const response = await ApiService.getParoByClaveParo("DESPEJE");
    return response.result
  }

  const iniciarNuevoLote = () => {
    navigate('/inicio-produccion');
    setShowModal(false);

  };
  const confirmarCierreTurno = () => {
    logout();
    //setShowModal(false);
  }

  const cierraDespeje = async () => {
    setIsClosingDespeje(true);
    setCierreError(null);

    try {
      await cierre();
      setShowModalDespeje(false);

      if (tipo_cierreContext === "FIN_LOTE") {
        await cierreLoteData(claveLote, claveMaquina);
        setShowModal(true);
      } else {
        confirmarCierreTurno();
      }

      limpiarProduccion();
    } catch (error) {
      console.error("Error al cerrar el despeje:", error);
      setCierreError(error.message || 'Error al cerrar. Verifica tu conexión.');
    } finally {
      setIsClosingDespeje(false);
    }
  }
  return (
    <div>

      {/* Tarjeta Principal */}
      <div>

        {/* Encabezado */}
        <div className="bg-blue-800 text-white p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-700 p-3 rounded-xl">
              <Settings className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cierre de {title}</h1>
              <p className="text-blue-200 text-lg capitalize">{formatearFecha(currentTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isOnline && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400 text-red-200 px-3 py-1.5 rounded-lg text-sm font-bold">
                <WifiOff className="w-4 h-4" />
                Sin conexión
              </div>
            )}
            <div className="text-right hidden md:block">
              <div className="text-4xl font-bold tracking-wider">{formatearHora(currentTime)}</div>
            </div>
          </div>
        </div>

        <form onSubmit={procesarCierre} className="p-6 md:p-10 flex-grow flex flex-col gap-8">

          {/* Información de Contexto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full shadow-sm text-blue-600">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Operador</label>
                <input
                  className="w-full text-xl bg-transparent border-b-2 border-slate-300 focus:border-blue-500 focus:outline-none pb-1 font-medium"
                  type="text"
                  value={operador.nombre || ''}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Entradas Principales (Grandes para Touch) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Input: Piezas Producidas */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-emerald-600 uppercase tracking-wider">
                Piezas Buenas
              </label>
              <input
                type="number"
                min="0"
                className="block w-full pl-16 pr-6 py-6 text-4xl font-bold text-slate-800 bg-white border-4 border-slate-200 rounded-2xl focus:ring-0 focus:border-emerald-500 transition-colors text-right touch-manipulation"
                placeholder="0"
                value={piezasProducidas}
                onChange={(e) => setPiezasProducidas(e.target.value)}
              />
            </div>

            {/* Input: Piezas Dañadas */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <AlertTriangle className="h-8 w-8 text-rose-500" />
              </div>
              <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-rose-600 uppercase tracking-wider">
                Piezas Dañadas (Merma)
              </label>
              <input
                type="number"
                min="0"
                className="block w-full pl-16 pr-6 py-6 text-4xl font-bold text-slate-800 bg-white border-4 border-slate-200 rounded-2xl focus:ring-0 focus:border-rose-500 transition-colors text-right touch-manipulation"
                placeholder="0"
                value={piezasDanadas}
                onChange={(e) => setPiezasDanadas(e.target.value)}
              />
            </div>
          </div>

          {/* Resumen en tiempo real */}
          <div className="bg-slate-800 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center shadow-inner">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Activity className="w-10 h-10 text-blue-400" />
              <div>
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Procesado</p>
                <p className="text-3xl font-bold">{totalPiezas.toLocaleString()} <span className="text-lg font-normal text-slate-300">piezas</span></p>
              </div>
            </div>

            <div className="h-12 w-px bg-slate-600 hidden md:block"></div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Índice de Calidad</p>
                <p className={`text-3xl font-bold ${parseFloat(porcentajeCalidad) >= 95 ? 'text-emerald-400' : parseFloat(porcentajeCalidad) >= 90 ? 'text-yellow-400' : 'text-rose-400'}`}>
                  {porcentajeCalidad}%
                </p>
              </div>
            </div>
          </div>

          {/* Botón de Acción */}
          <div className="mt-auto pt-4">
            {showSuccess ? (
              <div className="bg-emerald-100 text-emerald-800 p-6 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm border border-emerald-200 animate-pulse">
                <CheckCircle className="w-8 h-8 mr-3" />
                ¡{title} Cerrado Exitosamente!
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-6 px-8 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
                  }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Save className="w-8 h-8 mr-3" />
                    Confirmar y Cerrar {title}
                  </span>
                )}
              </button>
            )}
          </div>

        </form>

        {cierreError && (
          <div className="mx-6 md:mx-10 mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-medium">{cierreError}</p>
            </div>
            <button
              onClick={() => {
                setCierreError(null);
                cierraDespeje();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        )}

        {initError && (
          <div className="mx-6 md:mx-10 mb-6 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-red-800 font-bold text-lg mb-1">Error al inicializar el cierre</h3>
                <p className="text-red-600 text-sm mb-4">{initError}</p>
                <button
                  onClick={() => {
                    inicializadoRef.current = false;
                    setInitError(null);
                    window.location.reload();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showModal && cierreLote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-center text-white">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-90" />
              <h3 className="text-xl font-bold">Confirmar Cierre</h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-slate-500 mb-2">
                ¿Deseas iniciar un nuevo lote o cerrar tu turno?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmarCierreTurno}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                  Cerrar Turno
                </button>
                <button
                  onClick={iniciarNuevoLote}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Iniciar Nuevo Lote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModalDespeje && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          {/* Contenedor del Modal */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">

            {/* Cabecera del Setup */}
            <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
              <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite] text-blue-400" />
              <h2 className="text-2xl font-bold tracking-wide">Despeje</h2>
            </div>

            {/* Cuerpo del Modal: Cronómetro */}
            <div className="p-8 flex flex-col items-center">
              <p className="text-slate-500 mb-6 text-center text-sm">
                El tiempo está corriendo. Despeja tu zona e inicia tu conteo de produccion y presiona terminar cuando estés listo.
              </p>

              {/* Visualización del Cronómetro */}
              <div className="flex items-center justify-center gap-6 mb-2">
                <span className="text-6xl font-black text-slate-800 text-center tabular-nums tracking-tighter">
                  {formatTime(seconds)}
                </span>
              </div>
            </div>

            {/* Pie del Modal: Botón para terminar */}
            <div className="p-6 pt-0">
              <button
                onClick={cierraDespeje}
                disabled={isClosingDespeje}
                className={`w-full flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl transition-all hover:shadow-lg active:scale-[0.98] ${isClosingDespeje
                  ? 'bg-blue-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {isClosingDespeje ? (
                  <>
                    {/* Spinner animado en SVG */}
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cerrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Terminar Despeje
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {showModalConteo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-center text-white">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-90" />
              <h3 className="text-xl font-bold">Confirmar Cierre</h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-slate-500 mb-2">
                ¿Estas seguro que quieres cerrar el {title} con: <strong> Total de Producción: {totalPiezas}</strong>
                <strong> Piezas buenas: {piezasProducidas}</strong>
                <strong> Piezas defectuosas: {piezasDanadas}</strong>
                ?
              </p>

              <div className="flex gap-3">

                {/* Botón: Continuar (Con estado de carga) */}
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold shadow-lg transition-all ${isSavingConteo
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 active:scale-95'
                    }`}
                  onClick={Guardar}
                  disabled={isSavingConteo}
                >
                  {isSavingConteo ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Continuar
                    </>
                  )}
                </button>

                {/* Botón 1: Cerrar Modal (Cancelar) */}

                <button
                  onClick={() => setShowModalConteo(false)}
                  disabled={isSavingConteo}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl font-bold transition-all ${isSavingConteo
                      ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95'
                    }`}
                >
                  <XCircle className="w-5 h-5" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}