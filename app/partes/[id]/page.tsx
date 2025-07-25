"use client"

import Link from "next/link"
import { useRef } from "react"
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
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  PenTool,
  Loader2,
  Plus,
  Trash2,
  Search,
  X,
  User,
  Building2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import type { ParteTrabajo, Fichaje, Usuario, Material } from "@/lib/db"
import {
  getParteById,
  updateParte,
  getMaterialesByParteId,
  searchMateriales,
  createFichaje,
  getUltimoFichaje,
  getUltimoFichajeActivoPorUsuario,
  usuariosDB,
} from "@/lib/db"

import jsPDF from "jspdf"
import "jspdf-autotable"

const estadoColors: { [key: string]: string } = {
  pendiente: "bg-yellow-100 text-yellow-800",
  en_curso: "bg-blue-100 text-blue-800",
  completado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
}

const prioridadColors: { [key: string]: string } = {
  baja: "bg-green-100 text-green-800",
  media: "bg-yellow-100 text-yellow-800",
  alta: "bg-orange-100 text-orange-800",
  urgente: "bg-red-100 text-red-800",
}

// Funciones helper
const getClienteName = (parte: ParteTrabajo) => {
  return parte.cliente_nombre || parte.cliente?.nombre || "Cliente no especificado"
}

const getVehiculoInfo = (parte: ParteTrabajo) => {
  return parte.vehiculo_matricula || parte.vehiculo?.matricula || "Vehículo no especificado"
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "No especificada"
  return new Date(dateString).toLocaleDateString("es-ES")
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("es-ES")
}

