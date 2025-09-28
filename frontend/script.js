// Configuración de la API (ahora manejada por config.js)
// const API_BASE_URL = 'http://localhost:3000/api';

// Variables globales
let productos = [];
let productosMenu = [];
let pedidos = [];
let pedidoActual = {};
// Usar la nueva utilidad de tiempo global
const timeUtils = window.TimeUtils;

// Variables globales para controlar notificaciones
let ultimoConteoPendientes = 0;
let notificacionInicialMostrada = false;
let ultimaNotificacionPendientes = 0;

// Variables para controlar el estado de carga
let cargandoDatos = false;
let ultimaCargaCompleta = null;
let filtroActual = 'todos'; // 'todos', 'hoy', 'semana', 'mes', 'pendientes'

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función de inicialización
async function initializeApp() {
    showLoading();
    
    try {
        console.log('🚀 Iniciando aplicación...');
        
        // Limpiar cache local al inicio
        productos = [];
        productosMenu = [];
        pedidos = [];
        pedidoActual = {};
        
        // Cargar datos básicos primero
        console.log('📦 Cargando datos básicos...');
        await cargarInventario();
        await cargarMenu();
        
        // Configurar eventos
        setupEventListeners();
        
        // Actualizar fecha y hora
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // Cargar historial después de tener productos del menú
        console.log('📋 Cargando historial...');
        await cargarHistorial();
        
        // Cargar estadísticas de pedidos
        console.log('📊 Cargando estadísticas...');
        await Promise.all([
            cargarPedidosHoy(),
            cargarPedidosEstaSemana(),
            cargarPedidosEsteMes(),
            cargarPedidosPendientes()
        ]);
        
        // Actualizar todas las estadísticas
        actualizarEstadisticas();
        actualizarEstadisticasHistorial();
        mostrarEstadisticasPedidosPorDia();
        
        // Verificar pedidos pendientes al inicio (con notificación)
        verificarPedidosPendientes(true);
        
        // Mostrar información del horario de operación
        await mostrarInfoHorarioOperacion();
        
        // Inicializar reportes
        inicializarReportes();
        
        // Configurar auto-refresh para multi-dispositivo
        configurarAutoRefresh();
        
        console.log('✅ Aplicación inicializada correctamente');
        showToast('Sistema cargado exitosamente - Multi-dispositivo activo', 'success');
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        showToast('Error al cargar el sistema: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Navegación por tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Búsqueda en inventario
    document.getElementById('searchInventario').addEventListener('input', filtrarInventario);

    // Event delegation para botones de acción en inventario
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-action]')) {
            const button = e.target.closest('[data-action]');
            const action = button.dataset.action;
            const id = parseInt(button.dataset.id);
            
            if (action === 'editar') {
                editarProducto(id);
            } else if (action === 'eliminar') {
                eliminarProducto(id);
            }
        }
    });
}

// Cambiar de tab
function switchTab(tabName) {
    // Remover clase active de todos los tabs y botones
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Activar tab y botón seleccionado
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Actualizar fecha y hora
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('es-ES');
    
    document.getElementById('currentDate').textContent = dateStr;
    document.getElementById('currentTime').textContent = timeStr;
}

// ==================== INVENTARIO ====================

