const runGoogle = (serverFunction, params) => {
    return new Promise((resolve, reject) => {
        console.log(`Llamando a ${serverFunction} con params:`, params);

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

                console.log(clave);
                console.log('valor esperado: 123456789');
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
                return resolve({
                    response: 'Hello from updateProduccion!',
                    status: 200,
                    result: { name: "clave_produccion" }
                })
            }
            if (params.action === 'updateRegistroParo') {
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
                        hora_termino: "00:00:00",
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

            return reject("Estás en localhost. Haz Build y sube a Apps Script.");
        }

        // 2. Verificar que google.script.run existe
        if (!google.script || !google.script.run) {
            const error = 'google.script.run no está disponible';
            console.error('Error', error);
            reject(new Error(error));
            return;
        }

        console.log('google.script.run disponible, iniciando llamada...');

        // 3. Crear timeout de seguridad (90 segundos)
        const timeout = setTimeout(() => {
            console.error('Timeout: La llamada tardó más de 30 segundos');
            reject(new Error('Timeout: El servidor tardó demasiado en responder'));
        }, 90000);

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
                        console.log('JSON parseado exitosamente:', parsed);
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
                console.log('Retornando response tal cual:', response);
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

        console.log('Esperando respuesta del servidor...');

    });
};
export const ApiService = {
    // --- Prueba ---
    async testAppscript() {
        try {
            console.log('Solicitando información del usuario...');
            const result = await runGoogle('apiHandler', { action: 'testAppscript' });
            console.log('Usuario recibido:', result);
            return result;
        } catch (error) {
            console.error('Error en getUserInfo:', error);
            throw error;
        }
    },
    async login(Code) {
        // const params = { action: 'login', clave:qrCode };
        try {
            console.log('Solicitando información del usuario...');
            const result = await runGoogle('apiHandler', {
                action: 'login',
                clave: Code
            });
            //console.log('Usuario recibido:', result);
            return result;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },
    async getParos() {
        try {
            // console.log('Solicitando paros...');
            const result = await runGoogle('apiHandler', {
                action: 'getParos'
            });
            //console.log('Usuario recibido:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getLotes() {
        try {
            //console.log('Solicitando lotes...');
            const result = await runGoogle('apiHandler', {
                action: 'getLotes'
            });
            //console.log('Usuario recibido:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getProductos() {
        try {
            // console.log('Solicitando paros...');
            const result = await runGoogle('apiHandler', {
                action: 'getProductos'
            });
            // console.log('Usuario recibido:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getTurnos() {
        try {
            //console.log('Solicitando paros...');
            const result = await runGoogle('apiHandler', {
                action: 'getHorarios'
            });
            //console.log('Usuario recibido:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getTurnos() {
        try {
            // console.log('Solicitando paros...');
            const result = await runGoogle('apiHandler', {
                action: 'getTurnos'
            });
            // console.log('Usuario recibido:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getMaquinas() {
        try {
            //console.log('Solicitando paros...');
            const result = await runGoogle('apiHandler', {
                action: 'getMaquinas'
            });
            //console.log('Usuario recibido:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },

    async insertRegistroParo(data) {
        try {
            console.log('insertRegistroParo...');
            //console.log(data);
            const result = await runGoogle('apiHandler', {
                action: 'insertRegistroParo',
                data: data
            });
            console.log('Clave recibida:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async insertProduccion(data) {
        try {
            console.log('insertProduccion...');
            console.log(data);
            const result = await runGoogle('apiHandler', {
                action: 'insertProduccion',
                data: data
            });
            console.log('Clave recibida:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async updateProduccion(id, data) {
        try {
            //console.log('updateProduccion...');
            //console.log(id);
            //console.log(data);
            const result = await runGoogle('apiHandler', {
                action: 'updateProduccion',
                id: id,
                data: data
            });
            console.log('Clave recibida:', result);
            return result;
        } catch (error) {
            console.error(error)
        }

    },
    async updateRegistroParo(id, data) {
        try {
            // console.log('Solicitando paros...');
            // console.log(id);
            // console.log(data);
            const result = await runGoogle('apiHandler', {
                action: 'updateRegistroParo',
                id: id,
                data: data
            });
            console.log('Clave recibida:', result);
            return result;
        } catch (error) {
            console.error(error)
        }

    },
    async cerrarLote(id_lote, id_maquina) {
        try {
            // console.log('Solicitando cerrar lote...');
            // console.log(id);
            const result = await runGoogle('apiHandler', {
                action: 'deleteMaquinaFromLote',
                id_lote: id_lote,
                id_maquina: id_maquina
            });
            console.log('Clave recibida:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getProduccion(id) {
        try {
            //console.log('Solicitando paros...');
            //console.log(id);
            const result = await runGoogle('apiHandler', {
                action: 'getProduccion',
                id: id
            });
            console.log('produccion recibida:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getParosByMaquina(id_maquina) {
        try {
            //console.log('Solicitando paros...');
            //console.log(id_maquina);
            const result = await runGoogle('apiHandler', {
                action: 'getParosByMaquina',
                id: id_maquina
            });
            console.log('paros recibidos:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getParosProgramados() {
        try {
            //console.log('Solicitando paros...');
            const result = await runGoogle('apiHandler', {
                action: 'getParosProgramados'
            });
            console.log('paros recibidos:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getParoByClaveParo(clave) {
        try {
            //console.log('Solicitando paros...');
            const result = await runGoogle('apiHandler', {
                action: 'getParoByClaveParo',
                clave: clave
            });
            console.log('paros recibidos:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getLotesByMaquina(id_maquina) {
        try {
            //console.log('Solicitando paros...');
            //console.log(id_maquina);
            const result = await runGoogle('apiHandler', {
                action: 'getLotesByMaquina',
                id: id_maquina
            });
            console.log('lotes recibidos:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },
    async getRegistroParoById(claveParo) {
        try {
            //console.log('Solicitando paros...');
            //console.log(id_maquina);
            const result = await runGoogle('apiHandler', {
                action: 'getRegistroParoById',
                id: claveParo
            });
            console.log('registro paro recibido:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },

    async getProduccion_ProductoXMaquina(id_maquina, id_producto) {
        try {
            //console.log('Solicitando paros...');
            //console.log(id_maquina);
            const result = await runGoogle('apiHandler', {
                action: 'getProduccion_ProductoXMaquina',
                id_maquina: id_maquina,
                id_producto: id_producto
            });
            console.log('produccion recibida de la maquina y producto:', result);
            return result;
        } catch (error) {
            console.error(error)
        }
    },

}