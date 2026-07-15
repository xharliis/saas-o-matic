# SaaS-O-Matic (Dynamic Billing & Subscription Optimizer)

SaaS-O-Matic es una herramienta comercial premium diseñada para simular, optimizar y presupuestar suscripciones SaaS corporativas multidivisa con validación fiscal integrada, cálculo impositivo por país y visualización interactiva.

## Estructura del Proyecto

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
│   ├── schemas/
│   │   ├── customer_schema.py
│   │   └── simulation_schema.py
│   └── tests/
│       ├── test_pricing_service.py
│       └── test_tax_service.py
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

## Características Clave

1.  **Algoritmo de Tarificación Gradual (Tiered Pricing)**:
    *   **0-10 usuarios**: 10 € / usuario.
    *   **11-50 usuarios**: 8 € / usuario.
    *   **>50 usuarios**: 5 € / usuario.
    *   *Ejemplo*: 15 usuarios = (10 × 10) + (5 × 8) = 140 €.
2.  **Validación Fiscal y Restricción de Unicidad**:
    *   Validación estricta y algorítmica del NIF, NIE y CIF si el país seleccionado es España.
    *   Restricción de unicidad para el correo electrónico del cliente a nivel de base de datos y validadores.
3.  **Cálculo Impositivo por País (IVA / Tax / GST)**:
    *   **España**: 21% (IVA).
    *   **Alemania**: 19% (IVA).
    *   **Francia**: 20% (IVA).
    *   **Reino Unido**: 20% (VAT).
    *   **Japón**: 10% (Impuesto al Consumo).
    *   **Canadá**: 5% (GST federal).
    *   **Estados Unidos**: 10% (Tax).
    *   **Otros países**: Exentos (0%).
4.  **Conversión Multidivisa en Tiempo Real**:
    *   Integración directa con una API pública de tipos de cambio (`https://open.er-api.com/v6/latest/EUR`).
    *   Conversión dinámica del presupuesto estimado y de los historiales guardados en divisas (EUR, USD, GBP, JPY, CAD).
5.  **Paginación Eficiente**:
    *   Paginación configurada a 9 elementos por página tanto en backend como en frontend.
    *   Seeding automático de 10 clientes mock con sus respectivas simulaciones para asegurar que la paginación esté habilitada desde el primer arranque.
6.  **Diseño Visual Premium (Light Mode)**:
    *   Interfaz responsive en base a cristal (glassmorphism) adaptada a una paleta de colores claros suaves basada en tonos Slate/Sky de la guía de estilo (`#f8fafc` y `#ffffff`).
    *   Logotipo, avatares corporativos e iconos de acción integrados mediante recursos de imagen PNG localizados en `assets/images/`.

---

## Cómo Levantar el Proyecto (Despliegue)

### Opción A: Mediante Docker Compose

Asegúrate de tener instalado [Docker](https://www.docker.com/) y tener la terminal en la raíz de `saas-o-matic/`. Ejecuta:

```bash
docker compose up -d --build
```

Una vez finalizado el proceso de construcción, el sistema estará disponible en las siguientes direcciones:
*   **Frontend (Panel Dashboard)**: [http://localhost:4200](http://localhost:4200)
*   **Backend (API REST)**: [http://localhost:5000/api](http://localhost:5000/api)
*   **Visualizador de Base de Datos (DB Viewer)**: [http://localhost:8081](http://localhost:8081)

---

### Opción B: Ejecución Local Independiente (Desarrollo)

#### 1. Levantar el Backend (Python)
*   Navega a la carpeta backend: `cd backend`
*   Crea un entorno virtual e instala dependencias:
    ```bash
    python -m venv venv
    # En Windows:
    venv\Scripts\activate
    # En Linux/macOS:
    source venv/bin/activate
    
    pip install -r requirements.txt
    ```
*   Inicia el servidor:
    ```bash
    python app.py
    ```
    El servidor correrá en `http://localhost:5000`.

#### 2. Levantar el Frontend (Angular)
*   Asegúrate de tener [Node.js](https://nodejs.org/) y `pnpm` instalados.
*   Navega a la carpeta frontend: `cd frontend`
*   Instala las dependencias necesarias:
    ```bash
    pnpm install
    ```
*   Inicia el servidor de desarrollo de Angular:
    ```bash
    pnpm start
    ```
    La aplicación se cargará en `http://localhost:4200`.

---

## Verificación y Pruebas Unitarias

Para comprobar el correcto funcionamiento de los algoritmos de validación fiscal, la tarificación por tramos y el buscador de tasas impositivas en el backend:

1. Sitúate en la raíz del proyecto `saas-o-matic/`.
2. Ejecuta el comando:
   ```powershell
   $env:PYTHONPATH="backend"; python -m unittest discover -s backend/tests
   ```
