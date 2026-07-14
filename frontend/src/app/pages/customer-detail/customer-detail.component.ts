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
          <select class="select-inline" [(ngModel)]="divisaSeleccionada" (change)="alCambiarDivisa()">
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
              <span class="material-icons-round">business</span>
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
              <span class="material-icons-round icon-inline">insights</span>
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
              <button class="btn btn-primary btn-block" (click)="guardarSimulacion()" [disabled]="formUsuarios === 0 || guardando">
                <span class="material-icons-round" *ngIf="!guardando">save_alt</span>
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
  styles: [`
    .detail-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .action-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .back-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s ease;
    }
    .back-link:hover {
      color: #fff;
    }
    .glass-card-small {
      background: rgba(30, 41, 59, 0.45);
      border: 1px solid var(--glass-border);
      border-radius: 9999px;
      padding: 0.5rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .form-label-inline {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .select-inline {
      background: transparent;
      border: none;
      color: var(--accent-secondary);
      font-family: var(--font-sans);
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      outline: none;
    }
    .select-inline option {
      background-color: var(--bg-secondary);
      color: #fff;
    }
    .layout-grid {
      display: grid;
      grid-template-columns: 450px 1fr;
      gap: 2rem;
      align-items: start;
    }
    .left-col {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .customer-info-card {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card-avatar {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(56, 189, 248, 0.2));
      border: 1px solid var(--glass-border-focus);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent-secondary);
      margin-bottom: 1rem;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    .card-avatar .material-icons-round {
      font-size: 2.25rem;
    }
    .badge-row {
      display: flex;
      gap: 0.5rem;
      margin: 0.75rem 0 1.5rem;
    }
    .plan-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-basic { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .badge-growth { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .badge-enterprise { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .country-badge {
      font-size: 0.75rem;
      font-weight: 600;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-secondary);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
    }
    .info-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      text-align: left;
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 1.25rem;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .info-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .info-value {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-primary);
    }
    .card-title {
      font-size: 1.15rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding-bottom: 0.75rem;
    }
    .icon-inline {
      color: var(--accent-secondary);
    }
    .empty-history {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--text-secondary);
    }
    .empty-history .empty-icon {
      font-size: 2.5rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .small-text {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 0.25rem;
    }
    .history-item {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.04);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      transition: all 0.2s ease;
    }
    .history-item:hover {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.08);
    }
    .history-meta {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .history-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .usage-badges {
      display: flex;
      gap: 0.4rem;
    }
    .usage-badge {
      font-size: 0.75rem;
      background: rgba(15,23,42,0.5);
      border: 1px solid rgba(255,255,255,0.04);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }
    .usage-badge .material-icons-round {
      font-size: 0.85rem;
    }
    .history-financials {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .price-converted {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-success);
    }
    .price-original {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .simulation-sliders {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .slider-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .slider-value {
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .badge-primary { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
    .badge-secondary { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }
    .badge-emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .range-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 9999px;
      background: rgba(255,255,255,0.08);
      outline: none;
    }
    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--accent-primary);
      cursor: pointer;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
      transition: transform 0.1s ease;
    }
    .range-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
    .range-slider-secondary::-webkit-slider-thumb {
      background: var(--accent-secondary);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
    }
    .range-slider-emerald::-webkit-slider-thumb {
      background: var(--accent-success);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }
    .slider-range-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .cost-projection-box {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.2) 100%);
      border: 1px solid var(--glass-border-focus);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.05);
    }
    .projection-title {
      font-size: 0.9rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .price-display {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-bottom: 1.25rem;
    }
    .large-price {
      font-size: 2.5rem;
      font-weight: 800;
      color: #fff;
      background: linear-gradient(to right, #ffffff, #c7d2fe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 2px 10px rgba(99,102,241,0.2));
    }
    .currency-label {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .breakdown-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .breakdown-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .border-top {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 0.75rem;
    }
    .total-row {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      border-top: 1px dashed rgba(255,255,255,0.15);
      padding-top: 0.75rem;
    }
    .accent-color {
      color: var(--accent-secondary);
    }
    .tier-explanation {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      padding-left: 1rem;
      margin: 0.25rem 0;
    }
    .tier-step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .bullet {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--accent-primary);
    }
    .btn-block {
      width: 100%;
    }
    .alert {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
    }
    .alert-danger {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #a7f3d0;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top: 2px solid #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @media (max-width: 968px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
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
      debounceTime(200),
      distinctUntilChanged()
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

  obtenerPorcentajeImpuestoEtiqueta(): string {
    if (!this.cliente) return '0%';
    const pais = this.cliente.pais.toLowerCase();
    if (pais === 'españa' || pais === 'es' || pais === 'spain') return '21%';
    return '0%';
  }

  obtenerEtiquetaImpuesto(): string {
    const porcentaje = this.obtenerPorcentajeImpuestoEtiqueta();
    return porcentaje !== '0%' ? `${porcentaje} (IVA España)` : 'Exento (0%)';
  }

  alCambiarDivisa(): void {
    // Redibuja las cantidades convertidas en pantalla
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
