# Assets - Inventario Balam

Esta carpeta contiene los recursos visuales del sistema de inventario.

## 📁 Estructura de Carpetas

```
assets/
├── logo/           # Logo principal del sistema
├── icons/          # Iconos personalizados (si los hay)
└── images/         # Otras imágenes del sistema
```

## 🎨 Logo del Sistema

### Ubicación
Coloca el archivo del logo en: `frontend/assets/logo/`

### Especificaciones Recomendadas
- **Formato**: SVG (preferido) o PNG con fondo transparente
- **Tamaño**: 32x32px a 64x64px para el header
- **Estilo**: Que combine con la paleta de colores del sistema
  - Fondo oscuro: `#0e1525`
  - Acento menta: `#2ee4c6`
  - Texto: `#e6edf3`

### Cómo Usar el Logo

1. **Coloca el archivo** en `frontend/assets/logo/`
2. **Actualiza el HTML** en `frontend/index.html`:

```html
<!-- Reemplaza el ícono actual con tu logo -->
<div class="logo">
    <img src="assets/logo/tu-logo.svg" alt="Inventario Balam" class="logo-img">
    <h1>Inventario Balam</h1>
</div>
```

3. **Ajusta el CSS** en `frontend/styles.css` si es necesario:

```css
.logo-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
}
```

## 📋 Formatos Soportados

- **SVG**: Escalable, mejor calidad
- **PNG**: Con fondo transparente
- **JPG**: Solo si no hay alternativa
- **WebP**: Moderno y eficiente

## 🎯 Consejos de Diseño

- Mantén el logo simple y legible
- Usa colores que contrasten bien con el fondo oscuro
- Considera versiones para diferentes tamaños
- Asegúrate de que se vea bien en 32x32px

## 📝 Notas

- El logo actual usa un ícono de Font Awesome (`fa-store`)
- Puedes mantener el ícono como fallback mientras implementas tu logo
- El sistema está optimizado para logos cuadrados o circulares
