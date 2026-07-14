export interface Simulacion {
  id?: number;
  cliente_id: number;
  usuarios_activos: number;
  almacenamiento_gb: number;
  llamadas_api: number;
  coste_base?: number;
  coste_impuesto?: number;
  coste_total?: number;
  creado_en?: string;
}
