const express = require('express');

/**
 * Rutas para reportes del sistema
 */
module.exports = function(reporteController) {
    const router = express.Router();

    /**
     * @swagger
     * /api/reportes/ventas:
     *   get:
     *     summary: Obtener reporte de ventas por período
     *     description: Genera un reporte detallado de ventas entre dos fechas
     *     tags: [Reportes]
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
     *         description: Reporte de ventas generado exitosamente
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     periodo:
     *                       type: object
     *                     resumen:
     *                       type: object
     *                     ventasPorDia:
     *                       type: array
     *       400:
     *         description: Fechas requeridas
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/ventas', (req, res) => reporteController.obtenerReporteVentas(req, res));

    /**
     * @swagger
     * /api/reportes/productos-vendidos:
     *   get:
     *     summary: Obtener productos más vendidos
     *     description: Lista los productos más vendidos con opción de filtro por período
     *     tags: [Reportes]
     *     parameters:
     *       - in: query
     *         name: fechaInicio
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de inicio opcional (YYYY-MM-DD)
     *       - in: query
     *         name: fechaFin
     *         schema:
     *           type: string
     *           format: date
     *         description: Fecha de fin opcional (YYYY-MM-DD)
     *       - in: query
     *         name: limite
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Número máximo de productos a retornar
     *     responses:
     *       200:
     *         description: Lista de productos más vendidos
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     productos:
     *                       type: array
     *                     totalProductos:
     *                       type: integer
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/productos-vendidos', (req, res) => reporteController.obtenerProductosMasVendidos(req, res));

    /**
     * @swagger
     * /api/reportes/stock-critico:
     *   get:
     *     summary: Obtener reporte de stock crítico
     *     description: Lista productos con stock bajo o agotado
     *     tags: [Reportes]
     *     parameters:
     *       - in: query
     *         name: limiteStock
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Límite de stock para considerar crítico
     *     responses:
     *       200:
     *         description: Lista de productos con stock crítico
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     productos:
     *                       type: array
     *                     resumen:
     *                       type: object
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/stock-critico', (req, res) => reporteController.obtenerStockCritico(req, res));

    /**
     * @swagger
     * /api/reportes/dashboard:
     *   get:
     *     summary: Obtener dashboard con estadísticas generales
     *     description: Retorna estadísticas generales del sistema para el dashboard
     *     tags: [Reportes]
     *     responses:
     *       200:
     *         description: Estadísticas del dashboard
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     inventario:
     *                       type: object
     *                     menu:
     *                       type: object
     *                     ventas:
     *                       type: object
     *       500:
     *         description: Error interno del servidor
     */
    router.get('/dashboard', (req, res) => reporteController.obtenerDashboard(req, res));

    return router;
};
