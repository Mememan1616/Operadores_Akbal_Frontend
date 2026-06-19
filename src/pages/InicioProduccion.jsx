import React, { useState, useEffect, createContext, useContext, use, useRef } from 'react';
import Select from 'react-select';
import {
  Play, Package,
  Hash,
  Clock,
  CheckCircle2,
  CheckCircle,
  Factory,
  User,
  Cog,
  Settings
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import { AuthContext } from '../auth/Auth';
import { useProduccion } from '../context/ProduccionContex';
import { useParo } from '../context/ParoContext';
//import {} from '../context/ParoContext';
export default function InicioProduccion() {
  const { user } = useContext(AuthContext);
  const { claveParo, iniciarParo, terminarParo } = useParo();
  const { claveProduccion, setClaveProduccion } = useProduccion();
  const [produccion, setProduccion] = useState({});
  const [formData, setFormData] = useState({
    turno: '',
    lote: '',
    producto: '',
    maquina: '',
  });
  //const [paroProgramado, setParoProgramado]=useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState('');
  const [lotes, setLotes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [operador, setOperador] = useState({});
  const [maquinas, setMaquinas] = useState([]);
  const [showModal, setShowModal] = useState(!claveProduccion || !claveParo);
  const [seconds, setSeconds] = useState(0);
  const [inicioProduccion, setInicioProduccion] = useState(false);
  const [showNoRelationModal, setShowNoRelationModal] = useState(false);
  //const [claveParo, setClaveParo] = useState('');
  const navigate = useNavigate();

  // Actualizar el reloj cada segundo
  useEffect(() => {
    console.log("el usuario es:", user);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval = null;

    // Si el setup está activo, el tiempo cuenta hacia arriba
    if (showModal) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000); // Asegurarse de que esté en 1000ms (1 segundo)
    }

    // Limpieza del intervalo: fundamental para evitar que avance de 2 en 2
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showModal]);

  // Carga inicial de datos y arranque de producción
  const isStarting = useRef(false);

  useEffect(() => {
    const inicializar = async () => {
      await getAllTurnos();
      await getAllMaquinas();

      // SOLO si no hay clave Y no estamos ya intentando iniciar
      if (!claveProduccion && !isStarting.current) {
        isStarting.current = true; // Bloqueo inmediato
        await startProduccion();
      }
    };
    inicializar();
  }, [claveProduccion]);

  const startProduccion = async () => {
    const fecha = new Date();
    const hora = obtenerHoraActual();
    console.log(hora);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    if (!inicioProduccion) {
      const dataInicial = {
        //id_semana: "test",
        id_operador: user.id,
        operador: user.nombre + " " + user.apellidoP + " " + user.apellidoM,
        hora_inicio: hora,
        hora_termino: "00:00:00",
        fecha_produccion: fechaFormateada,
        // tipo_cierre: "INICIO",
        // piezas_producidas: 0,
        // piezas_buenas: 0,
        // piezas_malas: 0,
        estatus: true,
      }
      //console.log(dataInicial);
      const response = await ApiService.insertProduccion(dataInicial);
      //console.log("Respuesta del servidor al iniciar produccion:", response);
      const clave = response.result.name;
      setClaveProduccion(clave);
      console.log("La clave de la produccion es:", clave);
      setInicioProduccion(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const paroProgramado = await getParoProgramado();
      const dataParo = {
        ...dataInicial,
        id_produccion: clave,
        id_paro: paroProgramado.id_paro,
        descripcion_paro: paroProgramado.descripcion,
        paro: paroProgramado.nombre,
      }
      const responseParo = await ApiService.insertRegistroParo(dataParo);
      console.log("Respuesta del servidor al iniciar paro:", responseParo);
      const claveParoTemporal = responseParo.result.name;
      iniciarParo(claveParoTemporal); // Asignar la clave del paro al estado claveParoTemporal;
      console.log("La clave del paro es:", claveParo);
    };
  }
  const getAllTurnos = async () => {
    try {
      const response = await ApiService.getTurnos();

      // 1. Validamos que la respuesta sea un arreglo
      if (response && Array.isArray(response.result)) {
        const datosTurnos = response.result;

        setTurnos(datosTurnos);
        setHorario(datosTurnos); // setHorario ahora recibirá un array garantizado
      } else {
        // 2. Si la respuesta no es lo que esperamos, reseteamos a vacío
        console.warn("La API de turnos no devolvió un formato válido:", response);
        setTurnos([]);
        setHorario([]);
      }
    } catch (err) {
      // 3. Error de red o servidor
      console.error("Error al cargar los turnos:", err);
      setTurnos([]);
      setHorario([]);
      setError('Hubo un problema al cargar los turnos disponibles.');
    }
  };


  const getProduccionXMaquinaXProducto = async (id_maquina, id_producto) => {
    try {
      const response = await ApiService.getProduccion_ProductoXMaquina(id_maquina, id_producto);
      const resultado = response.result;
      console.log('produccion por maquina recibida:', resultado);
      return resultado[0];
    } catch (err) {
      setProduccion([]);
    }
  }
  const getLotesByMaquina = async (id_maquina) => {
    try {
      const response = await ApiService.getLotesByMaquina(id_maquina);
      setLotes(Array.isArray(response?.result) ? response.result : []);
    } catch (err) {
      setLotes([]);
    }
  };
  /*const getAllProductos = async () => {
      const response = await ApiService.getProductos();
      //console.log(response);
      setProductos(response.result);
      //console.log("Respuesta del servidor:", response);
    }*/
  const getAllMaquinas = async () => {
    try {
      const response = await ApiService.getMaquinas();
      setMaquinas(Array.isArray(response?.result) ? response.result : []);
    } catch (err) {
      setMaquinas([]);
    }
  };
  const getParoProgramado = async () => {
    const response = await ApiService.getParoByClaveParo("SETUP");
    //console.log("paro programado",response);
    return response.result
  }
  const handleChange = (e) => {

    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'maquina') {
      // Limpiamos lote y producto porque la máquina cambió
      setFormData(prev => ({ ...prev, lote: '', producto: '' }));
      if (value) {
        console.log("el lote:", value);
        getLotesByMaquina(value);
      }

    }
    if (name === 'lote') {
      console.log("la data:");
      console.log(value);
      if (value) {
        console.log("el lote:", value);
        const lote = lotes.find(lote => lote.id_lote === value);
        console.log(lote);
        setFormData(prev => ({ ...prev, producto: lote.producto }));
      }
      console.log(formData);
    }
    if (error) setError('');
  };
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = async (e) => {
    const fecha = new Date();
    // const hora = obtenerHoraActual();
    //console.log(hora);
    const fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    e.preventDefault();

    // Validación básica
    if (!formData.turno || !formData.lote || !formData.producto || !formData.maquina) {
      setError('Por favor, completa todos los campos antes de iniciar la producción.');
      return;
    }
    setIsSubmitting(true);
    console.log(maquinas);
    console.log(formData.maquina)
    // const producto = productos.find((p) => p.id_producto === formData.producto);
    const lote = lotes.find((l) => l.id_lote === formData.lote);
    const maquina = maquinas.find((m) => m.id_maquina === formData.maquina);
    const hora = obtenerHoraActual();
    const turno = turnos.find((t) => t.id_turno === formData.turno);

    const produccionPorMaquinaYProducto = await getProduccionXMaquinaXProducto(maquina.id_maquina, lote.id_producto);
    if (produccionPorMaquinaYProducto === null || produccionPorMaquinaYProducto === undefined) {
      setShowNoRelationModal(true);
      setIsSubmitting(false);
      return;
    }
    console.log("prueba maquina y producto",produccionPorMaquinaYProducto);
    
    const data = {
      id_maquina: formData.maquina,
      id_turno: formData.turno,
      id_lote: formData.lote,
      id_producto: lote.id_producto,
      maquina: maquina.maquina,
      turno: turno.turno,
      lote: lote.lote,
      producto: lote.producto,
      produccionxHora: produccionPorMaquinaYProducto.velocidad,
      //fecha_produccion: fechaFormateada
    };
    console.log("la data es:", data);
    // Simular una llamada a la API
    const result = await ApiService.updateProduccion(claveProduccion, data);
    console.log("la clave para update es:", claveProduccion);
    console.log(result);
    const dataParo = {
      ...data,
      id_produccion: claveProduccion,
      hora_termino: hora,
    }
    const responseParo = await ApiService.updateRegistroParo(claveParo, dataParo);
    //console.log("Respuesta del servidor al iniciar paro:", responseParo);
    // console.log("La clave del paro es:", claveParo);
    console.log("La clave del paro es:", claveParo);
    terminarParo();
    setTimeout(() => {
      navigate('/operadores');
      setIsSubmitting(false);
      //setIsStarted(true);
    }, 1500);

  };
  const handleReset = () => {
    setFormData({ turno: '', lote: '', producto: '' });
    setIsStarted(false);
  };
  const obtenerHoraActual = () => {
    const ahora = new Date();

    // Extraemos horas, minutos y segundos, forzando a que tengan 2 dígitos
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${horas}:${minutos}:${segundos}`; // Ejemplo de salida: "14:30:05"
  };
  const setHorario = (listaDeTurnos) => {
    const horaActual = obtenerHoraActual();
    console.log("Hora actual:", horaActual);
    console.log("los turnos son:", listaDeTurnos);
    const horaAMinutos = (horaString) => {
      if (!horaString) return 0;
      // Separamos por los dos puntos ":"
      const partes = horaString.split(':');
      // Convertimos a números enteros reales
      const horas = parseInt(partes[0], 10) || 0;
      const minutos = parseInt(partes[1], 10) || 0;
      return (horas * 60) + minutos;
    };
    const minutosActuales = horaAMinutos(horaActual);
    const turnoDetectado = listaDeTurnos.find((turno) => {
      const inicioMin = horaAMinutos(turno.hora_inicio);
      const finMin = horaAMinutos(turno.hora_termino);

      if (inicioMin <= finMin) {
        // Turno normal de día
        return minutosActuales >= inicioMin && minutosActuales <= finMin;
      } else {
        // Turno nocturno (cruza medianoche)
        return minutosActuales >= inicioMin || minutosActuales <= finMin;
      }
    });
    if (turnoDetectado) {
      console.log("Turno detectado correctamente:", turnoDetectado.turno);
      setFormData((prev) => ({ ...prev, turno: turnoDetectado.id_turno }));
    } else {
      console.log("No se encontró ningún turno para la hora:", horaActual);
    }
  }
  // ... dentro de InicioProduccion, antes del return
  const opcionesLotes = lotes.map(l => ({
    value: l.id_lote,
    label: l.lote,
    producto: l.producto // Guardamos el producto aquí para acceder fácil
  }));

  // Vista de éxito cuando la producción ha iniciado
  if (isStarted) {
    return (

      <div className="">
        <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Producción Iniciada</h1>
        <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <span className="text-slate-500 text-lg">Turno</span>
            <span className="font-semibold text-xl text-slate-800 capitalize">{formData.turno}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <span className="text-slate-500 text-lg">Lote</span>
            <span className="font-semibold text-xl text-slate-800">{formData.lote}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-lg">Producto</span>
            <span className="font-semibold text-xl text-slate-800">{formData.producto}</span>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="w-full py-4 text-lg font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Registrar Nuevo Turno
        </button>
      </div>

    );
  }

  // Vista principal del formulario
  return (

    <div className="">

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inicio de Turno</h1>
            <p className="text-slate-500 text-lg">Configuración de línea de producción</p>
          </div>
        </div>
        <div className="text-right bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
          <p className="text-2xl font-bold text-blue-600">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-slate-500 font-medium">
            {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-r-xl flex items-center">
          <p className="text-lg font-medium">{error}</p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleStart} className="space-y-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Operador (Simulado para dar contexto) */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                Operador en turno
              </label>
              <input
                type="text"
                disabled
                value={user?.nombre || "Operador en turno"}
                className="w-full text-lg p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Selector de Turno */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Turno
              </label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                className="w-full text-lg p-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '3rem' }}
              >
                <option key="" value="">Seleccione el turno...</option>
                {turnos?.map((turno) => (
                  <option key={turno.id_turno} value={turno.id_turno}>{turno.turno} ({turno.hora_inicio} - {turno.hora_termino})</option>
                ))}

              </select>
            </div>
          </div>

          {/*selector de maquina*/}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Cog className="w-5 h-5 text-blue-500" />
              Maquina a usar
            </label>
            <select
              name="maquina"
              value={formData.maquina}
              onChange={handleChange}
              className="w-full text-lg p-4 bg-white border-2 border-slate-200 rounded-xl text-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '3rem' }}
            >
              <option value="">Seleccione la maquina...</option>
              {maquinas?.map((maquina) => (
                <option key={maquina.id_maquina} value={maquina.id_maquina}>{maquina.maquina}</option>
              ))}
            </select>
          </div>

          {/* Entrada de Lote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-500" />
                Lote
              </label>

              <Select
                placeholder="Busca o selecciona un lote..."
                options={opcionesLotes}
                // Buscamos el objeto completo que coincida con el ID en formData
                value={opcionesLotes.find(opt => opt.value === formData.lote) || null}
                onChange={(selected) => {
                  // 1. Actualizamos el valor del lote
                  const fakeEvent = {
                    target: { name: 'lote', value: selected ? selected.value : '' }
                  };
                  handleChange(fakeEvent);

                  // 2. Actualizamos el producto automáticamente
                  if (selected) {
                    setFormData(prev => ({ ...prev, producto: selected.producto }));
                  }
                }}
                // Estilos personalizados para que combine con tu UI de Tailwind
                styles={{
                  control: (base, state) => ({
                    ...base,
                    padding: '0.5rem',
                    borderRadius: '0.75rem', // rounded-xl
                    borderWidth: '2px',
                    borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0', // blue-500 : slate-200
                    boxShadow: state.isFocused ? '0 0 0 4px rgba(219, 234, 254, 1)' : 'none', // focus:ring-4
                    '&:hover': { borderColor: '#3b82f6' }
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                    fontSize: '1.125rem', // text-lg
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: '1.125rem',
                    color: '#1e293b' // text-slate-800
                  })
                }}
                isSearchable={true}
                noOptionsMessage={() => "No se encontraron lotes"}
              />
            </div>


            {/* Entrada de Producto (Solo lectura) */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Producto a Fabricar
              </label>
              <input
                type="text"
                name="producto"
                // 🟢 Buscamos el nombre del producto basándonos en el ID guardado
                value={formData.producto || ""}
                disabled // Lo mantenemos bloqueado porque se llena con el Lote
                placeholder="Esperando selección de lote..."
                className="w-full text-lg p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-500 cursor-not-allowed transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Botón de Inicio */}
        <div className="pt-8 mt-4 border-t border-slate-100">
          <button
            type="submit"

            disabled={isSubmitting}
            className={`w-full flex items-center justify-center gap-3 py-6 rounded-2xl text-2xl font-bold text-white shadow-xl transition-all ${isSubmitting
              ? 'bg-emerald-400 cursor-wait'
              : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0'
              }`}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
            ) : (
              <>
                <Play className="w-8 h-8 fill-current" />
                INICIAR PRODUCCIÓN
              </>
            )}
          </button>
          <p className="text-center text-slate-400 mt-4 font-medium">
            Al iniciar, el sistema registrará la hora exacta de arranque.
          </p>
        </div>
      </form>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          {/* Contenedor del Modal */}
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">

            {/* Cabecera del Setup */}
            <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
              <Settings className="w-6 h-6 animate-[spin_4s_linear_infinite] text-blue-400" />
              <h2 className="text-2xl font-bold tracking-wide">Setup</h2>
            </div>

            {/* Cuerpo del Modal: Cronómetro */}
            <div className="p-8 flex flex-col items-center">
              <p className="text-slate-500 mb-6 text-center text-sm">
                El tiempo está corriendo. Revisa tus configuraciones y presiona terminar cuando estés listo.
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
                onClick={() => setShowModal(false)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <CheckCircle className="w-5 h-5" />
                Terminar Setup
              </button>
            </div>

          </div>
        </div>
      )}
      {showNoRelationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
            <div className="bg-amber-500 p-6 text-white flex items-center gap-3">
              <Settings className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold tracking-wide">Relación no encontrada</h2>
            </div>
            <div className="p-8 flex flex-col items-center">
              <p className="text-slate-700 text-center text-lg font-medium mb-2">
                Aún no se ha asignado la relación entre la máquina y el producto.
              </p>
              <p className="text-slate-500 text-center text-sm">
                Notifique al supervisor para que configure la velocidad de producción y posterior reinicie la aplicacion.
              </p>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => setShowNoRelationModal(false)}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <CheckCircle className="w-5 h-5" />
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}