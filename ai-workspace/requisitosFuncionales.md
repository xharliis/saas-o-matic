# Requisitos Funcionales - SaaS-O-Matic

## RF-01: Registro de Clientes Corporativos

**Descripcion:** El sistema debe permitir registrar nuevos clientes corporativos con su informacion fiscal y de contacto.

**Detalles:**
- Campos obligatorios: nombre de empresa, identificador fiscal, email, pais
- Campo opcional: plan elegido (default: 'basic')
- El email debe tener formato valido
- El identificador fiscal debe ser validado algoritmicamente segun el pais
- No se permite duplicar el par tax_id + country

**Validaciones:**
- RF-01.1: El nombre de empresa no puede estar vacio
- RF-01.2: El email debe contener @ y dominio valido
- RF-01.3: El pais debe estar en la lista de paises soportados
- RF-01.4: Si el pais es Espana, aplicar validacion DNI/CIF/NIF

---

## RF-02: Validacion Algoritmica de Identificador Fiscal

**Descripcion:** El sistema debe validar el identificador fiscal segun las reglas oficiales del pais seleccionado.

**Reglas para Espana:**
- RF-02.1: DNI estandar: 8 digitos + letra modulo 23 (TRWAGMYFPDXBNJZSQVHLCKE)
- RF-02.2: CIF empresarial: formato letra + 7 digitos + digito control calculado
- RF-02.3: NIF especial: prefijos K, L, M, X, Y, Z con validacion adaptada
- RF-02.4: Rechazar identificadores que no cumplan el algoritmo oficial

**Reglas para otros paises:**
- RF-02.5: Validacion basica de formato (longitud y caracteres permitidos)
- RF-02.6: Permitir numeros de VAT intracomunitario (prefijo de pais)

---

## RF-03: Busqueda de Clientes

**Descripcion:** El sistema debe permitir buscar clientes registrados por diferentes criterios.

**Detalles:**
- RF-03.1: Busqueda por nombre de empresa (coincidencia parcial, case insensitive)
- RF-03.2: Busqueda por identificador fiscal (coincidencia exacta o parcial)
- RF-03.3: Los resultados deben mostrarse paginados
- RF-03.4: Sin termino de busqueda, mostrar todos los clientes
- RF-03.5: La busqueda debe responder en menos de 1 segundo

---

## RF-04: Visualizacion de Cliente

**Descripcion:** El sistema debe mostrar toda la informacion de un cliente especifico.

**Detalles:**
- RF-04.1: Mostrar todos los datos del cliente en formato card
- RF-04.2: Incluir fecha de creacion y ultima actualizacion
- RF-04.3: Mostrar el historial completo de simulaciones asociadas
- RF-04.4: Permitir navegar a crear nueva simulacion desde esta vista
- RF-04.5: Permitir editar datos del cliente

---

## RF-05: Edicion de Clientes

**Descripcion:** El sistema debe permitir modificar los datos de un cliente existente.

**Detalles:**
- RF-05.1: Todos los campos excepto id pueden ser modificados
- RF-05.2: Si se cambia el pais, revalidar el identificador fiscal
- RF-05.3: Si se cambia el tax_id, verificar que no exista duplicado para ese pais
- RF-05.4: Mantener historial de simulaciones tras la edicion

---

## RF-06: Eliminacion de Clientes

**Descripcion:** El sistema debe permitir eliminar un cliente y todos sus datos asociados.

**Detalles:**
- RF-06.1: Eliminacion en cascada de todas las simulaciones del cliente
- RF-06.2: Solicitar confirmacion antes de eliminar
- RF-06.3: No se puede recuperar un cliente eliminado

---

## RF-07: Creacion de Simulaciones

**Descripcion:** El sistema debe permitir crear simulaciones de coste para un cliente.

**Detalles:**
- RF-07.1: Parametros obligatorios: customer_id, active_users
- RF-07.2: Parametros opcionales: storage_gb, api_calls_estimated
- RF-07.3: active_users debe ser un numero entero mayor que 0
- RF-07.4: La simulacion debe persistirse en base de datos

