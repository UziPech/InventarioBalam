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
            const resultado = await this.procesarPedidoMenuUseCase.ejecutar(req.body);
            
            if (resultado.success) {
                res.status(201).json(resultado);
            } else {
                res.status(400).json(resultado);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al crear pedido con productos del menú'
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
}

module.exports = PedidoController;