// Componente para mostrar un único fichaje
const FichajeItem = ({ fichaje }: { fichaje: Fichaje & { usuario?: Usuario } }) => (
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
  const [materiales, setMateriales] = useState<
    Array<{ id?: string; referencia: string; descripcion: string; cantidad: number; unidad: string }>
  >([])

  // Estados para búsqueda de materiales existentes
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Material[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [cantidadBusqueda, setCantidadBusqueda] = useState(1)

  // Estados para entrada manual
  const [referenciaManual, setReferenciaManual] = useState("")
  const [descripcionManual, setDescripcionManual] = useState("")
  const [cantidadManual, setCantidadManual] = useState(1)
  const [unidadManual, setUnidadManual] = useState("unidad")

  // Estados para horas facturables
  const [horasReales, setHorasReales] = useState(0)
  const [horasFacturables, setHorasFacturables] = useState(0)
  const [descripcionDetallada, setDescripcionDetallada] = useState("")

  const unidadesDisponibles = ["unidad", "metros", "litros", "kilogramos", "piezas", "cajas", "rollos"]

  useEffect(() => {
    if (isOpen) {
      cargarMateriales()
      cargarDatosParte()
    }
  }, [isOpen, parteId])

  useEffect(() => {
    const searchMaterials = async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true)
        try {
          const { data } = await searchMateriales(searchTerm)
          setSearchResults(data || [])
        } catch (error) {
          console.error("Error buscando materiales:", error)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }

    const debounceTimer = setTimeout(searchMaterials, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const cargarMateriales = async () => {
    try {
      const { data } = await getMaterialesByParteId(parteId)
      setMateriales(data || [])
    } catch (error) {
      console.error("Error cargando materiales:", error)
    }
  }

  const cargarDatosParte = async () => {
    try {
      const { data: parte } = await getParteById(parteId)
      if (parte) {
        setHorasReales(parte.horas_reales || 0)
        setHorasFacturables(parte.horas_facturables || parte.horas_reales || 0)
        setDescripcionDetallada(parte.descripcion_materiales || "")
      }
    } catch (error) {
      console.error("Error cargando datos del parte:", error)
    }
  }

  const seleccionarMaterial = (material: Material) => {
    setSelectedMaterial(material)
    setSearchTerm("")
    setSearchResults([])
    setCantidadBusqueda(1)
  }

  const agregarMaterialBusqueda = async () => {
    if (!selectedMaterial) {
      toast({
        title: "Error",
        description: "Debes seleccionar un material",
        variant: "destructive",
      })
      return
    }

    if (cantidadBusqueda <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    if (cantidadBusqueda > selectedMaterial.stock_actual) {
      toast({
        title: "Error",
        description: `No hay suficiente stock. Disponible: ${selectedMaterial.stock_actual} ${selectedMaterial.unidad}`,
        variant: "destructive",
      })
      return
    }

    try {
      // Simular agregar material (en una implementación real usarías una función de la DB)
      const nuevoMaterial = {
        id: Date.now().toString(),
        referencia: selectedMaterial.codigo,
        descripcion: selectedMaterial.nombre,
        cantidad: cantidadBusqueda,
        unidad: selectedMaterial.unidad || "unidad",
      }

      setMateriales((prev) => [...prev, nuevoMaterial])
      setSelectedMaterial(null)
      setCantidadBusqueda(1)
      onMaterialesUpdated()

      toast({
        title: "Material añadido",
        description: "El material se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error añadiendo material:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el material",
        variant: "destructive",
      })
    }
  }

  const agregarMaterialManual = async () => {
    if (!referenciaManual.trim() || !descripcionManual.trim()) {
      toast({
        title: "Error",
        description: "Debes completar la referencia y descripción",
        variant: "destructive",
      })
      return
    }

    if (cantidadManual <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    try {
      const nuevoMaterial = {
        id: Date.now().toString(),
        referencia: referenciaManual.trim(),
        descripcion: descripcionManual.trim(),
        cantidad: cantidadManual,
        unidad: unidadManual,
      }

      setMateriales((prev) => [...prev, nuevoMaterial])
      setReferenciaManual("")
      setDescripcionManual("")
      setCantidadManual(1)
      setUnidadManual("unidad")
      onMaterialesUpdated()

      toast({
        title: "Material añadido",
        description: "El material se ha añadido correctamente",
      })
    } catch (error) {
      console.error("Error añadiendo material:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el material",
        variant: "destructive",
      })
    }
  }

  const eliminarMaterial = async (materialId: string) => {
    try {
      setMateriales((prev) => prev.filter((m) => m.id !== materialId))
      onMaterialesUpdated()
      toast({
        title: "Material eliminado",
        description: "El material se ha eliminado correctamente",
      })
    } catch (error) {
      console.error("Error eliminando material:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el material",
        variant: "destructive",
      })
    }
  }

  const guardarCambios = async () => {
    try {
      await updateParte(parteId, {
        horas_facturables: horasFacturables,
        descripcion_materiales: descripcionDetallada,
      })

      toast({
        title: "Cambios guardados",
        description: "Los datos se han actualizado correctamente",
      })

      onClose()
    } catch (error) {
      console.error("Error guardando cambios:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Gestión de Materiales - {parteId}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>Edita las horas facturables y materiales utilizados en el trabajo</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda - Tiempo de Trabajo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tiempo de Trabajo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Horas Reales</Label>
                    <div className="text-2xl font-bold text-gray-600">{horasReales.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label htmlFor="horas_facturables">Horas a Facturar</Label>
                    <Input
                      id="horas_facturables"
                      type="number"
                      step="0.1"
                      min="0"
                      value={horasFacturables}
                      onChange={(e) => setHorasFacturables(Number.parseFloat(e.target.value) || 0)}
                      className="text-lg"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Horas a Facturar</div>
                  <div className="text-2xl font-bold text-blue-800">{horasFacturables.toFixed(1)} horas</div>
                </div>
              </CardContent>
            </Card>

            {/* Descripción Detallada */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción Detallada de Materiales</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={descripcionDetallada}
                  onChange={(e) => setDescripcionDetallada(e.target.value)}
                  placeholder="Describe detalladamente los materiales utilizados, marcas, especificaciones técnicas, etc..."
                  rows={8}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha - Materiales */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Materiales Utilizados</span>
                  <div className="text-sm text-green-600 font-medium">Total Materiales: {materiales.length} tipos</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de materiales existentes */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {materiales.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No hay materiales añadidos</p>
                  ) : (
                    materiales.map((material, index) => (
                      <div
                        key={material.id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{material.referencia}</p>
                          <p className="text-xs text-gray-600">{material.descripcion}</p>
                          <p className="text-xs text-gray-500">
                            {material.cantidad} {material.unidad}
                          </p>
                        </div>
                        {material.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarMaterial(material.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                {/* Tabs para agregar materiales */}
                <Tabs defaultValue="buscar" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buscar">Buscar Material</TabsTrigger>
                    <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
                  </TabsList>

                  {/* Tab de búsqueda */}
                  <TabsContent value="buscar" className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="search_material">Buscar por referencia o descripción</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="search_material"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar material..."
                          className="pl-10"
                        />
                      </div>

                      {/* Resultados de búsqueda */}
                      {isSearching && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Buscando materiales...
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="border rounded-lg max-h-32 overflow-y-auto">
                          {searchResults.map((material) => (
                            <div
                              key={material.id}
                              className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                              onClick={() => seleccionarMaterial(material)}
                            >
                              <div className="font-medium text-sm">{material.codigo}</div>
                              <div className="text-xs text-gray-600">{material.nombre}</div>
                              <div className="text-xs text-gray-500">
                                Stock: {material.stock_actual} {material.unidad}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Material seleccionado */}
                      {selectedMaterial && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium">{selectedMaterial.codigo}</span> - {selectedMaterial.nombre}
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="cantidad_busqueda">Cantidad:</Label>
                              <Input
                                id="cantidad_busqueda"
                                type="number"
                                min="1"
                                max={selectedMaterial.stock_actual}
                                value={cantidadBusqueda}
                                onChange={(e) => setCantidadBusqueda(Number.parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                              <span className="text-sm text-gray-600">{selectedMaterial.unidad}</span>
                              <Button onClick={agregarMaterialBusqueda} size="sm" className="ml-auto">
                                <Plus className="h-4 w-4 mr-1" />
                                Añadir
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Tab de entrada manual */}
                  <TabsContent value="manual" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="referencia_manual">Referencia *</Label>
                        <Input
                          id="referencia_manual"
                          value={referenciaManual}
                          onChange={(e) => setReferenciaManual(e.target.value)}
                          placeholder="Ej: ACEITE-HYD-46"
                        />
                      </div>

                      <div>
                        <Label htmlFor="descripcion_manual">Descripción *</Label>
                        <Input
                          id="descripcion_manual"
                          value={descripcionManual}
                          onChange={(e) => setDescripcionManual(e.target.value)}
                          placeholder="Ej: Aceite hidráulico ISO 46"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="cantidad_manual">Cantidad *</Label>
                          <Input
                            id="cantidad_manual"
                            type="number"
                            min="1"
                            value={cantidadManual}
                            onChange={(e) => setCantidadManual(Number.parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="unidad_manual">Unidad</Label>
                          <Select value={unidadManual} onValueChange={setUnidadManual}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {unidadesDisponibles.map((unidad) => (
                                <SelectItem key={unidad} value={unidad}>
                                  {unidad}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={agregarMaterialManual}
                        className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Material
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={guardarCambios} className="bg-blue-600 hover:bg-blue-700">
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Función para generar PDF del parte optimizado
const generarPDFParteOptimizado = (
  parte: ParteTrabajo,
  materiales: Array<{ referencia: string; descripcion: string; cantidad: number; unidad: string }>,
) => {
  const doc = new jsPDF()
  const primaryColor = [37, 99, 235]

  // Header compacto
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 20, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("CMG Hidráulica", 20, 12)

  // Información del parte
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(`Parte de Trabajo ${parte.numero_parte}`, 20, 30)

  // Estado compacto
  doc.setFillColor(16, 185, 129)
  doc.rect(20, 35, 25, 6, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text("COMPLETADO", 22, 39)

  // Información básica en tabla compacta
  doc.setTextColor(0, 0, 0)
  const clienteNombre = parte.cliente_nombre || parte.cliente?.nombre || "Cliente no especificado"
  const vehiculoInfo = parte.vehiculo_matricula || parte.vehiculo?.matricula || "Vehículo no especificado"
  const tecnicoNombre = parte.tecnico?.nombre || "No asignado"
  const fechaInicio = parte.fecha_inicio ? new Date(parte.fecha_inicio).toLocaleDateString() : "No especificada"
  const fechaFin = parte.fecha_fin
    ? new Date(parte.fecha_fin).toLocaleDateString()
    : new Date(parte.updated_at).toLocaleDateString()

  const infoData = [
    ["Cliente:", clienteNombre, "Técnico:", tecnicoNombre],
    ["Vehículo:", vehiculoInfo, "Tipo:", parte.tipo_trabajo],
    ["Inicio:", fechaInicio, "Fin:", fechaFin],
    [
      "Horas:",
      `${parte.horas_facturables?.toFixed(1) || parte.horas_reales?.toFixed(1) || "0.0"}h`,
      "Prioridad:",
      parte.prioridad,
    ],
  ]
  ;(doc as any).autoTable({
    startY: 45,
    head: [],
    body: infoData,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 20 },
      1: { cellWidth: 65 },
      2: { fontStyle: "bold", cellWidth: 20 },
      3: { cellWidth: 65 },
    },
  })

  let yPos = (doc as any).lastAutoTable.finalY + 8

  // Descripción compacta
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Descripción:", 20, yPos)
  yPos += 4
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  const descripcionLines = doc.splitTextToSize(parte.descripcion, 170)
  doc.text(descripcionLines, 20, yPos)
  yPos += Math.min(descripcionLines.length * 3, 15) + 5

  // Trabajo realizado compacto
  if (parte.trabajo_realizado) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Trabajo Realizado:", 20, yPos)
    yPos += 4
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const trabajoLines = doc.splitTextToSize(parte.trabajo_realizado, 170)
    doc.text(trabajoLines, 20, yPos)
    yPos += Math.min(trabajoLines.length * 3, 15) + 5
  }

  // Materiales compactos
  if (materiales.length > 0) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Materiales Utilizados:", 20, yPos)
    yPos += 5

    const materialesData = materiales.map((material) => [
      material.referencia,
      material.descripcion,
      `${material.cantidad} ${material.unidad}`,
    ])
    ;(doc as any).autoTable({
      startY: yPos,
      head: [["Referencia", "Descripción", "Cantidad"]],
      body: materialesData,
      theme: "striped",
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: primaryColor, textColor: 255 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 110 },
        2: { cellWidth: 30 },
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 5
  }

  // Descripción detallada de materiales
  if (parte.descripcion_materiales && parte.descripcion_materiales.trim()) {
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Descripción Detallada de Materiales:", 20, yPos)
    yPos += 4
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    const descripcionMaterialesLines = doc.splitTextToSize(parte.descripcion_materiales, 170)
    doc.text(descripcionMaterialesLines, 20, yPos)
    yPos += Math.min(descripcionMaterialesLines.length * 3, 15) + 5
  }

  // Firma compacta
  if (parte.firma_cliente) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("Firma del Cliente:", 20, yPos)
    yPos += 5
    try {
      doc.addImage(parte.firma_cliente, "PNG", 20, yPos, 60, 30)
      yPos += 35
    } catch (error) {
      yPos += 10
    }
    if (parte.fecha_firma) {
      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.text(`Fecha: ${new Date(parte.fecha_firma).toLocaleDateString("es-ES")}`, 20, yPos)
    }
  }

  // Footer compacto
  doc.setFillColor(107, 114, 128)
  doc.rect(0, 285, 210, 12, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(7)
  doc.text("CMG Hidráulica", 20, 292)
  doc.text(`Generado: ${new Date().toLocaleDateString("es-ES")}`, 150, 292)

  return doc
}

const handleExportPDF = async (parte: ParteTrabajo, materiales: any[]) => {
  if (!parte) return

  try {
    // Generar PDF optimizado
    const doc = generarPDFParteOptimizado(parte, materiales)

    // Descargar PDF
    doc.save(`parte-${parte.numero_parte}-${new Date().toISOString().split("T")[0]}.pdf`)

    toast({
      title: "PDF generado",
      description: "El archivo PDF del parte se ha descargado correctamente",
    })
  } catch (error) {
    console.error("Error generando PDF:", error)
    toast({
      title: "Error",
      description: "No se pudo generar el PDF",
      variant: "destructive",
    })
  }
}

export default function ParteDetallePage() {
  const { user, isLoading: authLoading } = useAuth()
  const params = useParams()
  const id = params.id as string

  const [parte, setParte] = useState<ParteTrabajo | null>(null)
  const [fichajes, setFichajes] = useState<Fichaje[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [fichado, setFichado] = useState(false)
  const [isFichajeLoading, setIsFichajeLoading] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [showTrabajoModal, setShowTrabajoModal] = useState(false)
  const [showMaterialesModal, setShowMaterialesModal] = useState(false)
  const [dniCliente, setDniCliente] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchParte = async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)
    try {
      const { data: parteData } = await getParteById(id)

      if (!parteData) {
        throw new Error("No se encontró el parte de trabajo.")
      }
      setParte(parteData)

      // Simular fichajes (en una implementación real los obtendrías de la DB)
      setFichajes([])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchParte()
  }, [id])

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
        // Verificar si ya tiene un trabajo activo en otro parte
        const { data: fichajeActivo } = await getUltimoFichajeActivoPorUsuario(user.id)
        if (fichajeActivo && fichajeActivo.parte_trabajo_id !== parte.id) {
          toast({
            title: "Trabajo activo",
            description: `Ya estás fichado en el parte ${
              fichajeActivo.parte_trabajo?.numero_parte || ""
            }. Debes fichar la salida antes de iniciar un nuevo fichaje.`,
            variant: "destructive",
          })
          return
        }

        await createFichaje({
          usuario_id: user.id,
          parte_trabajo_id: parte.id,
          tipo: "trabajo",
          tipo_fichaje: "entrada",
          fecha_hora: new Date().toISOString(),
        })

        toast({
          title: "Fichaje registrado",
          description: "Has fichado la entrada al trabajo",
        })
      } else {
        await createFichaje({
          usuario_id: user.id,
          parte_trabajo_id: parte.id,
          tipo: "trabajo",
          tipo_fichaje: "salida",
          fecha_hora: new Date().toISOString(),
        })

        toast({
          title: "Fichaje registrado",
          description: "Has fichado la salida del trabajo",
        })
      }

      await fetchParte() // Recargar datos para ver el nuevo fichaje
    } catch (error) {
      console.error("Error en el fichaje:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar el fichaje.",
        variant: "destructive",
      })
    } finally {
      setIsFichajeLoading(false)
    }
  }

  const handleCerrarParte = () => {
    setShowTrabajoModal(true)
  }

  const handleSaveTrabajoRealizado = async (trabajoRealizado: string) => {
    if (!user || !parte) return

    try {
      // Si está fichado, fichar salida automáticamente
      if (fichado) {
        await createFichaje({
          usuario_id: user.id,
          parte_trabajo_id: parte.id,
          tipo: "trabajo",
          tipo_fichaje: "salida",
          fecha_hora: new Date().toISOString(),
        })
      }

      await updateParte(parte.id, {
        estado: "completado",
        fecha_fin: new Date().toISOString(),
        trabajo_realizado: trabajoRealizado,
      })

      setShowTrabajoModal(false)
      toast({
        title: "Parte cerrado",
        description: "El parte ha sido cerrado correctamente",
      })
      await fetchParte()
    } catch (error) {
      console.error("Error cerrando parte:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar el parte",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = () => fileInputRef.current?.click()

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

  const clienteNombre = parte.cliente_nombre || parte.cliente?.nombre || "Cliente no especificado"
  const vehiculoMatricula = parte.vehiculo_matricula || parte.vehiculo?.matricula || "Vehículo no especificado"

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4 bg-transparent">
            <Link href="/partes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Partes
            </Link>
          </Button>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{parte.numero_parte}</h1>
              <p className="text-gray-600">Detalles del parte de trabajo</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={estadoColors[parte.estado]}>{parte.estado.replace("_", " ")}</Badge>
              <Badge className={prioridadColors[parte.prioridad]}>{parte.prioridad}</Badge>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-3">
          {parte.estado !== "completado" && (
            <>
              {!fichado ? (
                <Button
                  onClick={() => handleFichaje("entrada")}
                  disabled={isFichajeLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isFichajeLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Fichar Entrada
                </Button>
              ) : (
                <Button
                  onClick={() => handleFichaje("salida")}
                  disabled={isFichajeLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isFichajeLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Fichar Salida
                </Button>
              )}
              <Button onClick={() => setShowMaterialesModal(true)} variant="outline">
                Gestionar Materiales
              </Button>
              <Button onClick={handleCerrarParte} className="bg-blue-600 hover:bg-blue-700">
                Cerrar Parte
              </Button>
            </>
          )}
          <Button onClick={() => handleExportPDF(parte, [])} variant="outline">
            Exportar PDF
          </Button>
        </div>

        {/* Grid de detalles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Columna 1: Info General */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Tipo de Trabajo:</span>
                  <span>{parte.tipo_trabajo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Fecha Creación:</span>
                  <span>{formatDate(parte.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Fecha Inicio:</span>
                  <span>{formatDate(parte.fecha_inicio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Fecha Fin:</span>
                  <span>{formatDate(parte.fecha_fin)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Cliente y Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Cliente:</span>
                  <span>{getClienteName(parte)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Vehículo:</span>
                  <span>{getVehiculoInfo(parte)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Asignado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Técnico:</span>
                  <span>{parte.tecnico?.nombre || "No asignado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Creado por:</span>
                  <span>{usuariosDB.find((u) => u.id === parte.created_by)?.nombre || "Desconocido"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna 2: Descripciones */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{parte.descripcion}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Trabajo Realizado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{parte.trabajo_realizado || "Aún no se ha completado."}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{parte.observaciones || "Sin observaciones."}</p>
              </CardContent>
            </Card>
          </div>

          {/* Columna 3: Tiempos y Firma */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Control de Tiempos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {fichajes.map((fichaje) => (
                    <li key={fichaje.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className={fichaje.tipo_fichaje === "entrada" ? "text-green-600" : "text-red-600"}>
                        {fichaje.tipo_fichaje.charAt(0).toUpperCase() + fichaje.tipo_fichaje.slice(1)}
                      </span>
                      <span className="text-gray-600">{formatDateTime(fichaje.fecha_hora)}</span>
                    </li>
                  ))}
                  {fichajes.length === 0 && <p className="text-gray-500">No hay fichajes registrados.</p>}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-blue-600" />
                  Validación y Firma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parte.validado ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-800">
                      Validado por {usuariosDB.find((u) => u.id === parte.validado_por)?.nombre}
                    </p>
                    <p className="text-sm text-green-700">{formatDate(parte.fecha_validacion)}</p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-800">Pendiente de validación</p>
                  </div>
                )}
                {parte.firma_cliente ? (
                  <div>
                    <p className="text-sm font-medium mb-2">Firma del Cliente:</p>
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <img
                        src={parte.firma_cliente || "/placeholder.svg"}
                        alt="Firma del cliente"
                        className="mx-auto"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-center text-gray-600">Sin firma del cliente.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Trabajo Realizado */}
      <TrabajoRealizadoModal
        isOpen={showTrabajoModal}
        onClose={() => setShowTrabajoModal(false)}
        onSave={handleSaveTrabajoRealizado}
      />

      {/* Modal de Materiales */}
      <MaterialesModal
        isOpen={showMaterialesModal}
        onClose={() => setShowMaterialesModal(false)}
        parteId={parte.id}
        onMaterialesUpdated={fetchParte}
      />

      {showSignature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Firma Digital del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Área de firma digital</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 industrial-button text-white" onClick={() => setShowSignature(false)}>
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
    </MainLayout>
  )
}
