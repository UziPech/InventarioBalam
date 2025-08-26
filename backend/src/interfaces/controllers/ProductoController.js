/**
 * Controlador para manejar las operaciones de productos
 */
class ProductoController {
    constructor(productoRepository, crearProductoUseCase) {
        this.productoRepository = productoRepository;
        this.crearProductoUseCase = crearProductoUseCase;
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
            const producto = await this.productoRepository.obtenerPorId(parseInt(id));
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Actualizar propiedades
            if (req.body.nombre) producto.nombre = req.body.nombre;
            if (req.body.cantidad !== undefined) producto.cantidad = req.body.cantidad;
            if (req.body.unidad) producto.unidad = req.body.unidad;
            if (req.body.precio !== undefined) producto.precio = req.body.precio;

            const productoActualizado = await this.productoRepository.actualizar(parseInt(id), producto);

            res.json({
                success: true,
                data: productoActualizado.toJSON(),
                message: 'Producto actualizado exitosamente'
            });
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
            const producto = await this.productoRepository.obtenerPorId(parseInt(id));
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            await this.productoRepository.eliminar(parseInt(id));

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
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
     * @param {Object} req - Request de Express
     * @param {Object} res - Response de Express
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
}

module.exports = ProductoController;
