// Estado de los mocks de dev: reflejan el resultado de las escrituras
// para que las verificaciones por lectura (read-back) funcionen en localhost.
let devProduccionCerrada = false;
let devParoCerrado = false;

// Lanza si el backend reporta un error explícito (success:false) o implícito
// (error:true). El flujo de cierre depende de que un fallo NO pase en silencio.
const validarRespuesta = (resp, accion) => {
  if (!resp || resp.success === false || resp.error === true) {
    const detalle = resp?.error || resp?.message || 'respuesta vacía del servidor';
    throw new Error(`${accion}: ${detalle}`);
  }
  return resp;
};

const runGoogle = (serverFunction, params) => {
    return new Promise((resolve, reject) => {

        // 0. BLOQUEO SIN CONEXIÓN: Sin internet no se permite ninguna petición
        if (!navigator.onLine) {
            reject(new Error('Sin conexión a internet. Reconéctate para continuar.'));
            return;
        }

        // 1. Detección de entorno local (Desarrollo)
        if (typeof google === 'undefined' || !google.script) {
            console.warn(`[DEV] Llamada simulada a backend: ${serverFunction}`);

            // Simulaciones más realistas para desarrollo
            if (params.action === 'test') {
                return resolve({
                    response: 'Hello from backend!',
                    status: 200

                });
            }
            if (params.action === 'login') {
                const clave = params.clave;

                if (clave === '123456789') {
                    return resolve({
                        response: 'Login exitoso',
                        status: 200,
                        message: 'Código QR correcto',
                        result: {
                            user: {
                                id: 1,
                                nombre: 'Martin Alejandro',
                                apellido: 'Gonzalez',
                                email: 'alex@dankel.com',
                                rol: 'operador'
                            },
                            status: 200
                        }
                    });
                } else {
                    return resolve({
                        response: 'Login fallido',
                        status: 401,
                        message: 'Código QR incorrecto'
                    })
                }
            }
            if (params.action === 'getTurnos') {
                return resolve({
                    response: 'Hello from backend!',
                    status: 200,
                    result: [
                        {
                            id_turno: "1",
                            turno: 'Mañana',
                            hora_inicio: '06:00',
                            hora_termino: '15:30',
                            estatus: true
                        },
                        {
                            id_turno: "2",
                            turno: 'Tarde',
                            hora_inicio: '15:30',
                            hora_termino: '00:00',
                            estatus: true
                        },
                        {
                            id_turno: "3",
                            turno: 'Noche',
                            hora_inicio: '00:00',
                            hora_termino: '06:00',
                            estatus: true
                        }
                    ]

                });
            }
            if (params.action === 'getLotes') {
                return resolve({
                    response: 'Hello from lotes!',
                    status: 200,
                    result: [
                        {
                            id_lote: "1",
                            lote: 'Lote 1',
                            id_producto: 1,
                            producto: 'Producto 2',
                            estatus: true
                        },
                        {
                            id_lote: "2",
                            lote: 'Lote 2',
                            id_producto: 2,
                            producto: 'Producto 2',
                            estatus: true
                        },
                        {
                            id_lote: "3",
                            lote: 'Lote 3',
                            producto: 'Producto 3',
                            id_producto: 3,
                            estatus: true
                        }
                    ]
                });
            }
            if (params.action === 'getProductos') {
                return resolve({
                    response: 'Hello from productos!',
                    status: 200,
                    result: [
                        {
                            id_producto: "1",
                            producto: 'Producto 1',
                            unidad_medida: 'piezas',
                            estatus: true
                        },
                        {
                            id_producto: "2",
                            producto: 'Producto 2',
                            unidad_medida: 'piezas',
                            estatus: true
                        },
                        {
                            id_producto: "3",
                            producto: 'Producto 3',
                            unidad_medida: 'piezas',
                            estatus: true
                        }
                    ]
                });
            }
            if (params.action === 'getParos') {
                return resolve({
                    response: 'Hello from paros!',
                    status: 200,
                    result: [
                        { descripcion: "Ajustes en la máquina", estatus: true, icon: "Settings", id_paro: 1, nombre: "Ajuste Mecánico" },
                        { descripcion: "Limpieza", estatus: true, icon: "Droplet", id_paro: "2", nombre: "Sanitización" },
                        { descripcion: "Sin materia prima", estatus: true, icon: "Box", id_paro: "3", nombre: "Falta Material" },
                        { descripcion: "Relevo de personal", estatus: true, icon: "UserMinus", id_paro: "4", nombre: "Cambio Turno" },
                        { descripcion: "Paro de prueba", estatus: true, icon: "", id_paro: "5", nombre: "Paro Indefinido" } // Caso con icono vacío ("")
                    ]
                });
            }
            if (params.action === 'getParosByMaquina') {
                return resolve({
                    response: 'Hello from paros!',
                    status: 200,
                    result: [
                        { descripcion: "Ajustes en la máquina", estatus: true, icon: "Settings", id_paro: 1, nombre: "Ajuste Mecánico", clave: "test" },
                        { descripcion: "Limpieza", estatus: true, icon: "Droplet", id_paro: "2", nombre: "Sanitización", clave: "test" },
                        { descripcion: "Sin materia prima", estatus: true, icon: "Box", id_paro: "3", nombre: "Falta Material", clave: "test" },
                        { descripcion: "Relevo de personal", estatus: true, icon: "UserMinus", id_paro: "4", nombre: "Cambio Turno", clave: "test" },
                        { descripcion: "Otro Paro", estatus: true, icon: "UserMinus", id_paro: "6", nombre: "Otro", clave: "OTRO" },
                        { descripcion: "Paro de prueba", estatus: true, icon: "", id_paro: "5", nombre: "Paro Indefinido", clave: "test" } // Caso con icono vacío ("")
                    ]
                })
            }
            if (params.action === 'getMaquinas') {
                return resolve({
                    response: 'Hello from maquinas!',
                    status: 200,
                    result: [
                        { id_maquina: "1", maquina: "Maquina 1", estatus: true, produccionxHora: 150, funcion: "Producción" },
                        { id_maquina: "2", maquina: "Maquina 2", estatus: true, produccionxHora: 200, funcion: "Producción" },
                        { id_maquina: "3", maquina: "Maquina 3", estatus: true, produccionxHora: 250, funcion: "Producción" }
                    ]
                })
            }
            if (params.action === 'insertRegistroParo') {
                return resolve({
                    response: 'Hello from insertRegistroParo!',
                    status: 200,
                    result: { name: "clave_paro" }
                })
            }
            if (params.action === 'insertProduccion') {
                return resolve({
                    response: 'Hello from insertProduccion!',
                    status: 200,
                    result: { name: "clave_produccion" }
                })
            }
            if (params.action === 'updateProduccion') {
                if (params.data && params.data.estatus === false) {
                    devProduccionCerrada = true;
                }
                return resolve({
                    response: 'Hello from updateProduccion!',
                    status: 200,
                    result: { name: "clave_produccion" }
                })
            }
            if (params.action === 'updateRegistroParo') {
                if (params.data && params.data.estatus === false) {
                    devParoCerrado = true;
                }
                return resolve({
                    response: 'Hello from updateRegistroParo!',
                    status: 200,
                    result: { name: "clave_paro" }
                })
            }
            if (params.action === 'getProduccion') {
                return resolve({
                    response: 'Hello from getProduccion!',
                    status: 200,
                    result: {
                        hora_termino: devProduccionCerrada ? "18:05:00" : "00:00:00",
                        id_operador: "1.0",
                        hora_inicio: "14:50:15",
                        maquina: "maquina1",
                        lote: "lote1",
                        turno: "turno1",
                        piezas_malas: 0.0,
                        estatus: devProduccionCerrada ? false : true,
                        id_producto: "producto1id",
                        producto: "producto1",
                        id_maquina: "maquina1id",
                        fecha_produccion: "25/03/2026",
                        tipo_cierre: "INICIO",
                        id_turno: "turno1",
                        piezas_buenas: 0.0,
                        piezas_producidas: 0.0,
                        id_lote: "lote1",
                        id_semana: "semana1"
                    }
                })

            }
            if (params.action === 'cerrarLote') {
                return resolve({
                    response: 'Hello cerrar lote!',
                    status: 200,
                })
            }
            if (params.action === 'getParoByClaveParo') {
                return resolve({
                    response: 'Hello paro Programado!',
                    status: 200,
                    result: {
                        descripcion: "Paro Programado", estatus: true, icon: "Settings", id_paro: 1,
                        nombre: "Paro Programado"
                    }
                })
            }
            if (params.action === 'getLotesByMaquina') {
                return resolve({
                    response: 'Hello getLotesByMaquina!',
                    status: 200,
                    result: [{ id_lote: "lote1", lote: "lote1", estatus: true, id_producto: "1", producto: "producto1" },
                    { id_lote: "lote2", lote: "lote2", estatus: true, id_producto: "2", producto: "producto2" }
                    ]
                })
            }
            if (params.action === 'getRegistroParoById') {
                return resolve({
                    response: 'Hello from getProduccion!',
                    status: 200,
                    result: {
                        fecha_produccion: "22/05/2026",
                        hora_inicio: "09:00:00",
                        hora_termino: devParoCerrado ? "18:05:00" : "00:00:00",
                        estatus: devParoCerrado ? false : true,
                        id_operador: "-OqfEBbZtZ1XAR3FuUxO",
                        id_paro: "paro6",
                        id_produccion: "-OtEcYkZtxtRZJLxEj5E",
                        id_producto: "-Oqf30JxnpQ5GrVb9PB9",
                        id_semana: "semana3",
                        id_turno: "turno1",
                        lote: "D26329",
                        maquina: "Bergami",
                        nombre_operador: "DIANA BERENICE SANCHEZ GONZALEZ",
                        paro: "No arma la caja",
                        producto: "Sinkel",
                        turno: "Matutino"
                    }

                })
            }
            if (params.action == 'getProduccion_ProductoXMaquina') {
                return resolve({
                    response: 'Hello from getProduccion_ProductoXMaquina!',
                    status: 200,
                    result: [
                        {
                            tipo:"Automática",
                            estatus:true,
                            producto:"Prueba 2",
                            id_producto:"prueba2",
                            velocidad:2000.0,
                            id_maquina:"prueba2"
                        },
                   
                    ]


                })
            }
            if (params.action === 'getProduccionActiveByLoteMaquina') {
                return resolve({
                    response: 'Hello from getProduccionActiveByLoteMaquina!',
                    status: 200,
                    result: [
                        {
                            hora_termino: "00:00:00",
                            id_operador: "1.0",
                            hora_inicio: "14:50:15",
                            maquina: "maquina1",
                            lote: "lote1",
                            turno: "turno1",
                            piezas_malas: 0.0,
                            estatus: true,
                            id_producto: "producto1id",
                            producto: "producto1",
                            id_maquina: "maquina1id",
                            fecha_produccion: "25/03/2026",
                            tipo_cierre: "INICIO",
                            id_turno: "turno1",
                            piezas_buenas: 0.0,
                            piezas_producidas: 0.0,
                            id_lote: "lote1",
                            id_semana: "semana1"
                        },
                        {
                            hora_termino: "00:00:00",
                            id_operador: "2.0",
                            hora_inicio: "06:30:00",
                            maquina: "maquina2",
                            lote: "lote2",
                            turno: "turno2",
                            piezas_malas: 5.0,
                            estatus: true,
                            id_producto: "producto2id",
                            producto: "producto2",
                            id_maquina: "maquina2id",
                            fecha_produccion: "25/03/2026",
                            tipo_cierre: "INICIO",
                            id_turno: "turno2",
                            piezas_buenas: 95.0,
                            piezas_producidas: 100.0,
                            id_lote: "lote2",
                            id_semana: "semana1"
                        }
                    ]
                })
            }

            return reject("Estás en localhost. Haz Build y sube a Apps Script.");
        }

        // 2. Verificar que google.script.run existe
        if (!google.script || !google.script.run) {
            const error = 'google.script.run no está disponible';
            console.error('Error', error);
            reject(new Error(error));
            return;
        }

        // 3. Crear timeout de seguridad (15 segundos)
        const timeout = setTimeout(() => {
            console.error('Timeout: La llamada tardó más de 15 segundos');
            reject(new Error('Timeout: El servidor tardó demasiado en responder'));
        }, 15000);

        // 4. Llamada Real a Google Apps Script
        google.script.run
            .withSuccessHandler((response) => {
                clearTimeout(timeout);


                // VALIDACIÓN CRÍTICA: Verificar si response es null o undefined
                if (response === null) {
                    reject(new Error('El servidor retornó NULL (falta return en apiHandler)'));
                    return;
                }

                if (response === undefined) {
                    reject(new Error('El servidor retornó UNDEFINED (función inexistente o sin return)'));
                    return;
                }

                // Si es string, intentar parsear JSON
                if (typeof response === 'string') {

                    try {
                        const parsed = JSON.parse(response);
                        resolve(parsed);
                        return;
                    } catch (e) {
                        console.warn('Response no es JSON válido, retornando como string');
                        resolve(response);
                        return;
                    }
                }

                // Si es objeto, validar estructura básica
                if (typeof response === 'object') {

                    // Para getCatalogs, verificar estructura esperada
                    if (params.action === 'getCatalogs') {
                        if (!response.razonesSociales || !response.areas) {
                            console.warn('Respuesta de getCatalogs sin estructura esperada');
                            console.warn('Estructura recibida:', Object.keys(response));
                        }
                    }

                    resolve(response);
                    return;
                }

                // Cualquier otro tipo
                resolve(response);
            })
            .withFailureHandler((error) => {
                clearTimeout(timeout);
                console.error(`Failure en ${serverFunction}:`, error);
                console.error('Error type:', typeof error);
                console.error('Error message:', error.message || error.toString());
                reject(error);
            })
        [serverFunction](params);

    });
};
export const validarClave = (clave, accion) => {
    if (!clave || typeof clave !== 'string' || clave === 'null' || clave === 'undefined') {
        throw new Error(`${accion}: clave inválida (${clave})`);
    }
};
// Un registro quedó "cerrado" cuando tiene estatus false y hora de término real.
export const estaCerrado = (registro) => {
   console.log(registro);
   if(!registro || registro.estatus==true){
    console.log('no ha cerrado'); 
    return false;
   }
   else return true;
   
};
export const ApiService = {
    // --- Prueba ---
    async testAppscript() {
        try {
            const result = await runGoogle('apiHandler', { action: 'testAppscript' });
            return result;
        } catch (error) {
            console.error('Error en getUserInfo:', error);
            throw error;
        }
    },
    async login(Code) {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'login',
                clave: Code
            });
            return result;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },
    async getParos() {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'getParos'
            });
            return result;
        } catch (error) {
            console.error('Error en getParos:', error);
            throw error;
        }
    },
    async getLotes() {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'getLotes'
            });
            return result;
        } catch (error) {
            console.error('Error en getLotes:', error);
            throw error;
        }
    },
    async getProductos() {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'getProductos'
            });
            return result;
        } catch (error) {
            console.error('Error en getProductos:', error);
            throw error;
        }
    },
    async getTurnos() {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'getTurnos'
            });
            return result;
        } catch (error) {
            console.error('Error en getTurnos:', error);
            throw error;
        }
    },
    async getMaquinas() {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'getMaquinas'
            });
            return result;
        } catch (error) {
            console.error('Error en getMaquinas:', error);
            throw error;
        }
    },

    async insertRegistroParo(data) {
        try {
            if (data?.id_produccion) validarClave(data.id_produccion, 'insertRegistroParo');
            const result = await runGoogle('apiHandler', {
                action: 'insertRegistroParo',
                data: data
            });
            return validarRespuesta(result, 'insertRegistroParo');
        } catch (error) {
            console.error('Error en insertRegistroParo:', error);
            throw error;
        }
    },
    async insertProduccion(data) {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'insertProduccion',
                data: data
            });
            return validarRespuesta(result, 'insertProduccion');
        } catch (error) {
            console.error('Error en insertProduccion:', error);
            throw error;
        }
    },
    async updateProduccion(id, data) {
        try {
            validarClave(id, 'updateProduccion');
            const result = await runGoogle('apiHandler', {
                action: 'updateProduccion',
                id: id,
                data: data
            });
            return validarRespuesta(result, 'updateProduccion');
        } catch (error) {
            console.error('Error en updateProduccion:', error);
            throw error;
        }

    },
    async updateRegistroParo(id, data) {
        try {
            validarClave(id, 'updateRegistroParo');
            const result = await runGoogle('apiHandler', {
                action: 'updateRegistroParo',
                id: id,
                data: data
            });
            return result;
        } catch (error) {
            console.error('Error en updateRegistroParo:', error);
            throw error;
        }

    },
    async cerrarLote(id_lote, id_maquina) {
        try {
            validarClave(id_lote, 'cerrarLote');
            validarClave(id_maquina, 'cerrarLote');
            const result = await runGoogle('apiHandler', {
                action: 'deleteMaquinaFromLote',
                id_lote: id_lote,
                id_maquina: id_maquina
            });
            return validarRespuesta(result, 'cerrarLote');
        } catch (error) {
            console.error('Error en cerrarLote:', error);
            throw error;
        }
    },
    async getProduccion(id) {
        try {
            validarClave(id, 'getProduccion');
            const result = await runGoogle('apiHandler', {
                action: 'getProduccion',
                id: id
            });
            return validarRespuesta(result, 'getProduccion');
        } catch (error) {
            console.error('Error en getProduccion:', error);
            throw error;
        }
    },
    async getParosByMaquina(id_maquina) {
        try {
            validarClave(id_maquina, 'getParosByMaquina');
            const result = await runGoogle('apiHandler', {
                action: 'getParosByMaquina',
                id_maquina: id_maquina
            });
            return result;
        } catch (error) {
            console.error('Error en getParosByMaquina:', error);
            throw error;
        }
    },
    async getParosProgramados() {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'getParosProgramados'
            });
            return result;
        } catch (error) {
            console.error('Error en getParosProgramados:', error);
            throw error;
        }
    },
    async getParoByClaveParo(clave) {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'getParoByClaveParo',
                clave: clave
            });
            return result;
        } catch (error) {
            console.error('Error en getParoByClaveParo:', error);
            throw error;
        }
    },
    async getLotesByMaquina(id_maquina) {
        try {
            validarClave(id_maquina, 'getLotesByMaquina');
            const result = await runGoogle('apiHandler', {
                action: 'getLotesByMaquina',
                id: id_maquina
            });
            return result;
        } catch (error) {
            console.error('Error en getLotesByMaquina:', error);
            throw error;
        }
    },
    async getRegistroParoById(claveParo) {
        try {
            validarClave(claveParo, 'getRegistroParoById');
            const result = await runGoogle('apiHandler', {
                action: 'getRegistroParoById',
                id: claveParo
            });
            return validarRespuesta(result, 'getRegistroParoById');
        } catch (error) {
            console.error('Error en getRegistroParoById:', error);
            throw error;
        }
    },

    async getProduccion_ProductoXMaquina(id_maquina, id_producto) {
        try {
            validarClave(id_maquina, 'getProduccion_ProductoXMaquina');
            validarClave(id_producto, 'getProduccion_ProductoXMaquina');
            const result = await runGoogle('apiHandler', {
                action: 'getProduccion_ProductoXMaquina',
                id_maquina: id_maquina,
                id_producto: id_producto
            });
            return result;
        } catch (error) {
            console.error('Error en getProduccion_ProductoXMaquina:', error);
            throw error;
        }
    },
    async getProduccionActiveByLoteMaquina(id_lote, id_maquina) {
        try {
            validarClave(id_lote, 'getProduccionActiveByLoteMaquina');
            validarClave(id_maquina, 'getProduccionActiveByLoteMaquina');
            const result = await runGoogle('apiHandler', {
                action: 'getProduccionActiveByLoteMaquina',
                id_lote: id_lote,
                id_maquina: id_maquina
            });
            return result;
        } catch (error) {
            console.error('Error en getProduccionActiveByLoteMaquina:', error);
            throw error;
        }
    },
    async setCorreo(data){
        try {
            const result = await runGoogle('apiHandler', {
                action: 'setCorreo',
                data: data
            });
            return result;
        } catch (error) {
            console.error('Error en setCorreo:', error);
            throw error;
        }
    },
    async getCorreoDuracion() {
        try {
            const result = await runGoogle('apiHandler', {
                action: 'getCorreoDuracion'
            });
            return result;
        } catch (error) {
            console.error('Error en getCorreoDuracion:', error);
            throw error;
        }
    },

    async  loginByEmail(email,password){
        try{
            const result = await runGoogle('apiHandler', {
                action: 'loginByEmail',
                email: email,
                password: password
            });
            return result;

        }catch(error){
            console.error('Error en loginByEmail:', error);
            throw error;
        }

    }

}