// Cargar inventario
async function cargarInventario() {
    try {
        const data = await apiRequest('/productos');
        
        if (data.success) {
            productos = data.data;
            renderizarInventario();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cargar inventario:', error);
        showToast('Error al cargar inventario', 'error');
    }
}

// Renderizar tabla de inventario
function renderizarInventario() {
    const tbody = document.getElementById('inventarioTable');
    tbody.innerHTML = '';
    
    productos.forEach(producto => {
        const row = document.createElement('tr');
        // Formatear cantidad según la unidad
        const cantidadFormateada = formatearCantidad(producto.cantidad, producto.unidad);
        
        row.innerHTML = `
            <td>${producto.id}</td>
            <td>${producto.nombre}</td>
            <td>${cantidadFormateada}</td>
            <td>${producto.unidad}</td>
            <td>$${producto.precio.toFixed(2)}</td>
            <td>
                <span class="status-badge ${producto.cantidad < 10 ? 'warning' : 'success'}">
                    ${producto.cantidad < 10 ? 'Stock Bajo' : 'Disponible'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-secondary btn-small" data-action="editar" data-id="${producto.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small" data-action="eliminar" data-id="${producto.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filtrar inventario
function filtrarInventario() {
    const searchTerm = document.getElementById('searchInventario').value.toLowerCase();
    const tbody = document.getElementById('inventarioTable');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const nombre = row.cells[1].textContent.toLowerCase();
        if (nombre.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Agregar producto
async function agregarProducto() {
    const nombre = document.getElementById('nombreProducto').value;
    const cantidad = parseFloat(document.getElementById('cantidadProducto').value);
    const unidad = document.getElementById('unidadProducto').value;
    const precio = parseFloat(document.getElementById('precioProducto').value);
    
    if (!nombre || !cantidad || !unidad || !precio) {
        showToast('Por favor complete todos los campos', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const data = await apiRequest('/productos', {
            method: 'POST',
            body: JSON.stringify({
                nombre,
                cantidad,
                unidad,
                precio
            })
        });
        
        if (data.success) {
            showToast('Producto agregado exitosamente', 'success');
            closeModal('agregarProducto');
            document.getElementById('formAgregarProducto').reset();
            await cargarInventario();
            actualizarEstadisticas();
            
            // Actualizar reportes automáticamente
            await actualizarReportes();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al agregar producto:', error);
        showToast('Error al agregar producto', 'error');
    } finally {
        hideLoading();
    }
}

// Editar producto
async function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    // Llenar el formulario con los datos del producto
    document.getElementById('editNombreProducto').value = producto.nombre;
    document.getElementById('editCantidadProducto').value = producto.cantidad;
    document.getElementById('editUnidadProducto').value = producto.unidad;
    document.getElementById('editPrecioProducto').value = producto.precio;
    
    // Guardar el ID del producto a editar
    document.getElementById('editProductoForm').dataset.productoId = id;
    
    // Abrir el modal de edición
    openModal('editarProducto');
}

// Actualizar producto
async function actualizarProducto() {
    const id = parseInt(document.getElementById('editProductoForm').dataset.productoId);
    const nombre = document.getElementById('editNombreProducto').value;
    const cantidad = parseFloat(document.getElementById('editCantidadProducto').value);
    const unidad = document.getElementById('editUnidadProducto').value;
    const precio = parseFloat(document.getElementById('editPrecioProducto').value);
    
    if (!nombre || !cantidad || !unidad || !precio) {
        showToast('Por favor complete todos los campos', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const data = await apiRequest(`/productos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                nombre,
                cantidad,
                unidad,
                precio
            })
        });
        
        if (data.success) {
            showToast('Producto actualizado exitosamente', 'success');
            closeModal('editarProducto');
            await cargarInventario();
            actualizarEstadisticas();
            
            // Actualizar reportes automáticamente
            await actualizarReportes();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        showToast('Error al actualizar producto', 'error');
    } finally {
        hideLoading();
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Está seguro de que desea eliminar este producto?')) {
        return;
    }
    
    showLoading();
    
    try {
        const data = await apiRequest(`/productos/${id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showToast('Producto eliminado exitosamente', 'success');
            await cargarInventario();
            actualizarEstadisticas();
            
            // Actualizar reportes automáticamente
            await actualizarReportes();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        showToast('Error al eliminar producto', 'error');
    } finally {
        hideLoading();
    }
}

// ==================== MENÚ ====================

// Cargar menú
async function cargarMenu() {
    try {
        const data = await apiRequest('/productos-menu/activos');
        
        if (data.success) {
            productosMenu = data.data;
            
            // Asegurar que productos esté cargado antes de renderizar
            if (productos.length === 0) {
                await cargarInventario();
            }
            
            renderizarMenu();
            renderizarMenuItems();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cargar menú:', error);
        showToast('Error al cargar menú', 'error');
    }
}

// Renderizar grid del menú
function renderizarMenu() {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';
    
    // Debug: mostrar información de los datos
    console.log('Productos del inventario disponibles:', productos);
    console.log('Productos del menú a renderizar:', productosMenu);
    
    productosMenu.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        
        // Mejorar la visualización de ingredientes
        const ingredientesTexto = producto.ingredientes.map(i => {
            console.log('Procesando ingrediente:', i); // Debug
            
            const productoInventario = productos.find(p => p.id === i.productoId);
            console.log('Producto encontrado en inventario:', productoInventario); // Debug
            
            if (productoInventario) {
                return `${i.cantidad} ${productoInventario.unidad} de ${productoInventario.nombre}`;
            } else {
                return `${i.cantidad} unidades de Producto ID: ${i.productoId}`;
            }
        }).join(', ');
        
        card.innerHTML = `
            <div class="menu-item-header">
                <div class="menu-item-title">${producto.nombre}</div>
                <div class="menu-item-price">$${producto.precio.toFixed(2)}</div>
            </div>
            <div class="menu-item-description">${producto.descripcion || 'Sin descripción'}</div>
            <div class="menu-item-ingredients">
                <strong>Ingredientes:</strong> ${ingredientesTexto}
            </div>
            <div class="menu-item-actions">
                <button class="btn btn-secondary btn-small" onclick="editarProductoMenu(${producto.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-warning btn-small" onclick="toggleProductoMenu(${producto.id}, ${!producto.activo})">
                    <i class="fas fa-${producto.activo ? 'eye-slash' : 'eye'}"></i>
                    ${producto.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button class="btn btn-danger btn-small" onclick="eliminarProductoMenu(${producto.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Renderizar items del menú para pedidos
function renderizarMenuItems() {
    const container = document.getElementById('menuItems');
    container.innerHTML = '';
    
    productosMenu.forEach(producto => {
        const item = document.createElement('div');
        item.className = 'menu-item-select';
        item.innerHTML = `
            <div class="menu-item-info">
                <div class="menu-item-name">${producto.nombre}</div>
                <div class="menu-item-price">$${producto.precio.toFixed(2)}</div>
                <div class="menu-item-description">${producto.descripcion || ''}</div>
            </div>
            <div class="menu-item-actions">
                <button class="btn btn-primary" onclick="abrirPersonalizacion(${producto.id})">
                    <i class="fas fa-sliders-h"></i> Personalizar
                </button>
                <div class="quantity-display-readonly" id="qty-display-${producto.id}" style="display: none;">
                    En pedido: <span id="qty-${producto.id}">0</span>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Agregar producto al menú
async function agregarProductoMenu() {
    const nombre = document.getElementById('nombreProductoMenu').value;
    const descripcion = document.getElementById('descripcionProductoMenu').value;
    const precio = parseFloat(document.getElementById('precioProductoMenu').value);
    
    if (!nombre || !precio) {
        showToast('Por favor complete los campos requeridos', 'warning');
        return;
    }
    
    // Obtener ingredientes
    const ingredientes = [];
    const ingredientesItems = document.querySelectorAll('.ingrediente-item');
    
    ingredientesItems.forEach(item => {
        const select = item.querySelector('.ingrediente-select');
        const cantidad = parseFloat(item.querySelector('.ingrediente-cantidad').value);
        
        if (select.value && cantidad > 0) {
            ingredientes.push({
                productoId: parseInt(select.value),
                cantidad: cantidad
            });
        }
    });
    
    if (ingredientes.length === 0) {
        showToast('Debe agregar al menos un ingrediente', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const data = await apiRequest('/productos-menu', {
            method: 'POST',
            body: JSON.stringify({
                nombre,
                descripcion,
                precio,
                ingredientes
            })
        });
        
        if (data.success) {
            showToast('Producto agregado al menú exitosamente', 'success');
            closeModal('agregarProductoMenu');
            document.getElementById('formAgregarProductoMenu').reset();
            await cargarMenu();
            actualizarEstadisticas();
            
            // Actualizar reportes automáticamente
            await actualizarReportes();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al agregar producto al menú:', error);
        showToast('Error al agregar producto al menú', 'error');
    } finally {
        hideLoading();
    }
}

// Editar producto del menú
async function editarProductoMenu(id) {
    const producto = productosMenu.find(p => p.id === id);
    if (!producto) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    // Llenar el formulario con los datos del producto
    document.getElementById('nombreProductoMenu').value = producto.nombre;
    document.getElementById('descripcionProductoMenu').value = producto.descripcion || '';
    document.getElementById('precioProductoMenu').value = producto.precio;
    
    // Limpiar ingredientes existentes
    const container = document.getElementById('ingredientesContainer');
    container.innerHTML = '';
    
    // Agregar ingredientes del producto
    producto.ingredientes.forEach(ingrediente => {
        agregarIngrediente(ingrediente.productoId, ingrediente.cantidad);
    });
    
    // Cambiar el botón para actualizar
    const submitBtn = document.querySelector('#agregarProductoMenu .modal-footer .btn-primary');
    if (submitBtn) {
        submitBtn.textContent = 'Actualizar Producto';
        submitBtn.onclick = () => actualizarProductoMenu(id);
        console.log('Botón cambiado a modo edición para producto ID:', id);
    }
    
    openModal('agregarProductoMenu');
}

// Actualizar producto del menú
async function actualizarProductoMenu(id) {
    const nombre = document.getElementById('nombreProductoMenu').value;
    const descripcion = document.getElementById('descripcionProductoMenu').value;
    const precio = parseFloat(document.getElementById('precioProductoMenu').value);
    
    if (!nombre || !precio) {
        showToast('Por favor complete los campos requeridos', 'warning');
        return;
    }
    
    // Obtener ingredientes
    const ingredientes = [];
    const ingredientesItems = document.querySelectorAll('.ingrediente-item');
    
    ingredientesItems.forEach(item => {
        const select = item.querySelector('.ingrediente-select');
        const cantidad = parseFloat(item.querySelector('.ingrediente-cantidad').value);
        
        if (select.value && cantidad > 0) {
            ingredientes.push({
                productoId: parseInt(select.value),
                cantidad: cantidad
            });
        }
    });
    
    if (ingredientes.length === 0) {
        showToast('Debe agregar al menos un ingrediente', 'warning');
        return;
    }
    
    showLoading();
    
    try {
        const data = await apiRequest(`/productos-menu/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                nombre,
                descripcion,
                precio,
                ingredientes
            })
        });
        
        if (data.success) {
            showToast('Producto actualizado exitosamente', 'success');
            closeModal('agregarProductoMenu');
            document.getElementById('formAgregarProductoMenu').reset();
            
            // Restaurar el botón original
            const submitBtn = document.querySelector('#agregarProductoMenu .modal-footer .btn-primary');
            submitBtn.textContent = 'Agregar al Menú';
            submitBtn.onclick = agregarProductoMenu;
            
            await cargarMenu();
            actualizarEstadisticas();
            
            // Actualizar reportes automáticamente
            await actualizarReportes();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al actualizar producto del menú:', error);
        showToast('Error al actualizar producto del menú', 'error');
    } finally {
        hideLoading();
    }
}

// Cambiar estado de producto del menú (activar/desactivar)
async function toggleProductoMenu(id, activo) {
    showLoading();
    
    try {
        const data = await apiRequest(`/productos-menu/${id}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ activo })
        });
        
        if (data.success) {
            showToast(`Producto ${activo ? 'activado' : 'desactivado'} exitosamente`, 'success');
            await cargarMenu();
            actualizarEstadisticas();
            
            // Actualizar reportes automáticamente
            await actualizarReportes();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cambiar estado del producto:', error);
        showToast('Error al cambiar estado del producto', 'error');
    } finally {
        hideLoading();
    }
}

// Eliminar producto del menú
async function eliminarProductoMenu(id) {
    if (!confirm('¿Está seguro de que desea eliminar este producto del menú? Esta acción no se puede deshacer.')) {
        return;
    }
    
    showLoading();
    
    try {
        const data = await apiRequest(`/productos-menu/${id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showToast('Producto del menú eliminado exitosamente', 'success');
            await cargarMenu();
            actualizarEstadisticas();
            
            // Actualizar reportes automáticamente
            await actualizarReportes();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al eliminar producto del menú:', error);
        showToast('Error al eliminar producto del menú', 'error');
    } finally {
        hideLoading();
    }
}

// Agregar ingrediente al formulario
function agregarIngrediente(productoId = null, cantidad = '') {
    const container = document.getElementById('ingredientesContainer');
    const item = document.createElement('div');
    item.className = 'ingrediente-item';
    
    // Debug: verificar productos disponibles
    console.log('Productos disponibles para ingredientes:', productos);
    
    item.innerHTML = `
        <select class="form-input ingrediente-select">
            <option value="">Seleccionar ingrediente...</option>
            ${productos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
        </select>
        <input type="number" class="form-input ingrediente-cantidad" step="0.01" placeholder="Cantidad" value="${cantidad}">
        <button type="button" class="btn btn-danger btn-small" onclick="removerIngrediente(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(item);
    
    // Si se proporciona un productoId, seleccionarlo
    if (productoId) {
        const select = item.querySelector('.ingrediente-select');
        select.value = productoId;
        console.log('Seleccionado producto ID:', productoId, 'en select:', select.value);
    }
}

// Remover ingrediente del formulario
function removerIngrediente(button) {
    button.parentElement.remove();
}

// ==================== PEDIDOS ====================

// Cambiar cantidad de un producto en el pedido
function cambiarCantidad(productoId, cambio) {
    const display = document.getElementById(`qty-${productoId}`);
    let cantidad = parseInt(display.textContent) || 0;
    cantidad = Math.max(0, cantidad + cambio);
    display.textContent = cantidad;
    
    // Actualizar pedido actual
    if (cantidad > 0) {
        pedidoActual[productoId] = cantidad;
    } else {
        delete pedidoActual[productoId];
    }
    
    actualizarResumenPedido();
}

// Actualizar resumen del pedido
function actualizarResumenPedido() {
    const container = document.getElementById('resumenItems');
    const totalElement = document.getElementById('pedidoTotal');
    container.innerHTML = '';
    
    let total = 0;
    
    Object.entries(pedidoActual).forEach(([productoId, cantidad]) => {
        const producto = productosMenu.find(p => p.id === parseInt(productoId));
        if (producto) {
            const subtotal = producto.precio * cantidad;
            total += subtotal;
            
            const item = document.createElement('div');
            item.className = 'resumen-item';
            item.innerHTML = `
                <div>
                    <strong>${producto.nombre}</strong>
                    <br>
                    <small>$${producto.precio.toFixed(2)} x ${cantidad}</small>
                </div>
                <div>$${subtotal.toFixed(2)}</div>
            `;
            container.appendChild(item);
        }
    });
    
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Variables para personalización
let productoPersonalizacionActual = null;
let personalizacionActual = {
    ingredientesExcluidos: [],
    ingredientesExtras: []
};

// Abrir modal de personalización
function abrirPersonalizacion(productoId) {
    const producto = productosMenu.find(p => p.id === productoId);
    if (!producto) return;
    
    productoPersonalizacionActual = producto;
    personalizacionActual = {
        ingredientesExcluidos: [],
        ingredientesExtras: []
    };
    
    // Actualizar título del modal
    document.getElementById('nombreProductoPersonalizar').textContent = producto.nombre;
    
    // Cargar ingredientes base
    cargarIngredientesBase(producto);
    
    // Limpiar ingredientes extras
    document.getElementById('ingredientesExtrasContainer').innerHTML = '';
    
    // Resetear cantidad
    document.getElementById('cantidadPersonalizacion').textContent = '1';
    
    // Abrir modal
    openModal('personalizarIngredientes');
}

// Cargar ingredientes base del producto
async function cargarIngredientesBase(producto) {
    const container = document.getElementById('ingredientesBaseContainer');
    container.innerHTML = '';
    
    if (!producto.ingredientes || producto.ingredientes.length === 0) {
        container.innerHTML = '<p class="help-text">Este producto no tiene ingredientes configurados.</p>';
        return;
    }
    
    for (const ingrediente of producto.ingredientes) {
        const productoInventario = productos.find(p => p.id === ingrediente.productoId);
        const nombreIngrediente = productoInventario ? productoInventario.nombre : `Ingrediente ID: ${ingrediente.productoId}`;
        
        const item = document.createElement('div');
        item.className = 'ingrediente-base-item';
        item.innerHTML = `
            <input type="checkbox" 
                   id="ingrediente-${ingrediente.productoId}" 
                   checked 
                   onchange="toggleIngredienteBase(${ingrediente.productoId}, this.checked)">
            <div class="ingrediente-base-info">
                <span class="ingrediente-name">${nombreIngrediente}</span>
                <span class="ingrediente-cantidad">${ingrediente.cantidad} ${productoInventario?.unidad || 'unidades'}</span>
            </div>
        `;
        container.appendChild(item);
    }
}

// Toggle ingrediente base (incluir/excluir)
function toggleIngredienteBase(ingredienteId, incluir) {
    if (incluir) {
        // Remover de excluidos
        personalizacionActual.ingredientesExcluidos = personalizacionActual.ingredientesExcluidos.filter(id => id !== ingredienteId);
    } else {
        // Agregar a excluidos
        if (!personalizacionActual.ingredientesExcluidos.includes(ingredienteId)) {
            personalizacionActual.ingredientesExcluidos.push(ingredienteId);
        }
    }
    
    console.log('Ingredientes excluidos:', personalizacionActual.ingredientesExcluidos);
}

// Agregar ingrediente extra
function agregarIngredienteExtra() {
    const container = document.getElementById('ingredientesExtrasContainer');
    
    const item = document.createElement('div');
    item.className = 'ingrediente-extra-item';
    item.innerHTML = `
        <select class="form-input ingrediente-extra-select" onchange="actualizarIngredienteExtra(this)">
            <option value="">Seleccionar ingrediente...</option>
            ${productos.map(p => `<option value="${p.id}" data-nombre="${p.nombre}">${p.nombre} (${p.unidad || 'unidades'})</option>`).join('')}
        </select>
        <input type="number" class="form-input ingrediente-extra-cantidad" 
               step="0.01" min="0.01" value="1" placeholder="Cantidad"
               onchange="actualizarIngredienteExtra(this)">
        <button type="button" class="btn btn-danger btn-small" onclick="removerIngredienteExtra(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(item);
}

// Actualizar ingrediente extra
function actualizarIngredienteExtra(element) {
    // Actualizar la lista de ingredientes extras
    const container = document.getElementById('ingredientesExtrasContainer');
    const items = container.querySelectorAll('.ingrediente-extra-item');
    
    personalizacionActual.ingredientesExtras = [];
    
    items.forEach(item => {
        const select = item.querySelector('.ingrediente-extra-select');
        const cantidadInput = item.querySelector('.ingrediente-extra-cantidad');
        
        if (select.value && cantidadInput.value && parseFloat(cantidadInput.value) > 0) {
            const option = select.options[select.selectedIndex];
            personalizacionActual.ingredientesExtras.push({
                productoId: parseInt(select.value),
                nombre: option.getAttribute('data-nombre'),
                cantidad: parseFloat(cantidadInput.value)
            });
        }
    });
    
    console.log('Ingredientes extras:', personalizacionActual.ingredientesExtras);
}

// Remover ingrediente extra
function removerIngredienteExtra(button) {
    button.parentElement.remove();
    actualizarIngredienteExtra();
}

// Cambiar cantidad en personalización
function cambiarCantidadPersonalizacion(cambio) {
    const display = document.getElementById('cantidadPersonalizacion');
    let cantidad = parseInt(display.textContent) || 1;
    cantidad = Math.max(1, cantidad + cambio);
    display.textContent = cantidad;
}

// Agregar producto personalizado al pedido
function agregarProductoPersonalizado() {
    if (!productoPersonalizacionActual) {
        showToast('Error: No se ha seleccionado un producto', 'error');
        return;
    }
    
    // Validar ingredientes extras
    const extrasContainer = document.getElementById('ingredientesExtrasContainer');
    const extrasItems = extrasContainer.querySelectorAll('.ingrediente-extra-item');
    
    for (let item of extrasItems) {
        const select = item.querySelector('.ingrediente-extra-select');
        const cantidad = item.querySelector('.ingrediente-extra-cantidad');
        
        if (select.value && (!cantidad.value || parseFloat(cantidad.value) <= 0)) {
            showToast('Todos los ingredientes extras deben tener una cantidad válida', 'warning');
            return;
        }
        
        if (!select.value && cantidad.value) {
            showToast('Por favor selecciona un ingrediente para la cantidad especificada', 'warning');
            return;
        }
    }
    
    const cantidad = parseInt(document.getElementById('cantidadPersonalizacion').textContent) || 1;
    const productoId = productoPersonalizacionActual.id;
    
    // Crear objeto con personalizaciones
    const itemPersonalizado = {
        productoId: productoId,
        cantidad: cantidad,
        personalizaciones: {
            ingredientesExcluidos: [...personalizacionActual.ingredientesExcluidos],
            ingredientesExtras: [...personalizacionActual.ingredientesExtras]
        }
    };
    
    // Agregar al pedido actual (necesitamos modificar la estructura del pedido)
    if (!pedidoActual[productoId]) {
        pedidoActual[productoId] = {
            cantidad: 0,
            items: []
        };
    }
    
    // Agregar el item personalizado
    pedidoActual[productoId].items = pedidoActual[productoId].items || [];
    pedidoActual[productoId].items.push(itemPersonalizado);
    pedidoActual[productoId].cantidad += cantidad;
    
    // Actualizar display
    const qtyDisplay = document.getElementById(`qty-${productoId}`);
    if (qtyDisplay) {
        qtyDisplay.textContent = pedidoActual[productoId].cantidad;
        const displayContainer = document.getElementById(`qty-display-${productoId}`);
        if (displayContainer) {
            displayContainer.style.display = 'block';
        }
    }
    
    // Actualizar resumen
    actualizarResumenPedidoPersonalizado();
    
    // Cerrar modal
    closeModal('personalizarIngredientes');
    
    showToast(`${productoPersonalizacionActual.nombre} agregado al pedido (${cantidad}x)`, 'success');
}

// Actualizar resumen con personalizaciones
function actualizarResumenPedidoPersonalizado() {
    const container = document.getElementById('resumenItems');
    const totalElement = document.getElementById('pedidoTotal');
    container.innerHTML = '';
    
    let total = 0;
    
    Object.entries(pedidoActual).forEach(([productoId, data]) => {
        const producto = productosMenu.find(p => p.id === parseInt(productoId));
        if (producto && data.items) {
            data.items.forEach((item, index) => {
                const subtotal = producto.precio * item.cantidad;
                total += subtotal;
                
                // Crear descripción de personalizaciones
                let personalizacionTexto = '';
                if (item.personalizaciones) {
                    const exclusiones = item.personalizaciones.ingredientesExcluidos;
                    const extras = item.personalizaciones.ingredientesExtras;
                    
                    if (exclusiones.length > 0) {
                        const nombresExcluidos = exclusiones.map(id => {
                            const prod = productos.find(p => p.id === id);
                            return prod ? prod.nombre : `ID:${id}`;
                        });
                        personalizacionTexto += `<br><small style="color: #ff6b6b;">Sin: ${nombresExcluidos.join(', ')}</small>`;
                    }
                    
                    if (extras.length > 0) {
                        const nombresExtras = extras.map(extra => `${extra.nombre} (${extra.cantidad})`);
                        personalizacionTexto += `<br><small style="color: #51cf66;">Extra: ${nombresExtras.join(', ')}</small>`;
                    }
                }
                
                const itemElement = document.createElement('div');
                itemElement.className = 'resumen-item';
                itemElement.innerHTML = `
                    <div>
                        <strong>${producto.nombre}</strong>
                        <br>
                        <small>$${producto.precio.toFixed(2)} x ${item.cantidad}</small>
                        ${personalizacionTexto}
                    </div>
                    <div>$${subtotal.toFixed(2)}</div>
                `;
                container.appendChild(itemElement);
            });
        }
    });
    
    totalElement.textContent = `$${total.toFixed(2)}`;
}

// Crear pedido
async function crearPedido() {
    const cliente = document.getElementById('clientePedido').value || 'Cliente General';
    
    if (Object.keys(pedidoActual).length === 0) {
        showToast('Debe seleccionar al menos un producto', 'warning');
        return;
    }
    
    // Debug: mostrar productos del menú disponibles
    console.log('🍔 Productos del menú disponibles:', productosMenu);
    console.log('🛒 Pedido actual:', pedidoActual);
    
    const items = [];
    
    Object.entries(pedidoActual).forEach(([productoMenuId, data]) => {
        const productoMenu = productosMenu.find(p => p.id === parseInt(productoMenuId));
        console.log(`📦 Procesando producto ID ${productoMenuId}:`, productoMenu, 'Data:', data);
        
        if (data.items && data.items.length > 0) {
            // Productos personalizados
            data.items.forEach(item => {
                items.push({
                    productoId: item.productoId,
                    cantidad: item.cantidad,
                    personalizaciones: item.personalizaciones
                });
            });
        } else if (typeof data === 'number') {
            // Productos sin personalización (compatibilidad hacia atrás)
            items.push({
                productoId: parseInt(productoMenuId),
                cantidad: data
            });
        }
    });
    
    showLoading();
    
    // Guardar estado anterior del inventario para mostrar cambios
    const productosAnteriores = [...productos];
    
    // Debug: mostrar qué se está enviando
    console.log('🚀 Enviando pedido:', { cliente, items });
    
    try {
        const data = await apiRequest('/pedidos/menu', {
            method: 'POST',
            body: JSON.stringify({
                cliente,
                items
            })
        });
        
        if (data.success) {
            showToast('Pedido creado exitosamente', 'success');
            
            // Limpiar pedido actual
            pedidoActual = {};
            document.getElementById('clientePedido').value = '';
            
            // Limpiar displays de cantidad
            document.querySelectorAll('.quantity-display').forEach(display => {
                display.textContent = '0';
            });
            
            // Ocultar displays de cantidad en productos personalizados
            document.querySelectorAll('.quantity-display-readonly').forEach(display => {
                display.style.display = 'none';
            });
            
            actualizarResumenPedidoPersonalizado();
            
            // Recargar datos y actualizar estadísticas inmediatamente
            await Promise.all([
                cargarInventario(),
                cargarMenu(),
                cargarHistorial(), // Cargar historial completo en lugar de solo pedidos de hoy
                cargarPedidosHoy() // También cargar pedidos de hoy para estadísticas
            ]);
            
            // Actualizar estadísticas del historial
            actualizarEstadisticasHistorial();
            mostrarEstadisticasPedidosPorDia();
            
            // Actualizar reportes automáticamente
            await actualizarReportes();
            
            // Mostrar cambios en el inventario
            mostrarCambiosInventario(productosAnteriores, productos);
            
            // Mostrar mensaje de confirmación con detalles
            const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
            showToast(`Pedido creado: ${totalItems} productos por $${data.total.toFixed(2)}`, 'success');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al crear pedido:', error);
        
        // Mejorar mensaje de error para el usuario
        let mensajeError = error.message;
        if (error.message && error.message.includes('Stock insuficiente')) {
            mensajeError = '❌ No hay suficientes ingredientes en el inventario para procesar este pedido.\n\nPor favor:\n• Verifica el stock disponible en el inventario\n• Agrega más ingredientes si es necesario\n• Intenta con un pedido más pequeño';
        } else if (error.message && error.message.includes('Producto del menú no encontrado')) {
            mensajeError = '❌ Uno de los productos seleccionados no está disponible en el menú.\n\nPor favor:\n• Verifica que los productos estén activos\n• Recarga la página si es necesario';
        }
        
        showToast(mensajeError, 'error');
    } finally {
        hideLoading();
    }
}

// ==================== HISTORIAL ====================

// Cargar historial completo (función principal)
async function cargarHistorial() {
    try {
        const data = await apiRequest('/pedidos');
        
        if (data.success) {
            console.log(`📋 Cargando historial completo: ${data.data.length} pedidos`);
            pedidos = data.data; // Actualizar la variable global con TODOS los pedidos
            
            // Asegurar que productosMenu esté cargado antes de renderizar
            if (productosMenu.length === 0) {
                await cargarMenu();
            }
            
            renderizarHistorial();
            actualizarEstadisticasHistorial();
            ultimaCargaCompleta = new Date();
            
            console.log('✅ Historial completo cargado correctamente');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cargar historial:', error);
        showToast('Error al cargar historial', 'error');
    }
}

// Renderizar tabla de historial
function renderizarHistorial() {
    const tbody = document.getElementById('historialTable');
    if (!tbody) {
        console.error('❌ No se encontró la tabla de historial');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (!pedidos || pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay pedidos para mostrar</td></tr>';
        return;
    }
    
    console.log(`📋 Renderizando ${pedidos.length} pedidos en el historial`);
    
    // Ordenar pedidos por fecha (más recientes primero)
    const pedidosOrdenados = [...pedidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    pedidosOrdenados.forEach(pedido => {
        
        const row = document.createElement('tr');
        
        // Formatear fecha correctamente usando zona horaria local
        const fechaPedido = new Date(pedido.fecha);
        const fecha = fechaPedido.toLocaleString('es-ES', { 
            timeZone: 'America/Merida',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Mejorar la visualización de items
        const items = pedido.items.map(item => {
            // Si el item tiene nombre, usarlo directamente
            if (item.nombre) {
                return `${item.nombre} (${item.cantidad})`;
            }
            // Si no tiene nombre, buscar en productosMenu por ID
            const productoMenu = productosMenu.find(p => p.id === item.productoId);
            if (productoMenu) {
                return `${productoMenu.nombre} (${item.cantidad})`;
            }
            // Si no se encuentra, mostrar ID del producto
            return `Producto ID: ${item.productoId} (${item.cantidad})`;
        }).join(', ');
        
        // Formatear número de pedido - usar numeroDia si está disponible, sino el ID
        const numeroPedido = pedido.numeroDia ? `#${pedido.numeroDia}` : `#${pedido.id}`;
        
        // Verificar estado del pedido
        const estado = pedido.estado || 'pendiente';
        
        // Debug: mostrar información detallada del pedido
        console.log(`📦 Pedido ID: ${pedido.id}, NumeroDia: ${pedido.numeroDia}, NumeroMostrado: ${numeroPedido}, Estado: ${estado}, Fecha: ${fecha}`);
        
        row.innerHTML = `
            <td><span class="pedido-numero">${numeroPedido}</span></td>
            <td>${pedido.cliente}</td>
            <td>${items}</td>
            <td>$${pedido.total.toFixed(2)}</td>
            <td>${fecha}</td>
            <td>
                <span class="status-badge ${estado}">
                    ${estado.charAt(0).toUpperCase() + estado.slice(1)}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-secondary btn-small" onclick="verPedido(${pedido.id})" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${estado === 'pendiente' ? `
                        <button class="btn btn-success btn-small" onclick="marcarComoPagado(${pedido.id})" title="Marcar como pagado">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn btn-danger btn-small" onclick="cancelarPedido(${pedido.id})" title="Cancelar pedido">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-warning btn-small" onclick="eliminarPedido(${pedido.id})" title="Eliminar pedido">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    console.log('✅ Historial renderizado correctamente');
}

// Filtrar historial
function filtrarHistorial() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        showToast('Por favor seleccione fechas de inicio y fin', 'warning');
        return;
    }
    
    // Implementar filtrado por fecha
    showToast('Filtrado implementado', 'success');
}

// ==================== REPORTES ====================

// Generar reporte de ventas
async function generarReporte() {
    const fechaInicio = document.getElementById('reporteFechaInicio').value;
    const fechaFin = document.getElementById('reporteFechaFin').value;
    
    if (!fechaInicio || !fechaFin) {
        showToast('Por favor seleccione fechas de inicio y fin', 'warning');
        return;
    }
    
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        showToast('La fecha de inicio no puede ser mayor a la fecha de fin', 'warning');
        return;
    }
    
    try {
        showLoading();
        const response = await apiRequest(`/reportes/ventas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
        
        if (response.success) {
            mostrarReporteVentas(response.data);
            showToast('Reporte generado exitosamente', 'success');
        } else {
            showToast('Error al generar reporte', 'error');
        }
    } catch (error) {
        console.error('Error al generar reporte:', error);
        showToast('Error al generar reporte', 'error');
    } finally {
        hideLoading();
    }
}

// Mostrar reporte de ventas
function mostrarReporteVentas(data) {
    const reporteContainer = document.getElementById('ventasReporte');
    if (!reporteContainer) return;
    
    const { periodo, resumen, ventasPorDia } = data;
    
    reporteContainer.innerHTML = `
        <div class="reporte-section">
            <h4>📊 Resumen del Período (${periodo.fechaInicio} - ${periodo.fechaFin})</h4>
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Total Ventas</span>
                    <span class="stat-value">$${resumen.totalVentas.toFixed(2)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Pedidos</span>
                    <span class="stat-value">${resumen.totalPedidos}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Promedio por Pedido</span>
                    <span class="stat-value">$${resumen.promedioPorPedido.toFixed(2)}</span>
                </div>
            </div>
        </div>
        
        <div class="reporte-section">
            <h4>📅 Ventas por Día</h4>
            <div class="ventas-dia">
                ${ventasPorDia.length > 0 ? ventasPorDia.map(dia => `
                    <div class="dia-venta">
                        <span class="fecha">${dia.fecha}</span>
                        <span class="ventas">$${dia.ventas.toFixed(2)}</span>
                        <span class="pedidos">${dia.pedidos} pedidos</span>
                    </div>
                `).join('') : '<p class="text-muted">No hay ventas en este período</p>'}
            </div>
        </div>
    `;
}

// Cargar dashboard
async function cargarDashboard() {
    try {
        const response = await apiRequest('/reportes/dashboard');
        
        if (response.success) {
            actualizarEstadisticasDashboard(response.data);
        }
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

// Actualizar estadísticas del dashboard
function actualizarEstadisticasDashboard(data) {
    // Inventario
    const totalProductosEl = document.getElementById('totalProductos');
    const valorInventarioEl = document.getElementById('valorInventario');
    
    if (totalProductosEl) totalProductosEl.textContent = data.inventario.totalProductos;
    if (valorInventarioEl) valorInventarioEl.textContent = '$' + data.inventario.valorTotal.toFixed(2);
    
    // Menú
    const totalMenuEl = document.getElementById('totalMenu');
    
    if (totalMenuEl) totalMenuEl.textContent = data.menu.totalProductos;
    
    // Ventas
    const totalPedidosEl = document.getElementById('totalPedidos');
    const ventasHoyEl = document.getElementById('ventasHoy');
    const ventasMesEl = document.getElementById('ventasMes');
    
    if (totalPedidosEl) totalPedidosEl.textContent = data.ventas.totalPedidos;
    if (ventasHoyEl) ventasHoyEl.textContent = '$' + data.ventas.ventasHoy.toFixed(2);
    if (ventasMesEl) ventasMesEl.textContent = '$' + data.ventas.ventasMes.toFixed(2);
}

// Cargar productos más vendidos
async function cargarProductosMasVendidos() {
    try {
        const response = await apiRequest('/reportes/productos-vendidos?limite=5');
        
        if (response.success) {
            mostrarProductosMasVendidos(response.data.productos);
        }
    } catch (error) {
        console.error('Error al cargar productos más vendidos:', error);
    }
}

// Mostrar productos más vendidos
function mostrarProductosMasVendidos(productos) {
    const container = document.getElementById('productosVendidos');
    if (!container) return;
    
    if (productos.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay productos vendidos aún</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="productos-vendidos-list">
            ${productos.map((producto, index) => `
                <div class="producto-vendido">
                    <div class="producto-rank">
                        <span class="rank-number">${index + 1}</span>
                    </div>
                    <div class="producto-info">
                        <span class="nombre">${producto.nombre}</span>
                        <span class="cantidad">${producto.cantidadVendida} vendidos</span>
                    </div>
                    <div class="producto-total">
                        <span class="total">$${producto.totalVentas.toFixed(2)}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Cargar stock crítico
async function cargarStockCritico() {
    try {
        const response = await apiRequest('/reportes/stock-critico?limiteStock=10');
        
        if (response.success) {
            mostrarStockCritico(response.data);
        }
    } catch (error) {
        console.error('Error al cargar stock crítico:', error);
    }
}

// Mostrar stock crítico
function mostrarStockCritico(data) {
    const container = document.getElementById('stockCritico');
    if (!container) return;
    
    const { productos, resumen } = data;
    
    if (productos.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay productos con stock crítico</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="stock-critico-summary">
            <div class="stats-summary">
                <div class="stat-item">
                    <span class="stat-label">Total Crítico</span>
                    <span class="stat-value">${resumen.totalProductos}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Agotados</span>
                    <span class="stat-value">${resumen.productosAgotados}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Stock Bajo</span>
                    <span class="stat-value">${resumen.productosStockBajo}</span>
                </div>
            </div>
        </div>
        
        <div class="stock-critico-list">
            ${productos.map(producto => `
                <div class="producto-stock-critico ${producto.estado === 'Agotado' ? 'agotado' : 'stock-bajo'}">
                    <div class="producto-info">
                        <span class="nombre">${producto.nombre}</span>
                        <span class="estado">${producto.estado}</span>
                    </div>
                    <div class="producto-stock">
                        <span class="cantidad">${producto.cantidad} ${producto.unidad}</span>
                        <span class="precio">$${producto.precio.toFixed(2)}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Inicializar reportes cuando se carga la página
function inicializarReportes() {
    // Establecer fechas por defecto (últimos 7 días)
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 7);
    
    document.getElementById('reporteFechaInicio').value = fechaInicio.toISOString().split('T')[0];
    document.getElementById('reporteFechaFin').value = fechaFin.toISOString().split('T')[0];
    
    // Cargar datos iniciales
    cargarDashboard();
    cargarProductosMasVendidos();
    cargarStockCritico();
}

// Actualizar todos los reportes automáticamente
async function actualizarReportes() {
    try {
        console.log('📊 Actualizando reportes automáticamente...');
        
        // Actualizar dashboard y reportes en paralelo
        await Promise.all([
            cargarDashboard(),
            cargarProductosMasVendidos(),
            cargarStockCritico()
        ]);
        
        console.log('✅ Reportes actualizados correctamente');
    } catch (error) {
        console.error('❌ Error al actualizar reportes:', error);
    }
}

// Actualizar estadísticas (función local)
function actualizarEstadisticas() {
    // Inventario
    const totalProductosEl = document.getElementById('totalProductos');
    const stockBajoEl = document.getElementById('stockBajo');
    const valorInventarioEl = document.getElementById('valorInventario');
    
    if (totalProductosEl) totalProductosEl.textContent = productos.length;
    if (stockBajoEl) stockBajoEl.textContent = productos.filter(p => p.cantidad < 10).length;
    if (valorInventarioEl) valorInventarioEl.textContent = 
        '$' + productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0).toFixed(2);
    
    // Menú
    const totalMenuEl = document.getElementById('totalMenu');
    const menuActivosEl = document.getElementById('menuActivos');
    
    if (totalMenuEl) totalMenuEl.textContent = productosMenu.length;
    if (menuActivosEl) menuActivosEl.textContent = productosMenu.filter(p => p.activo).length;
}

// ==================== UTILIDADES ====================

// Mostrar modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    
    // Cargar productos en select de ingredientes si es necesario
    if (modalId === 'agregarProductoMenu') {
        // Solo restaurar botón si NO estamos en modo edición
        const submitBtn = document.querySelector('#agregarProductoMenu .modal-footer .btn-primary');
        if (submitBtn && submitBtn.textContent === 'Agregar al Menú') {
            restaurarBotonAgregarMenu();
        }
        
        const selects = document.querySelectorAll('.ingrediente-select');
        selects.forEach(select => {
            if (select.options.length <= 1) {
                productos.forEach(producto => {
                    const option = document.createElement('option');
                    option.value = producto.id;
                    option.textContent = producto.nombre;
                    select.appendChild(option);
                });
            }
        });
    }
}

// Cerrar modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    
    // Restaurar botón del modal de agregar producto al menú
    if (modalId === 'agregarProductoMenu') {
        restaurarBotonAgregarMenu();
        console.log('Modal cerrado, botón restaurado a modo agregar');
    }
}

// Restaurar botón de agregar al menú
function restaurarBotonAgregarMenu() {
    const submitBtn = document.querySelector('#agregarProductoMenu .modal-footer .btn-primary');
    if (submitBtn) {
        submitBtn.textContent = 'Agregar al Menú';
        submitBtn.onclick = agregarProductoMenu;
        console.log('Botón restaurado a modo agregar');
    }
}

// Mostrar loading
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

// Ocultar loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Mostrar toast
function showToast(message, type = 'info') {
    try {
        const toast = document.getElementById('toast');
        if (!toast) {
            console.error('❌ Elemento toast no encontrado en el DOM');
            // Crear el elemento toast si no existe
            const newToast = document.createElement('div');
            newToast.id = 'toast';
            newToast.className = 'toast';
            document.body.appendChild(newToast);
            console.log('✅ Elemento toast creado dinámicamente');
        }
        
        const toastMessage = document.createElement('div');
        toastMessage.className = `toast-message ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' :
                     type === 'error' ? 'fas fa-exclamation-circle' :
                     type === 'warning' ? 'fas fa-exclamation-triangle' :
                     'fas fa-info-circle';
        
        toastMessage.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        toast.appendChild(toastMessage);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (toastMessage && toastMessage.parentNode) {
                toastMessage.remove();
            }
        }, 5000);
        
        console.log(`✅ Toast mostrado: ${message} (${type})`);
    } catch (error) {
        console.error('❌ Error al mostrar toast:', error);
        // Fallback: alert simple si falla el toast
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            const modalId = modal.id;
            modal.style.display = 'none';
            
            // Restaurar botón si es el modal de agregar producto al menú
            if (modalId === 'agregarProductoMenu') {
                restaurarBotonAgregarMenu();
                console.log('Modal cerrado por clic fuera, botón restaurado');
            }
        }
    });
}

// Prevenir envío de formularios
document.addEventListener('submit', function(e) {
    e.preventDefault();
});

// Función para mostrar cambios en el inventario
function mostrarCambiosInventario(productosAnteriores, productosNuevos) {
    const cambios = [];
    
    productosNuevos.forEach(productoNuevo => {
        const productoAnterior = productosAnteriores.find(p => p.id === productoNuevo.id);
        if (productoAnterior && productoAnterior.cantidad !== productoNuevo.cantidad) {
            const diferencia = productoNuevo.cantidad - productoAnterior.cantidad;
            cambios.push({
                nombre: productoNuevo.nombre,
                cantidadAnterior: formatearCantidad(productoAnterior.cantidad, productoAnterior.unidad),
                cantidadNueva: formatearCantidad(productoNuevo.cantidad, productoNuevo.unidad),
                diferencia: formatearCantidad(Math.abs(diferencia), productoNuevo.unidad),
                unidad: productoNuevo.unidad,
                tipo: diferencia < 0 ? 'reducción' : 'aumento'
            });
        }
    });
    
    if (cambios.length > 0) {
        console.log('Cambios en inventario:', cambios);
        const mensaje = cambios.map(cambio => 
            `${cambio.nombre}: ${cambio.cantidadAnterior} → ${cambio.cantidadNueva} ${cambio.unidad}`
        ).join(', ');
        showToast(`Inventario actualizado: ${mensaje}`, 'info');
    }
}

// Cargar pedidos de hoy (sin sobrescribir la variable global)
async function cargarPedidosHoy() {
    try {
        const data = await apiRequest('/pedidos/hoy');
        
        if (data.success) {
            console.log(`📅 Pedidos de hoy: ${data.total} pedidos`);
            
            // Solo mostrar notificación si es la primera carga
            if (!ultimaCargaCompleta) {
                showToast(`Cargados ${data.total} pedidos de hoy`, 'success');
            }
            
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cargar pedidos de hoy:', error);
        if (!ultimaCargaCompleta) {
            showToast('Error al cargar pedidos de hoy', 'error');
        }
        return [];
    }
}

// Cargar pedidos de esta semana (sin sobrescribir la variable global)
async function cargarPedidosEstaSemana() {
    try {
        const data = await apiRequest('/pedidos/semana');
        
        if (data.success) {
            console.log(`📅 Pedidos de esta semana: ${data.total} pedidos`);
            
            // Solo mostrar notificación si es la primera carga
            if (!ultimaCargaCompleta) {
                showToast(`Cargados ${data.total} pedidos de esta semana`, 'success');
            }
            
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cargar pedidos de esta semana:', error);
        if (!ultimaCargaCompleta) {
            showToast('Error al cargar pedidos de esta semana', 'error');
        }
        return [];
    }
}

// Cargar pedidos de este mes (sin sobrescribir la variable global)
async function cargarPedidosEsteMes() {
    try {
        const data = await apiRequest('/pedidos/mes');
        
        if (data.success) {
            console.log(`📅 Pedidos de este mes: ${data.total} pedidos`);
            
            // Solo mostrar notificación si es la primera carga
            if (!ultimaCargaCompleta) {
                showToast(`Cargados ${data.total} pedidos de este mes`, 'success');
            }
            
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cargar pedidos de este mes:', error);
        if (!ultimaCargaCompleta) {
            showToast('Error al cargar pedidos de este mes', 'error');
        }
        return [];
    }
}

// Cargar pedidos pendientes (optimizado)
async function cargarPedidosPendientes(mostrarNotificacion = false) {
    try {
        const data = await apiRequest('/pedidos/pendientes');
        
        if (data.success) {
            console.log(`⏳ Pedidos pendientes: ${data.total} pedidos`);
            
            // Solo mostrar notificación si se solicita explícitamente
            if (mostrarNotificacion) {
                showToast(`Cargados ${data.total} pedidos pendientes`, 'success');
            }
            
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error al cargar pedidos pendientes:', error);
        if (mostrarNotificacion) {
            showToast('Error al cargar pedidos pendientes', 'error');
        }
        return [];
    }
}

    // Función para actualizar estadísticas del historial usando horario de operación
    function actualizarEstadisticasHistorial() {
        // Usar el sistema de horario de operación personalizado
        const estadisticas = timeUtils.obtenerEstadisticasDiaOperacion(pedidos);
        const infoDebug = timeUtils.obtenerInfoDebug();
        
        console.log(`📅 Horario de Operación - ${infoDebug.fechaActual.local}`);
        console.log(`🕐 Rango: ${infoDebug.rangoOperacion.inicioLocal} - ${infoDebug.rangoOperacion.finLocal}`);
        console.log(`📊 Estadísticas del día de operación: ${estadisticas.totalPedidos} pedidos, $${estadisticas.ventas.toFixed(2)} ventas, ${estadisticas.pendientes} pendientes`);
        
        // Actualizar elementos en la interfaz
        const pedidosHoyElement = document.getElementById('pedidosHoyCount');
        const ventasHoyElement = document.getElementById('ventasHoyTotal');
        const pedidosPendientesElement = document.getElementById('pedidosPendientesCount');
        
        if (pedidosHoyElement) {
            pedidosHoyElement.textContent = estadisticas.totalPedidos;
        }
        
        if (ventasHoyElement) {
            ventasHoyElement.textContent = '$' + estadisticas.ventas.toFixed(2);
        }
        
        if (pedidosPendientesElement) {
            pedidosPendientesElement.textContent = estadisticas.pendientes;
        }
        
        // Mostrar información del horario de operación en consola
        console.log(`🎯 Sistema de Horario de Operación:`);
        console.log(`   📅 Fecha actual: ${infoDebug.fechaActual.local}`);
        console.log(`   🕐 Rango de operación: ${infoDebug.rangoOperacion.inicioLocal} - ${infoDebug.rangoOperacion.finLocal}`);
        console.log(`   🔄 Próximo reinicio: ${infoDebug.proximoReinicio.local}`);
        console.log(`   ⏱️ Tiempo restante: ${infoDebug.proximoReinicio.restante.horas}h ${infoDebug.proximoReinicio.restante.minutos}m`);
    }

    // Función para mostrar estadísticas de pedidos por día usando horario de operación
    function mostrarEstadisticasPedidosPorDia() {
        const estadisticas = timeUtils.obtenerEstadisticasDiaOperacion(pedidos);
        const infoDebug = timeUtils.obtenerInfoDebug();
        
        // Mostrar información en consola
        console.log(`📊 Estadísticas del día de operación - ${infoDebug.fechaActual.local}`);
        console.log(`📦 Pedidos del día de operación: ${estadisticas.totalPedidos}`);
        console.log(`💰 Ventas del día de operación: $${estadisticas.ventas.toFixed(2)}`);
        console.log(`⏳ Pedidos pendientes: ${estadisticas.pendientes}`);
        
        if (estadisticas.totalPedidos > 0) {
            console.log('📋 Lista de pedidos del día de operación:');
            const pedidosDiaOperacion = timeUtils.filtrarPedidosDiaOperacion(pedidos);
            pedidosDiaOperacion.forEach(pedido => {
                const hora = timeUtils.fmtLocal(new Date(pedido.fecha), timeUtils.TZ, {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                console.log(`   🍔 Pedido #${pedido.id} - ${pedido.cliente} - $${pedido.total.toFixed(2)} - ${hora} - ${pedido.estado}`);
            });
        }
        
        // Actualizar información en el dashboard si existe
        const pedidosHoyElement = document.getElementById('pedidosHoy');
        if (pedidosHoyElement) {
            pedidosHoyElement.textContent = estadisticas.totalPedidos;
        }
        
        const ventasHoyElement = document.getElementById('ventasHoy');
        if (ventasHoyElement) {
            ventasHoyElement.textContent = '$' + estadisticas.ventas.toFixed(2);
        }
    }

    // Función para mostrar información del horario de operación
    async function mostrarInfoHorarioOperacion() {
        try {
            const response = await apiRequest('/pedidos/horario-operacion');
            
            if (response.success) {
                const data = response.data;
                console.log('🎯 Información del Horario de Operación:');
                console.log(`   📅 Zona horaria: ${data.zonaHoraria}`);
                console.log(`   🕐 Hora de inicio: ${data.horaInicio}:00`);
                console.log(`   📆 Fecha actual: ${data.fechaActual.local}`);
                console.log(`   ⏰ Rango de operación: ${data.rangoOperacion.inicioLocal} - ${data.rangoOperacion.finLocal}`);
                console.log(`   🔄 Próximo reinicio: ${data.proximoReinicio.local}`);
                console.log(`   ⏱️ Tiempo restante: ${data.proximoReinicio.restante.horas}h ${data.proximoReinicio.restante.minutos}m`);
                
                // Mostrar toast con información
                showToast(`🕐 Horario de Operación: ${data.zonaHoraria} | Próximo reinicio: ${data.proximoReinicio.restante.horas}h ${data.proximoReinicio.restante.minutos}m`, 'info');
            }
        } catch (error) {
            console.error('Error al obtener información del horario de operación:', error);
        }
    }

// Función para mostrar estadísticas de pedidos
function mostrarEstadisticasPedidos() {
    const hoy = new Date();
    const fechaHoy = hoy.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Actualizar información en el dashboard
    const fechaElement = document.getElementById('fechaActual');
    if (fechaElement) {
        fechaElement.textContent = fechaHoy;
    }
    
    // Mostrar información de pedidos recientes
    console.log(`📊 Estadísticas de pedidos - ${fechaHoy}`);
}

// Función para formatear cantidades según la unidad
function formatearCantidad(cantidad, unidad) {
    // Para kilogramos, mostrar 2 decimales
    if (unidad && unidad.toLowerCase().includes('kg')) {
        return cantidad.toFixed(2);
    }
    // Para litros, mostrar 2 decimales
    if (unidad && unidad.toLowerCase().includes('l')) {
        return cantidad.toFixed(2);
    }
    // Para mililitros, mostrar 1 decimal
    if (unidad && unidad.toLowerCase().includes('ml')) {
        return cantidad.toFixed(1);
    }
    // Para piezas y otros, mostrar sin decimales
    if (unidad && (unidad.toLowerCase().includes('pieza') || unidad.toLowerCase().includes('unidad'))) {
        return Math.round(cantidad).toString();
    }
    // Para otros casos, mostrar 2 decimales
    return cantidad.toFixed(2);
}

// ==================== FUNCIONES DE ESTADO DE PEDIDOS ====================

// Marcar pedido como pagado
async function marcarComoPagado(pedidoId) {
    try {
        console.log(`🔄 Marcando pedido #${pedidoId} como pagado...`);
        showLoading();
        
        const response = await apiRequest(`/pedidos/${pedidoId}/pagar`, {
            method: 'PATCH'
        });
        
        console.log('Respuesta del servidor:', response);
        
        if (response.success) {
            showToast(`✅ Pedido #${pedidoId} marcado como pagado`, 'success');
            
            // Forzar recarga completa de datos para evitar inconsistencias
            console.log('🔄 Recargando todos los datos...');
            
            // Limpiar cache local
            pedidos = [];
            
            // Recargar todos los datos en paralelo
            await Promise.all([
                cargarInventario(),
                cargarMenu(),
                cargarHistorial(),
                cargarPedidosHoy(),
                cargarPedidosEstaSemana(),
                cargarPedidosEsteMes(),
                cargarPedidosPendientes()
            ]);
            
            // Actualizar UI y re-renderizar historial
            actualizarEstadisticasHistorial();
            renderizarHistorial(); // Re-renderizar para mostrar cambios visuales
            verificarPedidosPendientes();
            
            console.log('✅ Datos recargados completamente');
        } else {
            throw new Error(response.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error al marcar como pagado:', error);
        showToast(`Error al marcar pedido como pagado: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Cancelar pedido
async function cancelarPedido(pedidoId) {
    if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
        return;
    }
    
    try {
        console.log(`🔄 Cancelando pedido #${pedidoId}...`);
        showLoading();
        
        const response = await apiRequest(`/pedidos/${pedidoId}/cancelar`, {
            method: 'PATCH'
        });
        
        console.log('Respuesta del servidor:', response);
        
        if (response.success) {
            showToast(`❌ Pedido #${pedidoId} cancelado`, 'success');
            
            // Forzar recarga completa de datos para evitar inconsistencias
            console.log('🔄 Recargando todos los datos...');
            
            // Limpiar cache local
            pedidos = [];
            
            // Recargar todos los datos en paralelo
            await Promise.all([
                cargarInventario(),
                cargarMenu(),
                cargarHistorial(),
                cargarPedidosHoy(),
                cargarPedidosEstaSemana(),
                cargarPedidosEsteMes(),
                cargarPedidosPendientes()
            ]);
            
            // Actualizar UI y re-renderizar historial
            actualizarEstadisticasHistorial();
            renderizarHistorial(); // Re-renderizar para mostrar cambios visuales
            verificarPedidosPendientes();
            
            console.log('✅ Datos recargados completamente');
        } else {
            throw new Error(response.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error al cancelar pedido:', error);
        showToast(`Error al cancelar pedido: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Verificar pedidos pendientes y mostrar notificación (optimizado)
async function verificarPedidosPendientes(mostrarNotificacion = false) {
    try {
        const response = await apiRequest('/pedidos/pendientes');
        
        if (response.success) {
            const pedidosPendientes = response.data.length;
            
            // Solo mostrar notificación si:
            // 1. Es la primera vez que se carga (inicio del sistema)
            // 2. Se solicita explícitamente mostrar notificación
            // 3. El conteo cambió desde la última verificación
            if (mostrarNotificacion || !notificacionInicialMostrada || pedidosPendientes !== ultimoConteoPendientes) {
                if (pedidosPendientes > 0) {
                    showToast(`⏳ Tienes ${pedidosPendientes} pedido${pedidosPendientes > 1 ? 's' : ''} pendiente${pedidosPendientes > 1 ? 's' : ''}`, 'warning');
                }
                notificacionInicialMostrada = true;
                ultimoConteoPendientes = pedidosPendientes;
            }
        }
    } catch (error) {
        console.error('Error al verificar pedidos pendientes:', error);
    }
}

// Ver detalles de un pedido
async function verPedido(pedidoId) {
    try {
        showLoading();
        console.log(`🔍 Obteniendo detalles del pedido #${pedidoId}...`);
        
        const response = await apiRequest(`/pedidos/${pedidoId}`);
        
        if (response.success) {
            const pedido = response.data;
            console.log('📋 Datos del pedido recibidos:', pedido);
            
            // Usar fecha local real y corregir zona horaria
            const fechaPedido = new Date(pedido.fecha);
            const ahora = new Date();
            
            // Corregir zona horaria (UTC-6 para México)
            const offset = -6 * 60; // UTC-6 en minutos
            const fechaLocal = new Date(fechaPedido.getTime() + (offset * 60 * 1000));
            
            // Si la fecha es futura, usar la fecha actual
            if (fechaLocal > ahora) {
                console.log(`⚠️ Pedido #${pedidoId} tiene fecha futura, usando fecha actual`);
                fechaLocal.setTime(ahora.getTime());
            }
            
            // Formatear fecha con información detallada
            const fechaFormateada = fechaLocal.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // Información adicional para debugging
            const fechaDia = fechaLocal.toISOString().split('T')[0];
            const fechaActual = ahora.toISOString().split('T')[0];
            const esMismoDia = fechaDia === fechaActual;
            
            console.log(`📅 Fecha original del servidor: ${pedido.fecha}`);
            console.log(`📅 Fecha corregida local: ${fechaFormateada}`);
            console.log(`📅 Día del pedido: ${fechaDia}`);
            console.log(`📅 Día actual: ${fechaActual}`);
            console.log(`📅 ¿Es el mismo día?: ${esMismoDia ? 'Sí' : 'No'}`);
            console.log(`📅 Items del pedido:`, pedido.items);
            
            const numeroFormateado = pedido.numeroFormateado || `#${pedido.id}`;
            
            const contenido = `
                <div class="pedido-detalle">
                    <h3>Pedido ${numeroFormateado}</h3>
                    <div class="detalle-info">
                        <p><strong>Cliente:</strong> ${pedido.cliente}</p>
                        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                        <p><strong>Estado:</strong> 
                            <span class="status-badge ${pedido.estado}">
                                ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                            </span>
                        </p>
                        <p><strong>Total:</strong> $${pedido.total.toFixed(2)}</p>
                    </div>
                    <div class="detalle-items">
                        <h4>Items del Pedido:</h4>
                        <ul>
                            ${pedido.items.map(item => {
                                const nombre = item.nombre || `Producto ID: ${item.productoId}`;
                                const subtotal = (item.cantidad * item.precio).toFixed(2);
                                return `<li>${item.cantidad} x ${nombre} - $${item.precio.toFixed(2)} c/u = $${subtotal}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                </div>
            `;
            
            // Mostrar modal con los detalles
            showModal('Detalles del Pedido', contenido);
        } else {
            showToast('Error al obtener detalles del pedido', 'error');
        }
    } catch (error) {
        console.error('Error al ver pedido:', error);
        showToast('Error al obtener detalles del pedido', 'error');
    } finally {
        hideLoading();
    }
}

// Función auxiliar para mostrar modal con contenido personalizado
function showModal(titulo, contenido) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'detallePedidoModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${titulo}</h3>
                <span class="close" onclick="closeDetalleModal()">&times;</span>
            </div>
            <div class="modal-body">
                ${contenido}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Función para cerrar el modal de detalles
function closeDetalleModal() {
    const modal = document.getElementById('detallePedidoModal');
    if (modal) {
        modal.remove();
    }
}



// Función para forzar sincronización completa de datos
async function forzarSincronizacion() {
    console.log('🔄 Forzando sincronización completa de datos...');
    showLoading();
    
    try {
        // Limpiar todas las variables globales
        productos = [];
        productosMenu = [];
        pedidos = [];
        pedidoActual = {};
        
        // Recargar datos en orden secuencial para evitar conflictos
        console.log('📦 Recargando inventario...');
        await cargarInventario();
        
        console.log('🍔 Recargando menú...');
        await cargarMenu();
        
        console.log('📋 Recargando historial...');
        await cargarHistorial();
        
        console.log('📊 Recargando estadísticas...');
        await Promise.all([
            cargarPedidosHoy(),
            cargarPedidosEstaSemana(),
            cargarPedidosEsteMes(),
            cargarPedidosPendientes()
        ]);
        
        // Actualizar todas las estadísticas (sin notificaciones)
        actualizarEstadisticas();
        actualizarEstadisticasHistorial();
        mostrarEstadisticasPedidosPorDia();
        verificarPedidosPendientes(false);
        
        console.log('✅ Sincronización completa finalizada');
        showToast('Datos sincronizados correctamente', 'success');
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        showToast('Error al sincronizar datos: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// Función para eliminar un pedido específico
async function eliminarPedido(pedidoId) {
    if (!confirm(`¿Estás seguro de que quieres eliminar el pedido #${pedidoId}? Esta acción no se puede deshacer.`)) {
        return;
    }
    
    try {
        console.log(`🗑️ Eliminando pedido #${pedidoId}...`);
        showLoading();
        
        const response = await apiRequest(`/pedidos/${pedidoId}`, {
            method: 'DELETE'
        });
        
        console.log('Respuesta del servidor:', response);
        
        if (response.success) {
            showToast(`🗑️ Pedido #${pedidoId} eliminado exitosamente`, 'success');
            
            // Forzar recarga completa de datos
            console.log('🔄 Recargando todos los datos...');
            await forzarSincronizacion();
            
            console.log('✅ Datos recargados completamente');
        } else {
            throw new Error(response.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error al eliminar pedido:', error);
        showToast(`Error al eliminar pedido: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

// Función para limpiar todos los pedidos (vaciar base de datos)
async function limpiarTodosLosPedidos() {
    if (!confirm('⚠️ ¿Estás SEGURO de que quieres eliminar TODOS los pedidos?\n\nEsta acción:\n• Eliminará TODOS los pedidos de la base de datos\n• No se puede deshacer\n• Limpiará completamente el historial\n\n¿Continuar?')) {
        return;
    }
    
    try {
        console.log('🧹 Iniciando limpieza completa de todos los pedidos...');
        showLoading();
        
        const response = await apiRequest('/pedidos/limpiar/todos', {
            method: 'DELETE'
        });
        
        console.log('Respuesta del servidor:', response);
        
        if (response.success) {
            showToast(`🧹 Se eliminaron ${response.pedidosEliminados} pedidos de la base de datos`, 'success');
            
            // Limpiar variables locales
            productos = [];
            productosMenu = [];
            pedidos = [];
            pedidoActual = {};
            
            // Recargar datos desde cero
            console.log('🔄 Recargando datos limpios...');
            await Promise.all([
                cargarInventario(),
                cargarMenu(),
                cargarHistorial()
            ]);
            
            // Actualizar UI (sin notificaciones)
            actualizarEstadisticas();
            actualizarEstadisticasHistorial();
            verificarPedidosPendientes(false);
            
                    console.log('✅ Base de datos limpiada completamente');
    } else {
        throw new Error(response.message || 'Error desconocido');
    }
} catch (error) {
    console.error('Error al limpiar todos los pedidos:', error);
    showToast(`Error al limpiar pedidos: ${error.message}`, 'error');
} finally {
    hideLoading();
}
}

// ==================== SISTEMA MULTI-DISPOSITIVO ====================

/**
 * Configurar auto-refresh para mantener datos sincronizados entre dispositivos
 */
function configurarAutoRefresh() {
    console.log('🔄 Configurando auto-refresh para multi-dispositivo...');
    
    // Auto-refresh cada 30 segundos para mantener datos actualizados
    setInterval(async () => {
        try {
            console.log('🔄 Auto-refresh: Sincronizando datos...');
            
            // Recargar datos críticos
            await Promise.all([
                cargarInventario(),
                cargarMenu(),
                cargarHistorial()
            ]);
            
            // Actualizar estadísticas (sin notificaciones)
            actualizarEstadisticas();
            actualizarEstadisticasHistorial();
            verificarPedidosPendientes(false);
            
            console.log('✅ Auto-refresh completado');
        } catch (error) {
            console.error('❌ Error en auto-refresh:', error);
        }
    }, 30000); // 30 segundos
    
    // Auto-refresh cada 5 segundos para pedidos pendientes (sin notificaciones)
    setInterval(async () => {
        try {
            await cargarPedidosPendientes(false);
            verificarPedidosPendientes(false);
        } catch (error) {
            console.error('❌ Error en refresh de pedidos pendientes:', error);
        }
    }, 5000); // 5 segundos
    
    console.log('✅ Auto-refresh configurado para multi-dispositivo');
}

/**
 * Verificar si hay cambios en el servidor
 */
async function verificarCambiosServidor() {
    try {
        // Verificar si hay nuevos pedidos o cambios
        const response = await apiRequest('/pedidos/hoy');
        if (response.success && response.total !== pedidos.length) {
            console.log('🔄 Detectados cambios en el servidor, sincronizando...');
            await forzarSincronizacion();
        }
    } catch (error) {
        console.error('❌ Error verificando cambios:', error);
    }
}

// ==================== FUNCIONES DE PRUEBA ====================

/**
 * Función para probar las notificaciones del sistema
 * Útil para verificar que el sistema de toast funcione correctamente
 */
function probarNotificaciones() {
    console.log('🧪 Probando sistema de notificaciones...');
    
    // Probar diferentes tipos de notificaciones
    setTimeout(() => showToast('✅ Notificación de éxito', 'success'), 100);
    setTimeout(() => showToast('⚠️ Notificación de advertencia', 'warning'), 2000);
    setTimeout(() => showToast('❌ Notificación de error', 'error'), 4000);
    setTimeout(() => showToast('ℹ️ Notificación informativa', 'info'), 6000);
    
    console.log('✅ Pruebas de notificaciones iniciadas');
}

/**
 * Función para probar la responsividad móvil
 * Útil para verificar que el sistema funcione bien en dispositivos pequeños
 */
function probarResponsividad() {
    console.log('📱 Probando responsividad móvil...');
    
    // Simular diferentes tamaños de pantalla
    const viewports = [
        { width: 375, height: 667, name: 'iPhone SE' },
        { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
        { width: 768, height: 1024, name: 'iPad' },
        { width: 1920, height: 1080, name: 'Desktop' }
    ];
    
    viewports.forEach((viewport, index) => {
        setTimeout(() => {
            console.log(`📱 Probando viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
            // Aquí podrías agregar lógica para probar diferentes elementos
        }, index * 1000);
    });
    
    console.log('✅ Pruebas de responsividad iniciadas');
}

// Hacer las funciones de prueba disponibles globalmente para testing
window.probarNotificaciones = probarNotificaciones;
window.probarResponsividad = probarResponsividad;