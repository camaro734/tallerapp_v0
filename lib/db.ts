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

// Mock users data
export const usuarios: Usuario[] = [
  {
    id: "admin",
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
    id: "user1",
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
    id: "user2",
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
    id: "jefe1",
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
    id: "recep1",
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
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "1",
    cliente_id: "1",
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
    id: "2",
    cliente_id: "1",
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
    id: "3",
    cliente_id: "2",
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
    id: "1",
    numero_parte: "PT-2024-001",
    cliente_id: "1",
    cliente_nombre: "Transportes García S.L.",
    vehiculo_id: "1",
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
    created_by: "user1",
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
    id: "2",
    numero_parte: "PT-2024-002",
    cliente_id: "2",
    cliente_nombre: "Logística Martínez",
    vehiculo_id: "3",
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
    created_by: "user2",
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
    id: "3",
    numero_parte: "PT-2024-003",
    cliente_id: "3",
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
    created_by: "user1",
    firma_cliente: null,
    dni_cliente: null,
    fotos_adjuntas: [],
    created_at: "2024-01-22T14:00:00Z",
    updated_at: "2024-01-22T14:00:00Z",
  },
]

export const personal: Personal[] = [
  {
    id: "user1",
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
    id: "user2",
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
    id: "admin",
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
    id: "1",
    usuario_id: "user1",
    parte_trabajo_id: "1",
    tipo: "trabajo",
    tipo_fichaje: "entrada",
    fecha_hora: "2024-01-25T08:00:00Z",
    observaciones: "Inicio trabajo en parte PT-2024-001",
    created_at: "2024-01-25T08:00:00Z",
  },
  {
    id: "2",
    usuario_id: "user2",
    parte_trabajo_id: null,
    tipo: "presencia",
    tipo_fichaje: "entrada",
    fecha_hora: "2024-01-25T08:30:00Z",
    observaciones: "Entrada oficina",
    created_at: "2024-01-25T08:30:00Z",
  },
  {
    id: "3",
    usuario_id: "user1",
    parte_trabajo_id: "1",
    tipo: "trabajo",
    tipo_fichaje: "salida",
    fecha_hora: "2024-01-25T12:00:00Z",
    observaciones: "Fin trabajo en parte PT-2024-001",
    created_at: "2024-01-25T12:00:00Z",
  },
]

