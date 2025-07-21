import type { ParteTrabajo } from "@/lib/db"

export const getClienteName = (parte?: ParteTrabajo | null): string => {
  if (!parte) return "N/A"
  return parte.cliente_nombre || parte.cliente?.nombre || "Cliente no asignado"
}

export const getVehiculoInfo = (parte?: ParteTrabajo | null): string => {
  if (!parte) return "N/A"
  const matricula = parte.vehiculo_matricula || parte.vehiculo?.matricula
  if (!matricula) return "Vehículo no asignado"
  const marca = parte.vehiculo?.marca || ""
  const modelo = parte.vehiculo?.modelo || ""
  return `${marca} ${modelo} (${matricula})`.trim()
}

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    return "Fecha inválida"
  }
}

export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    return "Fecha inválida"
  }
}
