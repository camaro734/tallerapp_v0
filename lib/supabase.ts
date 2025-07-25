// Permission functions for role-based access control

export interface User {
  id: string
  email: string
  nombre: string
  apellidos: string
  rol: "admin" | "jefe_taller" | "tecnico" | "recepcion"
  activo: boolean
}

// Client management permissions
export const canManageClients = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canViewClients = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion", "tecnico"].includes(user.rol)
}

export const canCreateClients = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canEditClients = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canDeleteClients = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return user.rol === "admin"
}

// Data import permissions
export const canImportData = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canExportData = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

// Material management permissions
export const canManageMaterials = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canViewMaterials = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion", "tecnico"].includes(user.rol)
}

export const canCreateMaterials = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canEditMaterials = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canDeleteMaterials = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return user.rol === "admin"
}

// Personnel management permissions
export const canManagePersonnel = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canViewPersonnel = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canCreatePersonnel = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return user.rol === "admin"
}

export const canEditPersonnel = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return user.rol === "admin"
}

export const canDeletePersonnel = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return user.rol === "admin"
}

// Work order permissions
export const canManageWorkOrders = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canViewAllWorkOrders = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canCreateWorkOrders = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canEditWorkOrders = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canValidateWorkOrders = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canDeleteWorkOrders = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return user.rol === "admin"
}

// Time tracking permissions
export const canViewAllTimeTracking = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canManageTimeTracking = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

// Vacation management permissions
export const canManageVacations = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

export const canViewAllVacations = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canApproveVacations = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

// Report permissions
export const canViewReports = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canGenerateReports = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

// Settings permissions
export const canManageSettings = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return user.rol === "admin"
}

export const canViewSettings = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

// User management permissions
export const canManageUsers = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return user.rol === "admin"
}

export const canViewUsers = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller"].includes(user.rol)
}

// Calendar/Schedule permissions
export const canManageSchedule = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canViewSchedule = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion", "tecnico"].includes(user.rol)
}

export const canCreateAppointments = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

// Vehicle management permissions
export const canManageVehicles = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
}

export const canViewVehicles = (user?: User): boolean => {
  if (!user || !user.activo) return false
  return ["admin", "jefe_taller", "recepcion", "tecnico"].includes(user.rol)
}

// Helper function to check if user has admin privileges
export const isAdmin = (user?: User): boolean => {
  return user?.rol === "admin" && user.activo
}

// Helper function to check if user is a manager
export const isManager = (user?: User): boolean => {
  return user?.rol === "jefe_taller" && user.activo
}

// Helper function to check if user is a technician
export const isTechnician = (user?: User): boolean => {
  return user?.rol === "tecnico" && user.activo
}

// Helper function to check if user is reception staff
export const isReception = (user?: User): boolean => {
  return user?.rol === "recepcion" && user.activo
}
