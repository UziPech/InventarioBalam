class Pedido {
    constructor(id, cliente, items, total) {
        this.id = id;
        this.cliente = cliente;
        this.items = items || [];
        this.total = total || 0;
        
        // Usar fecha actual real con zona horaria local
        const ahora = new Date();
        this.fecha = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000));
        
        // Asegurar que la fecha no sea futura
        const fechaActual = new Date();
        if (this.fecha > fechaActual) {
            this.fecha = fechaActual;
        }
        
        this.estado = 'pendiente'; // pendiente, pagado, cancelado
        
        // Debug: mostrar información de la fecha
        console.log(`📅 Pedido #${id} - Fecha creada: ${this.fecha.toISOString()}`);
        console.log(`📅 Pedido #${id} - Fecha local: ${this.fecha.toLocaleString('es-ES')}`);
    }

    // Métodos de negocio
    agregarItem(productoId, nombre, cantidad, precio) {
        const item = {
            productoId,
            nombre,
            cantidad,
            precio,
            subtotal: cantidad * precio
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

    actualizarEstado(nuevoEstado) {
        const estadosValidos = ['pendiente', 'pagado', 'cancelado'];
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
