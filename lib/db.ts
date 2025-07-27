import { createClient } from "@supabase/supabase-js"

// Mock database with TypeScript interfaces

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellidos: string
  rol: "admin" | "jefe_taller" | "tecnico" | "recepcion"
  activo: boolean
  created_at: string
  updated_at: string
  dni?: string | null
  telefono?: string | null
}

export interface Cliente {
  id: string
  nombre: string
  cif?: string | null
  telefono?: string | null
  email?: string | null
  direccion?: string | null
  contacto_principal?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Vehiculo {
  id: string
  cliente_id: string
  matricula: string
  marca?: string | null
  modelo?: string | null
  año?: number | null
  tipo?: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface FotoAdjunta {
  id: string
  nombre: string
  descripcion?: string | null
  url: string
  fecha_subida: string
}

export interface ParteTrabajo {
  id: string
  numero_parte: string
  cliente_id?: string | null
  cliente_nombre?: string | null
  vehiculo_id?: string | null
  vehiculo_matricula?: string | null
  vehiculo_marca?: string | null
  vehiculo_modelo?: string | null
  vehiculo_serie?: string | null
  descripcion: string
  tecnico_asignado?: string | null
  tipo_trabajo?: string | null
  prioridad?: string | null
  estado: "pendiente" | "en_progreso" | "pausado" | "completado" | "cancelado"
  fecha_creacion: string
  fecha_inicio?: string | null
  fecha_fin?: string | null
  tiempo_total?: number | null
  created_by: string
  firma_cliente?: string | null
  dni_cliente?: string | null
  fotos_adjuntas?: FotoAdjunta[]
  created_at: string
  updated_at: string
}

export interface Personal {
  id: string
  nombre: string
  apellidos: string
  dni: string
  telefono?: string | null
  email?: string | null
  puesto: string
  fecha_alta: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Fichaje {
  id: string
  usuario_id: string
  parte_trabajo_id?: string | null
  tipo: "trabajo" | "presencia"
  tipo_fichaje: "entrada" | "salida"
  fecha_hora: string
  observaciones?: string | null
  created_at: string
  parte_trabajo?: Partial<ParteTrabajo>
}

export interface Vacacion {
  id: string
  user_id: string
  fecha_inicio: string
  fecha_fin: string
  dias_solicitados: number
  tipo: "vacaciones" | "permiso" | "baja"
  estado: "pendiente" | "aprobada" | "rechazada"
  motivo?: string | null
  aprobada_por?: string | null
  fecha_aprobacion?: string | null
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  categoria: string
  stock_actual: number
  stock_minimo: number
  precio_unitario: number
  proveedor?: string | null
  ubicacion?: string | null
  created_at: string
  updated_at: string
}

export interface Cita {
  id: string
  usuario_id: string
  fecha: string
  hora: string
  motivo: string
  created_at: string
  updated_at: string
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Check if Supabase is properly configured
export const isSupabaseReady = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Test Supabase connection
export const testSupabaseConnection = async () => {
  if (!isSupabaseReady()) {
    return { connected: false, error: "Supabase not configured" }
  }

  try {
    const { data, error } = await supabase.from("usuarios").select("count").limit(1)
    return { connected: !error, error }
  } catch (error) {
    return { connected: false, error }
  }
}

// Mock users data with proper UUIDs
export const usuarios: Usuario[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "admin@cmghidraulica.com",
    nombre: "Carlos",
    apellidos: "Martín Ruiz",
    rol: "admin",
    activo: true,
    dni: "11223344C",
    telefono: "666555666",
    created_at: "2022-06-01T09:00:00Z",
    updated_at: "2022-06-01T09:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "juan.perez@cmghidraulica.com",
    nombre: "Juan",
    apellidos: "Pérez García",
    rol: "tecnico",
    activo: true,
    dni: "12345678A",
    telefono: "666111222",
    created_at: "2023-01-15T09:00:00Z",
    updated_at: "2023-01-15T09:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "maria.gonzalez@cmghidraulica.com",
    nombre: "María",
    apellidos: "González López",
    rol: "tecnico",
    activo: true,
    dni: "87654321B",
    telefono: "666333444",
    created_at: "2023-03-01T09:00:00Z",
    updated_at: "2023-03-01T09:00:00Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "supervisor@cmghidraulica.com",
    nombre: "Ana",
    apellidos: "Rodríguez Sánchez",
    rol: "jefe_taller",
    activo: true,
    dni: "55667788D",
    telefono: "666777888",
    created_at: "2022-09-15T09:00:00Z",
    updated_at: "2022-09-15T09:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "recepcion@cmghidraulica.com",
    nombre: "Laura",
    apellidos: "Fernández Torres",
    rol: "recepcion",
    activo: true,
    dni: "99887766E",
    telefono: "666999000",
    created_at: "2023-05-01T09:00:00Z",
    updated_at: "2023-05-01T09:00:00Z",
  },
]

// Mock data
export const clientes: Cliente[] = [
  {
    id: "c1111111-1111-1111-1111-111111111111",
    nombre: "Transportes García S.L.",
    cif: "B12345678",
    telefono: "666123456",
    email: "info@transportesgarcia.com",
    direccion: "Calle Principal 123, Madrid",
    contacto_principal: "Juan García",
    activo: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    nombre: "Logística Martínez",
    cif: "B87654321",
    telefono: "666654321",
    email: "contacto@logisticamartinez.es",
    direccion: "Avenida Industrial 45, Barcelona",
    contacto_principal: "María Martínez",
    activo: true,
    created_at: "2024-01-16T11:30:00Z",
    updated_at: "2024-01-16T11:30:00Z",
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    nombre: "Construcciones López",
    cif: "B11223344",
    telefono: "666789012",
    email: "obras@construccioneslopez.com",
    direccion: "Polígono Sur 67, Valencia",
    contacto_principal: "Carlos López",
    activo: true,
    created_at: "2024-01-17T09:15:00Z",
    updated_at: "2024-01-17T09:15:00Z",
  },
]

export const vehiculos: Vehiculo[] = [
  {
    id: "v1111111-1111-1111-1111-111111111111",
    cliente_id: "c1111111-1111-1111-1111-111111111111",
    matricula: "1234ABC",
    marca: "Mercedes",
    modelo: "Actros",
    año: 2020,
    tipo: "Camión",
    activo: true,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "v2222222-2222-2222-2222-222222222222",
    cliente_id: "c1111111-1111-1111-1111-111111111111",
    matricula: "5678DEF",
    marca: "Volvo",
    modelo: "FH",
    año: 2019,
    tipo: "Camión",
    activo: true,
    created_at: "2024-01-15T10:45:00Z",
    updated_at: "2024-01-15T10:45:00Z",
  },
  {
    id: "v3333333-3333-3333-3333-333333333333",
    cliente_id: "c2222222-2222-2222-2222-222222222222",
    matricula: "9012GHI",
    marca: "Scania",
    modelo: "R450",
    año: 2021,
    tipo: "Camión",
    activo: true,
    created_at: "2024-01-16T12:00:00Z",
    updated_at: "2024-01-16T12:00:00Z",
  },
]

export const partesTrabajo: ParteTrabajo[] = [
  {
    id: "p1111111-1111-1111-1111-111111111111",
    numero_parte: "PT-2024-001",
    cliente_id: "c1111111-1111-1111-1111-111111111111",
    cliente_nombre: "Transportes García S.L.",
    vehiculo_id: "v1111111-1111-1111-1111-111111111111",
    vehiculo_matricula: "1234ABC",
    vehiculo_marca: "HIAB",
    vehiculo_modelo: "Xi166",
    vehiculo_serie: "123456",
    descripcion: "Revisión sistema hidráulico de grúa",
    tecnico_asignado: "Juan Pérez",
    tipo_trabajo: "Mantenimiento",
    prioridad: "Media",
    estado: "completado",
    fecha_creacion: "2024-01-20T08:00:00Z",
    fecha_inicio: "2024-01-20T09:00:00Z",
    fecha_fin: "2024-01-20T12:00:00Z",
    tiempo_total: 180,
    created_by: "22222222-2222-2222-2222-222222222222",
    firma_cliente:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    dni_cliente: "12345678A",
    fotos_adjuntas: [
      {
        id: "foto1",
        nombre: "problema_hidraulico.jpg",
        descripcion: "Fuga en cilindro principal",
        url: "/placeholder.svg?height=200&width=300",
        fecha_subida: "2024-01-20T08:30:00Z",
      },
    ],
    created_at: "2024-01-20T08:00:00Z",
    updated_at: "2024-01-20T12:00:00Z",
  },
  {
    id: "p2222222-2222-2222-2222-222222222222",
    numero_parte: "PT-2024-002",
    cliente_id: "c2222222-2222-2222-2222-222222222222",
    cliente_nombre: "Logística Martínez",
    vehiculo_id: "v3333333-3333-3333-3333-333333333333",
    vehiculo_matricula: "9012GHI",
    vehiculo_marca: "Zepro",
    vehiculo_modelo: "ZS200",
    vehiculo_serie: "789012",
    descripcion: "Reparación plataforma elevadora",
    tecnico_asignado: "María González",
    tipo_trabajo: "Reparación",
    prioridad: "Alta",
    estado: "en_progreso",
    fecha_creacion: "2024-01-21T10:00:00Z",
    fecha_inicio: "2024-01-21T11:00:00Z",
    fecha_fin: null,
    tiempo_total: null,
    created_by: "33333333-3333-3333-3333-333333333333",
    firma_cliente: null,
    dni_cliente: null,
    fotos_adjuntas: [
      {
        id: "foto2",
        nombre: "plataforma_dañada.jpg",
        descripcion: "Daño en estructura de la plataforma",
        url: "/placeholder.svg?height=200&width=300",
        fecha_subida: "2024-01-21T10:15:00Z",
      },
      {
        id: "foto3",
        nombre: "motor_plataforma.jpg",
        descripcion: "Motor de elevación",
        url: "/placeholder.svg?height=200&width=300",
        fecha_subida: "2024-01-21T10:20:00Z",
      },
    ],
    created_at: "2024-01-21T10:00:00Z",
    updated_at: "2024-01-21T11:00:00Z",
  },
  {
    id: "p3333333-3333-3333-3333-333333333333",
    numero_parte: "PT-2024-003",
    cliente_id: "c3333333-3333-3333-3333-333333333333",
    cliente_nombre: "Construcciones López",
    vehiculo_id: null,
    vehiculo_matricula: "3456JKL",
    vehiculo_marca: "Dhollandia",
    vehiculo_modelo: "DHLM.20",
    vehiculo_serie: "345678",
    descripcion: "Instalación nueva plataforma hidráulica",
    tecnico_asignado: null,
    tipo_trabajo: null,
    prioridad: null,
    estado: "pendiente",
    fecha_creacion: "2024-01-22T14:00:00Z",
    fecha_inicio: null,
    fecha_fin: null,
    tiempo_total: null,
    created_by: "22222222-2222-2222-2222-222222222222",
    firma_cliente: null,
    dni_cliente: null,
    fotos_adjuntas: [],
    created_at: "2024-01-22T14:00:00Z",
    updated_at: "2024-01-22T14:00:00Z",
  },
]

export const personal: Personal[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    nombre: "Juan",
    apellidos: "Pérez García",
    dni: "12345678A",
    telefono: "666111222",
    email: "juan.perez@cmghidraulica.com",
    puesto: "Técnico Senior",
    fecha_alta: "2023-01-15",
    activo: true,
    created_at: "2023-01-15T09:00:00Z",
    updated_at: "2023-01-15T09:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    nombre: "María",
    apellidos: "González López",
    dni: "87654321B",
    telefono: "666333444",
    email: "maria.gonzalez@cmghidraulica.com",
    puesto: "Técnico",
    fecha_alta: "2023-03-01",
    activo: true,
    created_at: "2023-03-01T09:00:00Z",
    updated_at: "2023-03-01T09:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    nombre: "Carlos",
    apellidos: "Martín Ruiz",
    dni: "11223344C",
    telefono: "666555666",
    email: "carlos.martin@cmghidraulica.com",
    puesto: "Supervisor",
    fecha_alta: "2022-06-01",
    activo: true,
    created_at: "2022-06-01T09:00:00Z",
    updated_at: "2022-06-01T09:00:00Z",
  },
]

export const fichajes: Fichaje[] = [
  {
    id: "f1111111-1111-1111-1111-111111111111",
    usuario_id: "22222222-2222-2222-2222-222222222222",
    parte_trabajo_id: "p1111111-1111-1111-1111-111111111111",
    tipo: "trabajo",
    tipo_fichaje: "entrada",
    fecha_hora: "2024-01-25T08:00:00Z",
    observaciones: "Inicio trabajo en parte PT-2024-001",
    created_at: "2024-01-25T08:00:00Z",
  },
  {
    id: "f2222222-2222-2222-2222-222222222222",
    usuario_id: "33333333-3333-3333-3333-333333333333",
    parte_trabajo_id: null,
    tipo: "presencia",
    tipo_fichaje: "entrada",
    fecha_hora: "2024-01-25T08:30:00Z",
    observaciones: "Entrada oficina",
    created_at: "2024-01-25T08:30:00Z",
  },
  {
    id: "f3333333-3333-3333-3333-333333333333",
    usuario_id: "22222222-2222-2222-2222-222222222222",
    parte_trabajo_id: "p1111111-1111-1111-1111-111111111111",
    tipo: "trabajo",
    tipo_fichaje: "salida",
    fecha_hora: "2024-01-25T12:00:00Z",
    observaciones: "Fin trabajo en parte PT-2024-001",
    created_at: "2024-01-25T12:00:00Z",
  },
]

export const vacaciones: Vacacion[] = [
  {
    id: "va111111-1111-1111-1111-111111111111",
    user_id: "22222222-2222-2222-2222-222222222222",
    fecha_inicio: "2024-02-15",
    fecha_fin: "2024-02-25",
    dias_solicitados: 8,
    tipo: "vacaciones",
    estado: "aprobada",
    motivo: "Vacaciones de invierno",
    aprobada_por: "11111111-1111-1111-1111-111111111111",
    fecha_aprobacion: "2024-01-20T10:00:00Z",
    created_at: "2024-01-18T14:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },
  {
    id: "va222222-2222-2222-2222-222222222222",
    user_id: "33333333-3333-3333-3333-333333333333",
    fecha_inicio: "2024-03-01",
    fecha_fin: "2024-03-01",
    dias_solicitados: 1,
    tipo: "permiso",
    estado: "pendiente",
    motivo: "Asunto personal",
    aprobada_por: null,
    fecha_aprobacion: null,
    created_at: "2024-01-25T16:00:00Z",
    updated_at: "2024-01-25T16:00:00Z",
  },
]

export const materiales: Material[] = [
  {
    id: "m1111111-1111-1111-1111-111111111111",
    codigo: "HID-001",
    nombre: "Aceite hidráulico ISO 46",
    descripcion: "Aceite hidráulico de alta calidad para sistemas de grúas",
    categoria: "Fluidos",
    stock_actual: 25,
    stock_minimo: 5,
    precio_unitario: 45.5,
    proveedor: "Hidráulicos del Norte S.L.",
    ubicacion: "Almacén A - Estantería 1",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z",
  },
  {
    id: "m2222222-2222-2222-2222-222222222222",
    codigo: "SEL-002",
    nombre: "Kit sellos cilindro 80mm",
    descripcion: "Kit completo de sellos para cilindro hidráulico de 80mm",
    categoria: "Sellos",
    stock_actual: 8,
    stock_minimo: 3,
    precio_unitario: 28.75,
    proveedor: "Sellos Industriales Madrid",
    ubicacion: "Almacén B - Cajón 15",
    created_at: "2024-01-12T11:15:00Z",
    updated_at: "2024-01-22T09:45:00Z",
  },
  {
    id: "m3333333-3333-3333-3333-333333333333",
    codigo: "VAL-003",
    nombre: "Válvula direccional 4/3",
    descripcion: "Válvula direccional 4/3 vías para control de grúa",
    categoria: "Válvulas",
    stock_actual: 2,
    stock_minimo: 1,
    precio_unitario: 185.0,
    proveedor: "Componentes Hidráulicos S.A.",
    ubicacion: "Almacén A - Estantería 3",
    created_at: "2024-01-08T14:20:00Z",
    updated_at: "2024-01-18T12:10:00Z",
  },
]

export const citas: Cita[] = [
  {
    id: "ci111111-1111-1111-1111-111111111111",
    usuario_id: "22222222-2222-2222-2222-222222222222",
    fecha: "2024-02-01",
    hora: "09:00",
    motivo: "Revisión de vehículo",
    created_at: "2024-01-20T08:00:00Z",
    updated_at: "2024-01-20T08:00:00Z",
  },
  {
    id: "ci222222-2222-2222-2222-222222222222",
    usuario_id: "33333333-3333-3333-3333-333333333333",
    fecha: "2024-02-02",
    hora: "10:00",
    motivo: "Mantenimiento preventivo",
    created_at: "2024-01-21T09:00:00Z",
    updated_at: "2024-01-21T09:00:00Z",
  },
]

// Authentication function
export const authenticateUser = async (email: string, password?: string) => {
  // Test credentials mapping
  const testCredentials: Record<string, string> = {
    "admin@cmgplataformas.com": "admin123",
    "jefe@cmgplataformas.com": "jefe123",
    "juan@cmgplataformas.com": "juan123",
    "maria@cmgplataformas.com": "maria123",
  }

  // Check if it's a test credential
  if (testCredentials[email] && testCredentials[email] === password) {
    // Map test emails to actual user data
    let user: Usuario | undefined

    switch (email) {
      case "admin@cmgplataformas.com":
        user = usuarios.find((u) => u.id === "11111111-1111-1111-1111-111111111111")
        break
      case "jefe@cmgplataformas.com":
        user = usuarios.find((u) => u.id === "44444444-4444-4444-4444-444444444444")
        break
      case "juan@cmgplataformas.com":
        user = usuarios.find((u) => u.id === "22222222-2222-2222-2222-222222222222")
        break
      case "maria@cmgplataformas.com":
        user = usuarios.find((u) => u.id === "33333333-3333-3333-3333-333333333333")
        break
    }

    if (user && user.activo) {
      return { data: user, error: null }
    }
  }

  // Check regular credentials (existing users in the database)
  const user = usuarios.find((u) => u.email === email && u.activo)
  if (user) {
    return { data: user, error: null }
  }

  return { data: null, error: { message: "Invalid credentials" } }
}

// Funciones de base de datos para usuarios
export async function getUsuarios() {
  if (!isSupabaseReady()) {
    // Datos mock para desarrollo
    return usuarios
  }

  const { data, error } = await supabase.from("usuarios").select("*").eq("activo", true).order("nombre")

  if (error) {
    console.error("Error fetching usuarios:", error)
    return usuarios
  }

  return data || usuarios
}

export async function getUsuarioById(id: string) {
  if (!isSupabaseReady()) {
    return usuarios.find((u) => u.id === id) || null
  }

  const { data, error } = await supabase.from("usuarios").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching usuario:", error)
    return usuarios.find((u) => u.id === id) || null
  }

  return data
}

// Funciones de fichajes
export async function getFichajesUsuario(usuarioId: string, fecha?: string) {
  if (!isSupabaseReady()) {
    let fichajesFiltrados = fichajes.filter((f) => f.usuario_id === usuarioId)

    if (fecha) {
      fichajesFiltrados = fichajesFiltrados.filter((f) => f.fecha_hora.startsWith(fecha))
    }

    return {
      data: fichajesFiltrados.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()),
      error: null,
    }
  }

  let query = supabase
    .from("fichajes")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("fecha_hora", { ascending: false })

  if (fecha) {
    const startOfDay = new Date(fecha)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(fecha)
    endOfDay.setHours(23, 59, 59, 999)

    query = query.gte("fecha_hora", startOfDay.toISOString()).lte("fecha_hora", endOfDay.toISOString())
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching fichajes:", error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

export async function createFichaje(fichaje: {
  usuario_id: string
  tipo: "presencia" | "trabajo"
  tipo_fichaje: "entrada" | "salida"
  parte_trabajo_id?: string
  observaciones?: string
}) {
  if (!isSupabaseReady()) {
    const newFichaje: Fichaje = {
      id: `f${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...fichaje,
      fecha_hora: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
    fichajes.push(newFichaje)
    return { success: true, data: newFichaje }
  }

  const { data, error } = await supabase
    .from("fichajes")
    .insert([
      {
        ...fichaje,
        fecha_hora: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating fichaje:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getEstadoPresencia(usuarioId: string): Promise<"presente" | "ausente"> {
  if (!isSupabaseReady()) {
    const fichajesUsuario = fichajes
      .filter((f) => f.usuario_id === usuarioId && f.tipo === "presencia")
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

    if (fichajesUsuario.length === 0) return "ausente"
    return fichajesUsuario[0].tipo_fichaje === "entrada" ? "presente" : "ausente"
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("fichajes")
    .select("tipo_fichaje, fecha_hora")
    .eq("usuario_id", usuarioId)
    .eq("tipo", "presencia")
    .gte("fecha_hora", hoy.toISOString())
    .order("fecha_hora", { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return "ausente"
  }

  return data[0].tipo_fichaje === "entrada" ? "presente" : "ausente"
}

export const getUltimoFichajePresencia = async (userId: string) => {
  if (!isSupabaseReady()) {
    const userFichajes = fichajes
      .filter((f) => f.usuario_id === userId && f.tipo === "presencia")
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
    return { data: userFichajes.length > 0 ? userFichajes[0] : null, error: null }
  }

  const { data, error } = await supabase
    .from("fichajes")
    .select("*")
    .eq("usuario_id", userId)
    .eq("tipo", "presencia")
    .order("fecha_hora", { ascending: false })
    .limit(1)

  if (error) {
    console.error("Error fetching ultimo fichaje presencia:", error)
    return { data: null, error }
  }

  return { data: data && data.length > 0 ? data[0] : null, error: null }
}

export const createFichajePresencia = async (userId: string, tipoFichaje: "entrada" | "salida") => {
  const fichajeData = {
    usuario_id: userId,
    parte_trabajo_id: null,
    tipo: "presencia" as const,
    tipo_fichaje: tipoFichaje,
    observaciones: `Fichaje de ${tipoFichaje}`,
  }

  return createFichaje(fichajeData)
}

// Funciones de citas
export async function getCitas() {
  if (!isSupabaseReady()) {
    return citas
  }

  const { data, error } = await supabase
    .from("citas")
    .select(`
      *,
      clientes(nombre),
      vehiculos(matricula, marca, modelo),
      usuarios(nombre, apellidos)
    `)
    .order("fecha_hora", { ascending: true })

  if (error) {
    console.error("Error fetching citas:", error)
    return citas
  }

  return data || citas
}

export async function createCita(cita: {
  titulo: string
  descripcion?: string
  fecha_hora: string
  duracion?: number
  cliente_id?: string
  vehiculo_id?: string
  tecnico_id?: string
  tipo_servicio?: string
  observaciones?: string
  created_by: string
}) {
  if (!isSupabaseReady()) {
    const newCita: Cita = {
      id: `ci${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      usuario_id: cita.created_by,
      fecha: cita.fecha_hora.split("T")[0],
      hora: cita.fecha_hora.split("T")[1].substring(0, 5),
      motivo: cita.titulo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    citas.push(newCita)
    return { success: true, data: newCita }
  }

  const { data, error } = await supabase.from("citas").insert([cita]).select().single()

  if (error) {
    console.error("Error creating cita:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

// Funciones de partes de trabajo
export async function getPartesTrabajoRecientes() {
  if (!isSupabaseReady()) {
    return partesTrabajo.slice(0, 10)
  }

  const { data, error } = await supabase
    .from("partes_trabajo")
    .select(`
      *,
      clientes(nombre),
      vehiculos(matricula, marca, modelo),
      usuarios(nombre, apellidos)
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching partes trabajo:", error)
    return partesTrabajo.slice(0, 10)
  }

  return data || partesTrabajo.slice(0, 10)
}

// Funciones de materiales
export async function getMateriales() {
  if (!isSupabaseReady()) {
    return materiales
  }

  const { data, error } = await supabase.from("materiales").select("*").eq("activo", true).order("nombre")

  if (error) {
    console.error("Error fetching materiales:", error)
    return materiales
  }

  return data || materiales
}

// Funciones de clientes
export async function getClientesFromDB() {
  if (!isSupabaseReady()) {
    return clientes
  }

  const { data, error } = await supabase.from("clientes").select("*").eq("activo", true).order("nombre")

  if (error) {
    console.error("Error fetching clientes:", error)
    return clientes
  }

  return data || clientes
}

// Permission checks
export const canViewAllWorkOrders = (rol?: string): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canCreateWorkOrders = (rol?: string): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canEditWorkOrders = (rol?: string): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)

export const canValidateWorkOrders = (rol?: string): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)

export const canManageUsers = (rol?: string): boolean => rol === "admin"

export const canManageSettings = (rol?: string): boolean => rol === "admin"

export const canCreateAppointments = (rol?: string): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canManageClients = (rol?: string): boolean => !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const canManageMaterials = (rol?: string): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)

export const fichajesDB = fichajes
export const vacacionesDB = vacaciones
