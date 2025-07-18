"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Clock, User, MapPin, Play, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { partesDB, fichajesDB } from "@/lib/database"
import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { toast } from "@/hooks/use-toast"
import type { ParteTrabajo } from "@/lib/supabase"

export default function PartesPage() {
  const { user } = useAuth()
  const [partes, setPartes] = useState<ParteTrabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  const [empezandoTrabajo, setEmpezandoTrabajo] = useState<string | null>(null)

  useEffect(() => {
    cargarPartes()
  }, [])

  const cargarPartes = async () => {
    try {
      setLoading(true)
      const data = await partesDB.getAll()
      setPartes(data)
    } catch (error) {
      console.error("Error cargando partes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los partes de trabajo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmpezarTrabajo = async (parteId: string) => {
    if (!user) return

    setEmpezandoTrabajo(parteId)

    try {
      // Verificar si el usuario ya tiene un trabajo activo
      const fichajeActivo = await fichajesDB.getUltimoFichajeActivoPorUsuario(user.id)

      if (fichajeActivo) {
        toast({
          title: "Trabajo activo",
          description: `Ya tienes un trabajo activo: ${fichajeActivo.parte_trabajo?.numero_parte || "Sin número"}`,
          variant: "destructive",
        })
        return
      }

      // Crear fichaje de entrada
      await fichajesDB.create({
        usuario_id: user.id,
        parte_trabajo_id: parteId,
        tipo: "entrada",
        fecha_hora: new Date().toISOString(),
        observaciones: "Inicio de trabajo",
      })

      // Actualizar estado del parte
      await partesDB.update(parteId, {
        estado: "en_curso",
      })

      // Recargar partes
      await cargarPartes()

      toast({
        title: "Trabajo iniciado",
        description: "El trabajo ha comenzado correctamente",
      })
    } catch (error) {
      console.error("Error empezando trabajo:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar el trabajo",
        variant: "destructive",
      })
    } finally {
      setEmpezandoTrabajo(null)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "en_curso":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "completado":
        return "bg-green-100 text-green-800 border-green-300"
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-300"
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "baja":
        return "bg-green-100 text-green-800 border-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const partesFiltrados = partes.filter((parte) => {
    const matchesSearch =
      parte.numero_parte?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parte.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parte.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parte.vehiculo?.matricula?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filtroEstado === "todos" || parte.estado === filtroEstado

    return matchesSearch && matchesEstado
  })

  const puedeEmpezarTrabajo = (parte: ParteTrabajo) => {
    if (!user) return false
    if (parte.estado !== "pendiente") return false
    return user.rol === "tecnico" || user.rol === "admin" || user.rol === "jefe_taller"
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partes de Trabajo</h1>
            <p className="text-gray-600">Gestiona los partes de trabajo del taller</p>
          </div>
          <Link href="/partes/nuevo">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Parte
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por número, cliente, descripción o matrícula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en_curso">En Curso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Parts Grid */}
        {partesFiltrados.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay partes de trabajo</h3>
              <p className="text-gray-600 text-center mb-4">
                {searchTerm || filtroEstado !== "todos"
                  ? "No se encontraron partes que coincidan con los filtros"
                  : "Comienza creando tu primer parte de trabajo"}
              </p>
              <Link href="/partes/nuevo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Parte
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {partesFiltrados.map((parte) => (
              <Card key={parte.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{parte.numero_parte}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{parte.cliente?.nombre}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={`${getEstadoColor(parte.estado)} border text-xs`}>
                        {parte.estado?.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={`${getPrioridadColor(parte.prioridad)} border text-xs`}>
                        {parte.prioridad?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{parte.vehiculo?.matricula}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{parte.tecnico?.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{parte.horas_estimadas}h estimadas</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2">{parte.descripcion}</p>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/partes/${parte.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Ver Detalles
                      </Button>
                    </Link>
                    {puedeEmpezarTrabajo(parte) && (
                      <Button
                        size="sm"
                        onClick={() => handleEmpezarTrabajo(parte.id)}
                        disabled={empezandoTrabajo === parte.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {empezandoTrabajo === parte.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Empezar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
