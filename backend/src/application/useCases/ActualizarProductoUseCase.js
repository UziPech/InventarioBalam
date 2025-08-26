/**
 * Caso de uso para actualizar un producto existente
 */
class ActualizarProductoUseCase {
    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {number} id - ID del producto a actualizar
     * @param {Object} datosProducto - Datos del producto a actualizar
     * @returns {Object} Resultado de la operación
     */
    async ejecutar(id, datosProducto) {
        try {
            // Validar que el producto existe
            const productoExistente = await this.productoRepository.obtenerPorId(id);
            if (!productoExistente) {
                return {
                    success: false,
                    message: 'Producto no encontrado'
                };
            }

            // Validar datos requeridos
            if (!datosProducto.nombre || datosProducto.nombre.trim() === '') {
                return {
                    success: false,
                    message: 'El nombre del producto es requerido'
                };
            }

            if (datosProducto.cantidad === undefined || datosProducto.cantidad < 0) {
                return {
                    success: false,
                    message: 'La cantidad debe ser un número mayor o igual a 0'
                };
            }

            if (!datosProducto.unidad || datosProducto.unidad.trim() === '') {
                return {
                    success: false,
                    message: 'La unidad de medida es requerida'
                };
            }

            if (datosProducto.precio === undefined || datosProducto.precio < 0) {
                return {
                    success: false,
                    message: 'El precio debe ser un número mayor o igual a 0'
                };
            }

            // Actualizar el producto
            const productoActualizado = await this.productoRepository.actualizar(id, {
                ...productoExistente,
                nombre: datosProducto.nombre.trim(),
                cantidad: datosProducto.cantidad,
                unidad: datosProducto.unidad.trim(),
                precio: datosProducto.precio,
                fechaActualizacion: new Date()
            });

            return {
                success: true,
                data: productoActualizado,
                message: 'Producto actualizado exitosamente'
            };

        } catch (error) {
            console.error('Error en ActualizarProductoUseCase:', error);
            return {
                success: false,
                message: 'Error al actualizar el producto',
                error: error.message
            };
        }
    }
}

module.exports = ActualizarProductoUseCase;
