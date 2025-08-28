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
            const hoy = new Date();
            const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);
            
            const pedidos = await this.pedidoRepository.obtenerPorFecha(inicioDia, finDia);
            
            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: `Pedidos de hoy (${hoy.toLocaleDateString('es-ES')})`,
                total: pedidos.length,
                fecha: hoy.toISOString().split('T')[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos de hoy'
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
            const hoy = new Date();
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo
            inicioSemana.setHours(0, 0, 0, 0);
            
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6); // Sábado
            finSemana.setHours(23, 59, 59, 999);
            
            const pedidos = await this.pedidoRepository.obtenerPorFecha(inicioSemana, finSemana);
            
            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: 'Pedidos de esta semana',
                total: pedidos.length,
                fechaInicio: inicioSemana.toISOString().split('T')[0],
                fechaFin: finSemana.toISOString().split('T')[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos de esta semana'
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
            const hoy = new Date();
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999);
            
            const pedidos = await this.pedidoRepository.obtenerPorFecha(inicioMes, finMes);
            
            res.json({
                success: true,
                data: pedidos.map(p => p.toJSON()),
                message: `Pedidos de ${hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
                total: pedidos.length,
                fechaInicio: inicioMes.toISOString().split('T')[0],
                fechaFin: finMes.toISOString().split('T')[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener pedidos de este mes'
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
}

module.exports = PedidoController;
