/**
 * Controlador para manejar reportes del sistema
 */
class ReporteController {
    constructor(pedidoRepository, productoRepository, productoMenuRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.productoMenuRepository = productoMenuRepository;
    }

    /**
     * Obtener reporte de ventas por período
     */
    async obtenerReporteVentas(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            
            // Validar fechas
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    success: false,
                    message: 'Las fechas de inicio y fin son requeridas'
                });
            }

            const pedidos = await this.pedidoRepository.obtenerTodos();
            
            // Filtrar pedidos por período
            const pedidosFiltrados = pedidos.filter(pedido => {
                const fechaPedido = new Date(pedido.fecha);
                const inicio = new Date(fechaInicio);
                const fin = new Date(fechaFin);
                return fechaPedido >= inicio && fechaPedido <= fin;
            });

            // Calcular estadísticas
            const totalVentas = pedidosFiltrados.reduce((sum, pedido) => sum + pedido.total, 0);
            const totalPedidos = pedidosFiltrados.length;
            const promedioPorPedido = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

            // Agrupar por día
            const ventasPorDia = {};
            pedidosFiltrados.forEach(pedido => {
                const fecha = new Date(pedido.fecha).toLocaleDateString('es-ES');
                if (!ventasPorDia[fecha]) {
                    ventasPorDia[fecha] = { ventas: 0, pedidos: 0 };
                }
                ventasPorDia[fecha].ventas += pedido.total;
                ventasPorDia[fecha].pedidos += 1;
            });

            res.json({
                success: true,
                data: {
                    periodo: { fechaInicio, fechaFin },
                    resumen: {
                        totalVentas,
                        totalPedidos,
                        promedioPorPedido: Math.round(promedioPorPedido * 100) / 100
                    },
                    ventasPorDia: Object.entries(ventasPorDia).map(([fecha, datos]) => ({
                        fecha,
                        ventas: datos.ventas,
                        pedidos: datos.pedidos
                    }))
                }
            });
        } catch (error) {
            console.error('Error al obtener reporte de ventas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte de ventas'
            });
        }
    }

    /**
     * Obtener productos más vendidos
     */
    async obtenerProductosMasVendidos(req, res) {
        try {
            const { fechaInicio, fechaFin, limite = 10 } = req.query;
            
            const pedidos = await this.pedidoRepository.obtenerTodos();
            
            // Filtrar pedidos por período si se especifica
            let pedidosFiltrados = pedidos;
            if (fechaInicio && fechaFin) {
                pedidosFiltrados = pedidos.filter(pedido => {
                    const fechaPedido = new Date(pedido.fecha);
                    const inicio = new Date(fechaInicio);
                    const fin = new Date(fechaFin);
                    return fechaPedido >= inicio && fechaPedido <= fin;
                });
            }

            // Contar productos vendidos
            const productosVendidos = {};
            pedidosFiltrados.forEach(pedido => {
                pedido.items.forEach(item => {
                    if (!productosVendidos[item.productoId]) {
                        productosVendidos[item.productoId] = {
                            id: item.productoId,
                            nombre: item.nombre,
                            cantidadVendida: 0,
                            totalVentas: 0
                        };
                    }
                    productosVendidos[item.productoId].cantidadVendida += item.cantidad;
                    productosVendidos[item.productoId].totalVentas += item.subtotal;
                });
            });

            // Ordenar por cantidad vendida y tomar los primeros
            const productosOrdenados = Object.values(productosVendidos)
                .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
                .slice(0, parseInt(limite));

            res.json({
                success: true,
                data: {
                    productos: productosOrdenados,
                    totalProductos: productosOrdenados.length
                }
            });
        } catch (error) {
            console.error('Error al obtener productos más vendidos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte de productos más vendidos'
            });
        }
    }

    /**
     * Obtener reporte de stock crítico
     */
    async obtenerStockCritico(req, res) {
        try {
            const { limiteStock = 10 } = req.query;
            
            const productos = await this.productoRepository.obtenerProductos();
            
            // Filtrar productos con stock bajo
            const stockCritico = productos
                .filter(producto => producto.cantidad <= parseInt(limiteStock))
                .map(producto => ({
                    id: producto.id,
                    nombre: producto.nombre,
                    cantidad: producto.cantidad,
                    unidad: producto.unidad,
                    precio: producto.precio,
                    estado: producto.cantidad === 0 ? 'Agotado' : 'Stock Bajo'
                }))
                .sort((a, b) => a.cantidad - b.cantidad);

            // Calcular valor total del stock crítico
            const valorTotalStockCritico = stockCritico.reduce((sum, producto) => {
                return sum + (producto.cantidad * producto.precio);
            }, 0);

            res.json({
                success: true,
                data: {
                    productos: stockCritico,
                    resumen: {
                        totalProductos: stockCritico.length,
                        productosAgotados: stockCritico.filter(p => p.estado === 'Agotado').length,
                        productosStockBajo: stockCritico.filter(p => p.estado === 'Stock Bajo').length,
                        valorTotal: Math.round(valorTotalStockCritico * 100) / 100
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener stock crítico:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte de stock crítico'
            });
        }
    }

    /**
     * Obtener dashboard con estadísticas generales
     */
    async obtenerDashboard(req, res) {
        try {
            const productos = await this.productoRepository.obtenerTodos();
            const productosMenu = await this.productoMenuRepository.obtenerTodos();
            const pedidos = await this.pedidoRepository.obtenerTodos();

            // Calcular estadísticas
            const totalProductos = productos.length;
            const totalProductosMenu = productosMenu.length;
            const productosActivos = productosMenu.filter(p => p.activo).length;
            const totalPedidos = pedidos.length;
            
            // Calcular valor total del inventario
            const valorTotalInventario = productos.reduce((sum, producto) => {
                return sum + (producto.cantidad * producto.precio);
            }, 0);

            // Calcular ventas del día
            const hoy = new Date();
            const pedidosHoy = pedidos.filter(pedido => {
                const fechaPedido = new Date(pedido.fecha);
                return fechaPedido.toDateString() === hoy.toDateString();
            });
            const ventasHoy = pedidosHoy.reduce((sum, pedido) => sum + pedido.total, 0);

            // Calcular ventas del mes
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const pedidosMes = pedidos.filter(pedido => {
                const fechaPedido = new Date(pedido.fecha);
                return fechaPedido >= inicioMes;
            });
            const ventasMes = pedidosMes.reduce((sum, pedido) => sum + pedido.total, 0);

            res.json({
                success: true,
                data: {
                    inventario: {
                        totalProductos,
                        valorTotal: Math.round(valorTotalInventario * 100) / 100
                    },
                    menu: {
                        totalProductos: totalProductosMenu,
                        productosActivos
                    },
                    ventas: {
                        totalPedidos,
                        ventasHoy: Math.round(ventasHoy * 100) / 100,
                        ventasMes: Math.round(ventasMes * 100) / 100
                    }
                }
            });
        } catch (error) {
            console.error('Error al obtener dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar dashboard'
            });
        }
    }
}

module.exports = ReporteController;
