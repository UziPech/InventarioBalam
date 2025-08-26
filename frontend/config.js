// Configuración del Frontend - Inventario Balam
const CONFIG = {
    // Configuración de la API
    API: {
        // URL de producción (Glitch)
        BASE_URL: 'https://inventario-balam.glitch.me/api',
        // URL de desarrollo (comentar cuando hagas deploy)
        // BASE_URL: 'http://localhost:3000/api',
        TIMEOUT: 10000, // 10 segundos
        RETRY_ATTEMPTS: 3
    },
    
    // Configuración de la aplicación
    APP: {
        NAME: 'Inventario Balam',
        VERSION: '1.0.0',
        DESCRIPTION: 'Sistema de gestión de inventario para puesto de hamburguesas'
    },
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        AUTO_DISMISS_DELAY: 5000, // 5 segundos
        MAX_TOASTS: 5
    },
    
    // Configuración de validaciones
    VALIDATION: {
        MIN_STOCK_WARNING: 10,
        MIN_PASSWORD_LENGTH: 6
    },
    
    // Configuración de paginación
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
        MAX_PAGE_SIZE: 100
    }
};

// Función para obtener la URL completa de un endpoint
function getApiUrl(endpoint) {
    return `${CONFIG.API.BASE_URL}${endpoint}`;
}

// Función para hacer peticiones HTTP con manejo de errores
async function apiRequest(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: CONFIG.API.TIMEOUT
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);
        
        const response = await fetch(url, {
            ...finalOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('La petición tardó demasiado tiempo');
        }
        throw error;
    }
}

// Exportar configuración y funciones
window.CONFIG = CONFIG;
window.getApiUrl = getApiUrl;
window.apiRequest = apiRequest;
