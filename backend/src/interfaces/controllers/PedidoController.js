const { rangoDiaOperacion, proximoReinicio, fmtLocal, esDiaOperacionActual, obtenerInfoDebug, TZ, START_HOUR } = require('../../utils/time');

/**
 * Controlador para manejar las operaciones de pedidos
 */
class PedidoController {
    constructor(pedidoRepository, procesarPedidoUseCase, procesarPedidoMenuUseCase) {
        this.pedidoRepository = pedidoRepository;
        this.procesarPedidoUseCase = procesarPedidoUseCase;
        this.procesarPedidoMenuUseCase = procesarPedidoMenuUseCase;

    }

    /**
     * Obtener todos los pedidos
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerTodos(req, res) {
        try {
            const pedidos = await this.pedidoRepository.obtenerTodos();
            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: 'Pedidos obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos'
            });
        }
    }

    /**
     * Obtener un pedido por ID
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const pedido = await this.pedidoRepository.obtenerPorId(parseInt(id));
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            res.json({
                success: true,
                data: pedido.toJSON(),
                message: 'Pedido obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedido'
            });
        }
    }

    /**
     * Crear un nuevo pedido
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async crear(req, res) {
        try {
            const resultado = await this.procesarPedidoUseCase.ejecutar(req.body);
            
            if (resultado.success) {
                res.status(201).json(resultado);
            } else {
                res.status(400).json(resultado);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al crear pedido'
            });
        }
    }

    /**
     * Crear un nuevo pedido usando productos del menú
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async crearConMenu(req, res) {
        try {
            console.log('📦 Datos recibidos en crearConMenu:', JSON.stringify(req.body, null, 2));
            
            const resultado = await this.procesarPedidoMenuUseCase.ejecutar(req.body);
            
            console.log('📦 Resultado del procesamiento:', JSON.stringify(resultado, null, 2));
            
            if (resultado.success) {
                res.status(201).json(resultado);
            } else {
                res.status(400).json(resultado);
            }
        } catch (error) {
            console.error('❌ Error en crearConMenu:', error);
            
            // Mejorar mensaje de error para el usuario
            let mensajeError = 'Error al crear pedido con productos del menú';
            if (error.message && error.message.includes('Stock insuficiente')) {
                mensajeError = 'No hay suficientes ingredientes en el inventario para procesar este pedido. Por favor, verifica el stock disponible.';
            }
            
            res.status(500).json({
                success: false,
                error: error.message,
                message: mensajeError
            });
        }
    }

    /**
     * Actualizar un pedido
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const pedido = await this.pedidoRepository.obtenerPorId(parseInt(id));
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            // Actualizar propiedades
            if (req.body.cliente) pedido.cliente = req.body.cliente;
            if (req.body.items) pedido.items = req.body.items;
            if (req.body.total !== undefined) pedido.total = req.body.total;
            if (req.body.estado) pedido.actualizarEstado(req.body.estado);

            const pedidoActualizado = await this.pedidoRepository.actualizar(parseInt(id), pedido);

            res.json({
                success: true,
                data: pedidoActualizado.toJSON(),
                message: 'Pedido actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al actualizar pedido'
            });
        }
    }

    /**
     * Eliminar un pedido
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const pedido = await this.pedidoRepository.obtenerPorId(parseInt(id));
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            await this.pedidoRepository.eliminar(parseInt(id));

            res.json({
                success: true,
                message: 'Pedido eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al eliminar pedido'
            });
        }
    }

    /**
     * Obtener pedidos por cliente
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerPorCliente(req, res) {
        try {
            const { cliente } = req.query;
            
            if (!cliente) {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro cliente es requerido'
                });
            }

            const pedidos = await this.pedidoRepository.obtenerPorCliente(cliente);

            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: 'Pedidos del cliente obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos por cliente'
            });
        }
    }

    /**
     * Obtener estadísticas de pedidos
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerEstadisticas(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Los parámetros fechaInicio y fechaFin son requeridos'
                });
            }

            const estadisticas = await this.pedidoRepository.obtenerEstadisticas(
                new Date(fechaInicio),
                new Date(fechaFin)
            );

            res.json({
                success: true,
                data: estadisticas,
                message: 'Estadísticas obtenidas exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener estadísticas'
            });
        }
    }

    /**
     * Obtener pedidos de hoy
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerPedidosHoy(req, res) {
        try {
            // Usar el sistema de horario de operación mejorado con zona horaria
            const nowUtc = new Date();
            const { startUtc, endUtc, localStart } = rangoDiaOperacion(nowUtc, TZ, START_HOUR);
            
            console.log(`🔍 Buscando pedidos del día de operación: ${fmtLocal(localStart, TZ, { dateStyle: 'full' })}`);
            console.log(`🕐 Rango de operación: ${fmtLocal(startUtc)} - ${fmtLocal(endUtc)}`);
            
            const pedidos = await this.pedidoRepository.obtenerPorFecha(startUtc, endUtc);
            
            // Información de debug del horario de operación
            const infoDebug = obtenerInfoDebug(nowUtc, TZ, START_HOUR);
            
            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: `Pedidos del día de operación (${fmtLocal(localStart, TZ, { dateStyle: 'full' })})`,
                total: pedidos.length,
                fecha: localStart.toISOString().split('T')[0],
                infoHorario: {
                    zonaHoraria: infoDebug.zonaHoraria,
                    fechaActual: infoDebug.fechaActual.local,
                    rangoOperacion: `${infoDebug.rangoOperacion.inicioLocal} - ${infoDebug.rangoOperacion.finLocal}`
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos del día de operación'
            });
        }
    }

    /**
     * Obtener pedidos de esta semana
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerPedidosEstaSemana(req, res) {
        try {
            // Usar el sistema de horario de operación personalizado
            const rangoSemana = this.operacionHorario.obtenerRangoSemanaOperacion();
            
            console.log(`🔍 Buscando pedidos de la semana de operación`);
            console.log(`🕐 Rango: ${rangoSemana.inicio.toLocaleString('es-ES')} - ${rangoSemana.fin.toLocaleString('es-ES')}`);
            
            const pedidos = await this.pedidoRepository.obtenerPorFecha(rangoSemana.inicio, rangoSemana.fin);
            
            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: 'Pedidos de la semana de operación',
                total: pedidos.length,
                fechaInicio: rangoSemana.inicio.toISOString().split('T')[0],
                fechaFin: rangoSemana.fin.toISOString().split('T')[0],
                infoHorario: {
                    inicioSemana: rangoSemana.inicio.toLocaleString('es-ES'),
                    finSemana: rangoSemana.fin.toLocaleString('es-ES')
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos de la semana de operación'
            });
        }
    }

    /**
     * Obtener pedidos de este mes
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerPedidosEsteMes(req, res) {
        try {
            // Usar el sistema de horario de operación personalizado
            const rangoMes = this.operacionHorario.obtenerRangoMesOperacion();
            const fechaOperacion = this.operacionHorario.obtenerFechaOperacionActual();
            
            console.log(`🔍 Buscando pedidos del mes de operación`);
            console.log(`🕐 Rango: ${rangoMes.inicio.toLocaleString('es-ES')} - ${rangoMes.fin.toLocaleString('es-ES')}`);
            
            const pedidos = await this.pedidoRepository.obtenerPorFecha(rangoMes.inicio, rangoMes.fin);
            
            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: `Pedidos del mes de operación (${fechaOperacion.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })})`,
                total: pedidos.length,
                fechaInicio: rangoMes.inicio.toISOString().split('T')[0],
                fechaFin: rangoMes.fin.toISOString().split('T')[0],
                infoHorario: {
                    inicioMes: rangoMes.inicio.toLocaleString('es-ES'),
                    finMes: rangoMes.fin.toLocaleString('es-ES')
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos del mes de operación'
            });
        }
    }

    /**
     * Obtener pedidos pendientes
     * @param {Object} req - Request de Express
     * @param {Object} res - Response of Express
     */
    async obtenerPedidosPendientes(req, res) {
        try {
            const pedidos = await this.pedidoRepository.obtenerPorEstado('pendiente');
            
            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: 'Pedidos pendientes',
                total: pedidos.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos pendientes'
            });
        }
    }

    /**
     * Obtener información del horario de operación
     * @param {Object} req - Request de Express
     * @param {Object} res - Response of Express
     */
    async obtenerInfoHorarioOperacion(req, res) {
        try {
            // Usa UTC como base
            const nowUtc = new Date();

            // Rango del día de operación "hoy" (en términos del negocio)
            const { startUtc, endUtc, localStart, localEnd } = rangoDiaOperacion(nowUtc, TZ, START_HOUR);

            // Próximo reinicio (siguiente inicio de día de operación)
            const prx = proximoReinicio(nowUtc, TZ, START_HOUR);

            res.json({
                success: true,
                data: {
                    horarioOperacion: {
                        zonaHoraria: TZ,
                        horaInicio: START_HOUR,                     // 0 = 00:00 local
                        descripcion: '00:00 — 00:00 del día siguiente (rango semiabierto [inicio, fin))'
                    },
                    fechaActual: {
                        utc: nowUtc.toISOString(),
                        local: fmtLocal(nowUtc, TZ)
                    },
                    rangoOperacion: {
                        inicioUtc: startUtc.toISOString(),
                        finUtc: endUtc.toISOString(),
                        inicioLocal: fmtLocal(startUtc, TZ),
                        finLocal: fmtLocal(endUtc, TZ)
                    },
                    estado: {
                        esDiaOperacionActual: true, // si lo calculas, compara nowLocal ∈ [localStart, localEnd)
                        proximoReinicio: {
                            utc: prx.nextUtc.toISOString(),
                            local: fmtLocal(prx.nextUtc, TZ, { dateStyle: 'full', timeStyle: 'short' }),
                            restante: { horas: prx.horas, minutos: prx.minutos, ms: prx.msLeft }
                        }
                    }
                },
                message: 'Información del horario de operación obtenida exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener información del horario de operación'
            });
        }
    }



    /**
     * Cambiar estado de un pedido
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            
            const pedido = await this.pedidoRepository.obtenerPorId(parseInt(id));
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            // Validar estado
            const estadosValidos = ['pendiente', 'pagado', 'cancelado'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado no válido. Estados permitidos: pendiente, pagado, cancelado'
                });
            }

            // Actualizar estado
            pedido.actualizarEstado(estado);
            await this.pedidoRepository.actualizar(parseInt(id), pedido);

            res.json({
                success: true,
                data: pedido.toJSON(),
                message: `Pedido #${pedido.id} marcado como ${estado}`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al cambiar estado del pedido'
            });
        }
    }

    /**
     * Marcar pedido como pagado
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async marcarComoPagado(req, res) {
        try {
            const { id } = req.params;
            
            const pedido = await this.pedidoRepository.obtenerPorId(parseInt(id));
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            pedido.actualizarEstado('pagado');
            await this.pedidoRepository.actualizar(parseInt(id), pedido);

            res.json({
                success: true,
                data: pedido.toJSON(),
                message: `Pedido #${pedido.id} marcado como pagado`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al marcar pedido como pagado'
            });
        }
    }

    /**
     * Cancelar pedido
     * @param {Object} req - Request of Express
     * @param {Object} res - Response of Express
     */
    async cancelarPedido(req, res) {
        try {
            const { id } = req.params;
            
            const pedido = await this.pedidoRepository.obtenerPorId(parseInt(id));
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            pedido.actualizarEstado('cancelado');
            await this.pedidoRepository.actualizar(parseInt(id), pedido);

            res.json({
                success: true,
                data: pedido.toJSON(),
                message: `Pedido #${pedido.id} cancelado`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al cancelar pedido'
            });
        }
    }

    /**
     * Eliminar todos los pedidos (limpiar base de datos)
     * @param {Object} req - Request of Express
     * @param {Object} res - Response of Express
     */
    async eliminarTodosLosPedidos(req, res) {
        try {
            console.log('🧹 Iniciando limpieza completa de la base de datos...');
            
            // Obtener todos los pedidos antes de eliminarlos
            const pedidosExistentes = await this.pedidoRepository.obtenerTodos();
            console.log(`📊 Pedidos encontrados para eliminar: ${pedidosExistentes.length}`);
            
            // Eliminar todos los pedidos
            await this.pedidoRepository.eliminarTodos();
            
            console.log('✅ Todos los pedidos eliminados exitosamente');
            
            res.json({
                success: true,
                message: `Se eliminaron ${pedidosExistentes.length} pedidos de la base de datos`,
                pedidosEliminados: pedidosExistentes.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Error al eliminar todos los pedidos:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al eliminar todos los pedidos'
            });
        }
    }

    /**
     * Eliminar un pedido específico
     * @param {Object} req - Request of Express
     * @param {Object} res - Response of Express
     */
    async eliminarPedido(req, res) {
        try {
            const { id } = req.params;
            
            const pedido = await this.pedidoRepository.obtenerPorId(parseInt(id));
            
            if (!pedido) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            await this.pedidoRepository.eliminar(parseInt(id));

            res.json({
                success: true,
                message: `Pedido #${pedido.id} eliminado exitosamente`,
                pedidoEliminado: pedido.toJSON()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al eliminar pedido'
            });
        }
    }
}

module.exports = PedidoController;
