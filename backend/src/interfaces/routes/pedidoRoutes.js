const express = require('express');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pedido:
 *       type: object
 *       required:
 *         - cliente
 *         - items
 *         - total
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pedido
 *         cliente:
 *           type: string
 *           description: Nombre del cliente
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productoId:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               cantidad:
 *                 type: number
 *               precio:
 *                 type: number
 *               subtotal:
 *                 type: number
 *         total:
 *           type: number
 *           description: Total del pedido
 *         fecha:
 *           type: string
 *           format: date-time
 *           description: Fecha del pedido
 *         estado:
 *           type: string
 *           enum: [pendiente, procesado, cancelado]
 *           description: Estado del pedido
 */

module.exports = (pedidoController) => {
    const router = express.Router();

    /**
     * @swagger
     * /api/pedidos:
     *   get:
     *     summary: Obtener todos los pedidos
     *     tags: [Pedidos]
     *     responses:
     *       200:
     *         description: Lista de pedidos obtenida exitosamente
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
     *                     $ref: '#/components/schemas/Pedido'
     *                 message:
     *                   type: string
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/', pedidoController.obtenerTodos.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/hoy:
     *   get:
     *     summary: Obtener pedidos de hoy
     *     tags: [Pedidos]
     *     responses:
     *       200:
     *         description: Pedidos de hoy obtenidos exitosamente
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/hoy', pedidoController.obtenerPedidosHoy.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/semana:
     *   get:
     *     summary: Obtener pedidos de esta semana
     *     tags: [Pedidos]
     *     responses:
     *       200:
     *         description: Pedidos de esta semana obtenidos exitosamente
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/semana', pedidoController.obtenerPedidosEstaSemana.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/mes:
     *   get:
     *     summary: Obtener pedidos de este mes
     *     tags: [Pedidos]
     *     responses:
     *       200:
     *         description: Pedidos de este mes obtenidos exitosamente
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/mes', pedidoController.obtenerPedidosEsteMes.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/pendientes:
     *   get:
     *     summary: Obtener pedidos pendientes
     *     tags: [Pedidos]
     *     responses:
     *       200:
     *         description: Pedidos pendientes obtenidos exitosamente
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/pendientes', pedidoController.obtenerPedidosPendientes.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/horario-operacion:
     *   get:
     *     summary: Obtener información del horario de operación
     *     tags: [Pedidos]
     *     responses:
     *       200:
     *         description: Información del horario de operación obtenida exitosamente
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/horario-operacion', pedidoController.obtenerInfoHorarioOperacion.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/cliente:
     *   get:
     *     summary: Obtener pedidos por cliente
     *     tags: [Pedidos]
     *     parameters:
     *       - in: query
     *         name: cliente
     *         required: true
     *         schema:
     *           type: string
     *         description: Nombre del cliente
     *     responses:
     *       200:
     *         description: Pedidos del cliente obtenidos exitosamente
     *       400:
     *         description: Parámetro cliente requerido
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/cliente', pedidoController.obtenerPorCliente.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/estadisticas:
     *   get:
     *     summary: Obtener estadísticas de pedidos
     *     tags: [Pedidos]
     *     parameters:
     *       - in: query
     *         name: fechaInicio
     *         required: true
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de inicio (YYYY-MM-DD)
     *       - in: query
     *         name: fechaFin
     *         required: true
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de fin (YYYY-MM-DD)
     *     responses:
     *       200:
     *         description: Estadísticas obtenidas exitosamente
     *       400:
     *         description: Parámetros de fecha requeridos
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/estadisticas', pedidoController.obtenerEstadisticas.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/{id}:
     *   get:
     *     summary: Obtener un pedido por ID
     *     tags: [Pedidos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del pedido
     *     responses:
     *       200:
     *         description: Pedido obtenido exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Pedido'
     *                 message:
     *                   type: string
     *       404:
     *         description: Pedido no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/:id', pedidoController.obtenerPorId.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos:
     *   post:
     *     summary: Crear un nuevo pedido
     *     tags: [Pedidos]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - cliente
     *               - items
     *               - total
     *             properties:
     *               cliente:
     *                 type: string
     *                 description: Nombre del cliente
     *               items:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     productoId:
     *                       type: integer
     *                     nombre:
     *                       type: string
     *                     cantidad:
     *                       type: number
     *                     precio:
     *                       type: number
     *               total:
     *                 type: number
     *                 description: Total del pedido
     *     responses:
     *       201:
     *         description: Pedido creado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Pedido'
     *                 message:
     *                   type: string
     *       400:
     *         description: Datos inválidos o stock insuficiente
     *       500:
     *         description: Error interno del servidor
     */
    router.post('/', pedidoController.crear.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/menu:
     *   post:
     *     summary: Crear un nuevo pedido usando productos del menú
     *     tags: [Pedidos]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - items
     *             properties:
     *               cliente:
     *                 type: string
     *                 description: Nombre del cliente (opcional)
     *               items:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     productoMenuId:
     *                       type: integer
     *                       description: ID del producto del menú
     *                     cantidad:
     *                       type: number
     *                       description: Cantidad del producto
     *     responses:
     *       201:
     *         description: Pedido creado exitosamente
     *       400:
     *         description: Datos inválidos o stock insuficiente
     *       500:
     *         description: Error interno del servidor
     */
    router.post('/menu', pedidoController.crearConMenu.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/{id}/estado:
     *   patch:
     *     summary: Cambiar estado de un pedido
     *     tags: [Pedidos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del pedido
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - estado
     *             properties:
     *               estado:
     *                 type: string
     *                 enum: [pendiente, pagado, cancelado]
     *                 description: Nuevo estado del pedido
     *     responses:
     *       200:
     *         description: Estado del pedido cambiado exitosamente
     *       400:
     *         description: Estado no válido
     *       404:
     *         description: Pedido no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.patch('/:id/estado', pedidoController.cambiarEstado.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/{id}/pagar:
     *   patch:
     *     summary: Marcar pedido como pagado
     *     tags: [Pedidos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del pedido
     *     responses:
     *       200:
     *         description: Pedido marcado como pagado exitosamente
     *       404:
     *         description: Pedido no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.patch('/:id/pagar', pedidoController.marcarComoPagado.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/{id}/entregar:
     *   patch:
     *     summary: Marcar pedido como entregado
     *     tags: [Pedidos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del pedido
     *     responses:
     *       200:
     *         description: Pedido marcado como entregado exitosamente
     *       404:
     *         description: Pedido no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.patch('/:id/entregar', pedidoController.marcarComoEntregado.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/{id}/cancelar:
     *   patch:
     *     summary: Cancelar pedido
     *     tags: [Pedidos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del pedido
     *     responses:
     *       200:
     *         description: Pedido cancelado exitosamente
     *       404:
     *         description: Pedido no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.patch('/:id/cancelar', pedidoController.cancelarPedido.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/{id}:
     *   put:
     *     summary: Actualizar un pedido existente
     *     tags: [Pedidos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del pedido
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               cliente:
     *                 type: string
     *               items:
     *                 type: array
     *               total:
     *                 type: number
     *               estado:
     *                 type: string
     *                 enum: [pendiente, pagado, cancelado]
     *     responses:
     *       200:
     *         description: Pedido actualizado exitosamente
     *       404:
     *         description: Pedido no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.put('/:id', pedidoController.actualizar.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/{id}:
     *   delete:
     *     summary: Eliminar un pedido
     *     tags: [Pedidos]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID del pedido
     *     responses:
     *       200:
     *         description: Pedido eliminado exitosamente
     *       404:
     *         description: Pedido no encontrado
     *       500:
     *         description: Error interno del servidor
     */
    router.delete('/:id', pedidoController.eliminarPedido.bind(pedidoController));

    /**
     * @swagger
     * /api/pedidos/limpiar/todos:
     *   delete:
     *     summary: Eliminar todos los pedidos (limpiar base de datos)
     *     tags: [Pedidos]
     *     responses:
     *       200:
     *         description: Todos los pedidos eliminados exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 pedidosEliminados:
     *                   type: integer
     *                 timestamp:
     *                   type: string
     *                   format: date-time
     *       500:
     *         description: Error interno del servidor
     */
    router.delete('/limpiar/todos', pedidoController.eliminarTodosLosPedidos.bind(pedidoController));

    return router;
};