---

## RF-08: Calculo de Precios por Tramos (Tiered Pricing)

**Descripcion:** El sistema debe calcular el coste base aplicando precios escalonados por tramos de usuarios.

**Detalles:**
- RF-08.1: Tramo 1 (1-10 usuarios): 10 EUR por usuario
- RF-08.2: Tramo 2 (11-50 usuarios): 8 EUR por usuario
- RF-08.3: Tramo 3 (51+ usuarios): 5 EUR por usuario
- RF-08.4: El calculo es acumulativo, no por tarifa plana

**Ejemplos de calculo:**
- 5 usuarios = 5 x 10 = 50 EUR
- 15 usuarios = (10 x 10) + (5 x 8) = 140 EUR
- 60 usuarios = (10 x 10) + (40 x 8) + (10 x 5) = 470 EUR

---

## RF-09: Calculo de Impuestos por Pais

**Descripcion:** El sistema debe aplicar el impuesto correspondiente al pais del cliente.

**Detalles:**
- RF-09.1: Espana: IVA 21%
- RF-09.2: Reino Unido: VAT 20%
- RF-09.3: Alemania: IVA 19%
- RF-09.4: Francia: IVA 20%
- RF-09.5: Italia: IVA 22%
- RF-09.6: Resto de paises: 0% por defecto
- RF-09.7: El impuesto se calcula sobre el coste base

**Ejemplo:**
- Coste base: 140 EUR, Cliente en Espana
- Impuesto: 140 x 0.21 = 29.40 EUR
- Total: 140 + 29.40 = 169.40 EUR

---

## RF-10: Previsualizacion de Costes sin Persistencia

**Descripcion:** El sistema debe permitir calcular costes en tiempo real sin guardar en base de datos.

**Detalles:**
- RF-10.1: Endpoint de preview que recibe parametros por query string
- RF-10.2: Devuelve desglose completo: coste base, impuesto, total
- RF-10.3: Util para el simulador interactivo del frontend
- RF-10.4: Respuesta inmediata sin latencia de escritura en BD

---

## RF-11: Historial de Simulaciones

**Descripcion:** El sistema debe permitir consultar todas las simulaciones realizadas para un cliente.

**Detalles:**
- RF-11.1: Listar simulaciones ordenadas por fecha (mas reciente primero)
- RF-11.2: Mostrar fecha, numero de usuarios y coste total
- RF-11.3: Permitir ver detalle de cada simulacion
- RF-11.4: Paginacion si hay mas de 10 simulaciones

---

## RF-12: Simulador Interactivo en Frontend

**Descripcion:** El frontend debe proporcionar controles dinamicos para ajustar parametros y ver costes en tiempo real.

**Detalles:**
- RF-12.1: Slider para seleccionar numero de usuarios (rango 1-500)
- RF-12.2: Campo numerico para almacenamiento en GB
- RF-12.3: Campo numerico para llamadas API estimadas
- RF-12.4: Calculo y visualizacion instantanea del coste
- RF-12.5: Desglose visible: coste base, impuestos, total
- RF-12.6: El calculo en tiempo real usa el endpoint de preview

---

## RF-13: Conversion de Divisas

**Descripcion:** El sistema debe permitir visualizar los costes en diferentes divisas.

**Detalles:**
- RF-13.1: Selector de divisa en el frontend
- RF-13.2: Divisas soportadas: EUR, USD, GBP, JPY, CHF, CAD, AUD
- RF-13.3: Tasas de cambio obtenidas de API externa (open.er-api.com)
- RF-13.4: Cache de tasas de cambio durante 1 hora
- RF-13.5: Conversion en tiempo real al cambiar de divisa
- RF-13.6: Mostrar simbolo de divisa correcto junto al importe
- RF-13.7: Redondear a 2 decimales

---

## RF-14: Visualizacion de Costes en Multiples Divisas

**Descripcion:** Los costes guardados en EUR deben poder visualizarse en la divisa seleccionada.

