import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cliente } from '../models/customer';
import { Simulacion } from '../models/simulation';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private urlApi = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getClientes(consulta?: string, page: number = 1, perPage: number = 6): Observable<any> {
    let parametros = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    if (consulta) {
      parametros = parametros.set('q', consulta);
    }
    return this.http.get<any>(`${this.urlApi}/clientes`, { params: parametros });
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlApi}/clientes/${id}`);
  }

  crearCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.urlApi}/clientes`, cliente);
  }

  crearSimulacion(simulacion: Simulacion): Observable<Simulacion> {
    return this.http.post<Simulacion>(`${this.urlApi}/simulaciones`, simulacion);
  }

  getSimulacionesCliente(clienteId: number): Observable<Simulacion[]> {
    return this.http.get<Simulacion[]>(`${this.urlApi}/clientes/${clienteId}/simulaciones`);
  }

  actualizarCliente(id: number, cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.urlApi}/clientes/${id}`, cliente);
  }

  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.urlApi}/clientes/${id}`);
  }

  previewSimulacion(usuariosActivos: number, pais: string): Observable<any> {
    let params = new HttpParams()
      .set('usuarios_activos', usuariosActivos.toString())
      .set('pais', pais);
    return this.http.get<any>(`${this.urlApi}/preview-simulacion`, { params });
  }
}
