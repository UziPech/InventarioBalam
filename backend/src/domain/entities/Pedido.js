class Pedido {
    constructor(id, cliente, items, total) {
        this.id = id;
        this.cliente = cliente;
        this.items = items || [];
        this.total = total || 0;
        
        // Usar fecha actual en UTC (sin ajustes de zona horaria)
        this.fecha = new Date();
        
        // Asegurar que la fecha no sea futura
        const fechaActual = new Date();
        if (this.fecha > fechaActual) {
            this.fecha = fechaActual;
        }
        
        this.estado = 'pendiente'; // pendiente, pagado, entregado, cancelado
        
        // Debug: mostrar información de la fecha
        console.log(`📅 Pedido #${id} - Fecha creada (UTC): ${this.fecha.toISOString()}`);
        console.log(`📅 Pedido #${id} - Fecha local: ${this.fecha.toLocaleString('es-ES', { timeZone: 'America/Merida' })}`);
    }

    // Métodos de negocio
    agregarItem(productoId, nombre, cantidad, precio, personalizaciones = null) {
        const item = {
            productoId,
            nombre,
            cantidad,
            precio,
            subtotal: cantidad * precio,
            personalizaciones: personalizaciones || {
                ingredientesExcluidos: [], // IDs de ingredientes que NO quiere el cliente
                ingredientesExtras: []      // [{productoId, cantidad, nombre}] ingredientes adicionales
            }
        };
        
        this.items.push(item);
        this.calcularTotal();
    }

    removerItem(productoId) {
        this.items = this.items.filter(item => item.productoId !== productoId);
        this.calcularTotal();
    }

    calcularTotal() {
        this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        return this.total;
    }

    obtenerCantidadItems() {
        return this.items.length;
    }

    obtenerItems() {
        return [...this.items]; // Retorna una copia para evitar modificaciones externas
    }

    // Métodos para manejar personalizaciones
    obtenerIngredientesExtrasDelPedido() {
        const extrasConsolidados = [];
        
        this.items.forEach(item => {
            if (item.personalizaciones && item.personalizaciones.ingredientesExtras) {
                item.personalizaciones.ingredientesExtras.forEach(extra => {
                    const cantidadTotal = extra.cantidad * item.cantidad;
                    const existente = extrasConsolidados.find(e => e.productoId === extra.productoId);
                    
                    if (existente) {
                        existente.cantidad += cantidadTotal;
                    } else {
                        extrasConsolidados.push({
                            productoId: extra.productoId,
                            nombre: extra.nombre,
                            cantidad: cantidadTotal
                        });
                    }
                });
            }
        });
        
        return extrasConsolidados;
    }

    obtenerIngredientesExcluidosDelPedido() {
        const exclusionesConsolidadas = [];
        
        this.items.forEach(item => {
            if (item.personalizaciones && item.personalizaciones.ingredientesExcluidos) {
                item.personalizaciones.ingredientesExcluidos.forEach(excludedId => {
                    const existente = exclusionesConsolidadas.find(e => e.productoId === excludedId);
                    if (!existente) {
                        exclusionesConsolidadas.push({
                            productoId: excludedId,
                            itemsAfectados: [item.productoId]
                        });
                    } else if (!existente.itemsAfectados.includes(item.productoId)) {
                        existente.itemsAfectados.push(item.productoId);
                    }
                });
            }
        });
        
        return exclusionesConsolidadas;
    }

    actualizarEstado(nuevoEstado) {
        const estadosValidos = ['pendiente', 'pagado', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error('Estado no válido');
        }
        this.estado = nuevoEstado;
    }

    esValido() {
        return this.cliente && 
               this.cliente.trim().length > 0 && 
               this.items.length > 0 &&
               this.total >= 0;
    }

    // Método para obtener productos únicos en el pedido
    obtenerProductosUnicos() {
        const productosUnicos = new Map();
        
        this.items.forEach(item => {
            if (productosUnicos.has(item.productoId)) {
                productosUnicos.get(item.productoId).cantidad += item.cantidad;
            } else {
                productosUnicos.set(item.productoId, {
                    productoId: item.productoId,
                    cantidad: item.cantidad
                });
            }
        });
        
        return Array.from(productosUnicos.values());
    }

    // Método para convertir a objeto plano
    toJSON() {
        return {
            id: this.id,
            cliente: this.cliente,
            items: this.items,
            total: this.total,
            fecha: this.fecha,
            estado: this.estado,
            numeroDia: this.numeroDia || this.id,
            fechaCreacion: this.fechaCreacion || this.fecha.toISOString().split('T')[0]
        };
    }

    // Método para obtener el número de pedido formateado
    obtenerNumeroFormateado() {
        const fecha = new Date(this.fecha);
        const fechaStr = fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '');
        
        return `${fechaStr}-${this.id.toString().padStart(3, '0')}`;
    }

    // Método para obtener información del pedido
    obtenerInformacion() {
        return {
            numero: this.id,
            numeroFormateado: this.obtenerNumeroFormateado(),
            fecha: this.fecha,
            cliente: this.cliente,
            total: this.total,
            estado: this.estado,
            cantidadItems: this.obtenerCantidadItems()
        };
    }
}

module.exports = Pedido;
