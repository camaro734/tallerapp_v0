"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { MainLayout } from "@/components/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Clock, User, Calendar, Play, Square, AlertCircle, CheckCircle } from "lucide-react"
import { usuarios as usuariosDB, fichajes as fichajesDB } from "@/lib/db"
import type { Usuario, Fichaje } from "@/lib/db"
import { DatabaseStatus } from "@/components/database-status"

export default function FichajesPage() {
  const { user, isLoading } = useAuth()
  const [fichajes, setFichajes] = useState<Fichaje[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [fichajesHoy, setFichajesHoy] = useState<Fichaje[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesandoFichaje, setProcesandoFichaje] = useState(false)
  const [estadoPresencia, setEstadoPresencia] = useState<"entrada" | "salida" | null>(null)

  useEffect(() => {
    if (user) {
      cargarDatos()
    }
  }, [user])

  const cargarDatos = async () => {
    try {
      setCargando(true)

      // Cargar usuarios y fichajes
      setUsuarios(usuariosDB)
      setFichajes(fichajesDB)

      // Filtrar fichajes de hoy
      const hoy = new Date().toISOString().split("T")[0]
      const fichajesDeHoy = fichajesDB.filter((fichaje) => fichaje.fecha_hora.startsWith(hoy))
      setFichajesHoy(fichajesDeHoy)

      // Determinar estado de presencia del usuario actual
      if (user) {
        const fichajesUsuario = fichajesDB
          .filter((f) => f.usuario_id === user.id && f.tipo === "presencia")
          .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

        if (fichajesUsuario.length > 0) {
          setEstadoPresencia(fichajesUsuario[0].tipo_fichaje)
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de fichajes",
        variant: "destructive",
      })
    } finally {
      setCargando(false)
    }
  }

  const handleFichajePresencia = async (tipo: "entrada" | "salida") => {
    if (!user) return

    setProcesandoFichaje(true)

    try {
      const nuevoFichaje: Omit<Fichaje, "id" | "created_at"> = {
        usuario_id: user.id,
        parte_trabajo_id: null,
        tipo: "presencia",
        tipo_fichaje: tipo,
        fecha_hora: new Date().toISOString(),
        observaciones: `Fichaje de ${tipo} de presencia`,
      }

      // Simular creación en la base de datos mock
      const fichajeConId = {
        ...nuevoFichaje,
        id: `f${Date.now()}`,
        created_at: new Date().toISOString(),
      }

      fichajesDB.push(fichajeConId)
      setFichajes([...fichajesDB])
      setEstadoPresencia(tipo)

      // Actualizar fichajes de hoy
      const hoy = new Date().toISOString().split("T")[0]
      const fichajesDeHoy = fichajesDB.filter((fichaje) => fichaje.fecha_hora.startsWith(hoy))
      setFichajesHoy(fichajesDeHoy)

      toast({
        title: "Fichaje registrado",
        description: `Has fichado ${tipo === "entrada" ? "la entrada" : "la salida"} correctamente`,
      })
    } catch (error) {
      console.error("Error en fichaje:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el fichaje",
        variant: "destructive",
      })
    } finally {
      setProcesandoFichaje(false)
    }
  }

  const calcularHorasTrabajadas = (usuarioId: string, fecha: string): number => {
    const fichajesUsuario = fichajes
      .filter((f) => f.usuario_id === usuarioId && f.tipo === "presencia" && f.fecha_hora.startsWith(fecha))
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())

    let horasTotales = 0
    for (let i = 0; i < fichajesUsuario.length; i += 2) {
      const entrada = fichajesUsuario[i]
      const salida = fichajesUsuario[i + 1]

      if (entrada && entrada.tipo_fichaje === "entrada" && salida && salida.tipo_fichaje === "salida") {
        const tiempoEntrada = new Date(entrada.fecha_hora).getTime()
        const tiempoSalida = new Date(salida.fecha_hora).getTime()
        horasTotales += (tiempoSalida - tiempoEntrada) / (1000 * 60 * 60) // Convertir a horas
      }
    }

    return horasTotales
  }

  const getEstadoUsuario = (usuarioId: string): "presente" | "ausente" => {
    const fichajesUsuario = fichajes
      .filter((f) => f.usuario_id === usuarioId && f.tipo === "presencia")
      .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

    if (fichajesUsuario.length === 0) return "ausente"
    return fichajesUsuario[0].tipo_fichaje === "entrada" ? "presente" : "ausente"
  }

  const formatearHora = (fechaHora: string): string => {
    return new Date(fechaHora).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatearFecha = (fechaHora: string): string => {
    return new Date(fechaHora).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
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

  return (
    <MainLayout>
      <DatabaseStatus />
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Control de Fichajes</h1>
          <p className="text-gray-600">Gestión de presencia y control horario</p>
        </div>

        {/* Panel de fichaje personal */}
        <Card className="industrial-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mi Fichaje de Presencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{user.nombre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span>{new Date().toLocaleDateString("es-ES")}</span>
                </div>
                <Badge
                  variant={estadoPresencia === "entrada" ? "default" : "secondary"}
                  className={estadoPresencia === "entrada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {estadoPresencia === "entrada" ? "Presente" : "Ausente"}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleFichajePresencia("entrada")}
                  disabled={procesandoFichaje || estadoPresencia === "entrada"}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {procesandoFichaje ? (
                    "Procesando..."
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Fichar Entrada
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleFichajePresencia("salida")}
                  disabled={procesandoFichaje || estadoPresencia !== "entrada"}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  {procesandoFichaje ? (
                    "Procesando..."
                  ) : (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Fichar Salida
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="hoy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hoy">Fichajes de Hoy</TabsTrigger>
            <TabsTrigger value="personal">Estado Personal</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="hoy">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Fichajes de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                {cargando ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Acción</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fichajesHoy.map((fichaje) => {
                          const usuario = usuarios.find((u) => u.id === fichaje.usuario_id)
                          return (
                            <TableRow key={fichaje.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{usuario?.nombre || "Usuario desconocido"}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {fichaje.tipo}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {fichaje.tipo_fichaje === "entrada" ? (
                                    <Play className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-red-600" />
                                  )}
                                  <span className="capitalize">{fichaje.tipo_fichaje}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{formatearHora(fichaje.fecha_hora)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    getEstadoUsuario(fichaje.usuario_id) === "presente" ? "default" : "secondary"
                                  }
                                  className={
                                    getEstadoUsuario(fichaje.usuario_id) === "presente"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }
                                >
                                  {getEstadoUsuario(fichaje.usuario_id) === "presente" ? "Presente" : "Ausente"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>

                    {fichajesHoy.length === 0 && (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No hay fichajes registrados hoy</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Estado del Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado Actual</TableHead>
                        <TableHead>Horas Hoy</TableHead>
                        <TableHead>Último Fichaje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => {
                        const estado = getEstadoUsuario(usuario.id)
                        const horasHoy = calcularHorasTrabajadas(usuario.id, new Date().toISOString().split("T")[0])
                        const ultimoFichaje = fichajes
                          .filter((f) => f.usuario_id === usuario.id)
                          .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())[0]

                        return (
                          <TableRow key={usuario.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium">{usuario.nombre}</div>
                                  <div className="text-sm text-gray-500">{usuario.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {usuario.rol.replace("_", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {estado === "presente" ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                                <Badge
                                  variant={estado === "presente" ? "default" : "secondary"}
                                  className={
                                    estado === "presente" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }
                                >
                                  {estado === "presente" ? "Presente" : "Ausente"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>{horasHoy.toFixed(1)}h</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {ultimoFichaje ? (
                                <div className="text-sm">
                                  <div>{formatearHora(ultimoFichaje.fecha_hora)}</div>
                                  <div className="text-gray-500">{formatearFecha(ultimoFichaje.fecha_hora)}</div>
                                </div>
                              ) : (
                                <span className="text-gray-500">Sin fichajes</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historial">
            <Card className="industrial-card">
              <CardHeader>
                <CardTitle>Historial de Fichajes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Fecha y Hora</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fichajes
                        .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())
                        .slice(0, 50)
                        .map((fichaje) => {
                          const usuario = usuarios.find((u) => u.id === fichaje.usuario_id)
                          return (
                            <TableRow key={fichaje.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium">{usuario?.nombre || "Usuario desconocido"}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {fichaje.tipo}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {fichaje.tipo_fichaje === "entrada" ? (
                                    <Play className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-red-600" />
                                  )}
                                  <span className="capitalize">{fichaje.tipo_fichaje}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{formatearFecha(fichaje.fecha_hora)}</div>
                                  <div className="text-gray-500">{formatearHora(fichaje.fecha_hora)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-600">
                                  {fichaje.observaciones || "Sin observaciones"}
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>

                  {fichajes.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay fichajes en el historial</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