export const vacaciones: Vacacion[] = [
  {
    id: "1",
    user_id: "user1",
    fecha_inicio: "2024-02-15",
    fecha_fin: "2024-02-25",
    dias_solicitados: 8,
    tipo: "vacaciones",
    estado: "aprobada",
    motivo: "Vacaciones de invierno",
    aprobada_por: "admin",
    fecha_aprobacion: "2024-01-20T10:00:00Z",
    created_at: "2024-01-18T14:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
  },
  {
    id: "2",
    user_id: "user2",
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
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "1",
    usuario_id: "user1",
    fecha: "2024-02-01",
    hora: "09:00",
    motivo: "Revisión de vehículo",
    created_at: "2024-01-20T08:00:00Z",
    updated_at: "2024-01-20T08:00:00Z",
  },
  {
    id: "2",
    usuario_id: "user2",
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
        user = usuarios.find((u) => u.id === "admin")
        break
      case "jefe@cmgplataformas.com":
        user = usuarios.find((u) => u.id === "jefe1")
        break
      case "juan@cmgplataformas.com":
        user = usuarios.find((u) => u.id === "user1")
        break
      case "maria@cmgplataformas.com":
        user = usuarios.find((u) => u.id === "user2")
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

// User functions
export const getUsuarios = async () => ({ data: usuarios, error: null })
export const getUserById = async (id: string) => ({
  data: usuarios.find((u) => u.id === id) || null,
  error: null,
})

// Fichaje functions
export const createFichaje = (fichajeData: Omit<Fichaje, "id" | "created_at">) => {
  const newFichaje: Fichaje = {
    ...fichajeData,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
  }
  fichajes.push(newFichaje)
  return { data: newFichaje, error: null }
}

export const getFichajesByParteId = async (parteId: string) => {
  return { data: fichajes.filter((f) => f.parte_trabajo_id === parteId), error: null }
}

export const getUltimoFichaje = async (usuarioId: string, parteId: string) => {
  const fichajesUsuario = fichajes
    .filter((f) => f.usuario_id === usuarioId && f.parte_trabajo_id === parteId && f.tipo === "trabajo")
    .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
  return { data: fichajesUsuario.length > 0 ? fichajesUsuario[0] : null, error: null }
}

export const getUltimoFichajeActivoPorUsuario = async (usuarioId: string) => {
  const userFichajes = fichajes
    .filter((f) => f.usuario_id === usuarioId && f.tipo === "trabajo")
    .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

  const ultimoFichaje = userFichajes[0]
  if (ultimoFichaje && ultimoFichaje.tipo_fichaje === "entrada") {
    const parte = partesTrabajo.find((p) => p.id === ultimoFichaje.parte_trabajo_id)
    return { data: { ...ultimoFichaje, parte_trabajo: parte }, error: null }
  }
  return { data: null, error: null }
}

export const getUltimoFichajePresencia = async (userId: string) => {
  const userFichajes = fichajes
    .filter((f) => f.usuario_id === userId && f.tipo === "presencia")
    .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
  return { data: userFichajes.length > 0 ? userFichajes[0] : null, error: null }
}

export const createFichajePresencia = async (userId: string, tipoFichaje: "entrada" | "salida") => {
  const fichajeData: Omit<Fichaje, "id" | "created_at"> = {
    usuario_id: userId,
    parte_trabajo_id: null,
    tipo: "presencia",
    tipo_fichaje: tipoFichaje,
    fecha_hora: new Date().toISOString(),
    observaciones: `Fichaje de ${tipoFichaje}`,
  }
  return createFichaje(fichajeData)
}

// Materials functions
export const searchMateriales = async (term: string) => {
  if (!term) return { data: [], error: null }
  const lowerTerm = term.toLowerCase()
  const data = materiales.filter(
    (m) =>
      m.nombre.toLowerCase().includes(lowerTerm) ||
      m.codigo.toLowerCase().includes(lowerTerm) ||
      (m.descripcion && m.descripcion.toLowerCase().includes(lowerTerm)),
  )
  return { data, error: null }
}

export const getMaterialesByParteId = async (parteId: string) => {
  const parte = partesTrabajo.find((p) => p.id === parteId)
  return { data: parte?.fotos_adjuntas || [], error: null }
}

// Work Orders functions
export const getAllPartes = async () => {
  const data = partesTrabajo.map((pt) => {
    const cliente = clientes.find((c) => c.id === pt.cliente_id)
    const vehiculo = vehiculos.find((v) => v.id === pt.vehiculo_id)
    const tecnico = usuarios.find((u) => u.id === pt.tecnico_asignado)
    return {
      ...pt,
      cliente,
      vehiculo,
      tecnico,
      cliente_nombre: cliente?.nombre,
    }
  })
  return { data, error: null }
}

export const getParteById = async (id: string) => {
  const parte = partesTrabajo.find((p) => p.id === id)
  if (!parte) return { data: null, error: { message: "Parte no encontrado" } }

  const cliente = clientes.find((c) => c.id === parte.cliente_id)
  const vehiculo = vehiculos.find((v) => v.id === parte.vehiculo_id)
  const tecnico = usuarios.find((u) => u.id === parte.tecnico_asignado)
  const data = { ...parte, cliente, vehiculo, tecnico }
  return { data, error: null }
}

export const updateParte = (id: string, updates: Partial<ParteTrabajo>) => {
  const itemIndex = partesTrabajo.findIndex((i) => i.id === id)
  if (itemIndex === -1) {
    return { data: null, error: { message: "Not found" } }
  }
  const updatedItem = { ...partesTrabajo[itemIndex], ...updates, updated_at: new Date().toISOString() }
  partesTrabajo[itemIndex] = updatedItem
  return { data: updatedItem, error: null }
}

// Clients & Vehicles functions
export const getClientes = async () => ({ data: clientes, error: null })
export const getVehiculos = async () => ({ data: vehiculos, error: null })

export const getVehiculosByCliente = async (clienteId: string) => {
  return { data: vehiculos.filter((v) => v.cliente_id === clienteId), error: null }
}

// CRUD operations
export const createCliente = async (data: Omit<Cliente, "id" | "created_at" | "updated_at">): Promise<Cliente> => {
  const newCliente: Cliente = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  clientes.push(newCliente)
  return newCliente
}

export const createVehiculo = async (data: Omit<Vehiculo, "id" | "created_at" | "updated_at">): Promise<Vehiculo> => {
  const newVehiculo: Vehiculo = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  vehiculos.push(newVehiculo)
  return newVehiculo
}

export const createParte = (data: Omit<ParteTrabajo, "id" | "numero_parte" | "created_at" | "updated_at">) => {
  const numeroPartes = partesTrabajo.length + 1
  const newParte: ParteTrabajo = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    numero_parte: `PT-2024-${numeroPartes.toString().padStart(3, "0")}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  partesTrabajo.push(newParte)
  return { data: newParte, error: null }
}

export const createParteTrabajo = async (
  data: Omit<ParteTrabajo, "id" | "numero_parte" | "created_at" | "updated_at">,
): Promise<ParteTrabajo> => {
  const numeroPartes = partesTrabajo.length + 1
  const newParte: ParteTrabajo = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    numero_parte: `PT-2024-${numeroPartes.toString().padStart(3, "0")}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  partesTrabajo.push(newParte)
  return newParte
}

export const createPersonal = async (data: Omit<Personal, "id" | "created_at" | "updated_at">): Promise<Personal> => {
  const newPersonal: Personal = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  personal.push(newPersonal)
  return newPersonal
}

export const createVacacion = async (data: Omit<Vacacion, "id" | "created_at" | "updated_at">): Promise<Vacacion> => {
  const newVacacion: Vacacion = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  vacaciones.push(newVacacion)
  return newVacacion
}

export const createMaterial = async (data: Omit<Material, "id" | "created_at" | "updated_at">): Promise<Material> => {
  const newMaterial: Material = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  materiales.push(newMaterial)
  return newMaterial
}

export const createCita = async (data: Omit<Cita, "id" | "created_at" | "updated_at">): Promise<Cita> => {
  const newCita: Cita = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  citas.push(newCita)
  return newCita
}

// Update operations
export const updateParteTrabajo = async (id: string, data: Partial<ParteTrabajo>): Promise<ParteTrabajo | null> => {
  const index = partesTrabajo.findIndex((p) => p.id === id)
  if (index === -1) return null

  partesTrabajo[index] = {
    ...partesTrabajo[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return partesTrabajo[index]
}

export const updatePersonal = async (id: string, data: Partial<Personal>): Promise<Personal | null> => {
  const index = personal.findIndex((p) => p.id === id)
  if (index === -1) return null

  personal[index] = {
    ...personal[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return personal[index]
}

export const updateFichaje = async (id: string, data: Partial<Fichaje>): Promise<Fichaje | null> => {
  const index = fichajes.findIndex((f) => f.id === id)
  if (index === -1) return null

  fichajes[index] = {
    ...fichajes[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return fichajes[index]
}

export const updateVacacion = async (id: string, data: Partial<Vacacion>): Promise<Vacacion | null> => {
  const index = vacaciones.findIndex((v) => v.id === id)
  if (index === -1) return null

  vacaciones[index] = {
    ...vacaciones[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return vacaciones[index]
}

export const updateMaterial = async (id: string, data: Partial<Material>): Promise<Material | null> => {
  const index = materiales.findIndex((m) => m.id === id)
  if (index === -1) return null

  materiales[index] = {
    ...materiales[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return materiales[index]
}

export const updateCita = async (id: string, data: Partial<Cita>): Promise<Cita | null> => {
  const index = citas.findIndex((c) => c.id === id)
  if (index === -1) return null

  citas[index] = {
    ...citas[index],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return citas[index]
}

// Delete operations
export const deleteCliente = async (id: string): Promise<boolean> => {
  const index = clientes.findIndex((c) => c.id === id)
  if (index === -1) return false

  clientes.splice(index, 1)
  return true
}

export const deleteVehiculo = async (id: string): Promise<boolean> => {
  const index = vehiculos.findIndex((v) => v.id === id)
  if (index === -1) return false

  vehiculos.splice(index, 1)
  return true
}

export const deleteParteTrabajo = async (id: string): Promise<boolean> => {
  const index = partesTrabajo.findIndex((p) => p.id === id)
  if (index === -1) return false

  partesTrabajo.splice(index, 1)
  return true
}

export const deletePersonal = async (id: string): Promise<boolean> => {
  const index = personal.findIndex((p) => p.id === id)
  if (index === -1) return false

  personal.splice(index, 1)
  return true
}

export const deleteFichaje = async (id: string): Promise<boolean> => {
  const index = fichajes.findIndex((f) => f.id === id)
  if (index === -1) return false

  fichajes.splice(index, 1)
  return true
}

export const deleteVacacion = async (id: string): Promise<boolean> => {
  const index = vacaciones.findIndex((v) => v.id === id)
  if (index === -1) return false

  vacaciones.splice(index, 1)
  return true
}

export const deleteMaterial = async (id: string): Promise<boolean> => {
  const index = materiales.findIndex((m) => m.id === id)
  if (index === -1) return false

  materiales.splice(index, 1)
  return true
}

export const deleteCita = async (id: string): Promise<boolean> => {
  const index = citas.findIndex((c) => c.id === id)
  if (index === -1) return false

  citas.splice(index, 1)
  return true
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
import { supabase } from "./supabase-client"

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
export const isSupabaseReady = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("usuarios").select("count").limit(1)
    return { connected: !error, error }
  } catch (error) {
    return { connected: false, error }
  }
}

// Export all database functions from supabase-client
export * from "./supabase-client"

// Database utility functions
export async function getUsuariosFromSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("usuarios").select("*")
  if (error) throw error
  return data
}

export async function getClientesFromSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("clientes").select("*")
  if (error) throw error
  return data
}

export async function getVehiculosFromSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("vehiculos").select("*")
  if (error) throw error
  return data
}

export async function getMaterialesFromSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("materiales").select("*")
  if (error) throw error
  return data
}

export async function getPartesTrabajoFromSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("partes_trabajo").select("*")
  if (error) throw error
  return data
}

export async function getFichajesFromSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("fichajes").select("*")
  if (error) throw error
  return data
}

export async function getCitasFromSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("citas").select("*")
  if (error) throw error
  return data
}

export async function getVacacionesFromSupabase() {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("solicitudes_vacaciones").select("*")
  if (error) throw error
  return data
}

export async function getUsuarioByIdFromSupabase(id: string) {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("usuarios").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function getClienteByIdFromSupabase(id: string) {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function getVehiculoByIdFromSupabase(id: string) {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.from("vehiculos").select("*").eq("id", id).single()
  if (error) throw error
  return data
}

export async function getParteTrabajoByIdFromSupabase(id: string) {
  if (!isSupabaseReady()) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase
    .from("partes_trabajo")
    .select(`
      *,
      cliente:clientes(*),
      vehiculo:vehiculos(*),
      tecnico:usuarios(*)
    `)
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export const fichajesDB = fichajes
export const vacacionesDB = vacaciones
