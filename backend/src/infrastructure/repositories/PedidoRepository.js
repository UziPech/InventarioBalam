const IPedidoRepository = require('../../domain/repositories/IPedidoRepository');
const Pedido = require('../../domain/entities/Pedido');

/**
 * Implementación del repositorio de pedidos usando JSON
 */
class PedidoRepository extends IPedidoRepository {
    constructor(database) {
        super();
        this.database = database;
    }

    /**
     * Obtener todos los pedidos
     * @returns {Promise<Array>} Lista de pedidos
     */
    async obtenerTodos() {
        try {
            const pedidosData = await this.database.getPedidos();
            return pedidosData.map(data => new Pedido(
                data.id,
                data.cliente,
                data.items,
                data.total
            ));
        } catch (error) {
            throw new Error(`Error al obtener pedidos: ${error.message}`);
        }
    }

    /**
     * Obtener un pedido por ID
     * @param {number} id - ID del pedido
     * @returns {Promise<Object|null>} Pedido encontrado o null
     */
    async obtenerPorId(id) {
        try {
            const pedidosData = await this.database.getPedidos();
            const pedidoData = pedidosData.find(p => p.id === id);
            
            if (!pedidoData) {
                return null;
            }

            return new Pedido(
                pedidoData.id,
                pedidoData.cliente,
                pedidoData.items,
                pedidoData.total
            );
        } catch (error) {
            throw new Error(`Error al obtener pedido por ID: ${error.message}`);
        }
    }

    /**
     * Crear un nuevo pedido
     * @param {Object} pedido - Datos del pedido
     * @returns {Promise<Object>} Pedido creado
     */
    async crear(pedido) {
        try {
            const pedidosData = await this.database.getPedidos();
            
            // Generar ID por día (reiniciar cada día)
            const hoy = new Date();
            const fechaHoy = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
            
            // Obtener pedidos de hoy
            const pedidosHoy = pedidosData.filter(p => {
                const fechaPedido = new Date(p.fecha).toISOString().split('T')[0];
                return fechaPedido === fechaHoy;
            });
            
            // Generar nuevo ID para hoy
            const nuevoId = pedidosHoy.length + 1;
            pedido.id = nuevoId;
            
            // Agregar fecha
            pedido.fecha = new Date();
            
            // Agregar información adicional para tracking
            pedido.numeroDia = nuevoId;
            pedido.fechaCreacion = fechaHoy;
            
            pedidosData.push(pedido.toJSON());
            await this.database.savePedidos(pedidosData);
            
            console.log(`📦 Pedido #${nuevoId} creado para ${fechaHoy}`);
            
            return pedido;
        } catch (error) {
            throw new Error(`Error al crear pedido: ${error.message}`);
        }
    }

    /**
     * Actualizar un pedido existente
     * @param {number} id - ID del pedido
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<Object>} Pedido actualizado
     */
    async actualizar(id, datos) {
        try {
            const pedidosData = await this.database.getPedidos();
            const index = pedidosData.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Pedido no encontrado');
            }

            // Actualizar datos
            pedidosData[index] = {
                ...pedidosData[index],
                ...datos.toJSON()
            };

            await this.database.savePedidos(pedidosData);
            
            return new Pedido(
                pedidosData[index].id,
                pedidosData[index].cliente,
                pedidosData[index].items,
                pedidosData[index].total
            );
        } catch (error) {
            throw new Error(`Error al actualizar pedido: ${error.message}`);
        }
    }

    /**
     * Eliminar un pedido
     * @param {number} id - ID del pedido
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminar(id) {
        try {
            const pedidosData = await this.database.getPedidos();
            const index = pedidosData.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Pedido no encontrado');
            }

            pedidosData.splice(index, 1);
            await this.database.savePedidos(pedidosData);
            
            return true;
        } catch (error) {
            throw new Error(`Error al eliminar pedido: ${error.message}`);
        }
    }

    /**
     * Obtener pedidos por cliente
     * @param {string} cliente - Nombre del cliente
     * @returns {Promise<Array>} Lista de pedidos del cliente
     */
    async obtenerPorCliente(cliente) {
        try {
            const pedidosData = await this.database.getPedidos();
            const pedidosFiltrados = pedidosData.filter(p => 
                p.cliente.toLowerCase().includes(cliente.toLowerCase())
            );

            return pedidosFiltrados.map(data => new Pedido(
                data.id,
                data.cliente,
                data.items,
                data.total
            ));
        } catch (error) {
            throw new Error(`Error al obtener pedidos por cliente: ${error.message}`);
        }
    }

    /**
     * Obtener pedidos por fecha
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Promise<Array>} Lista de pedidos en el rango de fechas
     */
    async obtenerPorFecha(fechaInicio, fechaFin) {
        try {
            const pedidosData = await this.database.getPedidos();
            const pedidosFiltrados = pedidosData.filter(p => {
                const fechaPedido = new Date(p.fecha);
                return fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
            });

            return pedidosFiltrados.map(data => new Pedido(
                data.id,
                data.cliente,
                data.items,
                data.total
            ));
        } catch (error) {
            throw new Error(`Error al obtener pedidos por fecha: ${error.message}`);
        }
    }

    /**
     * Obtener pedidos por estado
     * @param {string} estado - Estado del pedido
     * @returns {Promise<Array>} Lista de pedidos con el estado especificado
     */
    async obtenerPorEstado(estado) {
        try {
            const pedidosData = await this.database.getPedidos();
            const pedidosFiltrados = pedidosData.filter(p => p.estado === estado);

            return pedidosFiltrados.map(data => new Pedido(
                data.id,
                data.cliente,
                data.items,
                data.total
            ));
        } catch (error) {
            throw new Error(`Error al obtener pedidos por estado: ${error.message}`);
        }
    }

    /**
     * Obtener estadísticas de pedidos
     * @param {Date} fechaInicio - Fecha de inicio
     * @param {Date} fechaFin - Fecha de fin
     * @returns {Promise<Object>} Estadísticas de pedidos
     */
    async obtenerEstadisticas(fechaInicio, fechaFin) {
        try {
            const pedidosData = await this.database.getPedidos();
            const pedidosEnRango = pedidosData.filter(p => {
                const fechaPedido = new Date(p.fecha);
                return fechaPedido >= fechaInicio && fechaPedido <= fechaFin;
            });

            const totalPedidos = pedidosEnRango.length;
            const totalVentas = pedidosEnRango.reduce((sum, p) => sum + p.total, 0);
            const promedioPedido = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

            return {
                totalPedidos,
                totalVentas,
                promedioPedido,
                fechaInicio,
                fechaFin
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }
}

module.exports = PedidoRepository;
