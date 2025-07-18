import { supabase, isSupabaseReady } from "./supabase"
import type {
  Usuario,
  ParteTrabajo,
  Material,
  SolicitudVacaciones,
  Fichaje,
  Cliente,
  Vehiculo,
  Presupuesto,
  Cita,
} from "./supabase"

// Datos mock para desarrollo
const mockUsuarios: Usuario[] = [
  {
    id: "1",
    email: "admin@cmghidraulica.com",
    nombre: "Administrador CMG",
    rol: "admin",
    telefono: "666 000 001",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    email: "jefe@cmghidraulica.com",
    nombre: "Jefe de Taller",
    rol: "jefe_taller",
    telefono: "666 000 002",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    email: "juan@cmghidraulica.com",
    nombre: "Juan Pérez",
    rol: "tecnico",
    telefono: "666 123 456",
    activo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Array vacío de partes - sin datos de ejemplo
const mockPartes: ParteTrabajo[] = []

// Array vacío de clientes - sin datos de ejemplo
const mockClientes: any[] = []

// Array para fichajes en modo de prueba
const mockFichajes: Fichaje[] = []

const mockSolicitudesVacaciones: SolicitudVacaciones[] = [
  {
    id: "1",
    usuario_id: "3",
    fecha_inicio: "2024-02-15",
    fecha_fin: "2024-02-22",
    dias_solicitados: 6,
    motivo: "Vacaciones familiares",
    estado: "pendiente",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    usuario: mockUsuarios[2],
  },
]

// Funciones para Usuarios
export const usuariosDB = {
  async getAll(): Promise<Usuario[]> {
    if (!isSupabaseReady()) {
      return mockUsuarios.filter((u) => u.activo)
    }

    const { data, error } = await supabase!.from("usuarios").select("*").eq("activo", true).order("nombre")
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Usuario | null> {
    if (!isSupabaseReady()) {
      return mockUsuarios.find((u) => u.id === id) || null
    }

    const { data, error } = await supabase!.from("usuarios").select("*").eq("id", id).single()
    if (error) throw error
    return data
  },

  async getByEmail(email: string): Promise<Usuario | null> {
    if (!isSupabaseReady()) {
      return mockUsuarios.find((u) => u.email === email && u.activo) || null
    }

    const { data, error } = await supabase!.from("usuarios").select("*").eq("email", email).eq("activo", true).single()
    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async create(usuario: Omit<Usuario, "id" | "created_at" | "updated_at">): Promise<Usuario> {
    if (!isSupabaseReady()) {
      const newUser = {
        ...usuario,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockUsuarios.push(newUser)
      return newUser
    }

    const { data, error } = await supabase!.from("usuarios").insert(usuario).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Usuario>): Promise<Usuario> {
    if (!isSupabaseReady()) {
      const index = mockUsuarios.findIndex((u) => u.id === id)
      if (index === -1) throw new Error("Usuario no encontrado")
      mockUsuarios[index] = { ...mockUsuarios[index], ...updates, updated_at: new Date().toISOString() }
      return mockUsuarios[index]
    }

    const { data, error } = await supabase!.from("usuarios").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  },
}

// Funciones para Partes de Trabajo
export const partesDB = {
  async getAll(filtros?: {
    estado?: string
    tecnico_id?: string
    cliente_id?: string
  }): Promise<ParteTrabajo[]> {
    if (!isSupabaseReady()) {
      let result = [...mockPartes]

      if (filtros?.estado) {
        result = result.filter((p) => p.estado === filtros.estado)
      }
      if (filtros?.tecnico_id) {
        result = result.filter((p) => p.tecnico_id === filtros.tecnico_id)
      }
      if (filtros?.cliente_id) {
        result = result.filter((p) => p.cliente_id === filtros.cliente_id)
      }

      return result
    }

    let query = supabase!
      .from("partes_trabajo")
      .select(`
        *,
        cliente:clientes(*),
        vehiculo:vehiculos(*),
        tecnico:usuarios(*),
        materiales:parte_materiales(
          *,
          material:materiales(*)
        )
      `)
      .order("created_at", { ascending: false })

    if (filtros?.estado) {
      query = query.eq("estado", filtros.estado)
    }
    if (filtros?.tecnico_id) {
      query = query.eq("tecnico_id", filtros.tecnico_id)
    }
    if (filtros?.cliente_id) {
      query = query.eq("cliente_id", filtros.cliente_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<ParteTrabajo | null> {
    if (!isSupabaseReady()) {
      return mockPartes.find((p) => p.id === id) || null
    }

    const { data, error } = await supabase!
      .from("partes_trabajo")
      .select(`
        *,
        cliente:clientes(*),
        vehiculo:vehiculos(*),
        tecnico:usuarios(*),
        materiales:parte_materiales(
          *,
          material:materiales(*)
        ),
        fichajes:fichajes(
          *,
          usuario:usuarios(*)
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  async create(parteData: {
    cliente_nombre: string
    cliente_telefono: string
    cliente_email?: string
    cliente_direccion?: string
    matricula: string
    marca?: string
    modelo?: string
    serie?: string
    año?: string
    tecnico_id: string
    tipo_trabajo: string
    descripcion: string
    prioridad: string
    horas_estimadas: number
    ubicacion?: string
    observaciones?: string
    materiales?: Array<{
      nombre: string
      cantidad: number
      precio: number
    }>
  }): Promise<ParteTrabajo> {
    if (!isSupabaseReady()) {
      // Crear cliente mock
      const clienteId = Date.now().toString()
      const cliente = {
        id: clienteId,
        nombre: parteData.cliente_nombre,
        telefono: parteData.cliente_telefono,
        email: parteData.cliente_email,
        direccion: parteData.cliente_direccion,
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockClientes.push(cliente)

      // Crear vehículo mock
      const vehiculoId = (Date.now() + 1).toString()
      const vehiculo = {
        id: vehiculoId,
        cliente_id: clienteId,
        matricula: parteData.matricula,
        marca: parteData.marca,
        modelo: parteData.modelo,
        serie: parteData.serie,
        año: parteData.año,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Crear parte mock
      const parteId = (Date.now() + 2).toString()
      const newParte: ParteTrabajo = {
        id: parteId,
        numero_parte: `PT-2024-${String(mockPartes.length + 1).padStart(3, "0")}`,
        cliente_id: clienteId,
        vehiculo_id: vehiculoId,
        tecnico_id: parteData.tecnico_id,
        tipo_trabajo: parteData.tipo_trabajo,
        descripcion: parteData.descripcion,
        estado: "pendiente",
        prioridad: parteData.prioridad,
        fecha_inicio: new Date().toISOString().split("T")[0],
        horas_estimadas: parteData.horas_estimadas,
        horas_reales: 0,
        ubicacion: parteData.ubicacion,
        observaciones: parteData.observaciones,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        cliente,
        vehiculo,
        tecnico: mockUsuarios.find((u) => u.id === parteData.tecnico_id),
      }

      mockPartes.push(newParte)
      return newParte
    }

    // Lógica para Supabase (cuando esté configurado)
    const { data, error } = await supabase!
      .from("partes_trabajo")
      .insert({
        cliente_id: parteData.cliente_nombre, // Esto se manejaría diferente con Supabase
        vehiculo_id: parteData.matricula,
        tecnico_id: parteData.tecnico_id,
        tipo_trabajo: parteData.tipo_trabajo,
        descripcion: parteData.descripcion,
        prioridad: parteData.prioridad,
        horas_estimadas: parteData.horas_estimadas,
        ubicacion: parteData.ubicacion,
        observaciones: parteData.observaciones,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<ParteTrabajo>): Promise<ParteTrabajo> {
    if (!isSupabaseReady()) {
      const index = mockPartes.findIndex((p) => p.id === id)
      if (index === -1) throw new Error("Parte no encontrado")
      mockPartes[index] = { ...mockPartes[index], ...updates, updated_at: new Date().toISOString() }
      return mockPartes[index]
    }

    const { data, error } = await supabase!.from("partes_trabajo").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseReady()) {
      const index = mockPartes.findIndex((p) => p.id === id)
      if (index === -1) throw new Error("Parte no encontrado")
      mockPartes.splice(index, 1)
      return
    }

    const { error } = await supabase!.from("partes_trabajo").delete().eq("id", id)
    if (error) throw error
  },

  async updateHorasReales(id: string): Promise<void> {
    if (!isSupabaseReady()) {
      // Mock: no hacer nada
      return
    }

    const { error } = await supabase!.rpc("calcular_horas_trabajadas", { parte_id: id })
    if (error) throw error
  },
}

// Funciones para Fichajes
export const fichajesDB = {
  async getByParte(parteId: string): Promise<Fichaje[]> {
    if (!isSupabaseReady()) {
      return mockFichajes.filter((f) => f.parte_trabajo_id === parteId)
    }

    const { data, error } = await supabase!
      .from("fichajes")
      .select(`
        *,
        usuario:usuarios(*)
      `)
      .eq("parte_trabajo_id", parteId)
      .order("fecha_hora")

    if (error) throw error
    return data || []
  },

  async getByUsuario(usuarioId: string, fecha?: string): Promise<Fichaje[]> {
    if (!isSupabaseReady()) {
      let result = mockFichajes.filter((f) => f.usuario_id === usuarioId)

      if (fecha) {
        result = result.filter((f) => f.fecha_hora.startsWith(fecha))
      }

      return result.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
    }

    let query = supabase!
      .from("fichajes")
      .select(`
        *,
        parte_trabajo:partes_trabajo(numero_parte, descripcion)
      `)
      .eq("usuario_id", usuarioId)
      .order("fecha_hora", { ascending: false })

    if (fecha) {
      query = query.gte("fecha_hora", `${fecha}T00:00:00`).lt("fecha_hora", `${fecha}T23:59:59`)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async create(fichaje: Omit<Fichaje, "id" | "created_at">): Promise<Fichaje> {
    if (!isSupabaseReady()) {
      const newFichaje = {
        ...fichaje,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      }
      mockFichajes.push(newFichaje)
      return newFichaje
    }

    const { data, error } = await supabase!.from("fichajes").insert(fichaje).select().single()
    if (error) throw error
    return data
  },

  async getUltimoFichaje(usuarioId: string, parteId: string): Promise<Fichaje | null> {
    if (!isSupabaseReady()) {
      const fichajesDelParte = mockFichajes.filter((f) => f.usuario_id === usuarioId && f.parte_trabajo_id === parteId)
      if (fichajesDelParte.length === 0) return null
      return fichajesDelParte.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())[0]
    }

    const { data, error } = await supabase!
      .from("fichajes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .eq("parte_trabajo_id", parteId)
      .order("fecha_hora", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  async getUltimoFichajeActivoPorUsuario(
    usuarioId: string,
  ): Promise<(Fichaje & { parte_trabajo?: { numero_parte: string } }) | null> {
    if (!isSupabaseReady()) {
      const fichajesDelUsuario = mockFichajes.filter((f) => f.usuario_id === usuarioId)
      if (fichajesDelUsuario.length === 0) return null

      const ultimoFichaje = fichajesDelUsuario.sort(
        (a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime(),
      )[0]

      if (ultimoFichaje && ultimoFichaje.tipo === "entrada") {
        const parteAsociado = mockPartes.find((p) => p.id === ultimoFichaje.parte_trabajo_id)
        return {
          ...ultimoFichaje,
          parte_trabajo: parteAsociado ? { numero_parte: parteAsociado.numero_parte } : undefined,
        }
      }
      return null
    }

    const { data, error } = await supabase!
      .from("fichajes")
      .select("*, parte_trabajo:partes_trabajo(numero_parte)")
      .eq("usuario_id", usuarioId)
      .order("fecha_hora", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching last fichaje:", error)
      throw error
    }

    if (data && data.tipo === "entrada") {
      return data
    }

    return null
  },

  // Nueva función para obtener el último fichaje de presencia
  async getUltimoFichajePresencia(usuarioId: string): Promise<Fichaje | null> {
    if (!isSupabaseReady()) {
      const fichajesPresencia = mockFichajes.filter((f) => f.usuario_id === usuarioId && f.parte_trabajo_id === null)
      if (fichajesPresencia.length === 0) return null
      return fichajesPresencia.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())[0]
    }

    const { data, error } = await supabase!
      .from("fichajes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .is("parte_trabajo_id", null)
      .order("fecha_hora", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  // Nueva función para obtener fichajes por rango de fechas
  async getByDateRange(usuarioId?: string, fechaInicio?: string, fechaFin?: string): Promise<Fichaje[]> {
    if (!isSupabaseReady()) {
      let result = [...mockFichajes]

      if (usuarioId) {
        result = result.filter((f) => f.usuario_id === usuarioId)
      }

      if (fechaInicio) {
        result = result.filter((f) => f.fecha_hora >= fechaInicio)
      }

      if (fechaFin) {
        result = result.filter((f) => f.fecha_hora <= fechaFin + "T23:59:59")
      }

      return result.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
    }

    let query = supabase!
      .from("fichajes")
      .select(`
        *,
        usuario:usuarios(*),
        parte_trabajo:partes_trabajo(numero_parte, descripcion)
      `)
      .order("fecha_hora")

    if (usuarioId) {
      query = query.eq("usuario_id", usuarioId)
    }

    if (fechaInicio) {
      query = query.gte("fecha_hora", `${fechaInicio}T00:00:00`)
    }

    if (fechaFin) {
      query = query.lte("fecha_hora", `${fechaFin}T23:59:59`)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },
}

// Funciones para Materiales
export const materialesDB = {
  async getAll(): Promise<Material[]> {
    if (!isSupabaseReady()) {
      return []
    }

    const { data, error } = await supabase!.from("materiales").select("*").eq("activo", true).order("nombre")
    if (error) throw error
    return data || []
  },

  async getStockBajo(): Promise<Material[]> {
    if (!isSupabaseReady()) {
      return []
    }

    const { data, error } = await supabase!
      .from("materiales")
      .select("*")
      .eq("activo", true)
      .filter("stock_actual", "lte", "stock_minimo")
      .order("nombre")

    if (error) throw error
    return data || []
  },

  async update(id: string, updates: Partial<Material>): Promise<Material> {
    if (!isSupabaseReady()) {
      throw new Error("Función no disponible en modo mock")
    }

    const { data, error } = await supabase!.from("materiales").update(updates).eq("id", id).select().single()
    if (error) throw error
    return data
  },
}

// Funciones para Solicitudes de Vacaciones
export const vacacionesDB = {
  async getAll(filtros?: { usuario_id?: string; estado?: string }): Promise<SolicitudVacaciones[]> {
    if (!isSupabaseReady()) {
      let result = [...mockSolicitudesVacaciones]

      if (filtros?.usuario_id) {
        result = result.filter((s) => s.usuario_id === filtros.usuario_id)
      }
      if (filtros?.estado) {
        result = result.filter((s) => s.estado === filtros.estado)
      }

      return result
    }

    let query = supabase!
      .from("solicitudes_vacaciones")
      .select(`
        *,
        usuario:usuarios(*),
        aprobador:usuarios!solicitudes_vacaciones_aprobado_por_fkey(*)
      `)
      .order("created_at", { ascending: false })

    if (filtros?.usuario_id) {
      query = query.eq("usuario_id", filtros.usuario_id)
    }
    if (filtros?.estado) {
      query = query.eq("estado", filtros.estado)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async create(solicitud: Omit<SolicitudVacaciones, "id" | "created_at" | "updated_at">): Promise<SolicitudVacaciones> {
    if (!isSupabaseReady()) {
      const newSolicitud = {
        ...solicitud,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockSolicitudesVacaciones.push(newSolicitud)
      return newSolicitud
    }

    const { data, error } = await supabase!.from("solicitudes_vacaciones").insert(solicitud).select().single()
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<SolicitudVacaciones>): Promise<SolicitudVacaciones> {
    if (!isSupabaseReady()) {
      const index = mockSolicitudesVacaciones.findIndex((s) => s.id === id)
      if (index === -1) throw new Error("Solicitud no encontrada")
      mockSolicitudesVacaciones[index] = {
        ...mockSolicitudesVacaciones[index],
        ...updates,
        updated_at: new Date().toISOString(),
      }
      return mockSolicitudesVacaciones[index]
    }

    const { data, error } = await supabase!
      .from("solicitudes_vacaciones")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async aprobar(id: string, aprobadoPor: string, comentario?: string): Promise<SolicitudVacaciones> {
    if (!isSupabaseReady()) {
      return this.update(id, {
        estado: "aprobada",
        aprobado_por: aprobadoPor,
        comentario_admin: comentario,
        fecha_aprobacion: new Date().toISOString(),
      })
    }

    const { data, error } = await supabase!
      .from("solicitudes_vacaciones")
      .update({
        estado: "aprobada",
        aprobado_por: aprobadoPor,
        comentario_admin: comentario,
        fecha_aprobacion: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async rechazar(id: string, aprobadoPor: string, comentario: string): Promise<SolicitudVacaciones> {
    if (!isSupabaseReady()) {
      return this.update(id, {
        estado: "rechazada",
        aprobado_por: aprobadoPor,
        comentario_admin: comentario,
        fecha_aprobacion: new Date().toISOString(),
      })
    }

    const { data, error } = await supabase!
      .from("solicitudes_vacaciones")
      .update({
        estado: "rechazada",
        aprobado_por: aprobadoPor,
        comentario_admin: comentario,
        fecha_aprobacion: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Funciones para Clientes
export const clientesDB = {
  async getAll(): Promise<Cliente[]> {
    if (!isSupabaseReady()) {
      return mockClientes
    }

    const { data, error } = await supabase!.from("clientes").select("*").eq("activo", true).order("nombre")
    if (error) throw error
    return data || []
  },

  async getById(id: string): Promise<Cliente | null> {
    if (!isSupabaseReady()) {
      return mockClientes.find((c) => c.id === id) || null
    }

    const { data, error } = await supabase!.from("clientes").select("*").eq("id", id).single()
    if (error) throw error
    return data
  },

  async bulkCreate(clients: Omit<Cliente, "id" | "created_at" | "updated_at">[]): Promise<Cliente[]> {
    if (!isSupabaseReady()) {
      const newClients = clients.map((client, index) => ({
        ...client,
        id: (Date.now() + index).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      mockClientes.push(...newClients)
      return newClients
    }

    const { data, error } = await supabase!.from("clientes").insert(clients).select()
    if (error) throw error
    return data
  },
}

// Funciones para Vehículos
export const vehiculosDB = {
  async getAll(): Promise<Vehiculo[]> {
    if (!isSupabaseReady()) {
      return []
    }

    const { data, error } = await supabase!
      .from("vehiculos")
      .select(`
        *,
        cliente:clientes(*)
      `)
      .order("matricula")

    if (error) throw error
    return data || []
  },

  async getByCliente(clienteId: string): Promise<Vehiculo[]> {
    if (!isSupabaseReady()) {
      return []
    }

    const { data, error } = await supabase!
      .from("vehiculos")
      .select(`
        *,
        cliente:clientes(*)
      `)
      .eq("cliente_id", clienteId)
      .order("matricula")

    if (error) throw error
    return data || []
  },
}

// Funciones para Presupuestos
export const presupuestosDB = {
  async getAll(filtros?: { estado?: string; cliente_id?: string }): Promise<Presupuesto[]> {
    if (!isSupabaseReady()) {
      return []
    }

    let query = supabase!
      .from("presupuestos")
      .select(`
        *,
        cliente:clientes(*),
        vehiculo:vehiculos(*),
        creador:usuarios!presupuestos_created_by_fkey(*)
      `)
      .order("created_at", { ascending: false })

    if (filtros?.estado) {
      query = query.eq("estado", filtros.estado)
    }
    if (filtros?.cliente_id) {
      query = query.eq("cliente_id", filtros.cliente_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },
}

// Funciones para Citas
export const citasDB = {
  async getAll(filtros?: {
    fecha?: string
    tecnico_id?: string
    estado?: string
  }): Promise<Cita[]> {
    if (!isSupabaseReady()) {
      return []
    }

    let query = supabase!
      .from("citas")
      .select(`
        *,
        cliente:clientes(*),
        vehiculo:vehiculos(*),
        tecnico:usuarios!citas_tecnico_id_fkey(*),
        creador:usuarios!citas_created_by_fkey(*)
      `)
      .order("fecha_hora")

    if (filtros?.fecha) {
      query = query.gte("fecha_hora", `${filtros.fecha}T00:00:00`).lt("fecha_hora", `${filtros.fecha}T23:59:59`)
    }
    if (filtros?.tecnico_id) {
      query = query.eq("tecnico_id", filtros.tecnico_id)
    }
    if (filtros?.estado) {
      query = query.eq("estado", filtros.estado)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },
}
