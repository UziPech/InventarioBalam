/**
 * Controlador para manejar las operaciones de productos del menú
 */
class ProductoMenuController {
    constructor(productoMenuRepository, crearProductoMenuUseCase) {
        this.productoMenuRepository = productoMenuRepository;
        this.crearProductoMenuUseCase = crearProductoMenuUseCase;
    }

    /**
     * Obtener todos los productos del menú
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerTodos(req, res) {
        try {
            const productosMenu = await this.productoMenuRepository.obtenerTodos();
            res.json({
                success: true,
                data: productosMenu.map(p => p.toJSON()),
                message: 'Productos del menú obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener productos del menú'
            });
        }
    }

    /**
     * Obtener productos activos del menú
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerActivos(req, res) {
        try {
            const productosMenu = await this.productoMenuRepository.obtenerActivos();
            res.json({
                success: true,
                data: productosMenu.map(p => p.toJSON()),
                message: 'Productos activos del menú obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener productos activos del menú'
            });
        }
    }

    /**
     * Obtener un producto del menú por ID
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const productoMenu = await this.productoMenuRepository.obtenerPorId(parseInt(id));
            
            if (!productoMenu) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto del menú no encontrado'
                });
            }

            res.json({
                success: true,
                data: productoMenu.toJSON(),
                message: 'Producto del menú obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener producto del menú'
            });
        }
    }

    /**
     * Crear un nuevo producto del menú
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async crear(req, res) {
        try {
            const resultado = await this.crearProductoMenuUseCase.ejecutar(req.body);
            
            if (resultado.success) {
                res.status(201).json(resultado);
            } else {
                res.status(400).json(resultado);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al crear producto del menú'
            });
        }
    }

    /**
     * Actualizar un producto del menú
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const productoMenu = await this.productoMenuRepository.obtenerPorId(parseInt(id));
            
            if (!productoMenu) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto del menú no encontrado'
                });
            }

            // Actualizar propiedades
            if (req.body.nombre) productoMenu.nombre = req.body.nombre;
            if (req.body.precio !== undefined) productoMenu.precio = req.body.precio;
            if (req.body.descripcion !== undefined) productoMenu.descripcion = req.body.descripcion;
            if (req.body.ingredientes) productoMenu.ingredientes = req.body.ingredientes;

            const productoMenuActualizado = await this.productoMenuRepository.actualizar(parseInt(id), productoMenu);

            res.json({
                success: true,
                data: productoMenuActualizado.toJSON(),
                message: 'Producto del menú actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al actualizar producto del menú'
            });
        }
    }

    /**
     * Eliminar un producto del menú
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const productoMenu = await this.productoMenuRepository.obtenerPorId(parseInt(id));
            
            if (!productoMenu) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto del menú no encontrado'
                });
            }

            await this.productoMenuRepository.eliminar(parseInt(id));

            res.json({
                success: true,
                message: 'Producto del menú eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al eliminar producto del menú'
            });
        }
    }

    /**
     * Buscar productos del menú por nombre
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async buscarPorNombre(req, res) {
        try {
            const { nombre } = req.query;
            
            if (!nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro nombre es requerido'
                });
            }

            const productosMenu = await this.productoMenuRepository.buscarPorNombre(nombre);

            res.json({
                success: true,
                data: productosMenu.map(p => p.toJSON()),
                message: 'Búsqueda completada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al buscar productos del menú'
            });
        }
    }

    /**
     * Cambiar estado de un producto del menú
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { activo } = req.body;
            
            if (activo === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro activo es requerido'
                });
            }

            const productoMenu = await this.productoMenuRepository.cambiarEstado(parseInt(id), activo);

            res.json({
                success: true,
                data: productoMenu.toJSON(),
                message: `Producto del menú ${activo ? 'activado' : 'desactivado'} exitosamente`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al cambiar estado del producto del menú'
            });
        }
    }

    /**
     * Obtener estadísticas de productos del menú
     * @param {Object} req - Request de Express
     * @param {Object} res - Response of Express
     */
    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await this.productoMenuRepository.obtenerEstadisticas();

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

module.exports = ProductoMenuController;