**Detalles:**
- RF-14.1: Los costes se almacenan siempre en EUR
- RF-14.2: La conversion se aplica en el frontend al mostrar
- RF-14.3: Mostrar tanto el valor original en EUR como el convertido
- RF-14.4: Indicar la tasa de cambio aplicada
- RF-14.5: Actualizar todos los costes en pantalla al cambiar divisa

---

## RF-15: Dashboard Principal

**Descripcion:** El sistema debe tener una pagina principal con acceso a todas las funcionalidades.

**Detalles:**
- RF-15.1: Barra de busqueda de clientes
- RF-15.2: Listado de clientes con datos principales
- RF-15.3: Boton para crear nuevo cliente
- RF-15.4: Enlace a detalle de cada cliente
- RF-15.5: Indicador de numero total de clientes registrados

---

## RF-16: Manejo de Errores y Validaciones

**Descripcion:** El sistema debe gestionar errores de forma clara y util para el usuario.

**Detalles:**
- RF-16.1: Mensajes de error descriptivos en el idioma de la interfaz
- RF-16.2: Validacion de campos en frontend antes de enviar al backend
- RF-16.3: Codigos HTTP semanticamente correctos
- RF-16.4: Errores de validacion fiscal con mensaje especifico
- RF-16.5: Errores de duplicidad con mensaje claro
- RF-16.6: Notificaciones visuales para operaciones exitosas

---

## RF-17: Estados de Carga y Vacio

**Descripcion:** El sistema debe manejar adecuadamente los estados de carga y ausencia de datos.

**Detalles:**
- RF-17.1: Mostrar skeleton screens durante cargas
- RF-17.2: Mostrar mensaje "No se encontraron resultados" en busquedas vacias
- RF-17.3: Mostrar mensaje "No hay simulaciones" en cliente sin historial
- RF-17.4: Indicador de carga en botones al enviar formularios
- RF-17.5: Deshabilitar controles durante operaciones asincronas

---

## RF-18: Persistencia de Datos

**Descripcion:** Todos los datos deben persistirse correctamente en base de datos SQLite.

**Detalles:**
- RF-18.1: Clientes persisten con todos sus campos
- RF-18.2: Simulaciones persisten con costes calculados
- RF-18.3: Los costes se almacenan en EUR siempre
- RF-18.4: Fechas de creacion y actualizacion automaticas
- RF-18.5: Integridad referencial entre clientes y simulaciones

---

## RF-19: Paginacion de Resultados

**Descripcion:** Las listas de clientes y simulaciones deben estar paginadas.

**Detalles:**
- RF-19.1: Parametros de pagina y elementos por pagina
- RF-19.2: Metadata con total de elementos y paginas disponibles
- RF-19.3: Paginacion en frontend con navegacion entre paginas
- RF-19.4: 10 elementos por pagina por defecto

---

## RF-20: Health Check del Sistema

**Descripcion:** El sistema debe proporcionar un endpoint para verificar su estado.

**Detalles:**
- RF-20.1: Endpoint GET /health
- RF-20.2: Respuesta con estado del servicio
- RF-20.3: Verificar conexion a base de datos
- RF-20.4: Util para monitoreo y Docker healthcheck

---

## Resumen de Requisitos por Prioridad

### Prioridad Alta (MVP)
- RF-01: Registro de clientes
- RF-02: Validacion fiscal España
- RF-07: Creacion de simulaciones
- RF-08: Calculo de precios por tramos
- RF-09: Calculo de impuestos
- RF-12: Simulador interactivo
- RF-13: Conversion de divisas

### Prioridad Media
- RF-03: Busqueda de clientes
- RF-04: Visualizacion de cliente
- RF-05: Edicion de clientes
- RF-10: Previsualizacion de costes
- RF-11: Historial de simulaciones
- RF-15: Dashboard principal

### Prioridad Baja
- RF-06: Eliminacion de clientes
- RF-16: Manejo de errores avanzado
- RF-17: Estados de carga
- RF-18: Persistencia (implicita en otros)
- RF-19: Paginacion
- RF-20: Health check