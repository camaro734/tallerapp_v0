"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Search,
  Plus,
  Eye,
  Calendar,
  Wrench,
  Clock,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Loader2,
  Timer,
  Building2,
  Car,
  PenTool,
  Trash2,
  X,
  XCircle,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import * as db from "@/lib/database"
import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { NuevoParteForm } from "@/components/nuevo-parte-form"
import { SignaturePad } from "@/components/signature-pad"
import { useToast } from "@/hooks/use-toast"
import type { ParteTrabajo, Material } from "@/lib/database"
import { getClienteName, getVehiculoInfo, formatDate } from "@/utils/helpers"

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

const estadoIcons: { [key: string]: React.ElementType } = {
  pendiente: Clock,
  en_curso: Wrench,
  completado: CheckCircle,
  cancelado: XCircle,
}

// Interfaz para materiales (sin precios)
interface MaterialType {
  id: string
  nombre: string
  cantidad: number
}

// Función para calcular tiempo real dinámicamente
const calcularTiempoReal = async (parteId: string): Promise<number> => {
  try {
    const { data: fichajes, error } = await db.getFichajesByParteId(parteId)
    if (error) throw error
    const fichajesTrabajo = fichajes.filter((f) => f.tipo === "trabajo")

    let tiempoTotal = 0
    let tiempoSesionActual = 0

    // Calcular tiempo de sesiones completadas
    for (let i = 0; i < fichajesTrabajo.length; i += 2) {
      const entrada = fichajesTrabajo[i]
      const salida = fichajesTrabajo[i + 1]

      if (entrada && entrada.tipo_fichaje === "entrada") {
        if (salida && salida.tipo_fichaje === "salida") {
          // Sesión completada
          const tiempoEntrada = new Date(entrada.fecha_hora).getTime()
          const tiempoSalida = new Date(salida.fecha_hora).getTime()
          tiempoTotal += (tiempoSalida - tiempoEntrada) / (1000 * 60 * 60) // Convertir a horas
        } else {
          // Sesión activa - calcular tiempo hasta ahora
          const tiempoEntrada = new Date(entrada.fecha_hora).getTime()
          const tiempoActual = new Date().getTime()
          tiempoSesionActual = (tiempoActual - tiempoEntrada) / (1000 * 60 * 60)
        }
      }
    }

    return tiempoTotal + tiempoSesionActual
  } catch (error) {
    console.error("Error calculando tiempo real:", error)
    return 0
  }
}

