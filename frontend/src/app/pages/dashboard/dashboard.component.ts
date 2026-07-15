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

        <!-- Paginación -->
        <div *ngIf="!cargando && totalPaginas > 1" class="pagination-wrapper">
          <button 
            class="btn btn-secondary btn-pagination" 
            [disabled]="paginaActual === 1"
            (click)="obtenerListaClientes(busquedaQuery, paginaActual - 1)"
          >
            <span class="material-icons-round">chevron_left</span>
          </button>
          
          <div class="page-numbers">
            <button 
              *ngFor="let p of obtenerArrayPaginas()" 
              class="btn btn-page" 
              [ngClass]="{'active': p === paginaActual}"
              (click)="obtenerListaClientes(busquedaQuery, p)"
            >
              {{ p }}
            </button>
          </div>

          <button 
            class="btn btn-secondary btn-pagination" 
            [disabled]="paginaActual === totalPaginas"
            (click)="obtenerListaClientes(busquedaQuery, paginaActual + 1)"
          >
            <span class="material-icons-round">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  clientes: Cliente[] = [];
  busquedaQuery: string = '';
  cargando: boolean = true;
  
  // Paginación
  paginaActual: number = 1;
  porPagina: number = 6;
  totalClientes: number = 0;
  totalPaginas: number = 0;

  private buscadorSubject = new Subject<string>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.obtenerListaClientes();

    // Debounce del input de búsqueda para no sobrecargar el servidor
    this.buscadorSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(consulta => {
      this.obtenerListaClientes(consulta, 1);
    });
  }

  obtenerListaClientes(consulta?: string, page: number = 1): void {
    this.cargando = true;
    this.paginaActual = page;
    const query = (consulta !== undefined) ? consulta : this.busquedaQuery;
    this.apiService.getClientes(query, this.paginaActual, this.porPagina).subscribe({
      next: (datos) => {
        this.clientes = datos.clientes;
        this.totalClientes = datos.total;
        this.totalPaginas = datos.paginas;
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

  obtenerArrayPaginas(): number[] {
    const paginas = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
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
