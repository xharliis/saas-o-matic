import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ServicioDivisas } from '../../services/currency.service';
import { Cliente } from '../../models/customer';
import { Simulacion } from '../../models/simulation';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="detail-wrapper animate-fade-in" *ngIf="cliente">
      
      <!-- Botón de regreso y barra superior de divisa -->
      <div class="action-header">
        <a routerLink="/" class="back-link">
          <span class="material-icons-round">arrow_back</span>
          <span>Volver al Panel</span>
        </a>
        <div class="currency-selector-wrapper glass-card-small">
          <span class="material-icons-round">payments</span>
          <label class="form-label-inline">Divisa de Visualización:</label>
          <select class="select-inline" [(ngModel)]="divisaSeleccionada">
            <option *ngFor="let divisa of divisas" [value]="divisa">{{ divisa }}</option>
          </select>
        </div>
      </div>

      <!-- Grid de Diseño Principal -->
      <div class="layout-grid">
        
        <!-- Columna Izquierda: Tarjeta informativa del cliente e historial -->
        <div class="left-col">
          <!-- Tarjeta de cliente -->
          <div class="glass-card customer-info-card">
            <div class="card-avatar">
              <img src="assets/images/empresa.png" class="card-avatar-img" alt="Empresa">
            </div>
            <h2 class="company-name">{{ cliente.nombre_empresa }}</h2>
            <div class="badge-row">
              <span class="plan-badge" [ngClass]="obtenerClasePlan(cliente.plan)">{{ cliente.plan }}</span>
              <span class="country-badge">{{ cliente.pais }}</span>
            </div>

            <div class="info-list">
              <div class="info-item">
                <span class="info-label">ID Fiscal</span>
                <span class="info-value">{{ cliente.identificador_fiscal }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email de Contacto</span>
                <span class="info-value">{{ cliente.correo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Impuesto Aplicable (IVA)</span>
                <span class="info-value">{{ obtenerEtiquetaImpuesto() }}</span>
              </div>
            </div>
          </div>

          <!-- Historial de Simulaciones -->
          <div class="glass-card history-card">
            <h3 class="card-title">
              <span class="material-icons-round icon-inline">history</span>
              Historial de Simulaciones
            </h3>

            <div *ngIf="simulaciones.length === 0" class="empty-history">
              <span class="material-icons-round empty-icon">analytics</span>
              <p>No hay simulaciones guardadas para este cliente.</p>
              <p class="small-text">Usa el simulador de la derecha para calcular y guardar una.</p>
            </div>

            <div *ngIf="simulaciones.length > 0" class="history-list">
              <div *ngFor="let sim of simulaciones" class="history-item">
                <div class="history-meta">
                  <span class="history-date">{{ formatearFecha(sim.creado_en) }}</span>
                  <div class="usage-badges">
                    <span class="usage-badge"><span class="material-icons-round">groups</span> {{ sim.usuarios_activos }} u</span>
                    <span class="usage-badge"><span class="material-icons-round">sd_card</span> {{ sim.almacenamiento_gb }} GB</span>
                    <span class="usage-badge"><span class="material-icons-round">api</span> {{ sim.llamadas_api | number }}</span>
                  </div>
                </div>
                <div class="history-financials">
                  <span class="price-converted">
                    {{ formatearPrecio(sim.coste_total ?? 0) }}
                  </span>
                  <span class="price-original" *ngIf="divisaSeleccionada !== 'EUR'">
                    Original: {{ sim.coste_total }} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Formulario interactivo de simulación -->
        <div class="right-col">
          <div class="glass-card simulation-form-card">
            <h3 class="card-title">
              Simulación de Costes
            </h3>

            <div class="simulation-sliders">
              <!-- Slider de usuarios -->
              <div class="slider-group">
                <div class="slider-header">
                  <label class="form-label font-bold">Usuarios Activos</label>
                  <span class="slider-value badge-primary">{{ formUsuarios }}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  step="1" 
                  class="range-slider" 
                  [(ngModel)]="formUsuarios" 
                  (ngModelChange)="recalcularCostes()"
                >
                <div class="slider-range-labels">
                  <span>0</span>
                  <span>100</span>
                  <span>200+</span>
                </div>
              </div>

              <!-- Slider de almacenamiento -->
              <div class="slider-group">
                <div class="slider-header">
                  <label class="form-label">Almacenamiento Adicional (GB)</label>
                  <span class="slider-value badge-secondary">{{ formAlmacenamiento }} GB</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="10" 
                  class="range-slider range-slider-secondary" 
                  [(ngModel)]="formAlmacenamiento"
                  (ngModelChange)="recalcularCostes()"
                >
                <div class="slider-range-labels">
                  <span>0 GB</span>
                  <span>500 GB</span>
                  <span>1000 GB</span>
                </div>
              </div>

              <!-- Slider de llamadas API -->
              <div class="slider-group">
                <div class="slider-header">
                  <label class="form-label">Llamadas a la API Estimadas / mes</label>
                  <span class="slider-value badge-emerald">{{ formLlamadasApi | number }}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1000000" 
                  step="5000" 
                  class="range-slider range-slider-emerald" 
                  [(ngModel)]="formLlamadasApi"
                  (ngModelChange)="recalcularCostes()"
                >
                <div class="slider-range-labels">
                  <span>0</span>
                  <span>500k</span>
                  <span>1M</span>
                </div>
              </div>
            </div>

            <!-- Proyección del coste mensual con desglose interactivo -->
            <div class="cost-projection-box">
              <h4 class="projection-title">Proyección de Factura Mensual</h4>
              
              <div class="price-display">
                <span class="large-price">{{ formatearPrecio(costeTotalActual) }}</span>
                <span class="currency-label">/ mes (IVA inc.)</span>
              </div>

              <!-- Detalles del desglose -->
              <div class="breakdown-details">
                <div class="breakdown-row">
                  <span>Coste base (usuarios):</span>
                  <span>{{ formatearPrecio(costeBaseActual) }}</span>
                </div>
                <!-- Explicación por tramos de usuarios -->
                <div class="tier-explanation animate-fade-in" *ngIf="formUsuarios > 0">
                  <div class="tier-step" *ngFor="let tramo of desgloseTramosActual">
                    <span class="bullet"></span>
                    <span>{{ tramo.descripcion }}:</span>
                    <strong>{{ formatearPrecio(tramo.coste) }}</strong>
                  </div>
                </div>

                <div class="breakdown-row border-top">
                  <span>Impuesto ({{ obtenerPorcentajeImpuestoEtiqueta() }}):</span>
                  <span>{{ formatearPrecio(costeImpuestoActual) }}</span>
                </div>
                
                <div class="breakdown-row total-row">
                  <span>Total estimado:</span>
                  <span class="accent-color">{{ formatearPrecio(costeTotalActual) }}</span>
                </div>
              </div>
            </div>

            <!-- Acción de guardar simulación -->
            <div class="form-actions">
              <button class="btn btn-primary btn-block" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;" (click)="guardarSimulacion()" [disabled]="formUsuarios === 0 || guardando">
                <img src="assets/images/guardar.png" class="btn-icon" *ngIf="!guardando" alt="Guardar">
                <span class="spinner" *ngIf="guardando"></span>
                Guardar Simulación en Historial
              </button>
            </div>
            
            <div *ngIf="errorGuardado" class="alert alert-danger">
              <span class="material-icons-round">warning</span>
              <p>{{ errorGuardado }}</p>
            </div>
            <div *ngIf="guardadoExitoso" class="alert alert-success">
              <span class="material-icons-round">check_circle</span>
              <p>Simulación guardada correctamente.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styleUrl: './customer-detail.component.css'
})
export class CustomerDetailComponent implements OnInit {
  cliente?: Cliente;
  simulaciones: Simulacion[] = [];
  divisas: string[] = [];
  divisaSeleccionada: string = 'EUR';

  // Parámetros de formulario
  formUsuarios: number = 10;
  formAlmacenamiento: number = 50;
  formLlamadasApi: number = 10000;

  // Estados financieros actuales (en EUR)
  costeBaseActual: number = 0;
  costeImpuestoActual: number = 0;
  costeTotalActual: number = 0;
  desgloseTramosActual: { descripcion: string; coste: number }[] = [];

  // Estados de carga y guardado
  guardando: boolean = false;
  guardadoExitoso: boolean = false;
  errorGuardado: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    public servicioDivisas: ServicioDivisas
  ) {
    this.divisas = this.servicioDivisas.divisasSoportadas;
    this.simuladorSubject.pipe(
      debounceTime(200)
    ).subscribe(() => {
      this.realizarSimulacionBackend();
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarDetalleCliente(id);
      this.cargarSimulaciones(id);
    }

    // Calentar el caché de tipos de cambio con la API pública
    this.servicioDivisas.getTasasCambio().subscribe({
      error: (e: any) => console.warn('Error en API de Divisas. Usando valores por defecto de respaldo.', e)
    });
  }

  cargarDetalleCliente(id: number): void {
    this.apiService.getCliente(id).subscribe({
      next: (datos) => {
        this.cliente = datos;
        this.recalcularCostes();
      },
      error: (err) => console.error('Error al cargar detalle del cliente', err)
    });
  }

  cargarSimulaciones(clienteId: number): void {
    this.apiService.getSimulacionesCliente(clienteId).subscribe({
      next: (datos) => {
        this.simulaciones = datos;
      },
      error: (err) => console.error('Error al cargar simulaciones', err)
    });
  }

  // Sujeto para debouncer las llamadas a la API al arrastrar sliders
  private simuladorSubject = new Subject<void>();



  recalcularCostes(): void {
    this.simuladorSubject.next();
  }

  realizarSimulacionBackend(): void {
    if (!this.cliente) return;

    this.apiService.previewSimulacion(this.formUsuarios, this.cliente.pais).subscribe({
      next: (datos) => {
        this.costeBaseActual = datos.coste_base;
        this.costeImpuestoActual = datos.coste_impuesto;
        this.costeTotalActual = datos.coste_total;

        // Simular un desglose básico ya que el backend no lo devuelve detallado por tramo
        this.desgloseTramosActual = [
          { descripcion: 'Coste total de usuarios activos', coste: datos.coste_base }
        ];
      },
      error: (err) => console.error('Error al obtener la simulación del servidor', err)
    });
  }

  private etiquetasImpuestos: { [key: string]: string } = {
    'españa': 'IVA España', 'spain': 'IVA España', 'es': 'IVA España',
    'alemania': 'IVA Alemania', 'germany': 'IVA Alemania', 'de': 'IVA Alemania',
    'francia': 'IVA Francia', 'france': 'IVA Francia', 'fr': 'IVA Francia',
    'reino unido': 'VAT Reino Unido', 'united kingdom': 'VAT Reino Unido', 'uk': 'VAT Reino Unido', 'gb': 'VAT Reino Unido',
    'japón': 'Impuesto al Consumo Japón', 'japon': 'Impuesto al Consumo Japón', 'japan': 'Impuesto al Consumo Japón', 'jp': 'Impuesto al Consumo Japón',
    'canadá': 'GST federal Canadá', 'canada': 'GST federal Canadá', 'ca': 'GST federal Canadá',
    'estados unidos': 'Tax Estados Unidos', 'united states': 'Tax Estados Unidos', 'usa': 'Tax Estados Unidos', 'us': 'Tax Estados Unidos', 'eeuu': 'Tax Estados Unidos'
  };

  obtenerPorcentajeImpuestoEtiqueta(): string {
    if (!this.cliente) return '0%';
    const pais = this.cliente.pais.toLowerCase().trim();
    const tasas: { [key: string]: string } = {
      'españa': '21%', 'spain': '21%', 'es': '21%',
      'alemania': '19%', 'germany': '19%', 'de': '19%',
      'francia': '20%', 'france': '20%', 'fr': '20%',
      'reino unido': '20%', 'united kingdom': '20%', 'uk': '20%', 'gb': '20%',
      'japón': '10%', 'japon': '10%', 'japan': '10%', 'jp': '10%',
      'canadá': '5%', 'canada': '5%', 'ca': '5%',
      'estados unidos': '10%', 'united states': '10%', 'usa': '10%', 'us': '10%', 'eeuu': '10%'
    };
    return tasas[pais] || '0%';
  }

  obtenerEtiquetaImpuesto(): string {
    if (!this.cliente) return 'Exento (0%)';
    const pais = this.cliente.pais.toLowerCase().trim();
    const porcentaje = this.obtenerPorcentajeImpuestoEtiqueta();
    if (porcentaje === '0%') return 'Exento (0%)';
    const label = this.etiquetasImpuestos[pais] || this.cliente.pais;
    return `${porcentaje} (${label})`;
  }


  formatearPrecio(importeEnEur: number): string {
    const convertido = this.servicioDivisas.convertir(importeEnEur, this.divisaSeleccionada);
    const simbolo = this.servicioDivisas.obtenerSimbolo(this.divisaSeleccionada);

    const formateado = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertido);

    return `${formateado} ${simbolo}`;
  }

  guardarSimulacion(): void {
    if (!this.cliente?.id) return;

    this.guardando = true;
    this.guardadoExitoso = false;
    this.errorGuardado = '';

    const nuevaSim: Simulacion = {
      cliente_id: this.cliente.id,
      usuarios_activos: this.formUsuarios,
      almacenamiento_gb: this.formAlmacenamiento,
      llamadas_api: this.formLlamadasApi
    };

    this.apiService.crearSimulacion(nuevaSim).subscribe({
      next: (simulacionGuardada) => {
        // Añadir al inicio de la lista del historial
        this.simulaciones.unshift(simulacionGuardada);
        this.guardando = false;
        this.guardadoExitoso = true;

        // Ocultar alerta de éxito tras 3 segundos
        setTimeout(() => this.guardadoExitoso = false, 3000);
      },
      error: (err) => {
        console.error('Error al guardar la simulación', err);
        this.errorGuardado = err.error?.message || 'Error al persistir la simulación.';
        this.guardando = false;
      }
    });
  }

  obtenerClasePlan(plan: string): string {
    const planMinusculas = plan.toLowerCase();
    if (planMinusculas.includes('basic')) return 'badge-basic';
    if (planMinusculas.includes('growth')) return 'badge-growth';
    return 'badge-enterprise';
  }

  formatearFecha(fechaIso?: string): string {
    if (!fechaIso) return '';
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
