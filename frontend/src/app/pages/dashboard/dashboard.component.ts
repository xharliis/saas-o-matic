import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Cliente } from '../../models/customer';
import { debounceTime, Subject, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-wrapper animate-fade-in">
      
      <!-- Sección Superior: Intro y control de visibilidad del formulario -->
      <div class="intro-bar">
        <div>
          <h1 class="gradient-text">Panel de Gestión Comercial</h1>
          <p class="subtitle">Busca clientes corporativos, simula costes y optimiza tarifas de suscripción en tiempo real.</p>
        </div>
        <button class="btn btn-primary" routerLink="/customer/new">
          <span class="material-icons-round">person_add</span>
          Nuevo Cliente
        </button>
      </div>

      <!-- Sección Principal: Búsqueda y Lista de Clientes -->
      <div class="glass-card list-card">
        <div class="search-bar-wrapper">
          <span class="material-icons-round search-icon">search</span>
          <input 
            type="text" 
            class="form-control search-input" 
            placeholder="Buscar por nombre de empresa o identificador fiscal..." 
            [(ngModel)]="busquedaQuery"
            (ngModelChange)="alCambiarBusqueda($event)"
          >
        </div>

        <!-- Indicador de carga -->
        <div *ngIf="cargando" class="loader-wrapper">
          <div class="spinner-large"></div>
          <p>Cargando clientes corporativos...</p>
        </div>

        <!-- Vista vacía -->
        <div *ngIf="!cargando && clientes.length === 0" class="empty-state">
          <span class="material-icons-round empty-icon">assignment_ind</span>
          <h3>No se encontraron clientes</h3>
          <p>Registra un nuevo cliente corporativo arriba para comenzar.</p>
        </div>

        <div *ngIf="!cargando && clientes.length > 0" class="customer-grid">
          <div *ngFor="let cliente of clientes" class="customer-item-card">
            <div class="customer-header">
              <div class="avatar-initials">{{ obtenerIniciales(cliente.nombre_empresa) }}</div>
              <div>
                <h3 class="company-name">{{ cliente.nombre_empresa }}</h3>
                <span class="plan-badge" [ngClass]="obtenerClasePlan(cliente.plan)">{{ cliente.plan }}</span>
              </div>
            </div>
            <div class="customer-details">
              <div class="detail-row">
                <span class="material-icons-round detail-icon">badge</span>
                <span>ID Fiscal: <strong>{{ cliente.identificador_fiscal }}</strong></span>
              </div>
              <div class="detail-row">
                <span class="material-icons-round detail-icon">mail</span>
                <span>{{ cliente.correo }}</span>
              </div>
              <div class="detail-row">
                <span class="material-icons-round detail-icon">place</span>
                <span>{{ cliente.pais }}</span>
              </div>
            </div>
            <div class="card-footer" style="display: flex; gap: 10px;">
              <button class="btn btn-primary" style="flex: 1;" [routerLink]="['/simulations', cliente.id]">Simular</button>
              <button class="btn btn-secondary" style="flex: 1;" [routerLink]="['/customer', cliente.id, 'edit']">Editar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .intro-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }
    .subtitle {
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }
    .register-card {
      border-color: rgba(99, 102, 241, 0.2);
    }
    .form-title {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .grid-form {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }
    .full-width {
      grid-column: span 2;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }
    .validation-hint {
      margin-top: 0.25rem;
      font-size: 0.75rem;
    }
    .hint-text {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .tiny-icon {
      font-size: 0.9rem;
    }
    .text-success { color: var(--accent-success); }
    .text-danger { color: var(--accent-danger); }
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
    .search-bar-wrapper {
      position: relative;
      margin-bottom: 2rem;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 1.5rem;
    }
    .search-input {
      padding-left: 3rem;
      font-size: 1.1rem;
      background: rgba(15, 23, 42, 0.4);
    }
    .customer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .customer-item-card {
      background: rgba(15, 23, 42, 0.3);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .customer-item-card:hover {
      background: rgba(15, 23, 42, 0.5);
      border-color: rgba(99, 102, 241, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    }
    .customer-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .avatar-initials {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
      font-size: 1.2rem;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
    }
    .company-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .plan-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-basic { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .badge-growth { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .badge-enterprise { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .customer-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 1rem;
    }
    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .detail-icon {
      font-size: 1.15rem;
      color: var(--text-muted);
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--accent-secondary);
    }
    .arrow-icon {
      font-size: 1.2rem;
      transition: transform 0.2s ease;
    }
    .customer-item-card:hover .arrow-icon {
      transform: translateX(4px);
    }
    .loader-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
      color: var(--text-secondary);
    }
    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.08);
      border-top: 4px solid var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
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
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }
    .empty-icon {
      font-size: 3.5rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    .empty-state h3 {
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }
    .empty-state p {
      color: var(--text-secondary);
    }
    @media (max-width: 768px) {
      .grid-form {
        grid-template-columns: 1fr;
      }
      .full-width {
        grid-column: span 1;
      }
      .intro-bar {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  clientes: Cliente[] = [];
  busquedaQuery: string = '';
  cargando: boolean = true;
  
  private buscadorSubject = new Subject<string>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.obtenerListaClientes();

    // Debounce del input de búsqueda para no sobrecargar el servidor
    this.buscadorSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(consulta => {
      this.obtenerListaClientes(consulta);
    });
  }

  obtenerListaClientes(consulta?: string): void {
    this.cargando = true;
    this.apiService.getClientes(consulta).subscribe({
      next: (datos) => {
        this.clientes = datos;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener los clientes', error);
        this.cargando = false;
      }
    });
  }

  alCambiarBusqueda(consulta: string): void {
    this.buscadorSubject.next(consulta);
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'C';
    const partes = nombre.split(' ');
    if (partes.length > 1) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.slice(0, 2).toUpperCase();
  }

  obtenerClasePlan(plan: string): string {
    const planMinusculas = plan.toLowerCase();
    if (planMinusculas.includes('basic')) return 'badge-basic';
    if (planMinusculas.includes('growth')) return 'badge-growth';
    return 'badge-enterprise';
  }
}
