# Historial de Decisiones Técnicas y Resultados

Este documento resume de manera técnica las discusiones, decisiones de arquitectura y diseño, y los resultados finales obtenidos durante el desarrollo de la aplicación SaaS-O-Matic.

---

## 1. Requerimientos Funcionales Incorporados

* **Restricción de Unicidad en Correo Electrónico**: Se modificó la base de datos para que la columna `correo` en la tabla `clientes` sea única (`unique=True`). Se agregaron validaciones tanto en el esquema de Pydantic (`ClienteBase`) como en los endpoints del controlador REST del backend (`crear_cliente` y `actualizar_cliente`) para retornar un código de estado HTTP 409 (Conflict) en caso de duplicados.
* **Cálculo de Impuestos por País**: Se parametrizó el cálculo impositivo de las simulaciones basándose en una estructura por países y tasas específicas:
  * España: 21% (IVA)
  * Alemania: 19% (IVA)
  * Francia: 20% (IVA)
  * Reino Unido: 20% (VAT)
  * Japón: 10% (Impuesto al Consumo)
  * Canadá: 5% (GST federal)
  * Estados Unidos: 10% (Tax)
  * Otros países: Exentos (0%)
* **Paginación Inicial Habilitada**: Se modificó el número de elementos devueltos por página a 9 (`por_pagina = 9` / `porPagina = 9`) para encajar en cuadrículas de 3x3. Asimismo, se re-sembró la base de datos para incluir 10 clientes mock en lugar de 4 si el conteo es menor a 10, asegurando la existencia de la paginación desde el primer arranque.

---

## 2. Refactorizaciones y Limpieza del Backend

* **Remoción de Configuración de Sesión**: Se eliminó la propiedad `SECRET_KEY` de `config.py` al no ser requerida por la API REST stateless de Flask.
* **Depuración de Servicios y Dependencias**:
  * Se eliminó el archivo `currency_service.py` al estar en desuso en el servidor (la lógica de divisas corre 100% en el cliente de Angular).
  * Se retiró su importación en `backend/services/__init__.py`.
  * Se removió la librería `requests` de `requirements.txt` dado que no existen otros consumos HTTP salientes en el backend.

---

## 3. Refactorizaciones y Mantenibilidad del Frontend

* **Extracción de Código CSS**: Se extrajeron más de 700 líneas de estilos inline de los decoradores `@Component` de Angular hacia archivos externos:
  * `DashboardComponent` -> `dashboard.component.css`
  * `CustomerDetailComponent` -> `customer-detail.component.css`
  * `CustomerFormComponent` -> `customer-form.component.css`
  * `AppComponent` -> `app.component.css`
* **Limpieza de Código Muerto**: Se eliminó el método redundante `alCambiarDivisa()` en `CustomerDetailComponent` y su enlace de eventos `(change)` en la plantilla, delegando la reactividad en el enlace bidireccional de Angular `[(ngModel)]`.
* **Corrección de Reactividad en Simulador (RxJS)**: Se detectó que al arrastrar la barra de usuarios activos no se recalculaban los importes en tiempo real tras la primera emisión. Esto ocurría porque el subject emite un valor `void` (interpretado como `undefined`), y el operador `distinctUntilChanged()` descartaba de manera consecutiva todas las llamadas duplicadas (`undefined === undefined`). Se eliminó dicho operador de la tubería, solventando la reactividad inmediata del simulador.
* **Optimización de Estructuras Condicionales**: Se simplificaron los métodos de cálculo impositivo a través de mapas y diccionarios clave-valor en Python (`tax_service.py`) y TypeScript (`customer-detail.component.ts`) en sustitución de condicionales en cadena.

---

## 4. Decisiones de Interfaz y Diseño Visual

* **Transición a Tema Claro (Light Mode)**: Se sustituyó el tema oscuro original por una estética clara basada en la paleta Slate/Sky de la guía de estilos. Los fondos generales se mapearon a `#f8fafc`, las tarjetas y inputs a `#ffffff` con sombras suaves de elevación, y el logotipo y botones se suavizaron para mitigar el contraste excesivo del azul primario.
* **Simplificación de Capas**: Se eliminó la tarjeta envolvente principal en la vista del panel (`list-card`), permitiendo que el buscador y el grid de clientes se muestren directamente sobre el fondo limpio.
* **Logos e Iconos Locales**: Se reemplazó el uso de la tipografía Material Icons por activos PNG locales integrados dentro del directorio estándar de Angular `src/assets/images/` (`servidor.png`, `empresa.png`, `simulation.png`, `editar.png`, `guardar.png`, `borrar.png`).
* **Ajuste en Costes**: Se removió el degradado de color en la fuente del precio proyectado (`.large-price`), dejándolo con un color azul claro sólido (`#0ea5e9`).

---

## 5. Resultados de Verificación y Compilación

* **Pruebas Backend**: Todas las pruebas unitarias del backend en `backend/tests/` pasan satisfactoriamente de forma local y en contenedores (6 pruebas en 0.001s).
* **Compilación Angular**: El empaquetado de producción de Angular compila con éxito localizando de forma óptima los recursos estáticos.
* **Orquestación en Contenedores**: El despliegue a través de Docker Compose levanta y recrea los servicios frontend y backend aplicando correctamente los cambios de configuración y construyendo la imagen del backend reducida en dependencias.
