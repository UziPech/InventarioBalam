const IProductoMenuRepository = require('../../domain/repositories/IProductoMenuRepository');
const ProductoMenu = require('../../domain/entities/ProductoMenu');

/**
 * Implementación del repositorio de productos del menú usando JSON
 */
class ProductoMenuRepository extends IProductoMenuRepository {
    constructor(database) {
        super();
        this.database = database;
    }

    /**
     * Obtener todos los productos del menú
     * @returns {Promise<Array>} Lista de productos del menú
     */
    async obtenerTodos() {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            return productosMenuData.map(data => new ProductoMenu(
                data.id,
                data.nombre,
                data.precio,
                data.descripcion,
                data.ingredientes
            ));
        } catch (error) {
            throw new Error(`Error al obtener productos del menú: ${error.message}`);
        }
    }

    /**
     * Obtener productos activos del menú
     * @returns {Promise<Array>} Lista de productos activos
     */
    async obtenerActivos() {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            return productosMenuData
                .filter(data => data.activo)
                .map(data => new ProductoMenu(
                    data.id,
                    data.nombre,
                    data.precio,
                    data.descripcion,
                    data.ingredientes
                ));
        } catch (error) {
            throw new Error(`Error al obtener productos activos del menú: ${error.message}`);
        }
    }

    /**
     * Obtener un producto del menú por ID
     * @param {number} id - ID del producto
     * @returns {Promise<Object|null>} Producto encontrado o null
     */
    async obtenerPorId(id) {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            const productoMenuData = productosMenuData.find(p => p.id === id);
            
            if (!productoMenuData) {
                return null;
            }

            return new ProductoMenu(
                productoMenuData.id,
                productoMenuData.nombre,
                productoMenuData.precio,
                productoMenuData.descripcion,
                productoMenuData.ingredientes
            );
        } catch (error) {
            throw new Error(`Error al obtener producto del menú por ID: ${error.message}`);
        }
    }

    /**
     * Crear un nuevo producto del menú
     * @param {Object} productoMenu - Datos del producto
     * @returns {Promise<Object>} Producto creado
     */
    async crear(productoMenu) {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            
            // Generar nuevo ID
            const nuevoId = Math.max(...productosMenuData.map(p => p.id), 0) + 1;
            productoMenu.id = nuevoId;
            
            // Agregar fechas
            productoMenu.fechaCreacion = new Date();
            productoMenu.fechaActualizacion = new Date();
            productoMenu.activo = true;
            
            productosMenuData.push(productoMenu.toJSON());
            await this.database.saveProductosMenu(productosMenuData);
            
            return productoMenu;
        } catch (error) {
            throw new Error(`Error al crear producto del menú: ${error.message}`);
        }
    }

    /**
     * Actualizar un producto del menú existente
     * @param {number} id - ID del producto
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<Object>} Producto actualizado
     */
    async actualizar(id, datos) {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            const index = productosMenuData.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Producto del menú no encontrado');
            }

            // Actualizar datos
            productosMenuData[index] = {
                ...productosMenuData[index],
                ...datos.toJSON(),
                fechaActualizacion: new Date()
            };

            await this.database.saveProductosMenu(productosMenuData);
            
            return new ProductoMenu(
                productosMenuData[index].id,
                productosMenuData[index].nombre,
                productosMenuData[index].precio,
                productosMenuData[index].descripcion,
                productosMenuData[index].ingredientes
            );
        } catch (error) {
            throw new Error(`Error al actualizar producto del menú: ${error.message}`);
        }
    }

    /**
     * Eliminar un producto del menú
     * @param {number} id - ID del producto
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminar(id) {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            const index = productosMenuData.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Producto del menú no encontrado');
            }

            productosMenuData.splice(index, 1);
            await this.database.saveProductosMenu(productosMenuData);
            
            return true;
        } catch (error) {
            throw new Error(`Error al eliminar producto del menú: ${error.message}`);
        }
    }

    /**
     * Buscar productos del menú por nombre
     * @param {string} nombre - Nombre a buscar
     * @returns {Promise<Array>} Lista de productos que coinciden
     */
    async buscarPorNombre(nombre) {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            const productosFiltrados = productosMenuData.filter(p => 
                p.nombre.toLowerCase().includes(nombre.toLowerCase())
            );

            return productosFiltrados.map(data => new ProductoMenu(
                data.id,
                data.nombre,
                data.precio,
                data.descripcion,
                data.ingredientes
            ));
        } catch (error) {
            throw new Error(`Error al buscar productos del menú por nombre: ${error.message}`);
        }
    }

    /**
     * Obtener productos del menú por rango de precio
     * @param {number} precioMin - Precio mínimo
     * @param {number} precioMax - Precio máximo
     * @returns {Promise<Array>} Lista de productos en el rango
     */
    async obtenerPorRangoPrecio(precioMin, precioMax) {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            const productosFiltrados = productosMenuData.filter(p => 
                p.precio >= precioMin && p.precio <= precioMax
            );

            return productosFiltrados.map(data => new ProductoMenu(
                data.id,
                data.nombre,
                data.precio,
                data.descripcion,
                data.ingredientes
            ));
        } catch (error) {
            throw new Error(`Error al obtener productos del menú por rango de precio: ${error.message}`);
        }
    }

    /**
     * Activar o desactivar un producto del menú
     * @param {number} id - ID del producto
     * @param {boolean} activo - Estado del producto
     * @returns {Promise<Object>} Producto actualizado
     */
    async cambiarEstado(id, activo) {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            const index = productosMenuData.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Producto del menú no encontrado');
            }

            productosMenuData[index].activo = activo;
            productosMenuData[index].fechaActualizacion = new Date();

            await this.database.saveProductosMenu(productosMenuData);
            
            return new ProductoMenu(
                productosMenuData[index].id,
                productosMenuData[index].nombre,
                productosMenuData[index].precio,
                productosMenuData[index].descripcion,
                productosMenuData[index].ingredientes
            );
        } catch (error) {
            throw new Error(`Error al cambiar estado del producto del menú: ${error.message}`);
        }
    }

    /**
     * Obtener productos del menú que usan un ingrediente específico
     * @param {number} productoId - ID del producto de inventario
     * @returns {Promise<Array>} Lista de productos que usan el ingrediente
     */
    async obtenerPorIngrediente(productoId) {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            const productosFiltrados = productosMenuData.filter(p => 
                p.ingredientes.some(i => i.productoId === productoId)
            );

            return productosFiltrados.map(data => new ProductoMenu(
                data.id,
                data.nombre,
                data.precio,
                data.descripcion,
                data.ingredientes
            ));
        } catch (error) {
            throw new Error(`Error al obtener productos del menú por ingrediente: ${error.message}`);
        }
    }

    /**
     * Obtener estadísticas de productos del menú
     * @returns {Promise<Object>} Estadísticas de productos del menú
     */
    async obtenerEstadisticas() {
        try {
            const productosMenuData = await this.database.getProductosMenu();
            
            const totalProductos = productosMenuData.length;
            const productosActivos = productosMenuData.filter(p => p.activo).length;
            const productosInactivos = totalProductos - productosActivos;
            
            const precios = productosMenuData.map(p => p.precio);
            const precioPromedio = precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0;
            const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;
            const precioMaximo = precios.length > 0 ? Math.max(...precios) : 0;

            return {
                totalProductos,
                productosActivos,
                productosInactivos,
                precioPromedio,
                precioMinimo,
                precioMaximo
            };
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de productos del menú: ${error.message}`);
        }
    }
}

module.exports = ProductoMenuRepository;
