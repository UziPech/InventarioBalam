class Producto {
    constructor(id, nombre, cantidad, unidad, precio) {
        this.id = id;
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.unidad = unidad;
        this.precio = precio;
        this.fechaCreacion = new Date();
        this.fechaActualizacion = new Date();
    }

    // Métodos de negocio
    reducirStock(cantidad) {
        if (cantidad > this.cantidad) {
            throw new Error(`Stock insuficiente. Disponible: ${this.cantidad} ${this.unidad}`);
        }
        this.cantidad -= cantidad;
        this.fechaActualizacion = new Date();
    }

    aumentarStock(cantidad) {
        if (cantidad < 0) {
            throw new Error('La cantidad debe ser positiva');
        }
        this.cantidad += cantidad;
        this.fechaActualizacion = new Date();
    }

    actualizarPrecio(nuevoPrecio) {
        if (nuevoPrecio < 0) {
            throw new Error('El precio no puede ser negativo');
        }
        this.precio = nuevoPrecio;
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
