const IProductoRepository = require('../../domain/repositories/IProductoRepository');
const Producto = require('../../domain/entities/Producto');

/**
 * Implementación del repositorio de productos usando JSON
 */
class ProductoRepository extends IProductoRepository {
    constructor(database) {
        super();
        this.database = database;
    }

    /**
     * Obtener todos los productos
     * @returns {Promise<Array>} Lista de productos
     */
    async obtenerTodos() {
        try {
            const productosData = await this.database.getProductos();
            return productosData.map(data => new Producto(
                data.id,
                data.nombre,
                data.cantidad,
                data.unidad,
                data.precio
            ));
        } catch (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    }

    /**
     * Obtener un producto por ID
     * @param {number} id - ID del producto
     * @returns {Promise<Object|null>} Producto encontrado o null
     */
    async obtenerPorId(id) {
        try {
            const productosData = await this.database.getProductos();
            const productoData = productosData.find(p => p.id === id);
            
            if (!productoData) {
                return null;
            }

            return new Producto(
                productoData.id,
                productoData.nombre,
                productoData.cantidad,
                productoData.unidad,
                productoData.precio
            );
        } catch (error) {
            throw new Error(`Error al obtener producto por ID: ${error.message}`);
        }
    }

    /**
     * Crear un nuevo producto
     * @param {Object} producto - Datos del producto
     * @returns {Promise<Object>} Producto creado
     */
    async crear(producto) {
        try {
            const productosData = await this.database.getProductos();
            
            // Generar nuevo ID
            const nuevoId = Math.max(...productosData.map(p => p.id), 0) + 1;
            producto.id = nuevoId;
            
            // Agregar fechas
            producto.fechaCreacion = new Date();
            producto.fechaActualizacion = new Date();
            
            productosData.push(producto.toJSON());
            await this.database.saveProductos(productosData);
            
            return producto;
        } catch (error) {
            throw new Error(`Error al crear producto: ${error.message}`);
        }
    }

    /**
     * Actualizar un producto existente
     * @param {number} id - ID del producto
     * @param {Object} datos - Datos a actualizar
     * @returns {Promise<Object>} Producto actualizado
     */
    async actualizar(id, datos) {
        try {
            const productosData = await this.database.getProductos();
            const index = productosData.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Producto no encontrado');
            }

            // Actualizar datos
            productosData[index] = {
                ...productosData[index],
                ...datos.toJSON(),
                fechaActualizacion: new Date()
            };

            await this.database.saveProductos(productosData);
            
            return new Producto(
                productosData[index].id,
                productosData[index].nombre,
                productosData[index].cantidad,
                productosData[index].unidad,
                productosData[index].precio
            );
        } catch (error) {
            throw new Error(`Error al actualizar producto: ${error.message}`);
        }
    }

    /**
     * Eliminar un producto
     * @param {number} id - ID del producto
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async eliminar(id) {
        try {
            const productosData = await this.database.getProductos();
            const index = productosData.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Producto no encontrado');
            }

            productosData.splice(index, 1);
            await this.database.saveProductos(productosData);
            
            return true;
        } catch (error) {
            throw new Error(`Error al eliminar producto: ${error.message}`);
        }
    }

    /**
     * Actualizar la cantidad de stock de un producto
     * @param {number} id - ID del producto
     * @param {number} cantidad - Nueva cantidad
     * @returns {Promise<Object>} Producto actualizado
     */
    async actualizarStock(id, cantidad) {
        try {
            const producto = await this.obtenerPorId(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            producto.cantidad = cantidad;
            producto.fechaActualizacion = new Date();

            return await this.actualizar(id, producto);
        } catch (error) {
            throw new Error(`Error al actualizar stock: ${error.message}`);
        }
    }

    /**
     * Buscar productos por nombre
     * @param {string} nombre - Nombre a buscar
     * @returns {Promise<Array>} Lista de productos que coinciden
     */
    async buscarPorNombre(nombre) {
        try {
            const productosData = await this.database.getProductos();
            const productosFiltrados = productosData.filter(p => 
                p.nombre.toLowerCase().includes(nombre.toLowerCase())
            );

            return productosFiltrados.map(data => new Producto(
                data.id,
                data.nombre,
                data.cantidad,
                data.unidad,
                data.precio
            ));
        } catch (error) {
            throw new Error(`Error al buscar productos por nombre: ${error.message}`);
        }
    }

    /**
     * Obtener productos con stock bajo
     * @param {number} limite - Límite de stock para considerar bajo
     * @returns {Promise<Array>} Lista de productos con stock bajo
     */
    async obtenerConStockBajo(limite = 10) {
        try {
            const productosData = await this.database.getProductos();
            const productosStockBajo = productosData.filter(p => p.cantidad <= limite);

            return productosStockBajo.map(data => new Producto(
                data.id,
                data.nombre,
                data.cantidad,
                data.unidad,
                data.precio
            ));
        } catch (error) {
            throw new Error(`Error al obtener productos con stock bajo: ${error.message}`);
        }
    }
}

module.exports = ProductoRepository;