// Modal para trabajo realizado al cerrar parte
const TrabajoRealizadoModal = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (trabajo: string) => void
  isLoading: boolean
}) => {
  const [trabajo, setTrabajo] = useState("")
  const { toast } = useToast()

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
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar y Cerrar Parte"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Modal para gestión de materiales (sin precios) - MEJORADO CON BÚSQUEDA
const MaterialesModal = ({
  isOpen,
  onClose,
  parte,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  parte: ParteTrabajo
  onUpdate: (updates: Partial<ParteTrabajo>) => void
}) => {
  const [horasFacturables, setHorasFacturables] = useState(parte.horas_facturables || parte.horas_reales || 0)
  const [materiales, setMateriales] = useState<MaterialType[]>(parte.materiales_utilizados || [])
  const [descripcionMateriales, setDescripcionMateriales] = useState(parte.descripcion_materiales || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Estados para búsqueda de materiales
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Material[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [cantidadBusqueda, setCantidadBusqueda] = useState(1)

  // Estados para entrada manual
  const [nuevoMaterial, setNuevoMaterial] = useState({ nombre: "", cantidad: 1 })

  useEffect(() => {
    const searchMaterials = async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true)
        try {
          const { data: results, error } = await db.searchMateriales(searchTerm)
          if (error) throw error
          setSearchResults(results)
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

  const seleccionarMaterial = (material: Material) => {
    setSelectedMaterial(material)
    setSearchTerm("")
    setSearchResults([])
    setCantidadBusqueda(1)
  }

  const agregarMaterialBusqueda = () => {
    if (!selectedMaterial) return

    const material: MaterialType = {
      id: Date.now().toString(),
      nombre: `${selectedMaterial.codigo} - ${selectedMaterial.nombre}`,
      cantidad: cantidadBusqueda,
    }

    setMateriales([...materiales, material])
    setSelectedMaterial(null)
    setCantidadBusqueda(1)
  }

  const handleAddMaterial = () => {
    if (!nuevoMaterial.nombre.trim()) return

    const material: MaterialType = {
      id: Date.now().toString(),
      ...nuevoMaterial,
    }

    setMateriales([...materiales, material])
    setNuevoMaterial({ nombre: "", cantidad: 1 })
  }

  const handleRemoveMaterial = (id: string) => {
    setMateriales(materiales.filter((m) => m.id !== id))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const updates = {
        horas_facturables: horasFacturables,
        materiales_utilizados: materiales,
        descripcion_materiales: descripcionMateriales,
      }

      const { error } = await db.updateParte(parte.id, updates)
      if (error) throw error

      onUpdate(updates)
      onClose()

      toast({
        title: "Materiales actualizados",
        description: "Los materiales y horas facturables se han guardado correctamente",
      })
    } catch (error) {
      console.error("Error actualizando materiales:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar los materiales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-blue-600" />
              Gestión de Materiales - {parte.numero_parte}
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>Edita las horas facturables y materiales utilizados en el trabajo</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horas */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Tiempo de Trabajo</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horas Reales</Label>
                    <Input value={parte.horas_reales?.toFixed(2) || "0.00"} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Horas a Facturar</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={horasFacturables}
                      onChange={(e) => setHorasFacturables(Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">Horas a Facturar</div>
                  <div className="text-xl font-bold text-blue-800">{horasFacturables.toFixed(1)} horas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materiales */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Materiales Utilizados</h3>
              <div className="space-y-4">
                {/* Lista de materiales */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {materiales.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{material.nombre}</div>
                        <div className="text-xs text-gray-600">Cantidad: {material.cantidad} unidades</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Búsqueda de materiales */}
                <div className="space-y-3 p-3 border rounded-lg">
                  <div className="text-sm font-medium">Buscar Material</div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por referencia o descripción..."
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
                          <Label>Cantidad:</Label>
                          <Input
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

                {/* Agregar material manual */}
                <div className="space-y-3 p-3 border rounded-lg">
                  <div className="text-sm font-medium">Agregar Material Manual</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Nombre del material"
                      value={nuevoMaterial.nombre}
                      onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, nombre: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={nuevoMaterial.cantidad}
                      onChange={(e) =>
                        setNuevoMaterial({ ...nuevoMaterial, cantidad: Number.parseInt(e.target.value) || 1 })
                      }
                    />
                  </div>
                  <Button onClick={handleAddMaterial} size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Material
                  </Button>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600">Total Materiales</div>
                  <div className="text-xl font-bold text-green-800">{materiales.length} tipos</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Descripción de materiales */}
        <div className="space-y-2">
          <Label>Descripción Detallada de Materiales</Label>
          <Textarea
            value={descripcionMateriales}
            onChange={(e) => setDescripcionMateriales(e.target.value)}
            placeholder="Describe detalladamente los materiales utilizados, marcas, especificaciones técnicas, etc..."
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Materiales"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Modal para firma digital CON DNI
const FirmaModal = ({
  isOpen,
  onClose,
  parte,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  parte: ParteTrabajo
  onUpdate: (updates: Partial<ParteTrabajo>) => void
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [dniCliente, setDniCliente] = useState(parte.dni_cliente || "")
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const { toast } = useToast()

  // Función para validar DNI español
  const validarDNI = (dni: string): boolean => {
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
    if (!dniRegex.test(dni)) return false

    const letras = "TRWAGMYFPDXBNJZSQVHLCKE"
    const numero = Number.parseInt(dni.substring(0, 8), 10)
    const letra = dni.charAt(8).toUpperCase()

    return letras.charAt(numero % 23) === letra
  }

  const handleContinueToSignature = () => {
    if (!dniCliente.trim()) {
      toast({
        title: "DNI requerido",
        description: "Debes introducir el DNI del cliente",
        variant: "destructive",
      })
      return
    }

    if (!validarDNI(dniCliente.trim())) {
      toast({
        title: "DNI inválido",
        description: "El formato del DNI no es correcto (ej: 12345678Z)",
        variant: "destructive",
      })
      return
    }

    setShowSignaturePad(true)
  }

  const handleSaveFirma = async (firmaData: string) => {
    setIsLoading(true)
    try {
      const updates = {
        firma_cliente: firmaData,
        dni_cliente: dniCliente.trim().toUpperCase(),
        fecha_firma: new Date().toISOString(),
      }

      const { error } = await db.updateParte(parte.id, updates)
      if (error) throw error

      onUpdate(updates)
      onClose()

      toast({
        title: "Firma guardada",
        description: "La firma del cliente se ha guardado correctamente",
      })
    } catch (error) {
      console.error("Error guardando firma:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la firma",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSignature = () => {
    setShowSignaturePad(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-blue-600" />
            Firma Digital del Cliente
          </DialogTitle>
          <DialogDescription>
            {!showSignaturePad
              ? "Introduce el DNI del cliente antes de proceder con la firma"
              : "El cliente debe firmar para validar el trabajo realizado"}
          </DialogDescription>
        </DialogHeader>

        {!showSignaturePad ? (
          // Paso 1: Introducir DNI
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Datos del Cliente</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <div className="text-gray-900">{getClienteName(parte)}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Vehículo:</span>
                  <div className="text-gray-900">{getVehiculoInfo(parte)}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Parte:</span>
                  <div className="text-gray-900">{parte.numero_parte}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fecha:</span>
                  <div className="text-gray-900">{formatDate(parte.updated_at)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="dni_cliente" className="text-base font-medium">
                DNI del Cliente *
              </Label>
              <Input
                id="dni_cliente"
                value={dniCliente}
                onChange={(e) => setDniCliente(e.target.value.toUpperCase())}
                placeholder="Ej: 12345678Z"
                className="text-lg font-mono tracking-wider"
                maxLength={9}
              />
              <p className="text-sm text-gray-600">Introduce el DNI completo con letra (8 números + 1 letra)</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleContinueToSignature} className="bg-blue-600 hover:bg-blue-700">
                Continuar a Firma
              </Button>
            </div>
          </div>
        ) : (
          // Paso 2: Firma digital
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-green-700">DNI Cliente:</span>
                  <span className="ml-2 font-mono text-green-900">{dniCliente}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSignaturePad(false)}
                  className="text-green-700 hover:text-green-800"
                >
                  Cambiar DNI
                </Button>
              </div>
            </div>

            <SignaturePad onSave={handleSaveFirma} onCancel={handleCancelSignature} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Componente para mostrar la barra de progreso de tiempo (con tiempo real dinámico)
const TimeProgressBar = ({ parte, tiempoReal }: { parte: ParteTrabajo; tiempoReal: number }) => {
  const horasEstimadas = parte.horas_estimadas || 1
  const progreso = Math.min((tiempoReal / horasEstimadas) * 100, 100)
  const isOvertime = tiempoReal > horasEstimadas

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" />
          Tiempo: {tiempoReal.toFixed(1)}h / {horasEstimadas}h
        </span>
        <span className={isOvertime ? "text-red-600 font-medium" : ""}>{progreso.toFixed(0)}%</span>
      </div>
      <Progress value={progreso} className={`h-2 ${isOvertime ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-500"}`} />
      {isOvertime && <p className="text-xs text-red-600">⚠️ Tiempo excedido</p>}
    </div>
  )
}

export default function PartesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [partes, setPartes] = useState<ParteTrabajo[]>([])
  const [filteredPartes, setFilteredPartes] = useState<ParteTrabajo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [prioridadFilter, setPrioridadFilter] = useState("todas")
  const [activeTab, setActiveTab] = useState("activos")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fichajeLoading, setFichajeLoading] = useState<string | null>(null)
  const [fichajesActivos, setFichajesActivos] = useState<Record<string, boolean>>({})
  const [tiemposReales, setTiemposReales] = useState<Record<string, number>>({})
  const [showTrabajoModal, setShowTrabajoModal] = useState(false)
  const [parteToClose, setParteToClose] = useState<string | null>(null)
  const [isClosingParte, setIsClosingParte] = useState(false)
  const [selectedParte, setSelectedParte] = useState<ParteTrabajo | null>(null)
  const [showMaterialesModal, setShowMaterialesModal] = useState(false)
  const [showFirmaModal, setShowFirmaModal] = useState(false)
  const [isValidating, setIsValidating] = useState<string | null>(null)
  const [isExportingPDF, setIsExportingPDF] = useState<string | null>(null)

  const cargarPartes = async () => {
    try {
      setIsLoading(true)
      const { data, error: dbError } = await db.getAllPartes()
      if (dbError) throw dbError
      setPartes(data)
      setFilteredPartes(data)

      // Verificar fichajes activos y calcular tiempos reales para cada parte
      if (user) {
        const fichajesStatus: Record<string, boolean> = {}
        const tiemposRealesCalculados: Record<string, number> = {}

        for (const parte of data) {
          if (parte.estado !== "completado") {
            const { data: ultimoFichaje, error: fichajeError } = await db.getUltimoFichaje(user.id, parte.id)
            if (fichajeError) throw fichajeError
            fichajesStatus[parte.id] = ultimoFichaje?.tipo_fichaje === "entrada"

            // Calcular tiempo real dinámicamente
            if (parte.estado === "en_curso") {
              tiemposRealesCalculados[parte.id] = await calcularTiempoReal(parte.id)
            }
          }
        }

        setFichajesActivos(fichajesStatus)
        setTiemposReales(tiemposRealesCalculados)
      }
    } catch (error) {
      console.error("Error cargando partes:", error)
      setError("Error al cargar los partes de trabajo")
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar tiempos reales cada 30 segundos para partes activos
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      const tiemposActualizados: Record<string, number> = {}

      for (const parte of partes) {
        if (parte.estado === "en_curso" && fichajesActivos[parte.id]) {
          tiemposActualizados[parte.id] = await calcularTiempoReal(parte.id)
        }
      }

      setTiemposReales((prev) => ({ ...prev, ...tiemposActualizados }))
    }, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [partes, fichajesActivos, user])

  useEffect(() => {
    if (user) {
      cargarPartes()
    }
  }, [user])

  useEffect(() => {
    let filtered = partes

    // Filtrar por tab activo
    if (activeTab === "activos") {
      filtered = filtered.filter((p) => p.estado !== "completado")
    } else {
      filtered = filtered.filter((p) => p.estado === "completado")
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (parte) =>
          parte.numero_parte.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (parte.cliente_nombre || parte.cliente?.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (parte.vehiculo_matricula || parte.vehiculo?.matricula || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          parte.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (estadoFilter !== "todos") {
      filtered = filtered.filter((parte) => parte.estado === estadoFilter)
    }

    if (prioridadFilter !== "todas") {
      filtered = filtered.filter((parte) => parte.prioridad === prioridadFilter)
    }

    setFilteredPartes(filtered)
  }, [partes, searchTerm, estadoFilter, prioridadFilter, activeTab])

  const handleParteCreated = () => {
    setIsModalOpen(false)
    cargarPartes()
    toast({
      title: "Parte creado",
      description: "El parte de trabajo se ha creado correctamente",
    })
  }

  // Función para verificar si el usuario está fichado en presencia
  const verificarPresencia = async (userId: string): Promise<boolean> => {
    try {
      const { data: ultimoFichajePresencia, error } = await db.getUltimoFichajePresencia(userId)
      if (error) throw error
      return ultimoFichajePresencia?.tipo_fichaje === "entrada"
    } catch (error) {
      console.error("Error verificando presencia:", error)
      return false
    }
  }

  const handleFichaje = async (parteId: string, accion: "iniciar" | "pausar") => {
    if (!user) return

    // Verificar presencia antes de permitir fichaje
    const estaEnPresencia = await verificarPresencia(user.id)
    if (!estaEnPresencia) {
      toast({
        title: "Presencia requerida",
        description: "DEBES FICHAR PRESENCIA PRIMERO",
        variant: "destructive",
      })
      return
    }

    setFichajeLoading(parteId)

    try {
      const estaFichado = fichajesActivos[parteId]

      if (accion === "iniciar") {
        // Verificar si ya tiene un trabajo activo
        const { data: fichajeActivo, error: activeError } = await db.getUltimoFichajeActivoPorUsuario(user.id)
        if (activeError) throw activeError

        if (fichajeActivo && fichajeActivo.parte_trabajo_id !== parteId) {
          toast({
            title: "Trabajo activo",
            description: `Ya tienes un trabajo activo: ${fichajeActivo.parte_trabajo?.numero_parte || ""}`,
            variant: "destructive",
          })
          setFichajeLoading(null)
          return
        }

        const { error } = await db.createFichaje({
          usuario_id: user.id,
          parte_trabajo_id: parteId,
          tipo_fichaje: "entrada",
          tipo: "trabajo",
          fecha_hora: new Date().toISOString(),
        })

        if (error) throw error

        await db.updateParte(parteId, { estado: "en_curso" })

        toast({
          title: "Trabajo iniciado",
          description: "Has fichado la entrada al trabajo",
        })
      } else if (accion === "pausar") {
        if (!estaFichado) {
          toast({
            title: "Error",
            description: "No estás fichado en este trabajo",
            variant: "destructive",
          })
          setFichajeLoading(null)
          return
        }

        const { error } = await db.createFichaje({
          usuario_id: user.id,
          parte_trabajo_id: parteId,
          tipo_fichaje: "salida",
          tipo: "trabajo",
          fecha_hora: new Date().toISOString(),
        })

        if (error) throw error

        // Calcular y actualizar horas reales finales
        const tiempoRealFinal = await calcularTiempoReal(parteId)
        await db.updateParte(parteId, { horas_reales: tiempoRealFinal })

        toast({
          title: "Trabajo pausado",
          description: "Has fichado la salida del trabajo",
        })
      }

      await cargarPartes()
    } catch (error) {
      console.error("Error en fichaje:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive",
      })
    } finally {
      setFichajeLoading(null)
    }
  }

  const handleCerrarParte = (parteId: string) => {
    setParteToClose(parteId)
    setShowTrabajoModal(true)
  }

  const handleSaveTrabajoRealizado = async (trabajoRealizado: string) => {
    if (!user || !parteToClose) return

    setIsClosingParte(true)

    try {
      // Si está fichado, fichar salida automáticamente
      const estaFichado = fichajesActivos[parteToClose]
      if (estaFichado) {
        await db.createFichaje({
          usuario_id: user.id,
          parte_trabajo_id: parteToClose,
          tipo_fichaje: "salida",
          tipo: "trabajo",
          fecha_hora: new Date().toISOString(),
        })
      }

      // Calcular tiempo real final
      const tiempoRealFinal = await calcularTiempoReal(parteToClose)

      await db.updateParte(parteToClose, {
        estado: "completado",
        fecha_fin: new Date().toISOString(),
        trabajo_realizado: trabajoRealizado,
        horas_reales: tiempoRealFinal,
      })

      setShowTrabajoModal(false)
      setParteToClose(null)
      toast({
        title: "Parte cerrado",
        description: "El parte ha sido cerrado correctamente",
      })
      await cargarPartes()
    } catch (error) {
      console.error("Error cerrando parte:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar el parte",
        variant: "destructive",
      })
    } finally {
      setIsClosingParte(false)
    }
  }

  const handleUpdateParte = (parteId: string, updates: Partial<ParteTrabajo>) => {
    setPartes((prev) => prev.map((p) => (p.id === parteId ? { ...p, ...updates } : p)))
    setFilteredPartes((prev) => prev.map((p) => (p.id === parteId ? { ...p, ...updates } : p)))
  }

  const handleValidarParte = async (parteId: string) => {
    setIsValidating(parteId)
    try {
      const updates = {
        validado: true,
        fecha_validacion: new Date().toISOString(),
        validado_por: user?.id,
      }

      const { error } = await db.updateParte(parteId, updates)
      if (error) throw error

      handleUpdateParte(parteId, updates)

      toast({
        title: "Parte validado",
        description: "El parte ha sido validado correctamente",
      })
    } catch (error) {
      console.error("Error validando parte:", error)
      toast({
        title: "Error",
        description: "No se pudo validar el parte",
        variant: "destructive",
      })
    } finally {
      setIsValidating(null)
    }
  }

  const handleExportPDF = async (parte: ParteTrabajo) => {
    if (!parte.validado) {
      toast({
        title: "Parte no validado",
        description: "Solo se pueden exportar partes validados",
        variant: "destructive",
      })
      return
    }

    setIsExportingPDF(parte.id)

    try {
      // Cargar materiales del parte
      const { data: materiales, error } = await db.getMaterialesByParteId(parte.id)
      if (error) throw error

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
    } finally {
      setIsExportingPDF(null)
    }
  }

  // Función optimizada para generar PDF en una sola página
  const generarPDFParteOptimizado = (parte: ParteTrabajo, materiales: Array<{ nombre: string; cantidad: number }>) => {
    const doc = new jsPDF()
    const primaryColor = [37, 99, 235]

    // Header compacto
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
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
    const clienteNombre = getClienteName(parte)
    const vehiculoInfo = getVehiculoInfo(parte)
    const tecnicoNombre = parte.tecnico?.nombre || "No asignado"
    const fechaInicio = parte.fecha_inicio ? formatDate(parte.fecha_inicio) : "No especificada"
    const fechaFin = parte.fecha_fin ? formatDate(parte.fecha_fin) : formatDate(parte.updated_at)

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
      doc.text("Materiales:", 20, yPos)
      yPos += 5

      const materialesData = materiales.map((material) => {
        const [ref, ...desc] = material.nombre.split(" - ")
        return [ref, desc.join(" - "), `${material.cantidad}`]
      })
      ;(doc as any).autoTable({
        startY: yPos,
        head: [["Ref.", "Descripción", "Cant."]],
        body: materialesData,
        theme: "striped",
        styles: { fontSize: 7, cellPadding: 1 },
        headStyles: { fillColor: primaryColor, textColor: 255 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 120 },
          2: { cellWidth: 25 },
        },
      })

      yPos = (doc as any).lastAutoTable.finalY + 5
    }

    // DNI y Firma compacta
    if (parte.firma_cliente) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(10)
      doc.text("Firma del Cliente:", 20, yPos)
      yPos += 5

      // Mostrar DNI si existe
      if (parte.dni_cliente) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.text(`DNI: ${parte.dni_cliente}`, 20, yPos)
        yPos += 5
      }

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

  const puedeGestionarParte = (parte: ParteTrabajo) => {
    if (!user) return false
    return user.rol === "admin" || user.rol === "jefe_taller" || parte.tecnico_id === user.id
  }

  const puedeGestionarCompletados = () => {
    if (!user) return false
    return ["admin", "jefe_taller", "recepcion"].includes(user.rol)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando partes de trabajo...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Partes de Trabajo</h1>
            <p className="text-gray-600 mt-1">Gestión completa de trabajos activos y completados</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Parte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  Crear Nuevo Parte de Trabajo
                </DialogTitle>
                <DialogDescription>Completa la información para crear un nuevo parte de trabajo</DialogDescription>
              </DialogHeader>
              <NuevoParteForm onSuccess={handleParteCreated} onCancel={() => setIsModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activos">Partes Activos</TabsTrigger>
            <TabsTrigger value="completados">Partes Completados</TabsTrigger>
          </TabsList>

          <TabsContent value="activos" className="space-y-6">
            {/* Filtros para activos */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por número, cliente, vehículo o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en_curso">En curso</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={prioridadFilter} onValueChange={setPrioridadFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Lista de Partes Activos */}
            <div className="grid gap-4">
              {filteredPartes.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay partes de trabajo activos</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || estadoFilter !== "todos" || prioridadFilter !== "todas"
                        ? "No se encontraron partes que coincidan con los filtros aplicados."
                        : "Comienza creando tu primer parte de trabajo."}
                    </p>
                    {!searchTerm && estadoFilter === "todos" && prioridadFilter === "todas" && (
                      <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Primer Parte
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredPartes.map((parte) => {
                  const EstadoIcon = estadoIcons[parte.estado]
                  const estaFichado = fichajesActivos[parte.id]
                  const puedeGestionar = puedeGestionarParte(parte)
                  const isLoadingThis = fichajeLoading === parte.id
                  const tiempoReal = tiemposReales[parte.id] || parte.horas_reales || 0

                  return (
                    <Card key={parte.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">{parte.numero_parte}</h3>
                              <Badge className={estadoColors[parte.estado]}>
                                <EstadoIcon className="mr-1 h-3 w-3" />
                                {parte.estado.replace("_", " ")}
                              </Badge>
                              <Badge className={prioridadColors[parte.prioridad]}>{parte.prioridad}</Badge>
                              {estaFichado && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Fichado
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{getClienteName(parte)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                <span>{getVehiculoInfo(parte)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Wrench className="h-4 w-4" />
                                <span>{parte.tipo_trabajo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(parte.created_at)}</span>
                              </div>
                            </div>

                            <p className="text-gray-700 text-sm line-clamp-2">{parte.descripcion}</p>

                            {/* Barra de progreso de tiempo con tiempo real dinámico */}
                            {parte.horas_estimadas && parte.horas_estimadas > 0 && (
                              <TimeProgressBar parte={parte} tiempoReal={tiempoReal} />
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Link href={`/partes/${parte.id}`}>
                              <Button variant="outline" size="sm" className="w-full bg-transparent">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                            </Link>

                            {puedeGestionar && parte.estado !== "cancelado" && (
                              <div className="flex flex-col gap-2">
                                {parte.estado === "pendiente" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleFichaje(parte.id, "iniciar")}
                                    disabled={isLoadingThis}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    {isLoadingThis ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Play className="h-4 w-4 mr-2" />
                                    )}
                                    Fichar Entrada
                                  </Button>
                                )}

                                {parte.estado === "en_curso" && (
                                  <div className="flex gap-1">
                                    {estaFichado ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleFichaje(parte.id, "pausar")}
                                        disabled={isLoadingThis}
                                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                                      >
                                        {isLoadingThis ? (
                                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                          <Pause className="h-4 w-4 mr-1" />
                                        )}
                                        Pausar
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        onClick={() => handleFichaje(parte.id, "iniciar")}
                                        disabled={isLoadingThis}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        {isLoadingThis ? (
                                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                          <Play className="h-4 w-4 mr-1" />
                                        )}
                                        Continuar
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      onClick={() => handleCerrarParte(parte.id)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Cerrar
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="completados" className="space-y-6">
            {/* Filtros para completados */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar por número, cliente, vehículo o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={prioridadFilter} onValueChange={setPrioridadFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Partes Completados */}
            <div className="grid gap-4">
              {filteredPartes.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay partes completados</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || prioridadFilter !== "todas"
                        ? "No se encontraron partes que coincidan con los filtros aplicados."
                        : "Los partes completados aparecerán aquí una vez finalizados."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPartes.map((parte) => (
                  <Card key={parte.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">{parte.numero_parte}</h3>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Completado
                            </Badge>
                            <Badge className={prioridadColors[parte.prioridad]}>{parte.prioridad}</Badge>
                            {parte.validado && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Validado
                              </Badge>
                            )}
                            {parte.firma_cliente && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <PenTool className="mr-1 h-3 w-3" />
                                Firmado
                              </Badge>
                            )}
                            {parte.dni_cliente && (
                              <Badge className="bg-indigo-100 text-indigo-800">
                                <CreditCard className="mr-1 h-3 w-3" />
                                DNI: {parte.dni_cliente}
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{getClienteName(parte)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4" />
                              <span>{getVehiculoInfo(parte)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4" />
                              <span>{parte.tecnico?.nombre || "No asignado"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Finalizado: {formatDate(parte.fecha_fin || parte.updated_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                Real: {parte.horas_reales?.toFixed(1) || "0.0"}h / Estimado:{" "}
                                {parte.horas_estimadas || "N/A"}h
                              </span>
                            </div>
                            {parte.horas_facturables && (
                              <div className="flex items-center gap-2">
                                <Timer className="h-4 w-4" />
                                <span className="font-medium">Facturar: {parte.horas_facturables.toFixed(1)}h</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 text-sm line-clamp-2">{parte.descripcion}</p>

                          {parte.trabajo_realizado && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium text-gray-700 mb-1">Trabajo Realizado:</div>
                              <p className="text-sm text-gray-600 line-clamp-3">{parte.trabajo_realizado}</p>
                            </div>
                          )}
                        </div>

                        {puedeGestionarCompletados() && (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <Link href={`/partes/${parte.id}`}>
                              <Button variant="outline" size="sm" className="w-full bg-transparent">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </Button>
                            </Link>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedParte(parte)
                                setShowMaterialesModal(true)
                              }}
                              className="w-full"
                            >
                              <Wrench className="h-4 w-4 mr-2" />
                              Materiales
                            </Button>

                            {!parte.firma_cliente && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedParte(parte)
                                  setShowFirmaModal(true)
                                }}
                                className="w-full"
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                Firmar
                              </Button>
                            )}

                            {!parte.validado && parte.firma_cliente && (
                              <Button
                                size="sm"
                                onClick={() => handleValidarParte(parte.id)}
                                disabled={isValidating === parte.id}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                {isValidating === parte.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Validando...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Validar
                                  </>
                                )}
                              </Button>
                            )}

                            {parte.validado && (
                              <Button
                                size="sm"
                                onClick={() => handleExportPDF(parte)}
                                disabled={isExportingPDF === parte.id}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                {isExportingPDF === parte.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generando...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Exportar PDF
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modales */}
        <TrabajoRealizadoModal
          isOpen={showTrabajoModal}
          onClose={() => {
            setShowTrabajoModal(false)
            setParteToClose(null)
          }}
          onSave={handleSaveTrabajoRealizado}
          isLoading={isClosingParte}
        />

        {selectedParte && (
          <>
            <MaterialesModal
              isOpen={showMaterialesModal}
              onClose={() => {
                setShowMaterialesModal(false)
                setSelectedParte(null)
              }}
              parte={selectedParte}
              onUpdate={(updates) => handleUpdateParte(selectedParte.id, updates)}
            />

            <FirmaModal
              isOpen={showFirmaModal}
              onClose={() => {
                setShowFirmaModal(false)
                setSelectedParte(null)
              }}
              parte={selectedParte}
              onUpdate={(updates) => handleUpdateParte(selectedParte.id, updates)}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}
