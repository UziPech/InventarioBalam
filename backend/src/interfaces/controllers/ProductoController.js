/**
 * Controlador para manejar las operaciones de productos
 */
class ProductoController {
    constructor(productoRepository, crearProductoUseCase, actualizarProductoUseCase, eliminarProductoUseCase) {
        this.productoRepository = productoRepository;
        this.crearProductoUseCase = crearProductoUseCase;
        this.actualizarProductoUseCase = actualizarProductoUseCase;
        this.eliminarProductoUseCase = eliminarProductoUseCase;
    }

    /**
     * Obtener todos los productos
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerTodos(req, res) {
        try {
            const productos = await this.productoRepository.obtenerTodos();
            res.json({
                success: true,
                data: productos.map(p => p.toJSON()),
                message: 'Productos obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener productos'
            });
        }
    }

    /**
     * Obtener un producto por ID
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const producto = await this.productoRepository.obtenerPorId(parseInt(id));
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: producto.toJSON(),
                message: 'Producto obtenido exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener producto'
            });
        }
    }

    /**
     * Crear un nuevo producto
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async crear(req, res) {
        try {
            const resultado = await this.crearProductoUseCase.ejecutar(req.body);
            
            if (resultado.success) {
                res.status(201).json(resultado);
            } else {
                res.status(400).json(resultado);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al crear producto'
            });
        }
    }

    /**
     * Actualizar un producto
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await this.actualizarProductoUseCase.ejecutar(parseInt(id), req.body);
            
            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data.toJSON(),
                    message: resultado.message
                });
            } else {
                res.status(400).json(resultado);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al actualizar producto'
            });
        }
    }

    /**
     * Eliminar un producto
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await this.eliminarProductoUseCase.ejecutar(parseInt(id));
            
            if (resultado.success) {
                res.json({
                    success: true,
                    message: resultado.message
                });
            } else {
                res.status(404).json(resultado);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al eliminar producto'
            });
        }
    }

    /**
     * Buscar productos por nombre
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

            const productos = await this.productoRepository.buscarPorNombre(nombre);

            res.json({
                success: true,
                data: productos.map(p => p.toJSON()),
                message: 'Búsqueda completada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al buscar productos'
            });
        }
    }

    /**
     * Obtener productos con stock bajo
     * @param {Object} req - Request of Express
     * @param {Object} res - Response of Express
     */
    async obtenerConStockBajo(req, res) {
        try {
            const { limite = 10 } = req.query;
            const productos = await this.productoRepository.obtenerConStockBajo(parseInt(limite));

            res.json({
                success: true,
                data: productos.map(p => p.toJSON()),
                message: 'Productos con stock bajo obtenidos exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al obtener productos con stock bajo'
            });
        }
    }

    /**
     * Actualizar stock de un producto
     * @param {Object} req - Request of Express
     * @param {Object} res - Response of Express
     */
    async actualizarStock(req, res) {
        try {
            const { id } = req.params;
            const { cantidad } = req.body;

            if (cantidad === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad es requerida'
                });
            }

            const producto = await this.productoRepository.obtenerPorId(parseInt(id));
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            const productoActualizado = await this.productoRepository.actualizarStock(parseInt(id), cantidad);

            res.json({
                success: true,
                data: productoActualizado.toJSON(),
                message: 'Stock actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                message: 'Error al actualizar stock'
            });
        }
    }
}

module.exports = ProductoController;
