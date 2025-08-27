const express = require('express');

/**
 * @swagger
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       required:
 *         - nombre
 *         - cantidad
 *         - unidad
 *         - precio
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del producto
 *         nombre:
 *           type: string
 *           description: Nombre del producto
 *         cantidad:
 *           type: number
 *           description: Cantidad disponible en stock
 *         unidad:
 *           type: string
 *           description: Unidad de medida (piezas, kg, etc.)
 *         precio:
 *           type: number
 *           description: Precio unitario del producto
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del producto
 *         fechaActualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

module.exports = (productoController) => {
    const router = express.Router();

    /**
     * @swagger
     * /api/productos:
     *   get:
     *     summary: Obtener todos los productos
     *     tags: [Productos]
     *     responses:
     *       200:
     *         description: Lista de productos obtenida exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Producto'
     *                 message:
     *                   type: string
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/', productoController.obtenerTodos.bind(productoController));

    /**
     * @swagger
     * /api/productos/{id}:
     *   get:
     *     summary: Obtener un producto por ID
     *     tags: [Productos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del producto
     *     responses:
     *       200:
     *         description: Producto obtenido exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Producto'
     *                 message:
     *                   type: string
     *       404:
     *         description: Producto no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/:id', productoController.obtenerPorId.bind(productoController));

    /**
     * @swagger
     * /api/productos:
     *   post:
     *     summary: Crear un nuevo producto
     *     tags: [Productos]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nombre
     *               - cantidad
     *               - unidad
     *               - precio
     *             properties:
     *               nombre:
     *                 type: string
     *                 description: Nombre del producto
     *               cantidad:
     *                 type: number
     *                 description: Cantidad inicial en stock
     *               unidad:
     *                 type: string
     *                 description: Unidad de medida
     *               precio:
     *                 type: number
     *                 description: Precio unitario
     *     responses:
     *       201:
     *         description: Producto creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Producto'
     *                 message:
     *                   type: string
     *       400:
     *         description: Datos inválidos
     *       500:
     *         description: Error interno del servidor
     */
    router.post('/', productoController.crear.bind(productoController));

    /**
     * @swagger
     * /api/productos/{id}:
     *   put:
     *     summary: Actualizar un producto existente
     *     tags: [Productos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del producto
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nombre:
     *                 type: string
     *               cantidad:
     *                 type: number
     *               unidad:
     *                 type: string
     *               precio:
     *                 type: number
     *     responses:
     *       200:
     *         description: Producto actualizado exitosamente
     *       404:
     *         description: Producto no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.put('/:id', productoController.actualizar.bind(productoController));

    /**
     * @swagger
     * /api/productos/{id}:
     *   delete:
     *     summary: Eliminar un producto
     *     tags: [Productos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del producto
     *     responses:
     *       200:
     *         description: Producto eliminado exitosamente
     *       404:
     *         description: Producto no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.delete('/:id', productoController.eliminar.bind(productoController));

    /**
     * @swagger
     * /api/productos/buscar:
     *   get:
     *     summary: Buscar productos por nombre
     *     tags: [Productos]
     *     parameters:
     *       - in: query
     *         name: nombre
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre del producto a buscar
     *     responses:
     *       200:
     *         description: Búsqueda completada exitosamente
     *       400:
     *         description: Parámetro nombre requerido
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/buscar', productoController.buscarPorNombre.bind(productoController));

    /**
     * @swagger
     * /api/productos/stock-bajo:
     *   get:
     *     summary: Obtener productos con stock bajo
     *     tags: [Productos]
     *     parameters:
     *       - in: query
     *         name: limite
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Límite de stock para considerar bajo
     *     responses:
     *       200:
     *         description: Productos con stock bajo obtenidos exitosamente
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/stock-bajo', productoController.obtenerConStockBajo.bind(productoController));

    /**
     * @swagger
     * /api/productos/{id}/stock:
     *   patch:
     *     summary: Actualizar stock de un producto
     *     tags: [Productos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del producto
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - cantidad
     *             properties:
     *               cantidad:
     *                 type: number
     *                 description: Nueva cantidad en stock
     *     responses:
     *       200:
     *         description: Stock actualizado exitosamente
     *       400:
     *         description: Cantidad requerida
     *       404:
     *         description: Producto no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.patch('/:id/stock', productoController.actualizarStock.bind(productoController));

    /**
     * @swagger
     * /api/productos/initialize:
     *   post:
     *     summary: Inicializar datos de productos
     *     description: Fuerza la inicialización de productos y productos del menú en la base de datos
     *     tags: [Productos]
     *     responses:
     *       200:
     *         description: Datos inicializados correctamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 message:
     *                   type: string
     *                   example: Datos inicializados correctamente
     *       500:
     *         description: Error al inicializar datos
     */
    router.post('/initialize', async (req, res) => {
        try {
            // Forzar inicialización de datos
            await req.app.locals.database.initializeData();
            
            res.json({
                success: true,
                message: 'Datos inicializados correctamente'
            });
        } catch (error) {
            console.error('Error al inicializar datos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al inicializar datos',
                error: error.message
            });
        }
    });

    return router;
};
