import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database functions using Supabase
export const getClientes = async () => {
  const { data, error } = await supabase.from("clientes").select("*").eq("activo", true).order("nombre")

  return { data: data || [], error }
}

export const getVehiculos = async () => {
  const { data, error } = await supabase
    .from("vehiculos")
    .select(`
      *,
      cliente:clientes(*)
    `)
    .eq("activo", true)
    .order("matricula")

  return { data: data || [], error }
}

export const getPartesTrabajo = async () => {
  const { data, error } = await supabase
    .from("partes_trabajo")
    .select(`
      *,
      cliente:clientes(*),
      vehiculo:vehiculos(*),
      tecnico:usuarios(*)
    `)
    .order("created_at", { ascending: false })

  return { data: data || [], error }
}

export const getFichajes = async () => {
  const { data, error } = await supabase
    .from("fichajes")
    .select(`
      *,
      usuario:usuarios(*),
      parte_trabajo:partes_trabajo(*)
    `)
    .order("fecha_hora", { ascending: false })

  return { data: data || [], error }
}

export const getMateriales = async () => {
  const { data, error } = await supabase.from("materiales").select("*").order("nombre")

  return { data: data || [], error }
}

export const getPersonal = async () => {
  const { data, error } = await supabase
    .from("personal")
    .select("*")
    .eq("activo", true)
    .order("apellidos", { ascending: true })

  return { data: data || [], error }
}

export const getVacaciones = async () => {
  const { data, error } = await supabase
    .from("vacaciones")
    .select(`
      *,
      usuario:usuarios(*)
    `)
    .order("fecha_inicio", { ascending: false })

  return { data: data || [], error }
}

export const getCitas = async () => {
  const { data, error } = await supabase
    .from("citas")
    .select(`
      *,
      cliente:clientes(*),
      vehiculo:vehiculos(*),
      tecnico:usuarios(*)
    `)
    .order("fecha_hora")

  return { data: data || [], error }
}

// Authentication
export const authenticateUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { data: null, error }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("activo", true)
    .single()

  if (profileError) return { data: null, error: profileError }

  return { data: profile, error: null }
}
