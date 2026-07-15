# Guía de Estilos - Sistema de Diseño

## Visión General

Sistema de diseño basado en una interfaz limpia y moderna con tonos claros. Esta guía documenta los patrones visuales y estructurales que pueden ser reutilizados en cualquier tipo de aplicación.

---

## 1. Filosofía de Diseño

### Principios Fundamentales

- **Claridad visual**: Jerarquía clara mediante contraste de pesos tipográficos
- **Espacio negativo**: Amplio uso de padding para respirar
- **Consistencia**: Sistema de espaciado y bordes unificado
- **Adaptabilidad**: Diseño responsivo

---

## 2. Paleta de Colores

### Colores Primarios

```css
--primary: #2563eb      /* Azul principal */
--primary-dark: #1e40af /* Azul oscuro para estados hover */
--primary-light: #3b82f6 /* Azul claro para degradados */
```

### Colores Secundarios y de Apoyo

```css
--secondary: #10b981    /* Verde para acciones secundarias */
--background: #f8fafc   /* Fondo general */
--surface: #ffffff      /* Superficies de contenido */
```

### Colores de Texto

```css
--text-primary: #0f172a /* Texto principal - oscuro */
--text-secondary: #64748b /* Texto secundario - gris */
```

### Bordes y Sombras

```css
--border: #e2e8f0      /* Color de bordes */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

---

## 3. Tipografía

### Fuente Base

- **Familia**: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Tamaño base**: 16px (por defecto en navegadores)
- **Escala**: Relativa con rem para accesibilidad

### Jerarquía Tipográfica

| Elemento | Tamaño | Peso | Color |
|---|---|---|---|
| Títulos de sección | 0.875rem | 700 | --text-secondary |
| Texto principal | 1rem | 400 | --text-primary |
| Texto secundario | 0.875rem | 500 | --text-secondary |
| Texto pequeño | 0.8rem | 400 | --text-secondary |
| Badges/Etiquetas | 0.8rem | 700 | Variable |

### Interlineado

- **General**: 1.6
- **Títulos**: 1.2 (implícito)

---

## 4. Sistema de Espaciado

### Unidad Base

- **Escala**: Múltiplos de 0.25rem (4px)
- **Espaciado interno (padding)**: 0.5rem, 0.75rem, 1rem, 1.25rem, 1.5rem
- **Espaciado externo (margin)**: Misma escala

### Patrones Comunes

```css
/* Contenedores de sección */
padding: 1.5rem

/* Elementos de formulario */
padding: 0.875rem 1rem

/* Botones */
padding: 0.75rem 1rem

/* Badges */
padding: 0.875rem 1rem
```

---

## 5. Bordes y Radios

### Radios de Borde

```css
--radius: 12px  /* Radio estándar para contenedores */
/* Radios específicos: */
border-radius: 8px   /* Inputs, botones */
border-radius: 6px   /* Botones pequeños, iconos */
border-radius: 4px   /* Elementos muy pequeños */
border-radius: 30px  /* Elementos tipo píldora */
border-radius: 24px  /* Paneles móviles */
```

---

## 6. Sombras

### Sistema de Elevación

- **Sombra sutil**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` - Para elementos de bajo relieve
- **Sombra media**: `0 4px 6px -1px rgb(0 0 0 / 0.1)` - Para elementos flotantes
- **Sombra fuerte**: `0 10px 15px -3px rgb(0 0 0 / 0.1)` - Para modales o paneles

---

## 7. Componentes Base

### Contenedores

Todos los contenedores comparten:

- Fondo blanco (--surface)
- Borde sutil (1px solid var(--border))
- Bordes redondeados (--radius)

### Inputs

```css
padding: 0.875rem 1rem
border: 2px solid var(--border)
border-radius: 8px
background: var(--surface)
transición: all 0.2s ease
/* Estado focus: */
border-color: var(--primary)
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
```

### Botones

**Botón primario:**

- Degradado: `linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)`
- Texto blanco
- Sombra sutil
- Hover: `transform: translateY(-1px)`

**Botón secundario:**

- Fondo: `var(--background)`
- Borde: `1px solid var(--border)`
- Hover: `background: var(--border)`

**Botón icono:**

- Fondo transparente
- Borde sutil
- Hover: borde primario + color primario

---

## 8. Layout y Estructura

### Grid Base

```css
display: grid;
grid-template-columns: 380px 1fr;
height: 75vh;  /* Altura controlada */
overflow: hidden;
```

### Cards y Paneles

- Fondo blanco
- Sombras sutiles
- Bordes redondeados
- Contenido con padding consistente

### Badges y Etiquetas

```css
background: var(--background);
padding: 0.875rem 1rem;
border-radius: 8px;
border: 1px solid var(--border);
```

---

## 9. Estados y Feedback

### Estados Comunes

- **Hover**: Cambios sutiles de color, elevación ligera
- **Focus**: Anillo de enfoque en color primario
- **Active**: Sin transformaciones agresivas
- **Disabled**: Opacidad y cursor not-allowed (implícito)

### Transiciones

- **Duración**: 0.2s
- **Función**: ease / ease-in-out
- **Propiedades**: all, transform, border-color, box-shadow

---

## 10. Responsive Design

### Breakpoints

**Tablet (>1024px):**

- Layout pasa a columna única
- Altura automática
- Mapa con altura fija

**Móvil (>768px):**

- Panel inferior tipo "Bottom Sheet"
- Mapa como fondo absoluto
- Elementos optimizados para espacio
- Píldora de arrastre visible

### Adaptaciones Móviles

- El panel lateral se convierte en hoja inferior
- Ocultación de elementos decorativos
- Leyenda reposicionada
- Hint de mapa más pequeño

---

## 11. Variables CSS

### Personalización

Las variables CSS permiten personalización rápida:

```css
:root {
  --primary: #2563eb;
  --background: #f8fafc;
  --surface: #ffffff;
  /* Todas las variables son fácilmente sobreescribibles */
}
```

---

## 12. Buenas Prácticas

### Accesibilidad

- Contraste WCAG 2.1 AA
- Tamaños en rem
- Estados :focus claramente visibles

### Rendimiento

- Uso de `backdrop-filter: blur()` con moderación
- Transiciones simples
- Optimización de sombras

### Mantenimiento

- Variables CSS para consistencia
- Nomenclatura semántica de clases
- Estructura modular

---

## 13. Ejemplo de Uso

Para crear un nuevo componente:

**Base del componente:**

```html
<div class="mi-componente">
  <h3 class="titulo-seccion">Título</h3>
  <div class="contenido">
    <!-- Contenido -->
  </div>
</div>
```

**Estilos mínimos necesarios:**

```css
.mi-componente {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.mi-componente .titulo-seccion {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}
```

---

## 14. Notas de Implementación

### Clases Útiles Globales

- `.info`: Grid de dos columnas para datos
- `.badge`: Estilo de tarjeta pequeña
- `.button-group`: Contenedor de botones en grid
- `.input-header`: Contenedor de etiquetas con alineación

### Animaciones

- `fadeIn`: Animación de entrada suave (0.2s)
- Aplicar a elementos que aparecen dinámicamente

---

## Referencias

- **Colores**: Tailwind CSS palette adaptada
- **Tipografía**: Inter (Google Fonts)
- **Inspiración**: Diseño moderno de aplicaciones SaaS
- **Accesibilidad**: WCAG 2.1 Level AA