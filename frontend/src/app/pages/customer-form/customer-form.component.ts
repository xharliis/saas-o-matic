import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Cliente } from '../../models/customer';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard-wrapper animate-fade-in" style="max-width: 800px; margin: 0 auto;">
      <div class="intro-bar">
        <div>
          <h1 class="gradient-text">{{ isEditMode ? 'Editar Cliente' : 'Registrar Cliente Corporativo' }}</h1>
          <p class="subtitle">{{ isEditMode ? 'Actualiza los datos del cliente.' : 'Añade un nuevo cliente corporativo al sistema.' }}</p>
        </div>
        <button class="btn btn-secondary" routerLink="/dashboard">
          <span class="material-icons-round">arrow_back</span>
          Volver
        </button>
      </div>

      <div class="glass-card register-card animate-fade-in">
        <form (ngSubmit)="guardarCliente()" #formularioCliente="ngForm" class="grid-form">
          <div class="form-group">
            <label class="form-label">Nombre de la Empresa</label>
            <input type="text" class="form-control" name="nombre_empresa" [(ngModel)]="cliente.nombre_empresa" required placeholder="Ej: Acme Corporation SL">
          </div>

          <div class="form-group">
            <label class="form-label">Identificador Fiscal (DNI/NIF/CIF)</label>
            <input type="text" class="form-control" name="identificador_fiscal" [(ngModel)]="cliente.identificador_fiscal" (ngModelChange)="alCambiarIdFiscal()" required placeholder="Ej: B12345674">
            
            <div *ngIf="esEspanaSeleccionado()" class="validation-hint">
              <span *ngIf="identificadorFiscalValido === null" class="hint-text text-muted">Escribe un NIF/CIF válido para España</span>
              <span *ngIf="identificadorFiscalValido === true" class="hint-text text-success">
                <span class="material-icons-round tiny-icon">check_circle</span> NIF/CIF con formato válido
              </span>
              <span *ngIf="identificadorFiscalValido === false" class="hint-text text-danger">
                <span class="material-icons-round tiny-icon">error</span> Formato NIF/CIF inválido
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email de Contacto</label>
            <input type="email" class="form-control" name="correo" [(ngModel)]="cliente.correo" required placeholder="Ej: info@acme.com">
          </div>

          <div class="form-group">
            <label class="form-label">País</label>
            <select class="form-control" name="pais" [(ngModel)]="cliente.pais" (change)="alCambiarPais()" required>
              <option value="" disabled selected>Selecciona un país</option>
              <option value="España">España</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Reino Unido">Reino Unido</option>
              <option value="Alemania">Alemania</option>
              <option value="Francia">Francia</option>
              <option value="Japón">Japón</option>
              <option value="Canadá">Canadá</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Plan Inicial Elegido</label>
            <select class="form-control" name="plan" [(ngModel)]="cliente.plan" required>
              <option value="" disabled selected>Selecciona un plan</option>
              <option value="SaaS Basic">SaaS Basic (Suscripción Base)</option>
              <option value="SaaS Growth">SaaS Growth (Suscripción Escalable)</option>
              <option value="SaaS Enterprise">SaaS Enterprise (Uso Corporativo)</option>
            </select>
          </div>

          <div class="form-actions full-width" style="display: flex; justify-content: space-between; align-items: center;">
            <button *ngIf="isEditMode" type="button" class="btn btn-secondary" style="color: var(--accent-danger); border-color: rgba(239,68,68,0.3)" (click)="eliminarCliente()">
              <span class="material-icons-round">delete</span>
              Eliminar
            </button>
            <div style="flex-grow: 1"></div>
            <button type="submit" class="btn btn-primary" [disabled]="!formularioCliente.form.valid || (esEspanaSeleccionado() && identificadorFiscalValido === false) || enviando">
              <span class="material-icons-round" *ngIf="!enviando">save</span>
              <span class="spinner" *ngIf="enviando"></span>
              {{ isEditMode ? 'Actualizar Cliente' : 'Registrar Cliente' }}
            </button>
          </div>
        </form>

        <div *ngIf="errorFormulario" class="alert alert-danger animate-fade-in mt-3">
          <span class="material-icons-round">warning</span>
          <p>{{ errorFormulario }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-wrapper { display: flex; flex-direction: column; gap: 2rem; margin-top: 2rem; }
    .intro-bar { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; }
    .register-card { border-color: rgba(99, 102, 241, 0.2); padding: 2rem; }
    .grid-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
    .full-width { grid-column: span 2; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-label { font-size: 0.9rem; font-weight: 500; color: var(--text-secondary); }
    .form-control { padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(15, 23, 42, 0.4); color: var(--text-primary); }
    .form-actions { margin-top: 0.5rem; }
    .validation-hint { margin-top: 0.25rem; font-size: 0.75rem; }
    .hint-text { display: flex; align-items: center; gap: 0.25rem; }
    .tiny-icon { font-size: 0.9rem; }
    .text-success { color: var(--accent-success); }
    .text-danger { color: var(--accent-danger); }
    .text-muted { color: var(--text-muted); }
    .alert { margin-top: 1rem; padding: 0.75rem 1rem; border-radius: 8px; display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; }
    .alert-danger { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .mt-3 { margin-top: 1rem; }
  `]
})
export class CustomerFormComponent implements OnInit {
  isEditMode = false;
  clienteId: number | null = null;
  
  cliente: Cliente = {
    nombre_empresa: '',
    identificador_fiscal: '',
    correo: '',
    pais: '',
    plan: ''
  };

  identificadorFiscalValido: boolean | null = null;
  enviando = false;
  errorFormulario = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.clienteId = Number(id);
      this.cargarCliente(this.clienteId);
    }
  }

  cargarCliente(id: number) {
    this.apiService.getCliente(id).subscribe({
      next: (data) => {
        this.cliente = data;
        this.alCambiarIdFiscal();
      },
      error: (e) => this.errorFormulario = 'Error al cargar el cliente.'
    });
  }

  esEspanaSeleccionado(): boolean {
    return this.cliente.pais === 'España';
  }

  alCambiarPais() {
    if (this.esEspanaSeleccionado()) {
      this.validarIdFiscal();
    } else {
      this.identificadorFiscalValido = null;
    }
  }

  alCambiarIdFiscal() {
    if (this.esEspanaSeleccionado()) {
      this.validarIdFiscal();
    }
  }

  validarIdFiscal() {
    const idLimpio = this.cliente.identificador_fiscal.toUpperCase().trim().replace(/[-\s]/g, '');
    if (idLimpio.length < 9) {
      this.identificadorFiscalValido = null;
      return;
    }
    this.identificadorFiscalValido = this.esNifCifValido(idLimpio);
  }

  esNifCifValido(idLimpio: string): boolean {
    // Basic Spanish DNI/NIF/CIF validation logic
    if (/^[0-9]{8}[A-Z]$/.test(idLimpio)) {
      const num = parseInt(idLimpio.slice(0, 8), 10);
      const letra = idLimpio[8];
      const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
      return letras[num % 23] === letra;
    }
    
    if (/^[XYZ][0-9]{7}[A-Z]$/.test(idLimpio)) {
      const letraInicial = idLimpio[0];
      const reemplazo = letraInicial === 'X' ? '0' : (letraInicial === 'Y' ? '1' : '2');
      const equivalente = reemplazo + idLimpio.slice(1);
      const num = parseInt(equivalente.slice(0, 8), 10);
      const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
      return letras[num % 23] === equivalente[8];
    }
    
    if (/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(idLimpio)) {
      return true; // Simplified CIF validation
    }
    
    return false;
  }

  guardarCliente() {
    if (this.enviando) return;
    this.enviando = true;
    this.errorFormulario = '';

    if (this.isEditMode && this.clienteId) {
      this.apiService.actualizarCliente(this.clienteId, this.cliente).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.enviando = false;
          this.errorFormulario = err.error?.message || 'Error al actualizar el cliente.';
        }
      });
    } else {
      this.apiService.crearCliente(this.cliente).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => {
          this.enviando = false;
          this.errorFormulario = err.error?.message || 'Error al registrar el cliente.';
        }
      });
    }
  }

  eliminarCliente() {
    if (!this.clienteId) return;
    if (confirm('¿Estás seguro de que quieres eliminar este cliente? Se borrarán todas sus simulaciones.')) {
      this.apiService.eliminarCliente(this.clienteId).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => this.errorFormulario = 'Error al eliminar el cliente.'
      });
    }
  }
}
