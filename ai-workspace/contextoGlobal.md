# SaaS-O-Matic - Sistema de Simulación de Suscripciones SaaS

## Descripción General

Herramienta interna para que el equipo comercial pueda simular, optimizar y presupuestar suscripciones SaaS multi-divisa para clientes corporativos.

El sistema permite registrar clientes corporativos, validar sus identificadores fiscales según el país, simular costes de suscripción basados en un modelo de precios por tramos, y visualizar los resultados en múltiples divisas en tiempo real.

---

## Stack Tecnológico

- Backend: Python 3.11+ con Flask
- Base de Datos: SQLite 3 con SQLAlchemy ORM
- Frontend: Angular 17+
- Orquestación: Docker + Docker Compose
- Patrón Arquitectónico: MVC (Modelo-Vista-Controlador)

---

## Arquitectura del Sistema

```text
saas-o-matic/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app.py
│   ├── config.py
│   ├── models/
│   │   ├── database.py
│   │   ├── customer.py
│   │   └── simulation.py
│   ├── controllers/
│   │   ├── customer_controller.py
│   │   └── simulation_controller.py
│   ├── services/
│   │   ├── tax_service.py
│   │   └── pricing_service.py
│   └── schemas/
│       ├── customer_schema.py
│       └── simulation_schema.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── angular.json
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.css
│       ├── assets/
│       │   └── images/
│       └── app/
│           ├── app.component.ts
│           ├── app.component.css
│           ├── app.routes.ts
│           ├── models/
│           │   └── customer.model.ts
│           ├── services/
│           │   ├── api.service.ts
│           │   └── currency.service.ts
│           └── pages/
│               ├── dashboard/
│               │   ├── dashboard.component.ts
│               │   └── dashboard.component.css
│               ├── customer-detail/
│               │   ├── customer-detail.component.ts
│               │   └── customer-detail.component.css
│               └── customer-form/
│                   ├── customer-form.component.ts
│                   └── customer-form.component.css
└── data/
    └── saas-o-matic.db
```

---

## Modelo de Datos

### Tabla: clientes

| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| nombre_empresa | VARCHAR(150) | NOT NULL |
| identificador_fiscal | VARCHAR(50) | NOT NULL, UNIQUE |
| correo | VARCHAR(120) | NOT NULL, UNIQUE |
| pais | VARCHAR(100) | NOT NULL |
| plan | VARCHAR(50) | NOT NULL |

### Tabla: simulaciones

| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| cliente_id | INTEGER | NOT NULL, FK -> clientes(id) |
| usuarios_activos | INTEGER | NOT NULL |
| almacenamiento_gb | INTEGER | NOT NULL |
| llamadas_api | INTEGER | NOT NULL |
| coste_base | FLOAT | NOT NULL |
| coste_impuesto | FLOAT | NOT NULL |
| coste_total | FLOAT | NOT NULL |
| creado_en | DATETIME | DEFAULT CURRENT_TIMESTAMP |

Restricciones adicionales:
- FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE

---

## Lógica de Negocio

### Algoritmo de Tarificación por Tramos (Tiered Pricing)

El coste base mensual se calcula aplicando precios escalonados según el número de usuarios:

| Tramo | Rango de Usuarios | Precio por Usuario |
| :--- | :--- | :--- |
| Tramo 1 | 1 - 10 | 10 EUR |
| Tramo 2 | 11 - 50 | 8 EUR |
| Tramo 3 | 51 en adelante | 5 EUR |

Ejemplo de cálculo para 15 usuarios:
- Tramo 1: 10 usuarios x 10 EUR = 100 EUR
- Tramo 2: 5 usuarios x 8 EUR = 40 EUR
- Total coste base = 140 EUR

### Cálculo de Impuestos por País

| País | Impuesto | Tasa |
| :--- | :--- | :--- |
| España | IVA | 21% |
| Alemania | IVA | 19% |
| Francia | IVA | 20% |
| Reino Unido | VAT | 20% |
| Japón | Impuesto al Consumo | 10% |
| Canadá | GST federal | 5% |
| Estados Unidos | Tax | 10% |
| Otros | Default | 0% |

### Algoritmo de Validación Fiscal para España

**DNI (Persona Física)**
- Formato: 8 dígitos + 1 letra
- Cálculo: módulo 23 del número de 8 dígitos
- Letras de control: TRWAGMYFPDXBNJZSQVHLCKE

