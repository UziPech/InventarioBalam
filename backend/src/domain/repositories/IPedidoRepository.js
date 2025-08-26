/**
 * Interfaz del repositorio de pedidos
 * Define los métodos que debe implementar cualquier repositorio de pedidos
 */
class IPedidoRepository {
    /**
     * Obtener todos los pedidos
     * @returns {Promise<Array>} Lista de pedidos
     */
    async obtenerTodos() {
        throw new Error('Método obtenerTodos debe ser implementado');
    }

    /**
     * Obtener un pedido por ID
     * @param {number} id - ID del pedido
     * @returns {Promise<Object|null>} Pedido encontrado o null
     */
    async obtenerPorId(id) {
        throw new Error('Método obtenerPorId debe ser implementado');
    }

    /**
     * Crear un nuevo pedido
     * @param {Object} pedido - Datos del pedido
     * @returns {Promise<Object>} Pedido creado
     */
    async crear(pedido) {
        throw new Error('Método crear debe ser implementado');
    }

    /**
     * Actualizar un pedido existente
     * @param {number} id - ID del pedido
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<Object>} Pedido actualizado
     */
    async actualizar(id, datos) {
        throw new Error('Método actualizar debe ser implementado');
    }

    /**
     * Eliminar un pedido
     * @param {number} id - ID del pedido
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminar(id) {
        throw new Error('Método eliminar debe ser implementado');
    }

    /**
     * Obtener pedidos por cliente
     * @param {string} cliente - Nombre del cliente
     * @returns {Promise<Array>} Lista de pedidos del cliente
     */
    async obtenerPorCliente(cliente) {
        throw new Error('Método obtenerPorCliente debe ser implementado');
    }

    /**
     * Obtener pedidos por fecha
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Promise<Array>} Lista de pedidos en el rango de fechas
     */
    async obtenerPorFecha(fechaInicio, fechaFin) {
        throw new Error('Método obtenerPorFecha debe ser implementado');
    }

    /**
     * Obtener pedidos por estado
     * @param {string} estado - Estado del pedido
     * @returns {Promise<Array>} Lista de pedidos con el estado especificado
     */
    async obtenerPorEstado(estado) {
        throw new Error('Método obtenerPorEstado debe ser implementado');
    }

    /**
     * Obtener estadísticas de pedidos
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Promise<Object>} Estadísticas de pedidos
     */
    async obtenerEstadisticas(fechaInicio, fechaFin) {
        throw new Error('Método obtenerEstadisticas debe ser implementado');
    }
}

module.exports = IPedidoRepository;
