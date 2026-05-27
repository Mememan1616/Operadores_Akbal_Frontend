import React, { useState, useEffect, useContext, useRef } from 'react';
import { ApiService } from '../services/ApiService';
import { AuthContext } from '../auth/Auth';
import { useProduccion } from '../context/ProduccionContex';
import { useNavigate } from 'react-router-dom';
import { useParo } from '../context/ParoContext';
import { EnviarCorreoxHora } from '../context/EnviarCorreoxHoraParp';
//import { ProduccionContext } from '../context/ProduccionContex';
//import { useProduccion } from '../context/ProduccionContex';
import {
  Tablet,
  Octagon,
  Play,
  Settings,
  Droplet,
  Box,
  UserMinus,
  Loader2,
  Sparkles,
  Mic,
  Activity,
  AlertCircle,
  PackageCheck,
  CalendarClock,
  CheckCircle2,
  XCircle,
  CirclePlus,
  ArrowLeftFromLine
} from 'lucide-react';
const iconMap = {
  Tablet,
  Settings,
  Droplet,
  Box,
  UserMinus,
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Octagon, Sparkles,
  Mic,
  Activity,
  PackageCheck,
  CirclePlus,
  ArrowLeftFromLine
};

export default function Operadores() {
  const { claveProduccion, tipo_cierreContext , setTipoCierreContext} = useProduccion();
  const { claveParo, iniciarParo, terminarParo } = useParo();
   const datosCorreo = useContext(EnviarCorreoxHora);
  //const [paroTime, setParoTime] = useState(0);
  const [paros, setParos] = useState([]);
  const [selectedParo, setSelectedParo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [claveParoTemp, setClaveParo] = useState('');
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const [tipoCierre, setTipoCierre] = useState('');
  const [textModal, setTextModal] = useState('');
  const { user } = useContext(AuthContext);
  // const { logout } = useContext(AuthContext);
  //const { claveProduccion, setClaveProduccion } = useProduccion();

  const isParo = !!claveParo;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [maquina, setMaquina] = useState('');
  const [dataRegistro, setDataRegistro] = useState({});
  const [showModalOtro, setShowModalOtro] = useState(false);
  const [descripcionManual, setDescripcionManual] = useState('');
  const [numeroLote, setNumeroLote] = useState('');
  const isInitialLoad = useRef(false);
  const cronometroIniciado = useRef(false);

  // Efecto para manejar el cronómetro cuando isParo es true
 // --- EFECTO 1: CARGA DE DATOS (UNIFICADO Y PROTEGIDO) ---
useEffect(() => {
  // Solo ejecutamos si hay clave y no hemos cargado ya
  if (!claveProduccion || isInitialLoad.current) return;

  const cargarInformacionIncial = async () => {
    isInitialLoad.current = true; // Bloqueo inmediato
    try {
      const response = await ApiService.getProduccion(claveProduccion);
      if (response && response.result) {
        setDataRegistro(response);
        setMaquina(response.result.maquina);
        
        // Cargamos paros inmediatamente después
        if (response.result.id_maquina) {
          const resParos = await ApiService.getParosByMaquina(response.result.id_maquina);
          setParos(Array.isArray(resParos?.result) ? resParos.result : []);
        }
      }
    } catch (error) {
      console.error("Fallo carga inicial:", error);
      isInitialLoad.current = false; // Permitir reintento solo si falló
    }
  };

  cargarInformacionIncial();
}, [claveProduccion]);

// --- EFECTO 2: CRONÓMETRO (LIMPIO) ---
useEffect(() => {
  let interval;
  
  if (isParo) {
    interval = setInterval(() => {
      setParoTime((prev) => {
        const nuevoTiempo = prev + 1;
        localStorage.setItem('paroTime', nuevoTiempo);
        return nuevoTiempo;
      });
    }, 1000);
  } else {
    // Cuando no hay paro, limpiamos
    setParoTime(0);
    localStorage.removeItem('paroTime');
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [isParo]);

  const [paroTime, setParoTime] = useState(() => {
    const tiempoGuardado = localStorage.getItem('paroTime');
    // Si hay un tiempo guardado, lo convierte a número. Si no, empieza en 0.
    return tiempoGuardado ? parseInt(tiempoGuardado, 10) : 0;
  });

  const obtenerHoraActual = () => {
    const ahora = new Date();

    // Extraemos horas, minutos y segundos, forzando a que tengan 2 dígitos
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${horas}:${minutos}:${segundos}`; // Ejemplo de salida: "14:30:05"
  };

  // Función para dar formato al tiempo (MM:SS o HH:MM:SS)
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };


 const getParosByMaquina = async (id_maquina) => {
  if (!id_maquina) return;
  
  try {
    const response = await ApiService.getParosByMaquina(id_maquina);
    // Forzamos siempre un array para evitar "T.map is not a function"
    setParos(Array.isArray(response?.result) ? response.result : []);
  } catch (error) {
    console.error("Error en paros:", error);
    setParos([]); // Fallback seguro
  }
}
  const iconColors = [
    'text-blue-500',
    'text-amber-500',
    'text-purple-500',
    'text-emerald-500',
    'text-rose-500',
    'text-cyan-500'
  ];
  const DynamicIcon = ({ name, className }) => {
    // Buscamos el icono en nuestro diccionario, si no lo encuentra, usa AlertCircle por defecto
    const IconComponent = iconMap[name] || AlertCircle;
    return <IconComponent className={className} />;
  };
  // NUEVA FUNCIÓN: Maneja el clic en el botón gigante
  const handleMainButtonClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const fecha = new Date();
      const hora = obtenerHoraActual();
      // console.log(hora);
      const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      console.log("data registro:", dataRegistro);

      const dataParo = {
        id_turno: dataRegistro.result.id_turno,
        id_produccion: claveProduccion,
        id_producto: dataRegistro.result.id_producto,
        id_lote: dataRegistro.result.id_lote,
        id_maquina: dataRegistro.result.id_maquina,
        id_operador: user.id,
        nombre_operador: user.nombre + " " + user.apellidoP + " " + user.apellidoM,
        turno: dataRegistro.result.turno,
        lote: dataRegistro.result.lote,
        maquina: dataRegistro.result.maquina,
        producto: dataRegistro.result.producto,
        hora_inicio: hora,
        hora_termino: "00:00:00",
        fecha_produccion: fechaFormateada,
        estatus: true,
        id_semana: dataRegistro.result.id_semana,
        estatus: true
      };

      if (!isParo) {
        // Si estamos en producción, iniciamos el paro
        console.log("Iniciando paro con motivo de paro:", dataParo);
        const result = await ApiService.insertRegistroParo(dataParo);
        iniciarParo(result.result.name);
        //setIsParo(true);
        setSelectedParo(null);
      } else {
        if (selectedParo) {
          // Si hay un motivo de paro seleccionado, cerramos el modal y reanudamos la producción
          console.log("Reanudando producción con motivo de paro:", selectedParo);
          console.log("Tiempo total del paro:", paroTime, "segundos");
          let descripcion_paro;
          if (selectedParo.clave === "OTRO") {
            descripcion_paro = descripcionManual;
          } else {
            descripcion_paro = selectedParo.descripcion
          }
          console.log("descripcion_paro", descripcion_paro);
          console.log("descripcion manual", descripcionManual);
          const dataFinParo = {

            id_paro: selectedParo.id_paro,
            paro: selectedParo.nombre,
            descripcion_paro: descripcion_paro,
            hora_termino: hora
          }
          console.log("fin paro", dataFinParo);
          const result = await ApiService.updateRegistroParo(claveParo, dataFinParo);
          console.log(result);
          terminarParo();
          setSelectedParo(null);
          // setIsParo(false);
        } else {      // Si ya hay un paro, le avisamos que debe seleccionar un motivo abajo
          // (Opcional: puedes cambiar esto por un toast/alerta más bonita)
          alert("⚠️ Deber elegir un tipo de paro antes de reanudar la producción, selecciona un motivo de paro de la lista inferior.");
        }
      }
    } catch (error) {
      console.error("Error al procesar el paro:", error);
      alert("Hubo un error al procesar la solicitud. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Al hacer clic en un motivo
  const handleSelectMotivo = (paro) => {
    if (!isParo) return; // Si no hay paro activo, no hace nada
    setSelectedParo(paro);
    if (paro.clave === 'OTRO') {
      setDescripcionManual(''); // Limpiamos descripción previa
      setShowModalOtro(true);
    } else {
      setShowModal(true);
    }
  };

  // NUEVA FUNCIÓN: Confirmar el paro en el modal
  const handleConfirmarParo = () => {
    // Aquí tienes el ID listo para enviarlo a tu base de datos o API
    console.log("Guardando paro con ID:", selectedParo.id_paro);
    console.log("Tiempo total del paro:", paroTime, "segundos");
    // Lógica sugerida para tu API:
    // await ApiService.guardarRegistroParo({ id: selectedParo.id_paro, duracion: paroTime });
    // Cerramos modal y reanudamos producción
    setShowModal(false);

  };
  const terminarTurno = async () => {
    setShowModalConfirmar(true);
    setTipoCierre('FIN_TURNO');
    setTextModal('¿Estas seguro que quieres cerrar el Turno?');
  }

  const terminarLote = async () => {
    setShowModalConfirmar(true);
    setTipoCierre('FIN_LOTE');
    setTextModal('¿Estas seguro que quieres cerrar el Lote?');
  } 



  const handleCloseTurno = () => {
    setTipoCierreContext('FIN_TURNO');
    navigate('/fin-produccion', { state: { tipoCierre: 'FIN_TURNO', title: 'Turno' } });
    setShowModalConfirmar(false);
  };


  const handleConfirmCloseLote = () => {
    setTipoCierreContext('FIN_LOTE');
    navigate('/fin-produccion', { state: { tipoCierre: 'FIN_LOTE', title: 'Lote' } });
    setShowModalConfirmar(false);
  }

  return (
    <div>
      {/* Estilos personalizados para la fuente y la animación */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          .inter-font { 
            font-family: 'Inter', sans-serif; 
            -webkit-tap-highlight-color: transparent; 
          }
          .active-glow { animation: glow 1.5s infinite; }
          @keyframes glow { 
            0% { box-shadow: 0 0 5px rgba(22, 163, 74, 0.5); } 
            50% { box-shadow: 0 0 20px rgba(22, 163, 74, 0.8); } 
            100% { box-shadow: 0 0 5px rgba(22, 163, 74, 0.5); } 
          }
        `}
      </style>

      {/* Header Compacto */}
      <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Tablet size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">
              {maquina ? maquina : 'Cargando máquina...'} <span className="text-blue-600">Dankel</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
              Operador: {user.nombre + " " + user.apellidoP + " " + user.apellidoM}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[10px] font-bold text-slate-400 uppercase">
              Estado
            </span>
            {isParo ? (
              <span className="text-red-600 font-bold flex items-center gap-1 justify-end">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> PARO DE LÍNEA
              </span>
            ) : (
              <span className="text-green-600 font-bold flex items-center gap-1 justify-end">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> PRODUCCIÓN
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Área Principal de Captura */}
      <main className="flex-grow grid grid-cols-12 gap-4 p-4 overflow-hidden">

        {/* Sección de Botón Principal y Motivos */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">

          {/* Botón de Pánico / Paro Principal */}
          <button
            onClick={handleMainButtonClick}
            disabled={isLoading}
            className={`h-40 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center gap-2 transition-all 
              ${isParo ? 'bg-red-600 active-glow' : 'bg-green-600 active:scale-95'}
              ${isLoading
                ? 'opacity-75 cursor-not-allowed'
                : isParo
                  ? 'active-glow hover:bg-red-700'
                  : 'active:scale-95 hover:bg-green-500'
              }`}
          >
            {isLoading ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : isParo ? (
              <Play className="w-12 h-12" />
            ) : (
              <Octagon className="w-12 h-12" />
            )}
            <span className="text-2xl font-bold uppercase tracking-widest text-center px-4">
              {isParo ? 'Selecciona un motivo abajo para reanudar' : 'Iniciar Paro de Línea'}
            </span>
            {isParo && !isLoading && (
              <span className="text-lg font-mono bg-white/20 px-4 py-1 rounded-full mt-2 shadow-inner">
                Tiempo en paro: {formatTime(paroTime)}
              </span>
            )}
          </button>

          {/* Grid de Motivos (Botones Grandes) */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-3 gap-4 flex-grow transition-opacity duration-300 overflow-y-auto pb-4 pr-2 custom-scrollbar ${isParo ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'
              }`}
          >
            {paros.length > 0 ? (
              paros.map((paro, index) => {
                // Asignamos un color rotativo basado en el índice
                const colorClass = iconColors[index % iconColors.length];

                return (
                  <button
                    key={paro.id_paro}
                    onClick={() => handleSelectMotivo(paro)}
                    className="bg-white border-2 border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 p-4 active:bg-slate-100 shadow-sm transition-colors hover:border-blue-200 min-h-[120px]"
                  >
                    <DynamicIcon
                      name={paro.icon}

                      className={`${colorClass} w-8 h-8`}
                    />
                    <span className="font-bold text-slate-700 text-center leading-tight text-sm">
                      {paro.nombre}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full flex items-center justify-center text-slate-400 font-semibold">
                Cargando motivos de paro...
              </div>
            )}
          </div>

        </div>

        {/* Sidebar: Info de Turno y Asistente */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full">

          {/* Botón: Fin de Lote */}
          <button
            className={`flex-1 flex flex-col items-center justify-center gap-3 w-full text-white bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 shadow-lg hover:shadow-xl transition-all duration-300 font-bold rounded-3xl text-2xl active:scale-95
            ${isParo || isLoading
                ? 'opacity-50 cursor-not-allowed grayscale'
                :
                'shadow-lg hover:shadow-xl hover:bg-gradient-to-br active:scale-95 focus:ring-4 focus:outline-none focus:ring-green-300'
              }`}
            disabled={isParo || isLoading}
            onClick={terminarLote}
          >
            <PackageCheck className="w-16 h-16 mb-2" />
            <span>Fin de Lote</span>
          </button>

          {/* Botón: Fin de Turno */}
          <button
            className={`flex-1 flex flex-col items-center justify-center gap-3 w-full text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 shadow-lg hover:shadow-xl transition-all duration-300 font-bold rounded-3xl text-2xl active:scale-95
               ${isParo || isLoading
                ? 'opacity-50 cursor-not-allowed grayscale'
                :
                'shadow-lg hover:shadow-xl hover:bg-gradient-to-br active:scale-95 focus:ring-4 focus:outline-none focus:ring-green-300'
              }`}
            disabled={isParo || isLoading}
            onClick={terminarTurno}
          >
            <CalendarClock className="w-16 h-16 mb-2" />
            <span>Fin de Turno</span>
          </button>

        </div>
      </main>

      {/* MODALES EMERGENTES */}
      {/* MODAL PARA MOTIVO "OTRO" */}
      {showModalOtro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-amber-500 p-6 text-center text-white">
              <CirclePlus className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-xl font-bold">Especificar Motivo</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2 text-left">
                Por favor, describe el motivo del paro:
              </label>
              <textarea
                className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                rows="4"
                placeholder="Escribe aquí la descripción..."
                value={descripcionManual}
                onChange={(e) => setDescripcionManual(e.target.value)}
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModalOtro(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!descripcionManual.trim()) return alert("Por favor ingresa una descripción");
                    setShowModalOtro(false);
                    // Opcional: Después de llenar, podrías mostrar la modal de confirmación o dejarlo ya seleccionado
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-600 transition-all"
                >
                  Guardar descripción
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && selectedParo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-center text-white">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-90" />
              <h3 className="text-xl font-bold">Confirmar Motivo</h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-slate-500 mb-2">Has seleccionado:</p>
              <p className="text-2xl font-bold text-slate-800 mb-6">{selectedParo.nombre}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarParo}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-bold shadow-lg hover:bg-green-700 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModalConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-center text-white">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-90" />
              <h3 className="text-xl font-bold">Confirmar Cierre</h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-slate-500 mb-2">
               {textModal}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmCloseLote}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5"
                  
                >
                   <CheckCircle2 className="w-5 h-5" />
                  Cerrar Lote
                </button>
                <button
                  onClick={handleCloseTurno}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Cerrar Turno
                </button>

                {/* Botón 1: Cerrar Modal (Cancelar) */}
                <button
                  onClick={() => setShowModalConfirmar(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5"
                >
                  <ArrowLeftFromLine  className="w-5 h-5" />
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}