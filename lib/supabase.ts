import { createClient } from "@supabase/supabase-js"

// Validar y obtener variables de entorno con valores por defecto seguros
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Verificar si las variables están configuradas correctamente
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const isSupabaseConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 0

// Solo crear el cliente si las variables están configuradas correctamente
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

// Función helper para verificar si Supabase está configurado
export const isSupabaseReady = () => {
  return isSupabaseConfigured && supabase !== null
}

// Log para desarrollo
if (typeof window === "undefined") {
  // Solo en el servidor
  if (!isSupabaseConfigured) {
    console.log("🔧 Supabase no configurado - usando modo desarrollo con datos mock")
  } else {
    console.log("✅ Supabase configurado correctamente")
  }
}

// Tipos de base de datos (sin cambios)
export interface Usuario {
  id: string
  email: string
  nombre: string
  rol: "admin" | "jefe_taller" | "tecnico"
  telefono?: string
  activo: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  nombre: string
  cif?: string
  telefono?: string
  email?: string
  direccion?: string
  contacto_principal?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Vehiculo {
  id: string
  cliente_id: string
  matricula: string
  marca?: string
  modelo?: string
  serie?: string
  tipo_vehiculo?: string
  año?: number
  created_at: string
  updated_at: string
  cliente?: Cliente
}

export interface Material {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  categoria?: string
  stock_actual: number
  stock_minimo: number
  precio_unitario?: number
  proveedor?: string
  ubicacion?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ParteTrabajo {
  id: string
  numero_parte: string
  cliente_id: string
  vehiculo_id: string
  tecnico_id: string
  tipo_trabajo: string
  descripcion: string
  estado: "pendiente" | "en_curso" | "completado" | "cancelado"
  prioridad: "baja" | "media" | "alta" | "urgente"
  fecha_inicio?: string
  fecha_fin?: string
  horas_estimadas?: number
  horas_reales?: number
  ubicacion?: string
  observaciones?: string
  firma_cliente?: string
  dni_cliente?: string
  created_at: string
  updated_at: string
  cliente?: Cliente
  vehiculo?: Vehiculo
  tecnico?: Usuario
  materiales?: ParteMaterial[]
  fichajes?: Fichaje[]
}

export interface Fichaje {
  id: string
  usuario_id: string
  parte_trabajo_id: string
  tipo_fichaje: "entrada" | "salida" | "pausa_inicio" | "pausa_fin"
  fecha_hora: string
  ubicacion_gps?: string
  observaciones?: string
  created_at: string
  usuario?: Usuario
}

export interface ParteMaterial {
  id: string
  parte_trabajo_id: string
  material_id: string
  cantidad_utilizada: number
  precio_unitario?: number
  created_at: string
  material?: Material
}

export interface SolicitudVacaciones {
  id: string
  usuario_id: string
  fecha_inicio: string
  fecha_fin: string
  dias_solicitados: number
  motivo?: string
  estado: "pendiente" | "aprobada" | "rechazada"
  comentario_admin?: string
  aprobado_por?: string
  fecha_aprobacion?: string
  created_at: string
  updated_at: string
  usuario?: Usuario
  aprobador?: Usuario
}

export interface Presupuesto {
  id: string
  numero_presupuesto: string
  cliente_id: string
  vehiculo_id?: string
  descripcion: string
  importe_total: number
  estado: "borrador" | "enviado" | "aceptado" | "rechazado" | "expirado"
  fecha_validez?: string
  observaciones?: string
  created_by: string
  created_at: string
  updated_at: string
  cliente?: Cliente
  vehiculo?: Vehiculo
  creador?: Usuario
}

export interface Cita {
  id: string
  cliente_id: string
  vehiculo_id?: string
  tecnico_id: string
  fecha_hora: string
  duracion_estimada?: number
  tipo_trabajo?: string
  descripcion?: string
  estado: "programada" | "confirmada" | "completada" | "cancelada"
  observaciones?: string
  created_by: string
  created_at: string
  updated_at: string
  cliente?: Cliente
  vehiculo?: Vehiculo
  tecnico?: Usuario
  creador?: Usuario
}
