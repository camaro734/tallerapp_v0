"use client"

import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Download, FileSpreadsheet, TrendingUp, Users } from "lucide-react"
import { useState } from "react"
import { GeneradorPDFFichajes } from "@/components/generador-pdf-fichajes"
import { fichajes, partesTrabajo, materiales, usuarios } from "@/lib/database"

export default function InformesPage() {
  const { user, isLoading } = useAuth()
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("semana")
  const [fechaInicio, setFechaInicio] = useState<Date>(subDays(new Date(), 7))
  const [fechaFin, setFechaFin] = useState<Date>(new Date())

  // Función para actualizar el período
  const actualizarPeriodo = (periodo: string) => {
    const hoy = new Date()
    setPeriodoSeleccionado(periodo)

    switch (periodo) {
      case "hoy":
        setFechaInicio(hoy)
        setFechaFin(hoy)
        break
      case "semana":
        setFechaInicio(startOfWeek(hoy, { weekStartsOn: 1 }))
        setFechaFin(endOfWeek(hoy, { weekStartsOn: 1 }))
        break
      case "mes":
        setFechaInicio(startOfMonth(hoy))
        setFechaFin(endOfMonth(hoy))
        break
      case "personalizado":
        // No cambiamos las fechas, el usuario las seleccionará
        break
    }
  }

  // Filtrar fichajes por fecha
  const fichajesFiltrados = fichajes.filter((fichaje) => {
    const fechaFichaje = new Date(fichaje.fecha_hora)
    return fechaFichaje >= fechaInicio && fechaFichaje <= fechaFin
  })

  // Filtrar partes por fecha
  const partesFiltrados = partesTrabajo.filter((parte) => {
    const fechaParte = new Date(parte.fecha_creacion)
    return fechaParte >= fechaInicio && fechaParte <= fechaFin
  })

  // Calcular estadísticas
  const estadisticas = {
    totalFichajes: fichajesFiltrados.length,
    totalPartes: partesFiltrados.length,
    partesCompletados: partesFiltrados.filter((parte) => parte.estado === "completado").length,
    partesPendientes: partesFiltrados.filter((parte) => parte.estado === "pendiente").length,
    partesEnProgreso: partesFiltrados.filter((parte) => parte.estado === "en_progreso" || parte.estado === "en_curso")
      .length,
    horasTotales: fichajesFiltrados.reduce((total, fichaje) => {
      // Simplificado para el ejemplo
      return total + 1 // Asumimos 1 hora por fichaje para simplificar
    }, 0),
  }

  // Calcular productividad por técnico
  const productividadTecnicos = usuarios
    .filter((usuario) => usuario.rol === "tecnico")
    .map((tecnico) => {
      const fichajesTecnico = fichajesFiltrados.filter((fichaje) => fichaje.usuario_id === tecnico.id)
      const partesTecnico = partesFiltrados.filter(
        (parte) => parte.tecnico_id === tecnico.id || parte.tecnico_asignado === tecnico.nombre,
      )

      return {
        id: tecnico.id,
        nombre: `${tecnico.nombre} ${tecnico.apellidos}`,
        horasTrabajadas: fichajesTecnico.length, // Simplificado
        partesCompletados: partesTecnico.filter((parte) => parte.estado === "completado").length,
        eficiencia:
          partesTecnico.length > 0
            ? (partesTecnico.filter((parte) => parte.estado === "completado").length / partesTecnico.length) * 100
            : 0,
      }
    })
    .sort((a, b) => b.partesCompletados - a.partesCompletados)

  // Calcular uso de materiales
  const usoMateriales = materiales
    .map((material) => {
      // Simplificado: asumimos un uso aleatorio para el ejemplo
      const usoEstimado = Math.floor(Math.random() * 10)
      return {
        id: material.id,
        nombre: material.nombre,
        codigo: material.codigo,
        cantidad: usoEstimado,
        valorTotal: usoEstimado * material.precio_unitario,
      }
    })
    .sort((a, b) => b.valorTotal - a.valorTotal)
    .slice(0, 5) // Top 5 materiales

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || (user.rol !== "admin" && user.rol !== "jefe_taller")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p>No tiene permisos para acceder a esta sección.</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Informes y Estadísticas</h1>
            <p className="text-gray-600">Análisis de productividad, partes de trabajo y materiales</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <FileSpreadsheet className="h-4 w-4" />
              Exportar a Excel
            </Button>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Período</label>
            <Select defaultValue={periodoSeleccionado} onValueChange={actualizarPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mes</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {periodoSeleccionado === "personalizado" && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaInicio && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={fechaInicio} onSelect={setFechaInicio} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Fecha Fin</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !fechaFin && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaFin ? format(fechaFin, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={fechaFin} onSelect={setFechaFin} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
        </div>

        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="productividad">Productividad</TabsTrigger>
            <TabsTrigger value="materiales">Materiales</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Partes de Trabajo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estadisticas.totalPartes}</div>
                  <p className="text-xs text-muted-foreground">
                    {estadisticas.partesCompletados} completados, {estadisticas.partesPendientes} pendientes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Horas Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{estadisticas.horasTotales}h</div>
                  <p className="text-xs text-muted-foreground">
                    {(estadisticas.horasTotales / Math.max(1, estadisticas.totalPartes)).toFixed(1)}h promedio por parte
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {estadisticas.totalPartes > 0
                      ? ((estadisticas.partesCompletados / estadisticas.totalPartes) * 100).toFixed(1)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">{estadisticas.partesEnProgreso} partes en progreso</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Resumen de Actividad</CardTitle>
                <CardDescription>
                  Período: {format(fechaInicio, "dd/MM/yyyy")} - {format(fechaFin, "dd/MM/yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Partes de Trabajo por Estado</h3>
                    <div className="h-[200px] w-full bg-gray-50 rounded-md flex items-end justify-around p-4">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-16 bg-blue-500 rounded-t-md"
                          style={{
                            height: `${(estadisticas.partesPendientes / Math.max(1, estadisticas.totalPartes)) * 150}px`,
                          }}
                        ></div>
                        <span className="text-sm mt-2">Pendientes</span>
                        <span className="text-xs font-medium">{estadisticas.partesPendientes}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div
                          className="w-16 bg-amber-500 rounded-t-md"
                          style={{
                            height: `${(estadisticas.partesEnProgreso / Math.max(1, estadisticas.totalPartes)) * 150}px`,
                          }}
                        ></div>
                        <span className="text-sm mt-2">En Progreso</span>
                        <span className="text-xs font-medium">{estadisticas.partesEnProgreso}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div
                          className="w-16 bg-green-500 rounded-t-md"
                          style={{
                            height: `${(estadisticas.partesCompletados / Math.max(1, estadisticas.totalPartes)) * 150}px`,
                          }}
                        ></div>
                        <span className="text-sm mt-2">Completados</span>
                        <span className="text-xs font-medium">{estadisticas.partesCompletados}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Distribución de Horas</h3>
                    <div className="h-[200px] w-full bg-gray-50 rounded-md p-4 flex items-center justify-center">
                      <p className="text-gray-500">Gráfico de distribución de horas por día</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Partes de Trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">Nº Parte</th>
                        <th className="text-left py-3 px-2">Cliente</th>
                        <th className="text-left py-3 px-2">Técnico</th>
                        <th className="text-left py-3 px-2">Fecha</th>
                        <th className="text-left py-3 px-2">Estado</th>
                        <th className="text-left py-3 px-2">Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partesFiltrados.slice(0, 5).map((parte) => (
                        <tr key={parte.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">{parte.numero_parte}</td>
                          <td className="py-3 px-2">{parte.cliente_nombre}</td>
                          <td className="py-3 px-2">{parte.tecnico_asignado || "No asignado"}</td>
                          <td className="py-3 px-2">{format(new Date(parte.fecha_creacion), "dd/MM/yyyy")}</td>
                          <td className="py-3 px-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                parte.estado === "completado"
                                  ? "bg-green-100 text-green-800"
                                  : parte.estado === "pendiente"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {parte.estado === "completado"
                                ? "Completado"
                                : parte.estado === "pendiente"
                                  ? "Pendiente"
                                  : "En Progreso"}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {parte.tiempo_total ? (parte.tiempo_total / 60).toFixed(1) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="productividad">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Productividad por Técnico</CardTitle>
                  <CardDescription>Partes completados y horas trabajadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {productividadTecnicos.map((tecnico) => (
                      <div key={tecnico.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{tecnico.nombre}</span>
                          <span className="text-sm text-gray-500">
                            {tecnico.partesCompletados} partes | {tecnico.horasTrabajadas}h
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${Math.min(100, tecnico.eficiencia)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Eficiencia: {tecnico.eficiencia.toFixed(1)}%</span>
                          <span>
                            {(tecnico.partesCompletados / Math.max(1, tecnico.horasTrabajadas)).toFixed(2)} partes/hora
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tiempo Promedio por Tipo de Trabajo</CardTitle>
                  <CardDescription>Análisis de eficiencia por categoría</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {["Mantenimiento", "Reparación", "Instalación"].map((tipo) => {
                      // Filtrar partes por tipo
                      const partesTipo = partesFiltrados.filter(
                        (parte) => parte.tipo_trabajo?.toLowerCase() === tipo.toLowerCase(),
                      )
                      const tiempoPromedio = partesTipo.length
                        ? partesTipo.reduce((acc, parte) => acc + (parte.tiempo_total || 0), 0) / partesTipo.length / 60
                        : 0

                      return (
                        <div key={tipo} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{tipo}</span>
                            <span className="text-sm text-gray-500">
                              {partesTipo.length} partes | {tiempoPromedio.toFixed(1)}h promedio
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                tipo === "Mantenimiento"
                                  ? "bg-green-500"
                                  : tipo === "Reparación"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`}
                              style={{
                                width: `${Math.min(100, (partesTipo.length / Math.max(1, partesFiltrados.length)) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Distribución de Trabajo</h3>
                    <div className="h-[200px] w-full bg-gray-50 rounded-md p-4 flex items-center justify-center">
                      <p className="text-gray-500">Gráfico de distribución de tipos de trabajo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Evolución de Productividad</CardTitle>
                  <CardDescription>Tendencia de partes completados y tiempo invertido</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full bg-gray-50 rounded-md p-4 flex items-center justify-center">
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-12 w-12 text-gray-300" />
                      <p className="text-gray-500">Gráfico de evolución de productividad en el tiempo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="materiales">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Materiales Utilizados</CardTitle>
                  <CardDescription>Por cantidad y valor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {usoMateriales.map((material) => (
                      <div key={material.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {material.codigo} - {material.nombre}
                          </span>
                          <span className="text-sm text-gray-500">
                            {material.cantidad} unidades | {material.valorTotal.toFixed(2)}€
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div
                            className="bg-amber-500 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (material.valorTotal / Math.max(1, usoMateriales[0].valorTotal)) * 100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estado de Inventario</CardTitle>
                  <CardDescription>Materiales con stock bajo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {materiales
                      .filter((material) => material.stock_actual <= material.stock_minimo * 1.5)
                      .sort((a, b) => a.stock_actual / a.stock_minimo - b.stock_actual / b.stock_minimo)
                      .slice(0, 5)
                      .map((material) => (
                        <div key={material.id} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{material.nombre}</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                material.stock_actual < material.stock_minimo
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {material.stock_actual < material.stock_minimo ? "Stock crítico" : "Stock bajo"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>
                              {material.stock_actual} / {material.stock_minimo} mínimo
                            </span>
                            <span>{material.ubicacion}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div
                              className={`h-1.5 rounded-full ${
                                material.stock_actual < material.stock_minimo ? "bg-red-500" : "bg-amber-500"
                              }`}
                              style={{
                                width: `${Math.min(100, (material.stock_actual / material.stock_minimo) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Consumo de Materiales por Categoría</CardTitle>
                  <CardDescription>Distribución de uso y costes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full bg-gray-50 rounded-md p-4 flex items-center justify-center">
                    <p className="text-gray-500">Gráfico de consumo de materiales por categoría</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="personal">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Registro de Fichajes</CardTitle>
                  <CardDescription>Horas registradas por técnico</CardDescription>
                </CardHeader>
                <CardContent>
                  <GeneradorPDFFichajes
                    fechaInicio={fechaInicio}
                    fechaFin={fechaFin}
                    usuarioId={null}
                    showControls={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ausencias y Vacaciones</CardTitle>
                  <CardDescription>Días solicitados y aprobados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usuarios
                      .filter((u) => u.rol === "tecnico")
                      .map((tecnico) => {
                        // Simplificado para el ejemplo
                        const diasVacaciones = Math.floor(Math.random() * 10)
                        const diasTotales = 22

                        return (
                          <div key={tecnico.id} className="p-3 bg-gray-50 rounded-md">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">
                                {tecnico.nombre} {tecnico.apellidos}
                              </span>
                              <span className="text-sm text-gray-600">
                                {diasVacaciones} / {diasTotales} días
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div
                                className="h-1.5 rounded-full bg-blue-500"
                                style={{ width: `${(diasVacaciones / diasTotales) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Calendario de Ausencias</h3>
                    <div className="h-[200px] w-full bg-gray-50 rounded-md p-4 flex items-center justify-center">
                      <p className="text-gray-500">Calendario de ausencias programadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Distribución de Carga de Trabajo</CardTitle>
                  <CardDescription>Asignación de partes por técnico</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {usuarios
                      .filter((u) => u.rol === "tecnico")
                      .map((tecnico) => {
                        const partesTecnico = partesFiltrados.filter(
                          (parte) => parte.tecnico_id === tecnico.id || parte.tecnico_asignado === tecnico.nombre,
                        )
                        const porcentaje = (partesTecnico.length / Math.max(1, partesFiltrados.length)) * 100

                        return (
                          <div key={tecnico.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {tecnico.nombre} {tecnico.apellidos}
                              </span>
                              <span className="text-sm text-gray-500">
                                {partesTecnico.length} partes ({porcentaje.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div
                                className="bg-purple-500 h-2.5 rounded-full"
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{partesTecnico.filter((p) => p.estado === "completado").length} completados</span>
                              <span>{partesTecnico.filter((p) => p.estado === "pendiente").length} pendientes</span>
                              <span>
                                {
                                  partesTecnico.filter((p) => p.estado === "en_progreso" || p.estado === "en_curso")
                                    .length
                                }{" "}
                                en progreso
                              </span>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Comparativa de Rendimiento</h3>
                    <div className="h-[200px] w-full bg-gray-50 rounded-md p-4 flex items-center justify-center">
                      <div className="flex items-center gap-4">
                        <Users className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">Gráfico comparativo de rendimiento del personal</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
