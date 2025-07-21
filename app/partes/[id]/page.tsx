"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import "jspdf-autotable"
import {
  ArrowLeft,
  FileText,
  Clock,
  MapPin,
  Play,
  Pause,
  CheckCircle,
  Download,
  Loader2,
  Package,
  Trash2,
  Search,
} from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

import {
  getParteById,
  updateParte,
  getMaterialesByParteId,
  searchMateriales,
  addMaterialToParte,
  removeMaterialFromParte,
  createFichaje,
  getUltimoFichaje,
  getUltimoFichajeActivoPorUsuario,
  updateHorasReales,
} from "@/lib/db"
import type { ParteTrabajo, Fichaje, Material, MaterialUtilizado, Usuario, UnidadMaterial } from "@/lib/db"

// Componente para mostrar un único fichaje
const FichajeItem = ({ fichaje }: { fichaje: Fichaje & { usuario?: Partial<Usuario> } }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${fichaje.tipo_fichaje === "entrada" ? "bg-green-500" : "bg-red-500"}`} />
      <span className="text-sm font-medium">{fichaje.usuario?.nombre || "Usuario desconocido"}</span>
    </div>
    <span className="text-sm text-gray-600">
      {new Date(fichaje.fecha_hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
  </div>
)

// Modal para trabajo realizado
const TrabajoRealizadoModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (trabajo: string) => void
}) => {
  const [trabajo, setTrabajo] = useState("")

  const handleSave = () => {
    if (!trabajo.trim()) {
      toast({
        title: "Campo requerido",
        description: "Debes describir el trabajo realizado",
        variant: "destructive",
      })
      return
    }
    onSave(trabajo.trim())
    setTrabajo("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Trabajo Realizado</DialogTitle>
          <DialogDescription>Describe detalladamente el trabajo que se ha realizado en este parte</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trabajo_realizado">Descripción del Trabajo *</Label>
            <Textarea
              id="trabajo_realizado"
              value={trabajo}
              onChange={(e) => setTrabajo(e.target.value)}
              placeholder="Describe el trabajo realizado, materiales utilizados, problemas encontrados, etc..."
              rows={6}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Guardar y Cerrar Parte
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Modal para gestión de materiales
const MaterialesModal = ({
  isOpen,
  onClose,
  parteId,
  onMaterialesUpdated,
}: {
  isOpen: boolean
  onClose: () => void
  parteId: string
  onMaterialesUpdated: () => void
}) => {
  const [materiales, setMateriales] = useState<MaterialUtilizado[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Material[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [cantidadBusqueda, setCantidadBusqueda] = useState(1)
  const [referenciaManual, setReferenciaManual] = useState("")
  const [descripcionManual, setDescripcionManual] = useState("")
  const [cantidadManual, setCantidadManual] = useState(1)
  const [unidadManual, setUnidadManual] = useState<UnidadMaterial>("unidad")

  const unidadesDisponibles: UnidadMaterial[] = ["unidad", "metros", "litro", "kg"]

  const cargarMateriales = useCallback(async () => {
    const { data } = await getMaterialesByParteId(parteId)
    setMateriales(data || [])
  }, [parteId])

  useEffect(() => {
    if (isOpen) {
      cargarMateriales()
    }
  }, [isOpen, cargarMateriales])

  useEffect(() => {
    const search = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      const { data } = await searchMateriales(searchTerm)
      setSearchResults(data || [])
      setIsSearching(false)
    }
    const debounceTimer = setTimeout(search, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleAddMaterial = async (material: Omit<MaterialUtilizado, "id">) => {
    const { error } = await addMaterialToParte(parteId, material)
    if (error) {
      toast({ title: "Error", description: "No se pudo añadir el material", variant: "destructive" })
    } else {
      toast({ title: "Material añadido" })
      await cargarMateriales()
      onMaterialesUpdated()
    }
  }

  const agregarMaterialBusqueda = async () => {
    if (!selectedMaterial || cantidadBusqueda <= 0) return
    if (cantidadBusqueda > selectedMaterial.stock_actual) {
      toast({
        title: "Stock insuficiente",
        description: `Disponible: ${selectedMaterial.stock_actual} ${selectedMaterial.unidad}`,
        variant: "destructive",
      })
      return
    }
    await handleAddMaterial({
      referencia: selectedMaterial.codigo,
      descripcion: selectedMaterial.nombre,
      cantidad: cantidadBusqueda,
      unidad: selectedMaterial.unidad,
    })
    setSelectedMaterial(null)
    setCantidadBusqueda(1)
  }

  const agregarMaterialManual = async () => {
    if (!referenciaManual.trim() || !descripcionManual.trim() || cantidadManual <= 0) return
    await handleAddMaterial({
      referencia: referenciaManual.trim(),
      descripcion: descripcionManual.trim(),
      cantidad: cantidadManual,
      unidad: unidadManual,
    })
    setReferenciaManual("")
    setDescripcionManual("")
    setCantidadManual(1)
  }

  const eliminarMaterial = async (materialId: string) => {
    const { error } = await removeMaterialFromParte(parteId, materialId)
    if (error) {
      toast({ title: "Error", description: "No se pudo eliminar el material", variant: "destructive" })
    } else {
      toast({ title: "Material eliminado" })
      await cargarMateriales()
      onMaterialesUpdated()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gestión de Materiales</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Columna Izquierda: Añadir Material */}
          <div className="space-y-4">
            <Tabs defaultValue="buscar" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buscar">Buscar Material</TabsTrigger>
                <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
              </TabsList>
              <TabsContent value="buscar" className="space-y-4 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por código o nombre..."
                    className="pl-10"
                  />
                </div>
                {isSearching && <p className="text-sm text-gray-500">Buscando...</p>}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {searchResults.map((material) => (
                      <div
                        key={material.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedMaterial(material)}
                      >
                        <p className="font-medium">{material.nombre}</p>
                        <p className="text-sm text-gray-500">{material.codigo}</p>
                      </div>
                    ))}
                  </div>
                )}
                {selectedMaterial && (
                  <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                    <p>
                      Seleccionado: <span className="font-semibold">{selectedMaterial.nombre}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={cantidadBusqueda}
                        onChange={(e) => setCantidadBusqueda(Number(e.target.value))}
                        className="w-20"
                      />
                      <span>{selectedMaterial.unidad}</span>
                      <Button onClick={agregarMaterialBusqueda} size="sm" className="ml-auto">
                        Añadir
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="manual" className="space-y-4 pt-4">
                <Input
                  value={referenciaManual}
                  onChange={(e) => setReferenciaManual(e.target.value)}
                  placeholder="Referencia"
                />
                <Input
                  value={descripcionManual}
                  onChange={(e) => setDescripcionManual(e.target.value)}
                  placeholder="Descripción"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={cantidadManual}
                    onChange={(e) => setCantidadManual(Number(e.target.value))}
                    placeholder="Cantidad"
                    className="w-24"
                  />
                  <Select value={unidadManual} onValueChange={(v) => setUnidadManual(v as UnidadMaterial)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {unidadesDisponibles.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={agregarMaterialManual} className="w-full">
                  Añadir Manualmente
                </Button>
              </TabsContent>
            </Tabs>
          </div>
          {/* Columna Derecha: Materiales Añadidos */}
          <div className="space-y-2">
            <h3 className="font-semibold">Materiales en este Parte</h3>
            <div className="border rounded-lg p-2 space-y-2 max-h-80 overflow-y-auto">
              {materiales.length > 0 ? (
                materiales.map((mat) => (
                  <div key={mat.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <div>
                      <p className="font-medium">{mat.descripcion}</p>
                      <p className="text-sm text-gray-500">
                        {mat.cantidad} {mat.unidad} ({mat.referencia})
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => eliminarMaterial(mat.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay materiales añadidos.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ParteDetallePage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const id = params.id as string

  const [parte, setParte] = useState<ParteTrabajo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [fichado, setFichado] = useState(false)
  const [isFichajeLoading, setIsFichajeLoading] = useState(false)
  const [showTrabajoModal, setShowTrabajoModal] = useState(false)
  const [showMaterialesModal, setShowMaterialesModal] = useState(false)

  const fetchParte = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    const { data, error } = await getParteById(id)
    if (data) {
      setParte(data)
    } else {
      toast({ title: "Error", description: "No se pudo cargar el parte.", variant: "destructive" })
      setParte(null)
    }
    setIsLoading(false)
  }, [id])

  useEffect(() => {
    fetchParte()
  }, [fetchParte])

  useEffect(() => {
    const checkFichadoStatus = async () => {
      if (user && parte) {
        const { data: ultimoFichaje } = await getUltimoFichaje(user.id, parte.id)
        setFichado(ultimoFichaje?.tipo_fichaje === "entrada")
      }
    }
    checkFichadoStatus()
  }, [user, parte])

  const handleFichaje = async (accion: "entrada" | "salida") => {
    if (!user || !parte) return
    setIsFichajeLoading(true)
    try {
      if (accion === "entrada") {
        const { data: fichajeActivo } = await getUltimoFichajeActivoPorUsuario(user.id)
        if (fichajeActivo && fichajeActivo.parte_trabajo_id !== parte.id) {
          toast({
            title: "Trabajo activo",
            description: `Ya estás fichado en el parte ${fichajeActivo.parte_trabajo?.numero_parte}. Debes fichar la salida primero.`,
            variant: "destructive",
          })
          return
        }
      }
      await createFichaje({
        usuario_id: user.id,
        parte_trabajo_id: parte.id,
        tipo: "trabajo",
        tipo_fichaje: accion,
        fecha_hora: new Date().toISOString(),
      })
      if (accion === "salida") {
        await updateHorasReales(parte.id)
      }
      toast({ title: "Fichaje registrado" })
      await fetchParte()
    } catch (error) {
      toast({ title: "Error en el fichaje", variant: "destructive" })
    } finally {
      setIsFichajeLoading(false)
    }
  }

  const handleSaveTrabajoRealizado = async (trabajoRealizado: string) => {
    if (!parte) return
    try {
      if (fichado && user) {
        await handleFichaje("salida")
      }
      await updateParte(parte.id, {
        estado: "completado",
        fecha_fin: new Date().toISOString(),
        trabajo_realizado: trabajoRealizado,
      })
      await updateHorasReales(parte.id)
      setShowTrabajoModal(false)
      toast({ title: "Parte cerrado correctamente" })
      await fetchParte()
    } catch (error) {
      toast({ title: "Error al cerrar el parte", variant: "destructive" })
    }
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
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">No se pudo cargar el parte de trabajo.</p>
          <Link href="/partes">
            <Button>Volver a Partes</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={parte.estado === "completado" ? "/partes/completados" : "/partes"}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{parte.numero_parte}</h1>
            <p className="text-gray-600">
              {parte.cliente_nombre || parte.cliente?.nombre} - {parte.vehiculo_matricula || parte.vehiculo?.matricula}
            </p>
          </div>
          <div className="flex gap-2">
            {parte.estado !== "completado" && (
              <>
                {!fichado ? (
                  <Button
                    onClick={() => handleFichaje("entrada")}
                    disabled={isFichajeLoading}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {isFichajeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    <span className="ml-2">Fichar Entrada</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleFichaje("salida")}
                    disabled={isFichajeLoading}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isFichajeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
                    <span className="ml-2">Fichar Salida</span>
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowMaterialesModal(true)}>
                  <Package className="h-4 w-4 mr-2" />
                  Materiales
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText /> Detalles del Parte
                  </span>
                  <div className="flex gap-2">
                    <Badge>{parte.estado.replace("_", " ")}</Badge>
                    <Badge variant="destructive">{parte.prioridad}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cliente</Label>
                    <p>{parte.cliente_nombre || parte.cliente?.nombre}</p>
                  </div>
                  <div>
                    <Label>Vehículo</Label>
                    <p>{parte.vehiculo_matricula || parte.vehiculo?.matricula}</p>
                  </div>
                  <div>
                    <Label>Técnico Asignado</Label>
                    <p>{parte.tecnico?.nombre || "Sin asignar"}</p>
                  </div>
                  <div>
                    <Label>Tipo de Trabajo</Label>
                    <p>{parte.tipo_trabajo}</p>
                  </div>
                  <div>
                    <Label>Fecha de Inicio</Label>
                    <p>{new Date(parte.fecha_inicio || parte.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label>Ubicación</Label>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {parte.ubicacion || "Taller principal"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label>Descripción del Trabajo</Label>
                  <p className="mt-1">{parte.descripcion}</p>
                </div>
                {parte.trabajo_realizado && (
                  <>
                    <Separator />
                    <div>
                      <Label>Trabajo Realizado</Label>
                      <p className="mt-1 bg-green-50 p-3 rounded-lg">{parte.trabajo_realizado}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock /> Fichajes del Día
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

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parte.estado !== "completado" && (
                  <Button className="w-full" onClick={() => setShowTrabajoModal(true)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Cerrar Parte
                  </Button>
                )}
                <Button className="w-full bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TrabajoRealizadoModal
        isOpen={showTrabajoModal}
        onClose={() => setShowTrabajoModal(false)}
        onSave={handleSaveTrabajoRealizado}
      />

      <MaterialesModal
        isOpen={showMaterialesModal}
        onClose={() => setShowMaterialesModal(false)}
        parteId={parte.id}
        onMaterialesUpdated={fetchParte}
      />
    </MainLayout>
  )
}
