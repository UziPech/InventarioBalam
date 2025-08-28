class Producto {
    constructor(id, nombre, cantidad, unidad, precio) {
        this.id = id;
        this.nombre = nombre;
        this.cantidad = this.redondearCantidad(cantidad);
        this.unidad = unidad;
        this.precio = precio;
        this.fechaCreacion = new Date();
        this.fechaActualizacion = new Date();
    }

    // Método para redondear cantidades y evitar errores de punto flotante
    redondearCantidad(cantidad) {
        // Para kilogramos, redondear a 2 decimales
        if (this.unidad && this.unidad.toLowerCase().includes('kg')) {
            return Math.round(cantidad * 100) / 100;
        }
        // Para litros, redondear a 2 decimales
        if (this.unidad && this.unidad.toLowerCase().includes('l')) {
            return Math.round(cantidad * 100) / 100;
        }
        // Para mililitros, redondear a 1 decimal
        if (this.unidad && this.unidad.toLowerCase().includes('ml')) {
            return Math.round(cantidad * 10) / 10;
        }
        // Para otros casos, redondear a 2 decimales
        return Math.round(cantidad * 100) / 100;
    }

    // Métodos de negocio
    reducirStock(cantidad) {
        if (cantidad > this.cantidad) {
            throw new Error(`Stock insuficiente. Disponible: ${this.cantidad} ${this.unidad}`);
        }
        this.cantidad = this.redondearCantidad(this.cantidad - cantidad);
        this.fechaActualizacion = new Date();
    }

    aumentarStock(cantidad) {
        if (cantidad < 0) {
            throw new Error('La cantidad debe ser positiva');
        }
        this.cantidad = this.redondearCantidad(this.cantidad + cantidad);
        this.fechaActualizacion = new Date();
    }

    actualizarPrecio(nuevoPrecio) {
        if (nuevoPrecio < 0) {
            throw new Error('El precio no puede ser negativo');
        }
        this.precio = nuevoPrecio;
        this.fechaActualizacion = new Date();
    }

    actualizarCantidad(nuevaCantidad) {
        if (nuevaCantidad < 0) {
            throw new Error('La cantidad no puede ser negativa');
        }
        this.cantidad = this.redondearCantidad(nuevaCantidad);
        this.fechaActualizacion = new Date();
    }

    tieneStockSuficiente(cantidad) {
        return this.cantidad >= cantidad;
    }

    obtenerStockDisponible() {
        return this.cantidad;
    }

    calcularValorTotal() {
        return this.cantidad * this.precio;
    }

    // Método para validar la entidad
    esValido() {
        return this.nombre && 
               this.nombre.trim().length > 0 && 
               this.cantidad >= 0 && 
               this.precio >= 0 &&
               this.unidad &&
               this.unidad.trim().length > 0;
    }

    // Método para convertir a objeto plano
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            cantidad: this.cantidad,
            unidad: this.unidad,
            precio: this.precio,
            fechaCreacion: this.fechaCreacion,
            fechaActualizacion: this.fechaActualizacion
        };
    }
}

module.exports = Producto;