**NIE (Extranjeros)**
- Formato: Letra inicial (X, Y, Z) + 7 dígitos + 1 letra de control
- Cálculo: Reemplazar X por 0, Y por 1, Z por 2 y validar como DNI

**CIF (Persona Jurídica)**
- Formato: 1 letra + 7 dígitos + 1 dígito/letra de control
- Tipo de organización: Letra inicial (A, B, C, D, E, F, G, H, J, N, P, Q, R, S, U, V, W)
- Cálculo de dígito de control:
  - Sumar dígitos en posiciones pares
  - Para dígitos en posiciones impares: multiplicar por 2 y sumar dígitos del resultado
  - Sumar ambos resultados
  - Calcular complemento a 10 de la última cifra

---

## API REST Endpoints

### Base URL: http://localhost:5000/api

### Clientes (Customers)

| Método | Endpoint | Descripción | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| POST | /clientes | Crear cliente | { "nombre_empresa": "", "identificador_fiscal": "", "correo": "", "pais": "", "plan": "" } | 201: Cliente creado |
| GET | /clientes | Listar/Buscar clientes | Query params: q (búsqueda por nombre o identificador fiscal) | 200: [Cliente creado] |
| GET | /clientes/{id} | Obtener cliente por ID | - | 200: Cliente obtenido |

### Simulaciones (Simulations)

| Método | Endpoint | Descripción | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| POST | /simulaciones | Crear simulación | { "cliente_id": 1, "usuarios_activos": 15, "almacenamiento_gb": 50, "llamadas_api": 50000 } | 201: Simulación creada |
| GET | /clientes/{id}/simulaciones | Historial de simulaciones | - | 200: [Simulaciones creadas] |

### Utilidades

| Método | Endpoint | Descripción | Response |
| :--- | :--- | :--- | :--- |
| GET | /health | Health check del servicio | 200: { "estado": "saludable", "servicio": "saas-o-matic-backend" } |

---

## Estructura de Respuestas API

### Formato Cliente

```json
{
  "id": 1,
  "nombre_empresa": "Empresa Ejemplo S.L.",
  "identificador_fiscal": "B12345678",
  "correo": "contacto@empresa.com",
  "pais": "España",
  "plan": "basic"
}
```

### Formato Simulación

```json
{
  "id": 1,
  "cliente_id": 1,
  "usuarios_activos": 15,
  "almacenamiento_gb": 50,
  "llamadas_api": 50000,
  "coste_base": 140.0,
  "coste_impuesto": 29.4,
  "coste_total": 169.4,
  "creado_en": "2026-07-14T16:04:31.000Z"
}
```

---

## Frontend - Vistas y Componentes

### Vistas Principales

1. **Dashboard (/)**
   - Barra de búsqueda por nombre de empresa o identificador fiscal
   - Lista de clientes registrados
   - Enlace a detalle de cada cliente

2. **Detalle de Cliente (/customers/:id)**
   - Card con datos del cliente
   - Historial de simulaciones realizadas
   - Botón "Nueva Simulación"

### Integración con API Externa de Divisas

Se utilizará la API gratuita de tipos de cambio:
- URL: `https://open.er-api.com/v6/latest/EUR`
- Divisas a soportar: EUR, USD, GBP, JPY, CHF, CAD, AUD
- Conversión en tiempo real en el frontend

---

## Configuración Docker

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: saas-o-matic-backend
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - ./data:/app/data
    environment:
      - FLASK_APP=app.py
      - FLASK_ENV=development
      - DATABASE_URL=sqlite:///data/saas-o-matic.db
      - CORS_ORIGINS=http://localhost:4200
      - PYTHONUNBUFFERED=1
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: saas-o-matic-frontend
    ports:
      - "4200:80"
    depends_on:
      - backend
    restart: always
```

### Variables de Entorno

**Backend (.env)**
```text
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=sqlite:///../data/saas-o-matic.db
CORS_ORIGINS=http://localhost:4200
LOG_LEVEL=DEBUG
```

**Frontend (environment.ts)**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  currencyApiUrl: 'https://open.er-api.com/v6/latest/EUR',
  cacheTimeout: 3600000
};
```

---

## Guía de Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose instalados

### Inicio con Docker
```bash
# Iniciar servicios con Docker Compose
docker-compose up --build
```
