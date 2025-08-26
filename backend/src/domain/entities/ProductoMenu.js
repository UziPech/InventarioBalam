/**
 * Entidad ProductoMenu - Representa los productos estrella del menú
 */
class ProductoMenu {
    constructor(id, nombre, precio, descripcion, ingredientes) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.descripcion = descripcion || '';
        this.ingredientes = ingredientes || []; // Array de ingredientes necesarios
        this.fechaCreacion = new Date();
        this.fechaActualizacion = new Date();
        this.activo = true; // Si el producto está disponible en el menú
    }

    /**
     * Agregar un ingrediente al producto
     * @param {number} productoId - ID del producto de inventario
     * @param {number} cantidad - Cantidad necesaria
     */
    agregarIngrediente(productoId, cantidad) {
        if (cantidad <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }

        // Verificar si el ingrediente ya existe
        const ingredienteExistente = this.ingredientes.find(i => i.productoId === productoId);
        if (ingredienteExistente) {
            ingredienteExistente.cantidad += cantidad;
        } else {
            this.ingredientes.push({
                productoId,
                cantidad
            });
        }

        this.fechaActualizacion = new Date();
    }

    /**
     * Remover un ingrediente del producto
     * @param {number} productoId - ID del producto de inventario
     */
    removerIngrediente(productoId) {
        this.ingredientes = this.ingredientes.filter(i => i.productoId !== productoId);
        this.fechaActualizacion = new Date();
    }

    /**
     * Actualizar la cantidad de un ingrediente
     * @param {number} productoId - ID del producto de inventario
     * @param {number} nuevaCantidad - Nueva cantidad
     */
    actualizarCantidadIngrediente(productoId, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            this.removerIngrediente(productoId);
            return;
        }

        const ingrediente = this.ingredientes.find(i => i.productoId === productoId);
        if (ingrediente) {
            ingrediente.cantidad = nuevaCantidad;
            this.fechaActualizacion = new Date();
        }
    }

    /**
     * Calcular el costo total de los ingredientes
     * @param {Array} productosInventario - Lista de productos de inventario
     * @returns {number} Costo total
     */
    calcularCostoIngredientes(productosInventario) {
        return this.ingredientes.reduce((costoTotal, ingrediente) => {
            const producto = productosInventario.find(p => p.id === ingrediente.productoId);
            if (producto) {
                return costoTotal + (ingrediente.cantidad * producto.precio);
            }
            return costoTotal;
        }, 0);
    }

    /**
     * Calcular el margen de ganancia
     * @param {Array} productosInventario - Lista de productos de inventario
     * @returns {number} Margen de ganancia
     */
    calcularMargenGanancia(productosInventario) {
        const costo = this.calcularCostoIngredientes(productosInventario);
        return this.precio - costo;
    }

    /**
     * Verificar si hay suficientes ingredientes en inventario
     * @param {Array} productosInventario - Lista de productos de inventario
     * @param {number} cantidad - Cantidad del producto a verificar
     * @returns {Object} Resultado de la verificación
     */
    verificarStockDisponible(productosInventario, cantidad = 1) {
        const ingredientesFaltantes = [];
        const ingredientesSuficientes = [];

        for (const ingrediente of this.ingredientes) {
            const producto = productosInventario.find(p => p.id === ingrediente.productoId);
            
            if (!producto) {
                ingredientesFaltantes.push({
                    productoId: ingrediente.productoId,
                    nombre: 'Producto no encontrado',
                    cantidadNecesaria: ingrediente.cantidad * cantidad,
                    cantidadDisponible: 0
                });
            } else {
                const cantidadNecesaria = ingrediente.cantidad * cantidad;
                if (producto.cantidad < cantidadNecesaria) {
                    ingredientesFaltantes.push({
                        productoId: ingrediente.productoId,
                        nombre: producto.nombre,
                        cantidadNecesaria,
                        cantidadDisponible: producto.cantidad
                    });
                } else {
                    ingredientesSuficientes.push({
                        productoId: ingrediente.productoId,
                        nombre: producto.nombre,
                        cantidadNecesaria,
                        cantidadDisponible: producto.cantidad
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
     * Obtener la cantidad máxima que se puede producir
     * @param {Array} productosInventario - Lista de productos de inventario
     * @returns {number} Cantidad máxima
     */
    obtenerCantidadMaxima(productosInventario) {
        if (this.ingredientes.length === 0) return 0;

        const cantidadesMaximas = this.ingredientes.map(ingrediente => {
            const producto = productosInventario.find(p => p.id === ingrediente.productoId);
            if (!producto) return 0;
            return Math.floor(producto.cantidad / ingrediente.cantidad);
        });

        return Math.min(...cantidadesMaximas);
    }

    /**
     * Validar que la entidad sea válida
     * @returns {boolean} True si es válida
     */
    esValido() {
        return this.nombre && 
               this.nombre.trim().length > 0 && 
               this.precio >= 0 &&
               this.ingredientes.length > 0;
    }

    /**
     * Activar o desactivar el producto
     * @param {boolean} activo - Estado del producto
     */
    setActivo(activo) {
        this.activo = activo;
        this.fechaActualizacion = new Date();
    }

    /**
     * Convertir a objeto plano
     * @returns {Object} Objeto JSON
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            precio: this.precio,
            descripcion: this.descripcion,
            ingredientes: this.ingredientes,
            fechaCreacion: this.fechaCreacion,
            fechaActualizacion: this.fechaActualizacion,
            activo: this.activo
        };
    }
}

module.exports = ProductoMenu;
