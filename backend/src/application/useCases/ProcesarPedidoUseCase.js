const Pedido = require('../../domain/entities/Pedido');

/**
 * Caso de uso para procesar un pedido y actualizar el inventario
 */
class ProcesarPedidoUseCase {
    constructor(pedidoRepository, productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
    }

    /**
     * Ejecuta el caso de uso
     * @param {Object} datosPedido - Datos del pedido a procesar
     * @param {string} datosPedido.cliente - Nombre del cliente
     * @param {Array} datosPedido.items - Items del pedido
     * @param {number} datosPedido.total - Total del pedido
     * @returns {Promise<Object>} Resultado del procesamiento
     */
    async ejecutar(datosPedido) {
        try {
            // Validar datos de entrada
            this.validarDatos(datosPedido);

            // Verificar stock disponible para todos los productos
            await this.verificarStockDisponible(datosPedido.items);

            // Crear la entidad Pedido
            const pedido = new Pedido(
                Date.now(),
                datosPedido.cliente,
                datosPedido.items,
                datosPedido.total
            );

            // Validar que la entidad sea válida
            if (!pedido.esValido()) {
                throw new Error('Los datos del pedido no son válidos');
            }

            // Actualizar stock de productos
            await this.actualizarStockProductos(datosPedido.items);

            // Guardar el pedido
            const pedidoGuardado = await this.pedidoRepository.crear(pedido);

            return {
                success: true,
                data: pedidoGuardado,
                message: 'Pedido procesado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al procesar el pedido'
            };
        }
    }

    /**
     * Valida los datos de entrada
     * @param {Object} datos - Datos a validar
     */
    validarDatos(datos) {
        if (!datos.cliente || datos.cliente.trim().length === 0) {
            throw new Error('El nombre del cliente es requerido');
        }

        if (!datos.items || !Array.isArray(datos.items) || datos.items.length === 0) {
            throw new Error('El pedido debe contener al menos un item');
        }

        if (datos.total === undefined || datos.total < 0) {
            throw new Error('El total debe ser un número mayor o igual a 0');
        }

        // Validar cada item
        datos.items.forEach((item, index) => {
            if (!item.productoId) {
                throw new Error(`El item ${index + 1} debe tener un productoId`);
            }
            if (!item.nombre || item.nombre.trim().length === 0) {
                throw new Error(`El item ${index + 1} debe tener un nombre`);
            }
            if (item.cantidad === undefined || item.cantidad <= 0) {
                throw new Error(`El item ${index + 1} debe tener una cantidad mayor a 0`);
            }
            if (item.precio === undefined || item.precio < 0) {
                throw new Error(`El item ${index + 1} debe tener un precio válido`);
            }
        });
    }

    /**
     * Verifica que haya stock suficiente para todos los productos
     * @param {Array} items - Items del pedido
     */
    async verificarStockDisponible(items) {
        for (const item of items) {
            const producto = await this.productoRepository.obtenerPorId(item.productoId);
            
            if (!producto) {
                throw new Error(`Producto ${item.nombre} no encontrado`);
            }

            if (!producto.tieneStockSuficiente(item.cantidad)) {
                throw new Error(
                    `Stock insuficiente para ${producto.nombre}. ` +
                    `Disponible: ${producto.cantidad} ${producto.unidad}, ` +
                    `Solicitado: ${item.cantidad}`
                );
            }
        }
    }

    /**
     * Actualiza el stock de los productos después del pedido
     * @param {Array} items - Items del pedido
     */
    async actualizarStockProductos(items) {
        for (const item of items) {
            const producto = await this.productoRepository.obtenerPorId(item.productoId);
            producto.reducirStock(item.cantidad);
            await this.productoRepository.actualizar(item.productoId, producto);
        }
    }
}

module.exports = ProcesarPedidoUseCase;
