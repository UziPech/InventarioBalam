/**
 * Caso de uso para eliminar un producto
 */
class EliminarProductoUseCase {
    constructor(productoRepository) {
        this.productoRepository = productoRepository;
    }

    /**
     * Ejecutar el caso de uso
     * @param {number} id - ID del producto a eliminar
     * @returns {Object} Resultado de la operación
     */
    async ejecutar(id) {
        try {
            // Validar que el producto existe
            const productoExistente = await this.productoRepository.obtenerPorId(id);
            if (!productoExistente) {
                return {
                    success: false,
                    message: 'Producto no encontrado'
                };
            }

            // Eliminar el producto
            await this.productoRepository.eliminar(id);

            return {
                success: true,
                message: 'Producto eliminado exitosamente'
            };

        } catch (error) {
            console.error('Error en EliminarProductoUseCase:', error);
            return {
                success: false,
                message: 'Error al eliminar el producto',
                error: error.message
            };
        }
    }
}

module.exports = EliminarProductoUseCase;
