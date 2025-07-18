"use client"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  FileText,
  Clock,
  MapPin,
  Play,
  Pause,
  CheckCircle,
  Download,
  FilePenLineIcon as Signature,
  Loader2,
} from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { partesDB, fichajesDB } from "@/lib/database"
import type { ParteTrabajo, Fichaje, Usuario } from "@/lib/supabase"

// Componente para mostrar un único fichaje
const FichajeItem = ({ fichaje }: { fichaje: Fichaje & { usuario?: Usuario } }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${fichaje.tipo === "entrada" ? "bg-green-500" : "bg-red-500"}`} />
      <span className="text-sm font-medium">{fichaje.usuario?.nombre || "Usuario desconocido"}</span>
    </div>
    <span className="text-sm text-gray-600">
      {new Date(fichaje.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  </div>
)

export default function ParteDetallePage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const [parte, setParte] = useState<ParteTrabajo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fichado, setFichado] = useState(false)
  const [isFichajeLoading, setIsFichajeLoading] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [dniCliente, setDniCliente] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchParte = useCallback(async () => {
    if (params.id) {
      try {
        const fetchedParte = await partesDB.getById(params.id as string)
        setParte(fetchedParte)
      } catch (error) {
        console.error("Error fetching parte:", error)
        setParte(null)
      } finally {
        setIsLoading(false)
      }
    }
  }, [params.id])

  useEffect(() => {
    fetchParte()
  }, [fetchParte])

  useEffect(() => {
    const checkFichadoStatus = async () => {
      if (user && parte) {
        const ultimoFichaje = await fichajesDB.getUltimoFichaje(user.id, parte.id)
        setFichado(ultimoFichaje?.tipo === "entrada")
      }
    }
    checkFichadoStatus()
  }, [user, parte])

  const handleFichaje = async () => {
    if (!user || !parte) return

    setIsFichajeLoading(true)

    try {
      if (!fichado) {
        const fichajeActivo = await fichajesDB.getUltimoFichajeActivoPorUsuario(user.id)
        if (fichajeActivo && fichajeActivo.parte_trabajo_id !== parte.id) {
          alert(
            `Ya estás fichado en el parte ${
              fichajeActivo.parte_trabajo?.numero_parte || ""
            }. Debes fichar la salida antes de iniciar un nuevo fichaje.`,
          )
          return
        }
        await fichajesDB.create({
          usuario_id: user.id,
          parte_trabajo_id: parte.id,
          tipo: "entrada",
          fecha_hora: new Date().toISOString(),
        })
      } else {
        await fichajesDB.create({
          usuario_id: user.id,
          parte_trabajo_id: parte.id,
          tipo: "salida",
          fecha_hora: new Date().toISOString(),
        })
        await partesDB.updateHorasReales(parte.id)
      }
      await fetchParte() // Recargar datos para ver el nuevo fichaje
    } catch (error) {
      console.error("Error en el fichaje:", error)
      alert("Ocurrió un error al procesar el fichaje.")
    } finally {
      setIsFichajeLoading(false)
    }
  }

  const handleFileUpload = () => fileInputRef.current?.click()

  const handleCerrarParte = () => {
    if (!dniCliente) {
      alert("El DNI del cliente es obligatorio para cerrar el parte")
      return
    }
    setShowSignature(true)
  }

  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    )
  }

  if (!user) return <LoginForm />
  if (!parte) {
    return (
      <MainLayout>
        <div className="p-4 md:p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">No se pudo cargar el parte de trabajo. Es posible que no exista.</p>
          <Link href="/partes" className="mt-4 inline-block">
            <Button>Volver a Partes</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const FichajeButtonIcon = fichado ? Pause : Play
  const FichajeButtonText = fichado ? "Fichar Salida" : "Fichar Entrada"

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/partes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{parte.numero_parte}</h1>
            <p className="text-gray-600">
              {parte.cliente?.nombre} - {parte.vehiculo?.matricula}
            </p>
          </div>
          <div className="flex gap-2">
            {user.rol !== "tecnico" && (
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            )}
            {user.rol === "tecnico" && parte.estado === "en_curso" && (
              <Button
                variant="outline"
                onClick={handleFichaje}
                disabled={isFichajeLoading}
                className={fichado ? "border-red-300 text-red-700" : "border-green-300 text-green-700"}
              >
                {isFichajeLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FichajeButtonIcon className="h-4 w-4 mr-2" />
                )}
                {isFichajeLoading ? "Procesando..." : FichajeButtonText}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles, Materiales, Documentos... */}
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Detalles del Parte
                  </span>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        parte.estado === "completado"
                          ? "default"
                          : parte.estado === "en_curso"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {parte.estado.replace("_", " ")}
                    </Badge>
                    <Badge
                      className={
                        parte.prioridad === "alta"
                          ? "bg-red-100 text-red-800"
                          : parte.prioridad === "urgente"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {parte.prioridad}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <p className="font-medium">{parte.cliente?.nombre}</p>
                  </div>
                  <div>
                    <Label>Vehículo</Label>
                    <p className="font-medium">
                      {parte.vehiculo?.matricula} - {parte.vehiculo?.marca} {parte.vehiculo?.modelo}
                    </p>
                  </div>
                  <div>
                    <Label>Técnico Asignado</Label>
                    <p className="font-medium">{parte.tecnico?.nombre}</p>
                  </div>
                  <div>
                    <Label>Tipo de Trabajo</Label>
                    <p className="font-medium">{parte.tipo_trabajo}</p>
                  </div>
                  <div>
                    <Label>Fecha de Inicio</Label>
                    <p className="font-medium">{new Date(parte.fecha_inicio).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {parte.ubicacion}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label>Descripción del Trabajo</Label>
                  {isEditing ? (
                    <Textarea defaultValue={parte.descripcion} rows={3} />
                  ) : (
                    <p className="mt-1">{parte.descripcion}</p>
                  )}
                </div>
                <div>
                  <Label>Observaciones</Label>
                  {isEditing ? (
                    <Textarea defaultValue={parte.observaciones} rows={2} />
                  ) : (
                    <p className="mt-1">{parte.observaciones}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Fichajes del Día
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parte.fichajes && parte.fichajes.length > 0 ? (
                    parte.fichajes
                      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
                      .map((fichaje) => <FichajeItem key={fichaje.id} fichaje={fichaje} />)
                  ) : (
                    <p className="text-sm text-gray-500">No hay fichajes en este parte.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parte.estado === "en_curso" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="dni">DNI del Cliente *</Label>
                      <Input
                        id="dni"
                        value={dniCliente}
                        onChange={(e) => setDniCliente(e.target.value)}
                        placeholder="12345678A"
                      />
                    </div>
                    <Button className="w-full industrial-button text-white" onClick={handleCerrarParte}>
                      <Signature className="h-4 w-4 mr-2" />
                      Firmar y Cerrar Parte
                    </Button>
                  </>
                )}
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {showSignature && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Firma Digital del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Signature className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Área de firma digital</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 industrial-button text-white"
                    onClick={() => {
                      setShowSignature(false)
                      alert("Parte cerrado correctamente")
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar y Cerrar
                  </Button>
                  <Button variant="outline" onClick={() => setShowSignature(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
