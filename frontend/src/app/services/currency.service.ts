import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';

export interface RespuestaTasasCambio {
  result: string;
  base_code: string;
  rates: { [codigo: string]: number };
  time_last_update_unix: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServicioDivisas {
  private urlApi = 'https://open.er-api.com/v6/latest/EUR';
  private tasasCacheas: { [codigo: string]: number } = { EUR: 1.0, USD: 1.09, GBP: 0.85 };
  private tasas$?: Observable<RespuestaTasasCambio>;

  public readonly divisasSoportadas = ['EUR', 'USD', 'GBP', 'JPY', 'CAD', 'CHF', 'AUD'];

  constructor(private http: HttpClient) {}

  getTasasCambio(): Observable<RespuestaTasasCambio> {
    if (!this.tasas$) {
      this.tasas$ = this.http.get<RespuestaTasasCambio>(this.urlApi).pipe(
        tap(respuesta => {
          if (respuesta && respuesta.rates) {
            this.tasasCacheas = respuesta.rates;
          }
        }),
        shareReplay(1) // Cachea el flujo para evitar peticiones múltiples repetitivas
      );
    }
    return this.tasas$;
  }

  obtenerTasasDirecto(): { [codigo: string]: number } {
    return this.tasasCacheas;
  }

  convertir(cantidadEnEur: number, divisaDestino: string): number {
    const tasa = this.tasasCacheas[divisaDestino.toUpperCase()] || 1.0;
    return cantidadEnEur * tasa;
  }

  obtenerSimbolo(divisa: string): string {
    switch (divisa.toUpperCase()) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'CAD': return 'C$';
      case 'CHF': return 'CHF';
      case 'AUD': return 'A$';
      default: return divisa;
    }
  }
}
