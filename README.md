# SaaS-O-Matic (Dynamic Billing & Subscription Optimizer)

SaaS-O-Matic es una herramienta comercial premium diseñada para simular, optimizar y presupuestar suscripciones SaaS corporativas multidivisa con validación fiscal integrada y visualización interactiva.

## Estructura del Proyecto

```text
saas-o-matic/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── customer.py
│   │   └── simulation.py
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── customer_controller.py
│   │   └── simulation_controller.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── tax_validator.py
│   │   ├── pricing_service.py
│   │   └── currency_service.py
│   └── schemas/
│       ├── __init__.py
│       ├── customer_schema.py
│       └── simulation_schema.py
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── angular.json
│   └── src/
│       ├── app/
│       │   ├── models/
│       │   │   ├── customer.model.ts
│       │   │   ├── simulation.model.ts
│       │   │   └── currency.model.ts
│       │   ├── services/
│       │   │   ├── api.service.ts
│       │   │   ├── currency.service.ts
│       │   │   └── pricing.service.ts
│       │   ├── components/
│       │   │   ├── customer-card/
│       │   │   ├── simulation-form/
│       │   │   ├── price-display/
│       │   │   └── currency-selector/
│       │   └── pages/
│       │       ├── dashboard/
│       │       ├── customer-detail/
│       │       └── new-simulation/
│       └── environments/
└── data/
    └── .gitkeep
```

---

## Características Clave

1.  **Algoritmo de Tarificación Gradual (Tiered Pricing)**:
    *   **0-10 usuarios**: 10 € / usuario.
    *   **11-50 usuarios**: 8 € / usuario.
    *   **>50 usuarios**: 5 € / usuario.
    *   *Ejemplo*: 15 usuarios = $(10 \times 10) + (5 \times 8) = 140 \text{ €}$.
2.  **Validación Fiscal Avanzada**:
    *   Validación estricta y algorítmica del NIF, NIE y CIF si el país seleccionado es España.
    *   Cálculo automático de IVA (21% en España, exento/0% para otros países).
3.  **Conversión Multidivisa en Tiempo Real**:
    *   Integración directa con una API pública de tipos de cambio (`https://open.er-api.com/v6/latest/EUR`).
    *   Conversión dinámica e instantánea del presupuesto estimado y de los historiales guardados en divisas como EUR, USD, GBP, JPY, CAD, etc.
4.  **Diseño Visual Premium**:
    *   Interfaz responsive en base a cristal (glassmorphism) con paleta de colores HSL Slate/Indigo.
    *   Micro-animaciones fluidas para sliders interactivos y tarjetas.

---

## Cómo Levantar el Proyecto (Despliegue)

### Opción A: Mediante Docker Compose

Asegúrate de tener instalado [Docker](https://www.docker.com/) y tener la terminal en la raíz de `saas-o-matic/`. Ejecuta:

```bash
docker-compose up --build
```

Una vez finalizado el proceso de construcción, el sistema estará disponible en las siguientes direcciones:
*   **Frontend (Panel Dashboard)**: [http://localhost:4200](http://localhost:4200)
*   **Backend (API REST)**: [http://localhost:5000/api](http://localhost:5000/api)
*   **Salud del Backend**: [http://localhost:5000/health](http://localhost:5000/health)

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
*   Asegúrate de tener [Node.js](https://nodejs.org/) instalado.
*   Navega a la carpeta frontend: `cd frontend`
*   Instala las dependencias necesarias:
    ```bash
    npm install
    ```
*   Inicia el servidor de desarrollo de Angular:
    ```bash
    npm start
    ```
    La aplicación se cargará en `http://localhost:4200`.

---

## Verificación y Pruebas Unitarias

Para comprobar el correcto funcionamiento de los algoritmos de validación fiscal y tarificación por tramos en el backend, hemos incluido un script de pruebas.

Para ejecutar los tests unitarios:
1.  Sitúate en `saas-o-matic/backend/`.
2.  Crea o activa el entorno virtual de Python.
3.  Ejecuta el comando:
    ```bash
    python -m unittest discover -s tests -p "*_test.py"
    ```
    *(Nota: Consulta las pruebas en `backend/tests/` para verificar los casos de prueba de DNI/NIF/CIF válidos e inválidos, así como el cálculo de tramos).*
