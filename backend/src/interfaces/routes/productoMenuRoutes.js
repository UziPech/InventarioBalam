const express = require('express');

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductoMenu:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *         - ingredientes
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del producto del menú
 *         nombre:
 *           type: string
 *           description: Nombre del producto del menú
 *         precio:
 *           type: number
 *           description: Precio de venta del producto
 *         descripcion:
 *           type: string
 *           description: Descripción del producto
 *         ingredientes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productoId:
 *                 type: integer
 *                 description: ID del producto de inventario
 *               cantidad:
 *                 type: number
 *                 description: Cantidad necesaria del ingrediente
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del producto
 *         fechaActualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         activo:
 *           type: boolean
 *           description: Si el producto está disponible en el menú
 */

module.exports = (productoMenuController) => {
    const router = express.Router();

    /**
     * @swagger
     * /api/productos-menu:
     *   get:
     *     summary: Obtener todos los productos del menú
     *     tags: [Productos del Menú]
     *     responses:
     *       200:
     *         description: Lista de productos del menú obtenida exitosamente
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
     *                     $ref: '#/components/schemas/ProductoMenu'
     *                 message:
     *                   type: string
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/', productoMenuController.obtenerTodos.bind(productoMenuController));

    /**
     * @swagger
     * /api/productos-menu/activos:
     *   get:
     *     summary: Obtener productos activos del menú
     *     tags: [Productos del Menú]
     *     responses:
     *       200:
     *         description: Lista de productos activos obtenida exitosamente
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
     *                     $ref: '#/components/schemas/ProductoMenu'
     *                 message:
     *                   type: string
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/activos', productoMenuController.obtenerActivos.bind(productoMenuController));

    /**
     * @swagger
     * /api/productos-menu/{id}:
     *   get:
     *     summary: Obtener un producto del menú por ID
     *     tags: [Productos del Menú]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del producto del menú
     *     responses:
     *       200:
     *         description: Producto del menú obtenido exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/ProductoMenu'
     *                 message:
     *                   type: string
     *       404:
     *         description: Producto del menú no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/:id', productoMenuController.obtenerPorId.bind(productoMenuController));

    /**
     * @swagger
     * /api/productos-menu:
     *   post:
     *     summary: Crear un nuevo producto del menú
     *     tags: [Productos del Menú]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - nombre
     *               - precio
     *               - ingredientes
     *             properties:
     *               nombre:
     *                 type: string
     *                 description: Nombre del producto del menú
     *               precio:
     *                 type: number
     *                 description: Precio de venta
     *               descripcion:
     *                 type: string
     *                 description: Descripción del producto
     *               ingredientes:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     productoId:
     *                       type: integer
     *                     cantidad:
     *                       type: number
     *     responses:
     *       201:
     *         description: Producto del menú creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/ProductoMenu'
     *                 message:
     *                   type: string
     *       400:
     *         description: Datos inválidos
     *       500:
     *         description: Error interno del servidor
     */
    router.post('/', productoMenuController.crear.bind(productoMenuController));

    /**
     * @swagger
     * /api/productos-menu/{id}:
     *   put:
     *     summary: Actualizar un producto del menú existente
     *     tags: [Productos del Menú]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del producto del menú
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               nombre:
     *                 type: string
     *               precio:
     *                 type: number
     *               descripcion:
     *                 type: string
     *               ingredientes:
     *                 type: array
     *     responses:
     *       200:
     *         description: Producto del menú actualizado exitosamente
     *       404:
     *         description: Producto del menú no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.put('/:id', productoMenuController.actualizar.bind(productoMenuController));

    /**
     * @swagger
     * /api/productos-menu/{id}:
     *   delete:
     *     summary: Eliminar un producto del menú
     *     tags: [Productos del Menú]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del producto del menú
     *     responses:
     *       200:
     *         description: Producto del menú eliminado exitosamente
     *       404:
     *         description: Producto del menú no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.delete('/:id', productoMenuController.eliminar.bind(productoMenuController));

    /**
     * @swagger
     * /api/productos-menu/buscar:
     *   get:
     *     summary: Buscar productos del menú por nombre
     *     tags: [Productos del Menú]
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
    router.get('/buscar', productoMenuController.buscarPorNombre.bind(productoMenuController));

    /**
     * @swagger
     * /api/productos-menu/{id}/estado:
     *   put:
     *     summary: Cambiar estado de un producto del menú
     *     tags: [Productos del Menú]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del producto del menú
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - activo
     *             properties:
     *               activo:
     *                 type: boolean
     *                 description: Estado del producto
     *     responses:
     *       200:
     *         description: Estado cambiado exitosamente
     *       400:
     *         description: Parámetro activo requerido
     *       500:
     *         description: Error interno del servidor
     */
    router.put('/:id/estado', productoMenuController.cambiarEstado.bind(productoMenuController));

    /**
     * @swagger
     * /api/productos-menu/estadisticas:
     *   get:
     *     summary: Obtener estadísticas de productos del menú
     *     tags: [Productos del Menú]
     *     responses:
     *       200:
     *         description: Estadísticas obtenidas exitosamente
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/estadisticas', productoMenuController.obtenerEstadisticas.bind(productoMenuController));

    return router;
};
