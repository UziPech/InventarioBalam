const Producto = require('../../domain/entities/Producto');

/**
 * Caso de uso para crear un nuevo producto
 */
class CrearProductoUseCase {
    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }

    /**
     * Ejecuta el caso de uso
     * @param {Object} datosProducto - Datos del producto a crear
     * @param {string} datosProducto.nombre - Nombre del producto
     * @param {number} datosProducto.cantidad - Cantidad inicial
     * @param {string} datosProducto.unidad - Unidad de medida
     * @param {number} datosProducto.precio - Precio unitario
     * @returns {Promise<Object>} Producto creado
     */
    async ejecutar(datosProducto) {
        try {
            // Validar datos de entrada
            this.validarDatos(datosProducto);

            // Crear la entidad Producto
            const producto = new Producto(
                Date.now(), // ID temporal, se asignará uno real en el repositorio
                datosProducto.nombre,
                datosProducto.cantidad,
                datosProducto.unidad,
                datosProducto.precio
            );

            // Validar que la entidad sea válida
            if (!producto.esValido()) {
                throw new Error('Los datos del producto no son válidos');
            }

            // Guardar en el repositorio
            const productoGuardado = await this.productoRepository.crear(producto);

            return {
                success: true,
                data: productoGuardado,
                message: 'Producto creado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al crear el producto'
            };
        }
    }

    /**
     * Valida los datos de entrada
     * @param {Object} datos - Datos a validar
     */
    validarDatos(datos) {
        if (!datos.nombre || datos.nombre.trim().length === 0) {
            throw new Error('El nombre del producto es requerido');
        }

        if (datos.cantidad === undefined || datos.cantidad < 0) {
            throw new Error('La cantidad debe ser un número mayor o igual a 0');
        }

        if (!datos.unidad || datos.unidad.trim().length === 0) {
            throw new Error('La unidad de medida es requerida');
        }

        if (datos.precio === undefined || datos.precio < 0) {
            throw new Error('El precio debe ser un número mayor o igual a 0');
        }
    }
}

module.exports = CrearProductoUseCase;
