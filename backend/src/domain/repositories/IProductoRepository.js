/**
 * Interfaz del repositorio de productos
 * Define los métodos que debe implementar cualquier repositorio de productos
 */
class IProductoRepository {
    /**
     * Obtener todos los productos
     * @returns {Promise<Array>} Lista de productos
     */
    async obtenerTodos() {
        throw new Error('Método obtenerTodos debe ser implementado');
    }

    /**
     * Obtener un producto por ID
     * @param {number} id - ID del producto
     * @returns {Promise<Object|null>} Producto encontrado o null
     */
    async obtenerPorId(id) {
        throw new Error('Método obtenerPorId debe ser implementado');
    }

    /**
     * Crear un nuevo producto
     * @param {Object} producto - Datos del producto
     * @returns {Promise<Object>} Producto creado
     */
    async crear(producto) {
        throw new Error('Método crear debe ser implementado');
    }

    /**
     * Actualizar un producto existente
     * @param {number} id - ID del producto
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<Object>} Producto actualizado
     */
    async actualizar(id, datos) {
        throw new Error('Método actualizar debe ser implementado');
    }

    /**
     * Eliminar un producto
     * @param {number} id - ID del producto
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminar(id) {
        throw new Error('Método eliminar debe ser implementado');
    }

    /**
     * Actualizar la cantidad de stock de un producto
     * @param {number} id - ID del producto
     * @param {number} cantidad - Nueva cantidad
     * @returns {Promise<Object>} Producto actualizado
     */
    async actualizarStock(id, cantidad) {
        throw new Error('Método actualizarStock debe ser implementado');
    }

    /**
     * Buscar productos por nombre
     * @param {string} nombre - Nombre a buscar
     * @returns {Promise<Array>} Lista de productos que coinciden
     */
    async buscarPorNombre(nombre) {
        throw new Error('Método buscarPorNombre debe ser implementado');
    }

    /**
     * Obtener productos con stock bajo
     * @param {number} limite - Límite de stock para considerar bajo
     * @returns {Promise<Array>} Lista de productos con stock bajo
     */
    async obtenerConStockBajo(limite = 10) {
        throw new Error('Método obtenerConStockBajo debe ser implementado');
    }
}

module.exports = IProductoRepository;
