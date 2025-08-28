const Pedido = require('../../domain/entities/Pedido');

/**
 * Caso de uso para procesar un pedido usando productos del menú
 */
class ProcesarPedidoMenuUseCase {
    constructor(pedidoRepository, productoRepository, productoMenuRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.productoMenuRepository = productoMenuRepository;
    }

    /**
     * Ejecuta el caso de uso
     * @param {Object} datosPedido - Datos del pedido a procesar
     * @param {string} datosPedido.cliente - Nombre del cliente (opcional)
     * @param {Array} datosPedido.items - Items del pedido con productos del menú
     * @returns {Promise<Object>} Resultado del procesamiento
     */
    async ejecutar(datosPedido) {
        try {
            // Validar datos de entrada
            this.validarDatos(datosPedido);

            // Obtener todos los productos del menú para validación
            const productosMenu = await this.productoMenuRepository.obtenerActivos();
            const productosInventario = await this.productoRepository.obtenerTodos();

            // Verificar stock disponible para todos los productos del menú
            const verificacionStock = await this.verificarStockDisponible(
                datosPedido.items, 
                productosMenu, 
                productosInventario
            );

            if (!verificacionStock.disponible) {
                return {
                    success: false,
                    error: 'Stock insuficiente',
                    message: 'No hay suficientes ingredientes para procesar el pedido',
                    detalles: verificacionStock.ingredientesFaltantes
                };
            }

            // Crear la entidad Pedido
            const pedido = new Pedido(
                Date.now(),
                datosPedido.cliente || 'Cliente General',
                [], // Los items se agregarán después
                0   // El total se calculará después
            );

            // Agregar items al pedido y calcular total
            let totalPedido = 0;
            for (const item of datosPedido.items) {
                const productoMenu = productosMenu.find(p => p.id === item.productoId);
                if (productoMenu) {
                    const subtotal = productoMenu.precio * item.cantidad;
                    pedido.agregarItem(
                        item.productoId,
                        productoMenu.nombre,
                        item.cantidad,
                        productoMenu.precio
                    );
                    totalPedido += subtotal;
                }
            }

            pedido.total = totalPedido;

            // Validar que la entidad sea válida
            if (!pedido.esValido()) {
                throw new Error('Los datos del pedido no son válidos');
            }

            // Actualizar stock de productos del inventario
            await this.actualizarStockProductos(
                datosPedido.items, 
                productosMenu, 
                productosInventario
            );

            // Guardar el pedido
            const pedidoGuardado = await this.pedidoRepository.crear(pedido);

            return {
                success: true,
                data: pedidoGuardado,
                message: 'Pedido procesado exitosamente',
                total: totalPedido
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
        // Validar que datos exista
        if (!datos) {
            throw new Error('Los datos del pedido son requeridos');
        }

        // Validar items
        if (!datos.items || !Array.isArray(datos.items) || datos.items.length === 0) {
            throw new Error('El pedido debe contener al menos un item');
        }

        // Validar cada item
        datos.items.forEach((item, index) => {
            if (!item.productoId) {
                throw new Error(`El item ${index + 1} debe tener un productoId`);
            }
            if (item.cantidad === undefined || item.cantidad <= 0) {
                throw new Error(`El item ${index + 1} debe tener una cantidad mayor a 0`);
            }
        });

        // Validar cliente (opcional, pero si se proporciona debe ser string)
        if (datos.cliente !== undefined && typeof datos.cliente !== 'string') {
            throw new Error('El cliente debe ser una cadena de texto');
        }
    }

    /**
     * Verifica que haya stock suficiente para todos los productos del menú
     * @param {Array} items - Items del pedido
     * @param {Array} productosMenu - Lista de productos del menú
     * @param {Array} productosInventario - Lista de productos del inventario
     */
    async verificarStockDisponible(items, productosMenu, productosInventario) {
        const ingredientesFaltantes = [];
        const ingredientesSuficientes = [];

        for (const item of items) {
            const productoMenu = productosMenu.find(p => p.id === item.productoId);
            if (!productoMenu) {
                ingredientesFaltantes.push({
                    productoId: item.productoId,
                    nombre: 'Producto del menú no encontrado',
                    cantidadNecesaria: item.cantidad,
                    cantidadDisponible: 0
                });
                continue;
            }

            // Verificar cada ingrediente del producto del menú
            for (const ingrediente of productoMenu.ingredientes) {
                const productoInventario = productosInventario.find(p => p.id === ingrediente.productoId);
                const cantidadNecesaria = ingrediente.cantidad * item.cantidad;

                if (!productoInventario) {
                    ingredientesFaltantes.push({
                        productoId: ingrediente.productoId,
                        nombre: 'Ingrediente no encontrado en inventario',
                        cantidadNecesaria,
                        cantidadDisponible: 0
                    });
                } else if (productoInventario.cantidad < cantidadNecesaria) {
                    ingredientesFaltantes.push({
                        productoId: ingrediente.productoId,
                        nombre: productoInventario.nombre,
                        cantidadNecesaria,
                        cantidadDisponible: productoInventario.cantidad
                    });
                } else {
                    ingredientesSuficientes.push({
                        productoId: ingrediente.productoId,
                        nombre: productoInventario.nombre,
                        cantidadNecesaria,
                        cantidadDisponible: productoInventario.cantidad
                    });
                }
            }
        }

        return {
            disponible: ingredientesFaltantes.length === 0,
            ingredientesFaltantes,
            ingredientesSuficientes
        };
    }

    /**
     * Actualiza el stock de los productos del inventario después del pedido
     * @param {Array} items - Items del pedido
     * @param {Array} productosMenu - Lista de productos del menú
     * @param {Array} productosInventario - Lista de productos del inventario
     */
    async actualizarStockProductos(items, productosMenu, productosInventario) {
        for (const item of items) {
            const productoMenu = productosMenu.find(p => p.id === item.productoId);
            if (productoMenu) {
                for (const ingrediente of productoMenu.ingredientes) {
                    const productoInventario = productosInventario.find(p => p.id === ingrediente.productoId);
                    if (productoInventario) {
                        const cantidadARestar = ingrediente.cantidad * item.cantidad;
                        productoInventario.reducirStock(cantidadARestar);
                        await this.productoRepository.actualizar(ingrediente.productoId, productoInventario);
                    }
                }
            }
        }
    }
}

module.exports = ProcesarPedidoMenuUseCase;
