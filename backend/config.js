// Configuración del servidor
const config = {
    // Puerto del servidor
    port: process.env.PORT || 3000,
    
    // Entorno de ejecución
    environment: process.env.NODE_ENV || 'development',
    
    // Configuración de CORS
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },
    
    // Configuración de la base de datos
    database: {
        path: process.env.DB_PATH || './inventario.json'
    },
    
    // Configuración de la aplicación
    app: {
        name: 'Inventario Balam API',
        version: '1.0.0',
        description: 'API para gestión de inventario de puesto de hamburguesas'
    }
};

module.exports = config;
