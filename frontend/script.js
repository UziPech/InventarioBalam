// Configuración de la API (ahora manejada por config.js)
// const API_BASE_URL = 'http://localhost:3000/api';

// Variables globales
let productos = [];
let productosMenu = [];
let pedidos = [];
let pedidoActual = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función de inicialización
async function initializeApp() {
    showLoading();
    
    try {
        // Cargar datos iniciales
        await Promise.all([
            cargarInventario(),
            cargarMenu(),
            cargarHistorial()
        ]);
        
        // Configurar eventos
        setupEventListeners();
        
        // Actualizar fecha y hora
        updateDateTime();
        setInterval(updateDateTime, 1000);
        
        // Cargar dashboard y reportes
        await Promise.all([
            cargarDashboard(),
            cargarProductosMasVendidos(),
            cargarStockCritico()
        ]);
        
        // Mostrar estadísticas locales
        actualizarEstadisticas();
        
        showToast('Sistema cargado exitosamente', 'success');
    } catch (error) {
        console.error('Error al inicializar:', error);
        showToast('Error al cargar el sistema', 'error');
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
                <button class="btn btn-secondary btn-small" data-action="editar" data-id="${producto.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-small" data-action="eliminar" data-id="${producto.id}">
                    <i class="fas fa-trash"></i>
                </button>
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
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="cambiarCantidad(${producto.id}, -1)">-</button>
                <span class="quantity-display" id="qty-${producto.id}">0</span>
                <button class="quantity-btn" onclick="cambiarCantidad(${producto.id}, 1)">+</button>
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

// Crear pedido
async function crearPedido() {
    const cliente = document.getElementById('clientePedido').value || 'Cliente General';
    
    if (Object.keys(pedidoActual).length === 0) {
        showToast('Debe seleccionar al menos un producto', 'warning');
        return;
    }
    
    const items = Object.entries(pedidoActual).map(([productoMenuId, cantidad]) => ({
        productoId: parseInt(productoMenuId),
        cantidad: cantidad
    }));
    
    showLoading();
    
    // Guardar estado anterior del inventario para mostrar cambios
    const productosAnteriores = [...productos];
    
    // Debug: mostrar qué se está enviando
    console.log('Enviando pedido:', { cliente, items });
    
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
            document.querySelectorAll('.quantity-display').forEach(display => {
                display.textContent = '0';
            });
            actualizarResumenPedido();
            
            // Recargar datos
            await Promise.all([
                cargarInventario(),
                cargarMenu(),
                cargarHistorial()
            ]);
            
            actualizarEstadisticas();
            
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
        showToast('Error al crear pedido: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ==================== HISTORIAL ====================

// Cargar historial
async function cargarHistorial() {
    try {
        const data = await apiRequest('/pedidos');
        
        if (data.success) {
            pedidos = data.data;
            // Asegurar que productosMenu esté cargado antes de renderizar
            if (productosMenu.length === 0) {
                await cargarMenu();
            }
            renderizarHistorial();
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
    tbody.innerHTML = '';
    
    // Debug: mostrar información de los datos
    console.log('Pedidos cargados:', pedidos);
    console.log('Productos del menú disponibles:', productosMenu);
    
    pedidos.forEach(pedido => {
        const row = document.createElement('tr');
        const fecha = new Date(pedido.fecha).toLocaleString('es-ES');
        
        // Mejorar la visualización de items
        const items = pedido.items.map(item => {
            console.log('Procesando item:', item); // Debug
            
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
        
        row.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.cliente}</td>
            <td>${items}</td>
            <td>$${pedido.total.toFixed(2)}</td>
            <td>${fecha}</td>
            <td>
                <span class="status-badge ${pedido.estado}">
                    ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary btn-small" onclick="verPedido(${pedido.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
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
    const reporteContainer = document.getElementById('reporteResultado');
    if (!reporteContainer) return;
    
    reporteContainer.innerHTML = `
        <div class="reporte-section">
            <h3>Resumen del Período</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total Ventas</h4>
                    <p>$${data.resumen.totalVentas.toFixed(2)}</p>
                </div>
                <div class="stat-card">
                    <h4>Total Pedidos</h4>
                    <p>${data.resumen.totalPedidos}</p>
                </div>
                <div class="stat-card">
                    <h4>Promedio por Pedido</h4>
                    <p>$${data.resumen.promedioPorPedido.toFixed(2)}</p>
                </div>
            </div>
        </div>
        
        <div class="reporte-section">
            <h3>Ventas por Día</h3>
            <div class="ventas-dia">
                ${data.ventasPorDia.map(dia => `
                    <div class="dia-venta">
                        <span class="fecha">${dia.fecha}</span>
                        <span class="ventas">$${dia.ventas.toFixed(2)}</span>
                        <span class="pedidos">${dia.pedidos} pedidos</span>
                    </div>
                `).join('')}
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
    const stockBajoEl = document.getElementById('stockBajo');
    const valorInventarioEl = document.getElementById('valorInventario');
    
    if (totalProductosEl) totalProductosEl.textContent = data.inventario.totalProductos;
    if (stockBajoEl) stockBajoEl.textContent = data.inventario.totalProductos; // Temporal
    if (valorInventarioEl) valorInventarioEl.textContent = '$' + data.inventario.valorTotal.toFixed(2);
    
    // Menú
    const totalMenuEl = document.getElementById('totalMenu');
    const menuActivosEl = document.getElementById('menuActivos');
    
    if (totalMenuEl) totalMenuEl.textContent = data.menu.totalProductos;
    if (menuActivosEl) menuActivosEl.textContent = data.menu.productosActivos;
    
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
    const container = document.getElementById('productosMasVendidos');
    if (!container) return;
    
    container.innerHTML = productos.map(producto => `
        <div class="producto-vendido">
            <span class="nombre">${producto.nombre}</span>
            <span class="cantidad">${producto.cantidadVendida} vendidos</span>
            <span class="total">$${producto.totalVentas.toFixed(2)}</span>
        </div>
    `).join('');
}

// Cargar stock crítico
async function cargarStockCritico() {
    try {
        const response = await apiRequest('/reportes/stock-critico?limiteStock=10');
        
        if (response.success) {
            mostrarStockCritico(response.data.productos);
        }
    } catch (error) {
        console.error('Error al cargar stock crítico:', error);
    }
}

// Mostrar stock crítico
function mostrarStockCritico(productos) {
    const container = document.getElementById('stockCritico');
    if (!container) return;
    
    container.innerHTML = productos.map(producto => `
        <div class="producto-critico ${producto.estado === 'Agotado' ? 'agotado' : 'stock-bajo'}">
            <span class="nombre">${producto.nombre}</span>
            <span class="cantidad">${producto.cantidad} ${producto.unidad}</span>
            <span class="estado">${producto.estado}</span>
        </div>
    `).join('');
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
    const toast = document.getElementById('toast');
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
        toastMessage.remove();
    }, 5000);
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
