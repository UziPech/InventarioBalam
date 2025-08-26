const ProductoMenu = require('../../domain/entities/ProductoMenu');

/**
 * Caso de uso para crear un nuevo producto del menú
 */
class CrearProductoMenuUseCase {
    constructor(productoMenuRepository, productoRepository) {
        this.productoMenuRepository = productoMenuRepository;
        this.productoRepository = productoRepository;
    }

    /**
     * Ejecuta el caso de uso
     * @param {Object} datosProductoMenu - Datos del producto del menú a crear
     * @param {string} datosProductoMenu.nombre - Nombre del producto
     * @param {number} datosProductoMenu.precio - Precio de venta
     * @param {string} datosProductoMenu.descripcion - Descripción del producto
     * @param {Array} datosProductoMenu.ingredientes - Lista de ingredientes
     * @returns {Promise<Object>} Producto del menú creado
     */
    async ejecutar(datosProductoMenu) {
        try {
            // Validar datos de entrada
            this.validarDatos(datosProductoMenu);

            // Validar que los ingredientes existan en el inventario
            await this.validarIngredientes(datosProductoMenu.ingredientes);

            // Crear la entidad ProductoMenu
            const productoMenu = new ProductoMenu(
                Date.now(), // ID temporal
                datosProductoMenu.nombre,
                datosProductoMenu.precio,
                datosProductoMenu.descripcion,
                datosProductoMenu.ingredientes
            );

            // Validar que la entidad sea válida
            if (!productoMenu.esValido()) {
                throw new Error('Los datos del producto del menú no son válidos');
            }

            // Guardar en el repositorio
            const productoMenuGuardado = await this.productoMenuRepository.crear(productoMenu);

            return {
                success: true,
                data: productoMenuGuardado,
                message: 'Producto del menú creado exitosamente'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Error al crear el producto del menú'
            };
        }
    }

    /**
     * Valida los datos de entrada
     * @param {Object} datos - Datos a validar
     */
    validarDatos(datos) {
        if (!datos.nombre || datos.nombre.trim().length === 0) {
            throw new Error('El nombre del producto es requerido');
        }

        if (datos.precio === undefined || datos.precio < 0) {
            throw new Error('El precio debe ser un número mayor o igual a 0');
        }

        if (!datos.ingredientes || !Array.isArray(datos.ingredientes) || datos.ingredientes.length === 0) {
            throw new Error('El producto debe tener al menos un ingrediente');
        }

        // Validar cada ingrediente
        datos.ingredientes.forEach((ingrediente, index) => {
            if (!ingrediente.productoId) {
                throw new Error(`El ingrediente ${index + 1} debe tener un productoId`);
            }
            if (ingrediente.cantidad === undefined || ingrediente.cantidad <= 0) {
                throw new Error(`El ingrediente ${index + 1} debe tener una cantidad mayor a 0`);
            }
        });
    }

    /**
     * Valida que los ingredientes existan en el inventario
     * @param {Array} ingredientes - Lista de ingredientes a validar
     */
    async validarIngredientes(ingredientes) {
        for (const ingrediente of ingredientes) {
            const producto = await this.productoRepository.obtenerPorId(ingrediente.productoId);
            if (!producto) {
                throw new Error(`El producto con ID ${ingrediente.productoId} no existe en el inventario`);
            }
        }
    }
}

module.exports = CrearProductoMenuUseCase;
