const IPedidoRepository = require('../../domain/repositories/IPedidoRepository');
const Pedido = require('../../domain/entities/Pedido');
const { rangoDiaOperacion, fmtLocal, esDiaOperacionActual, TZ, START_HOUR } = require('../../utils/time');

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
            return pedidosData.map(data => {
                const pedido = new Pedido(
                    data.id,
                    data.cliente,
                    data.items,
                    data.total
                );
                
                // Preservar información adicional
                if (data.fecha) pedido.fecha = new Date(data.fecha);
                if (data.estado) pedido.estado = data.estado;
                if (data.numeroDia) pedido.numeroDia = data.numeroDia;
                if (data.fechaCreacion) pedido.fechaCreacion = data.fechaCreacion;
                
                return pedido;
            });
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

            const pedido = new Pedido(
                pedidoData.id,
                pedidoData.cliente,
                pedidoData.items,
                pedidoData.total
            );
            
            // Preservar información adicional
            if (pedidoData.fecha) pedido.fecha = new Date(pedidoData.fecha);
            if (pedidoData.estado) pedido.estado = pedidoData.estado;
            if (pedidoData.numeroDia) pedido.numeroDia = pedidoData.numeroDia;
            if (pedidoData.fechaCreacion) pedido.fechaCreacion = pedidoData.fechaCreacion;
            
            return pedido;
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
            
            // Usar el sistema de horario de operación mejorado con zona horaria
            const nowUtc = new Date();
            const { startUtc, endUtc, localStart } = rangoDiaOperacion(nowUtc, TZ, START_HOUR);
            
            // Generar ID único global (no solo del día) para evitar conflictos multi-dispositivo
            const maxId = pedidosData.length > 0 
                ? Math.max(...pedidosData.map(p => p.id))
                : 0;
            const nuevoId = maxId + 1;
            pedido.id = nuevoId;
            
            // Agregar fecha actual (UTC)
            pedido.fecha = nowUtc;
            
            // Obtener pedidos del día de operación actual para numeración del día
            // Simplificar la lógica para evitar problemas con el sistema de horarios
            const pedidosDiaOperacion = pedidosData.filter(p => {
                const fechaPedido = new Date(p.fecha);
                const fechaPedidoLocal = new Date(fechaPedido.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
                const nowLocal = new Date(nowUtc.getTime() - (6 * 60 * 60 * 1000)); // UTC-6
                
                // Comparar solo la fecha (sin hora) para determinar si es el mismo día
                const fechaPedidoStr = fechaPedidoLocal.toISOString().split('T')[0];
                const nowStr = nowLocal.toISOString().split('T')[0];
                
                return fechaPedidoStr === nowStr;
            });
            
            // Numeración del día (1, 2, 3, etc. para el día actual)
            const numeroDia = pedidosDiaOperacion.length + 1;
            
            // Agregar información adicional para tracking
            pedido.numeroDia = numeroDia;
            pedido.fechaCreacion = localStart.toISOString().split('T')[0];
            
            // Debug: mostrar información del horario de operación
            console.log(`📅 Horario de Operación - Zona: ${TZ}`);
            console.log(`🕐 Rango: ${fmtLocal(startUtc)} - ${fmtLocal(endUtc)}`);
            console.log(`📦 Pedido #${nuevoId} (Día #${numeroDia}) creado para el día de operación: ${fmtLocal(localStart, TZ, { dateStyle: 'full' })}`);
            console.log(`📊 Total pedidos en el día de operación: ${pedidosDiaOperacion.length + 1}`);
            
            // Guardar el pedido con toda la información incluida
            const pedidoParaGuardar = {
                ...pedido.toJSON(),
                numeroDia: numeroDia,
                fechaCreacion: localStart.toISOString().split('T')[0]
            };
            
            pedidosData.push(pedidoParaGuardar);
            await this.database.savePedidos(pedidosData);
            
            console.log(`✅ Pedido #${nuevoId} (Día #${numeroDia}) guardado exitosamente`);
            
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
            
            const pedidoActualizado = new Pedido(
                pedidosData[index].id,
                pedidosData[index].cliente,
                pedidosData[index].items,
                pedidosData[index].total
            );
            
            // Preservar información adicional
            if (pedidosData[index].fecha) pedidoActualizado.fecha = new Date(pedidosData[index].fecha);
            if (pedidosData[index].estado) pedidoActualizado.estado = pedidosData[index].estado;
            if (pedidosData[index].numeroDia) pedidoActualizado.numeroDia = pedidosData[index].numeroDia;
            if (pedidosData[index].fechaCreacion) pedidoActualizado.fechaCreacion = pedidosData[index].fechaCreacion;
            
            return pedidoActualizado;
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

            return pedidosFiltrados.map(data => {
                const pedido = new Pedido(
                    data.id,
                    data.cliente,
                    data.items,
                    data.total
                );
                
                // Preservar información adicional
                if (data.fecha) pedido.fecha = new Date(data.fecha);
                if (data.estado) pedido.estado = data.estado;
                if (data.numeroDia) pedido.numeroDia = data.numeroDia;
                if (data.fechaCreacion) pedido.fechaCreacion = data.fechaCreacion;
                
                return pedido;
            });
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

            return pedidosFiltrados.map(data => {
                const pedido = new Pedido(
                    data.id,
                    data.cliente,
                    data.items,
                    data.total
                );
                
                // Preservar información adicional
                if (data.fecha) pedido.fecha = new Date(data.fecha);
                if (data.estado) pedido.estado = data.estado;
                if (data.numeroDia) pedido.numeroDia = data.numeroDia;
                if (data.fechaCreacion) pedido.fechaCreacion = data.fechaCreacion;
                
                return pedido;
            });
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

            return pedidosFiltrados.map(data => {
                const pedido = new Pedido(
                    data.id,
                    data.cliente,
                    data.items,
                    data.total
                );
                
                // Preservar información adicional
                if (data.fecha) pedido.fecha = new Date(data.fecha);
                if (data.estado) pedido.estado = data.estado;
                if (data.numeroDia) pedido.numeroDia = data.numeroDia;
                if (data.fechaCreacion) pedido.fechaCreacion = data.fechaCreacion;
                
                return pedido;
            });
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

    /**
     * Eliminar un pedido específico
     * @param {number} id - ID del pedido a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminar(id) {
        try {
            const pedidosData = await this.database.getPedidos();
            const pedidoIndex = pedidosData.findIndex(p => p.id === id);
            
            if (pedidoIndex === -1) {
                throw new Error(`Pedido con ID ${id} no encontrado`);
            }

            // Eliminar el pedido del array
            pedidosData.splice(pedidoIndex, 1);
            
            // Guardar los cambios en la base de datos
            await this.database.savePedidos(pedidosData);
            
            console.log(`✅ Pedido #${id} eliminado exitosamente`);
            return true;
        } catch (error) {
            throw new Error(`Error al eliminar pedido: ${error.message}`);
        }
    }

    /**
     * Eliminar todos los pedidos (limpiar base de datos)
     * @returns {Promise<boolean>} True si se eliminaron todos correctamente
     */
    async eliminarTodos() {
        try {
            console.log('🧹 Iniciando eliminación de todos los pedidos...');
            
            // Guardar un array vacío para limpiar todos los pedidos
            await this.database.savePedidos([]);
            
            console.log('✅ Todos los pedidos eliminados exitosamente');
            return true;
        } catch (error) {
            throw new Error(`Error al eliminar todos los pedidos: ${error.message}`);
        }
    }
}

module.exports = PedidoRepository;
