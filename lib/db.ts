import { v4 as uuidv4 } from "uuid"

// --- 1. TYPE DEFINITIONS ---

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Rol = "admin" | "jefe_taller" | "tecnico" | "recepcion"
export type TipoTrabajo = "reparacion" | "mantenimiento" | "revision"
export type EstadoParte = "pendiente" | "en_curso" | "completado" | "cancelado"
export type PrioridadParte = "baja" | "media" | "alta" | "urgente"
export type TipoFichaje = "entrada" | "salida"
export type TipoFichajeGeneral = "trabajo" | "presencia"
export type UnidadMaterial = "unidad" | "metros" | "litro" | "kg"
export type EstadoCita = "programada" | "completada" | "cancelada"
export type EstadoVacacion = "pendiente" | "aprobada" | "rechazada"

export interface Usuario {
  id: string
  email: string
  nombre: string
  apellidos: string
  rol: Rol
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
  marca: string
  modelo: string
  serie?: string | null
  tipo_vehiculo?: string | null
  año?: number | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface MaterialUtilizado {
  id: string
  parte_trabajo_id: string
  referencia: string
  descripcion: string
  cantidad: number
  unidad: UnidadMaterial
  created_at: string
  updated_at: string
}

export interface ParteTrabajo {
  id: string
  numero_parte: string
  cliente_id?: string | null
  vehiculo_id?: string | null
  tecnico_id?: string | null
  tipo_trabajo?: TipoTrabajo | null
  descripcion: string
  estado: EstadoParte
  prioridad: PrioridadParte
  fecha_inicio?: string | null
  fecha_fin?: string | null
  created_by: string
  validado: boolean
  validado_por?: string | null
  fecha_validacion?: string | null
  firma_cliente?: string | null
  firma_cliente_dni?: string | null
  observaciones?: string | null
  created_at: string
  updated_at: string
  cliente_nombre?: string
  vehiculo_matricula?: string
  vehiculo_marca?: string
  vehiculo_modelo?: string
  vehiculo_serie?: string
  materiales_utilizados?: MaterialUtilizado[]
  horas_estimadas?: number
  horas_reales?: number
  horas_facturables?: number
  descripcion_materiales?: string
  trabajo_realizado?: string
  fecha_firma?: string
  tecnico?: Usuario
  cliente?: Cliente
  vehiculo?: Vehiculo
  fichajes?: Fichaje[]
}

export interface Fichaje {
  id: string
  usuario_id: string
  parte_trabajo_id?: string | null
  tipo: TipoFichajeGeneral
  tipo_fichaje: TipoFichaje
  fecha_hora: string
  observaciones?: string | null
  created_at: string
  updated_at: string
  parte_trabajo?: Partial<ParteTrabajo>
  usuario?: Partial<Usuario>
}

export interface Material {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
  categoria?: string | null
  stock_actual: number
  stock_minimo: number
  precio_unitario: number
  proveedor?: string | null
  ubicacion?: string | null
  unidad: UnidadMaterial
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Cita {
  id: string
  cliente_id?: string | null
  vehiculo_id?: string | null
  fecha_hora: string
  duracion_estimada: number // en minutos
  tipo_servicio: string
  descripcion?: string | null
  estado: EstadoCita
  created_by: string
  created_at: string
  updated_at: string
  cliente_nombre?: string | null
  cliente?: Cliente
  vehiculo?: Vehiculo
}

export interface Vacacion {
  id: string
  usuario_id: string
  fecha_inicio: string
  fecha_fin: string
  estado: EstadoVacacion
  comentarios?: string | null
  aprobado_por?: string | null
  created_at: string
  updated_at: string
  usuario?: Usuario
}

// --- 2. MOCK DATA STORE ---

export const usuariosDB: Usuario[] = [
  {
    id: "1",
    email: "admin@cmgplataformas.com",
    nombre: "Admin",
    apellidos: "CMG",
    rol: "admin",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dni: "00000000A",
    telefono: "600000000",
  },
  {
    id: "2",
    email: "jefe@cmgplataformas.com",
    nombre: "Carlos",
    apellidos: "Martínez",
    rol: "jefe_taller",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dni: "11111111B",
    telefono: "611111111",
  },
  {
    id: "3",
    email: "juan@cmgplataformas.com",
    nombre: "Juan",
    apellidos: "Pérez",
    rol: "tecnico",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dni: "22222222C",
    telefono: "622222222",
  },
  {
    id: "4",
    email: "maria@cmgplataformas.com",
    nombre: "María",
    apellidos: "García",
    rol: "tecnico",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dni: "33333333D",
    telefono: "633333333",
  },
  {
    id: "5",
    email: "recepcion@cmgplataformas.com",
    nombre: "Laura",
    apellidos: "Sánchez",
    rol: "recepcion",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dni: "44444444E",
    telefono: "644444444",
  },
]

export const clientesDB: Cliente[] = [
  {
    id: "c1",
    nombre: "Transportes Rápidos S.L.",
    cif: "B12345678",
    telefono: "912345678",
    email: "contacto@transportesrapidos.com",
    direccion: "Calle Falsa 123, Madrid",
    contacto_principal: "Luis García",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "c2",
    nombre: "Construcciones ABC",
    cif: "A87654321",
    telefono: "934567890",
    email: "info@construccionesabc.es",
    direccion: "Avenida Diagonal 200, Barcelona",
    contacto_principal: "Ana Torres",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const vehiculosDB: Vehiculo[] = [
  {
    id: "v1",
    cliente_id: "c1",
    matricula: "1234 ABC",
    marca: "DAF",
    modelo: "XF",
    serie: "SN12345XYZ",
    tipo_vehiculo: "Camión",
    año: 2020,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "v2",
    cliente_id: "c2",
    matricula: "5678 DEF",
    marca: "MAN",
    modelo: "TGX",
    serie: "SN67890ABC",
    tipo_vehiculo: "Camión Grúa",
    año: 2021,
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const partesTrabajoDB: ParteTrabajo[] = [
  {
    id: "pt1",
    numero_parte: "PT-2023-0001",
    cliente_id: "c1",
    vehiculo_id: "v1",
    tecnico_id: "3",
    tipo_trabajo: "reparacion",
    descripcion: "Fallo en sistema hidráulico de la plataforma.",
    estado: "en_curso",
    prioridad: "alta",
    fecha_inicio: new Date().toISOString(),
    created_by: "2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    validado: false,
    cliente_nombre: "Transportes Rápidos S.L.",
    vehiculo_matricula: "1234 ABC",
    vehiculo_marca: "DAF",
    vehiculo_modelo: "XF",
    vehiculo_serie: "SN12345XYZ",
    fecha_fin: null,
    fecha_validacion: null,
    firma_cliente: null,
    observaciones: null,
    validado_por: null,
    materiales_utilizados: [],
    horas_reales: 0,
  },
  {
    id: "pt2",
    numero_parte: "PT-2023-0002",
    cliente_id: "c2",
    vehiculo_id: "v2",
    tecnico_id: "4",
    tipo_trabajo: "mantenimiento",
    descripcion: "Mantenimiento preventivo anual.",
    estado: "pendiente",
    prioridad: "media",
    created_by: "5",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    validado: false,
    cliente_nombre: "Construcciones ABC",
    vehiculo_matricula: "5678 DEF",
    vehiculo_marca: "MAN",
    vehiculo_modelo: "TGX",
    vehiculo_serie: "SN67890ABC",
    fecha_inicio: null,
    fecha_fin: null,
    fecha_validacion: null,
    firma_cliente: null,
    observaciones: null,
    validado_por: null,
    materiales_utilizados: [],
    horas_reales: 0,
  },
]

export const fichajesDB: Fichaje[] = [
  {
    id: "f1",
    usuario_id: "3",
    parte_trabajo_id: "pt1",
    tipo: "trabajo",
    tipo_fichaje: "entrada",
    fecha_hora: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    observaciones: null,
  },
  {
    id: "f2",
    usuario_id: "4",
    parte_trabajo_id: null,
    tipo: "presencia",
    tipo_fichaje: "entrada",
    fecha_hora: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    observaciones: "Inicio de jornada",
  },
]

export const materialesDB: Material[] = [
  {
    id: "m1",
    codigo: "FIL-001",
    nombre: "Filtro de aceite",
    descripcion: "Filtro de aceite para motor DAF",
    categoria: "Filtros",
    stock_actual: 50,
    stock_minimo: 10,
    precio_unitario: 25.5,
    unidad: "unidad",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proveedor: "Recambios Express",
    ubicacion: "Estantería 3, Fila B",
  },
  {
    id: "m2",
    codigo: "LAT-001",
    nombre: "Latiguillo hidráulico 1/2",
    descripcion: "Latiguillo hidráulico de alta presión",
    categoria: "Latiguillos",
    stock_actual: 100,
    stock_minimo: 20,
    precio_unitario: 15,
    unidad: "metros",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    proveedor: "Hidráulica Global",
    ubicacion: "Almacén 2",
  },
]

export const materialesUtilizadosDB: MaterialUtilizado[] = []

const today = new Date()
const setTime = (date: Date, hours: number, minutes: number) => {
  const newDate = new Date(date)
  newDate.setHours(hours, minutes, 0, 0)
  return newDate.toISOString()
}

export const citasDB: Cita[] = [
  {
    id: "cita1",
    cliente_id: "c1",
    fecha_hora: setTime(today, 9, 0),
    duracion_estimada: 60,
    tipo_servicio: "Revisión",
    descripcion: "Revisión anual de grúa móvil.",
    estado: "programada",
    created_by: "5",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "cita2",
    cliente_id: "c2",
    fecha_hora: setTime(today, 11, 30),
    duracion_estimada: 90,
    tipo_servicio: "Reparación",
    descripcion: "Fallo en sistema hidráulico.",
    estado: "programada",
    created_by: "5",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const vacacionesDB: Vacacion[] = [
  {
    id: "vac1",
    usuario_id: "3",
    fecha_inicio: "2024-08-01",
    fecha_fin: "2024-08-15",
    estado: "aprobada",
    aprobado_por: "2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "vac2",
    usuario_id: "4",
    fecha_inicio: "2024-09-01",
    fecha_fin: "2024-09-05",
    estado: "pendiente",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const passwordsDB = new Map<string, string>([
  ["1", "admin123"],
  ["2", "jefe123"],
  ["3", "juan123"],
  ["4", "maria123"],
  ["5", "recepcion123"],
])

// --- 3. DATABASE ACCESS FUNCTIONS ---

const create = async <T extends { id: string; created_at: string; updated_at: string }>(
  db: T[],
  itemData: Omit<T, "id" | "created_at" | "updated_at">,
): Promise<{ data: T; error: null }> => {
  const newItem = {
    ...itemData,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as T
  db.push(newItem)
  return { data: newItem, error: null }
}

const update = async <T extends { id: string; updated_at: string }>(
  db: T[],
  id: string,
  updates: Partial<Omit<T, "id" | "created_at">>,
): Promise<{ data: T | null; error: { message: string } | null }> => {
  const itemIndex = db.findIndex((i) => i.id === id)
  if (itemIndex === -1) {
    return { data: null, error: { message: "Not found" } }
  }
  const updatedItem = { ...db[itemIndex], ...updates, updated_at: new Date().toISOString() }
  db[itemIndex] = updatedItem
  return { data: updatedItem, error: null }
}

export const authenticateUser = async (email: string, password?: string) => {
  const user = usuariosDB.find((u) => u.email === email)
  if (user && password && passwordsDB.get(user.id) === password) return { data: user, error: null }
  return { data: null, error: { message: "Credenciales inválidas" } }
}

export const getUsuarios = async () => ({ data: usuariosDB, error: null })
export const getUserById = async (id: string) => ({ data: usuariosDB.find((u) => u.id === id) || null, error: null })

export const createUsuario = async (
  userData: Omit<Usuario, "id" | "created_at" | "updated_at" | "activo">,
  password: string,
) => {
  if (usuariosDB.some((u) => u.email === userData.email))
    return { data: null, error: { message: "El email ya está en uso." } }
  const { data: newUser, error } = await create(usuariosDB, { ...userData, activo: true })
  if (newUser) passwordsDB.set(newUser.id, password)
  return { data: newUser, error }
}

export const updateUsuario = async (
  id: string,
  updates: Partial<Omit<Usuario, "id" | "created_at" | "updated_at" | "activo">> & { password?: string },
) => {
  const { password, ...userData } = updates
  const userIndex = usuariosDB.findIndex((u) => u.id === id)
  if (userIndex === -1) {
    return { data: null, error: { message: "Usuario no encontrado." } }
  }
  if (userData.email && usuariosDB.some((u) => u.email === userData.email && u.id !== id)) {
    return { data: null, error: { message: "El email ya está en uso por otro usuario." } }
  }

  const { data, error } = await update(usuariosDB, id, userData)

  if (data && password) {
    passwordsDB.set(id, password)
  }

  return { data, error }
}

export const deleteUsuario = async (id: string) => {
  const userIndex = usuariosDB.findIndex((u) => u.id === id)
  if (userIndex === -1) {
    return { data: null, error: { message: "Usuario no encontrado." } }
  }
  usuariosDB.splice(userIndex, 1)
  passwordsDB.delete(id)
  return { data: { id }, error: null }
}

export const getClientes = async () => ({ data: clientesDB, error: null })
export const createCliente = (data: Omit<Cliente, "id" | "created_at" | "updated_at">) => create(clientesDB, data)
export const updateCliente = (id: string, updates: Partial<Cliente>) => update(clientesDB, id, updates)
export const deleteCliente = async (id: string) => {
  const index = clientesDB.findIndex((c) => c.id === id)
  if (index > -1) {
    clientesDB.splice(index, 1)
    return { data: { id }, error: null }
  }
  return { data: null, error: { message: "Cliente no encontrado" } }
}

export const getVehiculos = async () => ({ data: vehiculosDB, error: null })
export const getVehiculosByClienteId = async (clienteId: string) => ({
  data: vehiculosDB.filter((v) => v.cliente_id === clienteId),
  error: null,
})

export const getAllPartes = async () => {
  const data = partesTrabajoDB.map((pt) => ({
    ...pt,
    cliente: clientesDB.find((c) => c.id === pt.cliente_id),
    vehiculo: vehiculosDB.find((v) => v.id === pt.vehiculo_id),
    tecnico: usuariosDB.find((u) => u.id === pt.tecnico_id),
    cliente_nombre: pt.cliente_nombre || clientesDB.find((c) => c.id === pt.cliente_id)?.nombre,
    vehiculo_matricula: pt.vehiculo_matricula,
  }))
  return { data, error: null }
}
export const getParteById = async (id: string) => {
  const parte = partesTrabajoDB.find((p) => p.id === id)
  if (!parte) return { data: null, error: { message: "Parte no encontrado" } }
  const cliente = clientesDB.find((c) => c.id === parte.cliente_id)
  const vehiculo = vehiculosDB.find((v) => v.id === parte.vehiculo_id)
  const tecnico = usuariosDB.find((u) => u.id === parte.tecnico_id)
  const fichajes = fichajesDB
    .filter((f) => f.parte_trabajo_id === id)
    .map((f) => ({ ...f, usuario: usuariosDB.find((u) => u.id === f.usuario_id) }))
  const data = {
    ...parte,
    cliente,
    vehiculo,
    tecnico,
    fichajes,
    cliente_nombre: parte.cliente_nombre || cliente?.nombre,
  }
  return { data, error: null }
}
export const createParte = (data: Omit<ParteTrabajo, "id" | "created_at" | "updated_at">) =>
  create(partesTrabajoDB, data)
export const updateParte = (id: string, updates: Partial<ParteTrabajo>) => update(partesTrabajoDB, id, updates)

export const getCitas = async () => {
  const data = citasDB.map((c) => ({
    ...c,
    cliente: clientesDB.find((cli) => cli.id === c.cliente_id),
    vehiculo: vehiculosDB.find((v) => v.id === c.vehiculo_id),
  }))
  return { data, error: null }
}
export const createCita = (data: Omit<Cita, "id" | "created_at" | "updated_at">) => create(citasDB, data)
export const updateCita = (id: string, updates: Partial<Cita>) => update(citasDB, id, updates)
export const deleteCita = async (id: string) => {
  const index = citasDB.findIndex((c) => c.id === id)
  if (index > -1) {
    citasDB.splice(index, 1)
    return { data: { id }, error: null }
  }
  return { data: null, error: { message: "Cita no encontrada" } }
}

export const getVacaciones = async () => {
  const data = vacacionesDB.map((v) => ({
    ...v,
    usuario: usuariosDB.find((u) => u.id === v.usuario_id),
  }))
  return { data, error: null }
}
export const createVacacion = (data: Omit<Vacacion, "id" | "created_at" | "updated_at">) => create(vacacionesDB, data)
export const updateVacacion = (id: string, updates: Partial<Vacacion>) => update(vacacionesDB, id, updates)

export const getAllFichajes = async () => {
  const data = fichajesDB.map((f) => ({
    ...f,
    usuario: usuariosDB.find((u) => u.id === f.usuario_id),
    parte_trabajo: partesTrabajoDB.find((p) => p.id === f.parte_trabajo_id),
  }))
  return { data, error: null }
}

export const getFichajesByDateRange = async (usuario_id?: string, fecha_inicio?: string, fecha_fin?: string) => {
  let data = fichajesDB.map((f) => ({
    ...f,
    usuario: usuariosDB.find((u) => u.id === f.usuario_id),
    parte_trabajo: partesTrabajoDB.find((p) => p.id === f.parte_trabajo_id),
  }))

  if (usuario_id) {
    data = data.filter((f) => f.usuario_id === usuario_id)
  }
  if (fecha_inicio) {
    data = data.filter((f) => new Date(f.fecha_hora) >= new Date(fecha_inicio))
  }
  if (fecha_fin) {
    const endDate = new Date(fecha_fin)
    endDate.setHours(23, 59, 59, 999) // Include the whole day
    data = data.filter((f) => new Date(f.fecha_hora) <= endDate)
  }

  return { data, error: null }
}

export const createFichaje = async (fichajeData: Omit<Fichaje, "id" | "created_at" | "updated_at">) => {
  return create(fichajesDB, fichajeData)
}

export const getUltimoFichaje = async (usuario_id: string, parte_trabajo_id: string) => {
  const fichajes = fichajesDB
    .filter((f) => f.usuario_id === usuario_id && f.parte_trabajo_id === parte_trabajo_id)
    .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

  return { data: fichajes[0] || null, error: null }
}

export const getUltimoFichajeActivoPorUsuario = async (usuario_id: string) => {
  const fichajesUsuario = fichajesDB
    .filter((f) => f.usuario_id === usuario_id)
    .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

  const ultimoFichaje = fichajesUsuario[0]

  if (ultimoFichaje && ultimoFichaje.tipo_fichaje === "entrada") {
    const data = {
      ...ultimoFichaje,
      parte_trabajo: partesTrabajoDB.find((p) => p.id === ultimoFichaje.parte_trabajo_id),
    }
    return { data, error: null }
  }

  return { data: null, error: null }
}

export const getUltimoFichajePresencia = async (usuario_id: string) => {
  const fichajesPresencia = fichajesDB
    .filter((f) => f.usuario_id === usuario_id && f.tipo === "presencia")
    .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

  if (fichajesPresencia.length > 0) {
    return { data: fichajesPresencia[0], error: null }
  }
  return { data: null, error: null }
}

export const createFichajePresencia = async (usuario_id: string, tipo_fichaje: TipoFichaje) => {
  const fichajeData = {
    usuario_id,
    tipo: "presencia" as const,
    tipo_fichaje,
    fecha_hora: new Date().toISOString(),
  }
  return create(fichajesDB, fichajeData)
}

export const updateHorasReales = async (parteId: string) => {
  const parte = partesTrabajoDB.find((p) => p.id === parteId)
  if (!parte) return { error: { message: "Parte no encontrado" } }

  const fichajesParte = fichajesDB
    .filter((f) => f.parte_trabajo_id === parteId)
    .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())

  let totalHoras = 0
  const fichajesPorUsuario = new Map<string, Fichaje[]>()

  fichajesParte.forEach((f) => {
    if (!fichajesPorUsuario.has(f.usuario_id)) {
      fichajesPorUsuario.set(f.usuario_id, [])
    }
    fichajesPorUsuario.get(f.usuario_id)!.push(f)
  })

  fichajesPorUsuario.forEach((fichajesUsuario) => {
    let entrada: Date | null = null
    for (const fichaje of fichajesUsuario) {
      if (fichaje.tipo_fichaje === "entrada") {
        entrada = new Date(fichaje.fecha_hora)
      } else if (fichaje.tipo_fichaje === "salida" && entrada) {
        const salida = new Date(fichaje.fecha_hora)
        const diffMs = salida.getTime() - entrada.getTime()
        totalHoras += diffMs / (1000 * 60 * 60)
        entrada = null
      }
    }
  })

  parte.horas_reales = totalHoras
  return { data: parte, error: null }
}

export const getMaterialesByParteId = async (parteId: string) => {
  const data = materialesUtilizadosDB.filter((m) => m.parte_trabajo_id === parteId)
  return { data, error: null }
}

export const searchMateriales = async (term: string) => {
  const lowercasedTerm = term.toLowerCase()
  const data = materialesDB.filter(
    (m) => m.nombre.toLowerCase().includes(lowercasedTerm) || m.codigo.toLowerCase().includes(lowercasedTerm),
  )
  return { data, error: null }
}

export const addMaterialToParte = async (
  parteId: string,
  material: Omit<MaterialUtilizado, "id" | "created_at" | "updated_at" | "parte_trabajo_id">,
) => {
  const materialData = {
    ...material,
    parte_trabajo_id: parteId,
  }
  return create(materialesUtilizadosDB, materialData)
}

export const removeMaterialFromParte = async (parteId: string, materialId: string) => {
  const index = materialesUtilizadosDB.findIndex((m) => m.id === materialId && m.parte_trabajo_id === parteId)
  if (index > -1) {
    materialesUtilizadosDB.splice(index, 1)
    return { data: { id: materialId }, error: null }
  }
  return { data: null, error: { message: "Material no encontrado en este parte." } }
}

// --- 4. PERMISSION CHECKS ---

export const canViewAllWorkOrders = (rol?: Rol): boolean => !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
export const canCreateWorkOrders = (rol?: Rol): boolean => !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
export const canEditWorkOrders = (rol?: Rol): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)
export const canValidateWorkOrders = (rol?: Rol): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)
export const canManageUsers = (rol?: Rol): boolean => rol === "admin"
export const canManageSettings = (rol?: Rol): boolean => rol === "admin"
export const canCreateAppointments = (rol?: Rol): boolean =>
  !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
export const canManageClients = (rol?: Rol): boolean => rol === "admin"
export const canManageMaterials = (rol?: Rol): boolean => !!rol && ["admin", "jefe_taller", "recepcion"].includes(rol)
export const canImportData = (rol?: Rol): boolean => rol === "admin"
export const canRequestVacations = (rol?: Rol): boolean => !!rol
export const canApproveVacations = (rol?: Rol): boolean => !!rol && ["admin", "jefe_taller"].includes(rol)

// --- 5. CONNECTION STATUS ---
export const isSupabaseReady = () =>
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
