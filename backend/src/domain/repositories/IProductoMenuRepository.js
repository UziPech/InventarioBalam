/**
 * Interfaz del repositorio de productos del menú
 * Define los métodos que debe implementar cualquier repositorio de productos del menú
 */
class IProductoMenuRepository {
    /**
     * Obtener todos los productos del menú
     * @returns {Promise<Array>} Lista de productos del menú
     */
    async obtenerTodos() {
        throw new Error('Método obtenerTodos debe ser implementado');
    }

    /**
     * Obtener productos activos del menú
     * @returns {Promise<Array>} Lista de productos activos
     */
    async obtenerActivos() {
        throw new Error('Método obtenerActivos debe ser implementado');
    }

    /**
     * Obtener un producto del menú por ID
     * @param {number} id - ID del producto
     * @returns {Promise<Object|null>} Producto encontrado o null
     */
    async obtenerPorId(id) {
        throw new Error('Método obtenerPorId debe ser implementado');
    }

    /**
     * Crear un nuevo producto del menú
     * @param {Object} productoMenu - Datos del producto
     * @returns {Promise<Object>} Producto creado
     */
    async crear(productoMenu) {
        throw new Error('Método crear debe ser implementado');
    }

    /**
     * Actualizar un producto del menú existente
     * @param {number} id - ID del producto
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<Object>} Producto actualizado
     */
    async actualizar(id, datos) {
        throw new Error('Método actualizar debe ser implementado');
    }

    /**
     * Eliminar un producto del menú
     * @param {number} id - ID del producto
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminar(id) {
        throw new Error('Método eliminar debe ser implementado');
    }

    /**
     * Buscar productos del menú por nombre
     * @param {string} nombre - Nombre a buscar
     * @returns {Promise<Array>} Lista de productos que coinciden
     */
    async buscarPorNombre(nombre) {
        throw new Error('Método buscarPorNombre debe ser implementado');
    }

    /**
     * Obtener productos del menú por rango de precio
     * @param {number} precioMin - Precio mínimo
     * @param {number} precioMax - Precio máximo
     * @returns {Promise<Array>} Lista de productos en el rango
     */
    async obtenerPorRangoPrecio(precioMin, precioMax) {
        throw new Error('Método obtenerPorRangoPrecio debe ser implementado');
    }

    /**
     * Activar o desactivar un producto del menú
     * @param {number} id - ID del producto
     * @param {boolean} activo - Estado del producto
     * @returns {Promise<Object>} Producto actualizado
     */
    async cambiarEstado(id, activo) {
        throw new Error('Método cambiarEstado debe ser implementado');
    }

    /**
     * Obtener productos del menú que usan un ingrediente específico
     * @param {number} productoId - ID del producto de inventario
     * @returns {Promise<Array>} Lista de productos que usan el ingrediente
     */
    async obtenerPorIngrediente(productoId) {
        throw new Error('Método obtenerPorIngrediente debe ser implementado');
    }

    /**
     * Obtener estadísticas de productos del menú
     * @returns {Promise<Object>} Estadísticas de productos del menú
     */
    async obtenerEstadisticas() {
        throw new Error('Método obtenerEstadisticas debe ser implementado');
    }
}

module.exports = IProductoMenuRepository;
