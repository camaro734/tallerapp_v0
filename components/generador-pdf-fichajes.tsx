"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Calendar, User, Clock, FileText, Loader2 } from "lucide-react"
import { fichajesDB, usuariosDB } from "@/lib/database"
import type { Usuario, Fichaje } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function GeneradorPDFFichajes() {
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [filtros, setFiltros] = useState({
    usuario_id: "all", // Updated default value to "all"
    fecha_inicio: "",
    fecha_fin: "",
    tipo_fichaje: "all", // Updated default value to "all"
  })
  const [fichajes, setFichajes] = useState<Fichaje[]>([])
  const [mostrarPreview, setMostrarPreview] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      const data = await usuariosDB.getAll()
      setUsuarios(data)
    } catch (error) {
      console.error("Error cargando usuarios:", error)
    }
  }

  const cargarFichajes = async () => {
    setLoading(true)
    try {
      const data = await fichajesDB.getByDateRange(
        filtros.usuario_id === "all" ? undefined : filtros.usuario_id,
        filtros.fecha_inicio || undefined,
        filtros.fecha_fin || undefined,
      )

      let fichajesFiltrados = data

      if (filtros.tipo_fichaje !== "all") {
        fichajesFiltrados = data.filter((f) => f.tipo === filtros.tipo_fichaje)
      }

      setFichajes(fichajesFiltrados)
      setMostrarPreview(true)
    } catch (error) {
      console.error("Error cargando fichajes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los fichajes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generarPDF = async () => {
    if (fichajes.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay fichajes para generar el informe",
        variant: "destructive",
      })
      return
    }

    setGenerando(true)

    try {
      // Generar HTML para el PDF
      const htmlContent = generarHTMLInforme()

      // Crear blob y descargar
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `informe-fichajes-${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Informe generado",
        description: "El archivo HTML se ha descargado correctamente",
      })
    } catch (error) {
      console.error("Error generando PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el informe",
        variant: "destructive",
      })
    } finally {
      setGenerando(false)
    }
  }

  const generarHTMLInforme = () => {
    const usuarioSeleccionado = usuarios.find((u) => u.id === filtros.usuario_id)
    const fechaInicio = filtros.fecha_inicio || "Todas"
    const fechaFin = filtros.fecha_fin || "Todas"

    // Calcular estadísticas
    const totalDias = new Set(fichajes.map((f) => f.fecha_hora.split("T")[0])).size
    const totalHoras = calcularHorasTrabajadas()

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe de Fichajes - CMG Hidráulica</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #6b7280;
            margin: 5px 0 0 0;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-card {
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #2563eb;
        }
        .info-card h3 {
            margin: 0 0 5px 0;
            color: #1e40af;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-card p {
            margin: 0;
            font-size: 18px;
            font-weight: bold;
            color: #374151;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #dbeafe;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .stat-card h4 {
            margin: 0 0 5px 0;
            color: #1e40af;
            font-size: 12px;
            text-transform: uppercase;
        }
        .stat-card p {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            color: #1e3a8a;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }
        .entrada {
            color: #059669;
            font-weight: bold;
        }
        .salida {
            color: #dc2626;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CMG Hidráulica</h1>
            <p>Informe de Fichajes de Personal</p>
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h3>Usuario</h3>
                <p>${usuarioSeleccionado ? usuarioSeleccionado.nombre : "Todos los usuarios"}</p>
            </div>
            <div class="info-card">
                <h3>Período</h3>
                <p>${fechaInicio} - ${fechaFin}</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Fichajes</h4>
                <p>${fichajes.length}</p>
            </div>
            <div class="stat-card">
                <h4>Días Trabajados</h4>
                <p>${totalDias}</p>
            </div>
            <div class="stat-card">
                <h4>Horas Totales</h4>
                <p>${totalHoras.toFixed(1)}h</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Usuario</th>
                    <th>Tipo</th>
                    <th>Parte de Trabajo</th>
                    <th>Observaciones</th>
                </tr>
            </thead>
            <tbody>
                ${fichajes
                  .map(
                    (fichaje) => `
                    <tr>
                        <td>${new Date(fichaje.fecha_hora).toLocaleDateString()}</td>
                        <td>${new Date(fichaje.fecha_hora).toLocaleTimeString()}</td>
                        <td>${fichaje.usuario?.nombre || "Usuario desconocido"}</td>
                        <td class="${fichaje.tipo}">${fichaje.tipo.toUpperCase()}</td>
                        <td>${fichaje.parte_trabajo?.numero_parte || "Presencia general"}</td>
                        <td>${fichaje.observaciones || "-"}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>

        <div class="footer">
            <p>Informe generado el ${new Date().toLocaleString()} por el Sistema de Gestión CMG Hidráulica</p>
        </div>
    </div>
</body>
</html>
    `
  }

  const calcularHorasTrabajadas = () => {
    let totalHoras = 0
    const fichajesPorUsuario = new Map()

    // Agrupar fichajes por usuario
    fichajes.forEach((fichaje) => {
      const usuarioId = fichaje.usuario_id
      if (!fichajesPorUsuario.has(usuarioId)) {
        fichajesPorUsuario.set(usuarioId, [])
      }
      fichajesPorUsuario.get(usuarioId).push(fichaje)
    })

    // Calcular horas para cada usuario
    fichajesPorUsuario.forEach((fichajesUsuario) => {
      fichajesUsuario.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())

      let entrada = null
      for (const fichaje of fichajesUsuario) {
        if (fichaje.tipo === "entrada") {
          entrada = new Date(fichaje.fecha_hora)
        } else if (fichaje.tipo === "salida" && entrada) {
          const salida = new Date(fichaje.fecha_hora)
          const horas = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60)
          totalHoras += horas
          entrada = null
        }
      }
    })

    return totalHoras
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="usuario" className="text-gray-700">
            Usuario
          </Label>
          <Select
            value={filtros.usuario_id}
            onValueChange={(value) => setFiltros((prev) => ({ ...prev, usuario_id: value }))}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Todos los usuarios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem> {/* Updated value prop to "all" */}
              {usuarios.map((usuario) => (
                <SelectItem key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="fecha_inicio" className="text-gray-700">
            Fecha Inicio
          </Label>
          <Input
            id="fecha_inicio"
            type="date"
            value={filtros.fecha_inicio}
            onChange={(e) => setFiltros((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
            className="border-gray-300"
          />
        </div>

        <div>
          <Label htmlFor="fecha_fin" className="text-gray-700">
            Fecha Fin
          </Label>
          <Input
            id="fecha_fin"
            type="date"
            value={filtros.fecha_fin}
            onChange={(e) => setFiltros((prev) => ({ ...prev, fecha_fin: e.target.value }))}
            className="border-gray-300"
          />
        </div>

        <div>
          <Label htmlFor="tipo_fichaje" className="text-gray-700">
            Tipo de Fichaje
          </Label>
          <Select
            value={filtros.tipo_fichaje}
            onValueChange={(value) => setFiltros((prev) => ({ ...prev, tipo_fichaje: value }))}
          >
            <SelectTrigger className="border-gray-300">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem> {/* Updated value prop to "all" */}
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="salida">Salida</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button onClick={cargarFichajes} disabled={loading} className="industrial-button">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Vista Previa
            </>
          )}
        </Button>

        {mostrarPreview && fichajes.length > 0 && (
          <Button
            onClick={generarPDF}
            disabled={generando}
            variant="outline"
            className="border-gray-400 bg-transparent"
          >
            {generando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Descargar HTML
              </>
            )}
          </Button>
        )}
      </div>

      {/* Preview de datos */}
      {mostrarPreview && (
        <Card className="industrial-card">
          <CardContent className="p-6">
            {fichajes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos</h3>
                <p className="text-gray-600">No se encontraron fichajes con los filtros aplicados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total Fichajes</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{fichajes.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Días Trabajados</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {new Set(fichajes.map((f) => f.fecha_hora.split("T")[0])).size}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Horas Totales</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900 mt-1">{calcularHorasTrabajadas().toFixed(1)}h</p>
                  </div>
                </div>

                {/* Tabla de fichajes */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-900">Fecha</th>
                        <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-900">Hora</th>
                        <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-900">Usuario</th>
                        <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-900">Tipo</th>
                        <th className="text-left p-3 border-b border-gray-200 font-medium text-gray-900">Parte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fichajes.slice(0, 10).map((fichaje, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-3 border-b border-gray-100">
                            {new Date(fichaje.fecha_hora).toLocaleDateString()}
                          </td>
                          <td className="p-3 border-b border-gray-100">
                            {new Date(fichaje.fecha_hora).toLocaleTimeString()}
                          </td>
                          <td className="p-3 border-b border-gray-100">
                            {fichaje.usuario?.nombre || "Usuario desconocido"}
                          </td>
                          <td className="p-3 border-b border-gray-100">
                            <Badge
                              className={`${
                                fichaje.tipo === "entrada"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              } border`}
                            >
                              {fichaje.tipo.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-3 border-b border-gray-100">
                            {fichaje.parte_trabajo?.numero_parte || "Presencia general"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {fichajes.length > 10 && (
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Mostrando 10 de {fichajes.length} fichajes. El informe completo incluirá todos los registros.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
