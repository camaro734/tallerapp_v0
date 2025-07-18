"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarDays, Plus, CheckCircle, Clock, X, Calendar, User, MessageSquare, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { vacacionesDB } from "@/lib/database"
import type { SolicitudVacaciones } from "@/lib/supabase"
import { DatabaseStatus } from "@/components/database-status"

export default function VacacionesPage() {
  const { user, isLoading } = useAuth()
  const [solicitudes, setSolicitudes] = useState<SolicitudVacaciones[]>([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [motivo, setMotivo] = useState("")
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (user) {
      cargarSolicitudes()
    }
  }, [user])

  const cargarSolicitudes = async () => {
    try {
      setCargando(true)
      const filtros = user?.rol === "tecnico" ? { usuario_id: user.id } : {}
      const data = await vacacionesDB.getAll(filtros)
      setSolicitudes(data)
    } catch (error) {
      console.error("Error cargando solicitudes:", error)
    } finally {
      setCargando(false)
    }
  }

  const calcularDias = (inicio: string, fin: string) => {
    if (!inicio || !fin) return 0
    const fechaInicio = new Date(inicio)
    const fechaFin = new Date(fin)
    const diferencia = fechaFin.getTime() - fechaInicio.getTime()
    return Math.ceil(diferencia / (1000 * 3600 * 24)) + 1
  }

  const handleSubmitSolicitud = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await vacacionesDB.create({
        usuario_id: user.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        dias_solicitados: calcularDias(fechaInicio, fechaFin),
        motivo: motivo || undefined,
        estado: "pendiente",
      })

      setMostrarFormulario(false)
      setFechaInicio("")
      setFechaFin("")
      setMotivo("")
      cargarSolicitudes()
    } catch (error) {
      console.error("Error creando solicitud:", error)
    }
  }

  const handleAprobarRechazar = async (id: string, accion: "aprobar" | "rechazar", comentario?: string) => {
    if (!user) return

    try {
      if (accion === "aprobar") {
        await vacacionesDB.aprobar(id, user.id, comentario)
      } else {
        await vacacionesDB.rechazar(id, user.id, comentario || "Solicitud rechazada")
      }
      cargarSolicitudes()
    } catch (error) {
      console.error("Error procesando solicitud:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const solicitudesPendientes = solicitudes.filter((s) => s.estado === "pendiente")
  const vacacionesAprobadas = solicitudes.filter((s) => s.estado === "aprobada")

  return (
    <MainLayout>
      <DatabaseStatus />
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {user.rol === "admin"
                ? "Gestión de Vacaciones"
                : user.rol === "jefe_taller"
                  ? "Calendario de Vacaciones"
                  : "Mis Vacaciones"}
            </h1>
            <p className="text-gray-600">
              {user.rol === "admin"
                ? "Gestión completa de solicitudes y calendario"
                : user.rol === "jefe_taller"
                  ? "Visualización del calendario de ausencias"
                  : "Solicita y consulta tus vacaciones"}
            </p>
          </div>
          {user.rol === "tecnico" && (
            <Button className="industrial-button text-white" onClick={() => setMostrarFormulario(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Solicitar Vacaciones
            </Button>
          )}
        </div>

        {/* Formulario de nueva solicitud (solo técnicos) */}
        {mostrarFormulario && user.rol === "tecnico" && (
          <Card className="mb-6 industrial-card">
            <CardHeader>
              <CardTitle>Nueva Solicitud de Vacaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSolicitud} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fecha-inicio">Fecha de inicio</Label>
                    <Input
                      id="fecha-inicio"
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fecha-fin">Fecha de fin</Label>
                    <Input
                      id="fecha-fin"
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {fechaInicio && fechaFin && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Días solicitados:</strong> {calcularDias(fechaInicio, fechaFin)} días
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="motivo">Motivo (opcional)</Label>
                  <Textarea
                    id="motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Describe brevemente el motivo de tu solicitud..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="industrial-button text-white">
                    Enviar Solicitud
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setMostrarFormulario(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="industrial-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">
                    {user.rol === "tecnico" ? "Mis Solicitudes" : "Total Solicitudes"}
                  </p>
                  <p className="text-xl font-bold">{solicitudes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-xl font-bold">{solicitudesPendientes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Aprobadas</p>
                  <p className="text-xl font-bold">{vacacionesAprobadas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="industrial-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">En Vacaciones</p>
                  <p className="text-xl font-bold">
                    {
                      vacacionesAprobadas.filter((v) => {
                        const hoy = new Date()
                        const inicio = new Date(v.fecha_inicio)
                        const fin = new Date(v.fecha_fin)
                        return hoy >= inicio && hoy <= fin
                      }).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {cargando ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Solicitudes pendientes (solo admin) */}
            {user.rol === "admin" && solicitudesPendientes.length > 0 && (
              <Card className="industrial-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Solicitudes Pendientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {solicitudesPendientes.map((solicitud) => (
                      <div key={solicitud.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {solicitud.usuario?.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold">{solicitud.usuario?.nombre}</h3>
                              <p className="text-sm text-gray-600">{solicitud.motivo || "Sin motivo especificado"}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-amber-300 text-amber-700">
                            {solicitud.estado}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Desde:</span> {solicitud.fecha_inicio}
                          </div>
                          <div>
                            <span className="font-medium">Hasta:</span> {solicitud.fecha_fin}
                          </div>
                          <div>
                            <span className="font-medium">Días:</span> {solicitud.dias_solicitados}
                          </div>
                          <div>
                            <span className="font-medium">Solicitado:</span>{" "}
                            {new Date(solicitud.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                            onClick={() => handleAprobarRechazar(solicitud.id, "aprobar")}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50 flex-1"
                            onClick={() => handleAprobarRechazar(solicitud.id, "rechazar")}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Calendario de vacaciones aprobadas */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  {user.rol === "tecnico" ? "Calendario del Equipo" : "Vacaciones Aprobadas"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vacacionesAprobadas.map((vacacion) => (
                    <div key={vacacion.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarFallback>
                            {vacacion.usuario?.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{vacacion.usuario?.nombre}</h3>
                          <p className="text-sm text-gray-600">{vacacion.motivo || "Sin motivo especificado"}</p>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Período:</span> {vacacion.fecha_inicio} - {vacacion.fecha_fin}
                        </p>
                        <p>
                          <span className="font-medium">Duración:</span> {vacacion.dias_solicitados} días
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mis solicitudes (solo técnicos) */}
            {user.rol === "tecnico" && (
              <Card className="industrial-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Mis Solicitudes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {solicitudes.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className={`p-4 rounded-lg border ${
                          solicitud.estado === "aprobada"
                            ? "bg-green-50 border-green-200"
                            : solicitud.estado === "rechazada"
                              ? "bg-red-50 border-red-200"
                              : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {solicitud.fecha_inicio} - {solicitud.fecha_fin}
                            </p>
                            <p className="text-sm text-gray-600">{solicitud.motivo || "Sin motivo especificado"}</p>
                          </div>
                          <Badge
                            variant={
                              solicitud.estado === "aprobada"
                                ? "default"
                                : solicitud.estado === "rechazada"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {solicitud.estado}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <p>
                            <span className="font-medium">Días:</span> {solicitud.dias_solicitados}
                          </p>
                          <p>
                            <span className="font-medium">Solicitado:</span>{" "}
                            {new Date(solicitud.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {solicitud.comentario_admin && (
                          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-gray-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-gray-600 font-medium">Comentario del administrador:</p>
                                <p className="text-sm text-gray-700">{solicitud.comentario_admin}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {solicitudes.length === 0 && (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No tienes solicitudes de vacaciones</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Información adicional para técnicos */}
        {user.rol === "tecnico" && (
          <Card className="mt-6 industrial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Información Importante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p>Las solicitudes de vacaciones deben realizarse con al menos 15 días de antelación.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p>El administrador revisará tu solicitud en un plazo máximo de 3 días laborables.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p>Puedes consultar el calendario del equipo para evitar conflictos con otros compañeros.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <p>Si tu solicitud es rechazada, recibirás comentarios del administrador con alternativas.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
